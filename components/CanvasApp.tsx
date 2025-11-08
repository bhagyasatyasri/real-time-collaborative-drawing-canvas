import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { UserList } from './UserList';
import { ChatBox } from './ChatBox';
import { InviteFriendsModal } from './InviteFriendsModal';
import { useRealtime } from '../hooks/useRealtime';
import type { DrawAction, User, Tool, Point, CursorPosition, ChatMessage, Room } from '../types';
import { PencilIcon } from './icons';
import { COMMUNITY_CANVAS_ID } from '../types';

interface CanvasAppProps {
  user: User;
  roomId: string;
  allUsers: User[];
  onLeaveRoom: () => void;
  onLogout: () => void;
  onUpdateRoomUsers: (roomId: string, newUserIds: string[]) => void;
}

const getHistoryKey = (roomId: string) => `collaborative-canvas-history-${roomId}`;
const getChatKey = (roomId: string) => `collaborative-canvas-chat-${roomId}`;

export const CanvasApp: React.FC<CanvasAppProps> = ({ user, roomId, allUsers, onLeaveRoom, onLogout, onUpdateRoomUsers }) => {
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  
  const [history, setHistory] = useState<DrawAction[]>(() => {
    try {
        const savedHistory = localStorage.getItem(getHistoryKey(roomId));
        return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
        return [];
    }
  });
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
        const savedChat = localStorage.getItem(getChatKey(roomId));
        return savedChat ? JSON.parse(savedChat) : [];
    } catch (e) {
        return [];
    }
  });

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  
  const { users, otherUsersCursors, broadcastDrawing, broadcastCursor } = useRealtime(user, roomId);

  useEffect(() => {
    localStorage.setItem(getHistoryKey(roomId), JSON.stringify(history));
  }, [history, roomId]);

  useEffect(() => {
    localStorage.setItem(getChatKey(roomId), JSON.stringify(messages));
  }, [messages, roomId]);

  const handleNewDrawAction = useCallback((action: DrawAction) => {
    setHistory(prev => [...prev, action]);
    setRedoStack([]); // Clear redo stack on new action
  }, []);

  // Effect to simulate other users drawing in the room
  useEffect(() => {
    const otherUsers = users.filter(u => u.id !== user.id);
    if (otherUsers.length === 0) return;

    const interval = setInterval(() => {
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        if (randomUser) {
            const startPoint: Point = { x: Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1, y: Math.random() * window.innerHeight * 0.8 + window.innerHeight * 0.1 };
            const endPoint: Point = { x: startPoint.x + (Math.random() - 0.5) * 150, y: startPoint.y + (Math.random() - 0.5) * 150 };
            
            const simulatedAction: DrawAction = {
                userId: randomUser.id,
                tool: 'brush',
                color: randomUser.color,
                strokeWidth: Math.floor(Math.random() * 15) + 2,
                points: [startPoint, endPoint],
            };
            handleNewDrawAction(simulatedAction);
        }
    }, 8000); // Increased interval to reduce frequency of full redraws, improving performance.

    return () => clearInterval(interval);
  }, [users, user.id, handleNewDrawAction]);


  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setRedoStack(prev => [lastAction, ...prev]);
  }, [history]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextAction = redoStack[0];
    setRedoStack(prev => prev.slice(1));
    setHistory(prev => [...prev, nextAction]);
  }, [redoStack]);
  
  const onDraw = useCallback((action: DrawAction) => {
    handleNewDrawAction(action);
    broadcastDrawing(action);
  }, [handleNewDrawAction, broadcastDrawing]);

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      message,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  }

  const userFriends = useMemo(() => {
    return allUsers.filter(u => user.friendIds?.includes(u.id));
  }, [allUsers, user.friendIds]);

  const handleInviteFriend = (friendId: string) => {
    const roomUsersIds = users.map(u => u.id);
    if (!roomUsersIds.includes(friendId)) {
        const newUserIds = [...roomUsersIds, friendId];
        onUpdateRoomUsers(roomId, newUserIds);
        // In a real app, a notification would be sent. Here, the room will just appear on their homepage.
        alert('Friend invited! The room will appear on their home page.');
    }
  }
  
  const isCommunityCanvas = roomId === COMMUNITY_CANVAS_ID;

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden p-4 gap-4">
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        undo={handleUndo}
        redo={handleRedo}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onLogout={onLogout}
        onLeaveRoom={onLeaveRoom}
      />
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        <main className="flex-1 h-full w-full relative bg-white rounded-2xl shadow-lg overflow-hidden">
            <Canvas
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            onDraw={onDraw}
            history={history}
            currentUser={user}
            onCursorMove={broadcastCursor}
            />
            {Object.values(otherUsersCursors).map((cursor: CursorPosition) => {
                const cursorUser = users.find(u => u.id === cursor.userId);
                if (!cursorUser) return null;
                
                return (
                <div
                    key={cursor.userId}
                    className="absolute pointer-events-none transform -translate-x-1 -translate-y-5 transition-all duration-100"
                    style={{
                    left: `${cursor.x}px`,
                    top: `${cursor.y}px`,
                    color: cursorUser.color,
                    }}
                >
                    <div className="w-6 h-6 -rotate-45">
                        <PencilIcon />
                    </div>
                </div>
                );
            })}
        </main>
        <aside className="w-full md:w-80 bg-white/60 p-4 rounded-2xl shadow-lg h-96 md:h-full flex flex-col gap-4">
            <div className="flex-shrink-0">
                <UserList 
                  users={users} 
                  currentUser={user}
                  {...(!isCommunityCanvas && { onInviteClick: () => setInviteModalOpen(true) })}
                />
            </div>
            <div className="flex-1 overflow-hidden h-full">
                <ChatBox messages={messages} currentUser={user} onSendMessage={handleSendMessage} />
            </div>
        </aside>
      </div>
      {!isCommunityCanvas && (
        <InviteFriendsModal
          isOpen={isInviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          friends={userFriends}
          roomUsers={users}
          onInvite={handleInviteFriend}
        />
      )}
    </div>
  );
};