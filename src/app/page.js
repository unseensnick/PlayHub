"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Activity,
    Clock,
    Gamepad2,
    Mountain,
    Play,
    RectangleHorizontal,
    Rocket,
    Trophy,
    Users,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const games = [
    {
        id: "space-invaders",
        title: "Space Invaders",
        description:
            "Defend Earth from waves of alien invaders in this legendary arcade shooter. Features power-ups and progressive difficulty.",
        icon: Rocket,
        gradient: "from-[#667eea] to-[#764ba2]",
        players: "1 Player",
        duration: "10-20 min",
        difficulty: "Hard",
        status: "available",
        href: "/space-invaders",
        featured: true,
        category: "arcade",
    },
    {
        id: "rock-paper-scissors",
        title: "Rock Paper Scissors",
        description:
            "The timeless game of strategy and chance. Best-of-5 rounds against AI.",
        icon: Mountain,
        gradient: "from-[#f093fb] to-[#f5576c]",
        players: "1 Player",
        duration: "2-5 min",
        difficulty: "Easy",
        status: "available",
        href: "/rock-paper-scissors",
        category: "classic",
    },
    {
        id: "pong",
        title: "Pong",
        description:
            "Classic arcade tennis reimagined. Master your paddle skills to win.",
        icon: RectangleHorizontal,
        gradient: "from-[#4facfe] to-[#00f2fe]",
        players: "1 Player",
        duration: "3-8 min",
        difficulty: "Medium",
        status: "available",
        href: "/pong",
        category: "arcade",
    },
    {
        id: "tic-tac-toe",
        title: "Tic Tac Toe",
        description:
            "Strategic 3x3 grid game. Play against AI or challenge a friend locally.",
        icon: Zap,
        gradient: "from-[#fa709a] to-[#fee140]",
        players: "1-2 Players",
        duration: "1-3 min",
        difficulty: "Easy",
        status: "available",
        href: "/tic-tac-toe",
        category: "strategy",
    },
    {
        id: "snake",
        title: "Snake",
        description:
            "Guide the snake to grow longer without hitting walls or yourself.",
        icon: Activity,
        gradient: "from-[#a8edea] to-[#fed6e3]",
        players: "1 Player",
        duration: "5-15 min",
        difficulty: "Medium",
        status: "available",
        href: "/snake",
        category: "arcade",
    },
];

function AnimatedCounter({ target, suffix = "" }) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const counterRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    const increment = target / 50;
                    let current = 0;

                    const updateCount = () => {
                        current += increment;
                        if (current < target) {
                            setCount(Math.floor(current));
                            requestAnimationFrame(updateCount);
                        } else {
                            setCount(target);
                        }
                    };

                    updateCount();
                }
            },
            { threshold: 0.1 }
        );

        if (counterRef.current) {
            observer.observe(counterRef.current);
        }

        return () => {
            if (counterRef.current) {
                observer.unobserve(counterRef.current);
            }
        };
    }, [target, hasAnimated]);

    return (
        <span ref={counterRef} className="stat-number">
            {count}
            {suffix}
        </span>
    );
}

