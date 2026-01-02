"use client"

import { useState, useEffect, useRef } from "react"
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

// Dynamically import the map to avoid SSR issues
const RomMap = dynamic(() => import("./rom-map"), {
    ssr: false,
    loading: () => null
})

export function CreateRomForm() {
    const { t } = useLanguage()
    // Navigation State
    const [step, setStep] = useState(1) // 1: Venue Info, 2: System Info

    // --- FORM STATE (Persists across steps) ---
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

    // System Info (Step 2)
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

    const searchAddress = async (query) => {
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
    }

    const handleAddressChange = (e) => {
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
    }

    const handleSelectAddress = (item) => {
        setAddress(item.display_name)
        setSuggestions([])
        const lat = parseFloat(item.lat)
        const lon = parseFloat(item.lon)
        setCoordinates({ lat, lng: lon })
        setZoom(16)
    }

    useEffect(() => {
        if (suggestions.length > 0) {
            const item = suggestions[0]
            const lat = parseFloat(item.lat)
            const lon = parseFloat(item.lon)
            setCoordinates({ lat, lng: lon })
            setZoom(15)
        }
    }, [suggestions])

    const handleBlur = () => {
        setTimeout(() => {
            setSuggestions([])
        }, 200)
    }

    // Navigation Handlers
    const handleNext = () => {
        if (step === 1) {
            setStep(2)
            window.scrollTo(0, 0)
        } else {
            console.log("Form Submitted", { venueName, systemType })
        }
    }

    const handleBack = () => {
        if (step === 2) {
            setStep(1)
        }
    }

    // Conditional Visibility Helpers
    const showDasFields = systemType === "DAS" || systemType === "DAS & ERCES"
    const showErrcsFields = systemType === "ERCES" || systemType === "DAS & ERCES"

    return (
        <Card className="w-full bg-white dark:bg-zinc-900 shadow-lg border-0 dark:border dark:border-zinc-800 rounded-xl flex flex-col">
            <div className="bg-[#3D434A] dark:bg-zinc-950 py-4 px-8 border-b-4 border-red-600 shrink-0 rounded-t-xl -mt-6">
                <h2 className="text-2xl font-bold text-white text-center">
                    {step === 1 ? t("venueInfo") : t("systemInfo")}
                </h2>
            </div>

            <div className="flex flex-col lg:flex-row flex-1">
                {/* 
                    Left Column Logic:
                    Step 1: Width 100% on mobile, 50% on large
                    Step 2: Width 100%
                */}
                <div className={`${step === 1 ? "w-full lg:w-1/2 lg:border-r border-gray-100 dark:border-zinc-800" : "w-full"} p-4 lg:p-8`}>
                    <div className="space-y-6 pb-8">

                        {/* 
                            STEP 1: VENUE INFORMATION 
                        */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                {/* Venue Name */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("venueName")}</Label>
                                    <Input
                                        value={venueName} onChange={(e) => setVenueName(e.target.value)}
                                        placeholder={t("venueNamePlaceholder")}
                                        className="bg-gray-50/50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Venue Address */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-2 whitespace-nowrap">{t("venueAddress")}</Label>
                                    <div className="w-full">
                                        <Input
                                            value={address} onChange={handleAddressChange} onBlur={handleBlur}
                                            placeholder={t("venueAddressPlaceholder")}
                                            className="bg-gray-100 dark:bg-zinc-800 border-none rounded-full px-4 w-full text-gray-900 dark:text-white"
                                        />
                                        {suggestions.length > 0 && (
                                            <div className="w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden z-10 relative">
                                                {suggestions.map((item) => (
                                                    <div
                                                        key={item.place_id}
                                                        className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-xs text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-zinc-800 last:border-0 truncate"
                                                        onClick={() => handleSelectAddress(item)}
                                                    >
                                                        {item.display_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Venue Type */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("venueType")}</Label>
                                    <Select value={venueType} onValueChange={setVenueType}>
                                        <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
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

                                {/* Number of Floors */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("numFloors")}</Label>
                                    <Input
                                        type="number" value={numFloors} onChange={(e) => setNumFloors(e.target.value)}
                                        placeholder={t("numFloorsPlaceholder")}
                                        className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Gross sq. ft. */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("grossSqFt")}</Label>
                                    <Input
                                        type="number" value={grossSqFt} onChange={(e) => setGrossSqFt(e.target.value)}
                                        placeholder={t("grossSqFtPlaceholder")}
                                        className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Parking Garage Toggle */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("parkingGarage")}</Label>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={hasParkingGarage} onCheckedChange={setHasParkingGarage}
                                            className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-gray-200"
                                        />
                                        <span className="bg-[#3D434A] text-white text-xs font-bold px-3 py-1 rounded">
                                            {hasParkingGarage ? t("yes") : t("no")}
                                        </span>
                                    </div>
                                </div>

                                {/* Parking Garage sq. ft. */}
                                {hasParkingGarage && (
                                    <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("parkingSqFt")}</Label>
                                        <Input
                                            type="number" value={parkingSqFt} onChange={(e) => setParkingSqFt(e.target.value)}
                                            placeholder={t("parkingSqFtPlaceholder")}
                                            className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white"
                                        />
                                    </div>
                                )}

                                {/* Pops */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("pops")}</Label>
                                    <Input
                                        type="number" value={pops} onChange={(e) => setPops(e.target.value)}
                                        placeholder={t("popsPlaceholder")}
                                        className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="border-t border-gray-100 dark:border-zinc-800 my-4"></div>

                                {/* 3rd Party */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("thirdParty")}</Label>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={isThirdParty} onCheckedChange={setIsThirdParty}
                                            className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-gray-200"
                                        />
                                        <span className="bg-[#3D434A] text-white text-xs font-bold px-3 py-1 rounded">
                                            {isThirdParty ? t("yes") : t("no")}
                                        </span>
                                    </div>
                                </div>

                                {isThirdParty && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("thirdPartyName")}</Label>
                                            <Input
                                                value={thirdPartyName} onChange={(e) => setThirdPartyName(e.target.value)}
                                                placeholder={t("thirdPartyNamePlaceholder")} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("thirdPartyFee")}</Label>
                                            <Input
                                                type="number" value={thirdPartyFee} onChange={(e) => setThirdPartyFee(e.target.value)}
                                                placeholder={t("thirdPartyFeePlaceholder")} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* AHJ Checklist */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("ahjRequirements")}</Label>
                                    <div className="flex flex-wrap gap-4 sm:gap-6">
                                        {["700MHz", "850MHz", "450MHz"].map((mhz) => (
                                            <div key={mhz} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={mhz}
                                                    checked={ahjRequirements[mhz]}
                                                    onCheckedChange={(checked) => setAhjRequirements(p => ({ ...p, [mhz]: checked }))}
                                                />
                                                <label htmlFor={mhz} className="text-sm font-medium leading-none text-gray-500">
                                                    {mhz.replace("MHz", " MHz")}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Building Density */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("buildingDensity")}</Label>
                                    <Select value={density} onValueChange={setDensity}>
                                        <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
                                            <SelectValue placeholder={t("densityPlaceholder")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">{t("low")}</SelectItem>
                                            <SelectItem value="medium">{t("medium")}</SelectItem>
                                            <SelectItem value="high">{t("high")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sales Manager */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("salesManager")}</Label>
                                    <Input
                                        value={salesManager} onChange={(e) => setSalesManager(e.target.value)}
                                        placeholder={t("salesManagerPlaceholder")} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Dates */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("expectedCloseDate")}</Label>
                                    <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white" />
                                </div>
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("expectedConstructionStart")}</Label>
                                    <Input type="date" value={constructionDate} onChange={(e) => setConstructionDate(e.target.value)} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white" />
                                </div>
                                <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("expectedOnAirDate")}</Label>
                                    <Input type="date" value={onAirDate} onChange={(e) => setOnAirDate(e.target.value)} className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white" />
                                </div>
                            </div>
                        )}

                        {/* 
                            STEP 2: SYSTEM INFORMATION 
                        */}
                        {step === 2 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                                {/* Left Col Fields */}
                                <div className="space-y-6">
                                    {/* System Type */}
                                    <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("systemType")}</Label>
                                        <Select value={systemType} onValueChange={setSystemType}>
                                            <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
                                                <SelectValue placeholder={t("systemTypePlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DAS">DAS</SelectItem>
                                                <SelectItem value="ERCES">ERCES</SelectItem>
                                                <SelectItem value="DAS & ERCES">DAS & ERCES</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* DAS Architecture (Hidden if ERCES Only) */}
                                    {showDasFields && (
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("dasArchitecture")}</Label>
                                            <Select value={dasArchitecture} onValueChange={setDasArchitecture}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
                                                    <SelectValue placeholder={t("architecturePlaceholder")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Active">{t("active")}</SelectItem>
                                                    <SelectItem value="Passive">{t("passive")}</SelectItem>
                                                    <SelectItem value="Hybrid">{t("hybrid")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* OEM Selection Criteria */}
                                    <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("oemCriteria")}</Label>
                                        <Select value={oemCriteria} onValueChange={setOemCriteria}>
                                            <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
                                                <SelectValue placeholder={t("oemCriteriaPlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="performance">{t("performance")}</SelectItem>
                                                <SelectItem value="cost">{t("cost")}</SelectItem>
                                                <SelectItem value="legacy">{t("legacySupport")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* DAS Vendor (Hidden if ERCES Only) */}
                                    {showDasFields && (
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("dasVendor")}</Label>
                                            <Select value={dasVendor} onValueChange={setDasVendor}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
                                                    <SelectValue placeholder={t("dasVendorPlaceholder")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="commscope">CommScope</SelectItem>
                                                    <SelectItem value="jma">JMA Wireless</SelectItem>
                                                    <SelectItem value="corning">Corning</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* BDA/Booster Vendor (Hidden if DAS Only) */}
                                    {showErrcsFields && (
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("bdaVendor")}</Label>
                                            <Select value={bdaVendor} onValueChange={setBdaVendor}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
                                                    <SelectValue placeholder={t("bdaVendorPlaceholder")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="honeywell">Honeywell</SelectItem>
                                                    <SelectItem value="adrf">ADRF</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* ERCES Coverage Area (Hidden if DAS Only) */}
                                    {showErrcsFields && (
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("coverageArea")}</Label>
                                            <Select value={errcsCoverage} onValueChange={setErrcsCoverage}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
                                                    <SelectValue placeholder={t("coverageAreaPlaceholder")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full">{t("fullBuilding")}</SelectItem>
                                                    <SelectItem value="critical">{t("criticalAreas")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* # of Sectors Criteria */}
                                    <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("sectorCriteria")}</Label>
                                        <Select value={sectorCriteria} onValueChange={setSectorCriteria}>
                                            <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
                                                <SelectValue placeholder={t("sectorCriteriaPlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="capacity">{t("capacity")}</SelectItem>
                                                <SelectItem value="coverage">{t("coverage")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Number of Sectors */}
                                    <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("numSectors")}</Label>
                                        <Input
                                            value={numSectors}
                                            readOnly
                                            className="bg-gray-200/50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 text-gray-700 dark:text-gray-400 w-full"
                                        />
                                    </div>
                                </div>

                                {/* Right Col Fields */}
                                <div className="space-y-6">
                                    {/* Signal Source per Carrier */}
                                    <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start sm:items-center gap-2 sm:gap-4">
                                        <Label className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t("signalSource")}</Label>
                                        <Select value={signalSource} onValueChange={setSignalSource}>
                                            <SelectTrigger className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-full px-4 w-full text-gray-900 dark:text-white">
                                                <SelectValue placeholder={t("signalSourcePlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="off-air">{t("offAir")}</SelectItem>
                                                <SelectItem value="bts">{t("bts")}</SelectItem>
                                                <SelectItem value="smallcell">{t("smallCell")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Carrier Requirements */}
                                    <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                                        <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-1 whitespace-nowrap">{t("carrierRequirements")}</Label>
                                        <div className="flex flex-wrap gap-4 sm:gap-6">
                                            {["AT&T", "Verizon", "T-Mobile"].map((carrier) => (
                                                <div key={carrier} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={carrier}
                                                        checked={carrierRequirements[carrier]}
                                                        onCheckedChange={(checked) => setCarrierRequirements(p => ({ ...p, [carrier]: checked }))}
                                                    />
                                                    <label htmlFor={carrier} className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400">
                                                        {carrier}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Technology Supported */}
                                    <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                                        <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-1 whitespace-nowrap">{t("techSupported")}</Label>
                                        <div className="flex flex-wrap gap-4 sm:gap-6">
                                            {["4G LTE", "4G LTE & 5G NR"].map((tech) => (
                                                <div key={tech} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={tech}
                                                        checked={techSupported[tech]}
                                                        onCheckedChange={(checked) => setTechSupported(p => ({ ...p, [tech]: checked }))}
                                                    />
                                                    <label htmlFor={tech} className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400">
                                                        {tech}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information - Full Width */}
                                <div className="col-span-1 lg:col-span-2 space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <Label className="text-gray-600 dark:text-gray-300 font-medium">{t("additionalInfo")}</Label>
                                    <textarea
                                        value={additionalInfo}
                                        onChange={(e) => setAdditionalInfo(e.target.value)}
                                        placeholder={t("additionalInfoPlaceholder")}
                                        className="w-full min-h-[150px] p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 text-sm text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Map (Only visible in Step 1) */}
                {step === 1 && (
                    <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-zinc-800 h-[300px] lg:h-auto relative shrink-0">
                        <RomMap lat={coordinates.lat} lng={coordinates.lng} zoom={zoom} />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold shadow-sm z-[1000] text-gray-500 pointer-events-none">
                            {t("osmView")}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex justify-center items-center bg-white dark:bg-zinc-900 shrink-0 relative rounded-b-xl">
                {step === 2 && (
                    <Button
                        onClick={handleBack}
                        className="absolute left-4 bg-[#3D434A] text-white hover:bg-gray-700 rounded-full px-8 animate-in fade-in slide-in-from-left-2"
                    >
                        {t("back")}
                    </Button>
                )}

                <Button
                    onClick={handleNext}
                    className="bg-[#3D434A] text-white hover:bg-gray-700 rounded-full px-8"
                >
                    {step === 2 ? t("create") : t("next")}
                </Button>
            </div>
            <div className="absolute -z-10 bg-transparent"></div>
        </Card>
    )
}