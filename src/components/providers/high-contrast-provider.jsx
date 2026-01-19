"use client";

import { createContext, useContext, useEffect, useState } from "react";

const HighContrastContext = createContext({
    highContrast: false,
    toggleHighContrast: () => { },
});

export function HighContrastProvider({ children }) {
    const [highContrast, setHighContrast] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check localStorage for saved preference
        const savedPreference = localStorage.getItem("high-contrast");
        if (savedPreference === "true") {
            setHighContrast(true);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        if (highContrast) {
            root.classList.add("high-contrast");
        } else {
            root.classList.remove("high-contrast");
        }
        localStorage.setItem("high-contrast", highContrast.toString());
    }, [highContrast, mounted]);

    const toggleHighContrast = () => {
        setHighContrast((prev) => !prev);
    };

    return (
        <HighContrastContext.Provider value={{ highContrast, toggleHighContrast }}>
            {children}
        </HighContrastContext.Provider>
    );
}

export const useHighContrast = () => useContext(HighContrastContext);
