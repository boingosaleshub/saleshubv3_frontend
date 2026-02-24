"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import {
    Loader2,
    CheckCircle2,
    Clock,
    MapPin,
    Search,
    Cpu,
    Building2,
    ChevronRight,
    Layers,
    Ruler
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

function getVendor(rom) {
    const vendors = [rom.das_vendor, rom.bda_vendor].filter(Boolean)
    if (vendors.length === 0) return null
    return [...new Set(vendors)].join(" / ")
}

export default function ApprovalsPage() {
    const { user } = useAuthStore()
    const router = useRouter()
    const [proposals, setProposals] = useState([])
    const [creators, setCreators] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")

    const isAdmin = ["Admin", "Super Admin"].includes(user?.app_metadata?.role)

    const fetchProposals = useCallback(async () => {
        if (!user?.id) return

        try {
            setLoading(true)
            const supabase = createClient()

            let query = supabase
                .from("rom_proposals")
                .select("*")
                .eq("approval_status", "Approved")
                .order("created_at", { ascending: false })

            if (!isAdmin) {
                query = query.eq("user_id", user.id)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError

            let finalData = data || []

            if (isAdmin && finalData.length > 0) {
                const userIds = [...new Set(finalData.map((r) => r.user_id))]
                if (userIds.length > 0) {
                    const { data: usersData } = await supabase
                        .from("Users")
                        .select("id, name, email, role")
                        .in("id", userIds)

                    if (usersData) {
                        const map = {}
                        const adminIds = new Set()
                        usersData.forEach((u) => {
                            map[u.id] = u
                            if (u.role === "Admin" || u.role === "Super Admin") {
                                adminIds.add(u.id)
                            }
                        })
                        setCreators(map)
                        // Filter out ROMs created by Admins/Super Admins since they are auto-approved
                        finalData = finalData.filter((r) => !adminIds.has(r.user_id))
                    }
                }
            }

            setProposals(finalData)
        } catch (err) {
            console.error("Error fetching ROM approvals:", err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [isAdmin, user?.id])

    useEffect(() => {
        fetchProposals()
    }, [fetchProposals])

    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel("rom-approvals-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "rom_proposals" },
                () => { fetchProposals() }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [fetchProposals])

    const filteredProposals = proposals.filter((p) => {
        const q = searchQuery.toLowerCase().trim()
        if (!q) return true
        return (
            p.venue_name?.toLowerCase().includes(q) ||
            p.venue_address?.toLowerCase().includes(q) ||
            p.system_type?.toLowerCase().includes(q) ||
            (isAdmin && creators[p.user_id]?.name?.toLowerCase().includes(q))
        )
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-2">Error loading approved ROMs</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 dark:bg-red-600/10 dark:border-red-600/20 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-red-600 dark:text-red-500" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Approved ROMs</h1>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-[52px]">
                        {isAdmin ? "All accepted ROM proposals across the platform" : "Your ROM proposals that have been accepted"}
                    </p>
                </div>

                <div className="relative w-full md:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder={isAdmin ? "Search by venue, address, or creator..." : "Search by venue, address, or system..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 w-full bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-800 rounded-xl shadow-sm focus-visible:ring-red-500/30 focus-visible:border-red-500 transition-shadow"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredProposals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-[#1a1d21]/50">
                        <CheckCircle2 className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {searchQuery ? "No approved proposals match your search" : "No approved ROM proposals yet"}
                        </p>
                    </div>
                ) : (
                    filteredProposals.map((proposal) => {
                        const creator = isAdmin ? creators[proposal.user_id] : user
                        const vendor = getVendor(proposal)

                        return (
                            <div
                                key={proposal.id}
                                onClick={() => router.push(`/all-roms/${proposal.id}`)}
                                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-red-300 hover:shadow-lg hover:shadow-red-500/10 dark:bg-[#1a1d21] dark:border-gray-800 dark:hover:border-red-800 dark:hover:shadow-black/40 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 rounded-l-2xl group-hover:bg-red-500 transition-colors" />

                                <div className="pl-6 pr-5 py-5 flex items-center gap-5 w-full">
                                    <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-gradient-to-br from-red-50 to-gray-50 border border-red-100 dark:from-red-900/20 dark:to-gray-900/40 dark:border-red-800/20 items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                        <Building2 className="h-6 w-6 text-red-600 dark:text-red-500" />
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                    {proposal.venue_name}
                                                </h3>
                                                <Badge className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-green-200 dark:border-green-500/20 shadow-none px-2.5">
                                                    Approved
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{proposal.venue_address}</span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-100 dark:bg-red-600/10 dark:text-red-400 dark:border-red-600/20">
                                                    <Cpu className="h-3.5 w-3.5" />
                                                    {proposal.system_type}
                                                </span>
                                                {vendor && (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                                        {vendor}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                                    <Ruler className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                    {Number(proposal.gross_sq_ft).toLocaleString()} sq ft
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                                    <Layers className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                    {proposal.num_floors} Floor{proposal.num_floors !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-3 sm:pt-0 sm:pl-5 w-full sm:w-auto mt-2 sm:mt-0">
                                            {isAdmin && creator && (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none">{creator.name}</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{creator.role}</p>
                                                    </div>
                                                    <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 shadow-sm">
                                                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-medium text-[10px]">
                                                            {getInitials(creator.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            )}

                                            <div className={`flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 ${isAdmin ? 'sm:mt-3' : ''}`}>
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{formatDate(proposal.created_at)}</span>
                                            </div>
                                        </div>

                                    </div>

                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-red-500 dark:text-gray-600 dark:group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0 hidden md:block ml-2" />
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
