import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Activity,
    Clock,
    FileText,
    Mountain,
    Play,
    RectangleHorizontal,
    Rocket,
    Trophy,
    Users,
    Zap,
} from "lucide-react";
import Link from "next/link";

const games = [
    {
        id: "rock-paper-scissors",
        title: "Rock Paper Scissors",
        description:
            "The timeless classic game of strategy and chance. Battle against the computer in this best-of-5 showdown.",
        icon: Mountain,
        players: "1 Player",
        duration: "2-5 min",
        difficulty: "Easy",
        status: "available",
        href: "/rock-paper-scissors",
    },
    {
        id: "pong",
        title: "Pong",
        description:
            "Classic arcade game reimagined. Use your paddle to keep the ball in play and outscore the AI opponent.",
        icon: RectangleHorizontal,
        players: "1 Player",
        duration: "3-8 min",
        difficulty: "Medium",
        status: "available",
        href: "/pong",
    },
    {
        id: "tic-tac-toe",
        title: "Tic Tac Toe",
        description:
            "Classic 3x3 grid strategy game. Get three in a row to win against your opponent.",
        icon: Zap,
        players: "1-2 Players",
        duration: "1-3 min",
        difficulty: "Easy",
        status: "available",
        href: "/tic-tac-toe",
    },
    {
        id: "snake",
        title: "Snake",
        description:
            "Guide the snake to collect food and grow longer without hitting the walls or yourself.",
        icon: Activity,
        players: "1 Player",
        duration: "5-15 min",
        difficulty: "Medium",
        status: "available",
        href: "/snake",
    },
    {
        id: "space-invaders",
        title: "Space Invaders",
        description:
            "Defend Earth from waves of alien invaders in this classic arcade shooter.",
        icon: Rocket,
        players: "1 Player",
        duration: "10-20 min",
        difficulty: "Hard",
        status: "available",
        href: "/space-invaders",
    },
];

function GameCard({ game }) {
    const IconComponent = game.icon;
    const isAvailable = game.status === "available";

    return (
        <Card
            className={`group transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-card/50 backdrop-blur-sm ${
                isAvailable ? "hover:shadow-xl hover:shadow-primary/10" : ""
            }`}
        >
            <CardHeader className="space-y-4">
                <div className="flex justify-between items-start">
                    <div
                        className={`p-3 rounded-xl ${
                            isAvailable
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        }`}
                    >
                        <IconComponent className="h-6 w-6" />
                    </div>
                    <div
                        className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                            isAvailable
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                    >
                        {isAvailable ? "Available" : "Coming Soon"}
                    </div>
                </div>

                <div className="space-y-2">
                    <CardTitle className="text-xl font-semibold">
                        {game.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                        {game.description}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {game.players}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {game.duration}
                    </div>
                    <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {game.difficulty}
                    </div>
                </div>

                {isAvailable ? (
                    <Link href={game.href} className="block">
                        <Button className="w-full group-hover:bg-primary/90 transition-colors gap-2">
                            <Play className="h-4 w-4" />
                            Play Now
                        </Button>
                    </Link>
                ) : (
                    <Button disabled className="w-full" variant="secondary">
                        Coming Soon
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default function Home() {
    const availableGamesCount = games.filter(
        (game) => game.status === "available"
    ).length;
    const totalGamesCount = games.length;

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-16">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Minigames Collection
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Discover a world of fun with our collection of classic
                        and modern minigames. Perfect for quick breaks or
                        extended gaming sessions.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 text-center">
                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-primary">
                                {availableGamesCount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Available
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-muted-foreground">
                                {totalGamesCount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Games
                            </div>
                        </div>
                    </div>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
                    {games.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted/50 rounded-full text-sm text-muted-foreground backdrop-blur-sm">
                        <Trophy className="h-4 w-4" />
                        More exciting games coming soon!
                    </div>
                </div>
            </div>
        </main>
    );
}
