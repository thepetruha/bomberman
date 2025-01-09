import { Stage, Container, Sprite, Text } from '@pixi/react';
import styled from 'styled-components';

const Wrapper = styled.div`
    overflow: hidden;
    border-radius: 30px;
    width: 100%;
`

export default function GameCanvas({ size }: { size: number }) {
    const bunnyUrl = 'https://pixijs.io/pixi-react/img/bunny.png';

    return (
        <Wrapper style={{ maxWidth: size, maxHeight: size }}>
            <Stage width={size} height={size} options={{ background: 0x1099bb }}>
                <Sprite image={bunnyUrl} x={300} y={150} />
            </Stage>
        </Wrapper>
    )
}