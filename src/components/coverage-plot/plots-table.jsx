"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlotImageModal } from "./plot-image-modal"
import { useLanguage } from "@/components/providers/language-provider"

export function PlotsTable({ plots }) {
    const { t } = useLanguage()
    const [selectedPlot, setSelectedPlot] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleViewPlot = (plot) => {
        setSelectedPlot(plot)
        setIsModalOpen(true)
    }

    if (!plots || plots.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>{t("noPlotsFound")}</p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("userName")}</TableHead>
                            <TableHead>{t("venueAddress")}</TableHead>
                            <TableHead>{t("carriers")}</TableHead>
                            <TableHead>{t("coverageTypes")}</TableHead>
                            <TableHead className="text-right">{t("actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plots.map((plot) => (
                            <TableRow key={plot.id}>
                                <TableCell className="font-medium">
                                    {plot.user_name || "Unknown User"}
                                </TableCell>
                                <TableCell className="max-w-xs truncate" title={plot.venue_address}>
                                    {plot.venue_address}
                                </TableCell>
                                <TableCell>
                                    {Array.isArray(plot.carriers)
                                        ? plot.carriers.join(", ")
                                        : plot.carriers}
                                </TableCell>
                                <TableCell>
                                    {Array.isArray(plot.coverage_types)
                                        ? plot.coverage_types.join(", ")
                                        : plot.coverage_types}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewPlot(plot)}
                                        className="gap-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        {t("viewPlot")}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <PlotImageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plot={selectedPlot}
            />
        </>
    )
}
