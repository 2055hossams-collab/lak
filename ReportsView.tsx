
import React, { useMemo, useState } from 'react';
import { Account, Transaction, Product } from '../types';

interface ReportsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  products: Product[];
  onBack: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ accounts, transactions, products, onBack }) => {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'all'>('all');

  // حساب المصروفات حسب البند (فرز المصروفات)
  const expenseBreakdown = useMemo(() => {
    const expenseTxs = transactions.filter(t => t.category && t.type === 'debit');
    const breakdown: Record<string, number> = {};
    expenseTxs.forEach(t => {
      const cat = t.category || 'عام';
      breakdown[cat] = (breakdown[cat] || 0) + t.amount;
    });
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const totalExpenses = expenseBreakdown.reduce((s, e) => s + e[1], 0);
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-[#004b93] p-4 flex items-center gap-4 text-white shadow-lg">
        <button onClick={onBack} className="p-2 active:scale-90"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg></button>
        <h2 className="text-lg font-black">الخلاصة المالية وفرز المصروفات</h2>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-20">
        {/* بطاقة الإجمالي العام */}
        <div className="bg-gradient-to-br from-[#004b93] to-[#003366] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
           <p className="text-blue-100 text-xs font-bold mb-1 opacity-80">صافي رصيد الحسابات الكلي</p>
           <h3 className="text-3xl font-black">{totalBalance.toLocaleString()} <span className="text-sm font-normal">ريال</span></h3>
           <div className="mt-4 flex gap-3">
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">تحليل مالي دقيق</div>
           </div>
        </div>

        {/* قسم فرز المصروفات */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
           <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-blue-900 text-base flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                فرز المصروفات حسب البند
              </h4>
              <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">إجمالي: {totalExpenses.toLocaleString()}</span>
           </div>

           {expenseBreakdown.length === 0 ? (
             <p className="text-center py-10 text-gray-400 font-bold">لا يوجد بيانات مصروفات</p>
           ) : (
             <div className="space-y-5">
               {expenseBreakdown.map(([cat, amount], i) => {
                 const percentage = Math.round((amount / totalExpenses) * 100);
                 const colors = ['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500'];
                 const color = colors[i % colors.length];

                 return (
                   <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between items-end">
                         <span className="text-[11px] font-black text-gray-700">{cat}</span>
                         <span className="text-[11px] font-black text-blue-700">{amount.toLocaleString()} <span className="text-[8px] text-gray-400">({percentage}%)</span></span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                         <div className={`${color} h-full rounded-full shadow-sm transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                      </div>
                   </div>
                 );
               })}
             </div>
           )}
        </div>

        {/* ملخص المديونية والمقبوضات */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-lg text-center">
              <p className="text-[10px] text-gray-400 font-black mb-1 uppercase tracking-wider">إجمالي المديونية</p>
              <p className="text-xl font-black text-red-600">{accounts.filter(a=>a.balance > 0).reduce((s,a)=>s+a.balance,0).toLocaleString()}</p>
           </div>
           <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-lg text-center">
              <p className="text-[10px] text-gray-400 font-black mb-1 uppercase tracking-wider">إجمالي الأرصدة</p>
              <p className="text-xl font-black text-green-600">{Math.abs(accounts.filter(a=>a.balance < 0).reduce((s,a)=>s+a.balance,0)).toLocaleString()}</p>
           </div>
        </div>

        {/* تنبيهات ذكية */}
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-3xl flex gap-4 items-center">
           <div className="bg-orange-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg">💡</div>
           <div className="flex-1">
              <p className="text-[11px] font-black text-orange-900">نصيحة مالية</p>
              <p className="text-[10px] text-orange-800 font-bold leading-relaxed">بند "{expenseBreakdown[0]?.[0] || 'المصروفات'}" يمثل النسبة الأكبر من إنفاقك، حاول مراجعة تفاصيل هذا البند لترشيد الاستهلاك.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
