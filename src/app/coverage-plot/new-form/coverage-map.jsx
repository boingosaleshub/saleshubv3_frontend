"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import { useTheme } from "@/components/providers/theme-provider"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"

function MapUpdater({ center, zoom }) {
    const map = useMap()

    useEffect(() => {
        map.setView(center, zoom)
    }, [map, center, zoom])

    return null
}

export default function CoverageMap({ lat, lng, zoom = 13 }) {
    const { theme } = useTheme()
    const position = useMemo(() => [lat, lng], [lat, lng])

    if (!lat || !lng) return null

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full rounded-tr-xl rounded-br-xl"
            style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={theme === 'dark'
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
            />
            <Marker position={position} />
            <MapUpdater center={position} zoom={zoom} />
        </MapContainer>
    )
}

