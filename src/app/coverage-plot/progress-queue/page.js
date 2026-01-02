"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, User } from "lucide-react"

export default function ProgressQueuePage() {
    const [queue, setQueue] = useState([])
    const [isLoading, setIsLoading] = useState(true)

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

    return (
        <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-8rem)] bg-gray-50 p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Automation Queue</h1>
                    <p className="text-gray-500 mt-2">Current status of coverage plot requests</p>
                </div>

                <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-0">
                    <div className="bg-[#3D434A] py-4 px-6 border-b-4 border-red-600">
                        <div className="flex justify-between items-center text-white">
                            <span className="font-semibold">User Queue</span>
                            <span className="text-sm opacity-80">{queue.length} active requests</span>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                        {isLoading && queue.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                <p>Loading queue...</p>
                            </div>
                        ) : queue.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <p>No active automation requests.</p>
                                <p className="text-sm mt-1">The queue is currently empty.</p>
                            </div>
                        ) : (
                            queue.map((item, index) => (
                                <div
                                    key={item.userId}
                                    className={`p-4 flex items-center justify-between transition-colors ${index === 0 ? 'bg-red-50/50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                            ${index === 0 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 flex items-center gap-2">
                                                {item.userName}
                                                {index === 0 && (
                                                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0 h-5">
                                                        Processing
                                                    </Badge>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Joined: {new Date(item.joinedAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {index === 0 ? (
                                            <div className="flex items-center text-red-600 text-sm font-medium">
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Running
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">Waiting...</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
