import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
import { DefaultEventsMap, Socket } from "socket.io";
import { io } from "socket.io-client";
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

const SOCKET_HOST = "http://localhost:4343";

export const SocketConnector = createContext({
    socket: {} as Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
});

export const ConnectorProvider = ({ size, children }: { size: number, children: React.ReactNode }) => {
    const socket = useMemo(() => io(SOCKET_HOST), []);

    if (!socket.connected) {
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