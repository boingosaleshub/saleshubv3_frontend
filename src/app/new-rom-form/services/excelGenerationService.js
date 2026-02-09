/**
 * Excel Generation Service
 * Generates pricing Excel sheets for ROM automation
 * Uses ExcelJS for professional Excel file generation with styling
 * 
 * Data is fetched from vendor_adrf / vendor_comba Supabase tables
 * and dynamically populates each section with the correct items.
 */

import ExcelJS from 'exceljs';
import { fetchVendorData } from './vendorDataService';

/**
 * Color palette for styling
 */
const COLORS = {
    headerBackground: '3D434A',      // Dark gray header
    headerText: 'FFFFFF',            // White text
    greenBackground: '92D050',       // Green for area values
    yellowBackground: 'FFFF00',      // Yellow for percentage
    orangeBackground: 'FFC000',      // Orange for CAPEX/SF header
    borderColor: 'B4B4B4',           // Light gray border
    categoryBackground: 'C00000',    // Red for category labels
    categoryText: 'FFFFFF',          // White text for categories
};

/**
 * Generates the filename based on system type and vendor
 * @param {Object} params - The form parameters
 * @param {string} params.systemType - The system type (DAS, ERCES, DAS & ERCES)
 * @param {string} params.dasVendor - The DAS vendor (Comba, ADRF)
 * @param {string} params.bdaVendor - The BDA/Booster vendor (Comba, ADRF)
 * @param {string} params.fileType - Optional: Force specific file type (DAS or ERCES) for combined systems
 * @returns {string} - The generated filename
 */
export function generateExcelFilename({ systemType, dasVendor, bdaVendor, fileType }) {
    let prefix = 'Pricing';
    let vendor = '';

    // If fileType is specified, use it directly (for combined systems generating separate files)
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
        // For combined systems without fileType specified, default to DAS
        prefix = 'DAS_Pricing';
        vendor = dasVendor || bdaVendor || 'Comba';
    } else {
        // Default fallback
        prefix = 'Pricing';
        vendor = dasVendor || bdaVendor || 'Comba';
    }

    return `${prefix}-V. 2.2-${vendor}.xlsx`;
}

/**
 * Applies border styling to a cell
 * @param {ExcelJS.Cell} cell - The cell to style
 * @param {string} style - Border style (thin, medium, thick)
 */
function applyBorder(cell, style = 'thin') {
    cell.border = {
        top: { style, color: { argb: COLORS.borderColor } },
        left: { style, color: { argb: COLORS.borderColor } },
        bottom: { style, color: { argb: COLORS.borderColor } },
        right: { style, color: { argb: COLORS.borderColor } }
    };
}

/**
 * Formats a number with commas for display
 * @param {number} value - The number to format
 * @returns {string} - Formatted number string
 */
