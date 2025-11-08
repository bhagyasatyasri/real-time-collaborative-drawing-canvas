import React, { useState, useMemo, useRef } from 'react';
import type { User } from '../types';

interface ProfilePageProps {
    userToView: User;
    currentUser: User;
    allUsers: User[];
    onGoBack: () => void;
    onUpdateBio: (userId: string, newBio: string) => void;
    onSendFriendRequest: (friendId: string) => void;
    onAcceptFriendRequest: (requestingUserId: string) => void;
    onDeclineFriendRequest: (requestingUserId: string) => void;
    onUpdateProfilePicture: (userId: string, imageBase64: string) => void;
}

const Avatar: React.FC<{ user: User; size?: string; className?: string, onClick?: () => void }> = ({ user, size="w-24 h-24", className="", onClick }) => {
    const style = { backgroundColor: user.color };
    const baseClasses = `rounded-full flex items-center justify-center text-5xl font-black text-white flex-shrink-0 ${size} ${className}`;
    
    if (user.profilePicture) {
        return <img src={user.profilePicture} alt={user.name} className={`${baseClasses} object-cover`} onClick={onClick} />;
    }
    return (
        <div className={baseClasses} style={style} onClick={onClick}>
            {user.name.charAt(0)}
        </div>
    );
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
    userToView, 
    currentUser, 
    allUsers, 
    onGoBack, 
    onUpdateBio, 
    onSendFriendRequest,
    onAcceptFriendRequest,
    onDeclineFriendRequest,
    onUpdateProfilePicture
}) => {
    const isOwnProfile = userToView.id === currentUser.id;
    const [bio, setBio] = useState(userToView.bio || '');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const friends = useMemo(() => {
        return allUsers.filter(u => userToView.friendIds?.includes(u.id));
    }, [userToView.friendIds, allUsers]);
    
    const friendRequests = useMemo(() => {
        return allUsers.filter(u => currentUser.incomingFriendRequests?.includes(u.id));
    }, [currentUser.incomingFriendRequests, allUsers]);

    const friendshipStatus = useMemo(() => {
        if (currentUser.friendIds?.includes(userToView.id)) return 'friends';
        if (userToView.incomingFriendRequests?.includes(currentUser.id)) return 'sent';
        if (currentUser.incomingFriendRequests?.includes(userToView.id)) return 'received';
        return 'none';
    }, [currentUser, userToView]);

    const handleSaveBio = () => {
        onUpdateBio(userToView.id, bio);
        setIsEditingBio(false);
    }

    const handleAvatarClick = () => {
        if (isOwnProfile) {
            fileInputRef.current?.click();
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 200;
                const MAX_HEIGHT = 200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL(file.type);
                onUpdateProfilePicture(currentUser.id, dataUrl);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const renderFriendButton = () => {
        switch (friendshipStatus) {
            case 'friends':
                return <button className="mt-2 px-4 py-2 bg-gray-400 text-white font-bold rounded-lg cursor-not-allowed">Friends</button>;
            case 'sent':
                return <button className="mt-2 px-4 py-2 bg-gray-400 text-white font-bold rounded-lg cursor-not-allowed">Request Sent</button>;
            case 'received':
                 return <button onClick={() => onAcceptFriendRequest(userToView.id)} className="mt-2 px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">Accept Request</button>;
            case 'none':
                 return <button onClick={() => onSendFriendRequest(userToView.id)} className="mt-2 px-4 py-2 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600">Send Friend Request</button>;
            default:
                return null;
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <button onClick={onGoBack} className="mb-8 px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors">
                &larr; Back to Home
            </button>
            
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
                <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <div className={`relative ${isOwnProfile ? 'cursor-pointer group' : ''}`} onClick={handleAvatarClick}>
                        <Avatar user={userToView} />
                        {isOwnProfile && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold">Change</span>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                        <h1 className="text-4xl font-black">{userToView.name}</h1>
                        {!isOwnProfile && renderFriendButton()}
                    </div>
                </header>
                
                {isOwnProfile && friendRequests.length > 0 && (
                    <section className="mb-8 p-4 bg-teal-50 rounded-xl">
                        <h2 className="text-xl font-bold mb-4">Friend Requests ({friendRequests.length})</h2>
                        <ul className="space-y-3">
                            {friendRequests.map(reqUser => (
                                <li key={reqUser.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar user={reqUser} size="w-10 h-10" />
                                        <span className="font-bold">{reqUser.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => onAcceptFriendRequest(reqUser.id)} className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600">Accept</button>
                                        <button onClick={() => onDeclineFriendRequest(reqUser.id)} className="px-3 py-1 bg-rose-500 text-white text-sm font-bold rounded-lg hover:bg-rose-600">Decline</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">About Me</h2>
                    {isEditingBio ? (
                        <div>
                            <textarea 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full h-32 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="Tell everyone a little about yourself..."
                            />
                            <div className="flex gap-2 mt-2">
                                <button onClick={handleSaveBio} className="px-4 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600">Save Bio</button>
                                <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-600 italic whitespace-pre-wrap">{bio || 'This artist is a mystery...'}</p>
                            {isOwnProfile && (
                                <button onClick={() => setIsEditingBio(true)} className="mt-2 text-sm font-bold text-pink-600 hover:underline">Edit Bio</button>
                            )}
                        </div>
                    )}
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold mb-4">Friends ({friends.length})</h2>
                    {friends.length > 0 ? (
                         <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {friends.map(friend => (
                                <li key={friend.id} className="flex flex-col items-center p-4 bg-black/5 rounded-xl text-center">
                                    <Avatar user={friend} size="w-12 h-12" />
                                    <span className="font-bold text-sm mt-2">{friend.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No friends yet. Go make some connections!</p>
                    )}
                </section>
            </div>
        </div>
    );
}