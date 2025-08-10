"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Mountain, FileText, Scissors } from "lucide-react";
import { useState } from "react";

const CHOICES = ["rock", "paper", "scissors"];

const CHOICE_ICONS = {
    rock: Mountain,
    paper: FileText,
    scissors: Scissors,
};

function getRandomChoice() {
    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    return CHOICES[randomIndex];
}

function getComputerChoice() {
    return getRandomChoice();
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function playRound(playerSelection, computerSelection) {
    if (playerSelection === computerSelection) {
        return { result: "tie", message: "It's a tie!" };
    }

    const winConditions = {
        rock: "scissors",
        paper: "rock",
        scissors: "paper",
    };

    if (winConditions[playerSelection] === computerSelection) {
        return {
            result: "win",
            message: `You win! ${capitalize(
                playerSelection
            )} beats ${capitalize(computerSelection)}`,
        };
    } else {
        return {
            result: "lose",
            message: `You lose! ${capitalize(
                computerSelection
            )} beats ${capitalize(playerSelection)}`,
        };
    }
}

export function RockPaperScissors() {
    const [playerScore, setPlayerScore] = useState(0);
    const [computerScore, setComputerScore] = useState(0);
    const [gameHistory, setGameHistory] = useState([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [gameComplete, setGameComplete] = useState(false);

    const handlePlayerChoice = (playerChoice) => {
        if (gameComplete) return;

        const computerChoice = getComputerChoice();
        const roundResult = playRound(playerChoice, computerChoice);

        const newRound = {
            round: currentRound,
            playerChoice,
            computerChoice,
            result: roundResult.result,
            message: roundResult.message,
        };

        setGameHistory((prev) => [...prev, newRound]);

        if (roundResult.result === "win") {
            setPlayerScore((prev) => prev + 1);
        } else if (roundResult.result === "lose") {
            setComputerScore((prev) => prev + 1);
        }

        if (currentRound >= 5) {
            setGameComplete(true);
        } else {
            setCurrentRound((prev) => prev + 1);
        }
    };

    const resetGame = () => {
        setPlayerScore(0);
        setComputerScore(0);
        setGameHistory([]);
        setCurrentRound(1);
        setGameComplete(false);
    };

    const getFinalMessage = () => {
        if (playerScore > computerScore) {
            return "Congratulations! You won the game!";
        } else if (computerScore > playerScore) {
            return "Computer wins this time. Better luck next time!";
        } else {
            return "It's a tie game! Great match!";
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Game Card */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Rock Paper Scissors
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {gameComplete
                            ? "Game Complete!"
                            : `Round ${currentRound} of 5`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Score Display */}
                    <div className="flex justify-center items-center gap-8">
                        <div className="text-center space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                You
                            </div>
                            <div className="text-4xl font-bold text-primary">
                                {playerScore}
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                vs
                            </div>
                            <div className="text-2xl font-light text-muted-foreground">
                                -
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                Computer
                            </div>
                            <div className="text-4xl font-bold text-destructive">
                                {computerScore}
                            </div>
                        </div>
                    </div>

                    {/* Game Controls */}
                    {!gameComplete && (
                        <div className="text-center space-y-6">
                            <p className="text-lg text-muted-foreground">Choose your weapon:</p>
                            <div className="flex justify-center gap-4">
                                {CHOICES.map((choice) => (
                                    <Button
                                        key={choice}
                                        onClick={() => handlePlayerChoice(choice)}
                                        variant="outline"
                                        size="lg"
                                        className="group flex flex-col items-center gap-3 h-auto py-6 px-8 hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 hover:border-primary/50"
                                    >
                                        <div className="group-hover:scale-110 transition-transform">
                                            {(() => {
                                                const IconComponent = CHOICE_ICONS[choice];
                                                return <IconComponent className="h-12 w-12 stroke-2" />;
                                            })()}
                                        </div>
                                        <span className="text-sm font-medium uppercase tracking-wide">
                                            {choice}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Final Result */}
                    {gameComplete && (
                        <div className="text-center space-y-6 p-6 rounded-lg bg-muted/30">
                            <p className="text-2xl font-semibold">
                                {getFinalMessage()}
                            </p>
                            <Button onClick={resetGame} size="lg" className="px-8">
                                Play Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Game History */}
            {gameHistory.length > 0 && (
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Recent Rounds</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {gameHistory.slice(-3).reverse().map((round) => (
                                <div
                                    key={round.round}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                        round.result === "win"
                                            ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800/50"
                                            : round.result === "lose"
                                            ? "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800/50"
                                            : "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-sm uppercase tracking-wide">
                                            Round {round.round}
                                        </span>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const IconComponent = CHOICE_ICONS[round.playerChoice];
                                                    return <IconComponent className="h-6 w-6 stroke-2" />;
                                                })()}
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    You
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium">VS</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    AI
                                                </span>
                                                {(() => {
                                                    const IconComponent = CHOICE_ICONS[round.computerChoice];
                                                    return <IconComponent className="h-6 w-6 stroke-2" />;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {round.message}
                                    </p>
                                </div>
                            ))}
                            {gameHistory.length > 3 && (
                                <div className="text-center pt-2">
                                    <span className="text-xs text-muted-foreground">
                                        Showing last 3 rounds of {gameHistory.length}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}