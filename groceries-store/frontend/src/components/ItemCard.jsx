import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ItemCard({ item, onOrder }) {
  const [selectedSize, setSelectedSize] = useState(item.available_sizes ? item.available_sizes[0] : 1);
  const [qty, setQty] = useState(''); // جعل خانة الحبات فارغة تماماً
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleOrderClick = () => {
    // فحص تسجيل الدخول والتوجيه لصفحة الدخول إن لم يكن مسجلاً
    const userToken = localStorage.getItem('user_id') || localStorage.getItem('token');
    if (!userToken) {
      navigate('/login');
      return;
    }

    // التحقق من أن عدد الحبات مدخل وغير فارغ (Required)
    if (!qty || qty <= 0) {
      alert('الرجاء إدخال عدد الحبات المطلوبة');
      return;
    }

    const totalPrice = (item.price_per_kg * selectedSize * Number(qty)).toFixed(2);

    // إرسال الطلب
    onOrder(item, selectedSize, Number(qty), totalPrice);

    // إظهار أنيميشن منتصف الشاشة الجميل
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const totalPriceDisplay = qty ? (item.price_per_kg * selectedSize * Number(qty)).toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 hover:shadow-xl transition flex flex-col justify-between relative">
      
      {/* أنيميشن رسالة منتصف الشاشة */}
      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
          <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl text-center transform animate-bounce border border-green-100">
            <div className="text-green-500 text-5xl mb-3">🛍️</div>
            <h3 className="text-xl font-extrabold text-slate-800">تم ارسال طلبك للسلة بنجاح!</h3>
            <p className="text-xs text-slate-500 mt-1">يمكنك متابعة التسوق أو مراجعة السلة</p>
          </div>
        </div>
      )}

      <div>
        <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
        <div className="p-5">
          <h3 className="text-xl font-bold mb-4 text-slate-800">{item.name}</h3>

          <div className="space-y-4">
            {/* تصميم عصري لاختيار الكيلوهات بدلاً من المربع الأسود */}
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-2">اختر الوزن:</label>
              <div className="flex gap-2">
                {(item.available_sizes || [1, 2, 5]).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      selectedSize === s
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s} كيلو
                  </button>
                ))}
              </div>
            </div>

            {/* حقل عدد الحبات فارغ ويطلب الإدخال */}
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">الكمية (عدد الحبات): *</label>
              <input 
                type="number" 
                min="1" 
                required
                value={qty}
                placeholder="أدخل عدد الحبات هنا..."
                onChange={(e) => setQty(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 text-sm focus:outline-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block">السعر الإجمالي</span>
            <span className="text-2xl font-black text-emerald-600">{totalPriceDisplay} د.أ</span>
          </div>
          <button 
            type="button"
            onClick={handleOrderClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            طلب
          </button>
        </div>
      </div>
    </div>
  );
}