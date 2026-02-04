/**
 * Excel Generation Service
 * Generates pricing Excel sheets for ROM automation
 * Uses ExcelJS for professional Excel file generation with styling
 */

import ExcelJS from 'exceljs';

/**
 * Column configuration for the pricing sheet
 */
const COLUMNS = [
    { header: '', key: 'equipment', width: 35 },           // Equipment names (no header)
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Qty', key: 'qty', width: 8 },
    { header: 'Capex', key: 'capex', width: 12 },
    { header: 'Opex', key: 'opex', width: 12 },
    { header: 'CAPEX/SF', key: 'capexSf', width: 12 },
    { header: 'Assumptions', key: 'assumptions', width: 40 }
];

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
 * @returns {string} - The generated filename
 */
export function generateExcelFilename({ systemType, dasVendor, bdaVendor }) {
    let prefix = 'Pricing';
    let vendor = '';

    if (systemType === 'ERCES') {
        prefix = 'ERCES_Pricing';
        vendor = bdaVendor || 'Comba';
    } else if (systemType === 'DAS') {
        prefix = 'DAS_Pricing';
        vendor = dasVendor || 'Comba';
    } else if (systemType === 'DAS & ERCES') {
        // For combined systems, prioritize DAS vendor
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
 * Generates the ROM pricing Excel workbook
 * @param {Object} params - The form parameters
 * @param {string} params.systemType - The system type
 * @param {string} params.dasVendor - The DAS vendor
 * @param {string} params.bdaVendor - The BDA/Booster vendor
 * @param {string|number} params.grossSqFt - The gross square footage (Total Area)
 * @param {number} params.areaPercentage - The percentage of area to consider (default 100)
 * @returns {Promise<{workbook: ExcelJS.Workbook, filename: string}>}
 */
export async function generateRomExcel({
    systemType,
    dasVendor,
    bdaVendor,
    grossSqFt,
    areaPercentage = 100
}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SalesHub ROM Automation';
    workbook.created = new Date();

    // Create the pricing worksheet
    const worksheet = workbook.addWorksheet('Pricing', {
        views: [{ showGridLines: true }]
    });

    // Set column widths
    worksheet.columns = COLUMNS.map((col) => ({
        key: col.key,
        width: col.width
    }));

    // Parse total area value
    const totalArea = parseFloat(grossSqFt) || 0;
    const consideredArea = totalArea * (areaPercentage / 100);

    // --- ROW 1-2: Header Area Information ---
    
    // Row 1: Total Area
    // Merge cells for "TOTAL AREA" label (columns E-F, approximately)
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
    
    // Define header positions (columns B through H, leaving A for equipment category)
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

    // --- ROW 5+: Equipment Category and Rows (Empty data for now) ---
    // Add "EQUIPMENT" category label in column A (rotated text)
    
    // Equipment rows start at row 5
    const equipmentStartRow = 5;
    const equipmentEndRow = 20; // Reserve 15 rows for equipment

    // Merge cells A5:A20 for the "EQUIPMENT" category label
    worksheet.mergeCells(`A${equipmentStartRow}:A${equipmentEndRow}`);
    const equipmentCategoryCell = worksheet.getCell(`A${equipmentStartRow}`);
    equipmentCategoryCell.value = 'EQUIPMENT';
    equipmentCategoryCell.font = { bold: true, size: 11, color: { argb: COLORS.categoryText } };
    equipmentCategoryCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.categoryBackground }
    };
    equipmentCategoryCell.alignment = { 
        textRotation: 90, 
        horizontal: 'center', 
        vertical: 'middle' 
    };
    applyBorder(equipmentCategoryCell);

    // Add empty equipment rows with borders
    for (let rowNum = equipmentStartRow; rowNum <= equipmentEndRow; rowNum++) {
        const row = worksheet.getRow(rowNum);
        row.height = 18;
        
        // Apply borders to data cells (columns B through J)
        ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
            const cell = worksheet.getCell(`${col}${rowNum}`);
            cell.value = col === 'F' ? '-' : ''; // Qty column shows dash when empty
            if (col >= 'E' && col <= 'I') {
                cell.value = '-';
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
            if (col === 'I') {
                cell.value = '0.00';
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: COLORS.orangeBackground }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
            applyBorder(cell);
        });

        // Merge equipment name cells (B-D)
        worksheet.mergeCells(`B${rowNum}:D${rowNum}`);
    }

    // Set column widths more precisely
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
    const filename = generateExcelFilename({ systemType, dasVendor, bdaVendor });

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
 * @param {Object} params - The form parameters
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
