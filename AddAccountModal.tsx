
import React, { useState } from 'react';
import { Account, AccountType } from '../types';

interface AddAccountModalProps {
  accountToEdit?: Account;
  targetType?: AccountType;
  onClose: () => void;
  onSave: (account: Account) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ accountToEdit, targetType, onClose, onSave }) => {
  const [name, setName] = useState(accountToEdit?.name || '');
  const [phone, setPhone] = useState(accountToEdit?.phone || '');
  const [debtLimit, setDebtLimit] = useState(accountToEdit?.debtLimit?.toString() || '0');
  const [notes, setNotes] = useState(accountToEdit?.notes || '');
  const [msgMethod, setMsgMethod] = useState<'SMS' | 'WhatsApp'>(accountToEdit?.msgMethod || 'SMS');
  const [msgTiming, setMsgTiming] = useState<'Auto' | 'Confirm' | 'None'>(accountToEdit?.msgTiming || 'None');
  const [addOpeningBalance, setAddOpeningBalance] = useState(false);
  const [balance, setBalance] = useState('0');
  const [balanceNote, setBalanceNote] = useState('رصيد افتتاحي');
  const [balanceType, setBalanceType] = useState<'owe' | 'has'>('owe');

  const handleSave = () => {
    if (!name) return;
    onSave({
      id: accountToEdit?.id || Math.random().toString(36).substr(2, 9),
      name,
      phone,
      balance: accountToEdit ? accountToEdit.balance : (addOpeningBalance ? (balanceType === 'owe' ? parseFloat(balance) : -parseFloat(balance)) : 0),
      type: accountToEdit?.type || targetType || 'customer',
      debtLimit: parseFloat(debtLimit),
      notes,
      msgMethod,
      msgTiming,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1c1e] w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 border border-white/10">
        {/* Handle for visual queue of draggable sheet */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>
        
        <div className="p-4 border-b border-white/5 flex justify-between items-center px-6">
          <h3 className="font-black text-white text-base">{accountToEdit ? 'تعديل الحساب' : 'إضافة حساب جديد'}</h3>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar safe-bottom">
          <div className="space-y-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 px-1 uppercase tracking-wider">الاسم الكامل</label>
                <input 
                  type="text" placeholder="مثال: حسام القباطي" 
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-colors"
                />
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 px-1 uppercase tracking-wider">رقم التلفون</label>
                <input 
                  type="tel" placeholder="000 000 000" 
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-colors"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 px-1 uppercase tracking-wider">سقف المديونية</label>
                  <input 
                    type="number" value={debtLimit} onChange={(e) => setDebtLimit(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-center text-sm font-black text-white outline-none"
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 px-1 uppercase tracking-wider">الإشعارات</label>
                  <select 
                    value={msgMethod} onChange={(e: any) => setMsgMethod(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none"
                  >
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
               </div>
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 px-1 uppercase tracking-wider">ملاحظات إضافية</label>
                <textarea 
                  placeholder="اكتب أي تفاصيل هنا..." 
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-blue-500 min-h-[80px]"
                />
             </div>
          </div>

          {/* Toggle Opening Balance */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-300">رصيد افتتاحي أو سابق؟</span>
                <label className="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" checked={addOpeningBalance} onChange={e => setAddOpeningBalance(e.target.checked)} className="sr-only peer" />
                   <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-orange-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
             </div>

             {addOpeningBalance && (
               <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex gap-2">
                    <button onClick={() => setBalanceType('owe')} className={`flex-grow py-3 rounded-xl font-black text-xs transition-all ${balanceType === 'owe' ? 'bg-red-500 text-white shadow-lg' : 'bg-white/5 text-red-500 border border-red-500/20'}`}>عليه</button>
                    <button onClick={() => setBalanceType('has')} className={`flex-grow py-3 rounded-xl font-black text-xs transition-all ${balanceType === 'has' ? 'bg-green-600 text-white shadow-lg' : 'bg-white/5 text-green-500 border border-green-500/20'}`}>له</button>
                  </div>
                  <input 
                    type="number" placeholder="المبلغ..." 
                    value={balance} onChange={(e) => setBalance(e.target.value)}
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl py-3 text-center text-xl font-black text-white outline-none"
                  />
               </div>
             )}
          </div>

          <div className="flex gap-3 pt-4">
             <button onClick={handleSave} className="flex-grow bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-all">حفظ البيانات</button>
             <button onClick={onClose} className="px-8 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-gray-400 active:scale-95 transition-all">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;