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

    // Unified Red/White Theme
    const steps = [
        {
            number: "01",
            icon: ListChecks,
            title: "Input Venue Details",
            description:
                "Enter venue information including address, property type, square footage, and system requirements. Our smart form guides you through every step.",
            color: "from-[#E2211C] to-[#E2211C]",
            bgGlow: "bg-[#E2211C]/20",
            iconBg: "bg-[#E2211C]",
            dotColor: "bg-[#E2211C]",
        },
        {
            number: "02",
            icon: FileSignature,
            title: "Submit for Approval",
            description:
                "Once complete, submit your ROM for review. Admins receive instant notifications via email and Microsoft Teams for quick turnaround.",
            color: "from-[#E2211C] to-[#E2211C]",
            bgGlow: "bg-[#E2211C]/20",
            iconBg: "bg-[#E2211C]",
            dotColor: "bg-[#E2211C]",
        },
        {
            number: "03",
            icon: Cog,
            title: "Automated Processing",
            description:
                "Our system automatically calculates pricing, generates coverage plots, and creates professional documentation using advanced algorithms.",
            color: "from-[#E2211C] to-[#E2211C]",
            bgGlow: "bg-[#E2211C]/20",
            iconBg: "bg-[#E2211C]",
            dotColor: "bg-[#E2211C]",
        },
        {
            number: "04",
            icon: CheckCircle2,
            title: "Download & Share",
            description:
                "Receive your finalized ROM with pricing sheets, PowerPoint presentations, and PDF documents — ready to share with clients.",
            color: "from-[#E2211C] to-[#E2211C]",
            bgGlow: "bg-[#E2211C]/20",
            iconBg: "bg-[#E2211C]",
            dotColor: "bg-[#E2211C]",
        },
    ];

    return (
        <section
            id="how-it-works"
            ref={ref}
            className="relative py-24 lg:py-32 bg-[#3D434A] overflow-hidden"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Animated Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />

                {/* Gradient Orbs - Only Red/White */}
                <motion.div
                    className="absolute top-1/4 left-0 w-96 h-96 bg-[#E2211C]/10 rounded-full blur-3xl hidden md:block"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl hidden md:block"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Floating particles - White */}
                <div className="hidden md:block">
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
                        <span className="text-[#E2211C]">
                            SalesHub
                        </span>{" "}
                        Works
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-white/80 leading-relaxed">
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
                    {/* Vertical Timeline Line - Desktop */}
                    <div className="absolute left-1/2 top-0 bottom-0 hidden lg:flex flex-col items-center transform -translate-x-1/2 z-20">
                        {/* Top fade gradient */}
                        <div className="w-1 h-16 bg-gradient-to-b from-transparent to-white/20" />

                        {/* Main animated line */}
                        <div className="flex-1 relative">
                            {/* Glow effect */}
                            <motion.div
                                className="absolute left-1/2 -translate-x-1/2 w-4 h-full bg-[#E2211C]/20 blur-md"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {/* Main line - White to Red gradient */}
                            <div className="relative w-1 h-full bg-gradient-to-b from-white/20 via-[#E2211C] to-white/20 rounded-full">
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
                        <div className="w-1 h-16 bg-gradient-to-t from-transparent to-white/20" />
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
                                        className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 hover:border-[#E2211C]/30 transition-all duration-500"
                                        whileHover={{ y: -5 }}
                                    >
                                        {/* Animated corner accent */}
                                        <motion.div
                                            className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${step.color} opacity-10 rounded-tr-2xl rounded-bl-full`}
                                            initial={{ scale: 0 }}
                                            whileHover={{ scale: 1.5, opacity: 0.2 }}
                                            transition={{ duration: 0.4 }}
                                        />

                                        {/* Step Number */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <motion.span
                                                className="inline-block text-sm font-bold tracking-wide text-[#E2211C]"
                                                animate={{ opacity: [0.7, 1, 0.7] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                Step {step.number}
                                            </motion.span>
                                            <motion.div
                                                className="h-px flex-1 bg-[#E2211C]"
                                                initial={{ scaleX: 0 }}
                                                whileInView={{ scaleX: 1 }}
                                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                                style={{ transformOrigin: "left" }}
                                            />
                                        </div>

                                        {/* Title with animated icon */}
                                        <h3 className="text-2xl font-bold tracking-tight text-white mb-4 flex items-center gap-3">
                                            <motion.span
                                                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E2211C] shadow-lg"
                                                whileHover={{ rotate: 360, scale: 1.1 }}
                                                transition={{ duration: 0.6, type: "spring" }}
                                            >
                                                <step.icon className="w-6 h-6 text-white" />
                                            </motion.span>
                                            {step.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-white/80 leading-relaxed font-normal">
                                            {step.description}
                                        </p>
                                    </motion.div>
                                </motion.div>

                                {/* Center Circle */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                                    transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 200 }}
                                    className="hidden lg:flex relative z-30"
                                >
                                    {/* Outer ring pulse */}
                                    <motion.div
                                        className="absolute -inset-4 rounded-full border-2 border-dashed border-white/20"
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
                                        className={`absolute -inset-2 rounded-full bg-[#E2211C]`}
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
                                        className="w-20 h-20 rounded-full bg-[#E2211C] flex items-center justify-center shadow-2xl relative overflow-hidden border-4 border-[#3D434A]"
                                        whileHover={{ scale: 1.15 }}
                                    >
                                        {/* Inner glow */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

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

                                    {/* Connecting dots */}
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2">
                                            {[...Array(3)].map((_, dotIndex) => (
                                                <motion.div
                                                    key={dotIndex}
                                                    className={`w-2 h-2 bg-[#E2211C] rounded-full mx-auto mb-3`}
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

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 1.5 }}
                    className="text-center mt-20"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 text-white/60 cursor-pointer hover:text-white transition-colors"
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
