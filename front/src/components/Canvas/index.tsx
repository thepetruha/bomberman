import { Stage, Sprite } from '@pixi/react';
import styled from 'styled-components';
import * as PIXI from "pixi.js";
import { useMemo, useState, useEffect } from 'react';
import { useConnector } from '../Connector';

const Wrapper = styled.div`
    overflow: hidden;
    border-radius: 30px;
    width: 100%;
`;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

type TileType = "empty" | "wall";

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

function isWallAt(
    map: TileType[][],
    x: number,
    y: number,
    tileSize: number,
    playerWidth: number,
    playerHeight: number,
    scale: number
): boolean {
    const scaledWidth = playerWidth * scale;
    const scaledHeight = playerHeight * scale;

    // Углы персонажа относительно центра
    const corners = [
        { x: x - scaledWidth / 2, y: y - scaledHeight / 2 }, // Верхний левый угол
        { x: x + scaledWidth / 2, y: y - scaledHeight / 2 }, // Верхний правый угол
        { x: x - scaledWidth / 2, y: y + scaledHeight / 2 }, // Нижний левый угол
        { x: x + scaledWidth / 2, y: y + scaledHeight / 2 }, // Нижний правый угол
    ];

    // Проверка всех углов
    return corners.some(({ x: cornerX, y: cornerY }) => {
        const tileX = Math.floor(cornerX / tileSize);
        const tileY = Math.floor(cornerY / tileSize);

        // Проверка выхода за пределы карты
        if (tileY < 0 || tileY >= map.length || tileX < 0 || tileX >= map[0].length) {
            return true; // Считается столкновением со стеной
        }

        // Проверка, является ли тайл стеной
        return map[tileY][tileX] === "wall";
    });
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
    const { socket, playerId, players, setPlayers } = useConnector();
    console.log('[game_field]', socket);

    const baseTexture = PIXI.BaseTexture.from("src/assets/bomberman.png");

    // Разбиваем спрайт-лист на текстуры для анимации
    const animations = {
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

    const tileSize = 64;
    const mapSize = 12;

    const [localPlayerAnimationFrame, setLocalPlayerAnimationFrame] = useState(0);
    const [localPlayerDirection, setLocalPlayerDirection] = useState<"up" | "down" | "left" | "right">("down");

    useEffect(() => {
        if (!socket) return;

        const map = generateMap(mapSize);
        const pressedKeys: Record<string, boolean> = {};
        const speed = 14; // Скорость перемещения
        let lastSentPosition = { x: 0, y: 0 }; // Последняя отправленная на сервер позиция

        const handleKeyDown = (event: KeyboardEvent) => {
            pressedKeys[event.key] = true;
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            pressedKeys[event.key] = false;
        };

        const movePlayer = () => {
            if (!playerId || !players[playerId]) return;

            let { x, y, direction = "down", animationFrame = 0 } = players[playerId];
            let moved = false;

            if (pressedKeys["ArrowUp"] || pressedKeys["w"]) {
                direction = "up";
                if (!isWallAt(map, x, y - speed, tileSize, 32, 45, 1)) {
                    y -= speed;
                    moved = true;
                }
            }
            if (pressedKeys["ArrowDown"] || pressedKeys["s"]) {
                direction = "down";
                if (!isWallAt(map, x, y + speed, tileSize, 32, 45, 1)) {
                    y += speed;
                    moved = true;
                }
            }
            if (pressedKeys["ArrowLeft"] || pressedKeys["a"]) {
                direction = "left";
                if (!isWallAt(map, x - speed, y, tileSize, 32, 45, 1)) {
                    x -= speed;
                    moved = true;
                }
            }
            if (pressedKeys["ArrowRight"] || pressedKeys["d"]) {
                direction = "right";
                if (!isWallAt(map, x + speed, y, tileSize, 32, 45, 1)) {
                    x += speed;
                    moved = true;
                }
            }

            if (moved) {
                animationFrame = (animationFrame + 1) % animations.down.length;

                const updatedPlayer = { id: playerId, x, y, direction, animationFrame };

                // Обновляем локальное состояние сразу
                setPlayers((prev) => ({ ...prev, [playerId]: updatedPlayer }));

                // Отправляем обновления на сервер
                if (lastSentPosition.x !== x || lastSentPosition.y !== y) {
                    lastSentPosition = { x, y };
                    socket.emit("move", updatedPlayer);
                }
            }
        };

        const interval = setInterval(() => {
            movePlayer();

            // Переключение кадров анимации только для локального игрока
            if (Object.values(pressedKeys).some(Boolean)) {
                setLocalPlayerAnimationFrame((prev) => (prev + 1) % animations.down.length);
            }
        }, 100); // Меняем кадры каждые 100ms (~10 FPS)

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            clearInterval(interval);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [playerId, players, socket]);

    // Обработка данных от сервера для синхронизации игроков
    useEffect(() => {
        if (!socket) return;

        socket.on("playerMoved", (updatedPlayer) => {
            setPlayers((prev) => ({
                ...prev,
                [updatedPlayer.id]: updatedPlayer,
            }));
        });

        return () => {
            socket.off("playerMoved");
        };
    }, [socket]);

    return (
        <Wrapper style={{ maxWidth: size, maxHeight: size }}>
            <Stage width={size} height={size} options={{ background: 0x43850F }}>
                <GameMap size={mapSize} />
                {Object.values(players).map((player) => (
                    <Sprite
                        key={player.id}
                        texture={animations[player.direction][player.animationFrame]} // Синхронизированное состояние
                        x={player.x} // Абсолютные пиксельные координаты
                        y={player.y} // Абсолютные пиксельные координаты
                        anchor={0.5}
                        scale={3}
                    />
                ))}
            </Stage>
        </Wrapper>
    );
}