"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import {
    Loader2,
    ArrowLeft,
    MapPin,
    Building2,
    Layers,
    Calendar,
    Clock,
    User as UserIcon,
    FileSpreadsheet,
    Image as ImageIcon,
    Download,
    Cpu,
    Radio,
    Signal,
    ParkingCircle,
    Users,
    Shield,
    Gauge,
    Hash,

    CircleDot,
    Info,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import dynamic from "next/dynamic"
import Image from "next/image"

const CoverageMap = dynamic(
    () => import("../../coverage-plot/new-form/coverage-map"),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
        ),
    }
)

function DetailItem({ icon: Icon, label, children }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-red-500" />}
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {label}
                </span>
            </div>
            <div className="pl-6">{children}</div>
        </div>
    )
}

function formatDate(dateStr) {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

function formatDateTime(dateStr) {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export default function RomDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user } = useAuthStore()

    const [rom, setRom] = useState(null)
    const [creator, setCreator] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)

    useEffect(() => {
        if (id) fetchRomData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const fetchRomData = async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            const { data: romData, error: romError } = await supabase
                .from("rom_proposals")
                .select("*")
                .eq("id", id)
                .single()

            if (romError) throw romError
            setRom(romData)

            const { data: userData, error: userError } = await supabase
                .from("Users")
                .select("id, name, email, role")
                .eq("id", romData.user_id)
                .single()

            if (!userError && userData) setCreator(userData)
        } catch (err) {
            console.error("Error fetching ROM proposal:", err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadScreenshot = async (url, index) => {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = downloadUrl
            link.download = `rom_screenshot_${index + 1}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)
        } catch (err) {
            console.error("Download error:", err)
        }
    }

    const handleDownloadAllScreenshots = async () => {
        if (!rom?.screenshot_urls) return
        for (let i = 0; i < rom.screenshot_urls.length; i++) {
            await handleDownloadScreenshot(rom.screenshot_urls[i], i)
            await new Promise((r) => setTimeout(r, 300))
        }
    }

    const getFileNameFromUrl = (url) => {
        try {
            const pathname = new URL(url).pathname
            const encoded = pathname.split('/').pop()
            return decodeURIComponent(encoded) || 'rom_pricing.xlsx'
        } catch {
            return 'rom_pricing.xlsx'
        }
    }

    const handleDownloadExcel = async (url, index) => {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = downloadUrl
            link.download = getFileNameFromUrl(url)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)
        } catch (err) {
            console.error("Download error:", err)
        }
    }

    const handleDownloadAllExcels = async () => {
        if (!rom?.excel_file_urls) return
        for (let i = 0; i < rom.excel_file_urls.length; i++) {
            await handleDownloadExcel(rom.excel_file_urls[i], i)
            await new Promise((r) => setTimeout(r, 300))
        }
    }

    const getInitials = (name) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    <p className="text-sm text-muted-foreground">Loading ROM proposal...</p>
                </div>
            </div>
        )
    }

    if (error || !rom) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-red-500 mb-2 font-semibold">
                        {error ? "Error loading ROM proposal" : "ROM proposal not found"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        {error || "The ROM proposal you're looking for doesn't exist."}
                    </p>
                    <Button variant="outline" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    const screenshots = Array.isArray(rom.screenshot_urls) ? rom.screenshot_urls : []
    const excelFiles = Array.isArray(rom.excel_file_urls) ? rom.excel_file_urls : []
    const hasCoordinates = rom.latitude && rom.longitude

    const getVendorDisplay = () => {
        const vendors = [rom.das_vendor, rom.bda_vendor].filter(Boolean)
        if (vendors.length === 0) return "N/A"
        return [...new Set(vendors)].join(" / ")
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3D434A] to-[#4a5058] dark:from-[#3D434A] dark:to-[#4a5058] py-6 px-8 border-b-4 border-red-600 rounded-t-2xl mx-4 mt-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-white hover:bg-white/10 gap-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back
                    </Button>
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <FileSpreadsheet className="h-7 w-7" />
                        ROM Proposal Details
                    </h2>
                    <div className="w-24" />
                </div>
            </div>

            {/* Venue Information + Map */}
            <div className="mx-4 mt-6">
                <Card className="overflow-hidden border shadow-lg bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left: Venue Info */}
                        <div className="w-full lg:w-1/2 p-6 lg:p-8 space-y-5">
                            <DetailItem icon={Building2} label="Venue Name">
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {rom.venue_name}
                                </p>
                            </DetailItem>

                            <Separator className="dark:bg-gray-800" />

                            <DetailItem icon={MapPin} label="Venue Address">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {rom.venue_address}
                                </p>
                            </DetailItem>

                            <Separator className="dark:bg-gray-800" />

                            <DetailItem icon={Layers} label="Venue Type">
                                <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium px-3 py-1 text-sm">
                                    {rom.venue_type}
                                </Badge>
                            </DetailItem>

                            <Separator className="dark:bg-gray-800" />

                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem icon={Hash} label="Floors">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {rom.num_floors}
                                    </span>
                                </DetailItem>
                                <DetailItem icon={Gauge} label="Gross Sq Ft">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {Number(rom.gross_sq_ft).toLocaleString()} sq ft
                                    </span>
                                </DetailItem>
                            </div>

                            <Separator className="dark:bg-gray-800" />

                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem icon={ParkingCircle} label="Parking Garage">
                                    <Badge
                                        variant="secondary"
                                        className={rom.has_parking_garage
                                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0 font-medium"
                                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-0 font-medium"
                                        }
                                    >
                                        {rom.has_parking_garage ? "Yes" : "No"}
                                    </Badge>
                                </DetailItem>
                                {rom.has_parking_garage && rom.parking_sq_ft && (
                                    <DetailItem icon={Gauge} label="Parking Sq Ft">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {Number(rom.parking_sq_ft).toLocaleString()} sq ft
                                        </span>
                                    </DetailItem>
                                )}
                            </div>

                            <Separator className="dark:bg-gray-800" />

                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem icon={Users} label="POPs">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {rom.pops?.toLocaleString()}
                                    </span>
                                </DetailItem>
                                <DetailItem icon={Signal} label="Building Density">
                                    <Badge variant="outline" className="border-gray-200 dark:border-gray-700 font-medium text-sm">
                                        {rom.building_density}
                                    </Badge>
                                </DetailItem>
                            </div>

                            {rom.ahj_requirements && rom.ahj_requirements.length > 0 && (
                                <>
                                    <Separator className="dark:bg-gray-800" />
                                    <DetailItem icon={Shield} label="AHJ Requirements">
                                        <div className="flex flex-wrap gap-2">
                                            {rom.ahj_requirements.map((req, i) => (
                                                <Badge
                                                    key={i}
                                                    className="bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 border-0 font-medium px-3 py-1 text-sm"
                                                >
                                                    {req}
                                                </Badge>
                                            ))}
                                        </div>
                                    </DetailItem>
                                </>
                            )}

                            {rom.is_third_party && (
                                <>
                                    <Separator className="dark:bg-gray-800" />
                                    <DetailItem icon={Users} label="Third Party">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {rom.third_party_name || "N/A"}
                                            </p>
                                            {rom.third_party_fee && (
                                                <p className="text-xs text-muted-foreground">
                                                    Fee: ${Number(rom.third_party_fee).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </DetailItem>
                                </>
                            )}
                        </div>

                        {/* Right: Map */}
                        <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-gray-900 h-[400px] lg:h-auto lg:min-h-[550px] relative">
                            {hasCoordinates ? (
                                <>
                                    <CoverageMap
                                        lat={rom.latitude}
                                        lng={rom.longitude}
                                        zoom={rom.zoom_level || 16}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm z-40 text-gray-600 dark:text-gray-400 pointer-events-none">
                                        OpenStreetMap View
                                    </div>
                                </>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No location data available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Screenshots Section */}
            <div className="mx-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-red-500" />
                        Screenshots
                        {screenshots.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {screenshots.length}
                            </Badge>
                        )}
                    </h3>
                    {screenshots.length > 0 && (
                        <Button
                            onClick={handleDownloadAllScreenshots}
                            variant="outline"
                            size="sm"
                            className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Download All
                        </Button>
                    )}
                </div>

                {screenshots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {screenshots.map((url, index) => (
                            <Card
                                key={index}
                                className="overflow-hidden group relative border shadow-md bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl"
                            >
                                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                                    <Image
                                        src={url}
                                        alt={`ROM screenshot ${index + 1}`}
                                        fill
                                        className="object-cover cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
                                        onClick={() => setSelectedImage(url)}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center pointer-events-none">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDownloadScreenshot(url, index)
                                            }}
                                            variant="secondary"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-2 pointer-events-auto"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Screenshot {index + 1}
                                    </span>
                                    <Button
                                        onClick={() => handleDownloadScreenshot(url, index)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:text-red-500"
                                        title="Download screenshot"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-white dark:bg-[#1a1d21] border-dashed rounded-xl">
                        <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">No screenshots available</p>
                    </Card>
                )}
            </div>

            {/* Fullscreen Image Preview */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setSelectedImage(null)}
                >
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 right-4 bg-white hover:bg-gray-200 text-black rounded-full h-10 w-10 z-50"
                        onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImage(null)
                        }}
                    >
                        <span className="text-lg font-bold">✕</span>
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 right-16 bg-white hover:bg-gray-200 text-black rounded-full h-10 w-10 z-50"
                        onClick={(e) => {
                            e.stopPropagation()
                            const idx = screenshots.indexOf(selectedImage)
                            handleDownloadScreenshot(selectedImage, idx >= 0 ? idx : 0)
                        }}
                        title="Download"
                    >
                        <Download className="h-5 w-5" />
                    </Button>
                    <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
                        <Image
                            src={selectedImage}
                            alt="Full-size screenshot"
                            fill
                            className="object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Excel Files Section */}
            <div className="mx-4 mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-red-500" />
                        Pricing Excel Files
                        {excelFiles.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {excelFiles.length}
                            </Badge>
                        )}
                    </h3>
                    {excelFiles.length > 0 && (
                        <Button
                            onClick={handleDownloadAllExcels}
                            variant="outline"
                            size="sm"
                            className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Download All
                        </Button>
                    )}
                </div>

                {excelFiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {excelFiles.map((url, index) => (
                            <Card
                                key={index}
                                className="overflow-hidden group border shadow-md bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                onClick={() => handleDownloadExcel(url, index)}
                            >
                                <div className="p-5 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                        <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={getFileNameFromUrl(url)}>
                                            {getFileNameFromUrl(url)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Click to download .xlsx
                                        </p>
                                    </div>
                                    <Download className="h-5 w-5 text-gray-300 group-hover:text-red-500 transition-colors shrink-0" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-white dark:bg-[#1a1d21] border-dashed rounded-xl">
                        <FileSpreadsheet className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">No Excel files available</p>
                    </Card>
                )}
            </div>

            {/* System Information */}
            <div className="mx-4 mt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-red-500" />
                    System Information
                </h3>
                <Card className="overflow-hidden border shadow-lg bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DetailItem icon={Cpu} label="System Type">
                            <Badge className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium px-3 py-1 text-sm">
                                {rom.system_type}
                            </Badge>
                        </DetailItem>

                        {rom.das_architecture && (
                            <DetailItem icon={Layers} label="DAS Architecture">
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {rom.das_architecture}
                                </span>
                            </DetailItem>
                        )}

                        <DetailItem icon={Gauge} label="OEM Criteria">
                            <Badge variant="outline" className="border-gray-200 dark:border-gray-700 font-medium text-sm capitalize">
                                {rom.oem_criteria}
                            </Badge>
                        </DetailItem>

                        {rom.das_vendor && (
                            <DetailItem icon={Building2} label="DAS Vendor">
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {rom.das_vendor}
                                </span>
                            </DetailItem>
                        )}

                        {rom.bda_vendor && (
                            <DetailItem icon={Building2} label="BDA Vendor">
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {rom.bda_vendor}
                                </span>
                            </DetailItem>
                        )}

                        {rom.erces_coverage && (
                            <DetailItem icon={Signal} label="ERCES Coverage">
                                <Badge variant="outline" className="border-gray-200 dark:border-gray-700 font-medium text-sm capitalize">
                                    {rom.erces_coverage}
                                </Badge>
                            </DetailItem>
                        )}

                        <DetailItem icon={CircleDot} label="Sector Criteria">
                            <Badge variant="outline" className="border-gray-200 dark:border-gray-700 font-medium text-sm capitalize">
                                {rom.sector_criteria}
                            </Badge>
                        </DetailItem>

                        <DetailItem icon={Hash} label="Number of Sectors">
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {rom.num_sectors}
                            </span>
                        </DetailItem>

                        <DetailItem icon={Radio} label="Signal Source">
                            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 border-0 font-medium px-3 py-1 text-sm">
                                {rom.signal_source}
                            </Badge>
                        </DetailItem>
                    </div>

                    <Separator className="my-6 dark:bg-gray-800" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem icon={Radio} label="Carrier Requirements">
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(rom.carrier_requirements) && rom.carrier_requirements.length > 0 ? (
                                    rom.carrier_requirements.map((carrier, i) => (
                                        <Badge
                                            key={i}
                                            className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium px-3 py-1 text-sm"
                                        >
                                            {carrier}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">None specified</span>
                                )}
                            </div>
                        </DetailItem>

                        <DetailItem icon={Signal} label="Tech Supported">
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(rom.tech_supported) && rom.tech_supported.length > 0 ? (
                                    rom.tech_supported.map((tech, i) => (
                                        <Badge
                                            key={i}
                                            variant="outline"
                                            className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium px-3 py-1 text-sm"
                                        >
                                            {tech}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">None specified</span>
                                )}
                            </div>
                        </DetailItem>
                    </div>

                    {rom.additional_info && (
                        <>
                            <Separator className="my-6 dark:bg-gray-800" />
                            <DetailItem icon={Info} label="Additional Information">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {rom.additional_info}
                                </p>
                            </DetailItem>
                        </>
                    )}
                </Card>
            </div>

            {/* Project Timeline & Management */}
            <div className="mx-4 mt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-500" />
                    Project Timeline & Management
                </h3>
                <Card className="overflow-hidden border shadow-lg bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl p-6 lg:p-8">
                    <DetailItem icon={UserIcon} label="Sales Manager">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {rom.sales_manager}
                        </span>
                    </DetailItem>

                    <Separator className="my-6 dark:bg-gray-800" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DetailItem icon={Calendar} label="Construction Date">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formatDate(rom.construction_date)}
                            </span>
                        </DetailItem>

                        <DetailItem icon={Calendar} label="Close Date">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formatDate(rom.close_date)}
                            </span>
                        </DetailItem>

                        <DetailItem icon={Calendar} label="On Air Date">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formatDate(rom.on_air_date)}
                            </span>
                        </DetailItem>
                    </div>

                    <Separator className="my-6 dark:bg-gray-800" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem icon={UserIcon} label="Created By">
                            {creator ? (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-medium text-xs">
                                            {getInitials(creator.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                            {creator.name || "Unknown User"}
                                        </span>
                                        {creator.email && (
                                            <span className="text-xs text-muted-foreground">
                                                {creator.email}
                                            </span>
                                        )}
                                        {creator.role && (
                                            <Badge variant="secondary" className="mt-1 w-fit text-xs">
                                                {creator.role}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">Unknown</span>
                            )}
                        </DetailItem>

                        <div className="space-y-4">
                            <DetailItem icon={Calendar} label="Created At">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {formatDateTime(rom.created_at)}
                                </span>
                            </DetailItem>

                            {rom.updated_at && rom.updated_at !== rom.created_at && (
                                <DetailItem icon={Clock} label="Last Updated">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {formatDateTime(rom.updated_at)}
                                    </span>
                                </DetailItem>
                            )}
                        </div>
                    </div>
                </Card>
            </div>


        </div>
    )
}
