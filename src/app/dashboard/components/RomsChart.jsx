"use client";

import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";
import { useState } from "react";

// Mock data for the chart - monthly ROM requests
const chartData = [
    { month: "January", das: 4, erces: 6, dasErcs: 8 },
    { month: "February", das: 3, erces: 5, dasErcs: 6 },
    { month: "March", das: 5, erces: 8, dasErcs: 12 },
    { month: "April", das: 8, erces: 12, dasErcs: 18 },
    { month: "May", das: 6, erces: 10, dasErcs: 14 },
    { month: "June", das: 4, erces: 7, dasErcs: 10 },
    { month: "July", das: 5, erces: 8, dasErcs: 11 },
    { month: "August", das: 6, erces: 9, dasErcs: 12 },
    { month: "September", das: 3, erces: 5, dasErcs: 7 },
    { month: "October", das: 7, erces: 11, dasErcs: 15 },
    { month: "November", das: 9, erces: 14, dasErcs: 19 },
    { month: "December", das: 5, erces: 8, dasErcs: 11 },
];

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                <p className="font-medium text-foreground mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="size-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.name}:</span>
                        <span className="font-medium text-foreground">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

// Custom legend component
function CustomLegend() {
    const items = [
        { name: "DAS", color: "#d1d5db" },
        { name: "ERCES", color: "#E2211C" },
        { name: "DAS & ERRCS", color: "#3D434A" },
    ];

    return (
        <div className="flex items-center gap-6 mb-4">
            {items.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                    <div
                        className="w-4 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
            ))}
        </div>
    );
}

export function RomsChart() {
    const [timeFilter, setTimeFilter] = useState("thisYear");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="border-0 shadow-md bg-white dark:bg-gray-900/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-bold text-foreground">
                        ROMs Requested
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <Select value={timeFilter} onValueChange={setTimeFilter}>
                            <SelectTrigger className="w-[140px] h-9 bg-gray-100 dark:bg-gray-800 border-0">
                                <SelectValue placeholder="This Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="thisYear">This Year</SelectItem>
                                <SelectItem value="lastYear">Last Year</SelectItem>
                                <SelectItem value="last6Months">Last 6 Months</SelectItem>
                                <SelectItem value="last3Months">Last 3 Months</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-[#3D434A] hover:bg-[#2d3339] text-white dark:bg-[#3D434A] dark:hover:bg-[#4d535a] gap-2"
                        >
                            <Download className="size-4" />
                            Download
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <CustomLegend />
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorDas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#d1d5db" stopOpacity={0.2} />
                                    </linearGradient>
                                    <linearGradient id="colorErces" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E2211C" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#E2211C" stopOpacity={0.3} />
                                    </linearGradient>
                                    <linearGradient id="colorDasErcs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3D434A" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#3D434A" stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e5e7eb"
                                    className="dark:stroke-gray-700"
                                />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: "#6b7280" }}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: "#6b7280" }}
                                    domain={[0, 25]}
                                    ticks={[0, 5, 10, 15, 20]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="das"
                                    name="DAS"
                                    stackId="1"
                                    stroke="#d1d5db"
                                    fill="url(#colorDas)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="erces"
                                    name="ERCES"
                                    stackId="1"
                                    stroke="#E2211C"
                                    fill="url(#colorErces)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="dasErcs"
                                    name="DAS & ERRCS"
                                    stackId="1"
                                    stroke="#3D434A"
                                    fill="url(#colorDasErcs)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
