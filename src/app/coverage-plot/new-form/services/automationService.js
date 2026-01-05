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
 * Get the job status endpoint URL
 * @param {string} jobId - Job identifier
 * @returns {string}
 */
export function getJobStatusEndpoint(jobId) {
    const baseUrl = getApiUrl()
    return baseUrl ? `${baseUrl}/api/automate/status/${jobId}` : `/api/coverage-plot/automate/status/${jobId}`
}

/**
 * Start automation with streaming progress updates
 * @param {Object} payload - Automation parameters
 * @param {string} payload.address - Venue address
 * @param {Array<string>} payload.carriers - Selected carriers
 * @param {Array<string>} payload.coverageTypes - Selected coverage types
 * @returns {Promise<{response: Response, jobId: string}>}
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
    
    // Backend should return jobId in response headers or initial SSE message
    // For now, we'll extract from headers if available, otherwise generate client-side
    const jobId = response.headers.get('X-Job-Id') || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return { response, jobId }
}

/**
 * Check job status by polling the backend
 * @param {string} jobId - Job identifier
 * @returns {Promise<{status: string, progress: number, step: string, result?: any, error?: string}>}
 */
export async function checkJobStatus(jobId) {
    const url = getJobStatusEndpoint(jobId)
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to check job status')
        }
        
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error checking job status:', error)
        throw error
    }
}
