import { useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';

interface Props {
  prendaUrl: string;
  color: string;
  estampadoUrl: string | null;
  rotacion: number;
  escala: number;
  initialPos?: { x: number; y: number };
  onPosChange?: (pos: { x: number; y: number }) => void;
  draggable?: boolean; // ← nuevo, default false
}

export function PersonalizadorCanvas({
  prendaUrl, color, estampadoUrl, rotacion, escala,
  initialPos, onPosChange,
  draggable = false, // ← default: no movible
}: Props) {
  const [imagenMockup]    = useImage(prendaUrl, 'anonymous');
  const [imagenEstampado] = useImage(estampadoUrl || '', 'anonymous');

  const width   = 320;
  const height  = 426;
  const centerX = width / 2;
  const centerY = height / 2;

  const [pos, setPos] = useState(initialPos ?? { x: centerX, y: centerY });

  // Si llega una initialPos nueva (ej. al abrir el modal con datos ya guardados)
  useEffect(() => {
    setPos(initialPos ?? { x: centerX, y: centerY });
  }, [initialPos?.x, initialPos?.y]);

  // Resetea al centro solo cuando cambia la imagen (cliente normal)
  useEffect(() => {
    if (!initialPos) setPos({ x: centerX, y: centerY });
  }, [estampadoUrl]);

  const handleDragEnd = (e: any) => {
    const newPos = { x: e.target.x(), y: e.target.y() };
    setPos(newPos);
    onPosChange?.(newPos);
  };

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
            draggable={draggable}                          // ← usa la prop
            onDragEnd={draggable ? handleDragEnd : undefined}
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