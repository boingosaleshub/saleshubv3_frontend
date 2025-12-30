"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    ListChecks,
    FileSignature,
    Cog,
    CheckCircle2,
    ArrowDown,
    ChevronRight,
} from "lucide-react";

const steps = [
    {
        number: "01",
        icon: ListChecks,
        title: "Input Venue Details",
        description:
            "Enter venue information including address, property type, square footage, and system requirements. Our smart form guides you through every step.",
        color: "from-blue-500 to-cyan-500",
        bgGlow: "bg-blue-500/20",
        iconBg: "bg-blue-500",
        dotColor: "bg-blue-500",
    },
    {
        number: "02",
        icon: FileSignature,
        title: "Submit for Approval",
        description:
            "Once complete, submit your ROM for review. Admins receive instant notifications via email and Microsoft Teams for quick turnaround.",
        color: "from-purple-500 to-violet-500",
        bgGlow: "bg-purple-500/20",
        iconBg: "bg-purple-500",
        dotColor: "bg-purple-500",
    },
    {
        number: "03",
        icon: Cog,
        title: "Automated Processing",
        description:
            "Our system automatically calculates pricing, generates coverage plots, and creates professional documentation using advanced algorithms.",
        color: "from-orange-500 to-amber-500",
        bgGlow: "bg-orange-500/20",
        iconBg: "bg-orange-500",
        dotColor: "bg-orange-500",
    },
    {
        number: "04",
        icon: CheckCircle2,
        title: "Download & Share",
        description:
            "Receive your finalized ROM with pricing sheets, PowerPoint presentations, and PDF documents — ready to share with clients.",
        color: "from-green-500 to-emerald-500",
        bgGlow: "bg-green-500/20",
        iconBg: "bg-green-500",
        dotColor: "bg-green-500",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.2,
        },
    },
};

const stepVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

