"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { Loader2, FileSpreadsheet, MapPin, Building2, Clock, CheckCircle2, XCircle, Cpu } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function formatDate(dateStr) {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    })
}

export default function MyRomsPage() {
    const { user } = useAuthStore()
    const [roms, setRoms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user?.id) {
            fetchMyRomProposals()
        }
    }, [user])

    // Realtime subscription: update UI natively dynamically
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel("my-roms-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "rom_proposals" },
                (payload) => {
                    if (payload.event === "DELETE") {
                        setRoms((prev) => prev.filter((r) => r.id !== payload.old.id))
                    } else if (payload.event === "UPDATE" || payload.event === "INSERT") {
                        fetchMyRomProposals()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
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
                    <p className="text-red-500 mb-2">Error loading your ROM proposals</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#3D434A] to-[#4a5058] dark:from-[#3D434A] dark:to-[#4a5058] py-6 px-8 border-b-4 border-red-600 rounded-t-2xl mx-4 mt-6 shadow-lg">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-7 w-7" />
                    My ROM Proposals
                </h2>
                <p className="text-center text-gray-200 dark:text-gray-300 mt-2 text-sm">
                    View and manage your ROM proposals
                </p>
            </div>

            {/* Content Section */}
            <div className="mx-4 py-8">
                {roms.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-white dark:bg-[#1a1d21] border-dashed">
                        <FileSpreadsheet className="h-10 w-10 mb-4 opacity-20" />
                        <p className="text-sm font-medium">No ROM proposals found</p>
                        <p className="text-xs text-muted-foreground mt-1">You haven't created any ROM proposals yet.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {roms.map(rom => (
                            <Card key={rom.id} className="p-5 overflow-hidden border shadow-sm hover:shadow-md transition-shadow dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                                <Building2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div className="min-w-0 pr-1 w-full">
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate w-full" title={rom.venue_name}>{rom.venue_name}</h3>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <MapPin className="h-3 w-3 shrink-0" />
                                                    <span className="truncate w-full" title={rom.venue_address}>{rom.venue_address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 text-sm">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">System</p>
                                            <p className="font-medium flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-gray-400" />{rom.system_type}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Area / Floors</p>
                                            <p className="font-medium">{Number(rom.gross_sq_ft).toLocaleString()} sq ft &middot; {rom.num_floors}F</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-5 pt-4">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatDate(rom.created_at)}
                                    </div>

                                    {rom.approval_status === "Approved" ? (
                                        <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0 font-semibold gap-1.5">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Approved
                                        </Badge>
                                    ) : rom.approval_status === "Rejected" ? (
                                        <Badge variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0 font-semibold gap-1.5">
                                            <XCircle className="h-3.5 w-3.5" />
                                            Rejected
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-0 font-semibold gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            Pending
                                        </Badge>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

