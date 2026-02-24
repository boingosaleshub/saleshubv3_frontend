"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import {
    Loader2,
    FileSpreadsheet,
    CheckCircle2,
    XCircle,
    Clock,
    MapPin,
    Building2,
    Search,
    ChevronDown,
    ChevronUp,
    Download,
    Image as ImageIcon,
    Cpu,
    Radio,
    Signal,
    Layers,
    Hash,
    Gauge,
    ParkingCircle,
    Users,
    Shield,
    CircleDot,
    Info,
    Calendar,
    User as UserIcon,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import NextImage from "next/image"

function getInitials(name) {
    if (!name) return "U"
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

function formatDate(dateStr) {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    })
}

function formatFullDate(dateStr) {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    })
}

function getVendor(rom) {
    const vendors = [rom.das_vendor, rom.bda_vendor].filter(Boolean)
    if (vendors.length === 0) return "N/A"
    return [...new Set(vendors)].join(" / ")
}

function getFileNameFromUrl(url) {
    try {
        const pathname = new URL(url).pathname
        const encoded = pathname.split("/").pop()
        return decodeURIComponent(encoded) || "rom_pricing.xlsx"
    } catch {
        return "rom_pricing.xlsx"
    }
}

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

export default function ViewRomProposalsPage() {
    const { user } = useAuthStore()
    const [proposals, setProposals] = useState([])
    const [creators, setCreators] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedId, setExpandedId] = useState(null)
    const [actionDialog, setActionDialog] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)

    const isAdmin = ["Admin", "Super Admin"].includes(user?.app_metadata?.role)

    const fetchProposals = useCallback(async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            const { data, error: fetchError } = await supabase
                .from("rom_proposals")
                .select("*")
                .eq("approval_status", "Pending")
                .order("created_at", { ascending: false })

            if (fetchError) throw fetchError

            setProposals(data || [])

            const userIds = [...new Set((data || []).map((r) => r.user_id))]
            if (userIds.length > 0) {
                const { data: usersData } = await supabase
                    .from("Users")
                    .select("id, name, email, role")
                    .in("id", userIds)

                if (usersData) {
                    const map = {}
                    usersData.forEach((u) => { map[u.id] = u })
                    setCreators(map)
                }
            }
        } catch (err) {
            console.error("Error fetching ROM proposals:", err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (user?.id) fetchProposals()
    }, [user?.id, fetchProposals])

    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel("rom-proposals-approval-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "rom_proposals" },
                () => { fetchProposals() }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [fetchProposals])

    const handleApprovalAction = async (proposalId, action) => {
        setProcessing(true)
        try {
            const supabase = createClient()
            const newStatus = action === "approve" ? "Approved" : "Rejected"

            const { error: updateError } = await supabase
                .from("rom_proposals")
                .update({ approval_status: newStatus })
                .eq("id", proposalId)

            if (updateError) throw updateError

            setProposals((prev) => prev.filter((p) => p.id !== proposalId))
            if (expandedId === proposalId) setExpandedId(null)

            toast.success(
                action === "approve"
                    ? "ROM proposal approved successfully"
                    : "ROM proposal rejected"
            )
        } catch (err) {
            console.error(`Error ${action}ing ROM proposal:`, err)
            toast.error(`Failed to ${action} ROM proposal: ${err.message}`)
        } finally {
            setProcessing(false)
            setActionDialog(null)
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

    const filteredProposals = proposals.filter((p) => {
        const q = searchQuery.toLowerCase().trim()
        if (!q) return true
        return (
            p.venue_name?.toLowerCase().includes(q) ||
            p.venue_address?.toLowerCase().includes(q) ||
            p.system_type?.toLowerCase().includes(q) ||
            creators[p.user_id]?.name?.toLowerCase().includes(q)
        )
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-2">Error loading ROM proposals</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3D434A] to-[#4a5058] dark:from-[#3D434A] dark:to-[#4a5058] py-6 px-8 border-b-4 border-red-600 rounded-t-2xl mx-4 mt-6 shadow-lg">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-7 w-7" />
                    My ROM's
                </h2>
                <p className="text-center text-gray-200 dark:text-gray-300 mt-2 text-sm">
                    ROM proposals awaiting your approval
                </p>
            </div>

            {/* Pending count + Search */}
            <div className="mx-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 font-semibold gap-1.5 px-3 py-1.5 text-sm">
                        <Clock className="h-4 w-4" />
                        {filteredProposals.length} Pending Proposal{filteredProposals.length !== 1 ? "s" : ""}
                    </Badge>
                </div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search by venue, address, or creator..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 w-full sm:w-[400px] bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 focus-visible:ring-red-500/30 focus-visible:border-red-500 text-sm"
                    />
                </div>
            </div>

            {/* Proposals List */}
            <div className="mx-4 mt-6 pb-8 space-y-4">
                {filteredProposals.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-white dark:bg-[#1a1d21] border-dashed">
                        <CheckCircle2 className="h-10 w-10 mb-4 opacity-20" />
                        <p className="text-sm font-medium">
                            {searchQuery
                                ? "No pending proposals match your search"
                                : "No pending ROM proposals"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            All proposals have been reviewed
                        </p>
                    </Card>
                ) : (
                    filteredProposals.map((proposal) => {
                        const creator = creators[proposal.user_id]
                        const isExpanded = expandedId === proposal.id
                        const screenshots = Array.isArray(proposal.screenshot_urls) ? proposal.screenshot_urls : []
                        const excelFiles = Array.isArray(proposal.excel_file_urls) ? proposal.excel_file_urls : []

                        return (
                            <Card
                                key={proposal.id}
                                className="overflow-hidden border shadow-md bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl transition-shadow duration-200"
                            >
                                {/* Collapsed Card Header */}
                                <div
                                    className="p-5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                                                    {proposal.venue_name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{proposal.venue_address}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            {creator && (
                                                <div className="hidden sm:flex items-center gap-2">
                                                    <Avatar className="h-7 w-7 border border-gray-200 dark:border-gray-700">
                                                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-medium text-[10px]">
                                                            {getInitials(creator.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-right">
                                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{creator.name}</p>
                                                        <p className="text-[10px] text-gray-400">{creator.role} &middot; {formatDate(proposal.created_at)}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 font-semibold text-xs gap-1 px-2.5 py-1">
                                                <Clock className="h-3 w-3" />
                                                Pending
                                            </Badge>

                                            {isExpanded ? (
                                                <ChevronUp className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick info row */}
                                    <div className="flex items-center gap-4 mt-3 pl-16">
                                        <div className="flex items-center gap-1.5">
                                            <Cpu className="h-3.5 w-3.5 text-gray-400" />
                                            <Badge className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium text-xs">
                                                {proposal.system_type}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-gray-400">|</span>
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {getVendor(proposal)}
                                        </span>
                                        <span className="text-xs text-gray-400">|</span>
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {Number(proposal.gross_sq_ft).toLocaleString()} sq ft
                                        </span>
                                        <span className="text-xs text-gray-400">|</span>
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {proposal.num_floors} Floor{proposal.num_floors !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 dark:border-gray-800">
                                        {/* Venue & System Details */}
                                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Venue Information */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-red-500" />
                                                    Venue Information
                                                </h4>
                                                <div className="space-y-3">
                                                    <DetailItem icon={Building2} label="Venue Name">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{proposal.venue_name}</p>
                                                    </DetailItem>
                                                    <DetailItem icon={MapPin} label="Address">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{proposal.venue_address}</p>
                                                    </DetailItem>
                                                    <DetailItem icon={Layers} label="Venue Type">
                                                        <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-sm font-medium">{proposal.venue_type}</Badge>
                                                    </DetailItem>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <DetailItem icon={Hash} label="Floors">
                                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{proposal.num_floors}</span>
                                                        </DetailItem>
                                                        <DetailItem icon={Gauge} label="Gross Sq Ft">
                                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{Number(proposal.gross_sq_ft).toLocaleString()}</span>
                                                        </DetailItem>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <DetailItem icon={ParkingCircle} label="Parking">
                                                            <Badge variant="secondary" className={proposal.has_parking_garage ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0 font-medium" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-0 font-medium"}>
                                                                {proposal.has_parking_garage ? `Yes (${Number(proposal.parking_sq_ft || 0).toLocaleString()} sq ft)` : "No"}
                                                            </Badge>
                                                        </DetailItem>
                                                        <DetailItem icon={Users} label="POPs">
                                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{proposal.pops?.toLocaleString()}</span>
                                                        </DetailItem>
                                                    </div>
                                                    <DetailItem icon={Signal} label="Building Density">
                                                        <Badge variant="outline" className="border-gray-200 dark:border-gray-700 font-medium text-sm">{proposal.building_density}</Badge>
                                                    </DetailItem>
                                                    {proposal.ahj_requirements?.length > 0 && (
                                                        <DetailItem icon={Shield} label="AHJ Requirements">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {proposal.ahj_requirements.map((req, i) => (
                                                                    <Badge key={i} className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-0 font-medium text-xs px-2 py-0.5">{req}</Badge>
                                                                ))}
                                                            </div>
                                                        </DetailItem>
                                                    )}
                                                    {proposal.is_third_party && (
                                                        <DetailItem icon={Users} label="Third Party">
                                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{proposal.third_party_name || "N/A"}</p>
                                                            {proposal.third_party_fee && <p className="text-xs text-muted-foreground">Fee: ${Number(proposal.third_party_fee).toLocaleString()}</p>}
                                                        </DetailItem>
                                                    )}
                                                </div>
                                            </div>

                                            {/* System Information */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                                                    <Cpu className="h-4 w-4 text-red-500" />
                                                    System Information
                                                </h4>
                                                <div className="space-y-3">
                                                    <DetailItem icon={Cpu} label="System Type">
                                                        <Badge className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium text-sm">{proposal.system_type}</Badge>
                                                    </DetailItem>
                                                    {proposal.das_architecture && (
                                                        <DetailItem icon={Layers} label="DAS Architecture">
                                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{proposal.das_architecture}</span>
                                                        </DetailItem>
                                                    )}
                                                    <DetailItem icon={Gauge} label="OEM Criteria">
                                                        <Badge variant="outline" className="border-gray-200 dark:border-gray-700 font-medium text-sm capitalize">{proposal.oem_criteria}</Badge>
                                                    </DetailItem>
                                                    {proposal.das_vendor && (
                                                        <DetailItem icon={Building2} label="DAS Vendor">
                                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{proposal.das_vendor}</span>
                                                        </DetailItem>
                                                    )}
                                                    {proposal.bda_vendor && (
                                                        <DetailItem icon={Building2} label="BDA Vendor">
                                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{proposal.bda_vendor}</span>
                                                        </DetailItem>
                                                    )}
                                                    {proposal.erces_coverage && (
                                                        <DetailItem icon={Signal} label="ERCES Coverage">
                                                            <Badge variant="outline" className="border-gray-200 dark:border-gray-700 font-medium text-sm capitalize">{proposal.erces_coverage}</Badge>
                                                        </DetailItem>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <DetailItem icon={CircleDot} label="Sector Criteria">
                                                            <Badge variant="outline" className="border-gray-200 dark:border-gray-700 font-medium text-sm capitalize">{proposal.sector_criteria}</Badge>
                                                        </DetailItem>
                                                        <DetailItem icon={Hash} label="Sectors">
                                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{proposal.num_sectors}</span>
                                                        </DetailItem>
                                                    </div>
                                                    <DetailItem icon={Radio} label="Signal Source">
                                                        <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-0 font-medium text-sm">{proposal.signal_source}</Badge>
                                                    </DetailItem>
                                                    <DetailItem icon={Radio} label="Carrier Requirements">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(proposal.carrier_requirements || []).map((c, i) => (
                                                                <Badge key={i} className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium text-xs px-2 py-0.5">{c}</Badge>
                                                            ))}
                                                        </div>
                                                    </DetailItem>
                                                    <DetailItem icon={Signal} label="Tech Supported">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(proposal.tech_supported || []).map((t, i) => (
                                                                <Badge key={i} variant="outline" className="border-gray-200 dark:border-gray-700 font-medium text-xs px-2 py-0.5">{t}</Badge>
                                                            ))}
                                                        </div>
                                                    </DetailItem>
                                                    {proposal.additional_info && (
                                                        <DetailItem icon={Info} label="Additional Info">
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{proposal.additional_info}</p>
                                                        </DetailItem>
                                                    )}
                                                </div>

                                                {/* Timeline */}
                                                <Separator className="dark:bg-gray-800" />
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-red-500" />
                                                    Project Timeline
                                                </h4>
                                                <div className="space-y-3">
                                                    <DetailItem icon={UserIcon} label="Sales Manager">
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{proposal.sales_manager}</span>
                                                    </DetailItem>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <DetailItem icon={Calendar} label="Construction">
                                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatFullDate(proposal.construction_date)}</span>
                                                        </DetailItem>
                                                        <DetailItem icon={Calendar} label="Close Date">
                                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatFullDate(proposal.close_date)}</span>
                                                        </DetailItem>
                                                        <DetailItem icon={Calendar} label="On Air">
                                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatFullDate(proposal.on_air_date)}</span>
                                                        </DetailItem>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Screenshots */}
                                        <div className="px-6 pb-4">
                                            <Separator className="mb-4 dark:bg-gray-800" />
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-red-500" />
                                                    Screenshots
                                                    {screenshots.length > 0 && (
                                                        <Badge variant="secondary" className="ml-1 text-xs">{screenshots.length}</Badge>
                                                    )}
                                                </h4>
                                            </div>
                                            {screenshots.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {screenshots.map((url, index) => (
                                                        <div key={index} className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700">
                                                            <NextImage
                                                                src={url}
                                                                alt={`Screenshot ${index + 1}`}
                                                                fill
                                                                className="object-cover cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
                                                                onClick={() => setSelectedImage(url)}
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center pointer-events-none">
                                                                <Button
                                                                    onClick={(e) => { e.stopPropagation(); handleDownloadScreenshot(url, index) }}
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-1.5 pointer-events-auto text-xs"
                                                                >
                                                                    <Download className="h-3.5 w-3.5" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-24 text-muted-foreground border border-dashed rounded-lg">
                                                    <p className="text-xs">No screenshots available</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Excel Files */}
                                        <div className="px-6 pb-4">
                                            <Separator className="mb-4 dark:bg-gray-800" />
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                                                    <FileSpreadsheet className="h-4 w-4 text-red-500" />
                                                    Pricing Excel Files
                                                    {excelFiles.length > 0 && (
                                                        <Badge variant="secondary" className="ml-1 text-xs">{excelFiles.length}</Badge>
                                                    )}
                                                </h4>
                                            </div>
                                            {excelFiles.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {excelFiles.map((url, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => handleDownloadExcel(url, index)}
                                                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-green-50/50 dark:hover:bg-green-900/10 cursor-pointer transition-colors group"
                                                        >
                                                            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                                                <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{getFileNameFromUrl(url)}</p>
                                                                <p className="text-[10px] text-muted-foreground">Click to download</p>
                                                            </div>
                                                            <Download className="h-4 w-4 text-gray-300 group-hover:text-green-600 transition-colors shrink-0" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-24 text-muted-foreground border border-dashed rounded-lg">
                                                    <p className="text-xs">No Excel files available</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        {isAdmin && (
                                            <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setActionDialog({ id: proposal.id, name: proposal.venue_name, action: "reject" })}
                                                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    onClick={() => setActionDialog({ id: proposal.id, name: proposal.venue_name, action: "approve" })}
                                                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Approve
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )
                    })
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
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null) }}
                    >
                        <span className="text-lg font-bold">&#x2715;</span>
                    </Button>
                    <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
                        <NextImage
                            src={selectedImage}
                            alt="Full-size screenshot"
                            fill
                            className="object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Approval Action Dialog */}
            <AlertDialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionDialog?.action === "approve" ? "Approve ROM Proposal?" : "Reject ROM Proposal?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionDialog?.action === "approve"
                                ? `Are you sure you want to approve the ROM proposal "${actionDialog?.name}"? This will mark it as an accepted proposal.`
                                : `Are you sure you want to reject the ROM proposal "${actionDialog?.name}"? The creator will see this proposal as rejected.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleApprovalAction(actionDialog.id, actionDialog.action)}
                            disabled={processing}
                            className={actionDialog?.action === "approve" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                        >
                            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {actionDialog?.action === "approve" ? "Approve" : "Reject"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
