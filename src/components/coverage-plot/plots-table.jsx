"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, MapPin, User as UserIcon, Calendar, Signal, ChevronRight } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlotImageModal } from "./plot-image-modal"
import { useLanguage } from "@/components/providers/language-provider"

export function PlotsTable({ plots }) {
    const { t } = useLanguage()
    const router = useRouter()
    const [selectedPlot, setSelectedPlot] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleViewPlot = (e, plot) => {
        e.stopPropagation()
        setSelectedPlot(plot)
        setIsModalOpen(true)
    }

    const handleRowClick = (plot) => {
        router.push(`/coverage-plot/all-plots/${plot.id}`)
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

    if (!plots || plots.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-white dark:bg-[#1a1d21] border-dashed">
                <Signal className="h-10 w-10 mb-4 opacity-20" />
                <p>{t("noPlotsFound")}</p>
            </Card>
        )
    }

    return (
        <>
            <Card className="overflow-hidden border shadow-lg bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl">
                <Table>
                    <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                        <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                            <TableHead className="w-[250px] py-4 pl-6 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                                {t("userName")}
                            </TableHead>
                            <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                                {t("venueAddress")}
                            </TableHead>
                            <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                                {t("carriers")}
                            </TableHead>
                            <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                                {t("coverageTypes")}
                            </TableHead>
                            <TableHead className="text-right py-4 pr-6 uppercase tracking-wider text-xs font-semibold text-muted-foreground">
                               Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plots.map((plot) => (
                            <TableRow 
                                key={plot.id} 
                                className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-800 transition-colors cursor-pointer"
                                onClick={() => handleRowClick(plot)}
                            >
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-sm">
                                            <AvatarImage src={plot.user_avatar} alt={plot.user_name} />
                                            <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-medium text-xs">
                                                {getInitials(plot.user_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                {plot.user_name || "Unknown User"}
                                            </span>
                                            {plot.user_email && (
                                                <span className="text-xs text-muted-foreground">
                                                    {plot.user_email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 max-w-[300px]">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate font-medium" title={plot.venue_address}>
                                            {plot.venue_address}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {Array.isArray(plot.carriers) ? (
                                            plot.carriers.map((carrier, i) => (
                                                <Badge 
                                                    key={i} 
                                                    variant="secondary"
                                                    className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium px-2.5 py-0.5"
                                                >
                                                    {carrier}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge variant="outline">{plot.carriers}</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {Array.isArray(plot.coverage_types) ? (
                                            plot.coverage_types.map((type, i) => (
                                                <Badge 
                                                    key={i} 
                                                    variant="outline"
                                                    className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium"
                                                >
                                                    {type}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge variant="outline">{plot.coverage_types}</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6 py-4">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleViewPlot(e, plot)}
                                            className="text-gray-700 dark:text-gray-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 font-medium h-8"
                                            title="Quick preview screenshots"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            {t("viewPlot")}
                                        </Button>
                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-red-500 transition-colors duration-200" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <PlotImageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plot={selectedPlot}
            />
        </>
    )
}
