"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, MapPin, Linkedin, Twitter } from "lucide-react";

const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
];

export default function Footer() {
    return (
        <footer id="contact" className="relative bg-gray-900 pt-24 pb-12 overflow-hidden">
            {/* Background Gradient & Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-[#0a0a0a] to-black" />

            {/* Subtle animated background mesh */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[100px] -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2" />
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                {/* Brand Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center mb-12"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative mb-8"
                    >
                        <div className="absolute -inset-4 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Image
                            src="/SocialShare_400x225-removebg-preview.png"
                            alt="Boingo Wireless"
                            width={280}
                            height={158}
                            className="relative h-auto w-64 brightness-0 invert drop-shadow-lg"
                        />
                    </motion.div>
                </motion.div>

                {/* Contact Information Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="grid md:grid-cols-2 gap-4 mb-16 max-w-2xl mx-auto"
                >
                    {/* Email Card */}
                    <a
                        href="mailto:saleshub@boingo.com"
                        className="group flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    >
                        <div className="p-3 rounded-full bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors mb-3">
                            <Mail className="w-6 h-6" />
                        </div>
                        <span className="text-gray-300 group-hover:text-white font-medium">saleshub@boingo.com</span>
                        <span className="text-xs text-gray-500 mt-1">Get in touch for support</span>
                    </a>

                    {/* Address Card */}
                    <div className="group flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors mb-3">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <span className="text-gray-300 group-hover:text-white font-medium text-center">7 Cowboys Way, Frisco<br />TX 75034, USA</span>
                    </div>
                </motion.div>

                {/* Social Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center gap-6 mb-12"
                >
                    {socialLinks.map((social) => (
                        <motion.a
                            key={social.label}
                            href={social.href}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 rounded-full bg-gray-800/50 border border-gray-700 hover:border-gray-500 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-300 shadow-lg"
                            aria-label={social.label}
                        >
                            <social.icon className="w-5 h-5" />
                        </motion.a>
                    ))}
                </motion.div>

                {/* Copyright */}
                <div className="pt-8 border-t border-gray-800/50">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} SalesHub by Boingo Wireless. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
