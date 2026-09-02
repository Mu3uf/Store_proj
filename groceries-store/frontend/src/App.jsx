import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AuthModal from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('baharati_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLoginSuccess = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('baharati_user', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('baharati_user');
  };

  if (user && user.role === 'admin') {
    return (
      <div>
        <div className="bg-slate-800 text-white p-3 flex justify-between items-center px-6" dir="rtl">
          <span className="text-sm font-bold">مرحباً بالأدمن ({user.username})</span>
          <button 
            onClick={handleLogout} 
            className="bg-red-600 hover:bg-red-700 text-xs text-white px-3 py-1 rounded-lg cursor-pointer"
          >
            تسجيل الخروج
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <>
      <Home 
        user={user} 
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}