"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Play, RotateCcw, Trophy, User, Bot, Zap } from "lucide-react";

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
];

export function TicTacToe() {
    const [gameState, setGameState] = useState("menu"); // menu, playing, gameOver
    const [gameMode, setGameMode] = useState("vsAI"); // vsAI, vs2P
    const [board, setBoard] = useState(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState("X");
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [drawScore, setDrawScore] = useState(0);
    const [gameHistory, setGameHistory] = useState([]);

    const checkWinner = (board) => {
        for (const combination of WINNING_COMBINATIONS) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], combination };
            }
        }
        return null;
    };

    const checkDraw = (board) => {
        return board.every(cell => cell !== null);
    };

    const getAIMove = (board) => {
        // AI strategy: Try to win, then block player, then take center/corners
        const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
        
        // Check if AI can win
        for (const move of availableMoves) {
            const testBoard = [...board];
            testBoard[move] = "O";
            if (checkWinner(testBoard)?.winner === "O") {
                return move;
            }
        }
        
        // Check if AI needs to block player
        for (const move of availableMoves) {
            const testBoard = [...board];
            testBoard[move] = "X";
            if (checkWinner(testBoard)?.winner === "X") {
                return move;
            }
        }
        
        // Prefer center, then corners, then edges
        const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        for (const move of preferredMoves) {
            if (availableMoves.includes(move)) {
                return move;
            }
        }
        
        return availableMoves[0];
    };

    const makeMove = (index) => {
        if (board[index] || winner || isDraw) return;

        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);

        const gameResult = checkWinner(newBoard);
        if (gameResult) {
            setWinner(gameResult);
            setGameState("gameOver");
            
            if (gameResult.winner === "X") {
                setPlayerScore(prev => prev + 1);
            } else if (gameResult.winner === "O") {
                if (gameMode === "vsAI") {
                    setAiScore(prev => prev + 1);
                } else {
                    setPlayerScore(prev => prev + 1); // In 2P mode, both are players
                }
            }
            
            setGameHistory(prev => [...prev, `${gameResult.winner} wins!`]);
        } else if (checkDraw(newBoard)) {
            setIsDraw(true);
            setGameState("gameOver");
            setDrawScore(prev => prev + 1);
            setGameHistory(prev => [...prev, "Draw!"]);
        } else {
            setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
        }
    };

    const handleAIMove = () => {
        if (currentPlayer === "O" && gameMode === "vsAI" && gameState === "playing" && !winner && !isDraw) {
            setTimeout(() => {
                const aiMove = getAIMove(board);
                makeMove(aiMove);
            }, 500); // Small delay to make AI move visible
        }
    };

    // Trigger AI move when it's AI's turn
    if (currentPlayer === "O" && gameMode === "vsAI" && gameState === "playing" && !winner && !isDraw) {
        handleAIMove();
    }

    const startGame = (mode) => {
        setGameMode(mode);
        setGameState("playing");
        setBoard(Array(9).fill(null));
        setCurrentPlayer("X");
        setWinner(null);
        setIsDraw(false);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer("X");
        setWinner(null);
        setIsDraw(false);
        setGameState("playing");
    };

    const backToMenu = () => {
        setGameState("menu");
        setBoard(Array(9).fill(null));
        setCurrentPlayer("X");
        setWinner(null);
        setIsDraw(false);
    };

    const resetStats = () => {
        setPlayerScore(0);
        setAiScore(0);
        setDrawScore(0);
        setGameHistory([]);
    };

    if (gameState === "menu") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
                <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="text-center space-y-6">
                        <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                            <Zap className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Tic Tac Toe
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                            Classic 3x3 grid strategy game. Get three in a row to win!
                        </CardDescription>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Button 
                                onClick={() => startGame("vsAI")} 
                                className="flex flex-col gap-3 h-20 transition-all duration-300 hover:-translate-y-1"
                                size="lg"
                            >
                                <Bot className="h-6 w-6" />
                                <div>
                                    <div className="font-semibold">vs AI</div>
                                    <div className="text-xs opacity-80">Single Player</div>
                                </div>
                            </Button>
                            <Button 
                                onClick={() => startGame("vs2P")} 
                                className="flex flex-col gap-3 h-20 transition-all duration-300 hover:-translate-y-1"
                                variant="outline"
                                size="lg"
                            >
                                <User className="h-6 w-6" />
                                <div>
                                    <div className="font-semibold">2 Players</div>
                                    <div className="text-xs opacity-80">Local</div>
                                </div>
                            </Button>
                        </div>
                    </CardHeader>
                    
                    {(playerScore > 0 || aiScore > 0 || drawScore > 0) && (
                        <CardContent className="pt-0">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg mb-3">Statistics</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold text-primary">{playerScore}</div>
                                        <div className="text-xs text-muted-foreground">Player X</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold text-muted-foreground">{drawScore}</div>
                                        <div className="text-xs text-muted-foreground">Draws</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold text-destructive">{aiScore}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {gameMode === "vsAI" ? "AI" : "Player O"}
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    onClick={resetStats}
                                    variant="ghost" 
                                    size="sm"
                                    className="w-full"
                                >
                                    Reset Statistics
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-lg space-y-6">
                {/* Game Header */}
                <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="space-y-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Tic Tac Toe
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button onClick={backToMenu} variant="ghost" size="sm" className="text-muted-foreground">
                                    Menu
                                </Button>
                                <Button onClick={resetGame} variant="ghost" size="sm">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        
                        {gameState === "playing" && (
                            <div className="text-center py-2">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                                    <div className={`w-2 h-2 rounded-full ${currentPlayer === "X" ? "bg-blue-500" : "bg-red-500"}`}></div>
                                    <span className="text-sm font-medium">
                                        {currentPlayer} {gameMode === "vsAI" && currentPlayer === "O" ? "(AI)" : ""} Turn
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {gameState === "gameOver" && (
                            <div className="text-center space-y-4 py-2">
                                <div className="space-y-2">
                                    {winner ? (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
                                            <Trophy className="h-4 w-4 text-green-500" />
                                            <span className="text-lg font-bold text-green-500">
                                                {winner.winner} Wins!
                                            </span>
                                        </div>
                                    ) : isDraw ? (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full">
                                            <span className="text-lg font-bold text-amber-500">
                                                Draw!
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                                <Button onClick={resetGame} className="gap-2 transition-all duration-300 hover:-translate-y-1">
                                    <Play className="h-4 w-4" />
                                    Play Again
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                </Card>

                {/* Game Board */}
                <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto aspect-square">
                            {board.map((cell, index) => (
                                <button
                                    key={index}
                                    onClick={() => makeMove(index)}
                                    disabled={cell !== null || gameState !== "playing" || (gameMode === "vsAI" && currentPlayer === "O")}
                                    className={`
                                        aspect-square flex items-center justify-center text-3xl font-bold
                                        rounded-xl transition-all duration-300 
                                        ${cell === null 
                                            ? "bg-muted/30 hover:bg-muted/50 hover:scale-105 border-2 border-transparent hover:border-primary/20" 
                                            : "bg-muted/20"
                                        }
                                        ${cell === "X" ? "text-blue-500" : cell === "O" ? "text-red-500" : ""}
                                        ${winner?.combination.includes(index) ? "bg-primary/20 border-2 border-primary animate-pulse" : ""}
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                    `}
                                >
                                    {cell && (
                                        <span className="animate-in zoom-in-50 duration-300">
                                            {cell}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Score Display */}
                {(playerScore > 0 || aiScore > 0 || drawScore > 0) && (
                    <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-xl">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-3 gap-6 text-center">
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-blue-500">{playerScore}</div>
                                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Player X</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-muted-foreground">{drawScore}</div>
                                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Draws</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-red-500">{aiScore}</div>
                                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                        {gameMode === "vsAI" ? "AI" : "Player O"}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}