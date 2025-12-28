
import React from 'react';
import { Transaction, Account } from '../types';

interface DailyMovementViewProps {
  transactions: Transaction[];
  accounts: Account[];
  onBack: () => void;
  filterCategory?: string;
}

const DailyMovementView: React.FC<DailyMovementViewProps> = ({ transactions, accounts, onBack, filterCategory }) => {
  const todayStr = new Date().toDateString();
  
  // إذا كان هناك فلتر للبند، نعرض كافة العمليات لهذا البند، وإلا نعرض عمليات اليوم فقط
  const displayTransactions = filterCategory 
    ? transactions.filter(t => t.category === filterCategory)
    : transactions.filter(t => new Date(t.date).toDateString() === todayStr);

  const stats = displayTransactions.reduce((acc, curr) => {
    if (curr.type === 'debit') acc.in += curr.amount;
    else acc.out += curr.amount;
    return acc;
  }, { in: 0, out: 0 });

  return (
    <div className="p-4 pb-20 animate-in slide-in-from-bottom duration-300 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="bg-[#1a2b3c] p-3 rounded-xl active:scale-90 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-black">{filterCategory ? `كشف بند: ${filterCategory}` : 'الحركة اليومية'}</h2>
              {filterCategory && <span className="text-[10px] text-gray-500 font-bold">عرض كافة العمليات المقيدة على هذا البند</span>}
            </div>
         </div>
         <div className="text-[10px] bg-blue-700 px-3 py-1 rounded-full font-bold shadow-lg">
           {filterCategory ? 'تقرير البند' : `اليوم: ${new Date().toLocaleDateString('ar-YE')}`}
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="bg-[#141d26] p-4 rounded-2xl border border-red-500/20 shadow-xl text-center">
            <p className="text-[10px] text-gray-500 font-black mb-1">إجمالي المنصرف (مدين)</p>
            <p className="text-xl font-black text-red-500">+{stats.in.toLocaleString()}</p>
         </div>
         <div className="bg-[#141d26] p-4 rounded-2xl border border-green-500/20 shadow-xl text-center">
            <p className="text-[10px] text-gray-500 font-black mb-1">إجمالي المقبوض (دائن)</p>
            <p className="text-xl font-black text-green-500">-{stats.out.toLocaleString()}</p>
         </div>
      </div>

      <div className="space-y-3">
        {displayTransactions.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-3 grayscale opacity-30">
            <span className="text-6xl">📝</span>
            <p className="font-black">لا توجد عمليات مسجلة</p>
          </div>
        ) : (
          displayTransactions.map(tx => {
            const acc = accounts.find(a => a.id === tx.accountId);
            return (
              <div key={tx.id} className="bg-[#141d26] p-4 rounded-xl border border-white/5 flex justify-between items-center shadow-md hover:bg-white/5 transition-colors">
                <div className="flex flex-col flex-grow text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-blue-400">{acc?.name}</span>
                    {tx.category && tx.category !== 'عام' && (
                      <span className="text-[9px] bg-orange-600/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 font-black">
                        {tx.category}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{tx.note || 'بدون بيان'}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-gray-600">{new Date(tx.date).toLocaleDateString('ar-YE')}</span>
                    <span className="text-[9px] text-gray-600">{new Date(tx.date).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className={`text-right font-black text-lg ${tx.type === 'debit' ? 'text-red-500' : 'text-green-500'}`}>
                  {tx.type === 'debit' ? '+' : '-'}{tx.amount.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyMovementView;
