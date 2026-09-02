import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import AuthModal from '../components/AuthModal';

export default function Home({ user, onOpenAuth, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState(1);
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState('');

  const [items] = useState([
    { id: 1, category_id: 1, name: 'عدس حب', price_per_kg: 1.5, available_sizes: [1, 2, 5], image_url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400' },
    { id: 2, category_id: 1, name: 'حمص حب', price_per_kg: 2.0, available_sizes: [1, 2, 5, 10], image_url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400' },
    { id: 3, category_id: 2, name: 'فلفل أسود مطحون', price_per_kg: 4.5, available_sizes: [0.5, 1, 2], image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400' },
    { id: 4, category_id: 2, name: 'كمون مطحون', price_per_kg: 3.8, available_sizes: [0.5, 1, 2], image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400' }
  ]);

  const handleOrder = (item, size, qty, totalPrice) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setCart([...cart, { ...item, size, qty, totalPrice }]);
    setNotification('تم إرسال طلبك بنجاح! طلبك في السلة');
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Navbar 
        user={user} 
        cartCount={cart.length} 
        onOpenAuth={onOpenAuth} 
      />

      {notification && (
        <div className="bg-emerald-600 text-white text-center py-3 font-bold shadow-md animate-bounce">
          {notification}
        </div>
      )}

      <main className="container mx-auto p-6">
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab(1)}
            className={`px-8 py-3 rounded-xl font-bold transition shadow-sm cursor-pointer ${activeTab === 1 ? 'bg-emerald-700 text-white shadow-emerald-200' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            قسم البقوليات
          </button>
          <button 
            onClick={() => setActiveTab(2)}
            className={`px-8 py-3 rounded-xl font-bold transition shadow-sm cursor-pointer ${activeTab === 2 ? 'bg-emerald-700 text-white shadow-emerald-200' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            قسم البهارات
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.filter(i => i.category_id === activeTab).map((item) => (
            <ItemCard key={item.id} item={item} onOrder={handleOrder} />
          ))}
        </div>
      </main>
    </div>
  );
}