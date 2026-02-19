/**
 * SSE Client
 * Factory for creating Server-Sent Events connections
 */

/**
 * Create an SSE connection and handle progress updates
 * @param {Response} response - Fetch response object with SSE stream
 * @param {Function} onProgress - Callback for progress updates (progress, step, status)
 * @param {Function} onComplete - Callback when automation completes (finalData)
 * @param {Function} onError - Callback for errors (error)
 * @returns {Promise<void>}
 */
export async function createSSEConnection(response, onProgress, onComplete, onError) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    console.log('[SSE] Connection established, starting to read stream...')
    
    try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) {
                console.log('[SSE] Stream ended')
                break
            }
            
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.slice(6)
                        console.log('[SSE] Received data:', jsonStr)
                        const data = JSON.parse(jsonStr)
                        
                        if (data.final) {
                            // Final response with screenshots
                            console.log('[SSE] Final data received:', data)
                            onComplete(data)
                            return
                        } else if (data.status === 'error') {
                            console.error('[SSE] Error status received:', data.step)
                            onError(new Error(data.step))
                            return
                        } else {
                            // Progress update
                            console.log(`[SSE] Progress: ${data.progress}% - ${data.step}`)
                            // #region agent log
                            fetch('http://127.0.0.1:7243/ingest/34d748ff-628f-42e2-b92c-c8daf6c96a9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sseClient.js:onProgress',message:'Calling onProgress callback',data:{progress:data.progress,step:data.step,status:data.status},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
                            // #endregion
                            onProgress(data.progress, data.step, data.status)
                        }
                    } catch (e) {
                        console.error('[SSE] Error parsing SSE data:', e, 'Line:', line)
                    }
                }
            }
        }
    } catch (error) {
        console.error('[SSE] Stream error:', error)
        onError(error)
    }
}
