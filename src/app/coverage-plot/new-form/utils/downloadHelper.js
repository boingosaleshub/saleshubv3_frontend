/**
 * Download Helper Utilities
 * Handles screenshot downloads from base64 data
 */

/**
 * Convert base64 string to Blob
 * @param {string} base64 - Base64 encoded string
 * @param {string} type - MIME type (default: 'image/png')
 * @returns {Blob}
 */
export function base64ToBlob(base64, type = 'image/png') {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type })
}

/**
 * Download a blob as a file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, 100)
}

/**
 * Download a screenshot from base64 data
 * @param {Object} screenshot - Screenshot object with buffer and filename
 * @param {string} screenshot.buffer - Base64 encoded image
 * @param {string} screenshot.filename - Filename for download
 * @returns {Promise<void>}
 */
export async function downloadScreenshot(screenshot) {
    if (!screenshot.buffer || !screenshot.filename) {
        throw new Error('Invalid screenshot data')
    }
    
    const blob = base64ToBlob(screenshot.buffer)
    downloadBlob(blob, screenshot.filename)
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 300))
}

/**
 * Download multiple screenshots sequentially
 * @param {Array} screenshots - Array of screenshot objects
 * @returns {Promise<void>}
 */
export async function downloadScreenshots(screenshots) {
    if (!Array.isArray(screenshots) || screenshots.length === 0) {
        throw new Error('No screenshots to download')
    }
    
    for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i]
        
        try {
            console.log(`[${i + 1}/${screenshots.length}] Downloading: ${screenshot.filename}`)
            await downloadScreenshot(screenshot)
            console.log(`✓ Downloaded: ${screenshot.filename}`)
        } catch (error) {
            console.error(`Error downloading ${screenshot.filename}:`, error)
        }
    }
}
