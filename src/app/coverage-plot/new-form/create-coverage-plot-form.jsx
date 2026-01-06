"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Search, MapPin, Radio, Layers, ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"
import { useLanguage } from "@/components/providers/language-provider"
import { toast } from "sonner"
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

    // Field-level error state
    const [formErrors, setFormErrors] = useState({
        address: false,
        carrierRequirements: false,
        coverageType: false
    })

    // Animation state
    const [isTransitioning, setIsTransitioning] = useState(false)

    // Custom hooks
    const { progress, currentStep, stepVisible, isLoading, error, startAutomation, results, resetAutomation } = useAutomation()
    const { download } = useScreenshotDownloader()

    const debounceRef = useRef(null)
    const [isSearching, setIsSearching] = useState(false)

    // Watch for results from global context
    useEffect(() => {
        if (results && !showSuccessModal) {
            setShowSuccessModal(true)
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

        // Clear address error when user types
        setFormErrors(prev => ({ ...prev, address: false }))

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
        setFormErrors(prev => ({ ...prev, address: false }))
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

    // Animated step transition
    const transitionToStep = useCallback((nextStep) => {
        setIsTransitioning(true)
        setTimeout(() => {
            setStep(nextStep)
            window.scrollTo(0, 0)
            setTimeout(() => {
                setIsTransitioning(false)
            }, 50)
        }, 300)
    }, [])

    const handleAddressKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && address.trim()) {
            e.preventDefault()
            if (suggestions.length > 0) {
                handleSelectAddress(suggestions[0])
            }
            transitionToStep(2)
        }
    }, [address, suggestions, handleSelectAddress, transitionToStep])

    // Validation
    const validateForm = useCallback(() => {
        const errors = {
            address: !address.trim(),
            carrierRequirements: false,
            coverageType: false
        }

        const selectedCarriers = Object.entries(carrierRequirements)
            .filter(([_, checked]) => checked)
            .map(([carrier]) => carrier)

        if (selectedCarriers.length === 0) {
            errors.carrierRequirements = true
        }

        const selectedCoverageTypes = Object.entries(coverageType)
            .filter(([_, checked]) => checked)
            .map(([type]) => type)

        if (selectedCoverageTypes.length === 0) {
            errors.coverageType = true
        }

        setFormErrors(errors)

        if (errors.address || errors.carrierRequirements || errors.coverageType) {
            toast.error("Please fill in all mandatory fields.", {
                description: "Venue Address, Carrier Requirements, and Coverage Type are required."
            })
            return false
        }

        return { selectedCarriers, selectedCoverageTypes }
    }, [address, carrierRequirements, coverageType])

    // Authenticated User
    const { user } = useAuthStore()

    // Handle create
    const handleCreate = useCallback(async () => {
        const validation = validateForm()
        if (!validation) return

        const { selectedCarriers, selectedCoverageTypes } = validation

        setIsCreating(true)

        try {
            const userName = user?.user_metadata?.full_name || user?.email || 'Guest'
            const screenshots = await startAutomation({
                address: address.trim(),
                carriers: selectedCarriers,
                coverageTypes: selectedCoverageTypes
            }, userName)

            await download(screenshots)
            setShowSuccessModal(true)
        } catch (err) {
            toast.error(err.message || "Failed to generate screenshots")
        } finally {
            setIsCreating(false)
        }
    }, [address, validateForm, startAutomation, download, user, showSuccessModal])

    // Reset form
    const resetForm = useCallback(() => {
        resetAutomation() // Reset global state
        transitionToStep(1)
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
        setFormErrors({
            address: false,
            carrierRequirements: false,
            coverageType: false
        })
    }, [resetAutomation, transitionToStep])

    // Memoized carrier list
    const carrierList = useMemo(() => [CARRIERS.AT_T, CARRIERS.VERIZON, CARRIERS.T_MOBILE], [])
    const coverageTypeList = useMemo(() => [COVERAGE_TYPES.INDOOR, COVERAGE_TYPES.OUTDOOR, COVERAGE_TYPES.INDOOR_OUTDOOR], [])

    // Update error from hook
    useEffect(() => {
        if (error) {
            toast.error(error)
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
                        <div
                            className={`flex flex-1 items-center justify-center min-h-[60vh] transition-all duration-300 ease-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                                }`}
                        >
                            <div className="w-full max-w-3xl px-4 text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                                        <MapPin className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    Create New Coverage Plot
                                </h1>
                                <p className="text-sm md:text-base text-gray-400 mb-10">
                                    Enter the address below to start creating your new coverage plot.
                                </p>

                                <div className="flex flex-col items-start gap-3 max-w-2xl mx-auto">
                                    <div className="relative w-full group">
                                        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
                                        </div>
                                        <Input
                                            value={address}
                                            onChange={handleAddressChange}
                                            onKeyDown={handleAddressKeyDown}
                                            onBlur={handleBlur}
                                            placeholder="Type the venue full address"
                                            className="w-full rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-12 pr-12 h-14 text-base focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                                        />
                                        {address.trim() && (
                                            <button
                                                onClick={() => transitionToStep(2)}
                                                className="absolute inset-y-0 right-2 flex items-center px-3"
                                            >
                                                <div className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200">
                                                    <ArrowRight className="h-5 w-5 text-white" />
                                                </div>
                                            </button>
                                        )}
                                        {suggestions.length > 0 && (
                                            <div className="absolute w-full mt-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                                {suggestions.map((item, index) => (
                                                    <div
                                                        key={item.place_id}
                                                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer text-sm text-gray-700 dark:text-white border-b border-gray-100 dark:border-gray-800 last:border-0 truncate flex items-center gap-3 transition-colors duration-150 ${index === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''
                                                            }`}
                                                        onClick={() => {
                                                            handleSelectAddress(item)
                                                            transitionToStep(2)
                                                        }}
                                                    >
                                                        <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                                                        <span className="truncate">{item.display_name}</span>
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
                        <Card
                            className={`w-full bg-white dark:bg-[#1a1d21] shadow-xl border-0 dark:border dark:border-gray-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                                }`}
                        >
                            <div className="bg-gradient-to-r from-[#3D434A] to-[#4a5058] py-6 px-8 border-b-4 border-red-600 shrink-0">
                                <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
                                    <Layers className="h-7 w-7" />
                                    Coverage Plot
                                </h2>
                            </div>

                            <div className="flex flex-col lg:flex-row flex-1 min-h-[500px]">
                                {/* Left Column: Form */}
                                <div className="w-full lg:w-1/2 lg:border-r border-gray-100 dark:border-gray-800 p-6 lg:p-10">
                                    <div className="space-y-8">
                                        {/* Venue Address */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-red-500" />
                                                <Label className="text-gray-700 dark:text-gray-300 font-semibold text-base">
                                                    Venue Address <span className="text-red-500">*</span>
                                                </Label>
                                            </div>
                                            <div className="w-full">
                                                <Input
                                                    value={address}
                                                    onChange={handleAddressChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Type the venue full address"
                                                    className={`
                                                        bg-gray-100 dark:bg-gray-800 dark:text-gray-200 border-none rounded-xl px-4 py-3 w-full h-12 text-base 
                                                        transition-all duration-200
                                                        ${formErrors.address
                                                            ? 'ring-2 ring-red-500 focus:ring-red-500 placeholder:text-red-300'
                                                            : 'focus:ring-2 focus:ring-red-500'
                                                        }
                                                    `}
                                                />
                                                {suggestions.length > 0 && (
                                                    <div className="w-full mt-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-10 relative animate-in fade-in slide-in-from-top-2 duration-200">
                                                        {suggestions.map((item) => (
                                                            <div
                                                                key={item.place_id}
                                                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer text-sm text-gray-700 dark:text-white border-b border-gray-100 dark:border-gray-800 last:border-0 truncate flex items-center gap-3 transition-colors duration-150"
                                                                onClick={() => handleSelectAddress(item)}
                                                            >
                                                                <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                                                                <span className="truncate">{item.display_name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Carrier Requirements */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Radio className="h-5 w-5 text-red-500" />
                                                <Label className="text-gray-700 dark:text-gray-300 font-semibold text-base">
                                                    Carrier Requirements <span className="text-red-500">*</span>
                                                </Label>
                                            </div>
                                            <div className={`flex flex-wrap gap-4 p-4 rounded-xl transition-colors ${formErrors.carrierRequirements ? 'bg-red-50 dark:bg-red-900/10 border border-dashed border-red-300 dark:border-red-800' : ''}`}>
                                                {carrierList.map((carrier) => (
                                                    <div
                                                        key={carrier}
                                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${carrierRequirements[carrier]
                                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                : formErrors.carrierRequirements
                                                                    ? 'border-red-200 dark:border-red-800/50 hover:border-red-300'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                            }`}
                                                        onClick={() => {
                                                            setCarrierRequirements(p => ({ ...p, [carrier]: !p[carrier] }))
                                                            setFormErrors(prev => ({ ...prev, carrierRequirements: false }))
                                                        }}
                                                    >
                                                        <Checkbox
                                                            id={`carrier-${carrier}`}
                                                            checked={carrierRequirements[carrier]}
                                                            onCheckedChange={(checked) => {
                                                                setCarrierRequirements(p => ({ ...p, [carrier]: checked }))
                                                                setFormErrors(prev => ({ ...prev, carrierRequirements: false }))
                                                            }}
                                                            className="pointer-events-none"
                                                        />
                                                        <label htmlFor={`carrier-${carrier}`} className="text-sm font-medium leading-none text-gray-600 dark:text-gray-300 cursor-pointer">
                                                            {carrier}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Coverage Type */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Layers className="h-5 w-5 text-red-500" />
                                                <Label className="text-gray-700 dark:text-gray-300 font-semibold text-base">
                                                    Coverage Type <span className="text-red-500">*</span>
                                                </Label>
                                            </div>
                                            <div className={`flex flex-wrap gap-4 p-4 rounded-xl transition-colors ${formErrors.coverageType ? 'bg-red-50 dark:bg-red-900/10 border border-dashed border-red-300 dark:border-red-800' : ''}`}>
                                                {coverageTypeList.map((type) => (
                                                    <div
                                                        key={type}
                                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${coverageType[type]
                                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                : formErrors.coverageType
                                                                    ? 'border-red-200 dark:border-red-800/50 hover:border-red-300'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                            }`}
                                                        onClick={() => {
                                                            setCoverageType(p => ({ ...p, [type]: !p[type] }))
                                                            setFormErrors(prev => ({ ...prev, coverageType: false }))
                                                        }}
                                                    >
                                                        <Checkbox
                                                            id={`coverage-${type}`}
                                                            checked={coverageType[type]}
                                                            onCheckedChange={(checked) => {
                                                                setCoverageType(p => ({ ...p, [type]: checked }))
                                                                setFormErrors(prev => ({ ...prev, coverageType: false }))
                                                            }}
                                                            className="pointer-events-none"
                                                        />
                                                        <label htmlFor={`coverage-${type}`} className="text-sm font-medium leading-none text-gray-600 dark:text-gray-300 cursor-pointer">
                                                            {type}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Map */}
                                <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-gray-900 h-[400px] lg:h-auto lg:min-h-[500px] relative shrink-0">
                                    <CoverageMap lat={coordinates.lat} lng={coordinates.lng} zoom={zoom} />
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm z-40 text-gray-600 dark:text-gray-400 pointer-events-none">
                                        OpenStreetMap View
                                    </div>
                                </div>
                            </div>

                            {/* Footer: Create Button */}
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-center items-center bg-white dark:bg-[#1a1d21] shrink-0 relative">
                                <Button
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl px-10 py-3 h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isCreating ? "Creating..." : "Create Coverage Plot"}
                                </Button>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}