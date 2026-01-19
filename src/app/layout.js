import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { AutomationProvider } from "@/components/providers/automation-provider";
import { HighContrastProvider } from "@/components/providers/high-contrast-provider";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";


// Modern, clean font for better readability
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "SalesHub | Automated ROM Proposal Generation Platform",
  description: "Streamline your DAS and ERCES ROM proposals with automated pricing, coverage analysis, and approval workflows. Built by Boingo Wireless.",
  keywords: ["ROM proposals", "DAS", "ERCES", "Boingo Wireless", "sales automation", "coverage analysis"],
  authors: [{ name: "Boingo Wireless" }],
  openGraph: {
    title: "SalesHub | Automated ROM Proposal Generation",
    description: "Generate professional ROM proposals with automated pricing and streamlined workflows.",
    type: "website",
  },
  manifest: "/site.webmanifest",
  themeColor: "#dc2626",
  icons: {
    icon: [
      { url: "/logo boingo B_Round_PS FILE.png" },
      { url: "/logo boingo B_Round_PS FILE.png", sizes: "32x32", type: "image/png" },
      { url: "/logo boingo B_Round_PS FILE.png", sizes: "16x16", type: "image/png" },
      { url: "/logo boingo B_Round_PS FILE.png", sizes: "192x192", type: "image/png" },
      { url: "/logo boingo B_Round_PS FILE.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo boingo B_Round_PS FILE.png" },
      { url: "/logo boingo B_Round_PS FILE.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo boingo B_Round_PS FILE.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/logo boingo B_Round_PS FILE.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo boingo B_Round_PS FILE.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo boingo B_Round_PS FILE.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <LanguageProvider>
            <HighContrastProvider>
              <AutomationProvider>
                {children}
              </AutomationProvider>
            </HighContrastProvider>
          </LanguageProvider>
        </AuthProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

