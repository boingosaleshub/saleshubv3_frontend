"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { useLanguage } from "@/components/providers/language-provider"
import {
    Building2,
    MapPin,
    Layers,
    ParkingCircle,
    Users,
    Handshake,
    Radio,
    BarChart3,
    Calendar,
    Settings2,
    Cpu,
    Signal,
    Wifi,
    FileText,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    ArrowRight,
    Search,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/store/useAuthStore"
import { useAutomationStore } from "@/store/useAutomationStore"

// Components
import { LoadingOverlay } from "./components/LoadingOverlay"

// Hooks
import { useRomAutomation } from "@/components/providers/rom-automation-provider"

// Dynamically import the map to avoid SSR issues
const RomMap = dynamic(() => import("./rom-map"), {
    ssr: false,
    loading: () => null
})

// Animated form field wrapper component
function AnimatedField({ children, delay = 0, className = "" }) {
    return (
        <div
            className={`animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both ${className}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}

// Section header component with enhanced animations
function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div className="flex items-center gap-3 pb-3 mb-6 border-b border-gray-100 dark:border-zinc-800 group">
            <div className="relative w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                <Icon className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-6" />
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-200">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    )
}

// Helper to extract venue name from address
function extractVenueName(displayName) {
    // Take the first part of the address (before the first comma)
    const parts = displayName.split(',')
    return parts[0]?.trim() || displayName
}

export function CreateRomForm() {
    const { t } = useLanguage()
    const { user } = useAuthStore()
    const { startRomAutomation, stopRomAutomation, isRomAutomationRunning } = useAutomationStore()

    // ROM Automation hook (for loading overlay and SSE progress)
    const {
        progress,
        currentStep,
        stepVisible,
        isLoading,
        error: automationError,
        startAutomation,
        resetAutomation,
        results
    } = useRomAutomation()

    // Screen State: 0 = Initial Address Search, 1 = Venue Info (Step 1), 2 = System Info (Step 2)
    const [screen, setScreen] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    // --- FORM STATE (Persists across screens) ---
    // Venue Info
    const [venueName, setVenueName] = useState("")
    const [venueType, setVenueType] = useState("")
    const [numFloors, setNumFloors] = useState("")
    const [grossSqFt, setGrossSqFt] = useState("")
    const [hasParkingGarage, setHasParkingGarage] = useState(true)
    const [parkingSqFt, setParkingSqFt] = useState("")
    const [pops, setPops] = useState("")
    const [isThirdParty, setIsThirdParty] = useState(false)
    const [thirdPartyName, setThirdPartyName] = useState("")
    const [thirdPartyFee, setThirdPartyFee] = useState("")
    // AHJ
    const [ahjRequirements, setAhjRequirements] = useState({
        "700MHz": false,
        "850MHz": false,
        "450MHz": false
    })
    const [density, setDensity] = useState("")
    const [salesManager, setSalesManager] = useState("")
    const [closeDate, setCloseDate] = useState("")
    const [constructionDate, setConstructionDate] = useState("")
    const [onAirDate, setOnAirDate] = useState("")

    // Address & Map State
    const [address, setAddress] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060 })
    const [zoom, setZoom] = useState(13)

    // System Info (Screen 2)
    const [systemType, setSystemType] = useState("") // DAS, ERCES, DAS & ERCES
    const [dasArchitecture, setDasArchitecture] = useState("")
    const [oemCriteria, setOemCriteria] = useState("")
    const [dasVendor, setDasVendor] = useState("")
    const [bdaVendor, setBdaVendor] = useState("")
    const [errcsCoverage, setErrcsCoverage] = useState("")
    const [sectorCriteria, setSectorCriteria] = useState("")
    const [numSectors, setNumSectors] = useState("3 sectors") // Default/Placeholder
    const [signalSource, setSignalSource] = useState("")
    const [carrierRequirements, setCarrierRequirements] = useState({
        "AT&T": false,
        "Verizon": false,
        "T-Mobile": false
    })
    const [techSupported, setTechSupported] = useState({
        "4G LTE": false,
        "4G LTE & 5G NR": false
    })
    const [additionalInfo, setAdditionalInfo] = useState("")

    // ROM Automation State (local states for success modal)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [romError, setRomError] = useState("")

    // Field-level error state for form validation
    const [formErrors, setFormErrors] = useState({
        venueName: false,
        address: false,
        venueType: false,
        numFloors: false,
        grossSqFt: false,
        parkingSqFt: false,
        pops: false,
        thirdPartyName: false,
        thirdPartyFee: false,
        density: false,
        salesManager: false,
        closeDate: false,
        constructionDate: false,
        onAirDate: false,
        systemType: false,
        dasArchitecture: false,
        oemCriteria: false,
        dasVendor: false,
        bdaVendor: false,
        errcsCoverage: false,
        sectorCriteria: false,
        signalSource: false,
        carrierRequirements: false,
        techSupported: false,
        dateOrder: false
    })

    // --- LOGIC ---
    const debounceRef = useRef(null)
    const [isSearching, setIsSearching] = useState(false)

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
        setVenueName(extractVenueName(item.display_name))
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

    // Animated screen transition
    const transitionToScreen = useCallback((nextScreen) => {
        setIsTransitioning(true)
        setTimeout(() => {
            setScreen(nextScreen)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setTimeout(() => setIsTransitioning(false), 50)
        }, 300)
    }, [])

    // Handle keyboard enter on initial address input
    const handleAddressKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && address.trim()) {
            e.preventDefault()
            if (suggestions.length > 0) {
                handleSelectAddress(suggestions[0])
            }
            // Also set venue name from raw address if no suggestions were selected
            if (!venueName) {
                setVenueName(extractVenueName(address))
            }
            transitionToScreen(1)
        }
    }, [address, suggestions, handleSelectAddress, venueName, transitionToScreen])

    // Get selected carriers as an array
    const getSelectedCarriers = useCallback(() => {
        return Object.entries(carrierRequirements)
            .filter(([_, isSelected]) => isSelected)
            .map(([carrier]) => carrier)
    }, [carrierRequirements])

    // Watch for results from global context (downloads handled by provider)
    useEffect(() => {
        if (results && !showSuccessModal) {
            setShowSuccessModal(true)
        }
    }, [results, showSuccessModal])

    // Update error from hook
    useEffect(() => {
        if (automationError) {
            toast.error(automationError)
            setRomError(automationError)
        }
    }, [automationError])

    // Comprehensive form validation
    const validateForm = useCallback(() => {
        const errors = {
            venueName: !venueName.trim(),
            address: !address.trim(),
            venueType: !venueType,
            numFloors: !numFloors,
            grossSqFt: !grossSqFt,
            parkingSqFt: hasParkingGarage && !parkingSqFt,
            pops: !pops,
            thirdPartyName: isThirdParty && !thirdPartyName.trim(),
            thirdPartyFee: isThirdParty && !thirdPartyFee,
            density: !density,
            salesManager: !salesManager.trim(),
            closeDate: !closeDate,
            constructionDate: !constructionDate,
            onAirDate: !onAirDate,
            systemType: !systemType,
            dasArchitecture: (systemType === 'DAS' || systemType === 'DAS & ERCES') && !dasArchitecture,
            oemCriteria: !oemCriteria,
            dasVendor: (systemType === 'DAS' || systemType === 'DAS & ERCES') && !dasVendor,
            bdaVendor: (systemType === 'ERCES' || systemType === 'DAS & ERCES') && !bdaVendor,
            errcsCoverage: (systemType === 'ERCES' || systemType === 'DAS & ERCES') && !errcsCoverage,
            sectorCriteria: !sectorCriteria,
            signalSource: !signalSource,
            carrierRequirements: false,
            techSupported: false,
            dateOrder: false
        }

        // Check at least one carrier is selected
        const selectedCarriers = Object.entries(carrierRequirements)
            .filter(([_, isSelected]) => isSelected)
            .map(([carrier]) => carrier)
        if (selectedCarriers.length === 0) {
            errors.carrierRequirements = true
        }

        // Check at least one tech is selected
        const selectedTech = Object.entries(techSupported)
            .filter(([_, isSelected]) => isSelected)
            .map(([tech]) => tech)
        if (selectedTech.length === 0) {
            errors.techSupported = true
        }

        // Date order validation: Construction Start Date → Close Date → On Air Date
        if (constructionDate && closeDate) {
            const constructionDateObj = new Date(constructionDate)
            const closeDateObj = new Date(closeDate)
            if (closeDateObj < constructionDateObj) {
                errors.closeDate = true
                errors.dateOrder = true
            }
        }

        if (closeDate && onAirDate) {
            const closeDateObj = new Date(closeDate)
            const onAirDateObj = new Date(onAirDate)
            if (onAirDateObj < closeDateObj) {
                errors.onAirDate = true
                errors.dateOrder = true
            }
        }

        if (constructionDate && onAirDate) {
            const constructionDateObj = new Date(constructionDate)
            const onAirDateObj = new Date(onAirDate)
            if (onAirDateObj < constructionDateObj) {
                errors.onAirDate = true
                errors.dateOrder = true
            }
        }

        setFormErrors(errors)

        // Check if any error exists
        const hasErrors = Object.values(errors).some(error => error)
        if (hasErrors) {
            if (errors.dateOrder) {
                toast.error("Invalid date order.", {
                    description: "Expected order: Construction Start Date → Close Date → On Air Date"
                })
            } else {
                toast.error("Please fill in all mandatory fields.", {
                    description: "All fields in the form are required."
                })
            }
            return null
        }

        return { selectedCarriers }
    }, [
        venueName, address, venueType, numFloors, grossSqFt, hasParkingGarage, parkingSqFt,
        pops, isThirdParty, thirdPartyName, thirdPartyFee, density, salesManager,
        closeDate, constructionDate, onAirDate, systemType, dasArchitecture, oemCriteria,
        dasVendor, bdaVendor, errcsCoverage, sectorCriteria, signalSource,
        carrierRequirements, techSupported
    ])

    // Handle ROM Creation (automation)
    const handleCreateRom = useCallback(async () => {
        // Reset previous states
        setRomError("")

        // Run comprehensive validation
        const validation = validateForm()
        if (!validation) return

        const { selectedCarriers } = validation

        // Get user info for process tracking
        const userName = user?.user_metadata?.full_name || user?.email || 'Guest'
        const userId = user?.id || `guest_${Date.now()}`

        // Track in persistent store (shows in process queue and notification bell)
        startRomAutomation(userName, userId)

        try {
            const result = await startAutomation({
                address: address.trim(),
                carriers: selectedCarriers,
                systemType,
                dasVendor,
                bdaVendor,
                grossSqFt: grossSqFt || 0
            }, userName)

            if (result.success || result.partialSuccess) {
                // Downloads are triggered by the provider's onComplete callback
                // (provider is at layout level, so it persists across navigation)
                setShowSuccessModal(true)

                // Show partial success message if applicable
                if (result.partialSuccess) {
                    console.warn("ROM automation partial success:", result.error)
                    toast.warning("ROM created with partial success. Some files may be missing.")
                }
            } else {
                throw new Error(result.error || "Automation failed")
            }
        } catch (error) {
            console.error("ROM automation error:", error)
            setRomError(error.message || "Failed to create ROM. Please try again.")
            toast.error(error.message || "Failed to create ROM. Please try again.")
        } finally {
            stopRomAutomation()
        }
    }, [validateForm, address, systemType, dasVendor, bdaVendor, grossSqFt, user, startAutomation, startRomAutomation, stopRomAutomation])

    // Navigation Handlers
    const handleNext = useCallback(() => {
        if (screen === 1) {
            transitionToScreen(2)
        } else if (screen === 2) {
            // Trigger ROM automation on Create button click
            handleCreateRom()
        }
    }, [screen, transitionToScreen, handleCreateRom])

    const handleBack = useCallback(() => {
        if (screen === 2) {
            transitionToScreen(1)
        } else if (screen === 1) {
            transitionToScreen(0)
        }
    }, [screen, transitionToScreen])

    // Reset form
    const resetForm = useCallback(() => {
        resetAutomation() // Reset global state
        transitionToScreen(0)
        setAddress("")
        setVenueName("")
        setVenueType("")
        setNumFloors("")
        setGrossSqFt("")
        setHasParkingGarage(true)
        setParkingSqFt("")
        setPops("")
        setIsThirdParty(false)
        setThirdPartyName("")
        setThirdPartyFee("")
        setAhjRequirements({ "700MHz": false, "850MHz": false, "450MHz": false })
        setDensity("")
        setSalesManager("")
        setCloseDate("")
        setConstructionDate("")
        setOnAirDate("")
        setSystemType("")
        setDasArchitecture("")
        setOemCriteria("")
        setDasVendor("")
        setBdaVendor("")
        setErrcsCoverage("")
        setSectorCriteria("")
        setNumSectors("3 sectors")
        setSignalSource("")
        setCarrierRequirements({ "AT&T": false, "Verizon": false, "T-Mobile": false })
        setTechSupported({ "4G LTE": false, "4G LTE & 5G NR": false })
        setAdditionalInfo("")
        setRomError("")
        setFormErrors({
            venueName: false,
            address: false,
            venueType: false,
            numFloors: false,
            grossSqFt: false,
            parkingSqFt: false,
            pops: false,
            thirdPartyName: false,
            thirdPartyFee: false,
            density: false,
            salesManager: false,
            closeDate: false,
            constructionDate: false,
            onAirDate: false,
            systemType: false,
            dasArchitecture: false,
            oemCriteria: false,
            dasVendor: false,
            bdaVendor: false,
            errcsCoverage: false,
            sectorCriteria: false,
            signalSource: false,
            carrierRequirements: false,
            techSupported: false,
            dateOrder: false
        })
    }, [resetAutomation, transitionToScreen])

    // Conditional Visibility Helpers
    const showDasFields = systemType === "DAS" || systemType === "DAS & ERCES"
    const showErrcsFields = systemType === "ERCES" || systemType === "DAS & ERCES"

    // Screen 0: Initial Address Search (like coverage plot)
    if (screen === 0) {
        return (
            <div className="w-full relative" style={{ minHeight: 'calc(100vh - 8rem)' }}>
                {/* Loading Overlay - Show if automation is running (from context or persistent store) */}
                <LoadingOverlay
                    isLoading={isLoading || isRomAutomationRunning}
                    progress={progress}
                    currentStep={currentStep || (isRomAutomationRunning ? 'ROM automation in progress...' : '')}
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
                                ROM files for <strong>{address}</strong> have been downloaded
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

                {!isLoading && !isRomAutomationRunning && (
                    <div
                        className={`flex flex-1 items-center justify-center min-h-[60vh] transition-all duration-300 ease-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                            }`}
                    >
                        <div className="w-full max-w-3xl px-4 text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                                    <Building2 className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Create New ROM
                            </h1>
                            <p className="text-sm md:text-base text-gray-400 mb-10">
                                Enter the venue address below to start creating your ROM.
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
                                            onClick={() => {
                                                if (!venueName) {
                                                    setVenueName(extractVenueName(address))
                                                }
                                                transitionToScreen(1)
                                            }}
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
                                                        transitionToScreen(1)
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
                )}
            </div>
        )
    }

    // Screens 1 & 2: Form Steps
    return (
        <div className="w-full relative" style={{ minHeight: 'calc(100vh - 8rem)' }}>
            {/* Loading Overlay - Show if automation is running (from context or persistent store) */}
            <LoadingOverlay
                isLoading={isLoading || isRomAutomationRunning}
                progress={progress}
                currentStep={currentStep || (isRomAutomationRunning ? 'ROM automation in progress...' : '')}
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
                            ROM files for <strong>{address}</strong> have been downloaded
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

            {!isLoading && !isRomAutomationRunning && (
                <Card className="w-full bg-white dark:bg-zinc-900 shadow-xl border-0 dark:border dark:border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
                    {/* Enhanced Header with Step Indicator */}
                    <div className="bg-gradient-to-r from-[#3D434A] to-[#4a5058] dark:from-zinc-950 dark:to-zinc-900 py-6 px-8 border-b-4 border-red-600 shrink-0">
                        <div className="flex items-center justify-center gap-4">
                            <div className="hidden sm:flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${screen === 1 ? 'bg-red-600 text-white scale-110' : 'bg-white/20 text-white/70'
                                    }`}>
                                    1
                                </div>
                                <span className={`text-sm font-medium transition-colors ${screen === 1 ? 'text-white' : 'text-white/50'}`}>
                                    {t("venueInfo")}
                                </span>
                            </div>
                            <ChevronRight className="hidden sm:block h-5 w-5 text-white/30" />
                            <div className="hidden sm:flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${screen === 2 ? 'bg-red-600 text-white scale-110' : 'bg-white/20 text-white/70'
                                    }`}>
                                    2
                                </div>
                                <span className={`text-sm font-medium transition-colors ${screen === 2 ? 'text-white' : 'text-white/50'}`}>
                                    {t("systemInfo")}
                                </span>
                            </div>
                            {/* Mobile title */}
                            <h2 className="sm:hidden text-2xl font-bold text-white text-center flex items-center gap-3">
                                {screen === 1 ? <Building2 className="h-6 w-6" /> : <Settings2 className="h-6 w-6" />}
                                {screen === 1 ? t("venueInfo") : t("systemInfo")}
                            </h2>
                        </div>
                    </div>

                    <div className={`flex flex-col lg:flex-row flex-1 transition-all duration-300 ease-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        {/* 
                    Left Column Logic:
                    Screen 1: Width 100% on mobile, 50% on large
                    Screen 2: Width 100%
                */}
                        <div className={`${screen === 1 ? "w-full lg:w-1/2 lg:border-r border-gray-100 dark:border-zinc-800" : "w-full"} p-6 lg:p-10`}>
                            <div className="space-y-8 pb-8">

                                {/* 
                            SCREEN 1: VENUE INFORMATION 
                        */}
                                {screen === 1 && (
                                    <div className="space-y-8">
                                        {/* Basic Info Section */}
                                        <div className="space-y-6">
                                            <SectionHeader icon={Building2} title="Basic Information" subtitle="Enter the venue's core details" />

                                            {/* Venue Name */}
                                            <AnimatedField delay={0}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-red-500" />
                                                        {t("venueName")} <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={venueName} onChange={(e) => {
                                                            setVenueName(e.target.value)
                                                            setFormErrors(prev => ({ ...prev, venueName: false }))
                                                        }}
                                                        placeholder={t("venueNamePlaceholder")}
                                                        className={`bg-gray-50/50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 transition-all duration-200 ${formErrors.venueName ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-red-500'}`}
                                                    />
                                                </div>
                                            </AnimatedField>

                                            {/* Venue Address */}
                                            <AnimatedField delay={50}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-2 whitespace-nowrap flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-red-500" />
                                                        {t("venueAddress")} <span className="text-red-500">*</span>
                                                    </Label>
                                                    <div className="w-full">
                                                        <Input
                                                            value={address} onChange={(e) => {
                                                                handleAddressChange(e)
                                                                setFormErrors(prev => ({ ...prev, address: false }))
                                                            }} onBlur={handleBlur}
                                                            placeholder={t("venueAddressPlaceholder")}
                                                            className={`bg-gray-100 dark:bg-zinc-800 border-none rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 transition-all duration-200 ${formErrors.address ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-red-500'}`}
                                                        />
                                                        {suggestions.length > 0 && (
                                                            <div className="w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-10 relative animate-in fade-in slide-in-from-top-2 duration-200">
                                                                {suggestions.map((item) => (
                                                                    <div
                                                                        key={item.place_id}
                                                                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-zinc-800 last:border-0 truncate flex items-center gap-3 transition-colors duration-150"
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
                                            </AnimatedField>

                                            {/* Venue Type */}
                                            <AnimatedField delay={100}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                        <Layers className="h-4 w-4 text-red-500" />
                                                        {t("venueType")} <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Select value={venueType} onValueChange={(value) => {
                                                        setVenueType(value)
                                                        setFormErrors(prev => ({ ...prev, venueType: false }))
                                                    }}>
                                                        <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.venueType ? 'ring-2 ring-red-500' : ''}`}>
                                                            <SelectValue placeholder={t("venueTypePlaceholder")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Apartments/Condos">{t("Apartments/Condos")}</SelectItem>
                                                            <SelectItem value="Student Housing">{t("Student Housing")}</SelectItem>
                                                            <SelectItem value="Hospital">{t("Hospital")}</SelectItem>
                                                            <SelectItem value="Clinic/Outpatient Facility">{t("Clinic/Outpatient Facility")}</SelectItem>
                                                            <SelectItem value="Office">{t("Office")}</SelectItem>
                                                            <SelectItem value="Shopping Mall">{t("Shopping Mall")}</SelectItem>
                                                            <SelectItem value="Hotel">{t("Hotel")}</SelectItem>
                                                            <SelectItem value="Warehouse">{t("Warehouse")}</SelectItem>
                                                            <SelectItem value="Airport">{t("Airport")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </AnimatedField>

                                            {/* Number of Floors & Gross Sq Ft */}
                                            <AnimatedField delay={150}>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                            <Layers className="h-4 w-4 text-red-500" />
                                                            {t("numFloors")} <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            type="number" value={numFloors} onChange={(e) => {
                                                                setNumFloors(e.target.value)
                                                                setFormErrors(prev => ({ ...prev, numFloors: false }))
                                                            }}
                                                            placeholder={t("numFloorsPlaceholder")}
                                                            className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.numFloors ? 'ring-2 ring-red-500' : ''}`}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                            <BarChart3 className="h-4 w-4 text-red-500" />
                                                            {t("grossSqFt")} <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            type="number" value={grossSqFt} onChange={(e) => {
                                                                setGrossSqFt(e.target.value)
                                                                setFormErrors(prev => ({ ...prev, grossSqFt: false }))
                                                            }}
                                                            placeholder={t("grossSqFtPlaceholder")}
                                                            className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.grossSqFt ? 'ring-2 ring-red-500' : ''}`}
                                                        />
                                                    </div>
                                                </div>
                                            </AnimatedField>
                                        </div>

                                        {/* Parking Section */}
                                        <div className="space-y-6">
                                            <SectionHeader icon={ParkingCircle} title="Parking Information" />

                                            <AnimatedField delay={200}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("parkingGarage")}</Label>
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={hasParkingGarage} onCheckedChange={setHasParkingGarage}
                                                            className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-gray-200 transition-all duration-200"
                                                        />
                                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${hasParkingGarage ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 scale-105' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'}`}>
                                                            {hasParkingGarage ? t("yes") : t("no")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </AnimatedField>

                                            {hasParkingGarage && (
                                                <AnimatedField delay={250}>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("parkingSqFt")} <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            type="number" value={parkingSqFt} onChange={(e) => {
                                                                setParkingSqFt(e.target.value)
                                                                setFormErrors(prev => ({ ...prev, parkingSqFt: false }))
                                                            }}
                                                            placeholder={t("parkingSqFtPlaceholder")}
                                                            className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.parkingSqFt ? 'ring-2 ring-red-500' : ''}`}
                                                        />
                                                    </div>
                                                </AnimatedField>
                                            )}

                                            <AnimatedField delay={300}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-red-500" />
                                                        {t("pops")} <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        type="number" value={pops} onChange={(e) => {
                                                            setPops(e.target.value)
                                                            setFormErrors(prev => ({ ...prev, pops: false }))
                                                        }}
                                                        placeholder={t("popsPlaceholder")}
                                                        className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.pops ? 'ring-2 ring-red-500' : ''}`}
                                                    />
                                                </div>
                                            </AnimatedField>
                                        </div>

                                        {/* Third Party Section */}
                                        <div className="space-y-6">
                                            <SectionHeader icon={Handshake} title="Third Party Information" />

                                            <AnimatedField delay={350}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("thirdParty")}</Label>
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={isThirdParty} onCheckedChange={setIsThirdParty}
                                                            className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-gray-200"
                                                        />
                                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${isThirdParty ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 scale-105' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'}`}>
                                                            {isThirdParty ? t("yes") : t("no")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </AnimatedField>

                                            {isThirdParty && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("thirdPartyName")} <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            value={thirdPartyName} onChange={(e) => {
                                                                setThirdPartyName(e.target.value)
                                                                setFormErrors(prev => ({ ...prev, thirdPartyName: false }))
                                                            }}
                                                            placeholder={t("thirdPartyNamePlaceholder")} className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.thirdPartyName ? 'ring-2 ring-red-500' : ''}`}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("thirdPartyFee")} <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            type="number" value={thirdPartyFee} onChange={(e) => {
                                                                setThirdPartyFee(e.target.value)
                                                                setFormErrors(prev => ({ ...prev, thirdPartyFee: false }))
                                                            }}
                                                            placeholder={t("thirdPartyFeePlaceholder")} className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.thirdPartyFee ? 'ring-2 ring-red-500' : ''}`}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* AHJ & Dates Section */}
                                        <div className="space-y-6">
                                            <SectionHeader icon={Radio} title="AHJ & Schedule" subtitle="Requirements and timeline" />

                                            <AnimatedField delay={400}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("ahjRequirements")}</Label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {["700MHz", "850MHz", "450MHz"].map((mhz) => (
                                                            <div
                                                                key={mhz}
                                                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${ahjRequirements[mhz]
                                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                                                                    : 'border-gray-200 dark:border-zinc-700 hover:border-red-300 hover:shadow-sm'
                                                                    }`}
                                                                onClick={() => setAhjRequirements(p => ({ ...p, [mhz]: !p[mhz] }))}
                                                            >
                                                                <Checkbox
                                                                    id={mhz}
                                                                    checked={ahjRequirements[mhz]}
                                                                    onCheckedChange={(checked) => setAhjRequirements(p => ({ ...p, [mhz]: checked }))}
                                                                    className="pointer-events-none"
                                                                />
                                                                <label htmlFor={mhz} className="text-sm font-medium leading-none text-gray-600 dark:text-gray-300 cursor-pointer">
                                                                    {mhz.replace("MHz", " MHz")}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </AnimatedField>

                                            <AnimatedField delay={450}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("buildingDensity")} <span className="text-red-500">*</span></Label>
                                                    <Select value={density} onValueChange={(value) => {
                                                        setDensity(value)
                                                        setFormErrors(prev => ({ ...prev, density: false }))
                                                    }}>
                                                        <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.density ? 'ring-2 ring-red-500' : ''}`}>
                                                            <SelectValue placeholder={t("densityPlaceholder")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Open Space">{t("Open Space")}</SelectItem>
                                                            <SelectItem value="Light">{t("Light")}</SelectItem>
                                                            <SelectItem value="Medium">{t("Medium")}</SelectItem>
                                                            <SelectItem value="Dense">{t("Dense")}</SelectItem>
                                                            <SelectItem value="High Density">{t("High Density")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </AnimatedField>

                                            <AnimatedField delay={500}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("salesManager")} <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        value={salesManager} onChange={(e) => {
                                                            setSalesManager(e.target.value)
                                                            setFormErrors(prev => ({ ...prev, salesManager: false }))
                                                        }}
                                                        placeholder={t("salesManagerPlaceholder")} className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.salesManager ? 'ring-2 ring-red-500' : ''}`}
                                                    />
                                                </div>
                                            </AnimatedField>

                                            {/* Dates */}
                                            <AnimatedField delay={550}>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                                        <div className="flex flex-col gap-2">
                                                            <Label className="text-gray-600 dark:text-gray-300 font-medium flex items-start gap-2 min-h-[24px]">
                                                                <Calendar className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                                                <span className="text-sm leading-tight">{t("expectedConstructionStart")} <span className="text-red-500">*</span></span>
                                                            </Label>
                                                            <Input type="date" value={constructionDate} onChange={(e) => {
                                                                setConstructionDate(e.target.value)
                                                                setFormErrors(prev => ({ ...prev, constructionDate: false, dateOrder: false }))
                                                            }} className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.constructionDate ? 'ring-2 ring-red-500' : ''}`} />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Label className="text-gray-600 dark:text-gray-300 font-medium flex items-start gap-2 min-h-[24px]">
                                                                <Calendar className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                                                <span className="text-sm leading-tight">{t("expectedCloseDate")} <span className="text-red-500">*</span></span>
                                                            </Label>
                                                            <Input type="date" value={closeDate} onChange={(e) => {
                                                                setCloseDate(e.target.value)
                                                                setFormErrors(prev => ({ ...prev, closeDate: false, dateOrder: false }))
                                                            }} className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.closeDate ? 'ring-2 ring-red-500' : ''}`} />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                                        <div className="flex flex-col gap-2">
                                                            <Label className="text-gray-600 dark:text-gray-300 font-medium flex items-start gap-2 min-h-[24px]">
                                                                <Calendar className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                                                <span className="text-sm leading-tight">{t("expectedOnAirDate")} <span className="text-red-500">*</span></span>
                                                            </Label>
                                                            <Input type="date" value={onAirDate} onChange={(e) => {
                                                                setOnAirDate(e.target.value)
                                                                setFormErrors(prev => ({ ...prev, onAirDate: false, dateOrder: false }))
                                                            }} className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.onAirDate ? 'ring-2 ring-red-500' : ''}`} />
                                                        </div>
                                                    </div>
                                                    {formErrors.dateOrder && (
                                                        <p className="text-xs text-red-500 mt-2">
                                                            Date order: Construction Start → Close Date → On Air Date
                                                        </p>
                                                    )}
                                                </div>
                                            </AnimatedField>
                                        </div>
                                    </div>
                                )}

                                {/* 
                            SCREEN 2: SYSTEM INFORMATION 
                        */}
                                {screen === 2 && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">

                                            {/* Left Col Fields */}
                                            <div className="space-y-6">
                                                <SectionHeader icon={Settings2} title="System Configuration" subtitle="Define your system setup" />

                                                {/* System Type */}
                                                <AnimatedField delay={0}>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                            <Cpu className="h-4 w-4 text-red-500" />
                                                            {t("systemType")} <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select value={systemType} onValueChange={(value) => {
                                                            setSystemType(value)
                                                            setFormErrors(prev => ({ ...prev, systemType: false }))
                                                        }}>
                                                            <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.systemType ? 'ring-2 ring-red-500' : ''}`}>
                                                                <SelectValue placeholder={t("systemTypePlaceholder")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="DAS">DAS</SelectItem>
                                                                <SelectItem value="ERCES">ERCES</SelectItem>
                                                                <SelectItem value="DAS & ERCES">DAS & ERCES</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </AnimatedField>

                                                {/* DAS Architecture */}
                                                {showDasFields && (
                                                    <AnimatedField delay={50}>
                                                        <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("dasArchitecture")} <span className="text-red-500">*</span></Label>
                                                            <Select value={dasArchitecture} onValueChange={(value) => {
                                                                setDasArchitecture(value)
                                                                setFormErrors(prev => ({ ...prev, dasArchitecture: false }))
                                                            }}>
                                                                <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.dasArchitecture ? 'ring-2 ring-red-500' : ''}`}>
                                                                    <SelectValue placeholder={t("architecturePlaceholder")} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="DAS (Distributed Antenna System)">{t("DAS (Distributed Antenna System)")}</SelectItem>
                                                                    <SelectItem value="Part 20 ( BDA only)">{t("Part 20 ( BDA only)")}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </AnimatedField>
                                                )}

                                                {/* OEM Selection Criteria */}
                                                <AnimatedField delay={100}>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("oemCriteria")} <span className="text-red-500">*</span></Label>
                                                        <Select value={oemCriteria} onValueChange={(value) => {
                                                            setOemCriteria(value)
                                                            setFormErrors(prev => ({ ...prev, oemCriteria: false }))
                                                        }}>
                                                            <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.oemCriteria ? 'ring-2 ring-red-500' : ''}`}>
                                                                <SelectValue placeholder={t("oemCriteriaPlaceholder")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="performance">{t("performance")}</SelectItem>
                                                                <SelectItem value="cost">{t("cost")}</SelectItem>
                                                                <SelectItem value="legacy">{t("legacySupport")}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </AnimatedField>

                                                {/* DAS Vendor */}
                                                {showDasFields && (
                                                    <AnimatedField delay={150}>
                                                        <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("dasVendor")} <span className="text-red-500">*</span></Label>
                                                            <Select value={dasVendor} onValueChange={(value) => {
                                                                setDasVendor(value)
                                                                setFormErrors(prev => ({ ...prev, dasVendor: false }))
                                                            }}>
                                                                <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.dasVendor ? 'ring-2 ring-red-500' : ''}`}>
                                                                    <SelectValue placeholder={t("dasVendorPlaceholder")} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Comba">Comba</SelectItem>
                                                                    <SelectItem value="ADRF">ADRF</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </AnimatedField>
                                                )}

                                                {/* BDA/Booster Vendor */}
                                                {showErrcsFields && (
                                                    <AnimatedField delay={200}>
                                                        <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("bdaVendor")} <span className="text-red-500">*</span></Label>
                                                            <Select value={bdaVendor} onValueChange={(value) => {
                                                                setBdaVendor(value)
                                                                setFormErrors(prev => ({ ...prev, bdaVendor: false }))
                                                            }}>
                                                                <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.bdaVendor ? 'ring-2 ring-red-500' : ''}`}>
                                                                    <SelectValue placeholder={t("bdaVendorPlaceholder")} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Comba">Comba</SelectItem>
                                                                    <SelectItem value="ADRF">ADRF</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </AnimatedField>
                                                )}

                                                {/* ERCES Coverage Area */}
                                                {showErrcsFields && (
                                                    <AnimatedField delay={250}>
                                                        <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("coverageArea")} <span className="text-red-500">*</span></Label>
                                                            <Select value={errcsCoverage} onValueChange={(value) => {
                                                                setErrcsCoverage(value)
                                                                setFormErrors(prev => ({ ...prev, errcsCoverage: false }))
                                                            }}>
                                                                <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.errcsCoverage ? 'ring-2 ring-red-500' : ''}`}>
                                                                    <SelectValue placeholder={t("coverageAreaPlaceholder")} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="full">{t("fullBuilding")}</SelectItem>
                                                                    <SelectItem value="critical">{t("criticalAreas")}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </AnimatedField>
                                                )}

                                                {/* Sector Criteria & Number of Sectors */}
                                                <AnimatedField delay={300}>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("sectorCriteria")} <span className="text-red-500">*</span></Label>
                                                        <Select value={sectorCriteria} onValueChange={(value) => {
                                                            setSectorCriteria(value)
                                                            setFormErrors(prev => ({ ...prev, sectorCriteria: false }))
                                                        }}>
                                                            <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.sectorCriteria ? 'ring-2 ring-red-500' : ''}`}>
                                                                <SelectValue placeholder={t("sectorCriteriaPlaceholder")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="capacity">{t("capacity")}</SelectItem>
                                                                <SelectItem value="coverage">{t("coverage")}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </AnimatedField>

                                                <AnimatedField delay={350}>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("numSectors")}</Label>
                                                        <Input
                                                            value={numSectors}
                                                            readOnly
                                                            className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 text-gray-500 dark:text-gray-400 w-full h-11"
                                                        />
                                                    </div>
                                                </AnimatedField>
                                            </div>

                                            {/* Right Col Fields */}
                                            <div className="space-y-6">
                                                <SectionHeader icon={Signal} title="Signal & Carrier" subtitle="Configure signal sources and carriers" />

                                                {/* Signal Source per Carrier */}
                                                <AnimatedField delay={400}>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                            <Signal className="h-4 w-4 text-red-500" />
                                                            {t("signalSource")} <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select value={signalSource} onValueChange={(value) => {
                                                            setSignalSource(value)
                                                            setFormErrors(prev => ({ ...prev, signalSource: false }))
                                                        }}>
                                                            <SelectTrigger className={`bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 ${formErrors.signalSource ? 'ring-2 ring-red-500' : ''}`}>
                                                                <SelectValue placeholder={t("signalSourcePlaceholder")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="BDA">{t("BDA")}</SelectItem>
                                                                <SelectItem value="eFento">{t("eFento")}</SelectItem>
                                                                <SelectItem value="One Cell">{t("One Cell")}</SelectItem>
                                                                <SelectItem value="BTS">{t("BTS")}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </AnimatedField>

                                                {/* Carrier Requirements */}
                                                <AnimatedField delay={450}>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-1 whitespace-nowrap flex items-center gap-2">
                                                            <Radio className="h-4 w-4 text-red-500" />
                                                            {t("carrierRequirements")} <span className="text-red-500">*</span>
                                                        </Label>
                                                        <div className={`flex flex-wrap gap-3 ${formErrors.carrierRequirements ? 'ring-2 ring-red-500 rounded-xl p-1' : ''}`}>
                                                            {["AT&T", "Verizon", "T-Mobile"].map((carrier) => (
                                                                <div
                                                                    key={carrier}
                                                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${carrierRequirements[carrier]
                                                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                        : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'
                                                                        }`}
                                                                    onClick={() => {
                                                                        setCarrierRequirements(p => ({ ...p, [carrier]: !p[carrier] }))
                                                                        setFormErrors(prev => ({ ...prev, carrierRequirements: false }))
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        id={carrier}
                                                                        checked={carrierRequirements[carrier]}
                                                                        onCheckedChange={(checked) => {
                                                                            setCarrierRequirements(p => ({ ...p, [carrier]: checked }))
                                                                            setFormErrors(prev => ({ ...prev, carrierRequirements: false }))
                                                                        }}
                                                                        className="pointer-events-none"
                                                                    />
                                                                    <label htmlFor={carrier} className="text-sm font-medium leading-none text-gray-600 dark:text-gray-300 cursor-pointer">
                                                                        {carrier}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </AnimatedField>

                                                {/* Technology Supported */}
                                                <AnimatedField delay={500}>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start gap-2 sm:gap-4">
                                                        <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-1 whitespace-nowrap flex items-center gap-2">
                                                            <Wifi className="h-4 w-4 text-red-500" />
                                                            {t("techSupported")} <span className="text-red-500">*</span>
                                                        </Label>
                                                        <div className={`flex flex-wrap gap-3 ${formErrors.techSupported ? 'ring-2 ring-red-500 rounded-xl p-1' : ''}`}>
                                                            {["4G LTE", "4G LTE & 5G NR"].map((tech) => (
                                                                <div
                                                                    key={tech}
                                                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${techSupported[tech]
                                                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                        : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'
                                                                        }`}
                                                                    onClick={() => {
                                                                        setTechSupported(p => ({ ...p, [tech]: !p[tech] }))
                                                                        setFormErrors(prev => ({ ...prev, techSupported: false }))
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        id={tech}
                                                                        checked={techSupported[tech]}
                                                                        onCheckedChange={(checked) => {
                                                                            setTechSupported(p => ({ ...p, [tech]: checked }))
                                                                            setFormErrors(prev => ({ ...prev, techSupported: false }))
                                                                        }}
                                                                        className="pointer-events-none"
                                                                    />
                                                                    <label htmlFor={tech} className="text-sm font-medium leading-none text-gray-600 dark:text-gray-300 cursor-pointer">
                                                                        {tech}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </AnimatedField>
                                            </div>

                                            {/* Additional Information - Full Width */}
                                            <div className="col-span-1 lg:col-span-2 space-y-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                                <AnimatedField delay={550}>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <FileText className="h-5 w-5 text-red-500" />
                                                        <Label className="text-gray-700 dark:text-gray-300 font-semibold text-base">{t("additionalInfo")}</Label>
                                                    </div>
                                                    <textarea
                                                        value={additionalInfo}
                                                        onChange={(e) => setAdditionalInfo(e.target.value)}
                                                        placeholder={t("additionalInfoPlaceholder")}
                                                        className="w-full min-h-[150px] p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-gray-900 dark:text-white transition-all duration-200"
                                                    />
                                                </AnimatedField>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Map (Only visible in Screen 1) */}
                        {screen === 1 && (
                            <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-zinc-800 h-[350px] lg:h-auto lg:min-h-[600px] relative shrink-0">
                                <RomMap lat={coordinates.lat} lng={coordinates.lng} zoom={zoom} />
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm z-[1000] text-gray-600 dark:text-gray-400 pointer-events-none">
                                    {t("osmView")}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex flex-col items-center bg-white dark:bg-zinc-900 shrink-0 relative rounded-b-xl gap-4">
                        {/* Error Message (only shown when not loading) */}
                        {screen === 2 && romError && !isLoading && (
                            <div className="w-full max-w-md">
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{romError}</span>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-center items-center w-full relative">
                            {(screen === 1 || screen === 2) && (
                                <Button
                                    onClick={handleBack}
                                    disabled={isLoading}
                                    className="absolute left-0 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-xl px-6 h-11 flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    {t("back")}
                                </Button>
                            )}

                            <Button
                                onClick={handleNext}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl px-8 h-11 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                            >
                                {screen === 2 ? (
                                    isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            {t("create")}
                                        </>
                                    )
                                ) : (
                                    <>
                                        {t("next")}
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}