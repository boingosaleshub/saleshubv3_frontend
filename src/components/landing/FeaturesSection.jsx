"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    FileText,
    MapPin,
    BarChart3,
    Users,
    Bell,
    Languages,
    Shield,
    Zap,
} from "lucide-react";

const features = [
    {
        icon: FileText,
        title: "Automated ROM Generation",
        description:
            "Generate professional ROM proposals with automated pricing models, eliminating manual calculations and human error.",
    },
    {
        icon: MapPin,
        title: "Interactive Coverage Maps",
        description:
            "Visualize venue coverage with interactive maps, address autocomplete, and real-time geolocation integration.",
    },
    {
        icon: Bell,
        title: "Smart Notifications",
        description:
            "Stay informed with real-time alerts via Email and Microsoft Teams for approvals, status changes, and important updates.",
    },
    {
        icon: Languages,
        title: "Multilingual Support",
        description:
            "Reach global teams with support for English, Spanish, Portuguese, and French across the entire platform.",
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        description:
            "Designed with secure authentication, fine-grained access control, and session-based security to ensure maximum data protection",
    },
    {
        icon: Zap,
        title: "Lightning Fast Performance",
        description:
            "Built on Next.js with React Compiler optimizations, ensuring blazing-fast page loads and smooth interactions.",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

export default function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id="features"
            ref={ref}
            className="relative py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden"
        >
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.5 }}
                        className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide bg-gradient-to-r from-[#E41F26]/10 to-[#B5121B]/10 text-[#E41F26] border border-[#E41F26]/20 mb-4"
                    >
                        Platform Features
                    </motion.span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                        Everything You Need in{" "}
                        <span className="bg-gradient-to-r from-[#E41F26] to-[#FF6B6B] bg-clip-text text-transparent">
                            One Place
                        </span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        Powerful features designed to streamline your ROM proposal generation workflow and boost team productivity.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            whileHover={{
                                y: -8,
                                scale: 1.02,
                                transition: { type: "spring", stiffness: 300 }
                            }}
                            className={`group relative p-6 rounded-2xl bg-white border border-gray-200/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/5`}
                        >
                            {/* Icon */}
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E2211C] shadow-lg mb-4`}
                            >
                                <feature.icon className="w-6 h-6 text-white" />
                            </motion.div>

                            {/* Content */}
                            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-2 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-[#3D434A] dark:text-gray-400 text-sm leading-relaxed font-normal">
                                {feature.description}
                            </p>

                            {/* Hover Gradient */}
                            <motion.div
                                className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl bg-[#E2211C] transition-opacity duration-300`}
                                style={{ opacity: 0, zIndex: -1 }}
                                whileHover={{ opacity: 0.05 }}
                            />

                            {/* Corner Decoration */}
                            <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-[#E2211C]`} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
