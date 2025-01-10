import { Stage } from "@pixi/react";
import styled from "styled-components";
import { useEffect, useState, useMemo } from "react";
import { useConnector } from "../Connector";
import { GameMap } from "../GameMap";
import { Player } from "../Player";
import { generateMap } from "../../utils/utils";
import { PlayerClass } from "../../classes/PlayerClass";
import * as PIXI from "pixi.js";

const Wrapper = styled.div`
    overflow: hidden;
    border-radius: 30px;
    width: 100%;
`;

export default function GameCanvas({ size }: { size: number }) {
    const { socket, playerId, players, setPlayers } = useConnector();

    const baseTexture = useMemo(() => PIXI.BaseTexture.from("src/assets/bomberman.png"), []);
    const animations = useMemo(() => {
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
    }, [baseTexture]);

    const map = useMemo(() => generateMap(12), []);
    const [localPlayer, setLocalPlayer] = useState<PlayerClass | null>(null);

    useEffect(() => {
        if (!socket || !playerId) return;

        const player = new PlayerClass({
            id: playerId,
            initialPosition: { x: 100, y: 100 },
            baseTexture,
            map,
            animations,
        });
        setLocalPlayer(player);

        const pressedKeys: Record<string, boolean> = {};

        const handleKeyDown = (event: KeyboardEvent) => {
            pressedKeys[event.key] = true;
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            pressedKeys[event.key] = false;
        };

        const interval = setInterval(() => {
            if (player.move(pressedKeys)) {
                const state = player.getState();
                setPlayers((prev) => ({
                    ...prev,
                    [state.id]: state,
                }));
                socket.emit("move", state);
            }
        }, 1000 / 60);

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            clearInterval(interval);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [socket, playerId, baseTexture, map, setPlayers, animations]);

    useEffect(() => {
        if (!socket || !localPlayer) return;

        socket.on("playerMoved", (updatedPlayer) => {
            setPlayers((prev) => ({
                ...prev,
                [updatedPlayer.id]: updatedPlayer,
            }));
        });

        return () => {
            socket.off("playerMoved");
        };
    }, [socket, localPlayer, playerId]);

    return (
        <Wrapper style={{ maxWidth: size, maxHeight: size }}>
            <Stage width={size} height={size} options={{ background: 0x43850f }}>
                <GameMap size={12} />
                {Object.values(players).map((player) => {
                    const isLocalPlayer = player.id === playerId;
                    const texture = animations[player.direction][player.animationFrame];

                    return (
                        <Player
                            key={player.id}
                            x={player.x}
                            y={player.y}
                            texture={texture}
                        />
                    );
                })}
            </Stage>
        </Wrapper>
    );
}