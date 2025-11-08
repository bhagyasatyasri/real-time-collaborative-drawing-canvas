import React, { useRef, useEffect, useCallback } from 'react';
import { useDrawing } from '../hooks/useDrawing';
import type { DrawAction, Tool, User, Point, CursorPosition } from '../types';

interface CanvasProps {
  tool: Tool;
  color: string;
  strokeWidth: number;
  onDraw: (action: DrawAction) => void;
  history: DrawAction[];
  currentUser: User;
  onCursorMove: (position: CursorPosition) => void;
}

const drawPath = (ctx: CanvasRenderingContext2D, action: DrawAction) => {
  ctx.beginPath();
  ctx.strokeStyle = action.tool === 'eraser' ? '#FFFFFF' : action.color;
  ctx.lineWidth = action.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if(action.points.length > 0) {
    ctx.moveTo(action.points[0].x, action.points[0].y);
  }

  for (let i = 1; i < action.points.length; i++) {
    ctx.lineTo(action.points[i].x, action.points[i].y);
  }
  ctx.stroke();
};

export const Canvas: React.FC<CanvasProps> = ({
  tool,
  color,
  strokeWidth,
  onDraw,
  history,
  currentUser,
  onCursorMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { isDrawing, startDrawing, draw, finishDrawing, pointsRef } = useDrawing((points) => {
    const action: DrawAction = {
      userId: currentUser.id,
      tool,
      color,
      strokeWidth,
      points,
    };
    onDraw(action);
  });

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history.forEach(action => drawPath(ctx, action));
  }, [history]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [history, redrawCanvas]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    startDrawing({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    onCursorMove({ userId: currentUser.id, ...pos });
    
    if (isDrawing) {
      draw(pos);

      // --- Real-time drawing optimization ---
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const points = pointsRef.current;
      if (ctx && points.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          const lastPoint = points[points.length - 2];
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
      }
    }
  };

  const handleMouseUp = () => {
    finishDrawing();
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      finishDrawing();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full"
    />
  );
};