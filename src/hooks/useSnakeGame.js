"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GRID_SIZE } from "@/lib/gameConfig";
import { playEatSound, playBonusSound, playGameOverSound } from "@/lib/sounds";

const CENTER = Math.floor(GRID_SIZE / 2);
const INITIAL_SNAKE = [{ x: CENTER, y: CENTER }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const OBSTACLE_COUNT = 6;
const SAFE_ZONE = 2;
const FOOD_SCORE = 10;
const BONUS_SCORE = 30;
const BONUS_CHANCE = 0.15;
const BONUS_DURATION = 5000;
const SPEED_STEP_SCORE = 80;
const SPEED_STEP_MS = 4;
const MIN_SPEED_RATIO = 0.55;

function isSamePosition(a, b) {
    return a.x === b.x && a.y === b.y;
}

function computeSpeed(baseSpeed, score) {
    const reduction = Math.floor(score / SPEED_STEP_SCORE) * SPEED_STEP_MS;
    return Math.max(
        baseSpeed - reduction,
        Math.round(baseSpeed * MIN_SPEED_RATIO),
    );
}

function generateObstacles(snake) {
    const obstacles = [];

    while (obstacles.length < OBSTACLE_COUNT) {
        const candidate = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };

        const tooCloseToCenter =
            Math.abs(candidate.x - CENTER) <= SAFE_ZONE &&
            Math.abs(candidate.y - CENTER) <= SAFE_ZONE;
        const overlapsSnake = snake.some((s) => isSamePosition(s, candidate));
        const overlapsObstacle = obstacles.some((o) =>
            isSamePosition(o, candidate),
        );

        if (!tooCloseToCenter && !overlapsSnake && !overlapsObstacle) {
            obstacles.push(candidate);
        }
    }

    return obstacles;
}

function getRandomEmptyPosition(forbidden) {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (forbidden.some((cell) => isSamePosition(cell, position)));
    return position;
}

export function useSnakeGame(baseSpeed, hasObstacles, wrap) {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [obstacles, setObstacles] = useState([]);
    const [food, setFood] = useState(() =>
        getRandomEmptyPosition(INITIAL_SNAKE),
    );
    const [bonusFood, setBonusFood] = useState(null);
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [score, setScore] = useState(0);
    const [runId, setRunId] = useState(0);
    const directionRef = useRef(direction);
    const bonusTimeoutRef = useRef(null);

    const speed = useMemo(
        () => computeSpeed(baseSpeed, score),
        [baseSpeed, score],
    );

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    const clearBonusTimeout = useCallback(() => {
        if (bonusTimeoutRef.current) {
            clearTimeout(bonusTimeoutRef.current);
            bonusTimeoutRef.current = null;
        }
    }, []);

    const changeDirection = useCallback((newDir) => {
        setDirection((prev) => {
            if (prev.x + newDir.x === 0 && prev.y + newDir.y === 0) return prev;
            return newDir;
        });
    }, []);

    const startGame = useCallback(() => {
        clearBonusTimeout();
        const initialObstacles = hasObstacles
            ? generateObstacles(INITIAL_SNAKE)
            : [];
        setSnake(INITIAL_SNAKE);
        setObstacles(initialObstacles);
        setFood(
            getRandomEmptyPosition([...INITIAL_SNAKE, ...initialObstacles]),
        );
        setBonusFood(null);
        setDirection(INITIAL_DIRECTION);
        setIsGameOver(false);
        setIsPaused(false);
        setScore(0);
        setIsPlaying(true);
        setRunId((id) => id + 1);
    }, [hasObstacles, clearBonusTimeout]);

    const togglePause = useCallback(() => {
        setIsPaused((prev) => !prev);
    }, []);

    useEffect(() => {
        if (isGameOver) clearBonusTimeout();
    }, [isGameOver, clearBonusTimeout]);

    useEffect(() => clearBonusTimeout, [clearBonusTimeout]);

    useEffect(() => {
        if (!isPlaying || isGameOver || isPaused) return;

        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                const currentDirection = directionRef.current;
                const head = prevSnake[0];
                const rawX = head.x + currentDirection.x;
                const rawY = head.y + currentDirection.y;

                const newHead = wrap
                    ? {
                          x: (rawX + GRID_SIZE) % GRID_SIZE,
                          y: (rawY + GRID_SIZE) % GRID_SIZE,
                      }
                    : { x: rawX, y: rawY };

                const hitWall =
                    !wrap &&
                    (newHead.x < 0 ||
                        newHead.y < 0 ||
                        newHead.x >= GRID_SIZE ||
                        newHead.y >= GRID_SIZE);
                const hitSelf = prevSnake.some((s) =>
                    isSamePosition(s, newHead),
                );
                const hitObstacle = obstacles.some((o) =>
                    isSamePosition(o, newHead),
                );

                if (hitWall || hitSelf || hitObstacle) {
                    setIsGameOver(true);
                    setIsPlaying(false);
                    playGameOverSound();
                    return prevSnake;
                }

                const ateFood = isSamePosition(newHead, food);
                const ateBonus =
                    bonusFood !== null && isSamePosition(newHead, bonusFood);
                const newSnake = [newHead, ...prevSnake];

                if (ateBonus) {
                    setScore((s) => s + BONUS_SCORE);
                    setBonusFood(null);
                    clearBonusTimeout();
                    playBonusSound();
                }

                if (ateFood) {
                    setScore((s) => s + FOOD_SCORE);
                    const nextFood = getRandomEmptyPosition([
                        ...newSnake,
                        ...obstacles,
                    ]);
                    setFood(nextFood);
                    playEatSound();

                    if (!bonusFood && Math.random() < BONUS_CHANCE) {
                        const nextBonus = getRandomEmptyPosition([
                            ...newSnake,
                            ...obstacles,
                            nextFood,
                        ]);
                        setBonusFood(nextBonus);
                        bonusTimeoutRef.current = setTimeout(() => {
                            setBonusFood(null);
                            bonusTimeoutRef.current = null;
                        }, BONUS_DURATION);
                    }
                }

                if (!ateFood && !ateBonus) {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, speed);

        return () => clearInterval(interval);
    }, [
        food,
        bonusFood,
        isGameOver,
        isPlaying,
        isPaused,
        obstacles,
        wrap,
        speed,
        clearBonusTimeout,
    ]);

    return {
        snake,
        food,
        bonusFood,
        obstacles,
        score,
        runId,
        speed,
        isGameOver,
        isPlaying,
        isPaused,
        changeDirection,
        startGame,
        togglePause,
    };
}
