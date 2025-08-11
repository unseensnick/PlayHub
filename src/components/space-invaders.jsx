"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState, useEffect, useRef, useCallback, useReducer } from "react";
import { Play, Pause, RotateCcw, Trophy, Zap, Shield } from "lucide-react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const PLAYER_SPEED = 5;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 10;
const BULLET_SPEED = 5;
const INVADER_WIDTH = 30;
const INVADER_HEIGHT = 20;
const INVADER_SPEED = 0.6;
const INVADER_DROP_SPEED = 20;
const INVADER_BULLET_SPEED = 3;
const ROWS = 5;
const COLS = 10;

// Game States
const GAME_STATES = {
    MENU: "MENU",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED",
    LEVEL_COMPLETE: "LEVEL_COMPLETE",
    TRANSITIONING: "TRANSITIONING",
    GAME_OVER: "GAME_OVER",
};

// Create initial game state
const createInitialState = () => ({
    gameState: GAME_STATES.MENU,
    score: 0,
    lives: 3,
    level: 1,
    player: {
        x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
    },
    bullets: [],
    invaders: createInvaders(),
    invaderBullets: [],
    barriers: createBarriers(),
    powerUps: [],
    invaderDirection: 1,
    invaderSpeed: INVADER_SPEED,
    lastInvaderShot: 0,
    invaderShotCooldown: 60 + Math.random() * 120,
    lastPlayerShot: 0,
    playerShotCooldown: 15,
    animationFrame: 0,
    gameHistory: [],
});

function createInvaders() {
    const invaders = [];
    const startX = 100;
    const startY = 80;
    const spacingX = 50;
    const spacingY = 40;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            invaders.push({
                id: `${row}-${col}`, // Unique ID for each invader
                x: startX + col * spacingX,
                y: startY + row * spacingY,
                width: INVADER_WIDTH,
                height: INVADER_HEIGHT,
                type: row < 2 ? "small" : row < 4 ? "medium" : "large",
                points: row < 2 ? 30 : row < 4 ? 20 : 10,
            });
        }
    }
    return invaders;
}

