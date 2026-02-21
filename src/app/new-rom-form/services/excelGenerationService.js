/**
 * Excel Generation Service
 * Generates pricing Excel sheets for ROM automation
 * Uses ExcelJS for professional Excel file generation with styling
 * 
 * For DAS ADRF: loads the actual template file and only modifies dynamic values
 * (Total Area, Considered Area, %, and Qty values). This guarantees the generated
 * file is an exact cell-by-cell mirror of the template. Keeps SIZE + CELLULAR DAS tabs.
 * 
 * For ERCES ADRF: loads the same ADRF template and only modifies dynamic values.
 * Keeps SIZE + ERCES tabs, removes CELLULAR DAS tab.
 * 
 * For other vendors/system types: builds workbook from scratch dynamically.
 */

import ExcelJS from 'exceljs';
import { fetchVendorData } from './vendorDataService';
import { calculateQtyValues } from './qtyCalculationService';
import { calculateHpRuQty, calculateAntennaQty } from './qtyFormulaConfig';

// ========================================================
//  COLOR PALETTE (for non-template generation)
// ========================================================
const COLORS = {
    headerBackground: '3D434A',
    headerText: 'FFFFFF',
    greenBackground: '92D050',
    yellowBackground: 'FFFF00',
    orangeBackground: 'FFC000',
    borderColor: 'B4B4B4',
    categoryBackground: 'C00000',
    categoryText: 'FFFFFF',
};

// ========================================================
//  SHARED FORMULA FLATTENER
//  ExcelJS cannot re-serialize shared formulas from .xlsm
//  templates. This helper converts every shared/array
//  formula into a plain individual formula or static value
//  so writeBuffer() succeeds without errors.
// ========================================================
function flattenSharedFormulas(workbook) {
    workbook.eachSheet((worksheet) => {
        worksheet.eachRow({ includeEmpty: false }, (row) => {
            row.eachCell({ includeEmpty: false }, (cell) => {
                const v = cell.value;
                if (v && typeof v === 'object') {
                    // Shared formula clone (has sharedFormula but no formula text)
                    if ('sharedFormula' in v) {
                        if (v.formula) {
                            // Master cell — keep formula as individual
                            cell.value = { formula: v.formula, result: v.result };
                        } else if (v.result !== undefined && v.result !== null) {
                            // Clone cell — use the cached result as static value
                            cell.value = v.result;
                        } else {
                            cell.value = null;
                        }
                        return;
                    }
                    // Regular formula — strip any stale sharedFormula key just in case
                    if (v.formula && v.sharedFormula === undefined) {
                        cell.value = { formula: v.formula, result: v.result };
                    }
                }
            });
        });
    });
}

// ========================================================
//  DAS ADRF TEMPLATE CONFIGURATION
//  Maps each template item name to its exact row number
//  in the CELLULAR DAS tab of the template file.
//  Default values are used when no calculated qty is available.
// ========================================================
const DAS_ADRF_TEMPLATE_PATH = '/Project Name - Pricing v.2.2 - ADRF - Price Updated (4).xlsm';

