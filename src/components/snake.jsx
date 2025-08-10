"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Trophy } from "lucide-react";

const BOARD_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_WIDTH = BOARD_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = BOARD_SIZE * CELL_SIZE;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150; // milliseconds

export function Snake() {
    const canvasRef = useRef(null);
    const gameLoopRef = useRef(null);
    const keysRef = useRef({});
    
    const [gameState, setGameState] = useState("menu"); // menu, playing, paused, gameOver
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameHistory, setGameHistory] = useState([]);

    // Game objects
    const gameObjects = useRef({
        snake: [...INITIAL_SNAKE],
        direction: { ...INITIAL_DIRECTION },
        nextDirection: { ...INITIAL_DIRECTION },
        food: { x: 15, y: 15 }
    });

    const generateFood = useCallback(() => {
        const snake = gameObjects.current.snake;
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE)
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }, []);

    const resetGame = useCallback(() => {
        gameObjects.current.snake = [...INITIAL_SNAKE];
        gameObjects.current.direction = { ...INITIAL_DIRECTION };
        gameObjects.current.nextDirection = { ...INITIAL_DIRECTION };
        gameObjects.current.food = generateFood();
        setScore(0);
        setGameHistory([]);
        setGameState("menu");
    }, [generateFood]);

    const updateGame = useCallback(() => {
        if (gameState !== "playing") return;

        const { snake, direction, nextDirection, food } = gameObjects.current;

        // Update direction
        gameObjects.current.direction = { ...nextDirection };

        // Calculate new head position
        const head = { ...snake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Check wall collision
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
            setGameState("gameOver");
            return;
        }

        // Check self collision
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            setGameState("gameOver");
            return;
        }

        // Add new head
        snake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
            const newScore = score + 10;
            setScore(newScore);
            setGameHistory(history => [...history, { type: "food", score: newScore }]);
            gameObjects.current.food = generateFood();
            
            // Update high score
            if (newScore > highScore) {
                setHighScore(newScore);
            }
        } else {
            // Remove tail if no food eaten
            snake.pop();
        }
    }, [gameState, score, highScore, generateFood]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const isDark = document.documentElement.classList.contains("dark");
        
        // Clear canvas
        ctx.fillStyle = isDark ? "#0a0a0a" : "#ffffff";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw grid
        ctx.strokeStyle = isDark ? "#1f2937" : "#f3f4f6";
        ctx.lineWidth = 1;
        for (let i = 0; i <= BOARD_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
            ctx.stroke();
        }

        const { snake, food } = gameObjects.current;

        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 
                ? (isDark ? "#22c55e" : "#16a34a") // Head - brighter green
                : (isDark ? "#15803d" : "#166534"); // Body - darker green
            ctx.fillRect(
                segment.x * CELL_SIZE + 1,
                segment.y * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
            );
        });

        // Draw food
        ctx.fillStyle = isDark ? "#ef4444" : "#dc2626";
        ctx.fillRect(
            food.x * CELL_SIZE + 1,
            food.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    }, []);

    const gameLoop = useCallback(() => {
        updateGame();
        draw();
    }, [updateGame, draw]);

    useEffect(() => {
        if (gameState === "playing") {
            gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
        } else {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        }

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [gameState, gameLoop]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== "playing") return;

            const { direction } = gameObjects.current;
            
            switch(e.code) {
                case "ArrowUp":
                case "KeyW":
                    if (direction.y === 0) { // Can't reverse
                        gameObjects.current.nextDirection = { x: 0, y: -1 };
                    }
                    break;
                case "ArrowDown":
                case "KeyS":
                    if (direction.y === 0) {
                        gameObjects.current.nextDirection = { x: 0, y: 1 };
                    }
                    break;
                case "ArrowLeft":
                case "KeyA":
                    if (direction.x === 0) {
                        gameObjects.current.nextDirection = { x: -1, y: 0 };
                    }
                    break;
                case "ArrowRight":
                case "KeyD":
                    if (direction.x === 0) {
                        gameObjects.current.nextDirection = { x: 1, y: 0 };
                    }
                    break;
                case "Space":
                    e.preventDefault();
                    if (gameState === "playing") {
                        setGameState("paused");
                    } else if (gameState === "paused") {
                        setGameState("playing");
                    }
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameState]);

    useEffect(() => {
        draw(); // Initial draw
    }, [draw]);

    // Load high score from localStorage
    useEffect(() => {
        const savedHighScore = localStorage.getItem("snakeHighScore");
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore));
        }
    }, []);

    // Save high score to localStorage
    useEffect(() => {
        if (highScore > 0) {
            localStorage.setItem("snakeHighScore", highScore.toString());
        }
    }, [highScore]);

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
        if (gameState === "gameOver") return "Game Over";
        if (gameState === "paused") return "Game Paused";
        if (gameState === "playing") return "Playing";
        return "Ready to Play";
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Game Card */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Snake
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
                                Score
                            </div>
                            <div className="text-4xl font-bold text-primary">
                                {score}
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                Length
                            </div>
                            <div className="text-2xl font-medium text-muted-foreground">
                                {gameObjects.current.snake.length}
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                High Score
                            </div>
                            <div className="text-4xl font-bold text-amber-600">
                                {highScore}
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
                            <Button onClick={startGame} size="lg" className="gap-2">
                                <Play className="h-4 w-4" />
                                Start Game
                            </Button>
                        )}
                        
                        {gameState === "playing" && (
                            <Button onClick={pauseGame} variant="outline" size="lg" className="gap-2">
                                <Pause className="h-4 w-4" />
                                Pause
                            </Button>
                        )}
                        
                        {gameState === "paused" && (
                            <>
                                <Button onClick={resumeGame} size="lg" className="gap-2">
                                    <Play className="h-4 w-4" />
                                    Resume
                                </Button>
                                <Button onClick={resetGame} variant="outline" size="lg" className="gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </Button>
                            </>
                        )}
                        
                        {gameState === "gameOver" && (
                            <Button onClick={resetGame} size="lg" className="gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Play Again
                            </Button>
                        )}
                    </div>

                    {/* Controls Instructions */}
                    <div className="text-center space-y-2 text-sm text-muted-foreground">
                        <p>Use arrow keys or WASD to move the snake</p>
                        <p>Press SPACE to pause/resume</p>
                        <p>Eat the red food to grow and score points!</p>
                    </div>

                    {/* Game Over Message */}
                    {gameState === "gameOver" && (
                        <div className="text-center p-6 rounded-lg bg-muted/30">
                            <div className="text-2xl font-semibold mb-2">
                                Game Over!
                            </div>
                            <div className="text-lg text-muted-foreground mb-2">
                                Final Score: {score}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Snake Length: {gameObjects.current.snake.length}
                            </div>
                            {score === highScore && score > 0 && (
                                <div className="text-sm text-amber-600 font-medium mt-2">
                                    🎉 New High Score!
                                </div>
                            )}
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
                            Food Eaten
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {gameHistory.slice(-10).map((event, index) => (
                                <div 
                                    key={index}
                                    className="p-3 rounded-lg border-l-4 bg-green-50/50 border-l-green-400 dark:bg-green-950/20"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">
                                            Food eaten! 
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