function GameCard({ game }) {
    const IconComponent = game.icon;
    const isAvailable = game.status === "available";

    return (
        <Card
            className={`
                game-card group relative overflow-hidden h-full flex flex-col
                ${game.featured ? "lg:col-span-2" : ""}
                border-0 bg-card/70 backdrop-blur-md
                transition-all duration-700 ease-out
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10
                before:absolute before:inset-0 before:bg-gradient-to-br
                before:from-primary/5 before:to-transparent before:opacity-0
                before:transition-opacity before:duration-700 hover:before:opacity-100
            `}
            data-category={game.category}
        >
            {/* Top gradient bar with center expansion animation */}
            <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
                <div
                    className={`
                    h-full bg-gradient-to-r ${game.gradient}
                    transform scale-x-0 group-hover:scale-x-100
                    transition-transform duration-700 ease-out origin-center
                `}
                />
            </div>

            <div className="p-6 flex flex-col flex-1">
                {/* Icon */}
                <div
                    className={`
                    w-12 h-12 rounded-xl bg-gradient-to-br ${game.gradient}
                    flex items-center justify-center text-white mb-4
                    transform transition-all duration-700 ease-out
                    group-hover:scale-110 group-hover:rotate-3
                `}
                >
                    <IconComponent className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2 text-foreground">
                    {game.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed flex-1 text-sm">
                    {game.description}
                </p>

                {/* Meta tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground text-xs font-medium flex items-center gap-1 transition-all duration-300 group-hover:bg-secondary/70">
                        <Users className="w-3 h-3" />
                        {game.players}
                    </div>
                    <div className="px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground text-xs font-medium flex items-center gap-1 transition-all duration-300 group-hover:bg-secondary/70">
                        <Clock className="w-3 h-3" />
                        {game.duration}
                    </div>
                    <div className="px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground text-xs font-medium flex items-center gap-1 transition-all duration-300 group-hover:bg-secondary/70">
                        <Trophy className="w-3 h-3" />
                        {game.difficulty}
                    </div>
                </div>

                {/* Play button */}
                {isAvailable ? (
                    <Link href={game.href} className="block mt-auto">
                        <Button
                            className={`
                            w-full h-10 text-sm font-semibold
                            bg-gradient-to-r ${game.gradient}
                            hover:opacity-90 transition-all duration-500 ease-out
                            group-hover:scale-[1.02]
                        `}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Play Now
                        </Button>
                    </Link>
                ) : (
                    <Button
                        disabled
                        className="w-full h-10 mt-auto"
                        variant="secondary"
                    >
                        Coming Soon
                    </Button>
                )}
            </div>
        </Card>
    );
}

export default function Home() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [filteredGames, setFilteredGames] = useState(games);
    const availableGamesCount = games.filter(
        (g) => g.status === "available"
    ).length;

    useEffect(() => {
        if (activeFilter === "all") {
            setFilteredGames(games);
        } else {
            setFilteredGames(
                games.filter((game) => game.category === activeFilter)
            );
        }
    }, [activeFilter]);

    // Parallax effect for gradient orbs
    useEffect(() => {
        const handleMouseMove = (e) => {
            const orbs = document.querySelectorAll(".gradient-orb");
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 20;
                const xOffset = (x - 0.5) * speed;
                const yOffset = (y - 0.5) * speed;

                orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="gradient-orb absolute w-[600px] h-[600px] -top-48 -left-48 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-float" />
                <div className="gradient-orb absolute w-[500px] h-[500px] -bottom-32 -right-32 rounded-full bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 blur-3xl animate-float-delayed" />
                <div className="gradient-orb absolute w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 blur-3xl animate-float-slow" />
            </div>

            {/* Floating shapes */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-8 h-8 rounded-full bg-primary/10 animate-float-shape" />
                <div className="absolute top-[60%] right-[15%] w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-float-shape-delayed" />
                <div className="absolute bottom-[30%] left-[20%] w-6 h-6 rounded bg-gradient-to-br from-blue-500/10 to-cyan-500/10 animate-float-shape-slow" />
            </div>

            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <section className="text-center mb-12 animate-fade-in-scale">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                        <span className="bg-gradient-to-br from-foreground via-primary to-primary bg-clip-text text-transparent">
                            Play Without Limits
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Experience classic games reimagined with modern design.
                        Quick breaks or extended sessions - the choice is yours.
                    </p>
                </section>

                {/* Stats Bar */}
                <div className="flex justify-center gap-12 mb-12 flex-wrap">
                    <div className="text-center group cursor-default animate-slide-in-left animate-delay-200">
                        <div className="text-3xl font-black text-primary mb-2 transition-transform duration-300 group-hover:scale-110">
                            <AnimatedCounter target={availableGamesCount} />
                        </div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Games Available
                        </div>
                    </div>
                    <div className="text-center group cursor-default animate-slide-in-right animate-delay-300">
                        <div className="text-3xl font-black text-primary mb-2 transition-transform duration-300 group-hover:scale-110">
                            <AnimatedCounter target={15} />
                        </div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Minutes Average
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                    {["all", "classic", "arcade", "strategy"].map((filter, index) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`
                                px-4 py-2 rounded-lg font-medium capitalize text-sm
                                transition-all duration-300 transform
                                animate-gentle-bounce
                                ${
                                    activeFilter === filter
                                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                        : "bg-secondary/50 text-secondary-foreground hover:bg-secondary hover:-translate-y-0.5"
                                }
                            `}
                            style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                        >
                            {filter === "all" ? "All Games" : filter}
                        </button>
                    ))}
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto auto-rows-fr">
                    {filteredGames.map((game, index) => (
                        <div
                            key={game.id}
                            className={`animate-fade-in-up ${
                                game.featured ? "lg:col-span-2" : ""
                            }`}
                            style={{ animationDelay: `${0.8 + index * 0.15}s` }}
                        >
                            <GameCard game={game} />
                        </div>
                    ))}
                </div>

                {/* Footer Message */}
                <div className="text-center mt-12 animate-fade-in-up animate-delay-800">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/30 backdrop-blur-sm rounded-xl">
                        <Gamepad2 className="w-5 h-5 text-primary" />
                        <span className="text-muted-foreground font-medium text-sm">
                            More exciting games coming soon!
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
}
