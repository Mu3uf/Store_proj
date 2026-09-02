import React, { useState } from 'react';
import { Plus, Trash2, Edit3, PackageCheck, X, Upload } from 'lucide-react';

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [items, setItems] = useState([
    { id: 1, category_id: 1, name: 'عدس حب', price_per_kg: 1.5, image_url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400' },
    { id: 2, category_id: 1, name: 'حمص حب', price_per_kg: 2.0, image_url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400' }
  ]);

  const [formData, setFormData] = useState({ name: '', category_id: 1, price_per_kg: '', image_url: '' });

  // معالجة رفع الملفات من جهاز الكمبيوتر
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, category_id: item.category_id, price_per_kg: item.price_per_kg, image_url: item.image_url });
    } else {
      setEditingItem(null);
      setFormData({ name: '', category_id: 1, price_per_kg: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price_per_kg) return;

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...formData, price_per_kg: parseFloat(formData.price_per_kg) } : i));
    } else {
      setItems([...items, {
        id: Date.now(),
        ...formData,
        price_per_kg: parseFloat(formData.price_per_kg),
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400'
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 p-6 font-sans text-slate-800">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-black text-slate-800">لوحة تحكم الأدمن (صاحب المحل)</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition"
          >
            <Plus className="w-5 h-5" /> إضافة صنف جديد
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* قسم الطلبات */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
              <PackageCheck className="text-emerald-600" /> طلبات العملاء
            </h2>
            <div className="bg-white border-r-4 border-amber-500 p-5 rounded-2xl shadow-sm mb-4">
              <div className="flex justify-between items-start border-b pb-2 mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">محل السعادة</h3>
                  <p className="text-xs text-slate-500">العميل: أحمد | هاتف: 0791234567</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">قيد الانتظار</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">• عدس حب (2 كيلو) × 3 حبة</p>
              <div className="flex justify-between items-center font-bold pt-2 border-t text-sm">
                <span>المجموع:</span>
                <span className="text-emerald-600 text-base">18.5 د.أ</span>
              </div>
            </div>
          </div>

          {/* عرض المنتجات مثل العميل */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-700 mb-4">عرض المنتجات والأصناف المتوفرة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between relative">
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-xl shadow cursor-pointer transition"
                    >
                      <Edit3 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-xl shadow cursor-pointer transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />
                  
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{item.name}</h3>
                      <p className="text-xs text-slate-500 mb-3">القسم: {item.category_id === 1 ? 'بقوليات' : 'بهارات'}</p>
                    </div>

                    <div className="pt-3 border-t flex justify-between items-center">
                      <span className="text-xs text-slate-500">سعر الكيلو:</span>
                      <span className="text-lg font-black text-emerald-700">{item.price_per_kg.toFixed(2)} د.أ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* مودال الإضافة والتعديل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative" dir="rtl">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-slate-800">{editingItem ? 'تعديل صنف' : 'إضافة صنف جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">اسم الصنف</label>
                <input 
                  type="text" 
                  required
                  dir="rtl"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-emerald-500 text-right font-sans" 
                  placeholder="مثال: حمص حب"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">القسم</label>
                <select 
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-emerald-500"
                >
                  <option value={1}>قسم البقوليات</option>
                  <option value={2}>قسم البهارات</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">السعر للكيلو (د.أ)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={formData.price_per_kg}
                  onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-emerald-500" 
                  placeholder="مثال: 2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">صورة المنتج من الجهاز</label>
                <div className="flex items-center gap-2">
                  <label className="w-full border border-dashed border-emerald-500 bg-emerald-50 hover:bg-emerald-100 p-3 rounded-xl text-center cursor-pointer flex justify-center items-center gap-2 text-emerald-700 text-sm font-bold transition">
                    <Upload className="w-4 h-4" /> اختر صورة من جهازك
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {formData.image_url && (
                  <img src={formData.image_url} alt="معاينة" className="mt-2 w-full h-24 object-cover rounded-lg border" />
                )}
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                {editingItem ? 'حفظ التعديل' : 'إضافة الصنف'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}