function createBarriers() {
    const barriers = [];
    const barrierCount = 4;
    const barrierWidth = 100;
    const barrierHeight = 60;
    const spacing = 60;
    const startX =
        (CANVAS_WIDTH -
            (barrierCount * barrierWidth + (barrierCount - 1) * spacing)) /
        2;

    for (let i = 0; i < barrierCount; i++) {
        barriers.push({
            id: i,
            x: startX + i * (barrierWidth + spacing),
            y: CANVAS_HEIGHT - 200,
            width: barrierWidth,
            height: barrierHeight,
            health: 5,
        });
    }
    return barriers;
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Game reducer for predictable state updates
function gameReducer(state, action) {
    switch (action.type) {
        case "START_GAME":
            return { ...createInitialState(), gameState: GAME_STATES.PLAYING };

        case "PAUSE_GAME":
            return { ...state, gameState: GAME_STATES.PAUSED };

        case "RESUME_GAME":
            return { ...state, gameState: GAME_STATES.PLAYING };

        case "RESET_GAME":
            return createInitialState();

        case "UPDATE_GAME":
            if (state.gameState !== GAME_STATES.PLAYING) return state;
            return updateGameLogic(state, action.keys);

        case "LEVEL_COMPLETE":
            return {
                ...state,
                gameState: GAME_STATES.LEVEL_COMPLETE,
                gameHistory: [
                    ...state.gameHistory,
                    { type: "level_complete", level: state.level },
                ],
            };

        case "NEXT_LEVEL":
            return {
                ...state,
                gameState: GAME_STATES.PLAYING,
                level: state.level + 1,
                bullets: [],
                invaders: createInvaders(),
                invaderBullets: [],
                barriers: createBarriers(),
                powerUps: [],
                invaderDirection: 1,
                invaderSpeed: INVADER_SPEED + state.level * 0.5,
                lastInvaderShot: 0,
                invaderShotCooldown: 60 + Math.random() * 120,
                lastPlayerShot: 0,
                animationFrame: 0,
            };

        case "GAME_OVER":
            return { ...state, gameState: GAME_STATES.GAME_OVER };

        default:
            return state;
    }
}

function updateGameLogic(state, keys) {
    let newState = { ...state };

    // Update animation frame
    newState.animationFrame = state.animationFrame + 1;

    // Player movement
    if ((keys.ArrowLeft || keys.KeyA) && state.player.x > 0) {
        newState.player = { ...state.player, x: state.player.x - PLAYER_SPEED };
    }
    if (
        (keys.ArrowRight || keys.KeyD) &&
        state.player.x < CANVAS_WIDTH - PLAYER_WIDTH
    ) {
        newState.player = { ...state.player, x: state.player.x + PLAYER_SPEED };
    }

    // Player shooting
    let newLastPlayerShot = state.lastPlayerShot;
    let newBullets = [...state.bullets];

    if (keys.Space && state.bullets.length < 3 && state.lastPlayerShot <= 0) {
        newBullets.push({
            id: `bullet-${Date.now()}-${Math.random()}`,
            x: newState.player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
            y: newState.player.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            dy: -BULLET_SPEED,
        });
        newLastPlayerShot = state.playerShotCooldown;
    }

    if (newLastPlayerShot > 0) {
        newLastPlayerShot--;
    }

    newState.lastPlayerShot = newLastPlayerShot;

    // Update bullets and handle collisions
    const bulletUpdates = updateBullets(newBullets, state);
    newState.bullets = bulletUpdates.bullets;
    newState.invaders = bulletUpdates.invaders;
    newState.barriers = bulletUpdates.barriers;
    newState.powerUps = [...bulletUpdates.powerUps, ...state.powerUps];
    newState.score = bulletUpdates.newScore;
    newState.gameHistory = [...state.gameHistory, ...bulletUpdates.newEvents];

    // Move invaders
    const invaderUpdates = updateInvaders(newState);
    newState.invaders = invaderUpdates.invaders;
    newState.invaderDirection = invaderUpdates.direction;

    // Update invader bullets
    const invaderBulletUpdates = updateInvaderBullets(newState);
    newState.invaderBullets = invaderBulletUpdates.bullets;
    newState.lastInvaderShot = invaderBulletUpdates.lastShot;
    newState.invaderShotCooldown = invaderBulletUpdates.cooldown;
    newState.lives = invaderBulletUpdates.lives;
    newState.barriers = invaderBulletUpdates.barriers;
    newState.gameHistory = [
        ...newState.gameHistory,
        ...invaderBulletUpdates.events,
    ];

    // Update power-ups
    const powerUpUpdates = updatePowerUps(newState);
    newState.powerUps = powerUpUpdates.powerUps;
    newState.lives = Math.max(newState.lives, powerUpUpdates.lives);
    newState.bullets = [...newState.bullets, ...powerUpUpdates.newBullets];
    newState.gameHistory = [...newState.gameHistory, ...powerUpUpdates.events];

    return newState;
}

function updateBullets(bullets, state) {
    const newBullets = [];
    let invaders = [...state.invaders];
    let barriers = [...state.barriers];
    const newPowerUps = [];
    let newScore = state.score;
    const newEvents = [];

    for (const bullet of bullets) {
        const newBullet = { ...bullet, y: bullet.y + bullet.dy };

        // Remove bullets that go off screen
        if (newBullet.y < 0) continue;

        let bulletHit = false;

        // Check invader collisions
        for (let i = invaders.length - 1; i >= 0; i--) {
            const invader = invaders[i];
            if (checkCollision(newBullet, invader)) {
                // Remove invader
                invaders.splice(i, 1);
                bulletHit = true;
                newScore += invader.points;
                newEvents.push({
                    type: "invader_destroyed",
                    points: invader.points,
                    score: newScore,
                });

                // Maybe spawn power-up
                if (Math.random() < 0.1) {
                    newPowerUps.push({
                        id: `powerup-${Date.now()}-${Math.random()}`,
                        x: invader.x + invader.width / 2,
                        y: invader.y,
                        width: 20,
                        height: 20,
                        type: Math.random() < 0.5 ? "life" : "multishot",
                        dy: 2,
                    });
                }
                break;
            }
        }

        // Check barrier collisions if bullet didn't hit invader
        if (!bulletHit) {
            for (let i = barriers.length - 1; i >= 0; i--) {
                const barrier = barriers[i];
                if (barrier.health > 0 && checkCollision(newBullet, barrier)) {
                    // Bullet is stopped by barrier but doesn't damage it
                    bulletHit = true;
                    break;
                }
            }
        }

        // Keep bullet if it didn't hit anything
        if (!bulletHit) {
            newBullets.push(newBullet);
        }
    }

    return {
        bullets: newBullets,
        invaders,
        barriers,
        powerUps: newPowerUps,
        newScore,
        newEvents,
    };
}

function updateInvaders(state) {
    if (state.invaders.length === 0)
        return { invaders: state.invaders, direction: state.invaderDirection };

    let shouldMoveDown = false;
    let newDirection = state.invaderDirection;

    const leftmostX = Math.min(...state.invaders.map((inv) => inv.x));
    const rightmostX = Math.max(
        ...state.invaders.map((inv) => inv.x + inv.width)
    );

    if (rightmostX >= CANVAS_WIDTH - 10 && state.invaderDirection === 1) {
        shouldMoveDown = true;
        newDirection = -1;
    } else if (leftmostX <= 10 && state.invaderDirection === -1) {
        shouldMoveDown = true;
        newDirection = 1;
    }

    const newInvaders = state.invaders.map((invader) => ({
        ...invader,
        x: shouldMoveDown
            ? invader.x
            : invader.x + state.invaderSpeed * state.invaderDirection,
        y: shouldMoveDown ? invader.y + INVADER_DROP_SPEED : invader.y,
    }));

    return { invaders: newInvaders, direction: newDirection };
}

function updateInvaderBullets(state) {
    const newBullets = [];
    let newLastShot = state.lastInvaderShot + 1;
    let newCooldown = state.invaderShotCooldown;
    let newLives = state.lives;
    let barriers = [...state.barriers];
    const events = [];

    // Create new invader bullet
    if (newLastShot >= newCooldown && state.invaders.length > 0) {
        const frontInvaders = state.invaders.filter((invader) => {
            const sameColumn = state.invaders.filter(
                (other) =>
                    Math.abs(other.x - invader.x) < 30 && other.y > invader.y
            );
            return sameColumn.length === 0;
        });

        if (frontInvaders.length > 0) {
            const shooter =
                frontInvaders[Math.floor(Math.random() * frontInvaders.length)];
            newBullets.push({
                id: `invader-bullet-${Date.now()}-${Math.random()}`,
                x: shooter.x + shooter.width / 2 - BULLET_WIDTH / 2,
                y: shooter.y + shooter.height,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                dy: INVADER_BULLET_SPEED,
            });
        }
        newLastShot = 0;
        newCooldown = 60 + Math.random() * 120;
    }

    // Update existing bullets
    for (const bullet of state.invaderBullets) {
        const newBullet = { ...bullet, y: bullet.y + bullet.dy };

        if (newBullet.y > CANVAS_HEIGHT) continue;

        let bulletHit = false;

        // Check player collision
        if (checkCollision(newBullet, state.player)) {
            newLives--;
            bulletHit = true;
            events.push({ type: "player_hit", livesRemaining: newLives });
        }

        // Check barrier collisions
        if (!bulletHit) {
            for (let i = barriers.length - 1; i >= 0; i--) {
                const barrier = barriers[i];
                if (barrier.health > 0 && checkCollision(newBullet, barrier)) {
                    // Invader bullets damage barriers
                    barriers[i] = { ...barrier, health: barrier.health - 1 };
                    bulletHit = true;
                    events.push({
                        type: "barrier_damaged",
                        barrierId: barrier.id,
                        newHealth: barriers[i].health,
                    });
                    break;
                }
            }
        }

        if (!bulletHit) {
            newBullets.push(newBullet);
        }
    }

    return {
        bullets: newBullets,
        lastShot: newLastShot,
        cooldown: newCooldown,
        lives: newLives,
        barriers,
        events,
    };
}

function updatePowerUps(state) {
    const newPowerUps = [];
    let newLives = state.lives;
    const newBullets = [];
    const events = [];

    for (const powerUp of state.powerUps) {
        const newPowerUp = { ...powerUp, y: powerUp.y + powerUp.dy };

        if (newPowerUp.y > CANVAS_HEIGHT) continue;

        if (checkCollision(newPowerUp, state.player)) {
            if (powerUp.type === "life") {
                newLives = Math.min(newLives + 1, 5);
                events.push({ type: "life_gained" });
            } else if (powerUp.type === "multishot") {
                for (let j = -1; j <= 1; j++) {
                    newBullets.push({
                        id: `multishot-bullet-${Date.now()}-${Math.random()}-${j}`,
                        x:
                            state.player.x +
                            PLAYER_WIDTH / 2 -
                            BULLET_WIDTH / 2 +
                            j * 15,
                        y: state.player.y,
                        width: BULLET_WIDTH,
                        height: BULLET_HEIGHT,
                        dy: -BULLET_SPEED,
                    });
                }
                events.push({ type: "multishot_gained" });
            }
        } else {
            newPowerUps.push(newPowerUp);
        }
    }

    return { powerUps: newPowerUps, lives: newLives, newBullets, events };
}

export function SpaceInvaders() {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const keysRef = useRef({});
    const [gameState, dispatch] = useReducer(
        gameReducer,
        null,
        createInitialState
    );

    // Check win/lose conditions
    useEffect(() => {
        if (gameState.gameState === GAME_STATES.PLAYING) {
            // Check win condition
            if (gameState.invaders.length === 0) {
                dispatch({ type: "LEVEL_COMPLETE" });
            }
            // Check lose conditions
            else if (
                gameState.lives <= 0 ||
                gameState.invaders.some(
                    (invader) =>
                        invader.y + invader.height >= gameState.player.y
                )
            ) {
                dispatch({ type: "GAME_OVER" });
            }
        }
    }, [
        gameState.invaders.length,
        gameState.lives,
        gameState.gameState,
        gameState.invaders,
        gameState.player.y,
    ]);

    // Handle level complete transition
    useEffect(() => {
        if (gameState.gameState === GAME_STATES.LEVEL_COMPLETE) {
            const timer = setTimeout(() => {
                dispatch({ type: "NEXT_LEVEL" });
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [gameState.gameState]);

    const updateGame = useCallback(() => {
        dispatch({ type: "UPDATE_GAME", keys: keysRef.current });
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const isDark = document.documentElement.classList.contains("dark");

        // Clear canvas
        ctx.fillStyle = isDark ? "#0a0a0a" : "#000022";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw stars
        ctx.fillStyle = isDark ? "#666666" : "#ffffff";
        for (let i = 0; i < 50; i++) {
            const x = (i * 123) % CANVAS_WIDTH;
            const y =
                (i * 456 + gameState.animationFrame * 0.5) % CANVAS_HEIGHT;
            ctx.fillRect(x, y, 1, 1);
        }

        // Draw player
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(
            gameState.player.x,
            gameState.player.y,
            gameState.player.width,
            gameState.player.height
        );

        // Draw player ship details
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(gameState.player.x + 5, gameState.player.y - 5, 5, 5);
        ctx.fillRect(gameState.player.x + 30, gameState.player.y - 5, 5, 5);

        // Draw bullets
        ctx.fillStyle = "#ffff00";
        for (const bullet of gameState.bullets) {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }

        // Draw invaders
        for (const invader of gameState.invaders) {
            if (invader.type === "small") {
                ctx.fillStyle = "#ff0000";
            } else if (invader.type === "medium") {
                ctx.fillStyle = "#ff8800";
            } else {
                ctx.fillStyle = "#ffff00";
            }
            ctx.fillRect(invader.x, invader.y, invader.width, invader.height);

            // Add simple details
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(invader.x + 5, invader.y + 5, 3, 3);
            ctx.fillRect(invader.x + 22, invader.y + 5, 3, 3);
        }

        // Draw invader bullets
        ctx.fillStyle = "#ff0000";
        for (const bullet of gameState.invaderBullets) {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }

        // Draw barriers
        ctx.fillStyle = "#00ff88";
        for (const barrier of gameState.barriers) {
            if (barrier.health > 0) {
                const alpha = barrier.health / 5;
                ctx.globalAlpha = alpha;
                ctx.fillRect(
                    barrier.x,
                    barrier.y,
                    barrier.width,
                    barrier.height
                );
                ctx.globalAlpha = 1;
            }
        }

        // Draw power-ups
        for (const powerUp of gameState.powerUps) {
            if (powerUp.type === "life") {
                ctx.fillStyle = "#ff00ff";
            } else {
                ctx.fillStyle = "#00ffff";
            }
            ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        }

        // Draw HUD
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${gameState.score}`, 20, 30);
        ctx.fillText(`Lives: ${gameState.lives}`, 20, 55);
        ctx.fillText(`Level: ${gameState.level}`, 20, 80);

        // Draw level complete message
        if (gameState.gameState === GAME_STATES.LEVEL_COMPLETE) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = "#ffffff";
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                "LEVEL COMPLETE!",
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2
            );
            ctx.font = "24px Arial";
            ctx.fillText(
                `Advancing to Level ${gameState.level + 1}`,
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2 + 50
            );
        }
    }, [gameState]);

    const gameLoop = useCallback(() => {
        updateGame();
        draw();
        if (gameState.gameState === GAME_STATES.PLAYING) {
            animationRef.current = requestAnimationFrame(gameLoop);
        }
    }, [updateGame, draw, gameState.gameState]);

    useEffect(() => {
        if (gameState.gameState === GAME_STATES.PLAYING) {
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
    }, [gameState.gameState, gameLoop]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault();
            keysRef.current[e.code] = true;
        };

        const handleKeyUp = (e) => {
            e.preventDefault();
            keysRef.current[e.code] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useEffect(() => {
        draw(); // Initial draw
    }, [draw]);

    const getGameStatus = () => {
        switch (gameState.gameState) {
            case GAME_STATES.GAME_OVER:
                return "Game Over";
            case GAME_STATES.PAUSED:
                return "Game Paused";
            case GAME_STATES.PLAYING:
                return `Level ${gameState.level}`;
            case GAME_STATES.LEVEL_COMPLETE:
                return `Level ${gameState.level} Complete!`;
            default:
                return "Ready to Defend Earth";
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Game Card */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Space Invaders
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {getGameStatus()}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Stats Display */}
                    <div className="flex justify-center items-center gap-8 mb-6">
                        <div className="text-center space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                Score
                            </div>
                            <div className="text-3xl font-bold text-primary">
                                {gameState.score}
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                Lives
                            </div>
                            <div className="text-3xl font-bold text-destructive">
                                {gameState.lives}
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                <Zap className="h-4 w-4" />
                                Level
                            </div>
                            <div className="text-3xl font-bold text-secondary-foreground">
                                {gameState.level}
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
                        {gameState.gameState === GAME_STATES.MENU && (
                            <Button
                                onClick={() => dispatch({ type: "START_GAME" })}
                                size="lg"
                                className="gap-2"
                            >
                                <Play className="h-4 w-4" />
                                Start Game
                            </Button>
                        )}

                        {gameState.gameState === GAME_STATES.PLAYING && (
                            <Button
                                onClick={() => dispatch({ type: "PAUSE_GAME" })}
                                variant="outline"
                                size="lg"
                                className="gap-2"
                            >
                                <Pause className="h-4 w-4" />
                                Pause
                            </Button>
                        )}

                        {gameState.gameState === GAME_STATES.PAUSED && (
                            <>
                                <Button
                                    onClick={() =>
                                        dispatch({ type: "RESUME_GAME" })
                                    }
                                    size="lg"
                                    className="gap-2"
                                >
                                    <Play className="h-4 w-4" />
                                    Resume
                                </Button>
                                <Button
                                    onClick={() =>
                                        dispatch({ type: "RESET_GAME" })
                                    }
                                    variant="outline"
                                    size="lg"
                                    className="gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </Button>
                            </>
                        )}

                        {gameState.gameState === GAME_STATES.GAME_OVER && (
                            <Button
                                onClick={() => dispatch({ type: "RESET_GAME" })}
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
                        <p>Use ←→ arrow keys or A/D keys to move</p>
                        <p>Press SPACE to shoot</p>
                        <p>
                            Destroy all invaders to advance to the next level!
                        </p>
                    </div>

                    {/* Game Over Message */}
                    {gameState.gameState === GAME_STATES.GAME_OVER && (
                        <div className="text-center p-6 rounded-lg bg-muted/30">
                            <div className="text-2xl font-semibold mb-2">
                                Game Over!
                            </div>
                            <div className="text-lg text-muted-foreground mb-2">
                                Final Score: {gameState.score}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Reached Level: {gameState.level}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Game History */}
            {gameState.gameHistory.length > 0 && (
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Battle Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {gameState.gameHistory
                                .slice(-5)
                                .map((event, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border-l-4 ${
                                            event.type === "invader_destroyed"
                                                ? "bg-green-50/50 border-l-green-400 dark:bg-green-950/20"
                                                : event.type === "player_hit"
                                                ? "bg-red-50/50 border-l-red-400 dark:bg-red-950/20"
                                                : event.type ===
                                                  "level_complete"
                                                ? "bg-blue-50/50 border-l-blue-400 dark:bg-blue-950/20"
                                                : "bg-purple-50/50 border-l-purple-400 dark:bg-purple-950/20"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">
                                                {event.type ===
                                                    "invader_destroyed" &&
                                                    `Invader destroyed! +${event.points} points`}
                                                {event.type === "player_hit" &&
                                                    `Hit! ${event.livesRemaining} lives remaining`}
                                                {event.type ===
                                                    "level_complete" &&
                                                    `Level ${event.level} complete!`}
                                                {event.type === "life_gained" &&
                                                    "Extra life gained!"}
                                                {event.type ===
                                                    "multishot_gained" &&
                                                    "Multishot power-up!"}
                                            </span>
                                            {event.score && (
                                                <span className="text-sm text-muted-foreground">
                                                    Score: {event.score}
                                                </span>
                                            )}
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
