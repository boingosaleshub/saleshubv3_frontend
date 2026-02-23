"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    Eye,
    MapPin,
    Signal,
    Search,
    ArrowUpDown,
    ArrowUpAZ,
    ArrowDownAZ,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Trash2,
} from "lucide-react"
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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlotImageModal } from "./plot-image-modal"
import { useLanguage } from "@/components/providers/language-provider"
import { createClient } from "@/utils/supabase/client"
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

export function PlotsTable({ plots, showDeleteOption, onDelete }) {
    const { t } = useLanguage()
    const router = useRouter()
    const [selectedPlot, setSelectedPlot] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [plotToDelete, setPlotToDelete] = useState(null)

    // Search state
    const [searchQuery, setSearchQuery] = useState("")

    // Sort state: null | "asc" | "desc"
    const [sortOrder, setSortOrder] = useState(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const handleViewPlot = (e, plot) => {
        e.stopPropagation()
        setSelectedPlot(plot)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (e, plot) => {
        e.stopPropagation()
        setPlotToDelete(plot)
    }

    const confirmDelete = async () => {
        if (!plotToDelete) return

        try {
            const supabase = createClient()
            const plot = plotToDelete

            // Extract file paths from URLs
            const getPathsFromUrls = (urls) => {
                if (!urls || urls.length === 0) return []
                return urls.map(url => {
                    if (typeof url !== 'string') return null
                    // Extract the filename from the end of the URL
                    const urlParts = url.split('/')
                    return urlParts[urlParts.length - 1]
                }).filter(Boolean)
            }

            // 1. Delete screenshots from storage if they exist
            if (plot.screenshot_urls && plot.screenshot_urls.length > 0) {
                const filenames = getPathsFromUrls(plot.screenshot_urls)

                if (filenames.length > 0) {
                    const { error: storageError } = await supabase.storage
                        .from('coverage-plots')
                        .remove(filenames)

                    if (storageError) {
                        console.warn("Could not delete some screenshots from storage:", storageError)
                    }
                }
            }

            // 2. Delete the record from the database
            const { error: dbError } = await supabase
                .from('coverage_plots')
                .delete()
                .eq('id', plot.id)

            if (dbError) throw dbError

            // 3. Notify parent to refresh
            if (onDelete) {
                onDelete()
            }
        } catch (error) {
            console.error("Error deleting plot:", error)
            alert("Failed to delete plot: " + error.message)
        } finally {
            setPlotToDelete(null)
        }
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

    // Derived: filtered + sorted data
    const processedPlots = useMemo(() => {
        let result = [...(plots || [])]

        // Filter by search query (username or venue address)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            result = result.filter((plot) => {
                const userName = (plot.user_name || "").toLowerCase()
                const userEmail = (plot.user_email || "").toLowerCase()
                const venueAddress = (plot.venue_address || "").toLowerCase()
                return (
                    userName.includes(query) ||
                    userEmail.includes(query) ||
                    venueAddress.includes(query)
                )
            })
        }

        // Sort by venue address
        if (sortOrder) {
            result.sort((a, b) => {
                const addrA = (a.venue_address || "").toLowerCase()
                const addrB = (b.venue_address || "").toLowerCase()
                if (addrA < addrB) return sortOrder === "asc" ? -1 : 1
                if (addrA > addrB) return sortOrder === "asc" ? 1 : -1
                return 0
            })
        }

        return result
    }, [plots, searchQuery, sortOrder])

    // Pagination calculations
    const totalItems = processedPlots.length
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))

    // Reset to page 1 when search/sort/rowsPerPage changes
    const safeCurrentPage = Math.min(currentPage, totalPages)
    if (safeCurrentPage !== currentPage) {
        // will re-render
        setCurrentPage(safeCurrentPage)
    }

    const startIndex = (safeCurrentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedPlots = processedPlots.slice(startIndex, endIndex)

    // Handle search change — reset to page 1
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }

    // Handle sort toggle
    const handleSortChange = (value) => {
        setSortOrder(value === "none" ? null : value)
        setCurrentPage(1)
    }

    // Handle rows per page change
    const handleRowsPerPageChange = (value) => {
        setRowsPerPage(Number(value))
        setCurrentPage(1)
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5

        if (totalPages <= maxVisible + 2) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            let start = Math.max(2, safeCurrentPage - 1)
            let end = Math.min(totalPages - 1, safeCurrentPage + 1)

            // Adjust range to always show at least 3 middle pages
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

            // Always show last page
            pages.push(totalPages)
        }

        return pages
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
            {/* Search Bar & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-start gap-3 mb-4">
                {/* Search Input */}
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search by username or venue address..."
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
                    <SelectTrigger className="w-full sm:w-[190px] h-9 bg-white dark:bg-[#1a1d21] border-gray-200 dark:border-gray-700 text-sm">
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Sort by Address" />
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
                                Address: A → Z
                            </span>
                        </SelectItem>
                        <SelectItem value="desc">
                            <span className="flex items-center gap-2">
                                <ArrowDownAZ className="h-4 w-4" />
                                Address: Z → A
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>



            {/* Table */}
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
                            <TableHead className="text-left py-4 pl-4 pr-6 uppercase tracking-wider text-xs font-semibold text-muted-foreground w-[180px]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedPlots.length > 0 ? (
                            paginatedPlots.map((plot) => (
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
                                    <TableCell className="text-left pl-4 pr-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-start gap-1">
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
                                            {showDeleteOption && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleDeleteClick(e, plot)}
                                                    className="text-gray-700 dark:text-gray-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 font-medium h-8 ml-1"
                                                    title="Delete plot"
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
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Search className="h-8 w-8 opacity-30" />
                                        <p className="text-sm">No records found matching &quot;{searchQuery}&quot;</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
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
                            {searchQuery.trim() && ` (filtered from ${plots.length} total)`}
                        </span>
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-1">
                        {/* First page button */}
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

                        {/* Previous button */}
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

                        {/* Page number buttons */}
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

                        {/* Next button */}
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

                        {/* Last page button */}
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

            <PlotImageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plot={selectedPlot}
            />

            {/* Delete Confirmation Modal */}
            <AlertDialog open={!!plotToDelete} onOpenChange={(open) => !open && setPlotToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the coverage plot and remove its data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
