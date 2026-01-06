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
    Search
} from "lucide-react"

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

// Section header component
function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div className="flex items-center gap-3 pb-2 mb-4 border-b border-gray-100 dark:border-zinc-800">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
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

    // Navigation Handlers
    const handleNext = useCallback(() => {
        if (screen === 1) {
            transitionToScreen(2)
        } else if (screen === 2) {
            console.log("Form Submitted", { venueName, systemType, address })
        }
    }, [screen, transitionToScreen, venueName, systemType, address])

    const handleBack = useCallback(() => {
        if (screen === 2) {
            transitionToScreen(1)
        } else if (screen === 1) {
            transitionToScreen(0)
        }
    }, [screen, transitionToScreen])

    // Conditional Visibility Helpers
    const showDasFields = systemType === "DAS" || systemType === "DAS & ERCES"
    const showErrcsFields = systemType === "ERCES" || systemType === "DAS & ERCES"

    // Screen 0: Initial Address Search (like coverage plot)
    if (screen === 0) {
        return (
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
        )
    }

    // Screens 1 & 2: Form Steps
    return (
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
                                                {t("venueName")}
                                            </Label>
                                            <Input
                                                value={venueName} onChange={(e) => setVenueName(e.target.value)}
                                                placeholder={t("venueNamePlaceholder")}
                                                className="bg-gray-50/50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                            />
                                        </div>
                                    </AnimatedField>

                                    {/* Venue Address */}
                                    <AnimatedField delay={50}>
                                        <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-2 whitespace-nowrap flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-red-500" />
                                                {t("venueAddress")}
                                            </Label>
                                            <div className="w-full">
                                                <Input
                                                    value={address} onChange={handleAddressChange} onBlur={handleBlur}
                                                    placeholder={t("venueAddressPlaceholder")}
                                                    className="bg-gray-100 dark:bg-zinc-800 border-none rounded-xl px-4 w-full text-gray-900 dark:text-white h-11 focus:ring-2 focus:ring-red-500 transition-all duration-200"
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
                                                {t("venueType")}
                                            </Label>
                                            <Select value={venueType} onValueChange={setVenueType}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
                                                    <SelectValue placeholder={t("venueTypePlaceholder")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="stadium">{t("stadium")}</SelectItem>
                                                    <SelectItem value="arena">{t("arena")}</SelectItem>
                                                    <SelectItem value="convention">{t("conventionCenter")}</SelectItem>
                                                    <SelectItem value="office">{t("officeBuilding")}</SelectItem>
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
                                                    {t("numFloors")}
                                                </Label>
                                                <Input
                                                    type="number" value={numFloors} onChange={(e) => setNumFloors(e.target.value)}
                                                    placeholder={t("numFloorsPlaceholder")}
                                                    className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                    <BarChart3 className="h-4 w-4 text-red-500" />
                                                    {t("grossSqFt")}
                                                </Label>
                                                <Input
                                                    type="number" value={grossSqFt} onChange={(e) => setGrossSqFt(e.target.value)}
                                                    placeholder={t("grossSqFtPlaceholder")}
                                                    className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11"
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
                                                    className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-gray-200"
                                                />
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${hasParkingGarage ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'}`}>
                                                    {hasParkingGarage ? t("yes") : t("no")}
                                                </span>
                                            </div>
                                        </div>
                                    </AnimatedField>

                                    {hasParkingGarage && (
                                        <AnimatedField delay={250}>
                                            <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("parkingSqFt")}</Label>
                                                <Input
                                                    type="number" value={parkingSqFt} onChange={(e) => setParkingSqFt(e.target.value)}
                                                    placeholder={t("parkingSqFtPlaceholder")}
                                                    className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11"
                                                />
                                            </div>
                                        </AnimatedField>
                                    )}

                                    <AnimatedField delay={300}>
                                        <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                <Users className="h-4 w-4 text-red-500" />
                                                {t("pops")}
                                            </Label>
                                            <Input
                                                type="number" value={pops} onChange={(e) => setPops(e.target.value)}
                                                placeholder={t("popsPlaceholder")}
                                                className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11"
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
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isThirdParty ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'}`}>
                                                    {isThirdParty ? t("yes") : t("no")}
                                                </span>
                                            </div>
                                        </div>
                                    </AnimatedField>

                                    {isThirdParty && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("thirdPartyName")}</Label>
                                                <Input
                                                    value={thirdPartyName} onChange={(e) => setThirdPartyName(e.target.value)}
                                                    placeholder={t("thirdPartyNamePlaceholder")} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11"
                                                />
                                            </div>
                                            <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("thirdPartyFee")}</Label>
                                                <Input
                                                    type="number" value={thirdPartyFee} onChange={(e) => setThirdPartyFee(e.target.value)}
                                                    placeholder={t("thirdPartyFeePlaceholder")} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11"
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
                                                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${ahjRequirements[mhz]
                                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                            : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'
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
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("buildingDensity")}</Label>
                                            <Select value={density} onValueChange={setDensity}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
                                                    <SelectValue placeholder={t("densityPlaceholder")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">{t("low")}</SelectItem>
                                                    <SelectItem value="medium">{t("medium")}</SelectItem>
                                                    <SelectItem value="high">{t("high")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </AnimatedField>

                                    <AnimatedField delay={500}>
                                        <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("salesManager")}</Label>
                                            <Input
                                                value={salesManager} onChange={(e) => setSalesManager(e.target.value)}
                                                placeholder={t("salesManagerPlaceholder")} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11"
                                            />
                                        </div>
                                    </AnimatedField>

                                    {/* Dates */}
                                    <AnimatedField delay={550}>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-red-500" />
                                                    {t("expectedCloseDate")}
                                                </Label>
                                                <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-red-500" />
                                                    {t("expectedConstructionStart")}
                                                </Label>
                                                <Input type="date" value={constructionDate} onChange={(e) => setConstructionDate(e.target.value)} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-red-500" />
                                                    {t("expectedOnAirDate")}
                                                </Label>
                                                <Input type="date" value={onAirDate} onChange={(e) => setOnAirDate(e.target.value)} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11" />
                                            </div>
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
                                                    {t("systemType")}
                                                </Label>
                                                <Select value={systemType} onValueChange={setSystemType}>
                                                    <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
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
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("dasArchitecture")}</Label>
                                                    <Select value={dasArchitecture} onValueChange={setDasArchitecture}>
                                                        <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
                                                            <SelectValue placeholder={t("architecturePlaceholder")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Active">{t("active")}</SelectItem>
                                                            <SelectItem value="Passive">{t("passive")}</SelectItem>
                                                            <SelectItem value="Hybrid">{t("hybrid")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </AnimatedField>
                                        )}

                                        {/* OEM Selection Criteria */}
                                        <AnimatedField delay={100}>
                                            <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("oemCriteria")}</Label>
                                                <Select value={oemCriteria} onValueChange={setOemCriteria}>
                                                    <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
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
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("dasVendor")}</Label>
                                                    <Select value={dasVendor} onValueChange={setDasVendor}>
                                                        <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
                                                            <SelectValue placeholder={t("dasVendorPlaceholder")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="commscope">CommScope</SelectItem>
                                                            <SelectItem value="jma">JMA Wireless</SelectItem>
                                                            <SelectItem value="corning">Corning</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </AnimatedField>
                                        )}

                                        {/* BDA/Booster Vendor */}
                                        {showErrcsFields && (
                                            <AnimatedField delay={200}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("bdaVendor")}</Label>
                                                    <Select value={bdaVendor} onValueChange={setBdaVendor}>
                                                        <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
                                                            <SelectValue placeholder={t("bdaVendorPlaceholder")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="honeywell">Honeywell</SelectItem>
                                                            <SelectItem value="adrf">ADRF</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </AnimatedField>
                                        )}

                                        {/* ERCES Coverage Area */}
                                        {showErrcsFields && (
                                            <AnimatedField delay={250}>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("coverageArea")}</Label>
                                                    <Select value={errcsCoverage} onValueChange={setErrcsCoverage}>
                                                        <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
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
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("sectorCriteria")}</Label>
                                                <Select value={sectorCriteria} onValueChange={setSectorCriteria}>
                                                    <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
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
                                                    {t("signalSource")}
                                                </Label>
                                                <Select value={signalSource} onValueChange={setSignalSource}>
                                                    <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 w-full text-gray-900 dark:text-white h-11">
                                                        <SelectValue placeholder={t("signalSourcePlaceholder")} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="off-air">{t("offAir")}</SelectItem>
                                                        <SelectItem value="bts">{t("bts")}</SelectItem>
                                                        <SelectItem value="smallcell">{t("smallCell")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </AnimatedField>

                                        {/* Carrier Requirements */}
                                        <AnimatedField delay={450}>
                                            <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] items-start gap-2 sm:gap-4">
                                                <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-1 whitespace-nowrap flex items-center gap-2">
                                                    <Radio className="h-4 w-4 text-red-500" />
                                                    {t("carrierRequirements")}
                                                </Label>
                                                <div className="flex flex-wrap gap-3">
                                                    {["AT&T", "Verizon", "T-Mobile"].map((carrier) => (
                                                        <div
                                                            key={carrier}
                                                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${carrierRequirements[carrier]
                                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'
                                                                }`}
                                                            onClick={() => setCarrierRequirements(p => ({ ...p, [carrier]: !p[carrier] }))}
                                                        >
                                                            <Checkbox
                                                                id={carrier}
                                                                checked={carrierRequirements[carrier]}
                                                                onCheckedChange={(checked) => setCarrierRequirements(p => ({ ...p, [carrier]: checked }))}
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
                                                    {t("techSupported")}
                                                </Label>
                                                <div className="flex flex-wrap gap-3">
                                                    {["4G LTE", "4G LTE & 5G NR"].map((tech) => (
                                                        <div
                                                            key={tech}
                                                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${techSupported[tech]
                                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'
                                                                }`}
                                                            onClick={() => setTechSupported(p => ({ ...p, [tech]: !p[tech] }))}
                                                        >
                                                            <Checkbox
                                                                id={tech}
                                                                checked={techSupported[tech]}
                                                                onCheckedChange={(checked) => setTechSupported(p => ({ ...p, [tech]: checked }))}
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
            <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-center items-center bg-white dark:bg-zinc-900 shrink-0 relative rounded-b-xl">
                {(screen === 1 || screen === 2) && (
                    <Button
                        onClick={handleBack}
                        className="absolute left-6 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-xl px-6 h-11 flex items-center gap-2 transition-all duration-200"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {t("back")}
                    </Button>
                )}

                <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl px-8 h-11 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                    {screen === 2 ? (
                        <>
                            <Sparkles className="h-4 w-4" />
                            {t("create")}
                        </>
                    ) : (
                        <>
                            {t("next")}
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </Card>
    )
}