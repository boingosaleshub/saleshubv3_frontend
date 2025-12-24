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

// Dynamically import the map to avoid SSR issues
const RomMap = dynamic(() => import("./rom-map"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
            Loading Map...
        </div>
    )
})

export function CreateRomForm() {
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
    const [systemType, setSystemType] = useState("") // DAS, ERRCS, DAS & ERRCS
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
    const showDasFields = systemType === "DAS" || systemType === "DAS & ERRCS"
    const showErrcsFields = systemType === "ERRCS" || systemType === "DAS & ERRCS"

    return (
        <Card className="w-full bg-white shadow-lg border-0 rounded-xl flex flex-col">
            {/* Header */}
            <div className="bg-[#3D434A] py-4 px-8 border-b-4 border-red-600 shrink-0">
                <h2 className="text-2xl font-bold text-white text-center">
                    {step === 1 ? "Venue Information" : "System Information"}
                </h2>
            </div>

            <div className="flex flex-1">
                {/* 
                    Left Column Logic:
                    Step 1: Width 50%
                    Step 2: Width 100%
                */}
                <div className={`${step === 1 ? "w-1/2 border-r border-gray-100" : "w-full"} p-8`}>
                    <div className="space-y-6 pb-8">

                        {/* 
                            STEP 1: VENUE INFORMATION 
                        */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                {/* Venue Name */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Venue Name</Label>
                                    <Input
                                        value={venueName} onChange={(e) => setVenueName(e.target.value)}
                                        placeholder="Type the venue name"
                                        className="bg-gray-50/50 border-gray-200 rounded-full px-4"
                                    />
                                </div>

                                {/* Venue Address */}
                                <div className="grid grid-cols-[160px_1fr] items-start gap-4">
                                    <Label className="text-gray-600 font-medium pt-2">Venue Address</Label>
                                    <div className="w-full">
                                        <Input
                                            value={address} onChange={handleAddressChange} onBlur={handleBlur}
                                            placeholder="Type the venue full address"
                                            className="bg-gray-100 border-none rounded-full px-4"
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

                                {/* Venue Type */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Venue Type</Label>
                                    <Select value={venueType} onValueChange={setVenueType}>
                                        <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                            <SelectValue placeholder="Select the venue type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="stadium">Stadium</SelectItem>
                                            <SelectItem value="arena">Arena</SelectItem>
                                            <SelectItem value="convention">Convention Center</SelectItem>
                                            <SelectItem value="office">Office Building</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Number of Floors */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Number of Floors</Label>
                                    <Input
                                        type="number" value={numFloors} onChange={(e) => setNumFloors(e.target.value)}
                                        placeholder="Type the total number of floors"
                                        className="bg-white border-gray-200 rounded-full px-4"
                                    />
                                </div>

                                {/* Gross sq. ft. */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Gross sq. ft. (Total)</Label>
                                    <Input
                                        type="number" value={grossSqFt} onChange={(e) => setGrossSqFt(e.target.value)}
                                        placeholder="Type the total gross sq. ft."
                                        className="bg-white border-gray-200 rounded-full px-4"
                                    />
                                </div>

                                {/* Parking Garage Toggle */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Parking Garage</Label>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={hasParkingGarage} onCheckedChange={setHasParkingGarage}
                                            className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-gray-200"
                                        />
                                        <span className="bg-[#3D434A] text-white text-xs font-bold px-3 py-1 rounded">
                                            {hasParkingGarage ? "YES" : "NO"}
                                        </span>
                                    </div>
                                </div>

                                {/* Parking Garage sq. ft. */}
                                {hasParkingGarage && (
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-gray-600 font-medium">Parking Garage sq. ft.</Label>
                                        <Input
                                            type="number" value={parkingSqFt} onChange={(e) => setParkingSqFt(e.target.value)}
                                            placeholder="Type the total number parking sq. ft."
                                            className="bg-white border-gray-200 rounded-full px-4"
                                        />
                                    </div>
                                )}

                                {/* Pops */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Populations Covered (PoPs)</Label>
                                    <Input
                                        type="number" value={pops} onChange={(e) => setPops(e.target.value)}
                                        placeholder="Type the total number of pops"
                                        className="bg-white border-gray-200 rounded-full px-4"
                                    />
                                </div>

                                <div className="border-t border-gray-100 my-4"></div>

                                {/* 3rd Party */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">3rd Party</Label>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={isThirdParty} onCheckedChange={setIsThirdParty}
                                            className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-gray-200"
                                        />
                                        <span className="bg-[#3D434A] text-white text-xs font-bold px-3 py-1 rounded">
                                            {isThirdParty ? "YES" : "NO"}
                                        </span>
                                    </div>
                                </div>

                                {isThirdParty && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                            <Label className="text-gray-600 font-medium">3rd Party Name</Label>
                                            <Input
                                                value={thirdPartyName} onChange={(e) => setThirdPartyName(e.target.value)}
                                                placeholder="Type the 3rd party name" className="bg-white border-gray-200 rounded-full px-4"
                                            />
                                        </div>
                                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                            <Label className="text-gray-600 font-medium">3rd Partner Fee (%)</Label>
                                            <Input
                                                type="number" value={thirdPartyFee} onChange={(e) => setThirdPartyFee(e.target.value)}
                                                placeholder="Enter the 3rd partner fee" className="bg-white border-gray-200 rounded-full px-4"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* AHJ Checklist */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">AHJ Requirements</Label>
                                    <div className="flex gap-6">
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
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Building Density</Label>
                                    <Select value={density} onValueChange={setDensity}>
                                        <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                            <SelectValue placeholder="Select the density" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sales Manager */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Sales Manager</Label>
                                    <Input
                                        value={salesManager} onChange={(e) => setSalesManager(e.target.value)}
                                        placeholder="Type the sales manager/account owner" className="bg-white border-gray-200 rounded-full px-4"
                                    />
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Expected Close Date</Label>
                                    <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} className="bg-white border-gray-200 rounded-full px-4" />
                                </div>
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Expected Construction Start Date</Label>
                                    <Input type="date" value={constructionDate} onChange={(e) => setConstructionDate(e.target.value)} className="bg-white border-gray-200 rounded-full px-4" />
                                </div>
                                <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                    <Label className="text-gray-600 font-medium">Expected On Air Date</Label>
                                    <Input type="date" value={onAirDate} onChange={(e) => setOnAirDate(e.target.value)} className="bg-white border-gray-200 rounded-full px-4" />
                                </div>
                            </div>
                        )}

                        {/* 
                            STEP 2: SYSTEM INFORMATION 
                        */}
                        {step === 2 && (
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                                {/* Left Col Fields */}
                                <div className="space-y-6">
                                    {/* System Type */}
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <Label className="text-gray-600 font-medium">System Type</Label>
                                        <Select value={systemType} onValueChange={setSystemType}>
                                            <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                                <SelectValue placeholder="Select the type of the system" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DAS">DAS</SelectItem>
                                                <SelectItem value="ERRCS">ERRCS</SelectItem>
                                                <SelectItem value="DAS & ERRCS">DAS & ERRCS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* DAS Architecture (Hidden if ERRCS Only) */}
                                    {showDasFields && (
                                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                            <Label className="text-gray-600 font-medium">DAS Architecture</Label>
                                            <Select value={dasArchitecture} onValueChange={setDasArchitecture}>
                                                <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                                    <SelectValue placeholder="Select architecture" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Passive">Passive</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* OEM Selection Criteria */}
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <Label className="text-gray-600 font-medium">OEM Selection Criteria</Label>
                                        <Select value={oemCriteria} onValueChange={setOemCriteria}>
                                            <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                                <SelectValue placeholder="OEM Selection Criteria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="performance">Performance</SelectItem>
                                                <SelectItem value="cost">Cost</SelectItem>
                                                <SelectItem value="legacy">Legacy Support</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* DAS Vendor (Hidden if ERRCS Only) */}
                                    {showDasFields && (
                                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                            <Label className="text-gray-600 font-medium">DAS Vendor</Label>
                                            <Select value={dasVendor} onValueChange={setDasVendor}>
                                                <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                                    <SelectValue placeholder="Select DAS Vendor" />
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
                                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                            <Label className="text-gray-600 font-medium">BDA/Booster Vendor</Label>
                                            <Select value={bdaVendor} onValueChange={setBdaVendor}>
                                                <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                                    <SelectValue placeholder="Select BDA Vendor" />
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
                                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                            <Label className="text-gray-600 font-medium">ERCES Coverage Area</Label>
                                            <Select value={errcsCoverage} onValueChange={setErrcsCoverage}>
                                                <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                                    <SelectValue placeholder="Select Coverage Area" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full">Full Building</SelectItem>
                                                    <SelectItem value="critical">Critical Areas Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* # of Sectors Criteria */}
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <Label className="text-gray-600 font-medium"># of Sectors Criteria</Label>
                                        <Select value={sectorCriteria} onValueChange={setSectorCriteria}>
                                            <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                                <SelectValue placeholder="Select the criteria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="capacity">Capacity</SelectItem>
                                                <SelectItem value="coverage">Coverage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Number of Sectors */}
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <Label className="text-gray-600 font-medium">Number of Sectors</Label>
                                        <Input
                                            value={numSectors}
                                            readOnly
                                            className="bg-gray-200/50 border-gray-200 rounded-full px-4 text-gray-700"
                                        />
                                    </div>
                                </div>

                                {/* Right Col Fields */}
                                <div className="space-y-6">
                                    {/* Signal Source per Carrier */}
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <Label className="text-gray-600 font-medium">Signal Source per Carrier</Label>
                                        <Select value={signalSource} onValueChange={setSignalSource}>
                                            <SelectTrigger className="bg-white border-gray-200 rounded-full px-4">
                                                <SelectValue placeholder="Select signal source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="off-air">Off-Air</SelectItem>
                                                <SelectItem value="bts">Base Transceiver Station</SelectItem>
                                                <SelectItem value="smallcell">Small Cell</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Carrier Requirements */}
                                    <div className="grid grid-cols-[160px_1fr] items-start gap-4">
                                        <Label className="text-gray-600 font-medium pt-1">Carrier Requirements</Label>
                                        <div className="flex gap-6">
                                            {["AT&T", "Verizon", "T-Mobile"].map((carrier) => (
                                                <div key={carrier} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={carrier}
                                                        checked={carrierRequirements[carrier]}
                                                        onCheckedChange={(checked) => setCarrierRequirements(p => ({ ...p, [carrier]: checked }))}
                                                    />
                                                    <label htmlFor={carrier} className="text-sm font-medium leading-none text-gray-500">
                                                        {carrier}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Technology Supported */}
                                    <div className="grid grid-cols-[160px_1fr] items-start gap-4">
                                        <Label className="text-gray-600 font-medium pt-1">Technology Supported</Label>
                                        <div className="flex gap-6">
                                            {["4G LTE", "4G LTE & 5G NR"].map((tech) => (
                                                <div key={tech} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={tech}
                                                        checked={techSupported[tech]}
                                                        onCheckedChange={(checked) => setTechSupported(p => ({ ...p, [tech]: checked }))}
                                                    />
                                                    <label htmlFor={tech} className="text-sm font-medium leading-none text-gray-500">
                                                        {tech}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Right Column: Map (Only visible in Step 1) */}
                {step === 1 && (
                    <div className="w-1/2 bg-gray-50 sticky top-0 h-screen relative shrink-0">
                        <RomMap lat={coordinates.lat} lng={coordinates.lng} zoom={zoom} />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold shadow-sm z-[1000] text-gray-500 pointer-events-none">
                            OpenStreetMap View
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 flex justify-center items-center bg-white shrink-0 relative">
                {step === 2 && (
                    <Button
                        onClick={handleBack}
                        className="absolute left-4 bg-[#3D434A] text-white hover:bg-gray-700 rounded-full px-8 animate-in fade-in slide-in-from-left-2"
                    >
                        Back
                    </Button>
                )}

                <Button
                    onClick={handleNext}
                    className="bg-[#3D434A] text-white hover:bg-gray-700 rounded-full px-8"
                >
                    {step === 2 ? "Save" : "Next"}
                </Button>
            </div>
            <div className="absolute -z-10 bg-transparent"></div>
        </Card>
    )
}