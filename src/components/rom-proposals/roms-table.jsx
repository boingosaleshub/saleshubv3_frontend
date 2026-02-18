"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    Building2,
    MapPin,
    Layers,
    ParkingCircle,
    Cpu,
    Search,
    ArrowUpDown,
    ArrowUpAZ,
    ArrowDownAZ,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

function getVendor(rom) {
    const vendors = [rom.das_vendor, rom.bda_vendor].filter(Boolean)
    if (vendors.length === 0) return "N/A"
    return [...new Set(vendors)].join(" / ")
}

export function RomsTable({ roms }) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOrder, setSortOrder] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const processedRoms = useMemo(() => {
        let result = [...(roms || [])]

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            result = result.filter((rom) =>
                rom.venue_name?.toLowerCase().includes(q) ||
                rom.venue_address?.toLowerCase().includes(q) ||
                rom.venue_type?.toLowerCase().includes(q) ||
                rom.system_type?.toLowerCase().includes(q) ||
                rom.das_vendor?.toLowerCase().includes(q) ||
                rom.bda_vendor?.toLowerCase().includes(q)
            )
        }

        if (sortOrder) {
            result.sort((a, b) => {
                const nameA = (a.venue_name || "").toLowerCase()
                const nameB = (b.venue_name || "").toLowerCase()
                if (nameA < nameB) return sortOrder === "asc" ? -1 : 1
                if (nameA > nameB) return sortOrder === "asc" ? 1 : -1
                return 0
            })
        }

        return result
    }, [roms, searchQuery, sortOrder])

    const totalItems = processedRoms.length
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))

    const safeCurrentPage = Math.min(currentPage, totalPages)
    if (safeCurrentPage !== currentPage) {
        setCurrentPage(safeCurrentPage)
    }

    const startIndex = (safeCurrentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedRoms = processedRoms.slice(startIndex, endIndex)

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }

    const handleSortChange = (value) => {
        setSortOrder(value === "none" ? null : value)
        setCurrentPage(1)
    }

    const handleRowsPerPageChange = (value) => {
        setRowsPerPage(Number(value))
        setCurrentPage(1)
    }

    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)

            let start = Math.max(2, safeCurrentPage - 1)
            let end = Math.min(totalPages - 1, safeCurrentPage + 1)

            if (safeCurrentPage <= 3) {
                end = Math.min(totalPages - 1, 4)
            }
            if (safeCurrentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 3)
            }

            if (start > 2) {
                pages.push("...")
            }

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (end < totalPages - 1) {
                pages.push("...")
            }

            pages.push(totalPages)
        }

        return pages
    }

    if (!roms || roms.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-white dark:bg-[#1a1d21] border-dashed">
                <FileSpreadsheet className="h-10 w-10 mb-4 opacity-20" />
                <p className="text-sm">No ROM proposals found</p>
            </Card>
        )
    }

    return (
        <>
            {/* Search Bar & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-start gap-3 mb-4">
                {/* Search Input */}
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search by venue name, address, type, vendor..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 h-10 w-full sm:w-[500px] bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 focus-visible:ring-red-500/30 focus-visible:border-red-500 text-sm"
                    />
                </div>

                {/* Sort Dropdown */}
                <Select
                    value={sortOrder || "none"}
                    onValueChange={handleSortChange}
                >
                    <SelectTrigger className="w-full sm:w-[220px] h-9 bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 text-sm">
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Sort by Venue Name" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">
                            <span className="flex items-center gap-2">
                                No Sorting
                            </span>
                        </SelectItem>
                        <SelectItem value="asc">
                            <span className="flex items-center gap-2">
                                <ArrowUpAZ className="h-4 w-4" />
                                Venue Name: A → Z
                            </span>
                        </SelectItem>
                        <SelectItem value="desc">
                            <span className="flex items-center gap-2">
                                <ArrowDownAZ className="h-4 w-4" />
                                Venue Name: Z → A
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="overflow-hidden border shadow-lg bg-white dark:bg-[#1a1d21] dark:border-gray-800 rounded-xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                            <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                                <TableHead className="py-4 pl-6 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Venue Name
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Venue Address
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Type
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Floors
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Total Coverage Area (sq ft)
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Parking
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    System Type
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Vendor
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    Sectors
                                </TableHead>
                                <TableHead className="py-4 pr-6 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRoms.length > 0 ? (
                                paginatedRoms.map((rom) => (
                                    <TableRow
                                        key={rom.id}
                                        className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-800 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/all-roms/${rom.id}`)}
                                    >
                                        <TableCell className="pl-6 py-4">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                {rom.venue_name}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-4 max-w-[280px]">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                <span className="text-sm text-gray-600 dark:text-gray-300 truncate font-medium" title={rom.venue_address}>
                                                    {rom.venue_address}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <Badge
                                                variant="outline"
                                                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap"
                                            >
                                                {rom.venue_type}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="py-4 text-center">
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {rom.num_floors}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-4 text-center">
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {Number(rom.gross_sq_ft).toLocaleString()}
                                            </span>
                                        </TableCell>

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

                                        <TableCell className="py-4">
                                            <Badge
                                                variant="secondary"
                                                className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 border-0 font-medium whitespace-nowrap"
                                            >
                                                {rom.system_type}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                                {getVendor(rom)}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-4 text-center">
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {rom.num_sectors}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-right pr-6 py-4">
                                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-red-500 transition-colors duration-200 ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="h-8 w-8 opacity-30" />
                                            <p className="text-sm">No records found matching &quot;{searchQuery}&quot;</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Pagination Controls */}
            {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-1">
                    {/* Rows per page selector + record info */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
                            <Select
                                value={String(rowsPerPage)}
                                onValueChange={handleRowsPerPageChange}
                            >
                                <SelectTrigger className="w-[75px] h-9 bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="30">30</SelectItem>
                                    <SelectItem value="40">40</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Showing {totalItems === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems} record{totalItems !== 1 ? "s" : ""}
                            {searchQuery.trim() && ` (filtered from ${roms.length} total)`}
                        </span>
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1d21] hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                            onClick={() => setCurrentPage(1)}
                            disabled={safeCurrentPage === 1}
                            title="First page"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1d21] hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={safeCurrentPage === 1}
                            title="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {getPageNumbers().map((page, idx) =>
                            page === "..." ? (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="px-2 text-sm text-muted-foreground select-none"
                                >
                                    …
                                </span>
                            ) : (
                                <Button
                                    key={page}
                                    variant={page === safeCurrentPage ? "default" : "outline"}
                                    size="icon"
                                    className={`h-9 w-9 text-sm font-medium transition-all duration-200 ${page === safeCurrentPage
                                        ? "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md"
                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1d21] hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            )
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1d21] hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safeCurrentPage === totalPages}
                            title="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1d21] hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={safeCurrentPage === totalPages}
                            title="Last page"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}
