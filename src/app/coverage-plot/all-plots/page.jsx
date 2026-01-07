"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useLanguage } from "@/components/providers/language-provider"
import { PlotsTable } from "@/components/coverage-plot/plots-table"
import { Loader2 } from "lucide-react"

export default function AllPlotsPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const { user } = useAuthStore()
    const [plots, setPlots] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Check if user is admin or super admin
        const userRole = user?.app_metadata?.role
        if (!['Admin', 'Super Admin'].includes(userRole)) {
            router.push('/dashboard')
            return
        }

        fetchAllPlots()
    }, [user, router])

    const fetchAllPlots = async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            // Fetch all coverage plots
            const { data: plotsData, error: plotsError } = await supabase
                .from('coverage_plots')
                .select('*')
                .order('created_at', { ascending: false })

            if (plotsError) throw plotsError

            // Fetch all users
            const { data: usersData, error: usersError } = await supabase
                .from('Users')
                .select('id, name, email')

            if (usersError) throw usersError

            // Create a user map for quick lookup
            const userMap = {}
            usersData.forEach(user => {
                userMap[user.id] = user
            })

            // Transform data to include user_name
            const transformedPlots = plotsData.map(plot => ({
                ...plot,
                user_name: userMap[plot.user_id]?.name || userMap[plot.user_id]?.email || 'Unknown User'
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
                <h1 className="text-3xl font-bold">{t("allPlots")}</h1>
                <p className="text-muted-foreground mt-2">
                    View all coverage plots from all users
                </p>
            </div>

            <PlotsTable plots={plots} />
        </div>
    )
}
