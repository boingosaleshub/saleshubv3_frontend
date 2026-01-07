"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"

export function PlotImageModal({ isOpen, onClose, plot }) {
    const { t } = useLanguage()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    if (!plot) return null

    const screenshots = Array.isArray(plot.screenshot_urls)
        ? plot.screenshot_urls
        : []

    const hasMultipleImages = screenshots.length > 1

    const handlePrevious = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? screenshots.length - 1 : prev - 1
        )
    }

    const handleNext = () => {
        setCurrentImageIndex((prev) =>
            prev === screenshots.length - 1 ? 0 : prev + 1
        )
    }

    const handleClose = () => {
        setCurrentImageIndex(0)
        onClose()
    }

    const handleDownload = async () => {
        if (screenshots.length === 0) return

        const imageUrl = screenshots[currentImageIndex]
        const fileName = `coverage_plot_${currentImageIndex + 1}.png`

        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading image:', error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="!max-w-none !w-screen !h-screen !p-0 !m-0 !border-0 !rounded-none !top-0 !left-0 !translate-x-0 !translate-y-0"
                showCloseButton={false}
            >
                <div className="relative w-full h-full bg-black">
                    {/* Top Right Controls */}
                    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={handleClose}
                            className="bg-white hover:bg-gray-200 text-black rounded-full h-10 w-10 animate-color-blink"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={handleDownload}
                            className="bg-white hover:bg-gray-200 text-black rounded-full h-10 w-10 animate-color-blink-green"
                            title="Download image"
                        >
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Image Display */}
                    {screenshots.length > 0 ? (
                        <>
                            <div className="relative w-full h-full">
                                <Image
                                    src={screenshots[currentImageIndex]}
                                    alt={`Coverage plot ${currentImageIndex + 1}`}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            {/* Navigation Controls - Overlay at bottom */}
                            {hasMultipleImages && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handlePrevious}
                                        className="gap-2 text-white hover:text-white hover:bg-white/20"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                        Previous
                                    </Button>

                                    <span className="text-sm text-white font-medium">
                                        {currentImageIndex + 1} / {screenshots.length}
                                    </span>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleNext}
                                        className="gap-2 text-white hover:text-white hover:bg-white/20"
                                    >
                                        Next
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No screenshots available</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
