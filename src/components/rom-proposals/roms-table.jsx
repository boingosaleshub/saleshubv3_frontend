"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/providers/language-provider"
import {
    MapPin,
    Search,
    ArrowUpDown,
    ArrowUpAZ,
    ArrowDownAZ,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    FileSpreadsheet,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
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

import { createClient } from "@/utils/supabase/client"

function getVendor(rom) {
    const vendors = [rom.das_vendor, rom.bda_vendor].filter(Boolean)
    if (vendors.length === 0) return "N/A"
    return [...new Set(vendors)].join(" / ")
}

export function RomsTable({ roms, showDeleteOption, onDelete }) {
    const { t } = useLanguage()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOrder, setSortOrder] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [romToDelete, setRomToDelete] = useState(null)

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

    const handleDeleteClick = (e, rom) => {
        e.stopPropagation()
        setRomToDelete(rom)
    }

    const confirmDelete = async () => {
        if (!romToDelete) return

        const rom = romToDelete
        if (!rom?.id) {
            toast.error("Invalid ROM proposal (missing id)")
            return
        }

        try {
            const supabase = createClient()

            // Extract file paths from URLs (strip query string for storage remove)
            const getPathsFromUrls = (urls) => {
                if (!urls || urls.length === 0) return []
                return urls.map(url => {
                    if (typeof url !== 'string') return null
                    const parts = url.split('/rom-proposals/')
                    if (parts.length < 2) return null
                    const path = decodeURIComponent(parts[1].split('?')[0])
                    return path || null
                }).filter(Boolean)
            }

            const filesToDelete = [
                ...getPathsFromUrls(rom.screenshot_urls),
                ...getPathsFromUrls(rom.excel_file_urls)
            ]

            // 1. Delete files from storage if they exist
            if (filesToDelete.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('rom-proposals')
                    .remove(filesToDelete)

                if (storageError) {
                    console.warn("Could not delete some files from storage:", storageError)
                }
            }

            // 2. Delete the record from the database and return deleted row to verify
            // (Supabase returns 204/no error when RLS blocks delete, so we must check data)
            const { data: deletedRows, error: dbError } = await supabase
                .from('rom_proposals')
                .delete()
                .eq('id', rom.id)
                .select('id')

            if (dbError) throw dbError

            const actuallyDeleted = Array.isArray(deletedRows) && deletedRows.length > 0
            if (!actuallyDeleted) {
                toast.error(
                    "Delete not allowed. Row may be protected by permissions (RLS). " +
                    "In Supabase, add a DELETE policy on rom_proposals for authenticated users."
                )
                return
            }

            toast.success(t("romProposalDeleted"))
            if (onDelete) {
                onDelete()
            }
        } catch (error) {
            console.error("Error deleting ROM proposal:", error)
            toast.error(t("failedToDeleteRom") + ": " + (error?.message || "Unknown error"))
        } finally {
            setRomToDelete(null)
        }
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
                <p className="text-sm">{t("noRomProposalsFound")}</p>
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
                        placeholder={t("searchByVenueNameAddress")}
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
                            <SelectValue placeholder={t("sortByVenueName")} />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">
                            <span className="flex items-center gap-2">
                                {t("noSorting")}
                            </span>
                        </SelectItem>
                        <SelectItem value="asc">
                            <span className="flex items-center gap-2">
                                <ArrowUpAZ className="h-4 w-4" />
                                {t("venueNameAZ")}
                            </span>
                        </SelectItem>
                        <SelectItem value="desc">
                            <span className="flex items-center gap-2">
                                <ArrowDownAZ className="h-4 w-4" />
                                {t("venueNameZA")}
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
                                    {t("venueName")}
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    {t("venueAddress")}
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    {t("typeColumn")}
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    {t("floors")}
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    {t("totalCoverageAreaSqFt")}
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    {t("parking")}
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    {t("systemType")}
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    {t("vendor")}
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                    {t("sectors")}
                                </TableHead>
                                <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap text-center">
                                    {t("status")}
                                </TableHead>
                                <TableHead className="py-4 pr-6 uppercase tracking-wider text-xs font-semibold text-muted-foreground whitespace-nowrap text-center">
                                    {t("action")}
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
                                                {rom.has_parking_garage ? t("yes") : t("no")}
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

                                        <TableCell className="py-4 text-center">
                                            {rom.approval_status === "Approved" ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0 font-medium gap-1"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {t("approved")}
                                                </Badge>
                                            ) : rom.approval_status === "Rejected" ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0 font-medium gap-1"
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                    {t("rejected")}
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-0 font-medium gap-1"
                                                >
                                                    <Clock className="h-3 w-3" />
                                                    {t("pending")}
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-center pr-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                {showDeleteOption !== false && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => handleDeleteClick(e, rom)}
                                                        className="text-gray-700 dark:text-gray-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 font-medium h-8"
                                                        title="Delete ROM proposal"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-32 text-center">
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
                            <span className="text-sm text-muted-foreground whitespace-nowrap">{t("rowsPerPage")}:</span>
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

            {/* Delete Confirmation Modal */}
            <AlertDialog open={!!romToDelete} onOpenChange={(open) => !open && setRomToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmDeleteRom")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirmDeleteRomDesc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white">
                            {t("deleteButton")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
