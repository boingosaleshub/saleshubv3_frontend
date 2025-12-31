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

    // Modified benefits with strict color palette
    // Red: #E2211C, Grey: #3D434A, White: #ffffff
    const benefitsList = [
        {
            icon: Clock,
            title: "Save 10+ Hours Per ROM",
            description: "Eliminate manual data entry and calculations. What took a day now takes minutes.",
            stat: "80%",
            statLabel: "Time Saved",
        },
        {
            icon: TrendingUp,
            title: "Increase Accuracy",
            description: "Automated pricing models ensure consistent, error-free proposals every time.",
            stat: "99%",
            statLabel: "Accuracy Rate",
        },
        {
            icon: Target,
            title: "Faster Approvals",
            description: "Real-time notifications reduce approval times from days to hours.",
            stat: "3x",
            statLabel: "Faster Turnaround",
        },
        {
            icon: Handshake,
            title: "Better Client Experience",
            description: "Professional, branded proposals create a premium impression every time.",
            stat: "100%",
            statLabel: "Professional Output",
        },
        {
            icon: Gauge,
            title: "Real-Time Visibility",
            description: "Track ROM status and access analytics dashboards from anywhere.",
            stat: "24/7",
            statLabel: "Live Dashboard",
        },
        {
            icon: CloudDownload,
            title: "Instant Export Options",
            description: "Download ROMs as PDF, PowerPoint, or Excel with a single click.",
            stat: "3",
            statLabel: "Export Formats",
        },
    ];

    return (
        <section id="benefits" ref={ref} className="relative py-24 bg-white overflow-hidden">
            {/* Background elements - Grey subtle touches */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3D434A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E2211C]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide bg-[#E2211C]/10 text-[#E2211C] border border-[#E2211C]/20 mb-4">Why Choose SalesHub</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-black mb-4">
                        Benefits That <span className="text-[#E2211C]">Drive Results</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-[#3D434A] leading-relaxed">Real business impact for sales teams and engineering departments alike.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefitsList.map((benefit, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -8 }} className="group relative">
                            <div className="relative h-full bg-white rounded-2xl border border-[#3D434A]/10 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                                {/* Icon Container */}
                                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#E2211C] shadow-md shadow-[#E2211C]/20 mb-6">
                                    <benefit.icon className="w-7 h-7 text-white" />
                                </motion.div>

                                <h3 className="text-xl font-bold tracking-tight text-black mb-3">{benefit.title}</h3>
                                <p className="text-[#3D434A] mb-6 leading-relaxed font-normal">{benefit.description}</p>

                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-extrabold tracking-tight text-[#E2211C]">{benefit.stat}</span>
                                    <span className="text-sm font-medium tracking-wide text-[#3D434A] pb-1 opacity-80">{benefit.statLabel}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
