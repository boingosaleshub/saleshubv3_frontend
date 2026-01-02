"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Benefits", href: "#benefits" },
    { name: "Contact", href: "#contact" },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSmoothScroll = (e, href) => {
        e.preventDefault();
        const targetId = href.replace("#", "");
        const element = document.getElementById(targetId);
        if (element) {
            const navbarHeight = 80;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - navbarHeight,
                behavior: "smooth",
            });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/5"
                    : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <Link href="/" className="flex items-center gap-3">
                                <Image
                                    src="/SalesHub 2.0 Logo Text.png"
                                    alt="SalesHub Logo"
                                    width={300}
                                    height={300}
                                    className="h-16 w-auto"
                                    priority
                                />
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <a
                                        href={link.href}
                                        onClick={(e) => handleSmoothScroll(e, link.href)}
                                        className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 rounded-full group ${isScrolled
                                            ? "text-gray-700 dark:text-gray-300 hover:text-[#E41F26]"
                                            : "text-gray-700 dark:text-gray-300 hover:text-[#E41F26]"
                                            }`}
                                    >
                                        {link.name}
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#E41F26] to-[#FF6B6B] transition-all duration-300 group-hover:w-1/2 rounded-full" />
                                    </a>
                                </motion.div>
                            ))}
                        </div>



                        {/* CTA Button */}
                        <div className="hidden md:flex items-center gap-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <Link href="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative overflow-hidden px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-[#E41F26] to-[#B5121B] shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 group"
                                    >
                                        <span className="relative z-10">Login</span>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-[#B5121B] to-[#E41F26]"
                                            initial={{ x: "100%" }}
                                            whileHover={{ x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50"
                        >
                            <div className="px-4 py-6 space-y-4">
                                <div className="flex items-center justify-between px-4 py-2">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Appearance</span>
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    >
                                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                    </button>
                                </div>
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <a
                                            href={link.href}
                                            onClick={(e) => handleSmoothScroll(e, link.href)}
                                            className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-[#E41F26] font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                        >
                                            {link.name}
                                        </a>
                                    </motion.div>
                                ))}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="pt-4 border-t border-gray-200 dark:border-gray-700"
                                >
                                    <Link href="/login" className="block">
                                        <button className="w-full py-3 px-6 rounded-full text-white font-semibold bg-gradient-to-r from-[#E41F26] to-[#B5121B] shadow-lg shadow-red-500/25">
                                            Login
                                        </button>
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Spacer for fixed navbar */}
            <div className="h-20" />
        </>
    );
}
