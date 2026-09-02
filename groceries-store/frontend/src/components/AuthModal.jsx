import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    shop_name: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('كلمات السر غير متطابقة!');
      return;
    }
    // تسجيل دخول تجريبي
    onLoginSuccess({
      username: formData.username || 'عميل تجريبي',
      shop_name: formData.shop_name || 'محل البركة'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50" dir="rtl">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-4 text-center text-slate-800">
          {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">اسم المحل *</label>
                <input required type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, shop_name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">رقم الهاتف *</label>
                <input required type="tel" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">اسم المستخدم أو رقم الهاتف *</label>
            <input required type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">كلمة السر *</label>
            <input required type="password" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">تأكيد كلمة السر *</label>
              <input required type="password" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>
          )}

          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl mt-2 hover:bg-emerald-700 transition cursor-pointer">
            {isLogin ? 'دخول' : 'إنشاء حساب'}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-sm text-emerald-600 mt-4 underline cursor-pointer">
          {isLogin ? 'حساب جديد؟ سجل هنا' : 'لديك حساب بالفعل؟ سجل الدخول'}
        </button>

        <button onClick={onClose} className="absolute top-4 left-4 font-bold text-slate-400 hover:text-slate-600">✕</button>
      </div>
    </div>
  );
}