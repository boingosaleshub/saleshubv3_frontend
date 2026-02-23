"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useLanguage } from "@/components/providers/language-provider"
import { PlotsTable } from "@/components/coverage-plot/plots-table"
import { Loader2 } from "lucide-react"

export default function MyPlotsPage() {
    const { t } = useLanguage()
    const { user } = useAuthStore()
    const [plots, setPlots] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user?.id) {
            fetchMyPlots()
        }
        // Use user.id so we don't refetch when session refreshes on window/tab focus
    }, [user?.id])

    const fetchMyPlots = async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            // Fetch only current user's coverage plots
            const { data: plotsData, error: plotsError } = await supabase
                .from('coverage_plots')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (plotsError) throw plotsError

            // Fetch current user's info
            const { data: userData, error: userError } = await supabase
                .from('Users')
                .select('id, name, email')
                .eq('id', user.id)
                .single()

            if (userError) console.warn('Error fetching user data:', userError)

            // Transform data to include user_name
            const transformedPlots = plotsData.map(plot => ({
                ...plot,
                user_name: userData?.name || userData?.email || 'You'
            }))

            setPlots(transformedPlots)
        } catch (err) {
            console.error('Error fetching plots:', err)
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
                    <p className="text-red-500 mb-2">Error loading plots</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t("myPlots")}</h1>
                <p className="text-muted-foreground mt-2">
                    View your coverage plots
                </p>
            </div>

            <PlotsTable plots={plots} />
        </div>
    )
}
