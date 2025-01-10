import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Socket } from "socket.io-client";
import styled from "styled-components";

const WrapperLayout = styled.div`
    border: 1px solid gray;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30px;
    width: 100%;
`;

export type Player = { id: string; x: number; y: number };

export const SocketConnector = createContext<{
    socket: Socket;
    players: Record<string, Player>;
    playerId: string | null | undefined;
    setPlayers: React.Dispatch<React.SetStateAction<Record<string, Player>>>;
}>({
    socket: {} as Socket,
    players: {},
    playerId: null,
    setPlayers: () => {},
});

export const ConnectorProvider = ({ size, children, socket }: { size: number, children: React.ReactNode, socket: Socket }) => {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<null | string>(null);

    const [players, setPlayers] = useState<Record<string, Player>>({});
    const [playerId, setPlayerId] = useState<string | undefined | null>(null);

    useEffect(() => {
        socket.connect();

        socket.on("connect", () => {
            console.log("Connected:", socket.id);
            setPlayerId(socket.id);
            setConnected(true);
        });

        socket.on("connect_error", (error) => {
            console.error("Connection error:", error);
            setError(error.message);
        });

        socket.on("init", ({ players: serverPlayers }: { players: Record<string, Player> }) => {
            setPlayers(serverPlayers);
        });

        socket.on("newPlayer", (player: Player) => {
            setPlayers((prev) => ({ ...prev, [player.id]: player }));
        });

        socket.on("playerMoved", (player: Player) => {
            setPlayers((prev) => ({ ...prev, [player.id]: player }));
        });

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

export const useConnector = () => useContext(SocketConnector);