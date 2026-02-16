"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import {
    Loader2,
    MapPin,
    Radio,
    Layers,
    User as UserIcon,
    Calendar,
    Download,
    ArrowLeft,
    ChevronRight,
    Image as ImageIcon,
    Signal,
    Clock,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import dynamic from "next/dynamic"
import Image from "next/image"

const CoverageMap = dynamic(
    () => import("../../new-form/coverage-map"),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
        ),
    }
)

export default function PlotDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user } = useAuthStore()

    const [plot, setPlot] = useState(null)
    const [creator, setCreator] = useState(null)
    const [userPlots, setUserPlots] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [coordinates, setCoordinates] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)

    // Geocode address to get coordinates for the map
    const geocodeAddress = useCallback(async (address) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            )
            const data = await res.json()
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                }
            }
        } catch (err) {
            console.error("Geocoding error:", err)
        }
        return null
    }, [])

    useEffect(() => {
        if (id) {
            fetchPlotData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const fetchPlotData = async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            // Fetch the specific plot
            const { data: plotData, error: plotError } = await supabase
                .from("coverage_plots")
                .select("*")
                .eq("id", id)
                .single()

            if (plotError) throw plotError
            setPlot(plotData)

            // Geocode the venue address for the map
            const coords = await geocodeAddress(plotData.venue_address)
            if (coords) setCoordinates(coords)

            // Fetch creator info
            const { data: userData, error: userError } = await supabase
                .from("Users")
                .select("id, name, email, role")
                .eq("id", plotData.user_id)
                .single()

            if (!userError && userData) setCreator(userData)

            // Fetch same-user coverage plots (role-based)
            const userRole = user?.app_metadata?.role

            let plotsQuery = supabase
                .from("coverage_plots")
                .select("*")
                .neq("id", id)
                .order("created_at", { ascending: false })

            if (["Admin", "Super Admin"].includes(userRole)) {
                // Admin/Super Admin: see all plots by the same user who created this plot
                plotsQuery = plotsQuery.eq("user_id", plotData.user_id)
            } else {
                // Regular user: only see their own plots
                plotsQuery = plotsQuery.eq("user_id", user?.id)
            }

            const { data: userPlotsData, error: userPlotsError } = await plotsQuery

            if (!userPlotsError && userPlotsData) {
                // Fetch user info for the related plots
                const userIds = [...new Set(userPlotsData.map((p) => p.user_id))]

                let userMap = {}
                if (userIds.length > 0) {
                    const { data: usersData } = await supabase
                        .from("Users")
                        .select("id, name, email")
                        .in("id", userIds)

                    usersData?.forEach((u) => {
                        userMap[u.id] = u
                    })
                }

                const transformedPlots = userPlotsData.map((p) => ({
                    ...p,
                    user_name:
                        userMap[p.user_id]?.name ||
                        userMap[p.user_id]?.email ||
                        "Unknown",
                    user_email: userMap[p.user_id]?.email,
                }))

                setUserPlots(transformedPlots)
            }
        } catch (err) {
            console.error("Error fetching plot:", err)
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
            link.download = `coverage_plot_${index + 1}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)
        } catch (err) {
            console.error("Download error:", err)
        }
    }

    const handleDownloadAll = async () => {
        if (!plot?.screenshot_urls) return
        for (let i = 0; i < plot.screenshot_urls.length; i++) {
            await handleDownloadScreenshot(plot.screenshot_urls[i], i)
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
                    <p className="text-sm text-muted-foreground">Loading coverage plot...</p>
                </div>
            </div>
        )
    }

    if (error || !plot) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Signal className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-red-500 mb-2 font-semibold">
                        {error ? "Error loading plot" : "Plot not found"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        {error || "The coverage plot you're looking for doesn't exist."}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    const screenshots = Array.isArray(plot.screenshot_urls)
        ? plot.screenshot_urls
        : []
    const userRole = user?.app_metadata?.role
    const isAdminOrSuperAdmin = ["Admin", "Super Admin"].includes(userRole)

    return (
        <div className="w-full">
            {/* ── Header ── */}
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
                        <Layers className="h-7 w-7" />
                        Coverage Plot Details
                    </h2>
                    <div className="w-24" />
                </div>
            </div>

            {/* ── Main Info Card (Info + Map) ── */}
            <div className="mx-4 mt-6">
                <Card className="overflow-hidden border shadow-lg bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left Column: Plot Information */}
                        <div className="w-full lg:w-1/2 p-6 lg:p-8 space-y-6">
                            {/* Venue Address */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-red-500" />
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Venue Address
                                    </span>
                                </div>
                                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 pl-7">
                                    {plot.venue_address}
                                </p>
                            </div>

                            <Separator className="dark:bg-gray-800" />

                            {/* Carrier Requirements */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Radio className="h-5 w-5 text-red-500" />
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Carrier Requirements
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 pl-7">
                                    {Array.isArray(plot.carriers) ? (
                                        plot.carriers.map((carrier, i) => (
                                            <Badge
                                                key={i}
                                                className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium px-3 py-1 text-sm"
                                            >
                                                {carrier}
                                            </Badge>
                                        ))
                                    ) : (
                                        <Badge variant="outline">{plot.carriers}</Badge>
                                    )}
                                </div>
                            </div>

                            <Separator className="dark:bg-gray-800" />

                            {/* Coverage Type */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-red-500" />
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Coverage Type
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 pl-7">
                                    {Array.isArray(plot.coverage_types) ? (
                                        plot.coverage_types.map((type, i) => (
                                            <Badge
                                                key={i}
                                                variant="outline"
                                                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium px-3 py-1 text-sm"
                                            >
                                                {type}
                                            </Badge>
                                        ))
                                    ) : (
                                        <Badge variant="outline">
                                            {plot.coverage_types}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <Separator className="dark:bg-gray-800" />

                            {/* Created By */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-red-500" />
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Created By
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 pl-7">
                                    <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-medium text-sm">
                                            {getInitials(creator?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {creator?.name || "Unknown User"}
                                        </span>
                                        {creator?.email && (
                                            <span className="text-sm text-muted-foreground">
                                                {creator.email}
                                            </span>
                                        )}
                                        {creator?.role && (
                                            <Badge
                                                variant="secondary"
                                                className="mt-1 w-fit text-xs"
                                            >
                                                {creator.role}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator className="dark:bg-gray-800" />

                            {/* Created At */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-red-500" />
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Created At
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-7">
                                    {new Date(plot.created_at).toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </p>
                            </div>

                            {/* Updated At */}
                            {plot.updated_at && plot.updated_at !== plot.created_at && (
                                <>
                                    <Separator className="dark:bg-gray-800" />
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-red-500" />
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Last Updated
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pl-7">
                                            {new Date(
                                                plot.updated_at
                                            ).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right Column: Map */}
                        <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-gray-900 h-[400px] lg:h-auto lg:min-h-[550px] relative">
                            {coordinates ? (
                                <>
                                    <CoverageMap
                                        lat={coordinates.lat}
                                        lng={coordinates.lng}
                                        zoom={16}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm z-40 text-gray-600 dark:text-gray-400 pointer-events-none">
                                        OpenStreetMap View
                                    </div>
                                </>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">
                                            Loading map...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── Screenshots Section ── */}
            <div className="mx-4 mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-red-500" />
                        Screenshots
                        {screenshots.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-1 text-xs"
                            >
                                {screenshots.length}
                            </Badge>
                        )}
                    </h3>
                    {screenshots.length > 0 && (
                        <Button
                            onClick={handleDownloadAll}
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
                                        alt={`Coverage plot screenshot ${index + 1}`}
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
                                        onClick={() =>
                                            handleDownloadScreenshot(url, index)
                                        }
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

            {/* ── Fullscreen Image Preview ── */}
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

            {/* ── Same User Coverage Plots Table ── */}
            <div className="mx-4 mt-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-red-500" />
                    {isAdminOrSuperAdmin
                        ? `Other Coverage Plots by ${creator?.name || "this User"}`
                        : "Your Other Coverage Plots"}
                    {userPlots.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {userPlots.length}
                        </Badge>
                    )}
                </h3>

                {userPlots.length > 0 ? (
                    <Card className="overflow-hidden border shadow-lg bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl">
                        <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                                <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                                    <TableHead className="pl-6 py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                                        Venue Address
                                    </TableHead>
                                    <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                                        Carriers
                                    </TableHead>
                                    <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                                        Coverage Types
                                    </TableHead>
                                    <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                                        Created
                                    </TableHead>
                                    <TableHead className="text-right pr-6 py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                                        {/* Chevron column */}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userPlots.map((p) => (
                                    <TableRow
                                        key={p.id}
                                        className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-800 transition-colors cursor-pointer"
                                        onClick={() =>
                                            router.push(
                                                `/coverage-plot/all-plots/${p.id}`
                                            )
                                        }
                                    >
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                <span
                                                    className="text-sm text-gray-600 dark:text-gray-300 truncate font-medium max-w-[300px]"
                                                    title={p.venue_address}
                                                >
                                                    {p.venue_address}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {Array.isArray(p.carriers) ? (
                                                    p.carriers.map((c, i) => (
                                                        <Badge
                                                            key={i}
                                                            className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium px-2 py-0.5 text-xs"
                                                        >
                                                            {c}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <Badge variant="outline">
                                                        {p.carriers}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {Array.isArray(
                                                    p.coverage_types
                                                ) ? (
                                                    p.coverage_types.map(
                                                        (ct, i) => (
                                                            <Badge
                                                                key={i}
                                                                variant="outline"
                                                                className="border-gray-200 dark:border-gray-700 text-xs"
                                                            >
                                                                {ct}
                                                            </Badge>
                                                        )
                                                    )
                                                ) : (
                                                    <Badge variant="outline">
                                                        {p.coverage_types}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm font-medium">
                                                    {new Date(
                                                        p.created_at
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-red-500 transition-colors duration-200 ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-white dark:bg-[#1a1d21] border-dashed rounded-xl">
                        <Layers className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">No other coverage plots found</p>
                    </Card>
                )}
            </div>
        </div>
    )
}
