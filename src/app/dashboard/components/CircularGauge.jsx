"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

/**
 * CircularGauge - A beautiful animated circular progress gauge
 * @param {number} percentage - The main percentage to display (0-100)
 * @param {string} label - The label text above the gauge
 * @param {string} value - The main value to display (e.g., "15%", "10")
 * @param {string} subValue - The small text below value (e.g., "+3.96%")
 * @param {string} trend - Trend percentage with direction (e.g., "+20.90%")
 * @param {string} color - Color variant: "green", "yellow", or "red"
 */
export function CircularGauge({
    percentage = 0,
    label = "",
    value = "",
    subValue = "",
    trend = "",
    color = "green",
}) {
    const size = 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Color configurations matching Boingo brand
    const colorConfig = {
        green: {
            stroke: "#22c55e",
            bg: "rgba(34, 197, 94, 0.15)",
            text: "text-green-600 dark:text-green-400",
        },
        yellow: {
            stroke: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.15)",
            text: "text-amber-600 dark:text-amber-400",
        },
        red: {
            stroke: "#E2211C",
            bg: "rgba(226, 33, 28, 0.15)",
            text: "text-[#E2211C] dark:text-red-400",
        },
    };

    const config = colorConfig[color] || colorConfig.green;
    const isPositive = trend.startsWith("+");

    return (
        <div className="flex items-center gap-4">
            {/* Circular Gauge */}
            <div className="relative">
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={config.stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                {/* Percentage text in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className={`text-xl font-bold ${config.text}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        {percentage}%
                    </motion.span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-2xl font-bold text-foreground">{value}</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{subValue}</span>
                    {trend && (
                        <div
                            className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-500"
                                }`}
                        >
                            {isPositive ? (
                                <ArrowUp className="size-3" />
                            ) : (
                                <ArrowDown className="size-3" />
                            )}
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
