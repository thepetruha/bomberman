import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

dotenv.config({ path: ".env.developent" });

const port = Number(process.env.SERVER_PORT) || 4343;

const server = http.createServer();

const io = new Server(server);
io.listen(port);