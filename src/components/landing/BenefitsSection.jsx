"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, TrendingUp, Target, Handshake, Gauge, CloudDownload } from "lucide-react";

const benefits = [
    {
        icon: Clock,
        title: "Save 10+ Hours Per ROM",
        description: "Eliminate manual data entry and calculations. What took a day now takes minutes.",
        stat: "80%",
        statLabel: "Time Saved",
        gradient: "from-[#E41F26] to-[#FF6B6B]",
    },
    {
        icon: TrendingUp,
        title: "Increase Accuracy",
        description: "Automated pricing models ensure consistent, error-free proposals every time.",
        stat: "99%",
        statLabel: "Accuracy Rate",
        gradient: "from-blue-500 to-cyan-400",
    },
    {
        icon: Target,
        title: "Faster Approvals",
        description: "Real-time notifications reduce approval times from days to hours.",
        stat: "3x",
        statLabel: "Faster Turnaround",
        gradient: "from-purple-500 to-violet-400",
    },
    {
        icon: Handshake,
        title: "Better Client Experience",
        description: "Professional, branded proposals create a premium impression every time.",
        stat: "100%",
        statLabel: "Professional Output",
        gradient: "from-green-500 to-emerald-400",
    },
    {
        icon: Gauge,
        title: "Real-Time Visibility",
        description: "Track ROM status and access analytics dashboards from anywhere.",
        stat: "24/7",
        statLabel: "Live Dashboard",
        gradient: "from-orange-500 to-amber-400",
    },
    {
        icon: CloudDownload,
        title: "Instant Export Options",
        description: "Download ROMs as PDF, PowerPoint, or Excel with a single click.",
        stat: "3",
        statLabel: "Export Formats",
        gradient: "from-pink-500 to-rose-400",
    },
];

export default function BenefitsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="benefits" ref={ref} className="relative py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-[#E41F26]/5 via-transparent to-blue-500/5 rounded-full blur-3xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide bg-gradient-to-r from-[#E41F26]/10 to-[#B5121B]/10 text-[#E41F26] border border-[#E41F26]/20 mb-4">Why Choose SalesHub</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                        Benefits That <span className="bg-gradient-to-r from-[#E41F26] to-[#FF6B6B] bg-clip-text text-transparent">Drive Results</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 leading-relaxed">Real business impact for sales teams and engineering departments alike.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -8 }} className="group relative">
                            <motion.div className={`absolute -inset-0.5 bg-gradient-to-r ${benefit.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                            <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-100/50 to-transparent dark:from-gray-700/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.gradient} shadow-lg mb-6`}>
                                    <benefit.icon className="w-7 h-7 text-white" />
                                </motion.div>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">{benefit.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-normal">{benefit.description}</p>
                                <div className="flex items-end gap-2">
                                    <span className={`text-4xl font-extrabold tracking-tight bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent`}>{benefit.stat}</span>
                                    <span className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 pb-1">{benefit.statLabel}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
