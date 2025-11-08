import React from 'react';
import type { User } from '../types';

interface InviteFriendsModalProps {
    isOpen: boolean;
    onClose: () => void;
    friends: User[];
    roomUsers: User[];
    onInvite: (friendId: string) => void;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({ isOpen, onClose, friends, roomUsers, onInvite }) => {
    if (!isOpen) return null;

    const roomUserIds = roomUsers.map(u => u.id);
    const friendsToInvite = friends.filter(friend => !roomUserIds.includes(friend.id));

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-black text-gray-800 mb-6">Invite Friends</h2>
                
                {friendsToInvite.length > 0 ? (
                    <ul className="space-y-3 max-h-80 overflow-y-auto">
                        {friendsToInvite.map(friend => (
                            <li key={friend.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                                        style={{ backgroundColor: friend.color }}
                                    >
                                        {friend.name.charAt(0)}
                                    </div>
                                    <span className="font-bold">{friend.name}</span>
                                </div>
                                <button 
                                    onClick={() => onInvite(friend.id)}
                                    className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Invite
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-8">
                        All your friends are already here, or you can add more from their profiles!
                    </p>
                )}

                <button 
                    onClick={onClose}
                    className="mt-6 w-full px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};