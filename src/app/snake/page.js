import { Snake } from "@/components/snake";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Snake - PlayHub",
    description:
        "Play the classic Snake game and grow your snake by eating food",
};

export default function SnakePage() {
    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute w-[500px] h-[500px] -top-48 -right-48 rounded-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl animate-float" />
                <div className="absolute w-[400px] h-[400px] -bottom-32 -left-32 rounded-full bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 blur-3xl animate-float-delayed" />
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Back Navigation */}
                <div className="mb-8 flex gap-3">
                    <Link href="/">
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl border-border/50 bg-secondary/30 backdrop-blur-sm hover:bg-secondary/50 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                {/* Game Component */}
                <div className="animate-fade-in-up">
                    <Snake />
                </div>
            </div>
        </main>
    );
}
