"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import {
    Loader2,
    FileSpreadsheet,
    CheckCircle2,
    XCircle,
    Clock,
    MapPin,
    Search,
    Cpu,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { toast } from "sonner"

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
    if (vendors.length === 0) return "N/A"
    return [...new Set(vendors)].join(" / ")
}

export default function ViewRomProposalsPage() {
    const { user } = useAuthStore()
    const router = useRouter()
    const [proposals, setProposals] = useState([])
    const [creators, setCreators] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [actionDialog, setActionDialog] = useState(null)
    const [processing, setProcessing] = useState(false)

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

                        return (
                            <Card
                                key={proposal.id}
                                className="overflow-hidden border shadow-md bg-white hover:shadow-lg dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl transition-shadow duration-200 cursor-pointer"
                                onClick={() => router.push(`/all-roms/${proposal.id}`)}
                            >
                                <div className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

                                        <div className="flex items-center gap-4 shrink-0 mt-3 sm:mt-0">
                                            {creator && (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                                                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-medium text-xs">
                                                            {getInitials(creator.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="hidden sm:block text-right">
                                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">{creator.name}</p>
                                                        <p className="text-[10px] text-gray-400 line-clamp-1">{creator.role} &middot; {formatDate(proposal.created_at)}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 font-semibold text-xs gap-1 px-2.5 py-1">
                                                <Clock className="h-3 w-3" />
                                                Pending
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Quick info row */}
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 sm:pl-16">
                                        <div className="flex items-center gap-1.5">
                                            <Cpu className="h-3.5 w-3.5 text-gray-400" />
                                            <Badge className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium text-xs">
                                                {proposal.system_type}
                                            </Badge>
                                        </div>
                                        <span className="hidden sm:inline text-xs text-gray-400">|</span>
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {getVendor(proposal)}
                                        </span>
                                        <span className="hidden sm:inline text-xs text-gray-400">|</span>
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {Number(proposal.gross_sq_ft).toLocaleString()} sq ft
                                        </span>
                                        <span className="hidden sm:inline text-xs text-gray-400">|</span>
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {proposal.num_floors} Floor{proposal.num_floors !== 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setActionDialog({ id: proposal.id, name: proposal.venue_name, action: "reject" })
                                            }}
                                            className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                        >
                                            <XCircle className="h-3.5 w-3.5" />
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setActionDialog({ id: proposal.id, name: proposal.venue_name, action: "approve" })
                                            }}
                                            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>

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
