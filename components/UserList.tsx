import React from 'react';
import type { User } from '../types';

interface UserListProps {
  users: User[];
  currentUser: User;
  onInviteClick?: () => void;
}

const Avatar: React.FC<{ user: User, size?: string }> = ({ user, size = "w-4 h-4" }) => {
  if (user.profilePicture) {
    return <img src={user.profilePicture} alt={user.name} className={`${size} rounded-full border-2 border-white shadow-md object-cover`} />;
  }
  return (
    <div
      className={`${size} rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs text-white font-bold`}
      style={{ backgroundColor: user.color }}
    >
      {user.name.charAt(0)}
    </div>
  );
};

export const UserList: React.FC<UserListProps> = ({ users, currentUser, onInviteClick }) => {
  return (
    <div className="w-full flex flex-col h-full">
      <h3 className="font-black text-lg text-gray-700 mb-4 text-center">Artists in Room</h3>
      <ul className="space-y-3 flex-grow overflow-y-auto">
        {users.map(user => (
          <li key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
            <Avatar user={user} />
            <span className={`text-sm font-bold ${user.id === currentUser.id ? 'text-pink-600' : 'text-gray-700'}`}>
              {user.name} {user.id === currentUser.id && '(You)'}
            </span>
          </li>
        ))}
      </ul>
      {onInviteClick && (
        <button 
          onClick={onInviteClick}
          className="mt-4 w-full px-4 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-transform hover:scale-105"
        >
          Invite Friends
        </button>
      )}
    </div>
  );
};