const DAS_ADRF_ITEM_ROWS = [
    // DAS HEAD-END (rows 6-12)
    { row: 6, name: 'ADX V Chassis w/ NMS (Network Management System)', defaultQty: 0 },
    { row: 7, name: 'ADX V DAS Optical Donor Unit Module', defaultQty: 0 },
    { row: 8, name: 'POI Module Standard frequencies (700MHz/800Mhz/PCS/AWS)', defaultQty: 0 },
    { row: 9, name: 'POI Module BRS (2.5 GHz)', defaultQty: 0 },
    { row: 10, name: 'POI Module C-Band (3.7 GHz)', defaultQty: 0 },
    { row: 11, name: 'Head End Channel Combiner Module for Downlink', defaultQty: 0 },
    { row: 12, name: 'Head End Channel Combiner Module for Uplink', defaultQty: 0 },

    // REMOTE UNITS (rows 14-29)
    { row: 14, name: 'High-Power Remote Chassis', defaultQty: 0 },
    { row: 15, name: 'High Power Remote Rack', defaultQty: 0 },
    { row: 16, name: 'High-Power Remote Amplifiers (700MHz/800Mhz/PCS/AWS)', defaultQty: 0 },
    { row: 17, name: 'High-Power Remote Amplifiers (2.5GHz)', defaultQty: 0 },
    { row: 18, name: 'High-Power Remote Amplifiers (C-Band)', defaultQty: 0 },
    { row: 19, name: 'High-Power Remote Universal Channel Combiner', defaultQty: 0 },
    { row: 20, name: 'High-Power Remote Optical Module', defaultQty: 0 },
    { row: 21, name: 'ADX V DAS High Power Remote AC Power Supply Unit Module', defaultQty: 0 },
    { row: 22, name: 'ADX V DAS High Power Remote AC Power Supply Unit Module (50v)', defaultQty: 0 },
    { row: 23, name: 'Mid-Power Remote Chassis', defaultQty: 0 },
    { row: 24, name: 'Mid-Power Remote Amplifiers (700MHz/800Mhz/PCS/AWS)', defaultQty: 0 },
    { row: 25, name: 'Mid-Power Remote Amplifiers (2.5GHz)', defaultQty: 0 },
    { row: 26, name: 'Mid-Power Remote Amplifiers (C-Band)', defaultQty: 0 },
    { row: 27, name: 'Mid-Power Remote Universal Channel Combiner', defaultQty: 0 },
    { row: 28, name: 'Mid-Power Remote Optical Module', defaultQty: 0 },

    // OTH EQUIP (rows 31-36)
    { row: 31, name: 'Indoor Cabling & Materials', defaultQty: 0 },
    { row: 32, name: 'Outdoor Cabling & Materials', defaultQty: 0 },
    { row: 33, name: 'Outdoor Poles', defaultQty: 0 },
    { row: 34, name: 'Donor Antenna', defaultQty: '-' },
    { row: 35, name: 'GPS ( Standard)', defaultQty: '-' },
    { row: 36, name: 'Headend Miscellaneous', defaultQty: '-' },

    // SIGNAL SOURCE (rows 38-46)
    { row: 38, name: 'Verizon Extender', defaultQty: 0 },
    { row: 39, name: 'AT&T MetroCell', defaultQty: 0 },
    { row: 40, name: 'OneCell - CAPEX', defaultQty: '-' },
    { row: 41, name: 'OneCell - OPEX', defaultQty: 0 },
    { row: 42, name: 'OneCell - Extra Sector CAPEX', defaultQty: null },
    { row: 43, name: 'AT&T Base Station', defaultQty: null },
    { row: 44, name: 'Verizon BAse Station', defaultQty: null },
    { row: 45, name: 'T-Mobile Base Station', defaultQty: null },
    { row: 46, name: 'ADRF SDA Reapeter (mBDA)', defaultQty: '-' },

    // SERVICE & LABOR (rows 48-53)
    { row: 48, name: 'Site Survey, Design & Mgmt.', defaultQty: 0 },
    { row: 49, name: 'Installation Labor', defaultQty: null },
    { row: 50, name: 'Sales Commission', defaultQty: null },
    { row: 51, name: 'GPO Fee', defaultQty: null },
    { row: 52, name: 'Monitoring & Maintenance', defaultQty: null },
    { row: 53, name: 'Insurance', defaultQty: null },
];

// ========================================================
//  ERCES ADRF TEMPLATE CONFIGURATION
//  Maps each template item name to its exact row number
//  in the ERCES tab of the template file.
//  Items with aliases handle name mismatches between
//  the template and the database/formula engine.
//  Template formulas in column I are preserved unless
//  a calculated qty value is available from vendor data.
// ========================================================

const ERCES_ADRF_ITEM_ROWS = [
    // EQUIPMENT (rows 6-18)
    { row: 6, name: '700/800 MHz 0.5W BDA' },
    { row: 7, name: '700/800 MHz 2W BDA' },
    { row: 8, name: '700/800 MHz 5W BDA' },
    { row: 9, name: '700/800 MHz Fiber-optic Digital Repeater' },
    { row: 10, name: '700/800 MHz 2W Fiber Remote Unit', aliases: ['Fiber DAS 700/800MHz Remote Unit'] },
    { row: 11, name: 'VHF/UHF 5W BDA' },
    { row: 12, name: '700/800MHz Filter' },
    { row: 13, name: '125Ah 24V Lithium BBU' },
    { row: 14, name: '45Ah 24V SLA BBU' },
    { row: 15, name: 'Anunciator Panel + Cable' },
    { row: 16, name: 'Indoor Wide Band Omni Antenna' },
    { row: 17, name: 'Outdoor Directional Yagi Antenna' },
    { row: 18, name: 'Type N F/F Bulkhead Coaxial RF Surge Protector' },

    // CABLING & MATERIALS (rows 20-25)
    { row: 20, name: '1/2" Low Loss Air Dialectrict Plenum-Rated Cable (per ft)', aliases: ['1/2" Low Loss Air Dialectric Plenum-Rated Cable (per ft)'] },
    { row: 21, name: 'N-Male Connector LCF12-50' },
    { row: 22, name: 'Preterminated Single Mode Fiber' },
    { row: 23, name: 'Various XXdB Directional Couplers' },
    { row: 24, name: '3ft 0.141 Jumper Cable, PIM Rated, Plenum Rated, N-M to N-M' },
    { row: 25, name: 'Other Capex' },

    // ALL-IN (rows 27-31)
    { row: 27, name: 'NEMA-3R' },
    { row: 28, name: 'NEMA-4' },
    { row: 29, name: 'NEMA-1' },
    { row: 30, name: '12x12 Access Hatch' },
    { row: 31, name: 'Electrical labor' },

    // SERVICE & LABOR (rows 33-39)
    { row: 33, name: 'Site Survey, Design & Mgmt.' },
    { row: 34, name: 'Installation Labor' },
    { row: 35, name: 'Permit' },
    { row: 36, name: 'Sales Commission' },
    { row: 37, name: 'GPO Fee' },
    { row: 38, name: '24x7 Monitoring & Maintenance' },
    { row: 39, name: 'Annual Inspection' },
];

