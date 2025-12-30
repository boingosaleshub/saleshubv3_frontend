"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const CoverageMap = dynamic(() => import("./coverage-map"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
            Loading Map...
        </div>
    )
})

export function CreateCoveragePlotForm() {
    const [step, setStep] = useState(1)
    const [address, setAddress] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060 })
    const [zoom, setZoom] = useState(13)

    const [carrierRequirements, setCarrierRequirements] = useState({
        "AT&T": false,
        "Verizon": false,
        "T-Mobile": false
    })
    const [coverageType, setCoverageType] = useState({
        "Indoor": false,
        "Outdoor": false,
        "Indoor & Outdoor": false
    })

    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

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

    const handleAddressKeyDown = (e) => {
        if (e.key === 'Enter' && address.trim()) {
            e.preventDefault()
            if (suggestions.length > 0) {
                handleSelectAddress(suggestions[0])
            }
            setStep(2)
            window.scrollTo(0, 0)
        }
    }

    const handleCreate = async () => {
        setErrorMessage("")

        if (!address.trim()) {
            setErrorMessage("Please enter an address")
            return
        }

        const selectedCarriers = Object.entries(carrierRequirements)
            .filter(([_, checked]) => checked)
            .map(([carrier]) => carrier)

        if (selectedCarriers.length === 0) {
            setErrorMessage("Please select at least one carrier")
            return
        }

        const selectedCoverageTypes = Object.entries(coverageType)
            .filter(([_, checked]) => checked)
            .map(([type]) => type)

        if (selectedCoverageTypes.length === 0) {
            setErrorMessage("Please select at least one coverage type")
            return
        }

        setIsCreating(true)
        setIsLoading(true)

        // Abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minutes

        try {
            const backendUrl = process.env.NEXT_PUBLIC_PLAYWRIGHT_BACKEND_URL || ''
            const apiUrl = backendUrl ? `${backendUrl}/api/automate` : '/api/coverage-plot/automate'

            console.log('Sending request to:', apiUrl)
            console.log('Payload:', { address: address.trim(), carriers: selectedCarriers, coverageTypes: selectedCoverageTypes })

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: address.trim(),
                    carriers: selectedCarriers,
                    coverageTypes: selectedCoverageTypes
                }),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            console.log('Response status:', response.status)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to generate screenshots')
            }

            const data = await response.json()
            console.log('Response data:', { success: data.success, screenshotCount: data.screenshots?.length })

            if (data.success && data.screenshots && data.screenshots.length > 0) {
                console.log(`Processing ${data.screenshots.length} screenshot(s)...`)

                // Download all screenshots
                for (const screenshot of data.screenshots) {
                    if (screenshot.buffer && screenshot.filename) {
                        try {
                            console.log(`Downloading: ${screenshot.filename} (${screenshot.size || 'unknown'} KB)`)

                            // Convert base64 to blob
                            const byteCharacters = atob(screenshot.buffer)
                            const byteNumbers = new Array(byteCharacters.length)
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i)
                            }
                            const byteArray = new Uint8Array(byteNumbers)
                            const blob = new Blob([byteArray], { type: 'image/png' })

                            // Create download link
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = screenshot.filename
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)

                            console.log(`✓ Downloaded: ${screenshot.filename}`)
                        } catch (downloadError) {
                            console.error(`Error downloading ${screenshot.filename}:`, downloadError)
                        }
                    }
                }

                // Hide loader and show success modal
                setIsLoading(false)
                setShowSuccessModal(true)
            } else {
                throw new Error('No screenshots received from server')
            }
        } catch (error) {
            clearTimeout(timeoutId)
            console.error('Error creating coverage plot:', error)
            setIsLoading(false)

            if (error.name === 'AbortError') {
                setErrorMessage('Request timeout - The automation is taking longer than expected. Please try again.')
            } else {
                setErrorMessage(error.message || "Failed to generate screenshots")
            }
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="w-full relative" style={{ minHeight: 'calc(100vh - 8rem)' }}>
            {/* GIF Loader Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-[9999] bg-white flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <Image
                            src="/success.gif"
                            alt="Loading..."
                            width={400}
                            height={400}
                            className="object-contain"
                            unoptimized
                        />
                        <p className="mt-4 text-gray-600 text-sm">Processing automation... This may take 2-3 minutes</p>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
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
                                // Reset form
                                setStep(1)
                                setAddress("")
                                setCarrierRequirements({
                                    "AT&T": false,
                                    "Verizon": false,
                                    "T-Mobile": false
                                })
                                setCoverageType({
                                    "Indoor": false,
                                    "Outdoor": false,
                                    "Indoor & Outdoor": false
                                })
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
                                                {["AT&T", "Verizon", "T-Mobile"].map((carrier) => (
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
                                                {["Indoor", "Outdoor", "Indoor & Outdoor"].map((type) => (
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
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold shadow-sm z-[1000] text-gray-500 pointer-events-none">
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