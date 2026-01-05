/**
 * Automation Service
 * Handles API communication with the automation backend
 */

/**
 * Get the automation API base URL from environment
 * @returns {string}
 */
export function getApiUrl() {
    return process.env.NEXT_PUBLIC_PLAYWRIGHT_BACKEND_URL || ''
}

/**
 * Get the streaming automation endpoint URL
 * @returns {string}
 */
export function getStreamEndpoint() {
    const baseUrl = getApiUrl()
    return baseUrl ? `${baseUrl}/api/automate/stream` : '/api/coverage-plot/automate/stream'
}

/**
 * Start automation with streaming progress updates
 * @param {Object} payload - Automation parameters
 * @param {string} payload.address - Venue address
 * @param {Array<string>} payload.carriers - Selected carriers
 * @param {Array<string>} payload.coverageTypes - Selected coverage types
 * @returns {Promise<Response>}
 */
export async function startAutomationStream(payload) {
    const url = getStreamEndpoint()
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
        throw new Error('Failed to start automation')
    }
    
    return response
}
