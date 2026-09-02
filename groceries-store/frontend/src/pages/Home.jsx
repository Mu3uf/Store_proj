import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import { Trash2, X, ShoppingBag } from 'lucide-react';

const API_URL = 'https://store-proj.onrender.com';

export default function Home({ user, onOpenAuth, onLogout }) {
  const [activeTab, setActiveTab] = useState(1);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`);
      // إذا لم تكن هناك أصناف بالدेटा بيس، نضع افتراضية مؤقتة
      if (res.data.length > 0) {
        setItems(res.data);
      } else {
        setItems([
          { id: 1, category_id: 1, name: 'عدس حب', price_per_kg: 1.5, available_sizes: [1, 2, 5], image_url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400' },
          { id: 2, category_id: 2, name: 'فلفل أسود مطحون', price_per_kg: 4.5, available_sizes: [0.5, 1, 2], image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400' }
        ]);
      }
    } catch (err) {
      console.error('فشل جلب المنتجات', err);
    }
  };

  const handleOrder = (item, size, qty, totalPrice) => {
    setCart([...cart, { ...item, size, qty, totalPrice: parseFloat(totalPrice) }]);
    setNotification('تمت إضافة المنتج إلى السلة بنجاح');
    setTimeout(() => setNotification(''), 3000);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2);

  const handleCheckout = async () => {
    if (!user) {
      setIsCartOpen(false);
      onOpenAuth();
      return;
    }
    if (cart.length === 0) return;

    try {
      await axios.post(`${API_URL}/orders`, {
        user_id: user.user_id,
        items_details: cart,
        total_price: parseFloat(totalCartPrice)
      });
      alert('تم إرسال طلبك بنجاح!');
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إرسال الطلب');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Navbar 
        user={user} 
        cartCount={cart.length} 
        onOpenAuth={onOpenAuth} 
        onOpenCart={() => setIsCartOpen(true)}
        onLogout={onLogout}
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

      {/* نافذة السلة الجانبية أو المنبثقة */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between" dir="rtl">
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="text-emerald-600" /> سلة المشتريات
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-slate-500 text-center py-10">السلة فارغة حالياً</p>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border">
                      <div>
                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                        <p className="text-xs text-slate-500">{item.size} كيلو × {item.qty} حبة</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-600">{item.totalPrice} د.أ</span>
                        <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:text-red-700 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>المجموع الإجمالي:</span>
                  <span className="text-emerald-600">{totalCartPrice} د.أ</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition cursor-pointer"
                >
                  إتمام الطلب وإرساله
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}