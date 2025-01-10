import * as PIXI from "pixi.js";
import { isWallAt, TileType } from "../utils/utils";

export type PlayerState = {
    id: string;
    x: number;
    y: number;
    direction: "up" | "down" | "left" | "right";
    animationFrame: number;
};

interface Dimensions {
    width: number;
    height: number;
    scale: number;
}

interface PlayerConfig {
    id: string;
    initialPosition: { x: number; y: number };
    baseTexture: PIXI.BaseTexture;
    map: TileType[][];
    animations?: Record<string, PIXI.Texture[]>; // Опциональное поле для анимаций
    tileSize?: number;
    dimensions?: Dimensions;
    speed?: number;
    frameInterval?: number;
}

export class PlayerClass {
    private state: PlayerState;
    private animations: Record<string, PIXI.Texture[]>;
    private map: TileType[][];
    private tileSize: number;
    private dimensions: Dimensions;
    private speed: number;
    private frameInterval: number;
    private frameCounter: number;

    constructor({
        id,
        initialPosition,
        baseTexture,
        map,
        animations,
        tileSize = 64,
        dimensions = { width: 32, height: 45, scale: 1 },
        speed = 1.8,
        frameInterval = 10,
    }: PlayerConfig) {
        this.state = {
            id,
            x: initialPosition.x,
            y: initialPosition.y,
            direction: "down",
            animationFrame: 0,
        };
        // Используем переданные анимации или генерируем новые
        this.animations = animations || this.generateAnimations(baseTexture);
        this.map = map;
        this.tileSize = tileSize;
        this.dimensions = dimensions;
        this.speed = speed;
        this.frameInterval = frameInterval;
        this.frameCounter = 0;
    }

    private generateAnimations(baseTexture: PIXI.BaseTexture): Record<string, PIXI.Texture[]> {
        return {
            up: [
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(50, 15, 12, 16)),
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(66, 15, 12, 16)),
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(82, 15, 12, 16)),
            ],
            down: [
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(50, 0, 12, 16)),
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(66, 0, 12, 16)),
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(82, 0, 12, 16)),
            ],
            left: [
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(2, 0, 12, 16)),
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(16, 0, 12, 16)),
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(34, 0, 12, 16)),
            ],
            right: [
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(2, 15, 12, 16)),
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(20, 15, 12, 16)),
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(34, 15, 12, 16)),
            ],
        };
    }

    getState() {
        return { ...this.state };
    }

    syncStateFromServer(newState: Partial<PlayerState>) {
        this.state = { ...this.state, ...newState };
    }
    
    getCurrentTexture() {
        return this.animations[this.state.direction][this.state.animationFrame];
    }

    move(pressedKeys: Record<string, boolean>) {
        const { x, y } = this.state;
        const { width, height, scale } = this.dimensions;
        let moved = false;

        const directions = [
            { key: ["ArrowUp", "w"], axis: "y", delta: -this.speed, dir: "up" },
            { key: ["ArrowDown", "s"], axis: "y", delta: this.speed, dir: "down" },
            { key: ["ArrowLeft", "a"], axis: "x", delta: -this.speed, dir: "left" },
            { key: ["ArrowRight", "d"], axis: "x", delta: this.speed, dir: "right" },
        ];

        directions.forEach(({ key, axis, delta, dir }) => {
            if (key.some((k) => pressedKeys[k])) {
                const newX = axis === "x" ? x + delta : x;
                const newY = axis === "y" ? y + delta : y;

                if (!isWallAt(this.map, newX, newY, this.tileSize, width, height, scale)) {
                    this.state[axis as "x" | "y"] = axis === "x" ? newX : newY;
                    this.state.direction = dir as "up" | "down" | "left" | "right";
                    moved = true;
                }
            }
        });

        if (moved) {
            this.updateAnimationFrame();
        }

        return moved;
    }

    private updateAnimationFrame() {
        this.frameCounter++;
        if (this.frameCounter >= this.frameInterval) {
            this.state.animationFrame =
                (this.state.animationFrame + 1) % this.animations[this.state.direction].length;
            this.frameCounter = 0;
        }
    }
}