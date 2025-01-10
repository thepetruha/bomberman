import { Stage, Sprite } from '@pixi/react';
import styled from 'styled-components';
import * as PIXI from "pixi.js";
import { useMemo, useState, useEffect } from 'react';
import { io } from "socket.io-client";
import { useConnector } from '../Connector';

const Wrapper = styled.div`
    overflow: hidden;
    border-radius: 30px;
    width: 100%;
`;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

type TileType = "empty" | "wall";
type Player = { id: string; x: number; y: number };

function generateMap(size: number): TileType[][] {
    const map: TileType[][] = [];

    for (let y = 0; y < size; y++) {
        const row: TileType[] = [];
        for (let x = 0; x < size; x++) {
            if (y === 0 || y === size - 1 || x === 0 || x === size - 1) {
                row.push("wall");
            } else if (x % 2 === 0 && y % 2 === 0) {
                row.push("wall");
            } else {
                row.push("empty");
            }
        }
        map.push(row);
    }

    return map;
}

function GameMap({ size }: { size: number }) {
    const baseTexture = PIXI.BaseTexture.from("src/assets/bomberman.png");

    const emptyFrame = new PIXI.Rectangle(48, 64, 16, 18); // Спрайт для пустых клеток
    const emptyTexture = new PIXI.Texture(baseTexture, emptyFrame);

    const wallFrame = new PIXI.Rectangle(48, 48, 16, 18); // Спрайт для стен
    const wallTexture = new PIXI.Texture(baseTexture, wallFrame);

    const map = useMemo(() => generateMap(size), [size]);

    return (
        <>
            {map.map((row, y) =>
                row.map((tile, x) => {
                    let texture;
                    switch (tile) {
                        case "wall":
                            texture = wallTexture;
                            break;
                        default:
                            texture = emptyTexture;
                            break;
                    }

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

export default function GameCanvas({ size }: { size: number }) {
    const { socket } = useConnector()

    const baseTexture = PIXI.BaseTexture.from("src/assets/bomberman.png");

    const frame = new PIXI.Rectangle(0, 0, 15, 15); // Спрайт игрока
    const playerTexture = new PIXI.Texture(baseTexture, frame);

    const tileSize = 64; // Размер клетки
    const mapSize = 12; // Размер карты

    const [players, setPlayers] = useState<Record<string, Player>>({});
    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        if (!socket) return;
        // Подключение к серверу
        socket.on("connect", () => {
            console.log("Connected to server");
            setPlayerId(socket.id as any);
        });

        // Получение начальных данных
        socket.on("init", ({ players: serverPlayers }: { players: Record<string, Player> }) => {
            console.log("Init data received:", serverPlayers);
            setPlayers(serverPlayers);
        });

        // Добавление нового игрока
        socket.on("newPlayer", (player: Player) => {
            console.log("New player joined:", player);
            setPlayers((prev) => ({ ...prev, [player.id]: player }));
        });

        // Обновление позиции игрока
        socket.on("playerMoved", (player: Player) => {
            setPlayers((prev) => ({ ...prev, [player.id]: player }));
        });

        // Удаление игрока
        socket.on("playerDisconnected", ({ id }: { id: string }) => {
            setPlayers((prev) => {
                const updatedPlayers = { ...prev };
                delete updatedPlayers[id];
                return updatedPlayers;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Обработка нажатий клавиш
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!playerId || !players[playerId]) return;

            let { x, y } = players[playerId];

            if (event.key === "ArrowUp" || event.key === "w") y -= 1;
            if (event.key === "ArrowDown" || event.key === "s") y += 1;
            if (event.key === "ArrowLeft" || event.key === "a") x -= 1;
            if (event.key === "ArrowRight" || event.key === "d") x += 1;

            if (generateMap(mapSize)[y]?.[x] === "empty") {
                const updatedPlayer = { id: playerId, x, y };
                setPlayers((prev) => ({ ...prev, [playerId]: updatedPlayer }));
                socket.emit("move", updatedPlayer);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [playerId, players, socket]);

    return (
        <Wrapper style={{ maxWidth: size, maxHeight: size }}>
            <Stage width={size} height={size} options={{ background: 0x43850F }}>
                <GameMap size={mapSize} />
                {Object.values(players).map((player) => (
                    <Sprite
                        key={player.id}
                        texture={playerTexture}
                        x={player.x * tileSize + tileSize / 2}
                        y={player.y * tileSize + tileSize / 2}
                        anchor={0.5}
                        scale={4}
                    />
                ))}
            </Stage>
        </Wrapper>
    );
}