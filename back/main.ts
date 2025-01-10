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
    return { x, y };
}

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    const position = getRandomPosition(12);
    players[socket.id] = { id: socket.id, ...position };

    socket.emit("init", { players });
    socket.broadcast.emit("newPlayer", players[socket.id]);

    socket.on("move", (data: any) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit("playerMoved", players[socket.id]);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit("playerDisconnected", { id: socket.id });
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});