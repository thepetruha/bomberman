import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
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
    // if (!socket.connected) {
    //     return (
    //         <WrapperLayout style={{ maxWidth: size, height: size }}>
    //             Loading...
    //         </WrapperLayout>
    //     )
    // }

    return (
        <SocketConnector.Provider value={{ socket }}>
            {children}
        </SocketConnector.Provider>
    )
}

export const useConnector = () => useContext(SocketConnector);