import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "PlayHub - Play Classic Games",
    description: "A collection of fun and engaging minigames",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {/* Navigation Bar */}
                    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
                        <div className="w-full px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16">
                                {/* Logo */}
                                <div className="flex-shrink-0">
                                    <Link href="/" className="group">
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
                                            PlayHub
                                        </h1>
                                    </Link>
                                </div>

                                {/* Theme Toggle */}
                                <div className="flex-shrink-0">
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Main Content */}
                    <div className="pt-16">{children}</div>
                </ThemeProvider>
            </body>
        </html>
    );
}