export default function HowItWorksSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id="how-it-works"
            ref={ref}
            className="relative py-24 lg:py-32 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Animated Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />

                {/* Gradient Orbs with enhanced animation */}
                <motion.div
                    className="absolute top-1/4 left-0 w-96 h-96 bg-[#E41F26]/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Floating particles */}
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0, 0.8, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.5 }}
                        className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide bg-white/10 text-white border border-white/20 mb-4"
                    >
                        Simple Process
                    </motion.span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                        How{" "}
                        <span className="bg-gradient-to-r from-[#E41F26] to-[#FF6B6B] bg-clip-text text-transparent">
                            SalesHub
                        </span>{" "}
                        Works
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed">
                        From venue input to final proposal — a streamlined workflow that saves hours of manual work.
                    </p>
                </motion.div>

                {/* Steps Container */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="relative"
                >
                    {/* Beautiful Vertical Timeline Line - Desktop */}
                    <div className="absolute left-1/2 top-0 bottom-0 hidden lg:flex flex-col items-center transform -translate-x-1/2 z-20">
                        {/* Top fade gradient */}
                        <div className="w-1 h-16 bg-gradient-to-b from-transparent to-gray-600" />

                        {/* Main animated line with glow */}
                        <div className="flex-1 relative">
                            {/* Glow effect behind line */}
                            <motion.div
                                className="absolute left-1/2 -translate-x-1/2 w-4 h-full bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-green-500/20 blur-md"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {/* Main line */}
                            <div className="relative w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 via-orange-500 to-green-500 rounded-full">
                                {/* Animated traveling light */}
                                <motion.div
                                    className="absolute left-1/2 -translate-x-1/2 w-3 h-20 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"
                                    animate={{ y: ["0%", "100%"] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Bottom fade gradient */}
                        <div className="w-1 h-16 bg-gradient-to-t from-transparent to-gray-600" />
                    </div>

                    <div className="space-y-16 lg:space-y-24">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                variants={stepVariants}
                                className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
                                    }`}
                            >
                                {/* Content Card */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="flex-1 relative group w-full"
                                >
                                    {/* Animated glow effect */}
                                    <motion.div
                                        className={`absolute -inset-1 ${step.bgGlow} rounded-2xl blur-xl`}
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 0.6 }}
                                        transition={{ duration: 0.3 }}
                                    />

                                    <motion.div
                                        className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-gray-600/50 transition-all duration-500"
                                        whileHover={{ y: -5 }}
                                    >
                                        {/* Animated corner accent */}
                                        <motion.div
                                            className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${step.color} opacity-10 rounded-tr-2xl rounded-bl-full`}
                                            initial={{ scale: 0 }}
                                            whileHover={{ scale: 1.5, opacity: 0.2 }}
                                            transition={{ duration: 0.4 }}
                                        />

                                        {/* Step Number with pulse animation */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <motion.span
                                                className={`inline-block text-sm font-bold tracking-wide bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                                                animate={{ opacity: [0.7, 1, 0.7] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                Step {step.number}
                                            </motion.span>
                                            <motion.div
                                                className={`h-px flex-1 bg-gradient-to-r ${step.color}`}
                                                initial={{ scaleX: 0 }}
                                                whileInView={{ scaleX: 1 }}
                                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                                style={{ transformOrigin: "left" }}
                                            />
                                        </div>

                                        {/* Title with animated icon */}
                                        <h3 className="text-2xl font-bold tracking-tight text-white mb-4 flex items-center gap-3">
                                            <motion.span
                                                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}
                                                whileHover={{ rotate: 360, scale: 1.1 }}
                                                transition={{ duration: 0.6, type: "spring" }}
                                            >
                                                <step.icon className="w-6 h-6 text-white" />
                                            </motion.span>
                                            {step.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-gray-400 leading-relaxed font-normal">
                                            {step.description}
                                        </p>

                                        {/* Animated arrow indicator */}
                                        <motion.div
                                            className="mt-6 flex items-center gap-2 text-gray-500 group-hover:text-white transition-colors"
                                            initial={{ x: 0 }}
                                            whileHover={{ x: 5 }}
                                        >
                                            <span className="text-sm font-medium">Learn more</span>
                                            <motion.div
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>

                                {/* Center Circle with enhanced animations and connecting elements */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                                    transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 200 }}
                                    className="hidden lg:flex relative z-30"
                                >
                                    {/* Outer ring pulse */}
                                    <motion.div
                                        className={`absolute -inset-4 rounded-full border-2 border-dashed`}
                                        style={{ borderColor: `var(--step-${index}-color, rgba(255,255,255,0.2))` }}
                                        animate={{
                                            rotate: [0, 360],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                        }}
                                    />

                                    {/* Pulsing colored ring */}
                                    <motion.div
                                        className={`absolute -inset-2 rounded-full bg-gradient-to-br ${step.color}`}
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.6, 0, 0.6],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: index * 0.3,
                                        }}
                                    />

                                    {/* Main circle */}
                                    <motion.div
                                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl relative overflow-hidden border-4 border-gray-800`}
                                        whileHover={{ scale: 1.15 }}
                                    >
                                        {/* Inner glow */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                                        {/* Animated shine effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            animate={{ x: ["-100%", "100%"] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                        />

                                        {/* Number */}
                                        <span className="text-2xl font-extrabold text-white relative z-10 drop-shadow-lg">
                                            {index + 1}
                                        </span>
                                    </motion.div>

                                    {/* Connecting dots - to next step */}
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2">
                                            {[...Array(3)].map((_, dotIndex) => (
                                                <motion.div
                                                    key={dotIndex}
                                                    className={`w-2 h-2 ${step.dotColor} rounded-full mx-auto mb-3`}
                                                    initial={{ opacity: 0.3, scale: 0.8 }}
                                                    animate={{
                                                        opacity: [0.3, 1, 0.3],
                                                        scale: [0.8, 1.2, 0.8],
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        delay: dotIndex * 0.2 + index * 0.1,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Spacer for Alternating Layout */}
                                <div className="flex-1 hidden lg:block" />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom CTA with enhanced animation */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 1.5 }}
                    className="text-center mt-20"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition-colors"
                        whileHover={{ y: 5 }}
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ArrowDown className="w-5 h-5" />
                        </motion.div>
                        <span className="font-medium">Discover the benefits below</span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
