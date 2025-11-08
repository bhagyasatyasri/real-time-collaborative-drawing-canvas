import React, { useState, useEffect } from 'react';
import type { User, Room } from '../types';
import { COMMUNITY_CANVAS_ID } from '../types';

interface HomePageProps {
    user: User;
    rooms: Room[];
    onJoinRoom: (roomId: string, password?: string) => void;
    onCreateRoom: (name: string, password?: string) => void;
    onLogout: () => void;
    onNavigateToProfile: (userId: string) => void;
}

const USER_DB_KEY = 'collaborative-canvas-users';

const Avatar: React.FC<{ user: User, size?: string, className?: string }> = ({ user, size="w-20 h-20", className="" }) => {
    if (user.profilePicture) {
        return <img src={user.profilePicture} alt={user.name} className={`${size} rounded-full object-cover ${className}`} />;
    }
    return (
        <div 
            className={`${size} rounded-full flex items-center justify-center text-3xl font-bold text-white ${className}`} 
            style={{backgroundColor: user.color}}
        >
            {user.name.charAt(0)}
        </div>
    );
};

export const HomePage: React.FC<HomePageProps> = ({ user, rooms, onJoinRoom, onCreateRoom, onLogout, onNavigateToProfile }) => {
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomPassword, setNewRoomPassword] = useState('');

    useEffect(() => {
        try {
            const savedUsers = localStorage.getItem(USER_DB_KEY);
            const allUsers = savedUsers ? JSON.parse(savedUsers) : [];
            setOnlineUsers(allUsers.map((u: any) => ({ 
                id: u.email, 
                name: u.name, 
                color: u.color, 
                profilePicture: u.profilePicture 
            })));
        } catch(e) {
            console.error("Failed to parse users from localStorage", e);
            setOnlineUsers([]);
        }
    }, []);

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName.trim()) {
            alert("Room name cannot be empty.");
            return;
        }
        onCreateRoom(newRoomName, newRoomPassword.trim() ? newRoomPassword.trim() : undefined);
        setNewRoomName('');
        setNewRoomPassword('');
    };

    const handleJoinRoomClick = (roomId: string) => {
        const roomToJoin = rooms.find(r => r.id === roomId);
        if (!roomToJoin) {
            alert("Room not found!");
            return;
        }
        onJoinRoom(roomId); // The App component will now handle the password prompt
    }

    const visibleRooms = rooms.filter(room => 
        room.id === COMMUNITY_CANVAS_ID || 
        room.creatorId === user.id ||
        room.invitedUserIds?.includes(user.id)
    ).reduce((acc, room) => { // Use reduce to filter out duplicates
        if (!acc.some(r => r.id === room.id)) {
            acc.push(room);
        }
        return acc;
    }, [] as Room[]);

    return (
        <div className="flex flex-col md:flex-row h-screen p-4 md:p-8 gap-8">
            <aside className="w-full md:w-72 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col">
                <h2 className="text-2xl font-black mb-6 text-center">Doodle Club</h2>
                <button onClick={() => onNavigateToProfile(user.id)} className="text-center mb-6 group">
                    <Avatar user={user} className="mx-auto mb-2 group-hover:scale-110 transition-transform"/>
                    <p className="font-bold text-lg group-hover:text-pink-600 transition-colors">{user.name}</p>
                    <span className="text-xs text-gray-500 group-hover:text-pink-500 transition-colors">View Profile</span>
                </button>
                <h3 className="text-lg font-bold mb-4 text-gray-600">Online Artists</h3>
                <ul className="space-y-2 overflow-y-auto flex-grow">
                    {onlineUsers.map(onlineUser => (
                        <li key={onlineUser.id}>
                            <button onClick={() => onNavigateToProfile(onlineUser.id)} className="flex items-center gap-3 p-2 rounded-lg w-full text-left hover:bg-black/5 transition-colors">
                                {onlineUser.profilePicture ? (
                                    <img src={onlineUser.profilePicture} alt={onlineUser.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white" style={{ backgroundColor: onlineUser.color }}>{onlineUser.name.charAt(0)}</div>
                                )}
                                <span className={`text-sm font-bold truncate ${onlineUser.id === user.id ? 'text-pink-600' : ''}`}>
                                    {onlineUser.name}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
                <button onClick={onLogout} className="mt-6 w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
                    Logout
                </button>
            </aside>
            <main className="flex-1 p-4 md:p-8 flex flex-col bg-white/60 backdrop-blur-md rounded-2xl shadow-lg">
                 <header className="mb-8">
                    <h1 className="text-5xl font-black text-gray-800">Welcome to the Canvas!</h1>
                    <p className="text-lg text-gray-600 mt-1">Join a room or create a new one to start drawing.</p>
                </header>
                
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Create a Private Room</h2>
                    <form onSubmit={handleCreateRoom} className="p-4 bg-black/5 rounded-xl space-y-4">
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="My awesome drawing room..."
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                         <input
                            type="password"
                            value={newRoomPassword}
                            onChange={(e) => setNewRoomPassword(e.target.value)}
                            placeholder="Password (optional)"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button type="submit" className="w-full px-6 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-transform hover:scale-105">
                            Create & Join
                        </button>
                    </form>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4">Join a Room</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {visibleRooms.map(room => (
                                <div key={room.id} className={`p-6 rounded-2xl border-4 flex flex-col justify-between transition-all ${room.id === COMMUNITY_CANVAS_ID ? 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white border-purple-500' : 'bg-white border-gray-200'}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-black text-xl mb-2">{room.name}</h3>
                                            <p className={`text-sm mb-4 ${room.id === COMMUNITY_CANVAS_ID ? 'text-purple-100' : 'text-gray-500'}`}>{room.id === COMMUNITY_CANVAS_ID ? 'Draw with everyone!' : `${room.userIds.length} artist(s) in room`}</p>
                                        </div>
                                        {room.password && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={room.id === COMMUNITY_CANVAS_ID ? 'text-purple-200' : 'text-gray-400'}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => handleJoinRoomClick(room.id)} className={`w-full px-4 py-2 font-bold rounded-lg transition-transform hover:scale-105 ${room.id === COMMUNITY_CANVAS_ID ? 'bg-white text-purple-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                                            Join Canvas
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                     {visibleRooms.filter(r => r.id !== COMMUNITY_CANVAS_ID).length === 0 && (
                        <p className="text-gray-500 text-center mt-4">No private rooms yet. Create one to get started!</p>
                    )}
                </div>
            </main>
        </div>
    );
};