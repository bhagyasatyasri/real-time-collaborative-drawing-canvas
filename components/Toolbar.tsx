import React from 'react';
import type { Tool } from '../types';
import { BrushIcon, EraserIcon, RedoIcon, UndoIcon } from './icons';

interface ToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onLogout: () => void;
  onLeaveRoom: () => void;
}

const ToolButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => (
  <button
    aria-label={label}
    onClick={onClick}
    className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-110 ${
      isActive ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/80 hover:bg-white text-gray-600 shadow-md'
    }`}
  >
    {children}
  </button>
);

const ColorButton: React.FC<{
    color: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ color, isActive, onClick }) => (
    <button
        aria-label={`Color ${color}`}
        onClick={onClick}
        className={`w-8 h-8 rounded-full transition-transform duration-150 transform hover:scale-125 border-2 ${isActive ? 'border-pink-500 scale-125' : 'border-white/50'}`}
        style={{ backgroundColor: color }}
    />
);

const COLORS = [ '#000000', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#3B82F6', '#A855F7', '#EC4899'];

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  undo,
  redo,
  canUndo,
  canRedo,
  onLogout,
  onLeaveRoom,
}) => {
  return (
    <header className="w-full bg-white/60 backdrop-blur-md shadow-lg p-3 z-10 rounded-2xl">
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Tools & Color */}
        <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1 items-center">
                 <h3 className="font-bold text-xs text-gray-500 uppercase">Tool</h3>
                <div className="flex gap-2 p-1 bg-black/10 rounded-xl">
                    <ToolButton label="Brush" isActive={tool === 'brush'} onClick={() => setTool('brush')}>
                        <BrushIcon />
                    </ToolButton>
                    <ToolButton label="Eraser" isActive={tool === 'eraser'} onClick={() => setTool('eraser')}>
                        <EraserIcon />
                    </ToolButton>
                </div>
            </div>

            <div className="flex flex-col gap-1 items-center">
                <h3 className="font-bold text-xs text-gray-500 uppercase">Color</h3>
                <div className="flex items-center gap-2 p-1 bg-black/10 rounded-full">
                    {COLORS.map(c => (
                        <ColorButton key={c} color={c} isActive={c === color} onClick={() => setColor(c)} />
                    ))}
                     <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 p-0 border-none cursor-pointer bg-transparent appearance-none rounded-full"
                        style={{'--color': color} as any} // For potential custom styling
                    />
                </div>
            </div>
        </div>

        {/* Middle: Stroke Width */}
        <div className="flex-grow flex justify-center items-center gap-4 max-w-sm">
             <div className="w-8 h-8 rounded-full bg-black/80 transition-all" style={{ transform: `scale(${strokeWidth / 50})` }}></div>
             <input
                type="range"
                min="1"
                max="50"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center font-black text-lg w-12">{strokeWidth}</div>
        </div>
        
        {/* Right side: History & Actions */}
        <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1 items-center">
                <h3 className="font-bold text-xs text-gray-500 uppercase">History</h3>
                <div className="flex gap-2 p-1 bg-black/10 rounded-xl">
                    <button onClick={undo} disabled={!canUndo} className="p-3 rounded-lg bg-white/80 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transform hover:scale-110 transition-all">
                        <UndoIcon />
                    </button>
                    <button onClick={redo} disabled={!canRedo} className="p-3 rounded-lg bg-white/80 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transform hover:scale-110 transition-all">
                        <RedoIcon />
                    </button>
                </div>
            </div>
             <div className="flex gap-2">
                <button
                onClick={onLeaveRoom}
                className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors text-sm font-bold"
                >
                Leave Room
                </button>
                <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-sm font-bold"
                >
                Logout
                </button>
            </div>
        </div>

      </div>
    </header>
  );
};