"use client";
import { useEffect, useRef, useState } from "react";
import { useSnakeGame } from "@/hooks/useSnakeGame";
import { useSettings } from "@/hooks/useSettings";
import { GRID_SIZE, CELL_SIZE, CANVAS_SIZE } from "@/lib/gameConfig";
import { THEMES, DIFFICULTIES } from "@/lib/themes";
import { saveScore } from "@/lib/scoreStorage";
import { setMuted } from "@/lib/sounds";
import Scoreboard from "@/components/scoreboard";
import SettingsMenu from "@/components/settingsMenu";
import NameEntryModal from "@/components/nameEntryModal";

const OBSTACLE_COLOR = "#57534e";
const OBSTACLE_BORDER = "#292524";

function drawRoundedRect(ctx, x, y, size, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fill();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

export default function GameCanvas() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { settings, updateSettings } = useSettings();
    const theme = THEMES[settings.theme];
    const difficulty = DIFFICULTIES[settings.difficulty];

    const {
        snake,
        food,
        obstacles,
        score,
        isGameOver,
        isPlaying,
        isPaused,
        changeDirection,
        startGame,
        togglePause,
    } = useSnakeGame(difficulty.speed, difficulty.hasObstacles);

    const prevSnakeRef = useRef(snake);
    const currentSnakeRef = useRef(snake);
    const lastTickTimeRef = useRef(performance.now());
    const touchStartRef = useRef(null);
    const wasPlayingRef = useRef(false);
    const [scoreVersion, setScoreVersion] = useState(0);
    const [showNameEntry, setShowNameEntry] = useState(false);

    useEffect(() => {
        setMuted(!settings.soundEnabled);
    }, [settings.soundEnabled]);

    useEffect(() => {
        prevSnakeRef.current = currentSnakeRef.current;
        currentSnakeRef.current = snake;
        lastTickTimeRef.current = performance.now();
    }, [snake]);

    useEffect(() => {
        if (wasPlayingRef.current && isGameOver) {
            setShowNameEntry(true);
        }
        wasPlayingRef.current = isPlaying;
    }, [isPlaying, isGameOver]);

    const handleNameSubmit = (name) => {
        saveScore(score, name);
        setScoreVersion((v) => v + 1);
        setShowNameEntry(false);
    };

    useEffect(() => {
        let rafId;

        const render = () => {
            const ctx = canvasRef.current.getContext("2d");
            const elapsed = performance.now() - lastTickTimeRef.current;
            const t = isPaused
                ? 0
                : Math.min(elapsed / (difficulty.speed * 0.8), 1);

            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    ctx.fillStyle =
                        (row + col) % 2 === 0 ? theme.boardA : theme.boardB;
                    ctx.fillRect(
                        col * CELL_SIZE,
                        row * CELL_SIZE,
                        CELL_SIZE,
                        CELL_SIZE,
                    );
                }
            }

            obstacles.forEach((obstacle) => {
                ctx.fillStyle = OBSTACLE_COLOR;
                ctx.strokeStyle = OBSTACLE_BORDER;
                ctx.lineWidth = 2;
                const padding = 2;
                ctx.beginPath();
                ctx.roundRect(
                    obstacle.x * CELL_SIZE + padding,
                    obstacle.y * CELL_SIZE + padding,
                    CELL_SIZE - padding * 2,
                    CELL_SIZE - padding * 2,
                    4,
                );
                ctx.fill();
                ctx.stroke();
            });

            const current = currentSnakeRef.current;
            const prev = prevSnakeRef.current;

            current.forEach((segment, index) => {
                const from =
                    index === 0 ? prev[0] : (prev[index - 1] ?? segment);
                const x = lerp(from.x, segment.x, t) * CELL_SIZE;
                const y = lerp(from.y, segment.y, t) * CELL_SIZE;

                const isHead = index === 0;
                ctx.fillStyle = isHead ? theme.head : theme.body;
                const padding = 2;
                drawRoundedRect(
                    ctx,
                    x + padding,
                    y + padding,
                    CELL_SIZE - padding * 2,
                    8,
                );

                if (isHead) {
                    ctx.fillStyle = theme.boardA;
                    const cx = x + CELL_SIZE / 2;
                    const cy = y + CELL_SIZE / 2;
                    ctx.beginPath();
                    ctx.arc(cx - 5, cy - 3, 2, 0, Math.PI * 2);
                    ctx.arc(cx + 5, cy - 3, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            const pulse = 1 + Math.sin(performance.now() / 200) * 0.08;
            const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
            const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
            const radius = (CELL_SIZE / 2) * pulse;
            const gradient = ctx.createRadialGradient(
                foodX,
                foodY,
                2,
                foodX,
                foodY,
                radius,
            );
            gradient.addColorStop(0, "#ffffff");
            gradient.addColorStop(0.3, theme.food);
            gradient.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(foodX, foodY, radius, 0, Math.PI * 2);
            ctx.fill();

            rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(rafId);
    }, [food, theme, difficulty.speed, obstacles, isPaused]);

    useEffect(() => {
        const keyMap = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
        };

        const handleKeyDown = (e) => {
            if (keyMap[e.key] && !isPaused) {
                e.preventDefault();
                changeDirection(keyMap[e.key]);
            }
            if ((e.key === " " || e.key === "Enter") && !isPlaying) {
                e.preventDefault();
                startGame();
            }
            if (e.key === "Escape" && isPlaying && !isGameOver) {
                e.preventDefault();
                togglePause();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        changeDirection,
        isPlaying,
        isGameOver,
        isPaused,
        startGame,
        togglePause,
    ]);

    useEffect(() => {
        const element = containerRef.current;

        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
        };

        const handleTouchEnd = (e) => {
            if (!touchStartRef.current || isPaused) return;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStartRef.current.x;
            const dy = touch.clientY - touchStartRef.current.y;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const threshold = 20;

            if (Math.max(absDx, absDy) < threshold) return;

            if (absDx > absDy) {
                changeDirection({ x: dx > 0 ? 1 : -1, y: 0 });
            } else {
                changeDirection({ x: 0, y: dy > 0 ? 1 : -1 });
            }

            touchStartRef.current = null;
        };

        element.addEventListener("touchstart", handleTouchStart);
        element.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        element.addEventListener("touchend", handleTouchEnd);

        return () => {
            element.removeEventListener("touchstart", handleTouchStart);
            element.removeEventListener("touchmove", handleTouchMove);
            element.removeEventListener("touchend", handleTouchEnd);
        };
    }, [changeDirection, isPaused]);

    const dpadButtonClass =
        "flex items-center justify-center w-12 h-12 rounded-lg bg-black/40 hover:bg-black/60 border border-lime-500/40 text-lime-300 text-xl font-bold transition-colors active:scale-95";

    return (
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-4">
            <div className="relative w-full max-w-135">
                <div className="relative z-10 mx-auto w-fit px-8 py-2 bg-[#1a1410] border-2 border-[#4a4238] rounded-t-xl border-b-0 flex items-center gap-4">
                    <span
                        className="text-3xl font-bold tracking-[0.2em] tabular-nums"
                        style={{
                            color: theme.head,
                            textShadow: `0 0 12px ${theme.glow}`,
                        }}
                    >
                        {String(score).padStart(4, "0")}
                    </span>
                    {isPlaying && (
                        <button
                            onClick={togglePause}
                            aria-label={isPaused ? "Resume game" : "Pause game"}
                            className="text-lime-300/70 hover:text-lime-300 text-xl leading-none"
                        >
                            {isPaused ? "▶️" : "⏸️"}
                        </button>
                    )}
                </div>
                <div
                    ref={containerRef}
                    className="relative -mt-px rounded-lg p-4 w-full touch-none wall-frame"
                >
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className="rounded-xl block w-full h-auto aspect-square"
                    />

                    {!isPlaying && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 rounded-xl">
                            {isGameOver && (
                                <p className="text-red-400 font-bold text-xl tracking-wide">
                                    GAME OVER — SCORE: {score}
                                </p>
                            )}
                            <button
                                onClick={startGame}
                                className="px-8 py-3 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-lg transition-colors text-lg"
                            >
                                {isGameOver ? "Play Again" : "Start Game"}
                            </button>
                        </div>
                    )}

                    {isPlaying && isPaused && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 rounded-xl">
                            <p className="text-lime-300 font-bold text-xl tracking-widest">
                                PAUSED
                            </p>
                            <button
                                onClick={togglePause}
                                className="px-8 py-3 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-lg transition-colors text-lg"
                            >
                                Resume
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:hidden">
                <div />
                <button
                    onClick={() => changeDirection({ x: 0, y: -1 })}
                    aria-label="Move up"
                    className={dpadButtonClass}
                >
                    ↑
                </button>
                <div />
                <button
                    onClick={() => changeDirection({ x: -1, y: 0 })}
                    aria-label="Move left"
                    className={dpadButtonClass}
                >
                    ←
                </button>
                <div />
                <button
                    onClick={() => changeDirection({ x: 1, y: 0 })}
                    aria-label="Move right"
                    className={dpadButtonClass}
                >
                    →
                </button>
                <div />
                <button
                    onClick={() => changeDirection({ x: 0, y: 1 })}
                    aria-label="Move down"
                    className={dpadButtonClass}
                >
                    ↓
                </button>
                <div />
            </div>

            <div className="flex gap-3">
                <Scoreboard refreshKey={scoreVersion} />
                <SettingsMenu settings={settings} onUpdate={updateSettings} />
            </div>

            {showNameEntry && (
                <NameEntryModal score={score} onSubmit={handleNameSubmit} />
            )}
        </div>
    );
}
