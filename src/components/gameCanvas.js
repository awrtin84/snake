"use client";
import { useEffect, useRef, useState } from "react";
import { useSnakeGame } from "@/hooks/useSnakeGame";
import { useSettings } from "@/hooks/useSettings";
import { GRID_SIZE, CELL_SIZE, CANVAS_SIZE } from "@/lib/gameConfig";
import { THEMES, DIFFICULTIES, MODES } from "@/lib/themes";
import { saveScore } from "@/lib/scoreStorage";
import { setMuted } from "@/lib/sounds";
import Scoreboard from "@/components/scoreboard";
import SettingsMenu from "@/components/settingsMenu";

const OBSTACLE_COLOR = "#57534e";
const OBSTACLE_BORDER = "#292524";
const SAMPLE_STEP = 5;
const MAX_RADIUS = CELL_SIZE * 0.39;
const HEAD_RADIUS = MAX_RADIUS + 1;

function shortest(delta) {
    if (delta > GRID_SIZE / 2) return delta - GRID_SIZE;
    if (delta < -GRID_SIZE / 2) return delta + GRID_SIZE;
    return delta;
}

function buildSnakePoints(prev, cur, t) {
    const chain = [{ x: cur[0].x, y: cur[0].y }];
    for (let i = 1; i < cur.length; i++) {
        const last = chain[i - 1];
        chain.push({
            x: last.x + shortest(cur[i].x - last.x),
            y: last.y + shortest(cur[i].y - last.y),
        });
    }

    const headDx = shortest(prev[0].x - cur[0].x);
    const headDy = shortest(prev[0].y - cur[0].y);

    if (cur.length > 1) {
        const lastIndex = cur.length - 1;
        const tailPrev = prev[prev.length - 1];
        const tailCur = cur[lastIndex];
        chain[lastIndex] = {
            x: chain[lastIndex].x + shortest(tailPrev.x - tailCur.x) * (1 - t),
            y: chain[lastIndex].y + shortest(tailPrev.y - tailCur.y) * (1 - t),
        };
    }

    chain[0] = {
        x: cur[0].x + headDx * (1 - t),
        y: cur[0].y + headDy * (1 - t),
    };

    const heading =
        headDx === 0 && headDy === 0
            ? { x: 1, y: 0 }
            : { x: -headDx, y: -headDy };

    return { points: chain, heading };
}

