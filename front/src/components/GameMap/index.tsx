import { Sprite } from "@pixi/react";
import * as PIXI from "pixi.js";
import { useMemo } from "react";
import { generateMap } from "../../utils/utils";

export function GameMap({ size }: { size: number }) {
    const baseTexture = PIXI.BaseTexture.from("src/assets/bomberman.png");

    const emptyFrame = new PIXI.Rectangle(48, 64, 16, 18);
    const emptyTexture = new PIXI.Texture(baseTexture, emptyFrame);

    const wallFrame = new PIXI.Rectangle(48, 48, 16, 18);
    const wallTexture = new PIXI.Texture(baseTexture, wallFrame);

    const map = useMemo(() => generateMap(size), [size]);

    return (
        <>
            {map.map((row, y) =>
                row.map((tile, x) => {
                    const texture = tile === "wall" ? wallTexture : emptyTexture;
                    return (
                        <Sprite
                            key={`${x}-${y}`}
                            texture={texture}
                            x={x * 64}
                            y={y * 64}
                            anchor={0}
                            scale={4}
                        />
                    );
                })
            )}
        </>
    );
}