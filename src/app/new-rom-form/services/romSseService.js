/**
 * ROM SSE Service
 * Handles Server-Sent Events streaming for ROM automation
 */

/**
 * Get the automation API base URL from environment
 * @returns {string}
 */
function getApiUrl() {
    return process.env.NEXT_PUBLIC_PLAYWRIGHT_BACKEND_URL || ''
}

/**
 * Get the ROM automation stream endpoint URL
 * @returns {string}
 */
function getRomStreamEndpoint() {
    const baseUrl = getApiUrl()
    return baseUrl ? `${baseUrl}/api/rom/automate/stream` : '/api/rom/automate/stream'
}

/**
 * Start ROM automation with SSE streaming
 * @param {Object} payload - The automation parameters
 * @param {string} payload.address - The venue address
 * @param {string[]} payload.carriers - Array of carrier names
 * @param {string} payload.systemType - The system type (DAS, ERCES, DAS & ERCES)
 * @param {string} payload.dasVendor - The DAS vendor
 * @param {string} payload.bdaVendor - The BDA/Booster vendor
 * @param {string|number} payload.grossSqFt - The gross square footage
 * @returns {Promise<Response>} The fetch response for SSE streaming
 */
export async function startRomAutomationStream(payload) {
    const url = getRomStreamEndpoint()
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `ROM automation failed with status ${response.status}`)
    }

    return response
}
