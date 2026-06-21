import { useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';

interface Props {
  prendaUrl: string;
  color: string;
  estampadoUrl: string | null;
  rotacion: number;
  escala: number;
}

export function PersonalizadorCanvas({ prendaUrl, color, estampadoUrl, rotacion, escala }: Props) {
  const [imagenMockup] = useImage(prendaUrl, 'anonymous');
  const [imagenEstampado] = useImage(estampadoUrl || '', 'anonymous');

  const width = 320;
  const height = 426;
  const centerX = width / 2;   // 160
  const centerY = height / 2;  // 213

  const [pos, setPos] = useState({ x: centerX, y: centerY });

  // Cada vez que cambia la imagen, vuelve al centro
  useEffect(() => {
    setPos({ x: centerX, y: centerY });
  }, [estampadoUrl]);

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={color} />
      </Layer>

      <Layer>
        {imagenEstampado && (
          <KonvaImage
            image={imagenEstampado}
            x={pos.x}
            y={pos.y}
            width={100}
            height={100}
            offsetX={50}
            offsetY={50}
            rotation={rotacion}
            scaleX={escala}
            scaleY={escala}
            draggable
            onDragEnd={(e) => setPos({ x: e.target.x(), y: e.target.y() })}
          />
        )}
      </Layer>

      <Layer>
        {imagenMockup && (
          <KonvaImage
            image={imagenMockup}
            width={width}
            height={height}
            globalCompositeOperation="multiply"
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
}