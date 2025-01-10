import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Socket } from "socket.io-client";
import { Player, SocketConnector } from ".";

const WrapperLayout = styled.div`
    border: 1px solid gray;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30px;
    width: 100%;
`;

interface ConnectorProviderProps {
    size: number;
    children: React.ReactNode;
    socket: Socket;
}

export const ConnectorProvider = ({ size, children, socket }: ConnectorProviderProps) => {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const [players, setPlayers] = useState<Record<string, Player>>({});
    const [playerId, setPlayerId] = useState<string | undefined | null>(null);

    useEffect(() => {
        const handleConnect = () => {
            console.log("Connected:", socket.id);
            setPlayerId(socket.id);
            setConnected(true);
        };

        const handleError = (error: any) => {
            console.error("Connection error:", error);
            setError(error.message);
        };

        const handleInit = ({ players: serverPlayers }: { players: Record<string, Player> }) => {
            setPlayers(serverPlayers);
        };

        const handleNewPlayer = (player: Player) => {
            setPlayers((prev) => ({ ...prev, [player.id]: player }));
        };

        const handlePlayerMoved = (player: Player) => {
            setPlayers((prev) => ({ ...prev, [player.id]: player }));
        };

        const handlePlayerDisconnected = ({ id }: { id: string }) => {
            setPlayers((prev) => {
                const updatedPlayers = { ...prev };
                delete updatedPlayers[id];
                return updatedPlayers;
            });
        };

        socket.connect();
        socket.on("connect", handleConnect);
        socket.on("connect_error", handleError);
        socket.on("init", handleInit);
        socket.on("newPlayer", handleNewPlayer);
        socket.on("playerMoved", handlePlayerMoved);
        socket.on("playerDisconnected", handlePlayerDisconnected);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleError);
            socket.off("init", handleInit);
            socket.off("newPlayer", handleNewPlayer);
            socket.off("playerMoved", handlePlayerMoved);
            socket.off("playerDisconnected", handlePlayerDisconnected);
            socket.disconnect();
        };
    }, [socket]);

    if (error) {
        return (
            <WrapperLayout style={{ maxWidth: size, height: size }}>
                {error}
            </WrapperLayout>
        );
    }

    if (!connected) {
        return (
            <WrapperLayout style={{ maxWidth: size, height: size }}>
                Loading...
            </WrapperLayout>
        );
    }

    return (
        <SocketConnector.Provider value={{ socket, playerId, players, setPlayers }}>
            {children}
        </SocketConnector.Provider>
    );
};