
import React, { useState } from 'react';

const ExchangeView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('YER');

  const rates: any = { 'USD': 530, 'SAR': 141, 'YER': 1 };
  const result = (parseFloat(amount) * rates[from]) / rates[to];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="bg-[#1a2b3c] p-3 rounded-xl"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
        <h2 className="text-xl font-black">صرف العملات</h2>
      </div>

      <div className="bg-[#141d26] p-6 rounded-2xl border border-blue-900/20 shadow-xl space-y-6">
         <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 block">المبلغ المراد تحويله</label>
            <input 
               type="number" value={amount} onChange={e => setAmount(e.target.value)}
               className="w-full bg-[#0c0c0c] border border-gray-700 p-4 rounded-xl text-2xl font-black text-center outline-none focus:border-blue-500"
            />
         </div>

         <div className="flex items-center gap-3">
            <select value={from} onChange={e => setFrom(e.target.value)} className="flex-grow bg-[#1a2b3c] p-3 rounded-lg font-bold outline-none">
               <option value="USD">دولار أمريكي ($)</option>
               <option value="SAR">سعودي (ر.س)</option>
               <option value="YER">ريال يمني (ر.ي)</option>
            </select>
            <div className="text-blue-500 font-black">⬅️</div>
            <select value={to} onChange={e => setTo(e.target.value)} className="flex-grow bg-[#1a2b3c] p-3 rounded-lg font-bold outline-none">
               <option value="YER">ريال يمني (ر.ي)</option>
               <option value="USD">دولار أمريكي ($)</option>
               <option value="SAR">سعودي (ر.س)</option>
            </select>
         </div>

         <div className="bg-[#004b93]/20 p-5 rounded-xl border border-blue-500/30 text-center">
            <p className="text-xs text-blue-400 font-bold mb-1">النتيجة التقريبية</p>
            <p className="text-3xl font-black text-white">{result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-gray-500 mt-2 font-bold">سعر الصرف المعتمد: {rates[from]} / {rates[to]}</p>
         </div>
      </div>

      <div className="space-y-3">
         <h4 className="text-sm font-black text-gray-400 px-2">أسعار الصرف اليومية</h4>
         {['USD', 'SAR'].map(curr => (
            <div key={curr} className="bg-[#141d26] p-4 rounded-xl flex justify-between items-center border border-white/5">
               <span className="font-bold">{curr === 'USD' ? 'دولار أمريكي' : 'ريال سعودي'}</span>
               <span className="font-black text-orange-500">{rates[curr]} ريال</span>
            </div>
         ))}
      </div>
    </div>
  );
};

export default ExchangeView;