function formatNumber(value) {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Gets the category sections based on vendor data from the database.
 * If vendorData is provided (fetched from DB), uses it to build dynamic sections.
 * Otherwise, falls back to hardcoded default sections.
 * 
 * @param {string} systemType - The system type (DAS, ERCES, DAS & ERCES)
 * @param {string} dasVendor - The DAS vendor
 * @param {string} bdaVendor - The BDA/Booster vendor
 * @param {string} fileType - Optional: Force specific file type (DAS or ERCES)
 * @param {Array|null} vendorData - Optional: Data fetched from vendor tables
 * @returns {Array<{name: string, rows: number, items: Array}>} - Array of section configurations
 */
function getCategorySections(systemType, dasVendor, bdaVendor, fileType, vendorData) {
    // If vendor data is available from the database, build sections dynamically
    if (vendorData && vendorData.length > 0) {
        return vendorData.map(section => ({
            name: section.displayName || section.name,
            rows: section.items.length,
            items: section.items
        }));
    }

    // === FALLBACK: Hardcoded sections when no vendor data is available ===
    const effectiveType = fileType || systemType;

    // For ERCES systems (or ERCES file in combined)
    if (effectiveType === 'ERCES') {
        return [
            { name: 'EQUIPMENT', rows: 12, items: [] },
            { name: 'CABLING &\nMATERIALS', rows: 7, items: [] },
            { name: 'ALL-IN', rows: 5, items: [] },
            { name: 'SERVICE & LABOR', rows: 7, items: [] },
            { name: 'USD', rows: 4, items: [] }
        ];
    }

    // For DAS systems (or DAS file in combined)
    if (effectiveType === 'DAS' || effectiveType === 'DAS & ERCES') {
        const vendor = dasVendor || bdaVendor;
        const sections = [
            { name: 'DAS HEAD-END', rows: 10, items: [] },
            { name: 'REMOTE UNITS', rows: 8, items: [] }
        ];

        // Different section name based on vendor
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

    // Default fallback
    return [
        { name: 'EQUIPMENT', rows: 15, items: [] },
        { name: 'SERVICE & LABOR', rows: 7, items: [] },
        { name: 'USD', rows: 4, items: [] }
    ];
}

/**
 * Generates the ROM pricing Excel workbook
 * 
 * @param {Object} params - The form parameters
 * @param {string} params.systemType - The system type
 * @param {string} params.dasVendor - The DAS vendor
 * @param {string} params.bdaVendor - The BDA/Booster vendor
 * @param {string|number} params.grossSqFt - The gross square footage (Total Area)
 * @param {number} params.areaPercentage - The percentage of area to consider (default 100)
 * @param {string} params.fileType - Optional: Force specific file type (DAS or ERCES) for combined systems
 * @param {Array|null} params.vendorData - Optional: Pre-fetched vendor data from database
 * @returns {Promise<{workbook: ExcelJS.Workbook, filename: string}>}
 */
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

    // Create the pricing worksheet
    const worksheet = workbook.addWorksheet('Pricing', {
        views: [{ showGridLines: true }]
    });

    // Parse total area value
    const totalArea = parseFloat(grossSqFt) || 0;
    const consideredArea = totalArea * (areaPercentage / 100);

    // Get category sections (dynamically from DB data or fallback to hardcoded)
    const categorySections = getCategorySections(systemType, dasVendor, bdaVendor, fileType, vendorData);

    // --- ROW 1-2: Header Area Information ---

    // Row 1: Total Area
    worksheet.mergeCells('D1:F1');
    const totalAreaLabelCell = worksheet.getCell('D1');
    totalAreaLabelCell.value = 'TOTAL AREA';
    totalAreaLabelCell.font = { bold: true, size: 11 };
    totalAreaLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };

    // Total Area Value cell
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

    // % Area to Consider label and value
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

    // % Area to Consider Value (100%)
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

    // --- ROW 3: Empty row for spacing ---
    worksheet.getRow(3).height = 10;

    // --- ROW 4: Column Headers ---
    worksheet.getRow(4).height = 22;

    // Define header positions (columns B through J, leaving A for equipment category)
    const headerCells = [
        { col: 'B', value: '' },              // Equipment name column (no header text)
        { col: 'C', value: '' },              // Part of equipment name area
        { col: 'D', value: '' },              // Part of equipment name area
        { col: 'E', value: 'Unit Price' },
        { col: 'F', value: 'Qty' },
        { col: 'G', value: 'Capex' },
        { col: 'H', value: 'Opex' },
        { col: 'I', value: 'CAPEX/SF' },
        { col: 'J', value: 'Assumptions' }
    ];

    // Merge cells B4:D4 for equipment column header area
    worksheet.mergeCells('B4:D4');

    // Apply styles to header cells
    headerCells.forEach(({ col, value }) => {
        const cell = worksheet.getCell(`${col}4`);
        cell.value = value;
        cell.font = { bold: true, size: 10 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        applyBorder(cell);

        // Special styling for CAPEX/SF header (orange background)
        if (value === 'CAPEX/SF') {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: COLORS.orangeBackground }
            };
        }
    });

    // --- ROW 5+: Category Sections with Data from Database ---
    let currentRow = 5; // Start from row 5
    const GAP_BETWEEN_SECTIONS = 4; // Number of empty rows between red category sections

    // Create each category section and populate with data
    categorySections.forEach((section, sectionIndex) => {
        // Ensure at least 1 row per section even if no items
        const rowCount = Math.max(section.rows, 1);
        const sectionStartRow = currentRow;
        const sectionEndRow = currentRow + rowCount - 1;
        const items = section.items || [];

        // Merge cells in column A for the category label
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

        // Populate rows for this section
        for (let i = 0; i < rowCount; i++) {
            const rowNum = sectionStartRow + i;
            const item = items[i]; // May be undefined if fewer items than rows
            const row = worksheet.getRow(rowNum);
            row.height = 18;

            // Apply borders and data to each cell in the row (columns B through J)
            ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
                const cell = worksheet.getCell(`${col}${rowNum}`);

                // Equipment/item name in column B (will be merged with C, D)
                if (col === 'B' && item) {
                    cell.value = item.name;
                    cell.alignment = { vertical: 'middle' };
                    cell.font = { size: 10 };
                }

                // Unit Price (column E) - placeholder dash
                if (col === 'E') {
                    cell.value = '-';
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                // Qty (column F) - stays EMPTY as per requirement
                if (col === 'F') {
                    // Intentionally left empty - qty will be filled later
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                // Capex (column G) - placeholder dash
                if (col === 'G') {
                    cell.value = '-';
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                // Opex (column H) - placeholder dash
                if (col === 'H') {
                    cell.value = '-';
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                // CAPEX/SF (column I) - with orange background
                if (col === 'I') {
                    cell.value = '0.00';
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: COLORS.orangeBackground }
                    };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                // Assumptions (column J) - from database
                if (col === 'J' && item && item.assumptions) {
                    cell.value = item.assumptions;
                    cell.alignment = { vertical: 'middle', wrapText: true };
                    cell.font = { size: 9 };
                }

                applyBorder(cell);
            });

            // Merge equipment/item name cells (B-D) for wider name display
            worksheet.mergeCells(`B${rowNum}:D${rowNum}`);
        }

        // Move to next section
        currentRow = sectionEndRow + 1;

        // Add empty rows gap between sections (except after the last section)
        if (sectionIndex < categorySections.length - 1) {
            currentRow += GAP_BETWEEN_SECTIONS;
        }
    });

    // Set column widths
    worksheet.getColumn('A').width = 4;   // Category column (narrow)
    worksheet.getColumn('B').width = 15;  // Equipment name part 1
    worksheet.getColumn('C').width = 15;  // Equipment name part 2
    worksheet.getColumn('D').width = 15;  // Equipment name part 3
    worksheet.getColumn('E').width = 12;  // Unit Price
    worksheet.getColumn('F').width = 8;   // Qty
    worksheet.getColumn('G').width = 10;  // Capex
    worksheet.getColumn('H').width = 10;  // Opex
    worksheet.getColumn('I').width = 10;  // CAPEX/SF
    worksheet.getColumn('J').width = 35;  // Assumptions
    worksheet.getColumn('K').width = 2;   // Spacer
    worksheet.getColumn('L').width = 12;  // % Area label
    worksheet.getColumn('M').width = 10;  // % Area value

    // Generate filename
    const filename = generateExcelFilename({ systemType, dasVendor, bdaVendor, fileType });

    return { workbook, filename };
}

