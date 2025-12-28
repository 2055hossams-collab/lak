
import React, { useState, useMemo, useEffect } from 'react';
import { Account, Transaction } from '../types.ts';

interface AddTransactionModalProps {
  accounts: Account[];
  preselectedId?: string;
  onClose: () => void; 
  onSave: (tx: Transaction) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ accounts, preselectedId, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'expenses'>(
    preselectedId && accounts.find(a => a.id === preselectedId)?.type === 'expense' ? 'expenses' : 'accounts'
  );
  
  const [selectedAccountId, setSelectedAccountId] = useState(preselectedId || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // الحالة الجديدة للتاريخ
  const [categoryName, setCategoryName] = useState('عام'); 
  const [type, setType] = useState<'credit' | 'debit'>('debit'); 
  const [method, setMethod] = useState<'cash' | 'credit'>('cash');
  const [searchTerm, setSearchTerm] = useState('');

  const expenseItems = [
    "نفقات ذات طابع خاص",
    "تنقلات داخلية",
    "قرطاسية",
    "اتصالات",
    "مياه",
    "كهرباء",
    "أجور عمال",
    "إيجارات",
    "الورشات الثقافية",
    "صرف المواقع اليومية والمواجهة",
    "مواجهة الاعتماد الشهري",
    "صيانة"
  ];

  const quickAmounts = [1000, 5000, 10000, 50000];

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
      const isMatch = a.name.includes(searchTerm);
      if (activeTab === 'expenses') return isMatch && a.type === 'expense';
      return isMatch && a.type !== 'expense';
    });
  }, [accounts, searchTerm, activeTab]);

  useEffect(() => {
    if (!preselectedId && filteredAccounts.length > 0) {
      const isAlreadyInList = filteredAccounts.find(a => a.id === selectedAccountId);
      if (!isAlreadyInList) {
        setSelectedAccountId(filteredAccounts[0].id);
      }
    }
  }, [activeTab, filteredAccounts]);

  const selectedAccount = useMemo(() => 
    accounts.find(a => a.id === selectedAccountId), 
    [accounts, selectedAccountId]
  );

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!selectedAccountId || isNaN(numAmount) || numAmount <= 0) {
      alert("يرجى إدخال مبلغ صحيح واختيار حساب");
      return;
    }
    
    // نستخدم التاريخ المختار من قبل المستخدم
    const finalDate = new Date(date);
    // إذا كان التاريخ المختار هو اليوم، ندمج معه الوقت الحالي لضمان الترتيب الزمني الدقيق
    const now = new Date();
    if (finalDate.toDateString() === now.toDateString()) {
      finalDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    }

    onSave({
      id: Math.random().toString(36).substr(2, 9),
      accountId: selectedAccountId,
      amount: numAmount,
      type,
      note: note || (categoryName !== 'عام' ? categoryName : "سند " + (type === 'debit' ? 'صرف' : 'قبض')),
      category: categoryName,
      method,
      date: finalDate.toISOString(),
    });
  };

  const handleExpenseSelect = (itemName: string) => {
    setCategoryName(itemName);
    if (activeTab === 'expenses') {
      setType('debit'); 
    }
  };

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const days = ['الأحد', 'الأثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const now = new Date();
  const dayName = days[now.getDay()];
  const timeStr = now.toLocaleTimeString('ar-YE', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-200 text-right" dir="rtl">
       <div className="bg-[#1c1f24] w-full max-w-[420px] rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden border-t sm:border border-white/10 shadow-2xl relative animate-in slide-in-from-bottom duration-300 max-h-[95vh] flex flex-col">
         
         <div className="p-6 bg-[#171a1e] border-b border-white/5 shrink-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-black text-white">إضافة سند</h3>
                <div className="flex items-center gap-2 mt-1">
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{dayName} | {timeStr}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 active:scale-90 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
               <button onClick={() => setActiveTab('accounts')} className={`flex-grow py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'accounts' ? 'bg-[#004b93] text-white shadow-lg' : 'text-gray-500'}`}>
                  📦 الحسابات
               </button>
               <button onClick={() => setActiveTab('expenses')} className={`flex-grow py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'expenses' ? 'bg-[#c2410c] text-white shadow-lg' : 'text-gray-500'}`}>
                  📉 بنود التقرير
               </button>
            </div>
         </div>

         <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow bg-[#1c1f24]">
            
            <div className="space-y-4">
              <div className="relative">
                  <input type="text" placeholder="ابحث عن الحساب..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border-b-2 border-white/10 p-3 pr-10 text-right text-base font-black text-white outline-none focus:border-blue-500 placeholder-gray-600 transition-all" />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
              </div>

              <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="w-full bg-[#171a1e] border border-white/10 rounded-2xl p-4 text-right text-sm font-black text-white outline-none appearance-none shadow-inner">
                  {filteredAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>

              <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3">
                <p className="text-[10px] font-black text-orange-400 uppercase">تصنيف العملية في التقرير الشهري:</p>
                <div className="grid grid-cols-2 gap-2">
                  {expenseItems.map((item, idx) => {
                    const isActive = categoryName === item;
                    return (
                      <button key={idx} onClick={() => handleExpenseSelect(item)} className={`py-2 px-1 rounded-lg text-[9px] font-black transition-all truncate border ${isActive ? 'bg-orange-600 border-orange-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'}`}>
                        {item}
                      </button>
                    );
                  })}
                  <button onClick={() => setCategoryName('عام')} className={`py-2 px-1 rounded-lg text-[9px] font-black transition-all border ${categoryName === 'عام' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/5 text-gray-400'}`}>عام</button>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl flex justify-between items-center shadow-xl border border-white/10 transition-all duration-500 ${type === 'debit' ? 'bg-gradient-to-l from-[#7c2d12] to-[#c2410c]' : 'bg-gradient-to-l from-[#1e3a8a] to-[#004b93]'}`}>
                <div className="text-right">
                   <p className="text-[10px] font-black text-white/60 uppercase mb-1">الرصيد قبل السند</p>
                   <p className="text-lg font-black text-white">{selectedAccount ? Math.abs(selectedAccount.balance).toLocaleString() : '0.00'}<span className="text-xs mr-1 opacity-70">ري</span></p>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/10">{selectedAccount ? (selectedAccount.balance >= 0 ? 'عليه' : 'له') : '---'}</div>
            </div>

            <div className="space-y-6">
              <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent border-b-4 border-white/10 p-4 text-center text-5xl font-black outline-none focus:border-green-500 text-white placeholder-gray-800 transition-all" placeholder="0.00" />
              
              <div className="flex justify-center gap-2 flex-wrap">
                 {quickAmounts.map(val => <button key={val} onClick={() => handleQuickAmount(val)} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[11px] font-black text-gray-400 hover:bg-green-600 hover:text-white transition-all active:scale-90">+{val.toLocaleString()}</button>)}
                 <button onClick={() => setAmount('')} className="bg-red-900/20 border border-red-500/20 px-4 py-2 rounded-xl text-[11px] font-black text-red-500">مسح</button>
              </div>

              {/* حقل التاريخ الاختياري */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-blue-400 px-1 uppercase tracking-wider block text-right">تاريخ العملية (اختياري)</label>
                 <input 
                   type="date" 
                   value={date} 
                   onChange={(e) => setDate(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-colors text-right"
                 />
              </div>
              
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-sm font-black outline-none focus:border-blue-500 text-gray-200 placeholder-gray-600 transition-all shadow-inner" placeholder="البيان (اختياري)..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black/30 rounded-2xl p-1.5 border border-white/5 flex gap-1 shadow-inner">
                  <button onClick={() => setMethod('cash')} className={`flex-grow py-3 rounded-xl text-[11px] font-black transition-all ${method === 'cash' ? 'bg-[#004b93] text-white shadow-md' : 'text-gray-500'}`}>نقدية</button>
                  <button onClick={() => setMethod('credit')} className={`flex-grow py-3 rounded-xl text-[11px] font-black transition-all ${method === 'credit' ? 'bg-[#004b93] text-white shadow-md' : 'text-gray-500'}`}>آجل</button>
               </div>
               <div className="bg-black/30 rounded-2xl p-1.5 border border-white/5 flex gap-1 shadow-inner">
                  <button onClick={() => setType('debit')} className={`flex-grow py-3 rounded-xl text-[11px] font-black transition-all ${type === 'debit' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500'}`}>مدين (صرف)</button>
                  <button onClick={() => setType('credit')} className={`flex-grow py-3 rounded-xl text-[11px] font-black transition-all ${type === 'credit' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500'}`}>دائن (قبض)</button>
               </div>
            </div>
         </div>

         <div className="p-6 bg-[#171a1e] border-t border-white/5 shrink-0 flex gap-4 safe-bottom">
             <button onClick={onClose} className="w-24 bg-white/5 border border-white/10 py-4 rounded-2xl font-black text-gray-400 active:scale-95 transition-all text-sm">إلغاء</button>
             <button onClick={handleSave} className={`flex-grow py-4 rounded-2xl font-black text-white shadow-2xl active:scale-[0.98] transition-all text-lg ${type === 'debit' ? 'bg-red-600' : 'bg-[#004b93]'}`}>حفـــــظ السند</button>
         </div>
       </div>
    </div>
  );
};

export default AddTransactionModal;
