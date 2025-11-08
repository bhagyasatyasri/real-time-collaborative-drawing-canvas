
export interface Point {
  x: number;
  y: number;
}

export type Tool = 'brush' | 'eraser';

export interface DrawAction {
  userId: string;
  tool: Tool;
  color: string;
  strokeWidth: number;
  points: Point[];
}

export interface User {
  id: string; // email will be used as ID
  name: string;
  color: string;
  bio?: string;
  friendIds?: string[];
  profilePicture?: string; // Base64 encoded image
  incomingFriendRequests?: string[];
}

export interface CursorPosition {
  userId: string;
  x: number;
  y: number;
}

export interface Room {
    id: string;
    name: string;
    userIds: string[]; // Users currently in the room
    creatorId: string;
    password?: string; // Optional password for private rooms
    invitedUserIds?: string[]; // All users ever invited to the room
}

export interface ChatMessage {
    userId: string;
    userName: string;
    userColor: string;
    userProfilePicture?: string;
    message: string;
    timestamp: number;
}

export const COMMUNITY_CANVAS_ID = 'community-canvas-global';