/**
 * useRomProposalSaver Hook
 * Uploads ROM screenshots and Excel files to Supabase Storage,
 * then saves the complete ROM proposal record to the rom_proposals table.
 *
 * Follows the same pattern as the coverage-plot useScreenshotUploader hook.
 */

import { useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { base64ToBlob } from '@/app/coverage-plot/new-form/utils/downloadHelper'

const BUCKET_NAME = 'rom-proposals'
const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export function useRomProposalSaver() {
    /**
     * Upload screenshots (PNG images) to Supabase Storage
     * @param {Array<{filename: string, buffer: string}>} screenshots - base64 encoded screenshots
     * @returns {Promise<string[]>} Array of public URLs
     */
    const uploadScreenshots = useCallback(async (screenshots) => {
        if (!screenshots || screenshots.length === 0) return []

        const supabase = createClient()
        const uploadedUrls = []

        for (let i = 0; i < screenshots.length; i++) {
            const screenshot = screenshots[i]

            try {
                console.log(`[ROM Save] Uploading screenshot ${i + 1}/${screenshots.length}: ${screenshot.filename}`)

                const blob = base64ToBlob(screenshot.buffer, 'image/png')
                const timestamp = Date.now()
                const filename = `screenshots/${timestamp}_${screenshot.filename}`

                const { data, error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(filename, blob, {
                        contentType: 'image/png',
                        cacheControl: '3600',
                        upsert: false
                    })

                if (error) {
                    console.error(`[ROM Save] Error uploading screenshot ${screenshot.filename}:`, error)
                    throw error
                }

                const { data: { publicUrl } } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(filename)

                uploadedUrls.push(publicUrl)
                console.log(`[ROM Save] ✓ Screenshot uploaded: ${screenshot.filename}`)
            } catch (error) {
                console.error(`[ROM Save] Failed to upload screenshot ${screenshot.filename}:`, error)
                throw error
            }
        }

        return uploadedUrls
    }, [])

    /**
     * Upload Excel files to Supabase Storage
     * @param {Array<{filename: string, buffer: string}>} excelFiles - base64 encoded Excel files
     * @returns {Promise<string[]>} Array of public URLs
     */
    const uploadExcelFiles = useCallback(async (excelFiles) => {
        if (!excelFiles || excelFiles.length === 0) return []

        const supabase = createClient()
        const uploadedUrls = []

        for (let i = 0; i < excelFiles.length; i++) {
            const excelFile = excelFiles[i]

            try {
                console.log(`[ROM Save] Uploading Excel ${i + 1}/${excelFiles.length}: ${excelFile.filename}`)

                const blob = base64ToBlob(excelFile.buffer, EXCEL_MIME_TYPE)
                const timestamp = Date.now()
                const filename = `excel/${timestamp}_${excelFile.filename}`

                const { data, error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(filename, blob, {
                        contentType: EXCEL_MIME_TYPE,
                        cacheControl: '3600',
                        upsert: false
                    })

                if (error) {
                    console.error(`[ROM Save] Error uploading Excel ${excelFile.filename}:`, error)
                    throw error
                }

                const { data: { publicUrl } } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(filename)

                uploadedUrls.push(publicUrl)
                console.log(`[ROM Save] ✓ Excel uploaded: ${excelFile.filename}`)
            } catch (error) {
                console.error(`[ROM Save] Failed to upload Excel ${excelFile.filename}:`, error)
                throw error
            }
        }

        return uploadedUrls
    }, [])

    /**
     * Save the complete ROM proposal to the database.
     *
     * @param {Object} params
     * @param {string} params.userId - Auth user ID
     * @param {Object} params.venueInfo - All venue information fields
     * @param {Object} params.systemInfo - All system information fields
     * @param {string[]} params.screenshotUrls - Supabase Storage URLs for screenshots
     * @param {string[]} params.excelFileUrls - Supabase Storage URLs for Excel files
     * @param {string} [params.status='completed'] - Proposal status
     * @returns {Promise<Object>} The inserted row
     */
    const saveRomProposal = useCallback(async ({
        userId,
        venueInfo,
        systemInfo,
        screenshotUrls,
        excelFileUrls,
        status = 'completed'
    }) => {
        if (!userId) throw new Error('User ID is required to save ROM proposal')
        if (!venueInfo) throw new Error('Venue information is required')
        if (!systemInfo) throw new Error('System information is required')

        const supabase = createClient()

        const record = {
            user_id: userId,

            // Venue Information
            venue_name: venueInfo.venueName,
            venue_address: venueInfo.address,
            venue_type: venueInfo.venueType,
            num_floors: parseInt(venueInfo.numFloors),
            gross_sq_ft: parseFloat(venueInfo.grossSqFt),
            has_parking_garage: venueInfo.hasParkingGarage,
            parking_sq_ft: venueInfo.hasParkingGarage ? parseFloat(venueInfo.parkingSqFt) || null : null,
            pops: parseInt(venueInfo.pops),
            is_third_party: venueInfo.isThirdParty,
            third_party_name: venueInfo.isThirdParty ? venueInfo.thirdPartyName || null : null,
            third_party_fee: venueInfo.isThirdParty ? parseFloat(venueInfo.thirdPartyFee) || null : null,
            ahj_requirements: venueInfo.ahjRequirements || [],
            building_density: venueInfo.density,
            sales_manager: venueInfo.salesManager,
            construction_date: venueInfo.constructionDate,
            close_date: venueInfo.closeDate,
            on_air_date: venueInfo.onAirDate,
            latitude: venueInfo.coordinates?.lat || null,
            longitude: venueInfo.coordinates?.lng || null,
            zoom_level: venueInfo.zoom || null,

            // System Information
            system_type: systemInfo.systemType,
            das_architecture: systemInfo.dasArchitecture || null,
            oem_criteria: systemInfo.oemCriteria,
            das_vendor: systemInfo.dasVendor || null,
            bda_vendor: systemInfo.bdaVendor || null,
            erces_coverage: systemInfo.errcsCoverage || null,
            sector_criteria: systemInfo.sectorCriteria,
            num_sectors: parseInt(systemInfo.numSectors) || 3,
            signal_source: systemInfo.signalSource,
            carrier_requirements: systemInfo.carrierRequirements || [],
            tech_supported: systemInfo.techSupported || [],
            additional_info: systemInfo.additionalInfo || null,

            // Generated Files
            screenshot_urls: screenshotUrls || [],
            excel_file_urls: excelFileUrls || [],

            // Metadata
            status
        }

        const { data, error } = await supabase
            .from('rom_proposals')
            .insert(record)
            .select()
            .single()

        if (error) {
            console.error('[ROM Save] Error saving ROM proposal to database:', error)
            throw error
        }

        console.log('[ROM Save] ✓ ROM proposal saved to database:', data.id)
        return data
    }, [])

    /**
     * Complete save flow: upload all files then save the database record.
     * This is the main entry point called after ROM generation completes.
     *
     * @param {Object} params
     * @param {string} params.userId - Auth user ID
     * @param {Object} params.venueInfo - All venue information from the form
     * @param {Object} params.systemInfo - All system information from the form
     * @param {Array<{filename: string, buffer: string}>} params.screenshots - Base64 screenshots from automation
     * @param {Array<{filename: string, buffer: string}>} params.excelFiles - Base64 Excel files from generation
     * @returns {Promise<Object>} The saved ROM proposal record
     */
    const saveCompleteRomProposal = useCallback(async ({
        userId,
        venueInfo,
        systemInfo,
        screenshots,
        excelFiles
    }) => {
        console.log('[ROM Save] Starting complete ROM proposal save...')

        let screenshotUrls = []
        let excelFileUrls = []
        let status = 'completed'

        // 1. Upload screenshots to Supabase Storage
        try {
            screenshotUrls = await uploadScreenshots(screenshots || [])
            console.log(`[ROM Save] ${screenshotUrls.length} screenshots uploaded`)
        } catch (err) {
            console.error('[ROM Save] Screenshot upload failed:', err)
            status = 'partial'
        }

        // 2. Upload Excel files to Supabase Storage
        try {
            excelFileUrls = await uploadExcelFiles(excelFiles || [])
            console.log(`[ROM Save] ${excelFileUrls.length} Excel files uploaded`)
        } catch (err) {
            console.error('[ROM Save] Excel upload failed:', err)
            status = 'partial'
        }

        // 3. Save everything to the database
        const saved = await saveRomProposal({
            userId,
            venueInfo,
            systemInfo,
            screenshotUrls,
            excelFileUrls,
            status
        })

        console.log('[ROM Save] ✓ Complete ROM proposal save finished:', saved.id)
        return saved
    }, [uploadScreenshots, uploadExcelFiles, saveRomProposal])

    return {
        uploadScreenshots,
        uploadExcelFiles,
        saveRomProposal,
        saveCompleteRomProposal
    }
}
