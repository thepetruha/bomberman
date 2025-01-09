import { Stage, Container, Sprite, Text } from '@pixi/react';
import styled from 'styled-components';
import * as PIXI from "pixi.js";

const Wrapper = styled.div`
    overflow: hidden;
    border-radius: 30px;
    width: 100%;
`

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

export default function GameCanvas({ size }: { size: number }) {
    // Загружаем текстуру из изображения
    const baseTexture = PIXI.BaseTexture.from("src/assets/bomberman.png");

    // Указываем координаты и размеры нужного куска
    const frame = new PIXI.Rectangle(0, 0, 15, 15); // x, y, width, height
    const texture = new PIXI.Texture(baseTexture, frame);

    return (
        <Wrapper style={{ maxWidth: size, maxHeight: size }}>
            <Stage width={size} height={size} options={{ background: 0x43850F }}>
                <Sprite texture={texture} x={150} y={150} anchor={0.5} scale={4} />
            </Stage>
        </Wrapper>
    )
}