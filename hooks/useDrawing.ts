
import { useState, useRef, useCallback } from 'react';
import type { Point } from '../types';

export const useDrawing = (onDrawEnd: (points: Point[]) => void) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const pointsRef = useRef<Point[]>([]);

  const startDrawing = useCallback((startPoint: Point) => {
    setIsDrawing(true);
    pointsRef.current = [startPoint];
  }, []);

  const draw = useCallback((newPoint: Point) => {
    if (!isDrawing) return;
    pointsRef.current.push(newPoint);
  }, [isDrawing]);

  const finishDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (pointsRef.current.length > 1) {
        onDrawEnd(pointsRef.current);
    }
    pointsRef.current = [];
  }, [isDrawing, onDrawEnd]);

  return {
    isDrawing,
    startDrawing,
    draw,
    finishDrawing,
    pointsRef,
  };
};