"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Only render after hydration to prevent SSR mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder button during SSR/hydration
        return (
            <Button variant="outline" size="icon" disabled>
                <Sun className="size-[1.2rem]" />
                <span className="sr-only">Loading theme toggle</span>
            </Button>
        );
    }

    const toggleTheme = () => {
        if (theme === "system") {
            // If system theme, switch to the opposite of current resolved theme
            setTheme(resolvedTheme === "dark" ? "light" : "dark");
        } else {
            // If explicit theme set, toggle between light and dark
            setTheme(theme === "dark" ? "light" : "dark");
        }
    };

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden rounded-full"
        >
            <Sun
                className={`size-[1.2rem] transition-all duration-300 ${
                    isDark
                        ? "rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100"
                }`}
            />
            <Moon
                className={`absolute size-[1.2rem] transition-all duration-300 ${
                    isDark
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0"
                }`}
            />
            <span className="sr-only">
                {isDark ? "Switch to light mode" : "Switch to dark mode"}
            </span>
        </Button>
    );
}
