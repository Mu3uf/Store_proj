import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Trash2,
  Edit3,
  PackageCheck,
  X,
  Upload,
  CheckCircle2
} from 'lucide-react';

const API_URL = 'https://store-proj.onrender.com';

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // المنتجات القادمة من قاعدة البيانات
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    price_per_kg: '',
    image_url: '',
    available_sizes: []
  });

  // === طلبات العملاء ===
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // =========================================================
  // جلب المنتجات من Database
  // =========================================================

  useEffect(() => {
    fetchItems();
    fetchOrders();
  }, []);

  const fetchItems = async () => {
    try {
      setLoadingItems(true);

      const res = await axios.get(`${API_URL}/items`);

      console.log('ITEMS FROM DATABASE:', res.data);

      setItems(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.error(
        'فشل تحميل المنتجات:',
        err?.response?.data || err.message
      );

      alert('فشل تحميل المنتجات من قاعدة البيانات');
    } finally {
      setLoadingItems(false);
    }
  };

  // =========================================================
  // جلب الطلبات
  // =========================================================

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      const res = await axios.get(`${API_URL}/admin/orders`);

      setOrders(res.data);

    } catch (err) {
      console.error(
        'فشل تحميل الطلبات:',
        err?.response?.data || err.message
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  // =========================================================
  // إنهاء الطلب
  // =========================================================

  const handleCompleteOrder = async (orderId) => {
    try {
      await axios.put(
        `${API_URL}/admin/orders/${orderId}/complete`
      );

      setOrders(prev =>
        prev.map(o =>
          o.order_id === orderId
            ? { ...o, status: 'تم التسليم' }
            : o
        )
      );

    } catch (err) {
      console.error(
        'COMPLETE ORDER ERROR:',
        err?.response?.data || err.message
      );

      alert('حدث خطأ أثناء إنهاء الطلب، حاول مرة أخرى');
    }
  };

  // =========================================================
  // رفع صورة من الجهاز
  // =========================================================

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image_url: reader.result
      }));
    };

    reader.readAsDataURL(file);
  };

  // =========================================================
  // فتح Modal
  // =========================================================

  const handleOpenModal = (item = null) => {

    if (item) {

      setEditingItem(item);

      setFormData({
        name: item.name || '',
        category_id: item.category_id || 1,
        price_per_kg: item.price_per_kg ?? '',
        image_url: item.image_url || '',
        available_sizes: item.available_sizes || []
      });

    } else {

      setEditingItem(null);

      setFormData({
        name: '',
        category_id: 1,
        price_per_kg: '',
        image_url: '',
        available_sizes: []
      });
    }

    setIsModalOpen(true);
  };

  // =========================================================
  // إغلاق Modal
  // =========================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);

    setFormData({
      name: '',
      category_id: 1,
      price_per_kg: '',
      image_url: '',
      available_sizes: []
    });
  };

  // =========================================================
  // إضافة / تعديل المنتج
  // =========================================================

  const handleSaveItem = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم الصنف');
      return;
    }

    if (
      formData.price_per_kg === '' ||
      Number(formData.price_per_kg) <= 0
    ) {
      alert('يرجى إدخال سعر صحيح');
      return;
    }

    try {

      // =====================================================
      // تعديل منتج موجود
      // =====================================================

      if (editingItem) {

        const response = await axios.put(
          `${API_URL}/admin/items/${editingItem.id}`,
          {
            category_id: Number(formData.category_id),
            name: formData.name.trim(),
            image_url:
              formData.image_url ||
              'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400',
            price_per_kg: Number(formData.price_per_kg),
            available_sizes: formData.available_sizes || []
          }
        );

        console.log(
          'UPDATED ITEM:',
          response.data
        );

        const updatedItem = response.data.item;

        setItems(prev =>
          prev.map(item =>
            item.id === editingItem.id
              ? updatedItem
              : item
          )
        );

        alert('تم تعديل الصنف وحفظ التعديل في قاعدة البيانات');

      }

      // =====================================================
      // إضافة منتج جديد
      // =====================================================

      else {

        const response = await axios.post(
          `${API_URL}/admin/items`,
          {
            category_id: Number(formData.category_id),
            name: formData.name.trim(),
            image_url:
              formData.image_url ||
              'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400',
            price_per_kg: Number(formData.price_per_kg),
            available_sizes: formData.available_sizes || []
          }
        );

        console.log(
          'NEW ITEM SAVED:',
          response.data
        );

        const savedItem = response.data.item;

        // نضيف المنتج الذي رجع من DB
        // حتى يكون معه ID الحقيقي
        setItems(prev => [
          ...prev,
          savedItem
        ]);

        alert('تمت إضافة الصنف وحفظه في قاعدة البيانات');

      }

      handleCloseModal();

    } catch (err) {

      console.error(
        'SAVE ITEM ERROR:',
        err?.response?.data || err.message
      );

      alert(
        err?.response?.data?.detail ||
        'فشل حفظ الصنف في قاعدة البيانات'
      );
    }
  };

  // =========================================================
  // حذف منتج
  // =========================================================

  const handleDeleteItem = async (id) => {

    const confirmed = window.confirm(
      'هل أنت متأكد أنك تريد حذف هذا الصنف؟'
    );

    if (!confirmed) return;

    try {

      await axios.delete(
        `${API_URL}/admin/items/${id}`
      );

      // نحذف من الواجهة بعد نجاح الحذف من DB
      setItems(prev =>
        prev.filter(item => item.id !== id)
      );

      alert('تم حذف الصنف من قاعدة البيانات');

    } catch (err) {

      console.error(
        'DELETE ITEM ERROR:',
        err?.response?.data || err.message
      );

      alert(
        err?.response?.data?.detail ||
        'فشل حذف الصنف من قاعدة البيانات'
      );
    }
  };

  // =========================================================
  // اسم القسم
  // =========================================================

  const getCategoryName = (categoryId) => {
    if (Number(categoryId) === 1) {
      return 'بقوليات';
    }

    if (Number(categoryId) === 2) {
      return 'بهارات';
    }

    return 'غير محدد';
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-100 p-6 font-sans text-slate-800"
    >

      <div className="container mx-auto">

        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <div className="flex justify-between items-center mb-8 border-b pb-4">

          <h1 className="text-3xl font-black text-slate-800">
            لوحة تحكم الأدمن (صاحب المحل)
          </h1>

          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition"
          >
            <Plus className="w-5 h-5" />
            إضافة صنف جديد
          </button>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ================================================= */}
          {/* قسم الطلبات */}
          {/* ================================================= */}

          <div className="lg:col-span-1">

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
              <PackageCheck className="text-emerald-600" />
              طلبات العملاء
            </h2>

            {loadingOrders && (
              <p className="text-sm text-slate-500">
                جارِ تحميل الطلبات...
              </p>
            )}

            {!loadingOrders && orders.length === 0 && (
              <p className="text-sm text-slate-500 bg-white p-4 rounded-xl border">
                لا يوجد طلبات حالياً.
              </p>
            )}

            {orders.map((order) => {

              const isCompleted =
                order.status === 'مكتمل' ||
                order.status === 'تم التسليم';

              return (

                <div
                  key={order.order_id}
                  className={`bg-white border-r-4 ${
                    isCompleted
                      ? 'border-emerald-500'
                      : 'border-amber-500'
                  } p-5 rounded-2xl shadow-sm mb-4`}
                >

                  <div className="flex justify-between items-start border-b pb-2 mb-3">

                    <div>

                      <h3 className="font-bold text-lg text-slate-800">
                        {order.shop_name}
                      </h3>

                      <p className="text-xs text-slate-500">
                        العميل: {order.username}
                        {' | '}
                        هاتف: {order.phone}
                      </p>

                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>

                  </div>

                  <div className="text-sm text-slate-600 mb-3 space-y-1">

                    {Array.isArray(order.items) &&
                    order.items.length > 0 ? (

                      order.items.map((it, idx) => (

                        <p key={idx}>

                          • {it.name || it.item_name || 'صنف'}

                          {it.size
                            ? ` (${it.size} كيلو)`
                            : ''}

                          {it.qty
                            ? ` × ${it.qty}`
                            : ''}

                        </p>

                      ))

                    ) : (

                      <p className="text-xs text-slate-400">
                        لا توجد تفاصيل أصناف
                      </p>

                    )}

                  </div>

                  <div className="flex justify-between items-center font-bold pt-2 border-t text-sm mb-3">

                    <span>
                      المجموع:
                    </span>

                    <span className="text-emerald-600 text-base">
                      {Number(order.total_price || 0).toFixed(2)} د.أ
                    </span>

                  </div>

                  {isCompleted ? (

                    <div className="w-full bg-emerald-50 text-emerald-700 font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-sm">

                      <CheckCircle2 className="w-4 h-4" />

                      تم إنهاء الطلب

                    </div>

                  ) : (

                    <button
                      onClick={() =>
                        handleCompleteOrder(order.order_id)
                      }
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-sm cursor-pointer transition"
                    >

                      <CheckCircle2 className="w-4 h-4" />

                      إنهاء الطلب

                    </button>

                  )}

                </div>

              );
            })}

          </div>

          {/* ================================================= */}
          {/* المنتجات */}
          {/* ================================================= */}

          <div className="lg:col-span-2">

            <h2 className="text-xl font-bold text-slate-700 mb-4">
              عرض المنتجات والأصناف المتوفرة
            </h2>

            {loadingItems && (

              <div className="bg-white rounded-xl p-6 text-center text-slate-500">
                جارِ تحميل المنتجات من قاعدة البيانات...
              </div>

            )}

            {!loadingItems && items.length === 0 && (

              <div className="bg-white rounded-xl p-6 text-center text-slate-500 border">
                لا توجد منتجات محفوظة في قاعدة البيانات.
              </div>

            )}

            {!loadingItems && items.length > 0 && (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {items.map((item) => (

                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between relative"
                  >

                    {/* Buttons */}

                    <div className="absolute top-3 left-3 z-10 flex gap-2">

                      <button
                        onClick={() =>
                          handleOpenModal(item)
                        }
                        className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-xl shadow cursor-pointer transition"
                      >

                        <Edit3 className="w-4 h-4 text-blue-600" />

                      </button>

                      <button
                        onClick={() =>
                          handleDeleteItem(item.id)
                        }
                        className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-xl shadow cursor-pointer transition"
                      >

                        <Trash2 className="w-4 h-4 text-red-600" />

                      </button>

                    </div>

                    {/* Image */}

                    <img
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400'
                      }
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />

                    {/* Info */}

                    <div className="p-4 flex-1 flex flex-col justify-between">

                      <div>

                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          {item.name}
                        </h3>

                        <p className="text-xs text-slate-500 mb-3">
                          القسم:{' '}
                          {getCategoryName(item.category_id)}
                        </p>

                      </div>

                      <div className="pt-3 border-t flex justify-between items-center">

                        <span className="text-xs text-slate-500">
                          سعر الكيلو:
                        </span>

                        <span className="text-lg font-black text-emerald-700">

                          {Number(
                            item.price_per_kg || 0
                          ).toFixed(2)}

                          {' '}د.أ

                        </span>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* Modal */}
      {/* ================================================= */}

      {isModalOpen && (

        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">

          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
            dir="rtl"
          >

            <div className="flex justify-between items-center mb-4 border-b pb-2">

              <h3 className="text-lg font-bold text-slate-800">

                {editingItem
                  ? 'تعديل صنف'
                  : 'إضافة صنف جديد'}

              </h3>

              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >

                <X className="w-5 h-5" />

              </button>

            </div>

            <form
              onSubmit={handleSaveItem}
              className="space-y-4"
            >

              {/* اسم الصنف */}

              <div>

                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  اسم الصنف
                </label>

                <input
                  type="text"
                  required
                  dir="rtl"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-emerald-500 text-right font-sans"
                  placeholder="مثال: حمص حب"
                />

              </div>

              {/* القسم */}

              <div>

                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  القسم
                </label>

                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id: parseInt(
                        e.target.value
                      )
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-emerald-500"
                >

                  <option value={1}>
                    قسم البقوليات
                  </option>

                  <option value={2}>
                    قسم البهارات
                  </option>

                </select>

              </div>

              {/* السعر */}

              <div>

                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  السعر للكيلو (د.أ)
                </label>

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={formData.price_per_kg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price_per_kg: e.target.value
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-emerald-500"
                  placeholder="مثال: 2.5"
                />

              </div>

              {/* الصورة */}

              <div>

                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  صورة المنتج من الجهاز
                </label>

                <div className="flex items-center gap-2">

                  <label className="w-full border border-dashed border-emerald-500 bg-emerald-50 hover:bg-emerald-100 p-3 rounded-xl text-center cursor-pointer flex justify-center items-center gap-2 text-emerald-700 text-sm font-bold transition">

                    <Upload className="w-4 h-4" />

                    اختر صورة من جهازك

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                  </label>

                </div>

                {formData.image_url && (

                  <img
                    src={formData.image_url}
                    alt="معاينة"
                    className="mt-2 w-full h-24 object-cover rounded-lg border"
                  />

                )}

              </div>

              {/* Submit */}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >

                {editingItem
                  ? 'حفظ التعديل'
                  : 'إضافة الصنف'}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}