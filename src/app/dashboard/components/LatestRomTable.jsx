"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, Star, MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";

// Mock data for the table
const tableData = [
    {
        id: 1,
        number: "01",
        propertyName: "Dallas Hotel & Spa",
        area: 388000,
        frequency: "+16.24%",
        frequencyUp: true,
        solution: "DAS & ERRCS",
        lastUpdate: "2025/06/04",
        status: "LOST",
        connectivity: 3,
    },
    {
        id: 2,
        number: "02",
        propertyName: "St. Patrick Hospital",
        area: 120000,
        frequency: "+19.33%",
        frequencyUp: true,
        solution: "DAS",
        lastUpdate: "2025/04/31",
        status: "WON",
        connectivity: 4,
    },
    {
        id: 3,
        number: "03",
        propertyName: "Louisville Hotel & Convention Center",
        area: 1250000,
        frequency: "-2.07%",
        frequencyUp: false,
        solution: "DAS & ERRCS",
        lastUpdate: "2025/04/27",
        status: "On-going",
        connectivity: 3,
    },
];

// Status badge component
function StatusBadge({ status, t }) {
    const statusConfig = {
        LOST: {
            bg: "bg-red-100 dark:bg-red-900/30",
            text: "text-red-600 dark:text-red-400",
            labelKey: "lost",
        },
        WON: {
            bg: "bg-green-100 dark:bg-green-900/30",
            text: "text-green-600 dark:text-green-400",
            labelKey: "won",
        },
        "On-going": {
            bg: "bg-amber-100 dark:bg-amber-900/30",
            text: "text-amber-600 dark:text-amber-400",
            labelKey: "onGoing",
        },
    };

    const config = statusConfig[status] || statusConfig["On-going"];
    const label = t ? t(config.labelKey) : status;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}
        >
            {label}
        </span>
    );
}

// Star rating component
function StarRating({ rating, max = 5 }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Star
                    key={i}
                    className={`size-4 ${i < rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                />
            ))}
        </div>
    );
}

// Frequency badge component
function FrequencyBadge({ value, isUp }) {
    return (
        <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isUp
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                }`}
        >
            {isUp ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            <span>{value}</span>
        </div>
    );
}

export function LatestRomTable() {
    const { t } = useLanguage();
    const [selectedRows, setSelectedRows] = useState([1]); // First row selected by default

    const toggleRow = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <Card className="border-0 shadow-md bg-white dark:bg-gray-900/50">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg font-bold text-foreground">
                        {t("latestRomRequested")}
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <MoreHorizontal className="size-5" />
                    </Button>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
                                <TableHead className="w-12 pl-6"></TableHead>
                                <TableHead className="font-medium text-muted-foreground">
                                    {t("propertyName")}
                                    <span className="ml-1 text-xs">⇅</span>
                                </TableHead>
                                <TableHead className="font-medium text-muted-foreground">
                                    {t("areaSqFt")}
                                    <span className="ml-1 text-xs">⇅</span>
                                </TableHead>
                                <TableHead className="font-medium text-muted-foreground">
                                    {t("frequency")}
                                    <span className="ml-1 text-xs">⇅</span>
                                </TableHead>
                                <TableHead className="font-medium text-muted-foreground">
                                    {t("solution")}
                                    <span className="ml-1 text-xs">⇅</span>
                                </TableHead>
                                <TableHead className="font-medium text-muted-foreground">
                                    {t("lastUpdate")}
                                    <span className="ml-1 text-xs">⇅</span>
                                </TableHead>
                                <TableHead className="font-medium text-muted-foreground">
                                    {t("status")}
                                    <span className="ml-1 text-xs">⇅</span>
                                </TableHead>
                                <TableHead className="font-medium text-muted-foreground">
                                    {t("localConnectivity")}
                                    <span className="ml-1 text-xs">⇅</span>
                                </TableHead>
                                <TableHead className="font-medium text-muted-foreground pr-6">
                                    {t("download")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map((row, index) => (
                                <motion.tr
                                    key={row.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 * index }}
                                    className={`border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${selectedRows.includes(row.id)
                                            ? "bg-green-50/50 dark:bg-green-900/10"
                                            : ""
                                        }`}
                                >
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={selectedRows.includes(row.id)}
                                                onCheckedChange={() => toggleRow(row.id)}
                                                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                            />
                                            <span
                                                className={`inline-flex items-center justify-center size-7 rounded text-xs font-medium text-white ${row.status === "LOST"
                                                        ? "bg-red-500"
                                                        : row.status === "WON"
                                                            ? "bg-green-500"
                                                            : "bg-amber-500"
                                                    }`}
                                            >
                                                {row.number}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">
                                        {row.propertyName}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {row.area.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <FrequencyBadge value={row.frequency} isUp={row.frequencyUp} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {row.solution}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {row.lastUpdate}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={row.status} t={t} />
                                    </TableCell>
                                    <TableCell>
                                        <StarRating rating={row.connectivity} />
                                    </TableCell>
                                    <TableCell className="pr-6">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`rounded-lg transition-colors ${row.status === "LOST"
                                                    ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                                    : row.status === "WON"
                                                        ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                                        : "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                                                }`}
                                        >
                                            <Download className="size-4" />
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
}
