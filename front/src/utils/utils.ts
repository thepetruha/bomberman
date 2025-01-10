export type TileType = "empty" | "wall";

export function generateMap(size: number): TileType[][] {
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

export function isWallAt(
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

    const corners = [
        { x: x - scaledWidth / 2, y: y - scaledHeight / 2 },
        { x: x + scaledWidth / 2, y: y - scaledHeight / 2 },
        { x: x - scaledWidth / 2, y: y + scaledHeight / 2 },
        { x: x + scaledWidth / 2, y: y + scaledHeight / 2 },
    ];

    return corners.some(({ x: cornerX, y: cornerY }) => {
        const tileX = Math.floor(cornerX / tileSize);
        const tileY = Math.floor(cornerY / tileSize);

        if (tileY < 0 || tileY >= map.length || tileX < 0 || tileX >= map[0].length) {
            return true;
        }

        return map[tileY][tileX] === "wall";
    });
}