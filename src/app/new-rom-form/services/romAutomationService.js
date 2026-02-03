/**
 * ROM Automation Service
 * Simple service to call the backend ROM automation API
 */

/**
 * Triggers ROM automation for the given address and carriers
 * @param {Object} params - The automation parameters
 * @param {string} params.address - The venue address
 * @param {string[]} params.carriers - Array of carrier names (e.g., ['AT&T', 'Verizon'])
 * @returns {Promise<{success: boolean, screenshots: Array<{filename: string, buffer: string}>}>}
 */
export async function createRomAutomation({ address, carriers }) {
    const response = await fetch('/api/rom/automate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, carriers }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Automation failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Downloads a screenshot from base64 data
 * @param {string} filename - The filename for the download
 * @param {string} base64Data - The base64 encoded image data
 */
export function downloadScreenshot(filename, base64Data) {
    // Create a blob from the base64 data
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

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
