import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

const port = Number(process.env.SERVER_PORT) || 4343;

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const players: Record<string, any> = {};

function getRandomPosition(mapSize: number) {
    const x = Math.floor(Math.random() * (mapSize - 2)) + 1;
    const y = Math.floor(Math.random() * (mapSize - 2)) + 1;
    return { x: 100, y: 100 };
}

// io.on("connection", (socket) => {
//     console.log(`Player connected: ${socket.id}`);

//     const position = getRandomPosition(12);
//     players[socket.id] = { id: socket.id, ...position };

//     socket.emit("init", { players });
//     socket.broadcast.emit("newPlayer", players[socket.id]);

//     socket.on("move", (data: any) => {
//         if (players[socket.id]) {
//             players[socket.id].x = data.x;
//             players[socket.id].y = data.y;
//             io.emit("playerMoved", players[socket.id]);
//         }
//     });

//     socket.on("disconnect", () => {
//         console.log(`Player disconnected: ${socket.id}`);
//         delete players[socket.id];
//         io.emit("playerDisconnected", { id: socket.id });
//     });
// });

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Генерация начальной позиции игрока в пикселях
    const position = getRandomPosition(800); // Размер карты в пикселях
    players[socket.id] = {
        id: socket.id,
        ...position,
        direction: "down", // Направление по умолчанию
        animationFrame: 0, // Первый кадр анимации
    };

    // Отправить данные о текущих игроках
    socket.emit("init", { players });
    socket.broadcast.emit("newPlayer", players[socket.id]);

    // Обработка перемещения игрока
    socket.on("move", (data: { x: number; y: number; direction: string; animationFrame: number }) => {
        if (players[socket.id]) {
            const { x, y, direction, animationFrame } = data;

            // Проверка границ карты
            const mapBounds = { width: 800, height: 600 }; // Пределы карты
            if (x >= 0 && x <= mapBounds.width && y >= 0 && y <= mapBounds.height) {
                players[socket.id] = {
                    ...players[socket.id],
                    x,
                    y,
                    direction,
                    animationFrame,
                };

                // Транслируем обновлённое состояние игрока всем клиентам
                io.emit("playerMoved", players[socket.id]);
            }
        }
    });

    // Обработка отключения игрока
    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit("playerDisconnected", { id: socket.id });
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});