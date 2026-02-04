"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, BarChart2, Layers } from "lucide-react"
import { useAutomationStore } from "@/store/useAutomationStore"

// Process type icons mapping
const processIcons = {
    'Coverage Plot': BarChart2,
    'ROM Generator': Layers
}

// Process type colors mapping
const processColors = {
    'Coverage Plot': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    'ROM Generator': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
}

export default function ProcessQueuePage() {
    const [queue, setQueue] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    
    // Get active processes from persistent store
    const { activeProcesses } = useAutomationStore()

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await fetch('/api/queue')
                if (res.ok) {
                    const data = await res.json()
                    setQueue(data.queue || [])
                }
            } catch (error) {
                console.error("Failed to fetch queue:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchQueue()
        const interval = setInterval(fetchQueue, 3000)

        return () => clearInterval(interval)
    }, [])
    
    // Merge API queue with local active processes (avoid duplicates)
    const mergedQueue = (() => {
        const localProcesses = activeProcesses.map(p => ({
            userId: p.userId,
            userName: p.userName,
            processType: p.processType,
            joinedAt: p.startedAt,
            status: 'Processing',
            isLocal: true
        }))
        
        // Filter out API queue items that match local processes (by processType)
        const localProcessTypes = new Set(localProcesses.map(p => p.processType))
        const filteredApiQueue = queue.filter(item => !localProcessTypes.has(item.processType))
        
        // Local processes first (they're definitely running on this client)
        return [...localProcesses, ...filteredApiQueue]
    })()

    return (
        <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-8rem)] bg-gray-50 dark:bg-transparent p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Process Queue</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Current status of all automation processes</p>
                </div>

                <Card className="bg-white dark:bg-[#1a1d21] shadow-xl rounded-xl overflow-hidden border-0 dark:border dark:border-gray-800">
                    <div className="bg-[#3D434A] py-4 px-6 border-b-4 border-red-600">
                        <div className="flex justify-between items-center text-white">
                            <span className="font-semibold">Automation Queue</span>
                            <span className="text-sm opacity-80">{mergedQueue.length} active {mergedQueue.length === 1 ? 'process' : 'processes'}</span>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
                        {isLoading && mergedQueue.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                <p>Loading queue...</p>
                            </div>
                        ) : mergedQueue.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <p>No active automation processes.</p>
                                <p className="text-sm mt-1">The queue is currently empty.</p>
                            </div>
                        ) : (
                            mergedQueue.map((item, index) => {
                                const ProcessIcon = processIcons[item.processType] || Layers
                                const processColorClass = processColors[item.processType] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                
                                return (
                                    <div
                                        key={item.userId}
                                        className={`p-4 flex items-center justify-between transition-colors ${index === 0 ? 'bg-red-50/50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                                ${index === 0 ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
                                            `}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                                                    <span>{item.userName}</span>
                                                    {item.processType && (
                                                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 h-5 flex items-center gap-1 ${processColorClass}`}>
                                                            <ProcessIcon className="w-3 h-3" />
                                                            {item.processType}
                                                        </Badge>
                                                    )}
                                                    {index === 0 && (
                                                        <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] px-1.5 py-0 h-5">
                                                            Processing
                                                        </Badge>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Joined: {new Date(item.joinedAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {index === 0 ? (
                                                <div className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Running
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Waiting...</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