/**
 * Converts ArrayBuffer to base64 string (works in browser)
 * @param {ArrayBuffer} buffer - The buffer to convert
 * @returns {string} - Base64 encoded string
 */
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Generates Excel file and returns it as a base64 string
 * @param {Object} params - The form parameters (including optional vendorData)
 * @returns {Promise<{filename: string, buffer: string}>}
 */
export async function generateRomExcelAsBase64(params) {
    const { workbook, filename } = await generateRomExcel(params);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Convert to base64 (browser-compatible)
    const base64 = arrayBufferToBase64(buffer);

    return { filename, buffer: base64 };
}

/**
 * Generates multiple Excel files for ROM.
 * 
 * - For "DAS & ERCES" system type: generates separate DAS and ERCES files
 * - For "DAS" or "ERCES": generates a single file
 * 
 * Automatically fetches vendor data from Supabase tables (vendor_adrf or vendor_comba)
 * to populate each Excel sheet with the correct equipment items, names, and assumptions.
 * 
 * @param {Object} params - The form parameters
 * @param {string} params.systemType - The system type
 * @param {string} params.dasVendor - The DAS vendor (Comba, ADRF)
 * @param {string} params.bdaVendor - The BDA/Booster vendor (Comba, ADRF)
 * @param {string|number} params.grossSqFt - The gross square footage
 * @param {number} params.areaPercentage - The percentage of area to consider
 * @returns {Promise<Array<{filename: string, buffer: string}>>} - Array of Excel files
 */