// ========================================================
//  ADRF: Build a case-insensitive qty lookup from
//  the calculated vendor data (API + formulas)
// ========================================================
function buildAdrfQtyMap(vendorData) {
    const map = new Map();
    if (!vendorData) return map;

    for (const section of vendorData) {
        for (const item of section.items) {
            if (item.qty !== null && item.qty !== undefined) {
                map.set(item.name.trim().toLowerCase(), item.qty);
            }
        }
    }
    return map;
}

// ========================================================
//  DAS ADRF: Generate Excel by loading the template file
//  and only modifying dynamic cells (area + qty values).
//  Everything else stays exactly as the template.
// ========================================================
async function generateDasAdrfFromTemplate({ totalArea, areaPercentage, vendorData, density }) {
    const templateUrl = encodeURI(DAS_ADRF_TEMPLATE_PATH);
    console.log('[ExcelGen] Fetching DAS ADRF template from:', templateUrl);

    const response = await fetch(templateUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch DAS ADRF template: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const ws = workbook.getWorksheet(' CELLULAR DAS ');
    if (!ws) {
        throw new Error('CELLULAR DAS worksheet not found in template');
    }

    // --- Set TOTAL AREA (H2, merged H2:K2) ---
    // All cells in the merge must be set to the same value for proper display.
    // numFmt "#,##0 "sq ft"" is preserved from template.
    ['H2', 'I2', 'J2', 'K2'].forEach(ref => { ws.getCell(ref).value = totalArea; });

    // --- Set CONSIDERED AREA (H3, merged H3:K3) ---
    const consideredArea = totalArea * (areaPercentage / 100);
    ['H3', 'I3', 'J3', 'K3'].forEach(ref => { ws.getCell(ref).value = consideredArea; });

    // --- Set % AREA TO CONSIDER (O3) ---
    // Template numFmt is "0%" so 1 = 100%, 0.8 = 80%
    ws.getCell('O3').value = areaPercentage / 100;

    // --- Set Qty values (column I) ---
    const qtyMap = buildAdrfQtyMap(vendorData);
    console.log('[ExcelGen] Built qty map with', qtyMap.size, 'items');

    for (const { row, name, defaultQty } of DAS_ADRF_ITEM_ROWS) {
        const calcQty = qtyMap.get(name.trim().toLowerCase()) ?? null;
        const cell = ws.getCell(`I${row}`);

        if (calcQty !== null) {
            cell.value = calcQty;
            console.log(`[ExcelGen] I${row} = ${calcQty} (${name})`);
        } else if (defaultQty !== null && defaultQty !== undefined) {
            cell.value = defaultQty;
        } else {
            cell.value = null;
        }
    }

    // --- Neutralize Opex formulas that produce unwanted $ values ---
    // K39 = 360*I39 produces "$720" when AT&T MetroCell qty is set.
    // Setting to 0 displays as "-" due to numFmt "$ #,##0;...;-;@"
    ws.getCell('K39').value = 0;
    ws.getCell('K41').value = 0;
    ws.getCell('K52').value = 0;
    ws.getCell('K53').value = 0;

    // --- Clear USD summary section formulas (rows 56-64) ---
    // Without unit prices filled in, these should all show "-" not dollar amounts.
    for (const row of [56, 57, 58, 59, 60, 61, 62, 63, 64]) {
        ws.getCell(`J${row}`).value = 0;
        ws.getCell(`K${row}`).value = 0;
    }

    // --- Update SIZE tab with dynamic values ---
    // The SIZE tab has static placeholder values in the template.
    // We overwrite them with calculated values based on density and area.
    const sizeWs = workbook.getWorksheet('SIZE') || workbook.getWorksheet(' SIZE ');
    if (sizeWs) {
        const hpRuRequired = calculateHpRuQty(totalArea, density);
        const totalAntennasRequired = calculateAntennaQty(totalArea, density);
        const sqftPerAntenna = totalAntennasRequired > 0 ? Math.floor(totalArea / totalAntennasRequired) : 0;

        // D18 = Total HP RU required
        sizeWs.getCell('D18').value = hpRuRequired;
        // E18 = Total antennas required
        sizeWs.getCell('E18').value = totalAntennasRequired;
        // F18 = Total area (from form)
        sizeWs.getCell('F18').value = totalArea;
        // G18 = sqft per antenna (totalArea / totalAntennas)
        sizeWs.getCell('G18').value = sqftPerAntenna;

        // I29 = clear (was 69,883 static value)
        sizeWs.getCell('I29').value = null;

        console.log(`[ExcelGen] SIZE tab updated: HP RU=${hpRuRequired}, Antennas=${totalAntennasRequired}, Area=${totalArea}, sqft/ant=${sqftPerAntenna}, I29=cleared`);
    } else {
        console.warn('[ExcelGen] SIZE worksheet not found in template — skipping SIZE tab updates');
    }

    // --- Remove ERCES worksheet (not needed for DAS file) ---
    // Keep SIZE tab — it mirrors the template and is required.
    const ercesSheet = workbook.getWorksheet('ERCES');
    if (ercesSheet) workbook.removeWorksheet(ercesSheet.id);

    // --- Flatten shared formulas to prevent ExcelJS serialization errors ---
    // ExcelJS cannot write shared formula master/clone relationships from .xlsm
    flattenSharedFormulas(workbook);

    console.log('[ExcelGen] DAS ADRF template generation complete');
    return workbook;
}

async function generateDasAdrfAsBase64({ totalArea, areaPercentage, vendorData, density }) {
    const workbook = await generateDasAdrfFromTemplate({ totalArea, areaPercentage, vendorData, density });
    const filename = generateExcelFilename({ systemType: 'DAS', dasVendor: 'ADRF' });
    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = arrayBufferToBase64(buffer);
    return { filename, buffer: base64 };
}


// ========================================================
//  ERCES ADRF: Generate Excel by loading the template file
//  and only modifying dynamic cells (area + qty values).
//  Everything else stays exactly as the template.
//  Removes the CELLULAR DAS sheet, keeps ERCES + SIZE.
// ========================================================
async function generateErcesAdrfFromTemplate({ totalArea, areaPercentage, vendorData, density }) {
    const templateUrl = encodeURI(DAS_ADRF_TEMPLATE_PATH);
    console.log('[ExcelGen] Fetching ERCES ADRF template from:', templateUrl);

    const response = await fetch(templateUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch ERCES ADRF template: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const ws = workbook.getWorksheet('ERCES');
    if (!ws) {
        throw new Error('ERCES worksheet not found in template');
    }

    // --- Set TOTAL AREA (H2, merged H2:K2) ---
    ['H2', 'I2', 'J2', 'K2'].forEach(ref => { ws.getCell(ref).value = totalArea; });

    // --- Set CONSIDERED AREA (H3, merged H3:K3) ---
    const consideredArea = totalArea * (areaPercentage / 100);
    ['H3', 'I3', 'J3', 'K3'].forEach(ref => { ws.getCell(ref).value = consideredArea; });

    // --- Set % AREA TO CONSIDER (O3) ---
    ws.getCell('O3').value = areaPercentage / 100;

    // --- Set Qty values (column I) ---
    // Only override cells where we have a calculated value from vendor data.
    // Template formulas are preserved for items without calculated values.
    const qtyMap = buildAdrfQtyMap(vendorData);
    console.log('[ExcelGen] Built ERCES qty map with', qtyMap.size, 'items');

    for (const { row, name, aliases } of ERCES_ADRF_ITEM_ROWS) {
        let calcQty = qtyMap.get(name.trim().toLowerCase()) ?? null;

        if (calcQty === null && aliases) {
            for (const alias of aliases) {
                calcQty = qtyMap.get(alias.trim().toLowerCase()) ?? null;
                if (calcQty !== null) break;
            }
        }

        if (calcQty !== null) {
            ws.getCell(`I${row}`).value = calcQty;
            console.log(`[ExcelGen] ERCES I${row} = ${calcQty} (${name})`);
        }
    }

    // --- Neutralize Opex formulas that produce unwanted $ values ---
    ws.getCell('K38').value = 0;
    ws.getCell('K39').value = 0;

    // --- Clear USD summary section formulas (rows 42-49) ---
    for (const row of [42, 43, 44, 45, 46, 47, 48, 49]) {
        ws.getCell(`J${row}`).value = 0;
        ws.getCell(`K${row}`).value = 0;
    }

    // --- Update SIZE tab with dynamic values ---
    const sizeWs = workbook.getWorksheet('SIZE') || workbook.getWorksheet(' SIZE ');
    if (sizeWs) {
        const hpRuRequired = calculateHpRuQty(totalArea, density);
        const totalAntennasRequired = calculateAntennaQty(totalArea, density);
        const sqftPerAntenna = totalAntennasRequired > 0 ? Math.floor(totalArea / totalAntennasRequired) : 0;

        // PUBLIC SAFETY section (row 4): antenna count + area
        // C13 = SUM(C4:C12) is referenced by ERCES!I16 formula
        sizeWs.getCell('C4').value = totalAntennasRequired;
        sizeWs.getCell('D4').value = totalArea;

        // CELLULAR DAS section (row 18)
        sizeWs.getCell('D18').value = hpRuRequired;
        sizeWs.getCell('E18').value = totalAntennasRequired;
        sizeWs.getCell('F18').value = totalArea;
        sizeWs.getCell('G18').value = sqftPerAntenna;

        sizeWs.getCell('I29').value = null;

        console.log(`[ExcelGen] SIZE tab updated: HP RU=${hpRuRequired}, Antennas=${totalAntennasRequired}, Area=${totalArea}, sqft/ant=${sqftPerAntenna}`);
    } else {
        console.warn('[ExcelGen] SIZE worksheet not found in template — skipping SIZE tab updates');
    }

    // --- Remove CELLULAR DAS worksheet (not needed for ERCES file) ---
    const dasSheet = workbook.getWorksheet(' CELLULAR DAS ');
    if (dasSheet) workbook.removeWorksheet(dasSheet.id);

    // --- Flatten shared formulas to prevent ExcelJS serialization errors ---
    flattenSharedFormulas(workbook);

    console.log('[ExcelGen] ERCES ADRF template generation complete');
    return workbook;
}

async function generateErcesAdrfAsBase64({ totalArea, areaPercentage, vendorData, density }) {
    const workbook = await generateErcesAdrfFromTemplate({ totalArea, areaPercentage, vendorData, density });
    const filename = generateExcelFilename({ systemType: 'ERCES', bdaVendor: 'ADRF' });
    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = arrayBufferToBase64(buffer);
    return { filename, buffer: base64 };
}


// ========================================================
//  FILENAME GENERATION
// ========================================================

/**
 * Generates the filename based on system type and vendor
 */
export function generateExcelFilename({ systemType, dasVendor, bdaVendor, fileType }) {
    let prefix = 'Pricing';
    let vendor = '';

    if (fileType === 'DAS') {
        prefix = 'DAS_Pricing';
        vendor = dasVendor || 'Comba';
    } else if (fileType === 'ERCES') {
        prefix = 'ERCES_Pricing';
        vendor = bdaVendor || 'Comba';
    } else if (systemType === 'ERCES') {
        prefix = 'ERCES_Pricing';
        vendor = bdaVendor || 'Comba';
    } else if (systemType === 'DAS') {
        prefix = 'DAS_Pricing';
        vendor = dasVendor || 'Comba';
    } else if (systemType === 'DAS & ERCES') {
        prefix = 'DAS_Pricing';
        vendor = dasVendor || bdaVendor || 'Comba';
    } else {
        prefix = 'Pricing';
        vendor = dasVendor || bdaVendor || 'Comba';
    }

    return `${prefix}-V. 2.2-${vendor}.xlsx`;
}


// ========================================================
//  GENERIC EXCEL GENERATION (non-ADRF DAS)
//  Used for Comba, ERCES, and other vendor combinations
// ========================================================

function applyBorder(cell, style = 'thin') {
    cell.border = {
        top: { style, color: { argb: COLORS.borderColor } },
        left: { style, color: { argb: COLORS.borderColor } },
        bottom: { style, color: { argb: COLORS.borderColor } },
        right: { style, color: { argb: COLORS.borderColor } }
    };
}

function formatNumber(value) {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('en-US').format(value);
}

function getCategorySections(systemType, dasVendor, bdaVendor, fileType, vendorData) {
    if (vendorData && vendorData.length > 0) {
        return vendorData.map(section => ({
            name: section.displayName || section.name,
            rows: section.items.length,
            items: section.items
        }));
    }

    const effectiveType = fileType || systemType;

    if (effectiveType === 'ERCES') {
        return [
            { name: 'EQUIPMENT', rows: 12, items: [] },
            { name: 'CABLING &\nMATERIALS', rows: 7, items: [] },
            { name: 'ALL-IN', rows: 5, items: [] },
            { name: 'SERVICE & LABOR', rows: 7, items: [] },
            { name: 'USD', rows: 4, items: [] }
        ];
    }

    if (effectiveType === 'DAS' || effectiveType === 'DAS & ERCES') {
        const vendor = dasVendor || bdaVendor;
        const sections = [
            { name: 'DAS HEAD-END', rows: 10, items: [] },
            { name: 'REMOTE UNITS', rows: 8, items: [] }
        ];

        if (vendor === 'ADRF') {
            sections.push({ name: 'OTH EQUIP', rows: 6, items: [] });
        } else {
            sections.push({ name: 'ADD\'L EQUIPMENT', rows: 6, items: [] });
        }

        sections.push(
            { name: 'SIGNAL SOURCE', rows: 5, items: [] },
            { name: 'SERVICE & LABOR', rows: 7, items: [] },
            { name: 'USD', rows: 4, items: [] }
        );

        return sections;
    }

    return [
        { name: 'EQUIPMENT', rows: 15, items: [] },
        { name: 'SERVICE & LABOR', rows: 7, items: [] },
        { name: 'USD', rows: 4, items: [] }
    ];
}

export async function generateRomExcel({
    systemType,
    dasVendor,
    bdaVendor,
    grossSqFt,
    areaPercentage = 100,
    fileType = null,
    vendorData = null
}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SalesHub ROM Automation';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Pricing', {
        views: [{ showGridLines: true }]
    });

    const totalArea = parseFloat(grossSqFt) || 0;
    const consideredArea = totalArea * (areaPercentage / 100);

    const categorySections = getCategorySections(systemType, dasVendor, bdaVendor, fileType, vendorData);

    // Row 1: Total Area
    worksheet.mergeCells('D1:F1');
    const totalAreaLabelCell = worksheet.getCell('D1');
    totalAreaLabelCell.value = 'TOTAL AREA';
    totalAreaLabelCell.font = { bold: true, size: 11 };
    totalAreaLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };

    worksheet.mergeCells('G1:I1');
    const totalAreaValueCell = worksheet.getCell('G1');
    totalAreaValueCell.value = `${formatNumber(totalArea)} sq ft`;
    totalAreaValueCell.font = { bold: true, size: 11, italic: true };
    totalAreaValueCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.greenBackground }
    };
    totalAreaValueCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('L1:M1');
    const percentLabelCell = worksheet.getCell('L1');
    percentLabelCell.value = '% AREA TO CONSIDER';
    percentLabelCell.font = { bold: true, size: 10 };
    percentLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 2: Considered Area
    worksheet.mergeCells('D2:F2');
    const consideredAreaLabelCell = worksheet.getCell('D2');
    consideredAreaLabelCell.value = 'CONSIDERED AREA';
    consideredAreaLabelCell.font = { bold: true, size: 11 };
    consideredAreaLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };

    worksheet.mergeCells('G2:I2');
    const consideredAreaValueCell = worksheet.getCell('G2');
    consideredAreaValueCell.value = `${formatNumber(consideredArea)} sq ft`;
    consideredAreaValueCell.font = { bold: true, size: 11, italic: true };
    consideredAreaValueCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.greenBackground }
    };
    consideredAreaValueCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('L2:M2');
    const percentValueCell = worksheet.getCell('L2');
    percentValueCell.value = `${areaPercentage}%`;
    percentValueCell.font = { bold: true, size: 12 };
    percentValueCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.yellowBackground }
    };
    percentValueCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 3: Spacer
    worksheet.getRow(3).height = 10;

    // Row 4: Column Headers
    worksheet.getRow(4).height = 22;

    const headerCells = [
        { col: 'B', value: '' },
        { col: 'C', value: '' },
        { col: 'D', value: '' },
        { col: 'E', value: 'Unit Price' },
        { col: 'F', value: 'Qty' },
        { col: 'G', value: 'Capex' },
        { col: 'H', value: 'Opex' },
        { col: 'I', value: 'CAPEX/SF' },
        { col: 'J', value: 'Assumptions' }
    ];

    worksheet.mergeCells('B4:D4');

    headerCells.forEach(({ col, value }) => {
        const cell = worksheet.getCell(`${col}4`);
        cell.value = value;
        cell.font = { bold: true, size: 10 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        applyBorder(cell);

        if (value === 'CAPEX/SF') {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: COLORS.orangeBackground }
            };
        }
    });

    // Category Sections
    let currentRow = 5;
    const GAP_BETWEEN_SECTIONS = 4;

    categorySections.forEach((section, sectionIndex) => {
        const rowCount = Math.max(section.rows, 1);
        const sectionStartRow = currentRow;
        const sectionEndRow = currentRow + rowCount - 1;
        const items = section.items || [];

        worksheet.mergeCells(`A${sectionStartRow}:A${sectionEndRow}`);
        const categoryCellLabel = worksheet.getCell(`A${sectionStartRow}`);
        categoryCellLabel.value = section.name;
        categoryCellLabel.font = {
            bold: true,
            size: 10,
            color: { argb: COLORS.categoryText }
        };
        categoryCellLabel.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.categoryBackground }
        };
        categoryCellLabel.alignment = {
            textRotation: 90,
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true
        };
        applyBorder(categoryCellLabel);

        for (let i = 0; i < rowCount; i++) {
            const rowNum = sectionStartRow + i;
            const item = items[i];
            const row = worksheet.getRow(rowNum);
            row.height = 18;

            const itemNameUpper = item ? item.name.toUpperCase().trim() : '';
            const isHighlightedRow = (itemNameUpper === 'SUB-TOTAL' || itemNameUpper === 'TOTAL');

            if (isHighlightedRow) {
                row.height = 22;
            }

            ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
                const cell = worksheet.getCell(`${col}${rowNum}`);

                if (col === 'B' && item) {
                    cell.value = item.name;
                    cell.alignment = { vertical: 'middle' };
                    cell.font = { size: 10 };

                    if (isHighlightedRow) {
                        cell.font = { bold: true, size: 11, color: { argb: COLORS.categoryText } };
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: COLORS.categoryBackground }
                        };
                        cell.alignment = { horizontal: 'left', vertical: 'middle' };
                    }
                }

                if ((col === 'C' || col === 'D') && isHighlightedRow) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: COLORS.categoryBackground }
                    };
                }

                if (col === 'E') {
                    if (isHighlightedRow) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'D9D9D9' }
                        };
                    } else {
                        cell.value = '-';
                    }
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                if (col === 'F') {
                    if (isHighlightedRow) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'D9D9D9' }
                        };
                    } else if (item && item.qty !== null && item.qty !== undefined) {
                        cell.value = item.qty;
                    }
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                if (col === 'G') {
                    cell.value = '-';
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                if (col === 'H') {
                    cell.value = '-';
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                if (col === 'I') {
                    if (isHighlightedRow) {
                        cell.value = '-';
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: COLORS.categoryBackground }
                        };
                    } else {
                        cell.value = '0.00';
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: COLORS.orangeBackground }
                        };
                    }
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                if (col === 'J' && item && item.assumptions) {
                    cell.value = item.assumptions;
                    cell.alignment = { vertical: 'middle', wrapText: true };
                    cell.font = { size: 9 };
                }

                applyBorder(cell);
            });

            worksheet.mergeCells(`B${rowNum}:D${rowNum}`);
        }

        currentRow = sectionEndRow + 1;

        if (sectionIndex < categorySections.length - 1) {
            currentRow += GAP_BETWEEN_SECTIONS;
        }
    });

    worksheet.getColumn('A').width = 4;
    worksheet.getColumn('B').width = 15;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 15;
    worksheet.getColumn('E').width = 12;
    worksheet.getColumn('F').width = 8;
    worksheet.getColumn('G').width = 10;
    worksheet.getColumn('H').width = 10;
    worksheet.getColumn('I').width = 10;
    worksheet.getColumn('J').width = 35;
    worksheet.getColumn('K').width = 2;
    worksheet.getColumn('L').width = 12;
    worksheet.getColumn('M').width = 10;

    const filename = generateExcelFilename({ systemType, dasVendor, bdaVendor, fileType });

    return { workbook, filename };
}


