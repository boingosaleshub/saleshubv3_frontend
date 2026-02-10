/**
 * ============================================================
 *  QTY FORMULA CONFIGURATION
 * ============================================================
 * 
 * This file contains ALL formulas used to calculate the "Qty"
 * column values in the generated ROM pricing Excel sheets.
 * 
 * HOW IT WORKS:
 * -------------
 * 1. Each item name from the API response is matched against
 *    the keys defined below (case-insensitive, trimmed).
 * 2. If a match is found AND the item's current DB qty is
 *    null / undefined / 0, the formula is executed to
 *    calculate the qty value.
 * 3. Items that already have a non-null, non-zero qty from
 *    the database are LEFT UNTOUCHED.
 * 4. Items with no matching formula here are also left as-is.
 * 
 * HOW TO EDIT:
 * ------------
 * - To change a formula: edit the `formula` function for that item.
 * - To add a new formula: add a new entry with the exact item
 *   name as it appears in the API / database.
 * - To remove a formula: delete or comment out the entry.
 * - If a formula depends on another item's qty, list that item
 *   name in the `dependencies` array so it gets calculated first.
 * 
 * FORMULA CONTEXT (ctx):
 * ----------------------
 * Each formula function receives a `ctx` object with:
 *   - ctx.totalArea       : Total area in sq ft (from grossSqFt form field)
 *   - ctx.consideredArea   : Considered area (totalArea * areaPercentage / 100)
 *   - ctx.currentQty       : The item's current qty from database (0 if null)
 *   - ctx.getItemQty(name) : Get another item's qty (DB value or already-calculated)
 * 
 * ============================================================
 */


// ---------------------------------------------------------
// UTILITY: Round up to the nearest multiple
// e.g. roundUpToNearest(1250, 500) => 1500
// ---------------------------------------------------------
export function roundUpToNearest(value, nearest) {
    if (!nearest || nearest <= 0) return value;
    return Math.ceil(value / nearest) * nearest;
}


// =============================================================
//  FORMULA DEFINITIONS
//  Structure:  VENDOR  →  SYSTEM TYPE  →  { itemName: config }
// =============================================================

export const QTY_FORMULAS = {

    // =========================================================
    //  ADRF VENDOR
    // =========================================================
    ADRF: {

        // -----------------------------------------------------
        //  ADRF  →  ERCES
        // -----------------------------------------------------
        ERCES: {

            '700/800 MHz 0.5W BDA': {
                formula: (ctx) => {
                    // If current qty is 0 AND area < 200,000 → 1, else 0
                    if (ctx.currentQty === 0 && ctx.totalArea < 200000) return 1;
                    return 0;
                },
                dependencies: [],
            },

            '700/800 MHz 2W BDA': {
                formula: (ctx) => {
                    // If current qty is 0 AND area >= 200,000 AND area < 400,000 → 1, else 0
                    if (ctx.currentQty === 0 && ctx.totalArea >= 200000 && ctx.totalArea < 400000) return 1;
                    return 0;
                },
                dependencies: [],
            },

            'Indoor Wide Band Omni Antenna': {
                formula: (ctx) => {
                    // Qty = Total Area
                    return ctx.totalArea;
                },
                dependencies: [],
            },

            // NOTE: The key below must match the EXACT item name from the database.
            //       If qty still shows empty, check the browser console for
            //       "[QtyCalc] Formula ... has no matching item" and update
            //       the key to match the actual API response name.
            '1/2" Low Loss Air Dialectric Plenum-Rated Cable (per ft)': {
                formula: (ctx) => {
                    // Qty = round_up( totalArea × 100, to nearest 500 )
                    return roundUpToNearest(ctx.totalArea * 100, 500);
                },
                dependencies: [],
            },

            'Preterminated Single Mode Fiber': {
                formula: (ctx) => {
                    // Qty = round_up( qty_of_Fiber_Remote_Unit × 650, to nearest 500 )
                    const fiberRemoteUnitQty = ctx.getItemQty('Fiber DAS 700/800MHz Remote Unit');
                    return roundUpToNearest(fiberRemoteUnitQty * 650, 500);
                },
                // This formula depends on "Fiber DAS 700/800MHz Remote Unit" being resolved first
                dependencies: ['Fiber DAS 700/800MHz Remote Unit'],
            },

            '3ft 0.141 Jumper Cable, PIM Rated, Plenum Rated, N-M to N-M': {
                formula: (ctx) => {
                    // Qty = Total Area × 2
                    return ctx.totalArea * 2;
                },
                dependencies: [],
            },

            'Installation Labor': {
                formula: (ctx) => {
                    // Qty = Total Area
                    return ctx.totalArea;
                },
                dependencies: [],
            },
        },

        // -----------------------------------------------------
        //  ADRF  →  DAS  (add formulas here when needed)
        // -----------------------------------------------------
        DAS: {
            // Example:
            // 'Some DAS Item Name': {
            //     formula: (ctx) => { return ctx.totalArea; },
            //     dependencies: [],
            // },
        },
    },

    // =========================================================
    //  COMBA VENDOR  (add formulas here when needed)
    // =========================================================
    Comba: {

        ERCES: {
            // Add Comba ERCES formulas here
        },

        DAS: {
            // Add Comba DAS formulas here
        },
    },
};


// =============================================================
//  HELPER: Get all formula item names for a vendor + system type
// =============================================================
export function getFormulaNames(vendor, systemType) {
    const vendorFormulas = QTY_FORMULAS[vendor];
    if (!vendorFormulas) return [];

    const typeFormulas = vendorFormulas[systemType];
    if (!typeFormulas) return [];

    return Object.keys(typeFormulas);
}
