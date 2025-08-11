import { SpaceInvaders } from "@/components/space-invaders";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Space Invaders - Minigames Collection",
    description: "Defend Earth from alien invaders in this classic arcade game",
};

export default function SpaceInvadersPage() {
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
                <SpaceInvaders />
            </div>
        </main>
    );
}