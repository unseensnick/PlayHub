import { Pong } from "@/components/pong";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Pong - Minigames Collection",
    description: "Play the classic Pong arcade game with modern design",
};

export default function PongPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto py-8">
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
                <Pong />
            </div>
        </main>
    );
}