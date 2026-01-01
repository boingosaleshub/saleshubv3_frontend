"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const highlights = [
    "Automated DAS & ERCES Proposals",
    "Multi-language Support",
    "Real-time Approval Workflows",
];

export default function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/bg-index.jpg"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Dark Overlay for text readability */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content Container - Ensure it sits above the background */}
            <div className="relative z-10 w-full h-full">
                {/* Beautiful Animated Background Elements (Optional: keeping them subtle or hiding them if they clash) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Mobile Static Background - Lightweight - REMOVED to let image show */}

                    {/* Animated Gradient Mesh - Desktop Only - Tuned down opacity */}
                    <motion.div
                        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full hidden md:block opacity-50"
                        style={{
                            background: "radial-gradient(circle, rgba(228, 31, 38, 0.4) 0%, transparent 70%)",
                            filter: "blur(60px)",
                        }}
                        animate={{
                            x: [0, 80, 40, 0],
                            y: [0, 40, 80, 0],
                            scale: [1, 1.15, 1.1, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    <motion.div
                        className="absolute top-[10%] right-[-15%] w-[45%] h-[45%] rounded-full hidden md:block opacity-50"
                        style={{
                            background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
                            filter: "blur(60px)",
                        }}
                        animate={{
                            x: [0, -60, -30, 0],
                            y: [0, 60, 30, 0],
                            scale: [1, 1.2, 1.1, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* ... other background elements can remain if desired, but kept minimal for clarity ... */}
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mb-8"
                    >
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                        </motion.div>
                        <span className="text-sm font-semibold tracking-wide text-white">
                            Powered by
                        </span>
                        <Image
                            src="/SocialShare_400x225-removebg-preview.png"
                            alt="Boingo Wireless"
                            width={100}
                            height={56}
                            className="h-14 w-auto object-contain"
                        />
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-6 drop-shadow-lg"
                    >
                        <span className="block">Streamline Your</span>
                        <motion.span
                            className="relative inline-block mt-2"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <span className="bg-gradient-to-r from-[#FF4D4D] via-[#FF6B6B] to-[#FF8585] bg-clip-text text-transparent">
                                ROM Proposals
                            </span>
                            {/* Smooth Wave Underline */}
                            <motion.svg
                                className="absolute -bottom-3 left-0 w-full h-4"
                                viewBox="0 0 300 12"
                                fill="none"
                                preserveAspectRatio="none"
                            >
                                <motion.path
                                    d="M0 6 Q37.5 0, 75 6 T150 6 T225 6 T300 6"
                                    stroke="url(#waveGradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="none"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                                />
                                <defs>
                                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#FF4D4D" />
                                        <stop offset="50%" stopColor="#FF6B6B" />
                                        <stop offset="100%" stopColor="#FF8585" />
                                    </linearGradient>
                                </defs>
                            </motion.svg>
                        </motion.span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed tracking-normal font-normal drop-shadow-md"
                    >
                        Generate professional <strong className="text-white font-semibold">DAS</strong> and{" "}
                        <strong className="text-white font-semibold">ERCES</strong> proposals with automated
                        pricing, coverage analysis, and approval workflows.
                    </motion.p>

                    {/* Feature checkmarks */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10"
                    >
                        {highlights.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="flex items-center gap-2 text-sm font-medium text-white"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                                >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </motion.div>
                                <span>{item}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative px-8 py-4 rounded-full text-white font-semibold tracking-wide overflow-hidden shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 transition-shadow duration-300"
                            >
                                {/* Button gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#E41F26] to-[#B5121B] rounded-full" />
                                {/* Animated shine */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                />

                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started
                                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </motion.button>
                        </Link>

                        <a href="#features">
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 rounded-full font-semibold tracking-wide text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                            >
                                <span className="flex items-center gap-2">
                                    Learn More
                                    <motion.span
                                        animate={{ y: [0, 4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        ↓
                                    </motion.span>
                                </span>
                            </motion.button>
                        </a>
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="mt-20 mb-4 pt-12 border-t border-gray-200/50 dark:border-gray-700/50"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                            {[
                                { value: "10x", label: "Faster Proposals", color: "from-[#E41F26] to-[#FF6B6B]" },
                                { value: "99%", label: "Accuracy Rate", color: "from-blue-500 to-cyan-400" },
                                { value: "4", label: "Languages", color: "from-purple-500 to-violet-400" },
                                { value: "24/7", label: "Platform Access", color: "from-emerald-500 to-green-400" },
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    className="group cursor-default"
                                >
                                    <motion.p
                                        className={`text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                    >
                                        {stat.value}
                                    </motion.p>
                                    <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 mt-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                        {stat.label}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-6 h-10 rounded-full border-2 border-gray-300/60 dark:border-gray-600/60 p-1 backdrop-blur-sm"
                    >
                        <motion.div
                            animate={{ y: [0, 14, 0], opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mx-auto"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
