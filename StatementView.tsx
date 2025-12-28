
import React, { useState, useMemo } from 'react';
import { Account, Transaction } from '../types';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

interface StatementViewProps {
  account: Account;
  transactions: Transaction[];
  onBack: () => void;
  onAddTransaction: () => void;
}

const StatementView: React.FC<StatementViewProps> = ({ account, transactions, onBack, onAddTransaction }) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [filterType, setFilterType] = useState<'monthly' | 'all'>('all');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const processedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;
    return sorted.map((tx, index) => {
      if (tx.type === 'debit') runningBalance += tx.amount;
      else runningBalance -= tx.amount;
      
      return {
        ...tx,
        index: index + 1,
        runningBalance
      };
    });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const filtered = processedTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= end;
    });

    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [processedTransactions, startDate, endDate]);

  const exportToExcel = () => {
    try {
      // ترتيب الأعمدة حسب طلب المستخدم: م - المبلغ - البند - البيان - مدين - دائن - الرصيد - التاريخ - ملاحظات
      const headers = ["م", "المبلغ", "البند", "البيان", "مدين", "دائن", "الرصيد", "التاريخ", "ملاحظات"];
      
      // نحتاج البيانات مرتبة من الأقدم للأحدث لحساب الرصيد بشكل صحيح في الإكسل
      const sortedForExport = [...filteredTransactions].sort((a, b) => a.index - b.index);

      const data = sortedForExport.map(tx => ({
        "م": tx.index,
        "المبلغ": tx.amount,
        "البند": tx.category || 'عام',
        "البيان": tx.note || '---',
        "مدين": tx.type === 'debit' ? tx.amount : 0,
        "دائن": tx.type === 'credit' ? tx.amount : 0,
        "الرصيد": tx.runningBalance,
        "التاريخ": new Date(tx.date).toLocaleDateString('ar-YE'),
        "ملاحظات": ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
      worksheet['!dir'] = 'rtl';
      if (!worksheet['!views']) worksheet['!views'] = [];
      worksheet['!views'] = [{ RTL: true }];

      const workbook = XLSX.utils.book_new();
      if (!workbook.Workbook) workbook.Workbook = {};
      workbook.Workbook.Views = [{ RTL: true }];

      XLSX.utils.book_append_sheet(workbook, worksheet, "كشف الحساب");
      XLSX.writeFile(workbook, `كشف_حساب_${account.name}_${new Date().getTime()}.xlsx`);
      setShowOptionsMenu(false);
    } catch (e) { alert("حدث خطأ أثناء التصدير"); }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 overflow-hidden relative font-sans">
      <div className="bg-white border-b border-gray-100 p-3 space-y-3 shadow-sm z-30 print:hidden">
        <div className="flex justify-end items-center gap-6 px-2">
           <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[11px] font-black text-blue-900">شهري</span>
              <div onClick={() => setFilterType('monthly')} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${filterType === 'monthly' ? 'border-orange-500' : 'border-gray-300'}`}>
                {filterType === 'monthly' && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
              </div>
           </label>
           <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[11px] font-black text-blue-900">الكل</span>
              <div onClick={() => setFilterType('all')} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${filterType === 'all' ? 'border-orange-500' : 'border-gray-300'}`}>
                {filterType === 'all' && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
              </div>
           </label>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex-grow flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-11 shadow-inner">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="flex-grow bg-transparent text-center text-[12px] font-black text-blue-900 outline-none" 
              />
              <div className="bg-[#004b93] px-3 h-full flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2.5}/></svg>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-[#004b93] flex p-2 text-[8px] sm:text-[10px] font-black text-center text-white sticky top-0 z-20 shadow-md">
        <span className="w-[8%]">م</span>
        <span className="w-[17%]">التاريخ</span>
        <span className="w-[18%]">البند</span>
        <span className="w-[19%]">البيان</span>
        <span className="w-[13%]">مدين</span>
        <span className="w-[13%]">دائن</span>
        <span className="w-[12%]">الرصيد</span>
      </div>

      <div className="flex-grow overflow-y-auto bg-white pb-40 custom-scrollbar">
        {filteredTransactions.length === 0 ? (
          <div className="py-20 text-center opacity-20 flex flex-col items-center">
            <span className="text-5xl mb-4">📄</span>
            <p className="font-black text-gray-500 text-sm">لا توجد عمليات</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map(tx => (
              <div key={tx.id} className="flex py-3 px-1 items-center text-center hover:bg-gray-50 transition-colors">
                <span className="w-[8%] text-[8px] font-bold text-gray-400">{tx.index}</span>
                <div className="w-[17%] flex flex-col items-center">
                  <span className="text-[9px] font-black text-blue-900">{new Date(tx.date).toLocaleDateString('ar-YE', {month:'numeric', day:'numeric'})}</span>
                  <span className="text-[6px] text-gray-400 font-bold">{new Date(tx.date).toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12: true})}</span>
                </div>
                <span className="w-[18%] text-[9px] font-black text-orange-600 truncate px-0.5">{tx.category || 'عام'}</span>
                <span className="w-[19%] text-[9px] font-bold text-gray-600 truncate px-0.5" title={tx.note}>{tx.note || '---'}</span>
                <span className={`w-[13%] text-[10px] font-black ${tx.type === 'debit' ? 'text-red-600' : 'text-gray-200'}`}>
                  {tx.type === 'debit' ? tx.amount.toLocaleString() : '-'}
                </span>
                <span className={`w-[13%] text-[10px] font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-200'}`}>
                  {tx.type === 'credit' ? tx.amount.toLocaleString() : '-'}
                </span>
                <span className={`w-[12%] text-[9px] font-black ${tx.runningBalance >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {Math.abs(tx.runningBalance).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={onAddTransaction}
        className="fixed bottom-24 right-6 w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all z-40 border border-white/20 print:hidden"
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M12 4v16m8-8H4" /></svg>
      </button>

      <div className="fixed bottom-0 left-0 right-0 bg-[#004b93] h-16 flex items-center justify-between px-5 z-40 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] print:hidden safe-bottom">
        <button onClick={() => setShowOptionsMenu(true)} className="p-2 text-white active:scale-90">
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        <div className="flex-grow text-center flex flex-col justify-center overflow-hidden">
           <div className="text-[9px] font-black text-blue-200 uppercase tracking-tighter">إجمالي الرصيد الحالي</div>
           <div className="text-sm font-black text-white truncate">
             {Math.abs(account.balance).toLocaleString()} <span className="text-[9px] opacity-70">ري</span>
             <span className={`mr-2 text-[8px] font-black px-2 py-0.5 rounded-full ${account.balance >= 0 ? 'bg-red-500' : 'bg-green-600'}`}>
               {account.balance >= 0 ? 'مدين' : 'دائن'}
             </span>
           </div>
        </div>

        <button onClick={onBack} className="p-2 text-white active:scale-90">
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {showOptionsMenu && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowOptionsMenu(false)}></div>
          <div className="fixed bottom-6 left-6 right-6 bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-gray-100 flex justify-center">
               <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex flex-col p-2">
              <button onClick={() => { window.print(); setShowOptionsMenu(false); }} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors text-right group">
                <span className="text-gray-800 font-black text-sm">طباعة كملف PDF</span>
                <div className="text-red-600 bg-red-50 p-2 rounded-xl group-active:scale-90 transition-transform">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7.5V7H10c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H9v2zm5 2h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5zm4-3.5h-1.25V11H19v1.5h-1.25V13H16V7h3.5v1.5z"/></svg>
                </div>
              </button>
              <button onClick={exportToExcel} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors text-right group">
                <span className="text-gray-800 font-black text-sm">تصدير لملف إكسل</span>
                <div className="text-green-600 bg-green-50 p-2 rounded-xl group-active:scale-90 transition-transform">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1.8 18H14l-2-3.4-2 3.4H8.2l2.9-4.5L8.2 9H10l2 3.4 2-3.4h1.8l-2.9 4.5 2.9 4.5zM13 9V3.5L18.5 9H13z"/></svg>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatementView;
