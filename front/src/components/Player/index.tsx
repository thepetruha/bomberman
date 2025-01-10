import { Sprite } from "@pixi/react";
import * as PIXI from "pixi.js";

interface PlayerProps {
    x: number;
    y: number;
    texture: PIXI.Texture;
}

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

export function Player({ x, y, texture }: PlayerProps) {
    return <Sprite texture={texture} x={x} y={y} anchor={0.5} scale={3} />;
}