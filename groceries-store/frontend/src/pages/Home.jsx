import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import axios from 'axios';
import { ShoppingCart, X, Trash2, CheckCircle2 } from 'lucide-react';

const API_URL = 'https://store-proj.onrender.com';

export default function Home({ user, onOpenAuth, onLogout }) {
  const [activeTab, setActiveTab] = useState(1);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const [items] = useState([
    {
      id: 1,
      category_id: 1,
      name: 'عدس حب',
      price_per_kg: 1.5,
      available_sizes: [1, 2, 5],
      image_url:
        'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400'
    },
    {
      id: 2,
      category_id: 1,
      name: 'حمص حب',
      price_per_kg: 2.0,
      available_sizes: [1, 2, 5, 10],
      image_url:
        'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400'
    },
    {
      id: 3,
      category_id: 2,
      name: 'فلفل أسود مطحون',
      price_per_kg: 4.5,
      available_sizes: [0.5, 1, 2],
      image_url:
        'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400'
    },
    {
      id: 4,
      category_id: 2,
      name: 'كمون مطحون',
      price_per_kg: 3.8,
      available_sizes: [0.5, 1, 2],
      image_url:
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400'
    }
  ]);

  const handleOrder = (item, size, qty, totalPrice) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setCart([
      ...cart,
      {
        cartId: Date.now(),
        ...item,
        size,
        qty,
        totalPrice
      }
    ]);

    setNotification('تمت إضافة المنتج إلى السلة بنجاح!');

    setTimeout(() => setNotification(''), 4000);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  // =====================================================
  // إرسال الطلب إلى الباك إند
  // =====================================================
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // مهم جداً:
    // لا نرسل الطلب إذا لم يكن هناك user_id حقيقي
    if (!user || !user.user_id) {
      alert('يجب تسجيل الدخول أولاً لإرسال الطلب.');
      return;
    }

    try {
      setLoadingCheckout(true);

      const totalOrderPrice = cart.reduce(
        (sum, item) => sum + (item?.totalPrice || 0),
        0
      );

      const cleanItems = cart.map(item => ({
        name: item.name,
        size: item.size,
        qty: item.qty,
        totalPrice: item.totalPrice
      }));

      // للتأكد من أن المستخدم الصحيح هو الذي يرسل الطلب
      console.log('USER DATA:', user);
      console.log('USER ID:', user.user_id);

      await axios.post(`${API_URL}/orders`, {
        user_id: user.user_id,
        items_details: cleanItems,
        total_price: totalOrderPrice
      });

      alert('تم إرسال طلبك بنجاح إلى متجر بهاراتي!');

      setCart([]);
      setIsCartOpen(false);

    } catch (err) {
      console.error(
        'خطأ في إرسال الطلب:',
        err?.response?.data || err.message
      );

      alert(
        err?.response?.data?.detail ||
        'فشل إرسال الطلب، تأكد من اتصالك بالسيرفر.'
      );

    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-100 font-sans text-slate-800"
    >

      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center px-6">

        <h1 className="text-xl font-black text-emerald-700">
          بهاراتي | Baharati
        </h1>

        <div className="flex items-center gap-4">

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition font-bold text-sm"
          >
            <ShoppingCart className="w-5 h-5" />

            <span>السلة</span>

            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">

              <span className="text-sm font-bold text-slate-700">
                مرحباً، {user.username}
              </span>

              <button
                onClick={onLogout}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                تسجيل الخروج
              </button>

            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition"
            >
              تسجيل الدخول
            </button>
          )}

        </div>
      </nav>

      {/* Notification */}
      {notification && (
        <div className="bg-emerald-600 text-white text-center py-3 font-bold shadow-md">
          {notification}
        </div>
      )}

      <main className="container mx-auto p-6">

        {/* Categories */}
        <div className="flex justify-center gap-4 mb-8">

          <button
            onClick={() => setActiveTab(1)}
            className={`px-8 py-3 rounded-xl font-bold transition shadow-sm cursor-pointer ${
              activeTab === 1
                ? 'bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            قسم البقوليات
          </button>

          <button
            onClick={() => setActiveTab(2)}
            className={`px-8 py-3 rounded-xl font-bold transition shadow-sm cursor-pointer ${
              activeTab === 2
                ? 'bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            قسم البهارات
          </button>

        </div>

        {/* Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {items
            .filter(i => i.category_id === activeTab)
            .map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onOrder={handleOrder}
              />
            ))}

        </div>

      </main>

      {/* Shopping Cart */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">

          <div
            className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between"
            dir="rtl"
          >

            <div>

              <div className="flex justify-between items-center border-b pb-4 mb-4">

                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  سلة المشتريات
                </h2>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>

              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-3">

                {cart.length === 0 ? (

                  <p className="text-sm text-slate-500 text-center py-10">
                    السلة فارغة حالياً.
                  </p>

                ) : (

                  cart.map((item, index) => (

                    <div
                      key={item.cartId || index}
                      className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border"
                    >

                      <div>

                        <h4 className="font-bold text-sm text-slate-800">
                          {item?.name || 'منتج'}
                        </h4>

                        <p className="text-xs text-slate-500">
                          الكمية: {item?.qty || 1} |
                          الحجم: {item?.size || '-'} كيلو
                        </p>

                        <p className="text-xs font-bold text-emerald-600 mt-1">
                          {item?.totalPrice
                            ? item.totalPrice.toFixed(2)
                            : '0.00'}{' '}
                          د.أ
                        </p>

                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-red-500 hover:text-red-700 p-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  ))
                )}

              </div>

            </div>

            {cart.length > 0 && (

              <div className="border-t pt-4 space-y-4">

                <div className="flex justify-between font-bold text-base">

                  <span>المجموع الكلي:</span>

                  <span className="text-emerald-700">

                    {cart
                      .reduce(
                        (sum, item) =>
                          sum + (item?.totalPrice || 0),
                        0
                      )
                      .toFixed(2)}{' '}
                    د.أ

                  </span>

                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loadingCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                >

                  <CheckCircle2 className="w-5 h-5" />

                  {loadingCheckout
                    ? 'جارِ إرسال الطلب...'
                    : 'إتمام الطلب وإرساله'}

                </button>

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
}