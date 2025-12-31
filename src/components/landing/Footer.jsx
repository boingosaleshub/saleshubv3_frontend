"use client";

import Image from "next/image";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex-shrink-0">
                        <Image
                            src="/SocialShare_400x225-removebg-preview.png"
                            alt="Boingo Wireless"
                            width={270}
                            height={170}
                            className="h-20 w-auto brightness-0 invert opacity-90"
                        />
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-md sm:text-base text-gray-400">
                        <a href="mailto:saleshub@boingo.com" className="flex items-center gap-2 hover:text-white transition-colors">
                            <Mail className="w-5 h-5" />
                            <span>saleshub@boingo.com</span>
                        </a>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            <span>7 Cowboys Way, Frisco, TX 75034, USA</span>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-4 border-t border-gray-800 text-center">
                    <p className="text-gray-500 text-md">
                        © 2025 SalesHub by Boingo Wireless. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

