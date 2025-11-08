
import { useState, useEffect, useCallback } from 'react';
import type { User, CursorPosition, DrawAction, Room } from '../types';

const USER_DB_KEY = 'collaborative-canvas-users';
const ROOMS_DB_KEY = 'collaborative-canvas-rooms';


const getRoomUsers = (roomId: string, currentUser: User): User[] => {
    try {
        const roomsJSON = localStorage.getItem(ROOMS_DB_KEY);
        if (!roomsJSON) return [currentUser];
        
        const rooms: Room[] = JSON.parse(roomsJSON);
        const currentRoom = rooms.find(room => room.id === roomId);
        if (!currentRoom) return [currentUser];

        const usersJSON = localStorage.getItem(USER_DB_KEY);
        if (!usersJSON) return [currentUser];
        const allUsers = JSON.parse(usersJSON);

        const roomUsers = currentRoom.userIds.map(userId => {
            const user = allUsers.find((u: any) => u.email === userId);
            if (!user) return null;
            return { id: user.email, name: user.name, color: user.color };
        }).filter((u): u is User => u !== null);

        // Ensure current user is in the list if something is out of sync
        if (!roomUsers.find(u => u.id === currentUser.id)) {
            return [currentUser, ...roomUsers];
        }
        return roomUsers;

    } catch (e) {
        console.error("Failed to get room users", e);
        return [currentUser];
    }
}


export const useRealtime = (loggedInUser: User, roomId: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [otherUsersCursors, setOtherUsersCursors] = useState<Record<string, CursorPosition>>({});

  useEffect(() => {
    const roomUsers = getRoomUsers(roomId, loggedInUser);
    setUsers(roomUsers);
  }, [roomId, loggedInUser]);

  // Simulate receiving cursor updates from other users in the room
  useEffect(() => {
    const otherRoomUsers = users.filter(u => u.id !== loggedInUser.id);
    if (otherRoomUsers.length === 0) return;

    const interval = setInterval(() => {
      const randomUser = otherRoomUsers[Math.floor(Math.random() * otherRoomUsers.length)];
      const newPosition: CursorPosition = {
        userId: randomUser.id,
        x: Math.random() * window.innerWidth * 0.8, // avoid edges
        y: Math.random() * window.innerHeight * 0.8,
      };
      setOtherUsersCursors(prev => ({
        ...prev,
        [randomUser.id]: newPosition,
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [users, loggedInUser.id]);

  const broadcastDrawing = useCallback((action: DrawAction) => {
    // In a real app, this would send the action over a WebSocket to users in the same room.
    console.log(`Broadcasting draw action in room ${roomId}:`, action);
  }, [roomId]);

  const broadcastCursor = useCallback((position: CursorPosition) => {
    // In a real app, this would send the cursor position over a WebSocket.
    // console.log(`Broadcasting cursor position in room ${roomId}:`, position);
  }, [roomId]);

  return {
    users,
    otherUsersCursors,
    broadcastDrawing,
    broadcastCursor,
  };
};
