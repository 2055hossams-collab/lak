
import React, { useState } from 'react';
import { Account, Product, Order } from '../types';

interface OrdersViewProps {
  type: 'order' | 'quote';
  orders: Order[];
  accounts: Account[];
  products: Product[];
  onSaveOrder: (order: Order) => void;
  onBack: () => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ type, orders, accounts, products, onSaveOrder, onBack }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id || '');
  const [cart, setCart] = useState<{ productId: string; quantity: number; price: number }[]>([]);

  const addToCart = (p: Product) => {
    const existing = cart.find(c => c.productId === p.id);
    if (existing) {
      setCart(cart.map(c => c.productId === p.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId: p.id, quantity: 1, price: p.price }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSave = () => {
    if (cart.length === 0) return;
    onSaveOrder({
      id: Math.random().toString(36).substr(2, 9),
      accountId: selectedAccId,
      items: cart,
      total,
      date: new Date().toISOString(),
      type,
      status: 'pending'
    });
    setCart([]);
    setShowAdd(false);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="bg-[#1a2b3c] p-3 rounded-xl"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
          <h2 className="text-xl font-black">{type === 'order' ? 'الطلبيات' : 'عروض الأسعار'}</h2>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-blue-700 px-4 py-2 rounded-lg font-bold text-sm">إضافة جديد</button>
      </div>

      {showAdd ? (
        <div className="bg-[#141d26] p-5 rounded-2xl border border-blue-500/30 space-y-4 animate-in slide-in-from-top duration-300">
           <div>
              <label className="text-xs font-bold text-gray-500">اختر الحساب</label>
              <select value={selectedAccId} onChange={e => setSelectedAccId(e.target.value)} className="w-full bg-[#0c0c0c] p-3 rounded-lg border border-gray-800 outline-none mt-1">
                 {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
           </div>
           
           <div>
              <label className="text-xs font-bold text-gray-500">اختر المنتجات</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                 {products.map(p => (
                    <button key={p.id} onClick={() => addToCart(p)} className="bg-[#1a2b3c] p-2 rounded-lg text-xs font-bold border border-white/5 hover:border-blue-500 truncate">
                       {p.name} ({p.price})
                    </button>
                 ))}
              </div>
           </div>

           {cart.length > 0 && (
             <div className="bg-black/20 p-3 rounded-lg space-y-2">
                {cart.map(item => {
                  const p = products.find(pr => pr.id === item.productId);
                  return (
                    <div key={item.productId} className="flex justify-between text-[11px] font-bold">
                       <span>{p?.name} x {item.quantity}</span>
                       <span>{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="border-t border-white/10 pt-2 flex justify-between font-black text-blue-400">
                   <span>الإجمالي</span>
                   <span>{total.toLocaleString()} ري</span>
                </div>
             </div>
           )}

           <div className="flex gap-2">
              <button onClick={handleSave} className="flex-grow bg-blue-600 py-3 rounded-lg font-black">حفظ</button>
              <button onClick={() => setShowAdd(false)} className="px-6 bg-gray-800 rounded-lg font-bold">إلغاء</button>
           </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const acc = accounts.find(a => a.id === order.accountId);
            return (
              <div key={order.id} className="bg-[#141d26] p-4 rounded-xl border border-white/5 flex justify-between items-center shadow-lg">
                 <div>
                    <p className="text-sm font-black">{acc?.name}</p>
                    <p className="text-[10px] text-gray-500">{new Date(order.date).toLocaleDateString('ar-YE')}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-black text-blue-500">{order.total.toLocaleString()} ري</p>
                    <p className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${order.status === 'pending' ? 'bg-orange-900/40 text-orange-400' : 'bg-green-900/40 text-green-400'}`}>
                      {order.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                    </p>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersView;
