"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { GRID_SIZE } from "@/lib/gameConfig";
import { playEatSound, playGameOverSound } from "@/lib/sounds";

const CENTER = Math.floor(GRID_SIZE / 2);
const INITIAL_SNAKE = [{ x: CENTER, y: CENTER }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const OBSTACLE_COUNT = 6;
const SAFE_ZONE = 2;

function isSamePosition(a, b) {
    return a.x === b.x && a.y === b.y;
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

function getRandomFoodPosition(snake, obstacles) {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (
        snake.some((s) => isSamePosition(s, position)) ||
        obstacles.some((o) => isSamePosition(o, position))
    );
    return position;
}

export function useSnakeGame(speed, hasObstacles) {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [obstacles, setObstacles] = useState([]);
    const [food, setFood] = useState(() =>
        getRandomFoodPosition(INITIAL_SNAKE, []),
    );
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [score, setScore] = useState(0);
    const directionRef = useRef(direction);

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    const changeDirection = useCallback((newDir) => {
        setDirection((prev) => {
            if (prev.x + newDir.x === 0 && prev.y + newDir.y === 0) return prev;
            return newDir;
        });
    }, []);

    const startGame = useCallback(() => {
        const initialObstacles = hasObstacles
            ? generateObstacles(INITIAL_SNAKE)
            : [];
        setSnake(INITIAL_SNAKE);
        setObstacles(initialObstacles);
        setFood(getRandomFoodPosition(INITIAL_SNAKE, initialObstacles));
        setDirection(INITIAL_DIRECTION);
        setIsGameOver(false);
        setIsPaused(false);
        setScore(0);
        setIsPlaying(true);
    }, [hasObstacles]);

    const togglePause = useCallback(() => {
        setIsPaused((prev) => !prev);
    }, []);

    useEffect(() => {
        if (!isPlaying || isGameOver || isPaused) return;

        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                const currentDirection = directionRef.current;
                const head = prevSnake[0];
                const newHead = {
                    x: head.x + currentDirection.x,
                    y: head.y + currentDirection.y,
                };

                const hitWall =
                    newHead.x < 0 ||
                    newHead.y < 0 ||
                    newHead.x >= GRID_SIZE ||
                    newHead.y >= GRID_SIZE;
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
                const newSnake = [newHead, ...prevSnake];

                if (ateFood) {
                    setScore((s) => s + 10);
                    setFood(getRandomFoodPosition(newSnake, obstacles));
                    playEatSound();
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, speed);

        return () => clearInterval(interval);
    }, [food, isGameOver, isPlaying, isPaused, speed, obstacles]);

    return {
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
    };
}
