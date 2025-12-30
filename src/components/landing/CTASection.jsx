"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="relative py-24 overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E41F26] via-[#B5121B] to-[#8B0D13]" />

            {/* Animated Background Patterns */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
                    animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                    animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Floating Sparkles */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 20}%`,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5,
                    }}
                >
                    <Sparkles className="w-6 h-6 text-white/30" />
                </motion.div>
            ))}

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <motion.h2
                        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Ready to Transform Your
                        <br />
                        <span className="text-white/90">ROM Workflow?</span>
                    </motion.h2>

                    <motion.p
                        className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed font-normal"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Join teams already saving hours every week with automated proposal generation. Get started today.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                                className="group px-8 py-4 rounded-full text-[#E41F26] font-semibold tracking-wide bg-white shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                                <span className="flex items-center gap-2">
                                    Start Now — It&apos;s Free
                                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </motion.button>
                        </Link>

                        <a href="#contact">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 rounded-full font-semibold tracking-wide text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300"
                            >
                                Contact Sales
                            </motion.button>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
