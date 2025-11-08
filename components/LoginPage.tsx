import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="flex items-center justify-center h-screen">
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 opacity-30"></div>
      <div className="w-full max-w-sm p-8 space-y-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl z-10">
        <div className="text-center">
            <h2 className="text-4xl font-black text-gray-800">Welcome Back!</h2>
            <p className="mt-2 text-gray-600">Let's get drawing!</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
            />
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-white bg-pink-500 rounded-xl hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transform hover:scale-105 transition-transform duration-200"
            >
              Let's Go!
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          New here?{' '}
          <button onClick={onNavigateToRegister} className="font-bold text-pink-600 hover:text-pink-500">
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
};