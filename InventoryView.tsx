
import React, { useState } from 'react';
import { Product } from '../types';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (p: Product) => void;
  onBack: () => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, onAddProduct, onBack }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const handleSave = () => {
    if (!name || !price) return;
    onAddProduct({
      id: Math.random().toString(36).substr(2, 9),
      name,
      price: parseFloat(price),
      quantity: parseFloat(qty) || 0,
      category: 'عام',
    });
    setName(''); setPrice(''); setQty('');
    setShowAdd(false);
  };

  return (
    <div className="p-4 pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="bg-[#1a2b3c] p-3 rounded-xl"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
          <h2 className="text-xl font-black">المخازن</h2>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-blue-700 p-3 rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all">إضافة صنف</button>
      </div>

      <div className="bg-[#141d26] p-5 rounded-2xl border border-blue-900/20 mb-6 shadow-2xl">
         <p className="text-[10px] text-gray-500 font-black mb-1">إجمالي قيمة المخزون</p>
         <p className="text-2xl font-black text-white">{totalValue.toLocaleString()} <span className="text-xs font-normal">ري</span></p>
      </div>

      {showAdd && (
        <div className="bg-[#1e2a38] p-5 rounded-2xl mb-6 border border-blue-500/30 animate-in slide-in-from-top duration-300">
          <h3 className="font-black mb-4 text-center">بيانات الصنف الجديد</h3>
          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0c0c0c] border border-gray-700 p-3 rounded-lg outline-none text-center font-bold" placeholder="اسم الصنف" />
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#0c0c0c] border border-gray-700 p-3 rounded-lg outline-none text-center font-bold" placeholder="سعر البيع" />
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-[#0c0c0c] border border-gray-700 p-3 rounded-lg outline-none text-center font-bold" placeholder="الكمية الافتتاحية" />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-grow bg-blue-700 py-3 rounded-lg font-black text-white active:bg-blue-600 transition-colors">حفظ</button>
              <button onClick={() => setShowAdd(false)} className="px-6 bg-gray-800 rounded-lg text-white font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {products.length === 0 ? (
          <div className="text-center py-20 grayscale opacity-20"><span className="text-6xl">📦</span><p className="mt-4 font-black">المخزن فارغ حالياً</p></div>
        ) : (
          products.map(p => (
            <div key={p.id} className="bg-[#141d26] p-4 rounded-xl border border-white/5 shadow-xl flex justify-between items-center group relative overflow-hidden transition-all hover:bg-[#1a2b3c]">
              <div className="flex flex-col">
                <span className="text-sm font-black">{p.name}</span>
                <span className="text-[10px] text-gray-500 font-bold">الكمية: {p.quantity} | القيمة: {(p.price * p.quantity).toLocaleString()}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-green-500">{p.price.toLocaleString()} <span className="text-[10px] text-gray-400">ري</span></p>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryView;
