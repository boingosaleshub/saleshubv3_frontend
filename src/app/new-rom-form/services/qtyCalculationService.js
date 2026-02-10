/**
 * Qty Calculation Service
 * 
 * Takes vendor data (from API), looks up matching formulas from
 * qtyFormulaConfig.js, calculates qty values, and returns the
 * vendor data with calculated qty values injected.
 * 
 * RULES:
 * - Items with existing non-null, non-zero qty from DB → kept as-is
 * - Items with null/0 qty AND a matching formula → calculated
 * - Items with null/0 qty AND no formula → left empty
 */

import { QTY_FORMULAS } from './qtyFormulaConfig';

// ---------------------------------------------------------
// Build a flat map of all item names → qty values from the
// vendor data sections (the API response structure).
// ---------------------------------------------------------
function buildItemQtyMap(vendorData) {
    const map = new Map();

    for (const section of vendorData) {
        for (const item of section.items) {
            // Store every item's qty (null becomes 0 for formula use)
            map.set(item.name, item.qty ?? 0);
        }
    }

    return map;
}

// ---------------------------------------------------------
// Topological sort: orders formula items so that dependencies
// are calculated before the items that depend on them.
// ---------------------------------------------------------
function topologicalSort(formulas) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set(); // cycle detection

    function visit(itemName) {
        if (visited.has(itemName)) return;
        if (visiting.has(itemName)) {
            // Circular dependency detected — break the cycle
            console.warn(`[QtyCalc] Circular dependency detected for "${itemName}", skipping.`);
            return;
        }

        visiting.add(itemName);

        const config = formulas[itemName];
        if (config && config.dependencies) {
            for (const dep of config.dependencies) {
                // Only visit the dependency if it also has a formula
                if (formulas[dep]) {
                    visit(dep);
                }
            }
        }

        visiting.delete(itemName);
        visited.add(itemName);
        sorted.push(itemName);
    }

    for (const itemName of Object.keys(formulas)) {
        visit(itemName);
    }

    return sorted;
}

// ---------------------------------------------------------
// Normalize an item name for case-insensitive matching.
// Trims whitespace and lowercases.
// ---------------------------------------------------------
function normalize(name) {
    return (name || '').trim().toLowerCase();
}

// ---------------------------------------------------------
// Build a lookup from normalized formula name → original key
// so we can match API names case-insensitively.
// ---------------------------------------------------------
function buildFormulaLookup(formulas) {
    const lookup = new Map();
    for (const key of Object.keys(formulas)) {
        lookup.set(normalize(key), key);
    }
    return lookup;
}

// =============================================================
//  MAIN: Calculate qty values for vendor data
// =============================================================
/**
 * Calculates qty values for items that have matching formulas
 * and currently have null/0 qty.
 * 
 * @param {Array} vendorData - Array of sections from vendorDataService
 *   Each section: { name, displayName, items: [{ name, qty, assumptions }] }
 * @param {string} vendor - 'ADRF' or 'Comba'
 * @param {string} systemType - 'DAS' or 'ERCES'
 * @param {number} totalArea - Total area in sq ft (from grossSqFt)
 * @param {number} consideredArea - Considered area (totalArea * percentage / 100)
 * @returns {Array} - Same vendorData structure with qty values filled in where formulas matched
 */
