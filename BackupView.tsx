
import React from 'react';

const BackupView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const exportData = () => {
    const data = {
      accounts: localStorage.getItem('sa_accounts'),
      transactions: localStorage.getItem('sa_transactions'),
      products: localStorage.getItem('sa_products'),
      orders: localStorage.getItem('sa_orders'),
      categories: localStorage.getItem('sa_categories'),
      messages: localStorage.getItem('sa_messages'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().getTime()}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          if (value) localStorage.setItem(`sa_${key}`, value as string);
        });
        alert('تم استعادة البيانات بنجاح! سيتم إعادة تحميل التطبيق.');
        window.location.reload();
      } catch (err) {
        alert('خطأ في استيراد الملف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-6">
       <div className="flex items-center gap-4">
        <button onClick={onBack} className="bg-[#1a2b3c] p-3 rounded-xl"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
        <h2 className="text-xl font-black">النسخ الاحتياطي</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
         <button onClick={exportData} className="bg-[#141d26] p-6 rounded-2xl border border-blue-500/20 flex items-center justify-between group active:scale-95 transition-all">
            <div className="text-right">
               <p className="font-black text-lg">تصدير البيانات</p>
               <p className="text-xs text-gray-500">حفظ نسخة احتياطية على الجهاز</p>
            </div>
            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">💾</span>
         </button>

         <label className="bg-[#141d26] p-6 rounded-2xl border border-green-500/20 flex items-center justify-between group active:scale-95 transition-all cursor-pointer">
            <div className="text-right">
               <p className="font-black text-lg">استيراد البيانات</p>
               <p className="text-xs text-gray-500">رفع ملف نسخة سابقة</p>
            </div>
            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🔄</span>
            <input type="file" className="hidden" onChange={importData} accept=".json" />
         </label>

         <div className="bg-[#141d26] p-6 rounded-2xl border border-orange-500/20 flex items-center justify-between opacity-50">
            <div className="text-right">
               <p className="font-black text-lg">جوجل درايف</p>
               <p className="text-xs text-gray-500">ميزة قادمة للمزامنة السحابية</p>
            </div>
            <span className="text-3xl">☁️</span>
         </div>
      </div>
    </div>
  );
};

export default BackupView;
