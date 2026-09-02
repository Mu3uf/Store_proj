import React from 'react';
import { ShoppingBag, LogIn, UserCheck } from 'lucide-react';

export default function Navbar({ user, cartCount, onOpenAuth, onOpenCart, onLogout }) {
  return (
    <nav className="bg-emerald-800 text-white p-4 shadow-lg sticky top-0 z-50" dir="rtl">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-wide">بهاراتي</h1>
        <div className="flex items-center gap-5">
          <div className="relative cursor-pointer flex items-center gap-1 bg-emerald-700 px-3 py-2 rounded-xl hover:bg-emerald-600 transition" onClick={onOpenCart}>
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-bold">السلة</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold flex items-center gap-1">
                <UserCheck className="w-4 h-4" /> {user.shop_name || user.username}
              </span>
              <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition">
                خروج
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="bg-white text-emerald-800 hover:bg-slate-100 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm cursor-pointer transition">
              <LogIn className="w-4 h-4" /> دخول / تسجيل
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}