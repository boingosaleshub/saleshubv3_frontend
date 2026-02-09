/**
 * Vendor Data Service
 * Fetches equipment/material data from vendor_adrf and vendor_comba Supabase tables
 * to populate ROM pricing Excel sheets dynamically.
 */

import { createClient } from '@/utils/supabase/client'

/**
 * Predefined section ordering for DAS system type
 * Sections will appear in this order in the Excel sheet
 */
const DAS_SECTION_ORDER = [
    'DAS HEAD-END',
    'REMOTE UNITS',
    "ADD'L EQUIPMENT",
    'OTH EQUIP',
    'EQUIPMENT',
    'SIGNAL SOURCE',
    'SERVICE & LABOR',
    'USD'
];

/**
 * Predefined section ordering for ERCES system type
 * Sections will appear in this order in the Excel sheet
 */
const ERCES_SECTION_ORDER = [
    'EQUIPMENT',
    'CABLING & MATERIALS',
    'ALL-IN',
    'SERVICE & LABOR',
    'USD'
];

/**
 * Section display name mapping for better rendering in rotated Excel cells
 * Some section names need line breaks to display nicely in the narrow vertical column
 */
const SECTION_DISPLAY_MAP = {
    'CABLING & MATERIALS': 'CABLING &\nMATERIALS',
    "ADD'L EQUIPMENT": "ADD'L\nEQUIPMENT",
};

/**
 * Gets display-friendly section name for Excel rendering
 * @param {string} sectionName - The raw section name from the database
 * @returns {string} - Display-formatted section name
 */
export function getSectionDisplayName(sectionName) {
    return SECTION_DISPLAY_MAP[sectionName] || sectionName;
}

/**
 * Fetches vendor data from the database, filtered by system type and grouped by section.
 * 
 * - For ADRF vendor → queries vendor_adrf table
 * - For Comba vendor → queries vendor_comba table
 * - Filters by type (DAS or ERCES)
 * - Groups items by section and orders sections according to predefined order
 * 
 * @param {string} vendor - 'Comba' or 'ADRF'
 * @param {string} type - 'DAS' or 'ERCES'
 * @returns {Promise<Array<{name: string, displayName: string, items: Array<{name: string, qty: number|null, assumptions: string|null}>}>>}
 */
export async function fetchVendorData(vendor, type) {
    const supabase = createClient();

    // Determine the table based on vendor
    const tableName = vendor === 'ADRF' ? 'vendor_adrf' : 'vendor_comba';

    console.log(`[VendorData] Fetching from ${tableName} where type = '${type}'...`);

    const { data, error } = await supabase
        .from(tableName)
        .select('section, name, qty, assumptions')
        .eq('type', type);

    if (error) {
        console.error(`[VendorData] Error fetching from ${tableName}:`, error);
        throw new Error(`Failed to fetch vendor data: ${error.message}`);
    }

    if (!data || data.length === 0) {
        console.warn(`[VendorData] No data found in ${tableName} for type '${type}'`);
        return [];
    }

    console.log(`[VendorData] Fetched ${data.length} items from ${tableName} for type '${type}'`);

    // Group items by section (normalize to uppercase for matching)
    const grouped = {};
    data.forEach(item => {
        const sectionKey = item.section.toUpperCase().trim();
        if (!grouped[sectionKey]) {
            grouped[sectionKey] = [];
        }
        grouped[sectionKey].push({
            name: item.name,
            qty: item.qty,
            assumptions: item.assumptions
        });
    });

    // Order sections according to predefined order for the system type
    const sectionOrder = type === 'DAS' ? DAS_SECTION_ORDER : ERCES_SECTION_ORDER;
    const result = [];
    const added = new Set();

    // First pass: add sections in the predefined order
    for (const sectionName of sectionOrder) {
        const upperName = sectionName.toUpperCase();
        if (grouped[upperName]) {
            result.push({
                name: upperName,
                displayName: getSectionDisplayName(upperName),
                items: grouped[upperName]
            });
            added.add(upperName);
        }
    }

    // Second pass: add any remaining sections not in the predefined order
    for (const [sectionName, items] of Object.entries(grouped)) {
        if (!added.has(sectionName)) {
            result.push({
                name: sectionName,
                displayName: getSectionDisplayName(sectionName),
                items
            });
        }
    }

    console.log(`[VendorData] Organized into ${result.length} sections:`, 
        result.map(s => `${s.name} (${s.items.length} items)`).join(', '));

    return result;
}
