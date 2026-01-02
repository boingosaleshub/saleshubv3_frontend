"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "light",
    toggleTheme: () => { },
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check localStorage for saved preference
        const savedTheme = localStorage.getItem("theme");

        // If saved theme exists, use it. Otherwise default to 'light' (Bright mode).
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            setTheme("light");
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    // Avoid hydration mismatch by rendering children only after mount, 
    // or simple return children but risking flash of wrong theme if not careful.
    // For critical CSS, usually it's better to render immediately, but here we can wait specificially for the class to apply.
    // However, for best UX, we render children always, but the effect updates the class.

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
