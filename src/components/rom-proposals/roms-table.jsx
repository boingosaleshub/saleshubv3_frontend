"use client"

import { useState, useMemo } from "react"
import {
    Building2,
    MapPin,
    Layers,
    ParkingCircle,
    Cpu,
    Search,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 10

function SortIcon({ column, sortConfig }) {
    if (sortConfig.key !== column) {
        return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-40" />
    }
    return sortConfig.direction === "asc"
        ? <ChevronUp className="h-3 w-3 ml-1 text-red-500" />
        : <ChevronDown className="h-3 w-3 ml-1 text-red-500" />
}

function getVendor(rom) {
    const vendors = [rom.das_vendor, rom.bda_vendor].filter(Boolean)
    if (vendors.length === 0) return "N/A"
    return [...new Set(vendors)].join(" / ")
}

export function RomsTable({ roms }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
    const [currentPage, setCurrentPage] = useState(1)

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
            }
            return { key, direction: "asc" }
        })
        setCurrentPage(1)
    }

    const filtered = useMemo(() => {
        if (!roms) return []
        const q = searchQuery.toLowerCase().trim()
        if (!q) return roms
        return roms.filter((rom) =>
            rom.venue_name?.toLowerCase().includes(q) ||
            rom.venue_address?.toLowerCase().includes(q) ||
            rom.venue_type?.toLowerCase().includes(q) ||
            rom.system_type?.toLowerCase().includes(q) ||
            rom.das_vendor?.toLowerCase().includes(q) ||
            rom.bda_vendor?.toLowerCase().includes(q)
        )
    }, [roms, searchQuery])

    const sorted = useMemo(() => {
        if (!sortConfig.key) return filtered
        return [...filtered].sort((a, b) => {
            let aVal = a[sortConfig.key]
            let bVal = b[sortConfig.key]
            if (sortConfig.key === "vendor") {
                aVal = getVendor(a)
                bVal = getVendor(b)
            }
            if (aVal == null) return 1
            if (bVal == null) return -1
            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal
            }
            const cmp = String(aVal).localeCompare(String(bVal))
            return sortConfig.direction === "asc" ? cmp : -cmp
        })
    }, [filtered, sortConfig])

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
    const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    if (!roms || roms.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-white dark:bg-[#1a1d21] border-dashed">
                <FileSpreadsheet className="h-10 w-10 mb-4 opacity-20" />
                <p className="text-sm">No ROM proposals found</p>
            </Card>
        )
    }

    const columns = [
        { key: "venue_name", label: "Venue Name", icon: Building2 },
        { key: "venue_address", label: "Venue Address", icon: MapPin },
        { key: "venue_type", label: "Type", icon: Layers },
        { key: "num_floors", label: "Floors", icon: null },
        { key: "gross_sq_ft", label: "Total Coverage Area (sq ft)", icon: null },
        { key: "has_parking_garage", label: "Parking", icon: ParkingCircle },
        { key: "system_type", label: "System Type", icon: Cpu },
        { key: "vendor", label: "Vendor", icon: null },
        { key: "num_sectors", label: "Sectors", icon: null },
    ]

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder="Search by venue name, address, type, vendor..."
                        className="pl-9 h-10 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {filtered.length} {filtered.length === 1 ? "result" : "results"}
                </span>
            </div>

            {/* Table */}
            <Card className="overflow-hidden border shadow-lg bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                            <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                                {columns.map((col) => (
                                    <TableHead
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100 transition-colors first:pl-6 last:pr-6 whitespace-nowrap"
                                    >
                                        <div className="flex items-center">
                                            {col.label}
                                            <SortIcon column={col.key} sortConfig={sortConfig} />
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.map((rom) => (
                                <TableRow
                                    key={rom.id}
                                    className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-800 transition-colors"
                                >
                                    {/* Venue Name */}
                                    <TableCell className="pl-6 py-4">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                            {rom.venue_name}
                                        </span>
                                    </TableCell>

                                    {/* Venue Address */}
                                    <TableCell className="py-4 max-w-[280px]">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate font-medium" title={rom.venue_address}>
                                                {rom.venue_address}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Venue Type */}
                                    <TableCell className="py-4">
                                        <Badge
                                            variant="outline"
                                            className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap"
                                        >
                                            {rom.venue_type}
                                        </Badge>
                                    </TableCell>

                                    {/* Number of Floors */}
                                    <TableCell className="py-4 text-center">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {rom.num_floors}
                                        </span>
                                    </TableCell>

                                    {/* Gross Sq Ft */}
                                    <TableCell className="py-4 text-center">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {Number(rom.gross_sq_ft).toLocaleString()}
                                        </span>
                                    </TableCell>

                                    {/* Parking Garage */}
                                    <TableCell className="py-4 text-center">
                                        <Badge
                                            variant="secondary"
                                            className={rom.has_parking_garage
                                                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0 font-medium"
                                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-0 font-medium"
                                            }
                                        >
                                            {rom.has_parking_garage ? "Yes" : "No"}
                                        </Badge>
                                    </TableCell>

                                    {/* System Type */}
                                    <TableCell className="py-4">
                                        <Badge
                                            variant="secondary"
                                            className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium whitespace-nowrap"
                                        >
                                            {rom.system_type}
                                        </Badge>
                                    </TableCell>

                                    {/* Vendor */}
                                    <TableCell className="py-4">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                            {getVendor(rom)}
                                        </span>
                                    </TableCell>

                                    {/* Number of Sectors */}
                                    <TableCell className="pr-6 py-4 text-center">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {rom.num_sectors}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) {
                                    acc.push("ellipsis-" + p)
                                }
                                acc.push(p)
                                return acc
                            }, [])
                            .map((item) =>
                                typeof item === "string" ? (
                                    <span key={item} className="text-sm text-muted-foreground px-1">...</span>
                                ) : (
                                    <Button
                                        key={item}
                                        variant={item === currentPage ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(item)}
                                        className={`h-8 w-8 p-0 ${item === currentPage ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                                    >
                                        {item}
                                    </Button>
                                )
                            )}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
