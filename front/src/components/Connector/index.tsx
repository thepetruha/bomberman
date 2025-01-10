import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export type Player = {
    id: string;
    x: number;
    y: number;
    direction: "up" | "down" | "left" | "right";
    animationFrame: number;
};

interface SocketContextProps {
    socket: Socket;
    players: Record<string, Player>;
    playerId: string | null | undefined;
    setPlayers: React.Dispatch<React.SetStateAction<Record<string, Player>>>;
}

export const SocketConnector = createContext<SocketContextProps>({
    socket: {} as Socket,
    players: {},
    playerId: null,
    setPlayers: () => {},
});

export const useConnector = () => useContext(SocketConnector);