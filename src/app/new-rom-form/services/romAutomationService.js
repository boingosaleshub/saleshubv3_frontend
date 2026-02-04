/**
 * ROM Automation Service
 * Orchestrates Excel generation and Ookla automation for ROM creation
 */

import { generateMultipleExcelFiles } from './excelGenerationService';

/**
 * Get the automation API base URL from environment
 * @returns {string}
 */
function getApiUrl() {
    return process.env.NEXT_PUBLIC_PLAYWRIGHT_BACKEND_URL || ''
}

/**
 * Get the ROM automation endpoint URL
 * @returns {string}
 */
function getRomEndpoint() {
    const baseUrl = getApiUrl()
    return baseUrl ? `${baseUrl}/api/rom/automate` : '/api/rom/automate'
}

/**
 * Runs the Ookla automation to capture screenshots
 * @param {Object} params - The automation parameters
 * @param {string} params.address - The venue address
 * @param {string[]} params.carriers - Array of carrier names (e.g., ['AT&T', 'Verizon'])
 * @returns {Promise<{success: boolean, screenshots: Array<{filename: string, buffer: string}>}>}
 */
async function runOoklaAutomation({ address, carriers }) {
    const url = getRomEndpoint()
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, carriers }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ookla automation failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Full ROM Automation Process:
 * 1. Generate the pricing Excel file(s) - multiple files for "DAS & ERCES" system type
 * 2. Run Ookla automation for screenshots
 * 3. Return both Excel files and screenshots
 * 
 * @param {Object} params - The automation parameters
 * @param {string} params.address - The venue address
 * @param {string[]} params.carriers - Array of carrier names (e.g., ['AT&T', 'Verizon'])
 * @param {string} params.systemType - The system type (DAS, ERCES, DAS & ERCES)
 * @param {string} params.dasVendor - The DAS vendor (Comba, ADRF)
 * @param {string} params.bdaVendor - The BDA/Booster vendor (Comba, ADRF)
 * @param {string|number} params.grossSqFt - The gross square footage (Total Area)
 * @returns {Promise<{success: boolean, excelFiles: Array<{filename: string, buffer: string}>, screenshots: Array<{filename: string, buffer: string}>}>}
 */
export async function createRomAutomation({ 
    address, 
    carriers,
    systemType,
    dasVendor,
    bdaVendor,
    grossSqFt
}) {
    // Step 1: Generate Excel file(s)
    // For "DAS & ERCES" system type, this generates both DAS and ERCES files
    console.log('[ROM Automation] Step 1: Generating Excel pricing sheet(s)...');
    
    let excelFiles = [];
    try {
        excelFiles = await generateMultipleExcelFiles({
            systemType,
            dasVendor,
            bdaVendor,
            grossSqFt,
            areaPercentage: 100
        });
        console.log('[ROM Automation] Excel files generated:', excelFiles.map(f => f.filename).join(', '));
    } catch (excelError) {
        console.error('[ROM Automation] Excel generation failed:', excelError);
        throw new Error(`Excel generation failed: ${excelError.message}`);
    }

    // Step 2: Run Ookla automation for screenshots
    console.log('[ROM Automation] Step 2: Running Ookla automation for screenshots...');
    
    let ooklaResult = null;
    try {
        ooklaResult = await runOoklaAutomation({ address, carriers });
        console.log('[ROM Automation] Screenshots captured:', ooklaResult.screenshots?.length || 0);
    } catch (ooklaError) {
        console.error('[ROM Automation] Ookla automation failed:', ooklaError);
        // Return partial result with Excel files even if screenshots fail
        return {
            success: false,
            partialSuccess: true,
            excelFiles,
            screenshots: [],
            error: `Screenshots failed but Excel files were generated: ${ooklaError.message}`
        };
    }

    // Step 3: Return combined result
    console.log('[ROM Automation] Process completed successfully');
    
    return {
        success: true,
        excelFiles,
        screenshots: ooklaResult.screenshots || []
    };
}

/**
 * Legacy function for backward compatibility - just runs Ookla automation
 * @param {Object} params - The automation parameters
 * @param {string} params.address - The venue address
 * @param {string[]} params.carriers - Array of carrier names
 * @returns {Promise<{success: boolean, screenshots: Array<{filename: string, buffer: string}>}>}
 */
export async function createOoklaScreenshots({ address, carriers }) {
    return runOoklaAutomation({ address, carriers });
}

/**
 * Downloads a file from base64 data
 * @param {string} filename - The filename for the download
 * @param {string} base64Data - The base64 encoded data
 * @param {string} mimeType - The MIME type of the file
 */
export function downloadFile(filename, base64Data, mimeType = 'application/octet-stream') {
    // Create a blob from the base64 data
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

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
 * Downloads a screenshot from base64 data
 * @param {string} filename - The filename for the download
 * @param {string} base64Data - The base64 encoded image data
 */
export function downloadScreenshot(filename, base64Data) {
    downloadFile(filename, base64Data, 'image/png');
}

/**
 * Downloads an Excel file from base64 data
 * @param {string} filename - The filename for the download
 * @param {string} base64Data - The base64 encoded Excel data
 */
export function downloadExcel(filename, base64Data) {
    downloadFile(
        filename, 
        base64Data, 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
}

/**
 * Downloads all screenshots from the automation response
 * @param {Array<{filename: string, buffer: string}>} screenshots - Array of screenshot data
 */
export function downloadAllScreenshots(screenshots) {
    screenshots.forEach((screenshot, index) => {
        // Add a small delay between downloads to prevent browser blocking
        setTimeout(() => {
            downloadScreenshot(screenshot.filename, screenshot.buffer);
        }, index * 500);
    });
}

/**
 * Downloads all ROM automation results (Excel files + screenshots)
 * @param {Object} result - The automation result
 * @param {Array<{filename: string, buffer: string}>} result.excelFiles - Array of Excel file data
 * @param {Array<{filename: string, buffer: string}>} result.screenshots - Array of screenshot data
 */
export function downloadAllRomFiles(result) {
    let downloadIndex = 0;

    // Download all Excel files first
    if (result.excelFiles && result.excelFiles.length > 0) {
        result.excelFiles.forEach((excelFile) => {
            setTimeout(() => {
                downloadExcel(excelFile.filename, excelFile.buffer);
            }, downloadIndex * 500);
            downloadIndex++;
        });
    }

    // Download all screenshots
    if (result.screenshots && result.screenshots.length > 0) {
        result.screenshots.forEach((screenshot) => {
            setTimeout(() => {
                downloadScreenshot(screenshot.filename, screenshot.buffer);
            }, downloadIndex * 500);
            downloadIndex++;
        });
    }
}
