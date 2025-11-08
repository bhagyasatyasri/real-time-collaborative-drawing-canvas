import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, User } from '../types';

interface ChatBoxProps {
    messages: ChatMessage[];
    currentUser: User;
    onSendMessage: (message: string) => void;
}

const Avatar: React.FC<{ message: ChatMessage }> = ({ message }) => {
    if (message.userProfilePicture) {
        return <img src={message.userProfilePicture} alt={message.userName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" title={message.userName} />;
    }
    return (
        <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" 
            style={{ backgroundColor: message.userColor }}
            title={message.userName}
        >
           {message.userName.charAt(0)}
        </div>
    );
};

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, currentUser, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-white/50 rounded-2xl p-4">
            <h3 className="font-black text-lg text-gray-700 mb-4 text-center flex-shrink-0">Room Chat</h3>
            <form onSubmit={handleSendMessage} className="mb-4 flex gap-2 flex-shrink-0">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Say something..."
                    className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button type="submit" className="px-4 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition-colors">
                    Send
                </button>
            </form>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {[...messages].reverse().map((msg) => (
                    <div key={msg.timestamp} className={`flex gap-2 ${msg.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                       {msg.userId !== currentUser.id && <Avatar message={msg} />}
                       <div className={`max-w-[80%] p-3 rounded-xl ${msg.userId === currentUser.id ? 'bg-pink-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                            {msg.userId !== currentUser.id && <div className="font-bold text-xs mb-1" style={{color: msg.userColor}}>{msg.userName}</div>}
                            <p className="text-sm">{msg.message}</p>
                       </div>
                    </div>
                ))}
            </div>
        </div>
    );
};