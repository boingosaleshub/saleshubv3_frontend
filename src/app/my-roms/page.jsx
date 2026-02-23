"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { RomsTable } from "@/components/rom-proposals/roms-table"
import { Loader2, FileSpreadsheet } from "lucide-react"

export default function MyRomsPage() {
    const { user } = useAuthStore()
    const [roms, setRoms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Check if user is admin or super admin
    const isAdmin = ["Admin", "Super Admin"].includes(user?.app_metadata?.role)

    useEffect(() => {
        if (user?.id) {
            fetchMyRomProposals()
        }
    }, [user])

    // Realtime subscription: remove deleted ROMs from local state instantly
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel("my-roms-realtime")
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "rom_proposals" },
                (payload) => {
                    setRoms((prev) => prev.filter((r) => r.id !== payload.old.id))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

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
                <RomsTable
                    roms={roms}
                    showDeleteOption={isAdmin}
                />
            </div>
        </div>
    )
}
