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
import { useLanguage } from "@/components/providers/language-provider"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const CoverageMap = dynamic(() => import("./coverage-map"), {
    ssr: false,
    loading: () => null
})

export function CreateCoveragePlotForm() {
    const { t } = useLanguage()
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

    // Progress tracking states
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState("")
    const [stepVisible, setStepVisible] = useState(true)

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
        setProgress(0)
        setCurrentStep("Starting...")
        setStepVisible(true)

        try {
            const backendUrl = process.env.NEXT_PUBLIC_PLAYWRIGHT_BACKEND_URL || ''
            const apiUrl = backendUrl ? `${backendUrl}/api/automate/stream` : '/api/coverage-plot/automate/stream'

            console.log('Connecting to SSE endpoint:', apiUrl)

            // Use EventSource for SSE
            const eventSource = new EventSource(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: address.trim(),
                    carriers: selectedCarriers,
                    coverageTypes: selectedCoverageTypes
                })
            })

            // Since EventSource doesn't support POST, we'll use fetch with streaming
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: address.trim(),
                    carriers: selectedCarriers,
                    coverageTypes: selectedCoverageTypes
                })
            })

            if (!response.ok) {
                throw new Error('Failed to start automation')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let finalData = null

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))

                            if (data.final) {
                                // Final response with screenshots
                                finalData = data
                            } else if (data.status === 'error') {
                                throw new Error(data.step)
                            } else {
                                // Progress update
                                setProgress(data.progress)

                                // Fade out, change text, fade in
                                if (data.step !== currentStep) {
                                    setStepVisible(false)
                                    setTimeout(() => {
                                        setCurrentStep(data.step)
                                        setStepVisible(true)
                                    }, 150) // Half of transition duration
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e)
                        }
                    }
                }
            }

            if (finalData && finalData.success && finalData.screenshots && finalData.screenshots.length > 0) {
                console.log(`Processing ${finalData.screenshots.length} screenshot(s)...`)

                // Download screenshots
                for (let i = 0; i < finalData.screenshots.length; i++) {
                    const screenshot = finalData.screenshots[i]

                    if (screenshot.buffer && screenshot.filename) {
                        try {
                            console.log(`[${i + 1}/${finalData.screenshots.length}] Downloading: ${screenshot.filename} (${screenshot.size || 'unknown'} KB)`)

                            const byteCharacters = atob(screenshot.buffer)
                            const byteNumbers = new Array(byteCharacters.length)
                            for (let j = 0; j < byteCharacters.length; j++) {
                                byteNumbers[j] = byteCharacters.charCodeAt(j)
                            }
                            const byteArray = new Uint8Array(byteNumbers)
                            const blob = new Blob([byteArray], { type: 'image/png' })

                            console.log(`  Blob created: ${(blob.size / 1024).toFixed(2)} KB`)

                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = screenshot.filename
                            document.body.appendChild(a)
                            a.click()

                            await new Promise(resolve => setTimeout(resolve, 100))

                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)

                            console.log(`  ✓ Downloaded: ${screenshot.filename}`)

                            if (i < finalData.screenshots.length - 1) {
                                await new Promise(resolve => setTimeout(resolve, 300))
                            }
                        } catch (downloadError) {
                            console.error(`Error downloading ${screenshot.filename}:`, downloadError)
                        }
                    } else {
                        console.error(`Screenshot ${i + 1} missing buffer or filename:`, screenshot)
                    }
                }

                // Hide loader and show success modal
                setIsLoading(false)
                setShowSuccessModal(true)
            } else {
                throw new Error('No screenshots received from server')
            }
        } catch (error) {
            console.error('Error creating coverage plot:', error)
            setIsLoading(false)
            setErrorMessage(error.message || "Failed to generate screenshots")
        } finally {
            setIsCreating(false)
        }
    }

    // Helper for coverage type labels to map code keys to translation keys
    const getCoverageTypeLabel = (type) => {
        if (type === "Indoor") return t("indoor")
        if (type === "Outdoor") return t("outdoor")
        if (type === "Indoor & Outdoor") return t("indoorOutdoor")
        return type
    }

    return (
        <div className="w-full relative bg-gray-50 dark:bg-zinc-950 transition-colors duration-300" style={{ minHeight: 'calc(100vh - 8rem)' }}>
            {/* GIF Loader Overlay with Progress Bar */}
            {isLoading && (
                <div className="absolute inset-0 z-40 bg-white flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md px-4">
                        <Image
                            src="/success.gif"
                            alt="Loading..."
                            width={400}
                            height={400}
                            className="object-contain"
                            unoptimized
                        />

                        {/* Progress Bar */}
                        <div className="w-full space-y-3">
                            {/* Progress Bar Track */}
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Progress Percentage */}
                            <div className="text-center">
                                <span className="text-2xl font-bold text-gray-700">{Math.round(progress)}%</span>
                            </div>

                            {/* Current Step with Fade Animation */}
                            <div className="text-center min-h-[24px]">
                                <p
                                    className={`text-sm text-gray-600 transition-opacity duration-300 ${stepVisible ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    {currentStep}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">{t("success")}</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            {t("snapshotsDownloaded")} <strong>{address}</strong> {t("hasBeenDownloaded")}
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
                            {t("close")}
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
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t("createCoveragePlot")}
                                </h1>
                                <p className="text-sm md:text-base text-gray-400 dark:text-gray-500 mb-10">
                                    {t("enterAddressBelow")}
                                </p>

                                <div className="flex flex-col items-start gap-3 max-w-2xl mx-auto">
                                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                                        {t("venueAddress")}
                                    </Label>
                                    <div className="relative w-full">
                                        <Input
                                            value={address}
                                            onChange={handleAddressChange}
                                            onKeyDown={handleAddressKeyDown}
                                            onBlur={handleBlur}
                                            placeholder={t("venueAddressPlaceholder")}
                                            className="w-full rounded-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 pl-4 pr-11 h-11 text-sm md:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                            <Search className="h-4 w-4 text-gray-500" />
                                        </div>
                                        {suggestions.length > 0 && (
                                            <div className="w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden z-10 relative">
                                                {suggestions.map((item) => (
                                                    <div
                                                        key={item.place_id}
                                                        className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-xs text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-zinc-800 last:border-0 truncate"
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
                        <Card className="w-full bg-white dark:bg-zinc-900 shadow-lg border-0 dark:border dark:border-zinc-800 rounded-xl flex flex-col">
                            <div className="bg-[#3D434A] dark:bg-zinc-950 py-4 px-8 border-b-4 border-red-600 shrink-0 rounded-t-xl">
                                <h2 className="text-2xl font-bold text-white text-center">
                                    {t("coveragePlot")}
                                </h2>
                            </div>

                            <div className="flex flex-col lg:flex-row flex-1">
                                {/* Left Column: Form */}
                                <div className="w-full lg:w-1/2 lg:border-r border-gray-100 dark:border-zinc-800 p-4 lg:p-8">
                                    <div className="space-y-6 pb-8">
                                        {/* Venue Address */}
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-2 whitespace-nowrap">{t("venueAddress")}</Label>
                                            <div className="w-full">
                                                <Input
                                                    value={address}
                                                    onChange={handleAddressChange}
                                                    onBlur={handleBlur}
                                                    placeholder={t("venueAddressPlaceholder")}
                                                    className="bg-gray-100 dark:bg-zinc-800 border-none rounded-full px-4 w-full text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
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

                                        {/* Carrier Requirements */}
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-1 whitespace-nowrap">{t("carrierRequirements")}</Label>
                                            <div className="flex flex-wrap gap-4 sm:gap-6">
                                                {["AT&T", "Verizon", "T-Mobile"].map((carrier) => (
                                                    <div key={carrier} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`carrier-${carrier}`}
                                                            checked={carrierRequirements[carrier]}
                                                            onCheckedChange={(checked) => setCarrierRequirements(p => ({ ...p, [carrier]: checked }))}
                                                        />
                                                        <label htmlFor={`carrier-${carrier}`} className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400 cursor-pointer">
                                                            {carrier}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Coverage Type */}
                                        <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4">
                                            <Label className="text-gray-600 dark:text-gray-300 font-medium sm:pt-1 whitespace-nowrap">{t("coverageTypeLabel")}</Label>
                                            <div className="flex flex-wrap gap-4 sm:gap-6">
                                                {["Indoor", "Outdoor", "Indoor & Outdoor"].map((type) => (
                                                    <div key={type} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`coverage-${type}`}
                                                            checked={coverageType[type]}
                                                            onCheckedChange={(checked) => setCoverageType(p => ({ ...p, [type]: checked }))}
                                                        />
                                                        <label htmlFor={`coverage-${type}`} className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400 cursor-pointer">
                                                            {getCoverageTypeLabel(type)}
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
                                <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-zinc-800 h-[300px] lg:h-auto relative shrink-0">
                                    <CoverageMap lat={coordinates.lat} lng={coordinates.lng} zoom={zoom} />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold shadow-sm z-40 text-gray-500 pointer-events-none">
                                        {t("osmView")}
                                    </div>
                                </div>
                            </div>

                            {/* Footer: Create Button */}
                            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex justify-center items-center bg-white dark:bg-zinc-900 shrink-0 relative rounded-b-xl">
                                <Button
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? t("creating") : t("create")}
                                </Button>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}