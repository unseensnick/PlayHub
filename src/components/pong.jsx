"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Pause, Play, RotateCcw, Trophy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 12;
const BALL_SIZE = 12;
const PADDLE_SPEED = 6;
const BALL_SPEED = 2;
const WINNING_SCORE = 7;

export function Pong() {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const keysRef = useRef({});

    const [gameState, setGameState] = useState("menu"); // menu, playing, paused, gameOver
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [gameHistory, setGameHistory] = useState([]);

    // Game objects
    const gameObjects = useRef({
        playerPaddle: { x: 30, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
        aiPaddle: {
            x: CANVAS_WIDTH - 30 - PADDLE_WIDTH,
            y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        },
        ball: {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
            dy: BALL_SPEED * (Math.random() - 0.5),
        },
    });

    // AI state for much easier opponent
    const aiState = useRef({
        targetY: CANVAS_HEIGHT / 2,
        reactionDelay: 0,
        maxReactionDelay: 25,
        lastBallDirection: 1,
        errorOffset: 0,
        updateCounter: 0,
        rallyCount: 0,
        lastBallSpeed: BALL_SPEED,
        confidenceLevel: 0.4,
        lastMissTime: 0,
        consecutiveHits: 0,
    });

    const resetBall = useCallback(() => {
        gameObjects.current.ball = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
            dy: 0,
        };
    }, []);

    const resetGame = useCallback(() => {
        setPlayerScore(0);
        setAiScore(0);
        setGameHistory([]);
        gameObjects.current.playerPaddle.y =
            CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        gameObjects.current.aiPaddle.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        // Reset AI state
        aiState.current = {
            targetY: CANVAS_HEIGHT / 2,
            reactionDelay: 0,
            maxReactionDelay: 25,
            lastBallDirection: 1,
            errorOffset: 0,
            updateCounter: 0,
            rallyCount: 0,
            lastBallSpeed: BALL_SPEED,
            confidenceLevel: 0.4,
            lastMissTime: 0,
            consecutiveHits: 0,
        };
        resetBall();
        setGameState("menu");
    }, [resetBall]);

    const updateGame = useCallback(() => {
        if (gameState !== "playing") return;

        const { playerPaddle, aiPaddle, ball } = gameObjects.current;

        // Player paddle movement (Arrow keys or WASD)
        if (
            (keysRef.current.ArrowUp || keysRef.current.KeyW) &&
            playerPaddle.y > 0
        ) {
            playerPaddle.y -= PADDLE_SPEED;
        }
        if (
            (keysRef.current.ArrowDown || keysRef.current.KeyS) &&
            playerPaddle.y < CANVAS_HEIGHT - PADDLE_HEIGHT
        ) {
            playerPaddle.y += PADDLE_SPEED;
        }

        // Sophisticated AI with adaptive difficulty and human-like characteristics
        const aiData = aiState.current;
        const aiCenter = aiPaddle.y + PADDLE_HEIGHT / 2;

        // Calculate current ball speed for difficulty scaling
        const currentBallSpeed = Math.sqrt(
            ball.dx * ball.dx + ball.dy * ball.dy
        );
        const speedMultiplier = Math.min(currentBallSpeed / BALL_SPEED, 2.0); // Cap at 2x

        // Update confidence - much less forgiving
        if (currentBallSpeed > aiData.lastBallSpeed * 1.1) {
            aiData.confidenceLevel = Math.max(
                0.1,
                aiData.confidenceLevel - 0.25
            );
        } else if (aiData.consecutiveHits > 5) {
            aiData.confidenceLevel = Math.min(
                0.6,
                aiData.confidenceLevel + 0.02
            ); // Cap at 0.6
        }
        aiData.lastBallSpeed = currentBallSpeed;

        // Balanced AI speed that can reach corners
        const fatigueMultiplier = Math.max(0.6, 1 - aiData.rallyCount * 0.015); // Less fatigue
        const baseAiSpeed = 1.9 * aiData.confidenceLevel * fatigueMultiplier; // Faster base speed

        // Balanced reaction delays
        const adaptiveMaxDelay = Math.floor(
            25 + (speedMultiplier - 1) * 15 + (1 - aiData.confidenceLevel) * 12
        );

        aiData.updateCounter++;
        if (
            aiData.updateCounter %
                Math.max(4, Math.floor(6 - speedMultiplier)) ===
            0
        ) {
            // More frequent updates
            const currentBallDirection = ball.dx > 0 ? 1 : -1;

            if (
                currentBallDirection !== aiData.lastBallDirection &&
                currentBallDirection > 0
            ) {
                // Ball coming toward AI - start new calculation
                aiData.reactionDelay = adaptiveMaxDelay;
                aiData.rallyCount++;

                // Balanced errors - not too large
                const baseError = 45 + (speedMultiplier - 1) * 25; // Moderate base error
                const confidenceAdjustedError =
                    baseError * (2.0 - aiData.confidenceLevel); // Less error scaling
                aiData.errorOffset =
                    (Math.random() - 0.5) * confidenceAdjustedError;
            }
            aiData.lastBallDirection = currentBallDirection;

            if (aiData.reactionDelay <= 0 && ball.dx > 0) {
                // Sophisticated prediction with physics consideration
                const timeToReachPaddle =
                    (aiPaddle.x - ball.x) / Math.abs(ball.dx);
                let predictedY = ball.y + ball.dy * timeToReachPaddle;

                // Account for potential wall bounces in prediction
                if (predictedY < 0 || predictedY > CANVAS_HEIGHT) {
                    const bounceY =
                        predictedY < 0
                            ? -predictedY
                            : 2 * CANVAS_HEIGHT - predictedY;
                    predictedY = bounceY;
                }

                // Moderate prediction errors
                const predictionAccuracy =
                    aiData.confidenceLevel * (0.7 / speedMultiplier); // Better accuracy
                const predictionError =
                    (Math.random() - 0.5) * 60 * (2.5 - predictionAccuracy); // Smaller errors

                aiData.targetY =
                    predictedY + predictionError + aiData.errorOffset;

                // Occasionally make larger errors
                if (Math.random() < 0.15) {
                    // 15% chance
                    aiData.targetY += (Math.random() - 0.5) * 90; // Moderate large errors
                }

                // Clamp to valid range
                aiData.targetY = Math.max(
                    PADDLE_HEIGHT / 2,
                    Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT / 2, aiData.targetY)
                );
            } else if (ball.dx < 0) {
                // Ball moving away - return to center with moderate variation
                const returnToCenter = CANVAS_HEIGHT / 2;
                const variation =
                    (Math.random() - 0.5) * (45 + aiData.rallyCount * 3); // Less wandering
                aiData.targetY = returnToCenter + variation;
                aiData.rallyCount = Math.max(0, aiData.rallyCount - 1);
            }
        }

        // Decrease reaction delay
        if (aiData.reactionDelay > 0) {
            aiData.reactionDelay--;
        }

        // Movement with adaptive precision for corner shots
        const targetDiff = aiData.targetY - aiCenter;
        const adaptiveDeadZone = 22 + (1 - aiData.confidenceLevel) * 12; // Smaller dead zone

        if (Math.abs(targetDiff) > adaptiveDeadZone) {
            const moveDirection = targetDiff > 0 ? 1 : -1;

            // Better responsiveness for extreme positions
            const distanceFromCenter = Math.abs(aiCenter - CANVAS_HEIGHT / 2);
            const cornerUrgency = distanceFromCenter > 120 ? 1.4 : 1.0; // More urgency near edges
            const urgencyMultiplier =
                Math.min(1.6, Math.abs(targetDiff) / 60) * cornerUrgency;

            const movementSpeed = baseAiSpeed * urgencyMultiplier;
            const speedVariation =
                (Math.random() - 0.5) * 0.8 * (2.5 - aiData.confidenceLevel); // Less variation

            const finalSpeed = Math.max(0.6, movementSpeed + speedVariation); // Faster minimum
            const newY = aiPaddle.y + moveDirection * finalSpeed;
            aiPaddle.y = Math.max(
                0,
                Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY)
            );
        }

        // Ball movement
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Ball collision with top/bottom walls
        if (
            ball.y <= BALL_SIZE / 2 ||
            ball.y >= CANVAS_HEIGHT - BALL_SIZE / 2
        ) {
            ball.dy = -ball.dy;
        }

        // Ball collision with player paddle
        if (
            ball.x - BALL_SIZE / 2 <= playerPaddle.x + PADDLE_WIDTH &&
            ball.x + BALL_SIZE / 2 >= playerPaddle.x &&
            ball.y >= playerPaddle.y &&
            ball.y <= playerPaddle.y + PADDLE_HEIGHT &&
            ball.dx < 0
        ) {
            ball.dx = -ball.dx;
            ball.dy = (ball.y - (playerPaddle.y + PADDLE_HEIGHT / 2)) / 20;
        }

        // Ball collision with AI paddle
        if (
            ball.x + BALL_SIZE / 2 >= aiPaddle.x &&
            ball.x - BALL_SIZE / 2 <= aiPaddle.x + PADDLE_WIDTH &&
            ball.y >= aiPaddle.y &&
            ball.y <= aiPaddle.y + PADDLE_HEIGHT &&
            ball.dx > 0
        ) {
            ball.dx = -ball.dx;
            ball.dy = (ball.y - (aiPaddle.y + PADDLE_HEIGHT / 2)) / 20;

            // Track AI success for performance feedback
            aiState.current.consecutiveHits++;
            aiState.current.lastMissTime = 0;
        }

        // Scoring
        if (ball.x < 0) {
            const newAiScore = aiScore + 1;
            setAiScore(newAiScore);
            setGameHistory((history) => [
                ...history,
                { type: "ai_score", score: `${playerScore}-${newAiScore}` },
            ]);
            // Reset AI performance tracking
            aiState.current.consecutiveHits = 0;
            aiState.current.rallyCount = 0;
            aiState.current.confidenceLevel = Math.min(
                0.6,
                aiState.current.confidenceLevel + 0.05
            ); // Cap at 0.6
            if (newAiScore >= WINNING_SCORE) {
                setGameState("gameOver");
            }
            resetBall();
        } else if (ball.x > CANVAS_WIDTH) {
            const newPlayerScore = playerScore + 1;
            setPlayerScore(newPlayerScore);
            setGameHistory((history) => [
                ...history,
                { type: "player_score", score: `${newPlayerScore}-${aiScore}` },
            ]);
            // AI missed - decrease confidence and reset tracking
            aiState.current.consecutiveHits = 0;
            aiState.current.rallyCount = 0;
            aiState.current.confidenceLevel = Math.max(
                0.1,
                aiState.current.confidenceLevel - 0.3
            ); // Bigger penalty
            aiState.current.lastMissTime = aiState.current.updateCounter;
            if (newPlayerScore >= WINNING_SCORE) {
                setGameState("gameOver");
            }
            resetBall();
        }
    }, [gameState, playerScore, aiScore, resetBall]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const isDark = document.documentElement.classList.contains("dark");

        // Clear canvas
        ctx.fillStyle = isDark ? "#0a0a0a" : "#ffffff";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw center line
        ctx.strokeStyle = isDark ? "#374151" : "#d1d5db";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        const { playerPaddle, aiPaddle, ball } = gameObjects.current;

        // Draw paddles
        ctx.fillStyle = isDark ? "#3b82f6" : "#2563eb";
        ctx.fillRect(
            playerPaddle.x,
            playerPaddle.y,
            PADDLE_WIDTH,
            PADDLE_HEIGHT
        );

        ctx.fillStyle = isDark ? "#ef4444" : "#dc2626";
        ctx.fillRect(aiPaddle.x, aiPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

        // Draw ball
        ctx.fillStyle = isDark ? "#ffffff" : "#000000";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw scores
        ctx.fillStyle = isDark ? "#ffffff" : "#000000";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(playerScore.toString(), CANVAS_WIDTH / 4, 60);
        ctx.fillText(aiScore.toString(), (CANVAS_WIDTH * 3) / 4, 60);
    }, [playerScore, aiScore]);

    const gameLoop = useCallback(() => {
        updateGame();
        draw();
        if (gameState === "playing") {
            animationRef.current = requestAnimationFrame(gameLoop);
        }
    }, [updateGame, draw, gameState]);

    useEffect(() => {
        if (gameState === "playing") {
            animationRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameState, gameLoop]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            keysRef.current[e.code] = true;
            if (e.code === "Space") {
                e.preventDefault();
                if (gameState === "playing") {
                    setGameState("paused");
                } else if (gameState === "paused") {
                    setGameState("playing");
                }
            }
        };

        const handleKeyUp = (e) => {
            keysRef.current[e.code] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [gameState]);

    useEffect(() => {
        draw(); // Initial draw
    }, [draw]);

    const startGame = () => {
        setGameState("playing");
    };

    const pauseGame = () => {
        setGameState("paused");
    };

    const resumeGame = () => {
        setGameState("playing");
    };

    const getGameStatus = () => {
        if (gameState === "gameOver") {
            return playerScore > aiScore ? "You Won!" : "AI Won!";
        }
        if (gameState === "paused") return "Game Paused";
        if (gameState === "playing") return `Playing to ${WINNING_SCORE}`;
        return "Ready to Play";
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Game Card */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Pong
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {getGameStatus()}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Score Display */}
                    <div className="flex justify-center items-center gap-8 mb-6">
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
                                AI
                            </div>
                            <div className="text-4xl font-bold text-destructive">
                                {aiScore}
                            </div>
                        </div>
                    </div>

                    {/* Game Canvas */}
                    <div className="flex justify-center">
                        <div className="border-2 border-border rounded-lg overflow-hidden bg-background shadow-inner">
                            <canvas
                                ref={canvasRef}
                                width={CANVAS_WIDTH}
                                height={CANVAS_HEIGHT}
                                className="block"
                            />
                        </div>
                    </div>

                    {/* Game Controls */}
                    <div className="flex justify-center gap-4">
                        {gameState === "menu" && (
                            <Button
                                onClick={startGame}
                                size="lg"
                                className="gap-2"
                            >
                                <Play className="h-4 w-4" />
                                Start Game
                            </Button>
                        )}

                        {gameState === "playing" && (
                            <Button
                                onClick={pauseGame}
                                variant="outline"
                                size="lg"
                                className="gap-2"
                            >
                                <Pause className="h-4 w-4" />
                                Pause
                            </Button>
                        )}

                        {gameState === "paused" && (
                            <>
                                <Button
                                    onClick={resumeGame}
                                    size="lg"
                                    className="gap-2"
                                >
                                    <Play className="h-4 w-4" />
                                    Resume
                                </Button>
                                <Button
                                    onClick={resetGame}
                                    variant="outline"
                                    size="lg"
                                    className="gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </Button>
                            </>
                        )}

                        {gameState === "gameOver" && (
                            <Button
                                onClick={resetGame}
                                size="lg"
                                className="gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Play Again
                            </Button>
                        )}
                    </div>

                    {/* Controls Instructions */}
                    <div className="text-center space-y-2 text-sm text-muted-foreground">
                        <p>Use ↑↓ arrow keys or W/S keys to move your paddle</p>
                        <p>Press SPACE to pause/resume</p>
                        <p>First to {WINNING_SCORE} points wins!</p>
                    </div>

                    {/* Game Over Message */}
                    {gameState === "gameOver" && (
                        <div className="text-center p-6 rounded-lg bg-muted/30">
                            <div className="text-2xl font-semibold mb-2">
                                {playerScore > aiScore
                                    ? "Congratulations! You won!"
                                    : "AI wins this time!"}
                            </div>
                            <div className="text-lg text-muted-foreground">
                                Final Score: {playerScore} - {aiScore}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Game History */}
            {gameHistory.length > 0 && (
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Game Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {gameHistory.slice(-5).map((event, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border-l-4 ${
                                        event.type === "player_score"
                                            ? "bg-green-50/50 border-l-green-400 dark:bg-green-950/20"
                                            : "bg-red-50/50 border-l-red-400 dark:bg-red-950/20"
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">
                                            {event.type === "player_score"
                                                ? "You scored!"
                                                : "AI scored!"}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            Score: {event.score}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
