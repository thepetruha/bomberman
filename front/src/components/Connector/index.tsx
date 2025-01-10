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

export const SocketConnector = createContext({
    socket: {},
});

export const ConnectorProvider = ({ size, children, socket }: { size: number, children: React.ReactNode, socket: Socket }) => {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        socket.connect();
    
        socket.on("connect", () => {
            setTimeout(() => {
                console.log("Connected:", socket.id);
                setConnected(true);
            }, 500);
        });
    
        socket.on("connect_error", (error) => {
            console.error("Connection error:", error);
            setError(error.message);
        });
    
        return () => {
            socket.disconnect();
            setConnected(false);
        };
    }, []);

    if (typeof error === 'string') {
        return (
            <WrapperLayout style={{ maxWidth: size, height: size }}>
                {error}
            </WrapperLayout>
        )
    }

    if (!connected) {
        return (
            <WrapperLayout style={{ maxWidth: size, height: size }}>
                Loading...
            </WrapperLayout>
        )
    }

    return (
        <SocketConnector.Provider value={{ socket }}>
            {children}
        </SocketConnector.Provider>
    )
}

export const useConnector = () => useContext(SocketConnector);