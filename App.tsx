import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { CanvasApp } from './components/CanvasApp';
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import type { User, Room } from './types';
import { COMMUNITY_CANVAS_ID } from './types';

// In-memory/localStorage user store for simulation
const USER_DB_KEY = 'collaborative-canvas-users';
const SESSION_KEY = 'collaborative-canvas-session';
const ROOMS_DB_KEY = 'collaborative-canvas-rooms';

const USER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#14b8a6'];

type NavigationState = 
    | { page: 'login' }
    | { page: 'register' }
    | { page: 'home' }
    | { page: 'room', roomId: string }
    | { page: 'profile', profileId: string };

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [navigation, setNavigation] = useState<NavigationState>({ page: 'login' });
  const [rooms, setRooms] = useState<Room[]>([]); // Centralized room state

  const getUsersFromDB = (): any[] => JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  const saveUsersToDB = (users: any[]) => localStorage.setItem(USER_DB_KEY, JSON.stringify(users));

  const getRoomsFromDB = (): Room[] => JSON.parse(localStorage.getItem(ROOMS_DB_KEY) || '[]');
  const saveRoomsToDB = (rooms: Room[]) => localStorage.setItem(ROOMS_DB_KEY, JSON.stringify(rooms));

  useEffect(() => {
    // Load initial rooms and check for session
    const savedRooms = getRoomsFromDB();
    const communityCanvas = savedRooms.find(room => room.id === COMMUNITY_CANVAS_ID);
    if (!communityCanvas) {
        const newCommunityCanvas: Room = { id: COMMUNITY_CANVAS_ID, name: '🎨 Community Canvas', userIds: [], creatorId: 'system', invitedUserIds: [] };
        savedRooms.unshift(newCommunityCanvas);
    }
    setRooms(savedRooms);
    saveRoomsToDB(savedRooms);

    const sessionEmail = localStorage.getItem(SESSION_KEY);
    if (sessionEmail) {
        const users = getUsersFromDB();
        const user = users.find((u: any) => u.email === sessionEmail);
        if (user) {
            const loggedInUser: User = {
                id: user.email,
                name: user.name,
                color: user.color,
                bio: user.bio || '',
                friendIds: user.friendIds || [],
                profilePicture: user.profilePicture,
                incomingFriendRequests: user.incomingFriendRequests || [],
            };
            setCurrentUser(loggedInUser);
            
            const urlParams = new URLSearchParams(window.location.search);
            const roomToJoin = urlParams.get('room');
            if (roomToJoin) {
                // Defer joining to allow states to settle
                setTimeout(() => handleJoinRoom(roomToJoin, undefined, true, savedRooms), 0);
            } else {
                setNavigation({ page: 'home' });
            }
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUser && navigation.page !== 'login' && navigation.page !== 'register') {
        setNavigation({ page: 'login' });
    }
  }, [currentUser, navigation.page]);

  const handleRegister = (name: string, email: string, pass: string) => {
    const users = getUsersFromDB();
    if (users.find((u: any) => u.email === email)) {
      alert('User with this email already exists!');
      return;
    }
    const newUser = { 
        name, 
        email, 
        pass, // In real app, hash this
        color: USER_COLORS[users.length % USER_COLORS.length],
        bio: `Hi, I'm ${name}! Let's draw something cool.`,
        friendIds: [],
        profilePicture: undefined,
        incomingFriendRequests: [],
    };
    users.push(newUser);
    saveUsersToDB(users);
    alert('Registration successful! Please login.');
    setNavigation({ page: 'login' });
  };

  const handleLogin = (email: string, pass: string) => {
    const users = getUsersFromDB();
    const user = users.find((u: any) => u.email === email && u.pass === pass);
    if (user) {
        const loggedInUser: User = {
            id: user.email,
            name: user.name,
            color: user.color,
            bio: user.bio || '',
            friendIds: user.friendIds || [],
            profilePicture: user.profilePicture,
            incomingFriendRequests: user.incomingFriendRequests || [],
        };
      setCurrentUser(loggedInUser);
      localStorage.setItem(SESSION_KEY, email);
      
      const urlParams = new URLSearchParams(window.location.search);
      const roomToJoin = urlParams.get('room');
      if (roomToJoin) {
        handleJoinRoom(roomToJoin, undefined, true);
      } else {
        setNavigation({ page: 'home' });
      }
    } else {
      alert('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    setNavigation({ page: 'login' });
  };
  
  const handleCreateRoom = (roomName: string, password?: string) => {
    if (!currentUser) return;
    const newRoom: Room = {
        id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: roomName.trim(),
        userIds: [currentUser.id],
        creatorId: currentUser.id,
        invitedUserIds: [currentUser.id],
        ...(password && { password }),
    };

    const updatedRooms = [...rooms, newRoom];
    saveRoomsToDB(updatedRooms);
    setRooms(updatedRooms);
    
    setNavigation({ page: 'room', roomId: newRoom.id });
  };

  const handleJoinRoom = (roomId: string, password?: string, fromUrl = false, roomList: Room[] | null = null) => {
    if (!currentUser) return;

    const currentRooms = roomList || rooms;
    const roomToJoin = currentRooms.find(r => r.id === roomId);

    if (!roomToJoin) {
        alert("Room not found!");
        if (fromUrl) window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    
    const isMember = roomToJoin.userIds.includes(currentUser.id);
    const isCreator = roomToJoin.creatorId === currentUser.id;

    // Check if user is a friend of the creator
    const allUsers = getUsersFromDB();
    const creator = allUsers.find(u => u.email === roomToJoin.creatorId);
    const isFriendOfCreator = creator?.friendIds?.includes(currentUser.id) ?? false;
    
    // Determine if a password prompt is needed.
    const needsPassword = 
        roomToJoin.password &&   // The room must be password-protected
        !isCreator &&            // The user is not the creator
        !isMember &&             // The user is not already in the room
        !isFriendOfCreator;      // The user is not a friend of the creator

    if (needsPassword) {
        const enteredPassword = password || prompt("This room is private. Please enter the password:");
        if (enteredPassword !== roomToJoin.password) {
            alert("Incorrect password.");
            if (fromUrl) window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }
    }
    
    // Add user to the room if they aren't already a member.
    // This happens after a successful password check, or if no password was needed.
    if (!isMember) {
        const updatedRooms = currentRooms.map(room => {
            if (room.id === roomId) {
                return { ...room, userIds: [...room.userIds, currentUser.id] };
            }
            return room;
        });
        saveRoomsToDB(updatedRooms);
        setRooms(updatedRooms);
    }
    
    // Navigate to the room.
    if (fromUrl) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    setNavigation({ page: 'room', roomId: roomId });
  };

  const handleLeaveRoom = () => {
    if (navigation.page === 'room' && currentUser) {
        const { roomId } = navigation;
        const updatedRooms = rooms.map(room => {
            if (room.id === roomId) {
                return {
                    ...room,
                    userIds: room.userIds.filter(id => id !== currentUser.id)
                };
            }
            return room;
        });
        saveRoomsToDB(updatedRooms);
        setRooms(updatedRooms);
    }
    setNavigation({ page: 'home' });
  };
  
  const handleNavigateToProfile = (userId: string) => {
    setNavigation({ page: 'profile', profileId: userId });
  };

  const handleNavigateToHome = () => {
    setNavigation({ page: 'home' });
  };

  const handleUpdateBio = (userId: string, newBio: string) => {
    const users = getUsersFromDB();
    const userIndex = users.findIndex((u:any) => u.email === userId);
    if (userIndex > -1) {
        users[userIndex].bio = newBio;
        saveUsersToDB(users);
        if (currentUser?.id === userId) {
            setCurrentUser(prev => prev ? {...prev, bio: newBio} : null);
        }
        alert('Bio updated!');
    }
  };

  const handleUpdateProfilePicture = (userId: string, imageBase64: string) => {
    const users = getUsersFromDB();
    const userIndex = users.findIndex((u:any) => u.email === userId);
    if (userIndex > -1) {
      users[userIndex].profilePicture = imageBase64;
      saveUsersToDB(users);
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? {...prev, profilePicture: imageBase64} : null);
      }
      alert('Profile picture updated!');
    }
  }

  const handleSendFriendRequest = (friendId: string) => {
    if (!currentUser) return;
    const users = getUsersFromDB();
    const friendIndex = users.findIndex((u:any) => u.email === friendId);
    if (friendIndex > -1) {
      if (!users[friendIndex].incomingFriendRequests) {
        users[friendIndex].incomingFriendRequests = [];
      }
      if (!users[friendIndex].incomingFriendRequests.includes(currentUser.id)) {
        users[friendIndex].incomingFriendRequests.push(currentUser.id);
        saveUsersToDB(users);
        alert('Friend request sent!');
      } else {
        alert('You have already sent a request to this user.');
      }
    }
  };

  const handleAcceptFriendRequest = (requestingUserId: string) => {
    if (!currentUser) return;
    const users = getUsersFromDB();
    const currentUserIndex = users.findIndex((u:any) => u.email === currentUser.id);
    const requestingUserIndex = users.findIndex((u:any) => u.email === requestingUserId);

    if (currentUserIndex > -1 && requestingUserIndex > -1) {
      users[currentUserIndex].incomingFriendRequests = (users[currentUserIndex].incomingFriendRequests || []).filter((id:string) => id !== requestingUserId);
      if (!users[currentUserIndex].friendIds) users[currentUserIndex].friendIds = [];
      users[currentUserIndex].friendIds.push(requestingUserId);
      
      if (!users[requestingUserIndex].friendIds) users[requestingUserIndex].friendIds = [];
      users[requestingUserIndex].friendIds.push(currentUser.id);
      
      saveUsersToDB(users);
      
      setCurrentUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          incomingFriendRequests: (prev.incomingFriendRequests || []).filter(id => id !== requestingUserId),
          friendIds: [...(prev.friendIds || []), requestingUserId],
        }
      });
      alert('Friend request accepted!');
    }
  };
  
  const handleDeclineFriendRequest = (requestingUserId: string) => {
    if (!currentUser) return;
    const users = getUsersFromDB();
    const currentUserIndex = users.findIndex((u:any) => u.email === currentUser.id);
    
    if (currentUserIndex > -1) {
      users[currentUserIndex].incomingFriendRequests = (users[currentUserIndex].incomingFriendRequests || []).filter((id:string) => id !== requestingUserId);
      saveUsersToDB(users);
      
      setCurrentUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          incomingFriendRequests: (prev.incomingFriendRequests || []).filter(id => id !== requestingUserId),
        }
      });
      alert('Friend request declined.');
    }
  };

  const handleUpdateRoomUsers = (roomId: string, newUserIds: string[]) => {
    const updatedRooms = rooms.map(r => {
        if (r.id === roomId) {
            // Use a Set to avoid duplicates when merging invited users
            const allInvited = new Set([...(r.invitedUserIds || []), ...newUserIds]);
            return { 
                ...r, 
                userIds: newUserIds,
                invitedUserIds: Array.from(allInvited),
            };
        }
        return r;
    });
    saveRoomsToDB(updatedRooms);
    setRooms(updatedRooms);
  }

  const allUsers: User[] = getUsersFromDB().map((u: any) => ({
    id: u.email, 
    name: u.name, 
    color: u.color, 
    bio: u.bio, 
    friendIds: u.friendIds,
    profilePicture: u.profilePicture,
    incomingFriendRequests: u.incomingFriendRequests,
  }));

  let content;
  switch (navigation.page) {
      case 'login':
          content = <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setNavigation({ page: 'register' })} />;
          break;
      case 'register':
          content = <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => setNavigation({ page: 'login' })} />;
          break;
      
      case 'home':
          if (!currentUser) {
            content = <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setNavigation({ page: 'register' })} />;
          } else {
            content = <HomePage 
                user={currentUser} 
                rooms={rooms}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom} 
                onLogout={handleLogout} 
                onNavigateToProfile={handleNavigateToProfile} 
              />;
          }
          break;

      case 'room':
          if (!currentUser) {
            content = <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setNavigation({ page: 'register' })} />;
          } else {
            content = <CanvasApp 
                user={currentUser} 
                roomId={navigation.roomId} 
                allUsers={allUsers}
                onLeaveRoom={handleLeaveRoom} 
                onLogout={handleLogout}
                onUpdateRoomUsers={handleUpdateRoomUsers}
            />;
          }
          break;
      
      case 'profile':
          if (!currentUser) {
            content = <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setNavigation({ page: 'register' })} />;
          } else {
            const userToView = allUsers.find(u => u.id === navigation.profileId);
            if (userToView) {
                content = <ProfilePage 
                    userToView={userToView} 
                    currentUser={currentUser}
                    allUsers={allUsers}
                    onGoBack={handleNavigateToHome}
                    onUpdateBio={handleUpdateBio}
                    onSendFriendRequest={handleSendFriendRequest}
                    onAcceptFriendRequest={handleAcceptFriendRequest}
                    onDeclineFriendRequest={handleDeclineFriendRequest}
                    onUpdateProfilePicture={handleUpdateProfilePicture}
                />;
            } else {
              // Fallback to home page if user not found
              content = <HomePage 
                  user={currentUser} 
                  rooms={rooms}
                  onCreateRoom={handleCreateRoom}
                  onJoinRoom={handleJoinRoom} 
                  onLogout={handleLogout} 
                  onNavigateToProfile={handleNavigateToProfile}
                />;
            }
          }
          break;
      
      default:
           content = <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setNavigation({ page: 'register' })} />;
           break;
  }

  return (
    <div className="bg-amber-50 min-h-screen text-slate-800 font-['Nunito']">
      {content}
    </div>
  );
};

export default App;