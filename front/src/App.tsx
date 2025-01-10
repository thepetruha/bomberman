import { Stage, Container, Sprite, Text } from '@pixi/react';
import styled from 'styled-components';
import GameCanvas from './components/Canvas';
import { ConnectorProvider } from './components/Connector';

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

const App = () => {
  return (
    <Wrapper>
      <div className={"header"}>
        <h1>Bomberman</h1>
        <p>Bomberman is a video game franchise created by Shinichi Nakamoto and Shigeki Fujiwara, originally developed by Hudson Soft and currently owned by Konami.</p>
      </div>
      <ConnectorProvider size={GAME_FIELD_SIZE}>
        <GameCanvas size={GAME_FIELD_SIZE} />
      </ConnectorProvider> 
    </Wrapper>
  );
};

export default App;