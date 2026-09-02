import React, { useState } from 'react';

export default function ItemCard({ item, onOrder }) {
  const [selectedSize, setSelectedSize] = useState(item.available_sizes[0]);
  const [qty, setQty] = useState(1);

  const totalPrice = (item.price_per_kg * selectedSize * qty).toFixed(2);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 hover:shadow-xl transition flex flex-col justify-between">
      <div>
        <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
        <div className="p-5">
          <h3 className="text-xl font-bold mb-4">{item.name}</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">الحجم المتوفر:</label>
              <select 
                value={selectedSize}
                onChange={(e) => setSelectedSize(parseFloat(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-sm focus:outline-emerald-500"
              >
                {item.available_sizes.map(s => (
                  <option key={s} value={s}>{s} كيلو</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">الكمية (عدد الحبات):</label>
              <input 
                type="number" 
                min="1" 
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-sm focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block">السعر الإجمالي</span>
            <span className="text-2xl font-black text-emerald-600">{totalPrice} د.أ</span>
          </div>
          <button 
            onClick={() => onOrder(item, selectedSize, qty, totalPrice)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            طلب
          </button>
        </div>
      </div>
    </div>
  );
}