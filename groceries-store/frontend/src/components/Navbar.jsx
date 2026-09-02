import React from 'react';
import { ShoppingBag, LogIn, UserCheck } from 'lucide-react';

export default function Navbar({ user, cartCount, onOpenAuth, onOpenCart }) {
  return (
    <nav className="bg-emerald-800 text-white p-4 shadow-lg sticky top-0 z-50" dir="rtl">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-wide">متجر الجملة (بقوليات وبهارات)</h1>
        <div className="flex items-center gap-5">
          <div className="relative cursor-pointer" onClick={onOpenCart}>
            <ShoppingBag className="w-7 h-7" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </div>
          {user ? (
            <div className="flex items-center gap-2 bg-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-700">
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-medium">{user.username} ({user.shop_name})</span>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth} 
              className="flex items-center gap-1.5 bg-white text-emerald-800 font-bold px-4 py-2 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}