function buildSnakeBody(points) {
    const half = CELL_SIZE / 2;
    const px = points.map((p) => ({
        x: p.x * CELL_SIZE + half,
        y: p.y * CELL_SIZE + half,
    }));

    const segLengths = [];
    let total = 0;
    for (let i = 1; i < px.length; i++) {
        const length = Math.hypot(px[i].x - px[i - 1].x, px[i].y - px[i - 1].y);
        segLengths.push(length);
        total += length;
    }

    const taperLength = Math.min(CELL_SIZE * 3, total * 0.6);
    const count = Math.max(Math.ceil(total / SAMPLE_STEP), 0);
    const samples = [];
    let segIndex = 0;
    let segStart = 0;

    for (let i = 0; i <= count; i++) {
        const dist = Math.min(i * SAMPLE_STEP, total);
        while (
            segIndex < segLengths.length - 1 &&
            dist > segStart + segLengths[segIndex]
        ) {
            segStart += segLengths[segIndex];
            segIndex++;
        }

        let x = px[0].x;
        let y = px[0].y;
        if (segLengths.length > 0) {
            const a = px[segIndex];
            const b = px[segIndex + 1];
            const k =
                segLengths[segIndex] > 0
                    ? (dist - segStart) / segLengths[segIndex]
                    : 0;
            x = a.x + (b.x - a.x) * k;
            y = a.y + (b.y - a.y) * k;
        }

        const distFromTail = total - dist;
        const taper =
            taperLength > 0 ? Math.min(distFromTail / taperLength, 1) : 1;
        const r = MAX_RADIUS * (0.42 + 0.58 * Math.sin((taper * Math.PI) / 2));
        samples.push({ x, y, r });
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    samples.forEach((s) => {
        minX = Math.min(minX, s.x - s.r);
        maxX = Math.max(maxX, s.x + s.r);
        minY = Math.min(minY, s.y - s.r);
        maxY = Math.max(maxY, s.y + s.r);
    });

    return { samples, head: px[0], minX, maxX, minY, maxY };
}

function drawSnake(ctx, body, heading, theme, offsetX, offsetY) {
    const head = { x: body.head.x + offsetX, y: body.head.y + offsetY };

    ctx.save();
    ctx.fillStyle = theme.body;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    body.samples.forEach((s) => {
        const x = s.x + offsetX;
        const y = s.y + offsetY;
        ctx.moveTo(x + s.r, y);
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
    });
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = theme.head;
    ctx.beginPath();
    ctx.arc(head.x, head.y, HEAD_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    const perp = { x: -heading.y, y: heading.x };
    [-1, 1].forEach((side) => {
        const ex =
            head.x +
            heading.x * HEAD_RADIUS * 0.3 +
            perp.x * side * HEAD_RADIUS * 0.5;
        const ey =
            head.y +
            heading.y * HEAD_RADIUS * 0.3 +
            perp.y * side * HEAD_RADIUS * 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ex, ey, HEAD_RADIUS * 0.34, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(
            ex + heading.x * HEAD_RADIUS * 0.1,
            ey + heading.y * HEAD_RADIUS * 0.1,
            HEAD_RADIUS * 0.18,
            0,
            Math.PI * 2,
        );
        ctx.fill();
    });
}

export default function GameCanvas() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { settings, updateSettings } = useSettings();
    const theme = THEMES[settings.theme] ?? THEMES.google;
    const difficulty = DIFFICULTIES[settings.difficulty] ?? DIFFICULTIES.normal;
    const isFree = (MODES[settings.mode] ?? MODES.walls).wrap;

    const {
        snake,
        food,
        obstacles,
        score,
        runId,
        isGameOver,
        isPlaying,
        isPaused,
        changeDirection,
        startGame,
        togglePause,
    } = useSnakeGame(difficulty.speed, difficulty.hasObstacles, isFree);

    const prevSnakeRef = useRef(snake);
    const currentSnakeRef = useRef(snake);
    const lastRunIdRef = useRef(runId);
    const lastTickTimeRef = useRef(performance.now());
    const tickDurationRef = useRef(difficulty.speed);
    const speedRef = useRef(difficulty.speed);
    const progressRef = useRef(1);
    const touchStartRef = useRef(null);
    const wasPlayingRef = useRef(false);
    const [scoreVersion, setScoreVersion] = useState(0);

    useEffect(() => {
        setMuted(!settings.soundEnabled);
    }, [settings.soundEnabled]);

    useEffect(() => {
        speedRef.current = difficulty.speed;
    }, [difficulty.speed]);

    useEffect(() => {
        const now = performance.now();
        const speed = speedRef.current;
        const isNewRun = lastRunIdRef.current !== runId;
        const interval = now - lastTickTimeRef.current;
        lastRunIdRef.current = runId;

        tickDurationRef.current =
            isNewRun || interval > speed * 1.6 || interval < speed * 0.5
                ? speed
                : interval;
        prevSnakeRef.current = isNewRun ? snake : currentSnakeRef.current;
        currentSnakeRef.current = snake;
        lastTickTimeRef.current = now;
        progressRef.current = isNewRun ? 1 : 0;
    }, [snake, runId]);

    useEffect(() => {
        if (!isPaused) {
            lastTickTimeRef.current =
                performance.now() -
                progressRef.current * tickDurationRef.current;
        }
    }, [isPaused]);

    useEffect(() => {
        if (wasPlayingRef.current && isGameOver) {
            saveScore(score, (settings.playerName ?? "").trim());
            setScoreVersion((v) => v + 1);
        }
        wasPlayingRef.current = isPlaying;
    }, [isPlaying, isGameOver, score, settings.playerName]);

    useEffect(() => {
        let rafId;

        const render = () => {
            const ctx = canvasRef.current.getContext("2d");

            if (!isPaused) {
                const elapsed = performance.now() - lastTickTimeRef.current;
                progressRef.current = Math.min(
                    elapsed / tickDurationRef.current,
                    1,
                );
            }
            const t = progressRef.current;

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

            const pulse = 1 + Math.sin(performance.now() / 200) * 0.06;
            const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
            const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
            const foodRadius = CELL_SIZE * 0.36 * pulse;
            ctx.fillStyle = theme.food;
            ctx.beginPath();
            ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.45)";
            ctx.beginPath();
            ctx.arc(
                foodX - foodRadius * 0.35,
                foodY - foodRadius * 0.35,
                foodRadius * 0.25,
                0,
                Math.PI * 2,
            );
            ctx.fill();
            ctx.fillStyle = "#3f9b3f";
            ctx.beginPath();
            ctx.ellipse(
                foodX + foodRadius * 0.3,
                foodY - foodRadius * 1.05,
                foodRadius * 0.45,
                foodRadius * 0.2,
                -Math.PI / 5,
                0,
                Math.PI * 2,
            );
            ctx.fill();

            const { points, heading } = buildSnakePoints(
                prevSnakeRef.current,
                currentSnakeRef.current,
                t,
            );
            const body = buildSnakeBody(points);
            const offsets = isFree ? [-CANVAS_SIZE, 0, CANVAS_SIZE] : [0];
            offsets.forEach((ox) => {
                offsets.forEach((oy) => {
                    const visible =
                        body.maxX + ox > 0 &&
                        body.minX + ox < CANVAS_SIZE &&
                        body.maxY + oy > 0 &&
                        body.minY + oy < CANVAS_SIZE;
                    if (visible) drawSnake(ctx, body, heading, theme, ox, oy);
                });
            });

            rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(rafId);
    }, [food, theme, obstacles, isPaused, isFree]);

    useEffect(() => {
        const keyMap = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
        };

        const handleKeyDown = (e) => {
            if (
                e.target instanceof Element &&
                e.target.closest('[role="dialog"]')
            ) {
                return;
            }
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

    const frameClass = isFree
        ? "border-2 border-dashed border-white/40 bg-black/40"
        : theme.frame
          ? "border-2"
          : "wall-frame";
    const frameStyle =
        !isFree && theme.frame
            ? {
                  backgroundColor: theme.frame,
                  borderColor: theme.tabBorder,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }
            : undefined;

    return (
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-4">
            <div className="relative w-full max-w-[540px]">
                <div
                    className="relative z-10 mx-auto w-fit px-8 py-2 border-2 rounded-t-xl border-b-0 flex items-center gap-4"
                    style={{
                        backgroundColor: theme.tab,
                        borderColor: theme.tabBorder,
                    }}
                >
                    <span
                        className="text-3xl font-bold tracking-[0.2em] tabular-nums"
                        style={{
                            color: theme.scoreColor,
                            textShadow: `0 0 12px ${theme.glow}`,
                        }}
                    >
                        {String(score).padStart(4, "0")}
                    </span>
                    {isPlaying && (
                        <button
                            onClick={togglePause}
                            aria-label={isPaused ? "Resume" : "Pause"}
                            className="text-xl leading-none text-white/70 hover:text-white"
                        >
                            {isPaused ? "▶️" : "⏸️"}
                        </button>
                    )}
                </div>
                <div
                    ref={containerRef}
                    className={`relative -mt-px rounded-lg p-4 w-full touch-none ${frameClass}`}
                    style={frameStyle}
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
                    aria-label="Up"
                    className={dpadButtonClass}
                >
                    ↑
                </button>
                <div />
                <button
                    onClick={() => changeDirection({ x: -1, y: 0 })}
                    aria-label="Left"
                    className={dpadButtonClass}
                >
                    ←
                </button>
                <div />
                <button
                    onClick={() => changeDirection({ x: 1, y: 0 })}
                    aria-label="Right"
                    className={dpadButtonClass}
                >
                    →
                </button>
                <div />
                <button
                    onClick={() => changeDirection({ x: 0, y: 1 })}
                    aria-label="Down"
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
        </div>
    );
}
