import styled from 'styled-components';
import GameCanvas from './components/Canvas';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ConnectorProvider } from './components/Connector/provider';

const GAME_FIELD_SIZE = 768; 

const Wrapper = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;

  .header {
    display: flex;
    gap: 4px;
    flex-direction: column;
    max-width: ${GAME_FIELD_SIZE}px;
    padding: 0px 30px;
  }
`

const SOCKET_HOST = "http://localhost:4343";
export const socket = io(SOCKET_HOST, {
  autoConnect: false
});

const App = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Wrapper>
      <div className={"header"}>
        <h1>Bomberman</h1>
        <p>Bomberman is a video game franchise created by Shinichi Nakamoto and Shigeki Fujiwara, originally developed by Hudson Soft and currently owned by Konami.</p>
      </div>
      <ConnectorProvider size={GAME_FIELD_SIZE} socket={socket}>
        <GameCanvas size={GAME_FIELD_SIZE} />
      </ConnectorProvider> 
    </Wrapper>
  );
};

export default App;