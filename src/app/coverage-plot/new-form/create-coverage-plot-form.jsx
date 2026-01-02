"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"
import dynamic from "next/dynamic"
import { useLanguage } from "@/components/providers/language-provider"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Components
import { LoadingOverlay } from "./components/LoadingOverlay"

// Hooks
import { useAutomation } from "@/components/providers/automation-provider"
import { useScreenshotDownloader } from "./hooks/useScreenshotDownloader"

// Constants
import { CARRIERS, COVERAGE_TYPES, VALIDATION_MESSAGES, DEFAULT_COORDINATES, DEFAULT_ZOOM } from "./utils/constants"

// Store
import { useAuthStore } from '@/store/useAuthStore'

const CoverageMap = dynamic(() => import("./coverage-map"), {
    ssr: false,
    loading: () => null
})

export function CreateCoveragePlotForm() {
    const { t } = useLanguage()

    // Form state
    const [step, setStep] = useState(1)
    const [address, setAddress] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [coordinates, setCoordinates] = useState(DEFAULT_COORDINATES)
    const [zoom, setZoom] = useState(DEFAULT_ZOOM)

    const [carrierRequirements, setCarrierRequirements] = useState({
        [CARRIERS.AT_T]: false,
        [CARRIERS.VERIZON]: false,
        [CARRIERS.T_MOBILE]: false
    })

    const [coverageType, setCoverageType] = useState({
        [COVERAGE_TYPES.INDOOR]: false,
        [COVERAGE_TYPES.OUTDOOR]: false,
        [COVERAGE_TYPES.INDOOR_OUTDOOR]: false
    })

    const [isCreating, setIsCreating] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    // Custom hooks
    const { progress, currentStep, stepVisible, isLoading, error, startAutomation, results, resetAutomation } = useAutomation()
    const { download } = useScreenshotDownloader()

    const debounceRef = useRef(null)
    const [isSearching, setIsSearching] = useState(false)

    // Watch for results from global context (in case we navigated away and back)
    useEffect(() => {
        if (results && !showSuccessModal) {
            setShowSuccessModal(true)
            // Optional: trigger download again if needed, or assume it happened? 
            // Browser might block auto-download on mount without user interaction.
            // Better to rely on "Download" button in modal if we add one, or just re-trigger:
            download(results).catch(console.error)
        }
    }, [results, download, showSuccessModal])

    // Address search
    const searchAddress = useCallback(async (query) => {
        if (!query || query.length < 3) return
        setIsSearching(true)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
            const data = await res.json()
            setSuggestions(data || [])
        } catch (error) {
            console.error("Error fetching address suggestions:", error)
        } finally {
            setIsSearching(false)
        }
    }, [])

    const handleAddressChange = useCallback((e) => {
        const value = e.target.value
        setAddress(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (value.length > 2) {
            debounceRef.current = setTimeout(() => {
                searchAddress(value)
            }, 300)
        } else {
            setSuggestions([])
        }
    }, [searchAddress])

    const handleSelectAddress = useCallback((item) => {
        setAddress(item.display_name)
        setSuggestions([])
        const lat = parseFloat(item.lat)
        const lon = parseFloat(item.lon)
        setCoordinates({ lat, lng: lon })
        setZoom(16)
    }, [])

    useEffect(() => {
        if (suggestions.length > 0) {
            const item = suggestions[0]
            const lat = parseFloat(item.lat)
            const lon = parseFloat(item.lon)
            setCoordinates({ lat, lng: lon })
            setZoom(15)
        }
    }, [suggestions])

    const handleBlur = useCallback(() => {
        setTimeout(() => {
            setSuggestions([])
        }, 200)
    }, [])

    const handleAddressKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && address.trim()) {
            e.preventDefault()
            if (suggestions.length > 0) {
                handleSelectAddress(suggestions[0])
            }
            setStep(2)
            window.scrollTo(0, 0)
        }
    }, [address, suggestions, handleSelectAddress])

    // Validation
    const validateForm = useCallback(() => {
        if (!address.trim()) {
            setErrorMessage(VALIDATION_MESSAGES.ADDRESS_REQUIRED)
            return false
        }

        const selectedCarriers = Object.entries(carrierRequirements)
            .filter(([_, checked]) => checked)
            .map(([carrier]) => carrier)

        if (selectedCarriers.length === 0) {
            setErrorMessage(VALIDATION_MESSAGES.CARRIER_REQUIRED)
            return false
        }

        const selectedCoverageTypes = Object.entries(coverageType)
            .filter(([_, checked]) => checked)
            .map(([type]) => type)

        if (selectedCoverageTypes.length === 0) {
            setErrorMessage(VALIDATION_MESSAGES.COVERAGE_TYPE_REQUIRED)
            return false
        }

        return { selectedCarriers, selectedCoverageTypes }
    }, [address, carrierRequirements, coverageType])

    // Authenticated User
    const { user } = useAuthStore()

    // Handle create
    const handleCreate = useCallback(async () => {
        setErrorMessage("")

        const validation = validateForm()
        if (!validation) return

        const { selectedCarriers, selectedCoverageTypes } = validation

        setIsCreating(true)

        try {
            const userName = user?.user_metadata?.full_name || user?.email || 'Guest'
            // We only trigger startAutomation here.
            // Screen download and modal show will be handled by the useEffect watching 'results'
            // OR by looking at the promise result if we stay on page.
            // But to be consistent, let's rely on the state update?
            // Actually, waiting for promise here is fine for "stay on page" UX.

            const screenshots = await startAutomation({
                address: address.trim(),
                carriers: selectedCarriers,
                coverageTypes: selectedCoverageTypes
            }, userName)

            // If we are still here, these will run.
            // If we navigated away, the component unmounted, and these won't run.
            // But the 'results' in context will update.
            // When we come back, the useEffect will run.

            // Valid redundancy?
            // If we do it here, we might double download if useEffect also fires.
            // useEffect checks if (!showSuccessModal).
            // So if we set it here to true, useEffect won't run.

            await download(screenshots)
            setShowSuccessModal(true)
        } catch (err) {
            setErrorMessage(err.message || "Failed to generate screenshots")
        } finally {
            setIsCreating(false)
        }
    }, [address, validateForm, startAutomation, download, user, showSuccessModal])

    // Reset form
    const resetForm = useCallback(() => {
        resetAutomation() // Reset global state
        setStep(1)
        setAddress("")
        setCarrierRequirements({
            [CARRIERS.AT_T]: false,
            [CARRIERS.VERIZON]: false,
            [CARRIERS.T_MOBILE]: false
        })
        setCoverageType({
            [COVERAGE_TYPES.INDOOR]: false,
            [COVERAGE_TYPES.OUTDOOR]: false,
            [COVERAGE_TYPES.INDOOR_OUTDOOR]: false
        })
    }, [resetAutomation])

    // Memoized carrier list
    const carrierList = useMemo(() => [CARRIERS.AT_T, CARRIERS.VERIZON, CARRIERS.T_MOBILE], [])
    const coverageTypeList = useMemo(() => [COVERAGE_TYPES.INDOOR, COVERAGE_TYPES.OUTDOOR, COVERAGE_TYPES.INDOOR_OUTDOOR], [])

    // Update error from hook
    useEffect(() => {
        if (error) {
            setErrorMessage(error)
        }
    }, [error])

    return (
        <div className="w-full relative" style={{ minHeight: 'calc(100vh - 8rem)' }}>
            {/* Loading Overlay */}
            <LoadingOverlay
                isLoading={isLoading}
                progress={progress}
                currentStep={currentStep}
                stepVisible={stepVisible}
            />

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={(open) => {
                setShowSuccessModal(open)
                if (!open) resetForm()
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Success!</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Snapshots of coverage plot for <strong>{address}</strong> has been downloaded
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center pt-4">
                        <Button
                            onClick={() => {
                                setShowSuccessModal(false)
                                resetForm()
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Page Content */}
            {!isLoading && (
                <>
                    {step === 1 ? (
                        // Step 1: Initial address input
                        <div className="flex flex-1 items-center justify-center min-h-[60vh]">
                            <div className="w-full max-w-3xl px-4 text-center">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    Create New Coverage Plot
                                </h1>
                                <p className="text-sm md:text-base text-gray-400 mb-10">
                                    Enter the address below to start creating your new coverage plot.
                                </p>

                                <div className="flex flex-col items-start gap-3 max-w-2xl mx-auto">
                                    <Label className="text-gray-700 font-medium">
                                        Venue Address
                                    </Label>
                                    <div className="relative w-full">
                                        <Input
                                            value={address}
                                            onChange={handleAddressChange}
                                            onKeyDown={handleAddressKeyDown}
                                            onBlur={handleBlur}
                                            placeholder="Type the venue full address"
                                            className="w-full rounded-full bg-gray-50 border border-gray-200 pl-4 pr-11 h-11 text-sm md:text-base"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                            <Search className="h-4 w-4 text-gray-500" />
                                        </div>
                                        {suggestions.length > 0 && (
                                            <div className="w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden z-10 relative">
                                                {suggestions.map((item) => (
                                                    <div
                                                        key={item.place_id}
                                                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-xs text-gray-700 border-b border-gray-100 last:border-0 truncate"
                                                        onClick={() => {
                                                            handleSelectAddress(item)
                                                            setStep(2)
                                                        }}
                                                    >
                                                        {item.display_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Step 2: Expanded form
                        <Card className="w-full bg-white shadow-lg border-0 rounded-xl flex flex-col">
                            <div className="bg-[#3D434A] py-4 px-8 border-b-4 border-red-600 shrink-0 rounded-t-xl">
                                <h2 className="text-2xl font-bold text-white text-center">
                                    Coverage Plot
                                </h2>
                            </div>

                            <div className="flex flex-col lg:flex-row flex-1">
                                {/* Left Column: Form */}
                                <div className="w-full lg:w-1/2 lg:border-r border-gray-100 p-4 lg:p-8">
                                    <div className="space-y-6 pb-8">
                                        {/* Venue Address */}
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                                            <Label className="text-gray-600 font-medium sm:pt-2 whitespace-nowrap">Venue Address</Label>
                                            <div className="w-full">
                                                <Input
                                                    value={address}
                                                    onChange={handleAddressChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Type the venue full address"
                                                    className="bg-gray-100 border-none rounded-full px-4 w-full"
                                                />
                                                {suggestions.length > 0 && (
                                                    <div className="w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden z-10 relative">
                                                        {suggestions.map((item) => (
                                                            <div
                                                                key={item.place_id}
                                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-xs text-gray-700 border-b border-gray-100 last:border-0 truncate"
                                                                onClick={() => handleSelectAddress(item)}
                                                            >
                                                                {item.display_name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Carrier Requirements */}
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                                            <Label className="text-gray-600 font-medium sm:pt-1 whitespace-nowrap">Carrier Requirements</Label>
                                            <div className="flex flex-wrap gap-4 sm:gap-6">
                                                {carrierList.map((carrier) => (
                                                    <div key={carrier} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`carrier-${carrier}`}
                                                            checked={carrierRequirements[carrier]}
                                                            onCheckedChange={(checked) => setCarrierRequirements(p => ({ ...p, [carrier]: checked }))}
                                                        />
                                                        <label htmlFor={`carrier-${carrier}`} className="text-sm font-medium leading-none text-gray-500 cursor-pointer">
                                                            {carrier}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Coverage Type */}
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                                            <Label className="text-gray-600 font-medium sm:pt-1 whitespace-nowrap">Coverage type</Label>
                                            <div className="flex flex-wrap gap-4 sm:gap-6">
                                                {coverageTypeList.map((type) => (
                                                    <div key={type} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`coverage-${type}`}
                                                            checked={coverageType[type]}
                                                            onCheckedChange={(checked) => setCoverageType(p => ({ ...p, [type]: checked }))}
                                                        />
                                                        <label htmlFor={`coverage-${type}`} className="text-sm font-medium leading-none text-gray-500 cursor-pointer">
                                                            {type}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {errorMessage && (
                                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                                {errorMessage}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Map */}
                                <div className="w-full lg:w-1/2 bg-gray-50 h-[300px] lg:h-auto relative shrink-0">
                                    <CoverageMap lat={coordinates.lat} lng={coordinates.lng} zoom={zoom} />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold shadow-sm z-40 text-gray-500 pointer-events-none">
                                        OpenStreetMap View
                                    </div>
                                </div>
                            </div>

                            {/* Footer: Create Button */}
                            <div className="p-4 border-t border-gray-100 flex justify-center items-center bg-white shrink-0 relative rounded-b-xl">
                                <Button
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? "Creating..." : "Create"}
                                </Button>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}