// ========================================================
//  BUFFER / BASE64 HELPERS
// ========================================================

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function generateRomExcelAsBase64(params) {
    const { workbook, filename } = await generateRomExcel(params);
    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = arrayBufferToBase64(buffer);
    return { filename, buffer: base64 };
}


// ========================================================
//  MAIN ENTRY POINT: Generate Excel files for ROM
//  For DAS ADRF: uses template-based generation
//  For everything else: uses dynamic generation
// ========================================================

export async function generateMultipleExcelFiles(params) {
    const { systemType, dasVendor, bdaVendor, grossSqFt, density, numSectors = 0, areaPercentage = 100 } = params;
    const files = [];

    const totalArea = parseFloat(grossSqFt) || 0;
    const consideredArea = totalArea * (areaPercentage / 100);

    if (systemType === 'DAS & ERCES') {
        // --- DAS Excel File ---
        let dasVendorData = [];
        try {
            dasVendorData = await fetchVendorData(dasVendor || 'Comba', 'DAS');
            console.log('[ExcelGen] Fetched DAS vendor data:', dasVendorData.length, 'sections');
        } catch (err) {
            console.error('[ExcelGen] Failed to fetch DAS vendor data, using fallback:', err);
        }

        dasVendorData = calculateQtyValues(dasVendorData, dasVendor || 'Comba', 'DAS', totalArea, consideredArea, density, numSectors);

        if (dasVendor === 'ADRF') {
            try {
                const dasFile = await generateDasAdrfAsBase64({
                    totalArea,
                    areaPercentage,
                    vendorData: dasVendorData,
                    density,
                });
                files.push(dasFile);
            } catch (err) {
                console.error('[ExcelGen] DAS ADRF template generation failed, falling back to dynamic:', err);
                const dasFile = await generateRomExcelAsBase64({
                    systemType,
                    dasVendor,
                    bdaVendor,
                    grossSqFt,
                    density,
                    areaPercentage,
                    fileType: 'DAS',
                    vendorData: dasVendorData
                });
                files.push(dasFile);
            }
        } else {
            const dasFile = await generateRomExcelAsBase64({
                systemType,
                dasVendor,
                bdaVendor,
                grossSqFt,
                density,
                areaPercentage,
                fileType: 'DAS',
                vendorData: dasVendorData
            });
            files.push(dasFile);
        }

        // --- ERCES Excel File ---
        let ercesVendorData = [];
        try {
            ercesVendorData = await fetchVendorData(bdaVendor || 'Comba', 'ERCES');
            console.log('[ExcelGen] Fetched ERCES vendor data:', ercesVendorData.length, 'sections');
        } catch (err) {
            console.error('[ExcelGen] Failed to fetch ERCES vendor data, using fallback:', err);
        }

        ercesVendorData = calculateQtyValues(ercesVendorData, bdaVendor || 'Comba', 'ERCES', totalArea, consideredArea, density, numSectors);

        if (bdaVendor === 'ADRF') {
            try {
                const ercesFile = await generateErcesAdrfAsBase64({
                    totalArea,
                    areaPercentage,
                    vendorData: ercesVendorData,
                    density,
                });
                files.push(ercesFile);
            } catch (err) {
                console.error('[ExcelGen] ERCES ADRF template generation failed, falling back to dynamic:', err);
                const ercesFile = await generateRomExcelAsBase64({
                    systemType,
                    dasVendor,
                    bdaVendor,
                    grossSqFt,
                    density,
                    areaPercentage,
                    fileType: 'ERCES',
                    vendorData: ercesVendorData
                });
                files.push(ercesFile);
            }
        } else {
            const ercesFile = await generateRomExcelAsBase64({
                systemType,
                dasVendor,
                bdaVendor,
                grossSqFt,
                density,
                areaPercentage,
                fileType: 'ERCES',
                vendorData: ercesVendorData
            });
            files.push(ercesFile);
        }

    } else if (systemType === 'DAS') {
        // Single DAS file
        let vendorData = [];
        try {
            vendorData = await fetchVendorData(dasVendor || 'Comba', 'DAS');
            console.log('[ExcelGen] Fetched DAS vendor data:', vendorData.length, 'sections');
        } catch (err) {
            console.error('[ExcelGen] Failed to fetch DAS vendor data, using fallback:', err);
        }

        vendorData = calculateQtyValues(vendorData, dasVendor || 'Comba', 'DAS', totalArea, consideredArea, density, numSectors);

        if (dasVendor === 'ADRF') {
            try {
                const file = await generateDasAdrfAsBase64({
                    totalArea,
                    areaPercentage,
                    vendorData,
                    density,
                });
                files.push(file);
            } catch (err) {
                console.error('[ExcelGen] DAS ADRF template generation failed, falling back to dynamic:', err);
                const file = await generateRomExcelAsBase64({
                    ...params,
                    vendorData
                });
                files.push(file);
            }
        } else {
            const file = await generateRomExcelAsBase64({
                ...params,
                vendorData
            });
            files.push(file);
        }

    } else if (systemType === 'ERCES') {
        let vendorData = [];
        try {
            vendorData = await fetchVendorData(bdaVendor || 'Comba', 'ERCES');
            console.log('[ExcelGen] Fetched ERCES vendor data:', vendorData.length, 'sections');
        } catch (err) {
            console.error('[ExcelGen] Failed to fetch ERCES vendor data, using fallback:', err);
        }

        vendorData = calculateQtyValues(vendorData, bdaVendor || 'Comba', 'ERCES', totalArea, consideredArea, density, numSectors);

        if (bdaVendor === 'ADRF') {
            try {
                const file = await generateErcesAdrfAsBase64({
                    totalArea,
                    areaPercentage,
                    vendorData,
                    density,
                });
                files.push(file);
            } catch (err) {
                console.error('[ExcelGen] ERCES ADRF template generation failed, falling back to dynamic:', err);
                const file = await generateRomExcelAsBase64({
                    ...params,
                    vendorData
                });
                files.push(file);
            }
        } else {
            const file = await generateRomExcelAsBase64({
                ...params,
                vendorData
            });
            files.push(file);
        }

    } else {
        console.warn('[ExcelGen] Unknown system type:', systemType, '- generating with fallback');
        const file = await generateRomExcelAsBase64(params);
        files.push(file);
    }

    return files;
}


// ========================================================
//  DOWNLOAD HELPERS (browser)
// ========================================================

export function downloadExcelFile(filename, base64Data) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export async function generateAndDownloadExcel(params) {
    try {
        const { workbook, filename } = await generateRomExcel(params);

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { filename, success: true };
    } catch (error) {
        console.error('Error generating Excel file:', error);
        throw new Error(`Failed to generate Excel file: ${error.message}`);
    }
}