export function calculateQtyValues(vendorData, vendor, systemType, totalArea, consideredArea) {
    // Get the formulas for this vendor + system type
    const formulas = QTY_FORMULAS[vendor]?.[systemType];

    if (!formulas || Object.keys(formulas).length === 0) {
        console.log(`[QtyCalc] No formulas defined for ${vendor} / ${systemType}, skipping calculation.`);
        return vendorData;
    }

    console.log(`[QtyCalc] Calculating qty values for ${vendor} / ${systemType}...`);
    console.log(`[QtyCalc] Total Area: ${totalArea}, Considered Area: ${consideredArea}`);
    console.log(`[QtyCalc] Formulas available for: ${Object.keys(formulas).join(', ')}`);

    // 1. Build a flat map of ALL item names → their current qty from DB
    const itemQtyMap = buildItemQtyMap(vendorData);

    // 2. Build a case-insensitive lookup for formula names
    const formulaLookup = buildFormulaLookup(formulas);

    // 3. Figure out which API items match a formula name
    //    We need to map: API item name → formula key
    const apiToFormulaKey = new Map();
    for (const section of vendorData) {
        for (const item of section.items) {
            const normalizedApiName = normalize(item.name);
            if (formulaLookup.has(normalizedApiName)) {
                apiToFormulaKey.set(item.name, formulaLookup.get(normalizedApiName));
            }
        }
    }

    console.log(`[QtyCalc] Matched ${apiToFormulaKey.size} items to formulas:`,
        [...apiToFormulaKey.entries()].map(([api, key]) => `"${api}" → "${key}"`).join(', '));

    // 4. Topological sort to handle dependencies
    const sortedFormulaKeys = topologicalSort(formulas);

    // 5. Evaluate formulas in dependency order
    //    We track calculated values in itemQtyMap so downstream formulas can reference them
    const calculatedItems = new Map(); // formulaKey → calculated value

    for (const formulaKey of sortedFormulaKeys) {
        const config = formulas[formulaKey];
        if (!config || !config.formula) continue;

        // Find the corresponding API item name for this formula key
        // (reverse lookup: formula key → API item name)
        let matchedApiName = null;
        for (const [apiName, fKey] of apiToFormulaKey.entries()) {
            if (fKey === formulaKey) {
                matchedApiName = apiName;
                break;
            }
        }

        if (!matchedApiName) {
            // This formula has no matching item in the API response — skip
            console.log(`[QtyCalc] Formula "${formulaKey}" has no matching item in API response, skipping.`);
            continue;
        }

        // Check if the item already has a non-null, non-zero qty from DB
        const currentQty = itemQtyMap.get(matchedApiName) ?? 0;
        if (currentQty !== null && currentQty !== undefined && currentQty !== 0) {
            console.log(`[QtyCalc] "${matchedApiName}" already has qty=${currentQty} from DB, keeping as-is.`);
            calculatedItems.set(formulaKey, currentQty);
            continue;
        }

        // Build the formula context
        const ctx = {
            totalArea,
            consideredArea,
            currentQty: currentQty || 0,
            getItemQty: (name) => {
                // First try exact match in the map
                if (itemQtyMap.has(name)) return itemQtyMap.get(name) ?? 0;
                // Then try case-insensitive match
                const normalizedTarget = normalize(name);
                for (const [key, val] of itemQtyMap.entries()) {
                    if (normalize(key) === normalizedTarget) return val ?? 0;
                }
                console.warn(`[QtyCalc] getItemQty("${name}") — item not found, returning 0`);
                return 0;
            },
        };

        // Execute the formula
        try {
            const calculatedQty = config.formula(ctx);
            console.log(`[QtyCalc] "${matchedApiName}" → calculated qty = ${calculatedQty}`);

            // Update the map so downstream formulas see this value
            itemQtyMap.set(matchedApiName, calculatedQty);
            calculatedItems.set(formulaKey, calculatedQty);
        } catch (err) {
            console.error(`[QtyCalc] Error calculating qty for "${matchedApiName}":`, err);
        }
    }

    // 6. Inject calculated values back into the vendorData structure
    if (calculatedItems.size === 0) {
        console.log('[QtyCalc] No qty values were calculated.');
        return vendorData;
    }

    const updatedVendorData = vendorData.map(section => ({
        ...section,
        items: section.items.map(item => {
            const formulaKey = apiToFormulaKey.get(item.name);
            if (!formulaKey) return item; // no formula for this item

            const currentQty = item.qty ?? 0;
            if (currentQty !== 0) return item; // already has a value from DB

            const newQty = itemQtyMap.get(item.name);
            if (newQty !== undefined && newQty !== null) {
                return { ...item, qty: newQty };
            }

            return item;
        }),
    }));

    console.log(`[QtyCalc] Done. Updated ${calculatedItems.size} items with calculated qty values.`);
    return updatedVendorData;
}
