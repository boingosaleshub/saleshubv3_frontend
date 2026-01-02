/**
 * useScreenshotDownloader Hook
 * Custom hook for handling screenshot downloads
 */

import { useCallback } from 'react'
import { downloadScreenshots } from '../utils/downloadHelper'

export function useScreenshotDownloader() {
    const download = useCallback(async (screenshots) => {
        if (!screenshots || screenshots.length === 0) {
            throw new Error('No screenshots to download')
        }
        
        await downloadScreenshots(screenshots)
    }, [])
    
    return { download }
}
