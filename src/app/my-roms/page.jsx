"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import {
    Loader2, FileSpreadsheet, MapPin, Building2, Clock,
    CheckCircle2, XCircle, Cpu, ChevronRight, Layers, Ruler
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

function formatDate(dateStr) {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    })
}

function getVendor(rom) {
    const vendors = [rom.das_vendor, rom.bda_vendor].filter(Boolean)
    if (vendors.length === 0) return null
    return [...new Set(vendors)].join(" / ")
}

function StatusBadge({ status }) {
    if (status === "Approved") return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved
        </span>
    )
    if (status === "Rejected") return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
            <Clock className="h-3.5 w-3.5" />
            Pending
        </span>
    )
}

function RomCard({ rom }) {
    const vendor = getVendor(rom)

    return (
        <div className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/60 dark:bg-[#1a1d21] dark:border-gray-800 dark:hover:border-gray-600 dark:hover:shadow-black/30 transition-all duration-300">
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${rom.approval_status === "Approved" ? "bg-emerald-500" :
                rom.approval_status === "Rejected" ? "bg-red-500" :
                    "bg-amber-500"
                }`} />

            <div className="pl-6 pr-5 py-5 flex items-center gap-5">
                {/* Icon */}
                <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 dark:bg-red-600/10 dark:border-red-600/20 flex items-center justify-center shrink-0 group-hover:bg-red-100 dark:group-hover:bg-red-600/15 transition-colors">
                    <Building2 className="h-5 w-5 text-red-600 dark:text-red-500" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate leading-tight">
                                {rom.venue_name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{rom.venue_address}</span>
                            </div>
                        </div>
                        <StatusBadge status={rom.approval_status} />
                    </div>

                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-100 dark:bg-red-600/10 dark:text-red-400 dark:border-red-600/20">
                            <Cpu className="h-3 w-3" />
                            {rom.system_type}
                        </span>
                        {vendor && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                {vendor}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                            <Ruler className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            {Number(rom.gross_sq_ft).toLocaleString()} sq ft
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                            <Layers className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            {rom.num_floors} Floor{rom.num_floors !== 1 ? "s" : ""}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 ml-auto">
                            <Clock className="h-3 w-3" />
                            {formatDate(rom.created_at)}
                        </span>
                    </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
            </div>
        </div>
    )
}

export default function MyRomsPage() {
    const { user } = useAuthStore()
    const [roms, setRoms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user?.id) fetchMyRomProposals()
    }, [user])

    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel("my-roms-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "rom_proposals" }, (payload) => {
                if (payload.event === "DELETE") {
                    setRoms((prev) => prev.filter((r) => r.id !== payload.old.id))
                } else {
                    fetchMyRomProposals()
                }
            })
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [user?.id])

    const fetchMyRomProposals = async () => {
        try {
            setLoading(true)
            const supabase = createClient()
            const { data, error: fetchError } = await supabase
                .from("rom_proposals")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
            if (fetchError) throw fetchError
            setRoms(data || [])
        } catch (err) {
            console.error("Error fetching ROM proposals:", err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
    )

    if (error) return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <p className="text-red-500 mb-2">Error loading your ROM proposals</p>
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        </div>
    )

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-9 w-9 rounded-lg bg-red-50 border border-red-100 dark:bg-red-600/10 dark:border-red-600/20 flex items-center justify-center">
                        <FileSpreadsheet className="h-4.5 w-4.5 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My ROM Proposals</h1>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 ml-12">
                    {roms.length > 0 ? `${roms.length} proposal${roms.length !== 1 ? "s" : ""}` : "No proposals yet"}
                </p>
            </div>

            {/* Content */}
            {roms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-56 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600">
                    <FileSpreadsheet className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium text-gray-500">No ROM proposals found</p>
                    <p className="text-xs mt-1 text-gray-400 dark:text-gray-600">You haven't created any ROM proposals yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {roms.map(rom => <RomCard key={rom.id} rom={rom} />)}
                </div>
            )}
        </div>
    )
}