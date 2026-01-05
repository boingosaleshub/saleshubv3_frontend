/**
 * useScreenshotUploader Hook
 * Custom hook for uploading screenshots to Supabase Storage
 */

import { useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { base64ToBlob } from '../utils/downloadHelper'

export function useScreenshotUploader() {
    const uploadScreenshots = useCallback(async (screenshots) => {
        if (!screenshots || screenshots.length === 0) {
            throw new Error('No screenshots to upload')
        }

        const supabase = createClient()
        const uploadedUrls = []

        for (let i = 0; i < screenshots.length; i++) {
            const screenshot = screenshots[i]
            
            try {
                console.log(`[${i + 1}/${screenshots.length}] Uploading: ${screenshot.filename}`)
                
                // Convert base64 to blob
                const blob = base64ToBlob(screenshot.buffer, 'image/png')
                
                // Generate unique filename with timestamp
                const timestamp = Date.now()
                const filename = `${timestamp}_${screenshot.filename}`
                
                // Upload to Supabase Storage
                const { data, error } = await supabase.storage
                    .from('coverage-plots')
                    .upload(filename, blob, {
                        contentType: 'image/png',
                        cacheControl: '3600',
                        upsert: false
                    })

                if (error) {
                    console.error(`Error uploading ${screenshot.filename}:`, error)
                    throw error
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('coverage-plots')
                    .getPublicUrl(filename)

                uploadedUrls.push({
                    filename: screenshot.filename,
                    url: publicUrl,
                    path: data.path
                })

                console.log(`✓ Uploaded: ${screenshot.filename} -> ${publicUrl}`)
            } catch (error) {
                console.error(`Failed to upload ${screenshot.filename}:`, error)
                throw error
            }
        }

        return uploadedUrls
    }, [])

    const saveCoveragePlot = useCallback(async ({ venueAddress, carriers, coverageTypes, screenshotUrls, userId }) => {
        if (!venueAddress || !carriers || !coverageTypes || !screenshotUrls || !userId) {
            throw new Error('Missing required fields for saving coverage plot')
        }

        const supabase = createClient()

        const { data, error } = await supabase
            .from('coverage_plots')
            .insert({
                user_id: userId,
                venue_address: venueAddress,
                carriers: carriers,
                coverage_types: coverageTypes,
                screenshot_urls: screenshotUrls
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving coverage plot to database:', error)
            throw error
        }

        console.log('✓ Saved coverage plot to database:', data)
        return data
    }, [])

    return { uploadScreenshots, saveCoveragePlot }
}
