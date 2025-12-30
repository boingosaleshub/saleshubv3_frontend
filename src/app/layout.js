import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
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
  icons: {
    icon: "/logo boingo B_Round_PS FILE.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