export async function generateMultipleExcelFiles(params) {
    const { systemType, dasVendor, bdaVendor, grossSqFt, areaPercentage = 100 } = params;
    const files = [];

    // For "DAS & ERCES" system type, generate both files with respective vendor data
    if (systemType === 'DAS & ERCES') {
        // --- DAS Excel File ---
        // Fetch DAS items from the DAS vendor table
        let dasVendorData = [];
        try {
            dasVendorData = await fetchVendorData(dasVendor || 'Comba', 'DAS');
            console.log('[ExcelGen] Fetched DAS vendor data:', dasVendorData.length, 'sections');
        } catch (err) {
            console.error('[ExcelGen] Failed to fetch DAS vendor data, using fallback:', err);
        }

        const dasFile = await generateRomExcelAsBase64({
            systemType,
            dasVendor,
            bdaVendor,
            grossSqFt,
            areaPercentage,
            fileType: 'DAS',
            vendorData: dasVendorData
        });
        files.push(dasFile);

        // --- ERCES Excel File ---
        // Fetch ERCES items from the BDA vendor table
        let ercesVendorData = [];
        try {
            ercesVendorData = await fetchVendorData(bdaVendor || 'Comba', 'ERCES');
            console.log('[ExcelGen] Fetched ERCES vendor data:', ercesVendorData.length, 'sections');
        } catch (err) {
            console.error('[ExcelGen] Failed to fetch ERCES vendor data, using fallback:', err);
        }

        const ercesFile = await generateRomExcelAsBase64({
            systemType,
            dasVendor,
            bdaVendor,
            grossSqFt,
            areaPercentage,
            fileType: 'ERCES',
            vendorData: ercesVendorData
        });
        files.push(ercesFile);

    } else if (systemType === 'DAS') {
        // Single DAS file - fetch from DAS vendor table
        let vendorData = [];
        try {
            vendorData = await fetchVendorData(dasVendor || 'Comba', 'DAS');
            console.log('[ExcelGen] Fetched DAS vendor data:', vendorData.length, 'sections');
        } catch (err) {
            console.error('[ExcelGen] Failed to fetch DAS vendor data, using fallback:', err);
        }

        const file = await generateRomExcelAsBase64({
            ...params,
            vendorData
        });
        files.push(file);

    } else if (systemType === 'ERCES') {
        // Single ERCES file - fetch from BDA vendor table
        let vendorData = [];
        try {
            vendorData = await fetchVendorData(bdaVendor || 'Comba', 'ERCES');
            console.log('[ExcelGen] Fetched ERCES vendor data:', vendorData.length, 'sections');
        } catch (err) {
            console.error('[ExcelGen] Failed to fetch ERCES vendor data, using fallback:', err);
        }

        const file = await generateRomExcelAsBase64({
            ...params,
            vendorData
        });
        files.push(file);

    } else {
        // Unknown system type - generate without vendor data (fallback)
        console.warn('[ExcelGen] Unknown system type:', systemType, '- generating with fallback');
        const file = await generateRomExcelAsBase64(params);
        files.push(file);
    }

    return files;
}

/**
 * Downloads the generated Excel file in the browser
 * @param {string} filename - The filename for the download
 * @param {string} base64Data - The base64 encoded Excel data
 */
export function downloadExcelFile(filename, base64Data) {
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Create download link and trigger it
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generates Excel workbook and triggers direct download in browser
 * @param {Object} params - The form parameters
 * @returns {Promise<{filename: string, success: boolean}>}
 */
export async function generateAndDownloadExcel(params) {
    try {
        const { workbook, filename } = await generateRomExcel(params);

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Create blob and download
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
