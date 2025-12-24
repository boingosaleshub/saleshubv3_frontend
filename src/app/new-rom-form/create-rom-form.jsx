"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    const [loading, setLoading] = useState(false)

    // Form State
    const [hasParkingGarage, setHasParkingGarage] = useState(true)
    const [address, setAddress] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    // Map State (Default to New York)
    const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060 })
    const [zoom, setZoom] = useState(13)

    // Address Autocomplete Debounce
    const debounceRef = useRef(null)

    const searchAddress = async (query) => {
        if (!query || query.length < 3) return

        setIsSearching(true)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
            const data = await res.json()
            setSuggestions(data || [])
            return data
        } catch (error) {
            console.error("Error fetching address suggestions:", error)
            return []
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

    // Auto-update map when suggestions arrive
    useEffect(() => {
        if (suggestions.length > 0) {
            // Auto-select first suggestion and update map
            const item = suggestions[0]
            const lat = parseFloat(item.lat)
            const lon = parseFloat(item.lon)
            setCoordinates({ lat, lng: lon })
            setZoom(15)
        }
    }, [suggestions])

    const handleBlur = () => {
        // Hide suggestions after a delay to allow click event
        setTimeout(() => {
            setSuggestions([])
        }, 200)
    }


    return (
        <Card className="w-full bg-white shadow-lg border-0 overflow-hidden rounded-xl flex flex-col h-[800px]">
            {/* Header */}
            <div className="bg-[#3D434A] py-4 px-8 border-b-4 border-red-600">
                <h2 className="text-2xl font-bold text-white text-center">Venue Information</h2>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Column: Form */}
                <div className="w-1/2 p-8 overflow-y-auto border-r border-gray-100">
                    <div className="space-y-6">

                        {/* Venue Name */}
                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                            <Label className="text-gray-600 font-medium">Venue Name</Label>
                            <Input
                                placeholder="Type the venue name"
                                className="bg-gray-50/50 border-gray-200 rounded-full px-4"
                            />
                        </div>

                        {/* Venue Address */}
                        <div className="grid grid-cols-[160px_1fr] items-start gap-4">
                            <Label className="text-gray-600 font-medium pt-2">Venue Address</Label>
                            <div className="w-full">
                                <Input
                                    value={address}
                                    onChange={handleAddressChange}
                                    onBlur={handleBlur}
                                    placeholder="Type the venue full address"
                                    className="bg-gray-100 border-none rounded-full px-4"
                                />
                                {/* Suggestions List - In flow to avoid clipping */}
                                {suggestions.length > 0 && (
                                    <div className="w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
                            <Select>
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
                                type="number"
                                placeholder="Type the total number of floors"
                                className="bg-white border-gray-200 rounded-full px-4"
                            />
                        </div>

                        {/* Gross sq. ft. */}
                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                            <Label className="text-gray-600 font-medium">Gross sq. ft. (Total)</Label>
                            <Input
                                type="number"
                                placeholder="Type the total gross sq. ft."
                                className="bg-white border-gray-200 rounded-full px-4"
                            />
                        </div>

                        {/* Parking Garage Toggle */}
                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                            <Label className="text-gray-600 font-medium">Parking Garage</Label>
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={hasParkingGarage}
                                    onCheckedChange={setHasParkingGarage}
                                    className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-gray-200"
                                />
                                <span className="bg-[#3D434A] text-white text-xs font-bold px-3 py-1 rounded">
                                    {hasParkingGarage ? "YES" : "NO"}
                                </span>
                            </div>
                        </div>

                        {/* Parking Garage sq. ft. (Conditional) */}
                        {hasParkingGarage && (
                            <div className="grid grid-cols-[160px_1fr] items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-gray-600 font-medium">Parking Garage sq. ft.</Label>
                                <Input
                                    type="number"
                                    placeholder="Type the total number parking sq. ft."
                                    className="bg-white border-gray-200 rounded-full px-4"
                                />
                            </div>
                        )}

                        {/* Populations Covered */}
                        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                            <Label className="text-gray-600 font-medium">Populations Covered (PoPs)</Label>
                            <Input
                                type="number"
                                placeholder="Type the total number of pops"
                                className="bg-white border-gray-200 rounded-full px-4"
                            />
                        </div>

                    </div>
                </div>

                {/* Right Column: Map */}
                <div className="w-1/2 bg-gray-50 h-full relative">
                    <RomMap lat={coordinates.lat} lng={coordinates.lng} zoom={zoom} />

                    {/* Map Overlay info */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold shadow-sm z-[1000] text-gray-500 pointer-events-none">
                        OpenStreetMap View
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-4 bg-white">
                <Button
                    className="bg-[#3D434A] text-white hover:bg-gray-700 rounded-full px-8"
                >
                    Next
                </Button>
            </div>
        </Card>
    )
}