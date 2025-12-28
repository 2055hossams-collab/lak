
import React, { useState, useMemo } from 'react';
import { Account } from '../types.ts';

interface AccountListViewProps {
  type: string;
  accounts: Account[];
  onBack: () => void;
  onAddTransaction: () => void;
  onAddAccount: () => void;
  onSelectAccount: (id: string) => void;
  onEditAccount: (acc: Account) => void;
  onDeleteAccounts: (ids: string[]) => void;
  onLockAccounts: (ids: string[]) => void;
  totals: { owe: number; has: number; diff: number };
}

export default function AccountListView({ 
  type, accounts, onBack, onAddTransaction, onAddAccount, onSelectAccount, onEditAccount, onDeleteAccounts, onLockAccounts, totals 
}: AccountListViewProps) {
  const [filter, setFilter] = useState('total');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lockFilter, setLockFilter] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const getTitle = () => {
    switch(type) {
      case 'customer': return 'قائمة العملاء';
      case 'supplier': return 'قائمة الموردين';
      case 'debt': return 'سجل الديون';
      case 'employee': return 'شؤون الموظفين';
      case 'expense': return 'سجل المصاريف';
      default: return 'قائمة الحسابات';
    }
  };

  const processedAccounts = useMemo(() => {
    let result = [...accounts];
    if (lockFilter === 'locked') result = result.filter(a => a.isLocked);
    else if (lockFilter === 'unlocked') result = result.filter(a => !a.isLocked);

    result.sort((a, b) => {
      const dateA = a.lastTransaction ? new Date(a.lastTransaction).getTime() : 0;
      const dateB = b.lastTransaction ? new Date(b.lastTransaction).getTime() : 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [accounts, lockFilter, sortOrder]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === processedAccounts.length && processedAccounts.length > 0 ? [] : processedAccounts.map(a => a.id));
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] text-white overflow-hidden">
      {/* الهيدر العلوي الجديد مع زر الرجوع */}
      <div className="bg-[#004b93] p-4 flex items-center justify-between shadow-lg safe-top shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/10 rounded-xl active:scale-90 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-lg font-black">{getTitle()}</h2>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold border border-white/5">
          {processedAccounts.length} حساب
        </div>
      </div>

      {/* قسم الفلاتر العلوي */}
      <div className="bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-white/5 space-y-3 p-3 sticky top-0 z-40">
        <div className="flex justify-around items-center text-[9px] font-black text-gray-500">
          {['يومي', 'شهري', 'الكلي', 'سنوي'].map((label, idx) => {
            const values = ['daily', 'monthly', 'total', 'yearly'];
            const active = filter === values[idx];
            return (
              <label key={values[idx]} className="flex items-center gap-1 cursor-pointer py-1">
                <input type="radio" className="hidden" checked={active} onChange={() => setFilter(values[idx])} />
                <span className={`w-3.5 h-3.5 rounded-full border-2 ${active ? 'bg-orange-500 border-white' : 'border-gray-600'}`}></span>
                <span className={active ? 'text-white' : ''}>{label}</span>
              </label>
            );
          })}
        </div>

        <div className="flex gap-2">
          <div className="flex-grow flex items-center justify-between bg-white/5 rounded-xl px-2 h-9">
            <span className="text-[8px] text-gray-500 font-black">الحالة:</span>
            <div className="flex gap-1.5 text-[9px] font-bold">
              {['all', 'locked', 'unlocked'].map((f) => (
                <button key={f} onClick={() => setLockFilter(f as any)} className={`px-2 py-1 rounded-lg transition-all ${lockFilter === f ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                  {f === 'all' ? 'الكل' : f === 'locked' ? 'مؤمن' : 'نشط'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="bg-white/5 h-9 w-9 flex items-center justify-center rounded-xl text-blue-400">
             <svg className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>

        {/* شريط التحكم في الاختيار المتعدد */}
        <div className="flex items-center justify-between bg-blue-900/10 border border-blue-900/20 rounded-xl p-1.5 px-3">
           <div className="flex items-center gap-2">
              <button onClick={() => onDeleteAccounts(selectedIds)} disabled={selectedIds.length === 0} className={`p-2 rounded-lg ${selectedIds.length > 0 ? 'text-red-500 bg-red-500/10' : 'text-gray-800'}`}>
                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <button onClick={() => onLockAccounts(selectedIds)} disabled={selectedIds.length === 0} className={`p-2 rounded-lg ${selectedIds.length > 0 ? 'text-blue-400 bg-blue-400/10' : 'text-gray-800'}`}>
                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </button>
           </div>
           <button onClick={toggleSelectAll} className="flex items-center gap-2 text-[9px] font-black text-gray-500 px-3 py-1 bg-white/5 rounded-lg active:bg-white/10">
              <span>{selectedIds.length === processedAccounts.length ? 'إلغاء الكل' : 'تحديد الكل'}</span>
              <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${selectedIds.length === processedAccounts.length && processedAccounts.length > 0 ? 'bg-blue-600 border-blue-600' : 'border-gray-600'}`}>
                {selectedIds.length === processedAccounts.length && processedAccounts.length > 0 && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
              </div>
           </button>
        </div>
      </div>

      {/* قائمة الحسابات */}
      <div className="flex-grow overflow-y-auto px-4 pb-48 pt-4 space-y-3 custom-scrollbar">
        {processedAccounts.map((acc) => {
          const isSelected = selectedIds.includes(acc.id);
          const balanceColor = acc.balance >= 0 ? 'text-red-500' : 'text-green-500';
          return (
            <div 
              key={acc.id} 
              onClick={() => onSelectAccount(acc.id)} 
              className={`bg-gradient-to-br from-[#1c1c1c] to-[#121212] rounded-2xl p-4 flex items-center justify-between border-2 transition-all active:scale-[0.97] shadow-lg ${isSelected ? 'border-blue-500 bg-blue-900/5' : 'border-transparent'} ${acc.isLocked ? 'opacity-60 grayscale' : ''}`}
            >
              <div className="flex-grow flex flex-col gap-0.5">
                <div className="flex justify-between items-start">
                  <div className="text-right flex-1 ml-3 overflow-hidden">
                    <h4 className="font-black text-white text-sm truncate mb-0.5">{acc.name}</h4>
                    <p className="text-[8px] text-gray-500 font-bold uppercase opacity-80 truncate">
                      {acc.lastTransaction ? `آخر حركة: ${new Date(acc.lastTransaction).toLocaleDateString('ar-YE')}` : 'لا توجد عمليات سابقة'}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className={`font-black text-base ${balanceColor}`}>{Math.abs(acc.balance).toLocaleString()}</p>
                    <p className={`text-[7px] font-black uppercase text-center px-1.5 py-0.5 rounded ${acc.balance >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {acc.balance >= 0 ? 'عليه (مدين)' : 'له (دائن)'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-4 mr-4">
                 <div onClick={(e) => toggleSelect(acc.id, e)} className={`w-5 h-5 border-2 rounded-lg transition-all flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 shadow-md' : 'border-white/10'}`}>
                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                 </div>
                 {acc.phone && (
                   <button onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${acc.phone}`; }} className="text-blue-400 opacity-60 active:opacity-100">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                   </button>
                 )}
              </div>
            </div>
          );
        })}
        {processedAccounts.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center opacity-30 gap-3 grayscale">
            <span className="text-6xl">🔍</span>
            <p className="font-black text-sm">لا توجد نتائج مطابقة</p>
          </div>
        )}
      </div>

      {/* زر الإضافة العائم */}
      <button 
        onClick={onAddAccount} 
        className="fixed bottom-24 left-6 w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 active:scale-90 transition-all z-50 backdrop-blur-md"
      >
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
      </button>

      {/* شريط الإحصائيات السفلي */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#004b93] h-20 flex items-center px-5 gap-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10 safe-bottom">
        <button onClick={onBack} className="flex flex-col gap-1 active:scale-90 opacity-80">
           <div className="w-5 h-0.5 bg-white rounded-full"></div>
           <div className="w-5 h-0.5 bg-white rounded-full"></div>
           <div className="w-5 h-0.5 bg-white rounded-full opacity-50"></div>
        </button>
        
        <div className="flex-grow flex flex-col items-center justify-center overflow-hidden">
           <span className="text-[8px] font-black text-blue-200 uppercase mb-0.5">صافي رصيد القائمة</span>
           <div className="text-sm font-black text-white truncate w-full text-center">
             {totals.diff.toLocaleString()} <span className="text-[10px] opacity-60">ري</span>
           </div>
        </div>

        <button 
          onClick={onAddTransaction} 
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl active:scale-95 text-[#004b93]"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
