
import React from 'react';
import { Account, AppView } from '../types';

interface DashboardProps {
  accounts: Account[];
  onViewChange: (view: AppView) => void;
  onQuickAction: (action: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, onViewChange, onQuickAction }) => {
  const quickActions = [
    { label: 'سند جديد', color: 'bg-[#004b93]', icon: '➕' },
    { label: 'تقرير الاعتماد', color: 'bg-green-700', icon: '📊' },
    { label: 'الحركة اليومية', color: 'bg-orange-600', icon: '⏰' },
    { label: 'فاتورة جديدة', color: 'bg-[#004b93]', icon: '🛒' },
    { label: 'صرف عملات', color: 'bg-orange-600', icon: '💸' },
    { label: 'البحث السريع', color: 'bg-[#004b93]', icon: '🔍' },
  ];

  const categories = [
    { name: 'الموردين', type: 'supplier', icon: '📦' },
    { name: 'العملاء', type: 'customer', icon: '👥' },
    { name: 'الديون', type: 'debt', icon: '💰' },
    { name: 'الصرفيات', type: 'expense', icon: '📉' },
  ];

  const getAppView = (type: string): AppView => {
    switch(type) {
      case 'supplier': return AppView.SUPPLIERS;
      case 'customer': return AppView.CUSTOMERS;
      case 'debt': return AppView.DEBTS;
      case 'expense': return AppView.EXPENSES;
      default: return AppView.DASHBOARD;
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="p-4 pb-32 space-y-5 bg-[#f8fafc] h-full overflow-y-auto custom-scrollbar">
      {/* بطاقة الرصيد الكلي */}
      <div className="bg-[#004b93] rounded-[2rem] p-5 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col items-center">
         <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
         <p className="text-blue-100 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 opacity-70">إجمالي المركز المالي</p>
         <h2 className="text-2xl sm:text-4xl font-black mb-2">{totalBalance.toLocaleString()} <span className="text-xs font-normal">ريال</span></h2>
         <div className="bg-white/10 px-3 py-1 rounded-xl text-[8px] sm:text-[10px] font-black border border-white/10 backdrop-blur-md">
           تحديث فوري : {new Date().toLocaleTimeString('ar-YE', {hour:'2-digit', minute:'2-digit'})}
         </div>
      </div>

      {/* أزرار الوصول السريع */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {quickActions.map((action, i) => (
          <button 
            key={i} 
            onClick={() => onQuickAction(action.label)}
            className={`${action.color} p-2.5 sm:p-4 rounded-2xl shadow-md active:scale-90 transition-all flex flex-col items-center justify-center gap-1.5 border border-white/5`}
          >
            <span className="text-lg sm:text-2xl">{action.icon}</span>
            <span className="text-[8px] sm:text-[11px] font-black text-white whitespace-nowrap text-center">{action.label}</span>
          </button>
        ))}
      </div>

      {/* أقسام الحسابات */}
      <div className="space-y-3">
         <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-gray-800 text-xs sm:text-sm">التصنيفات الرئيسية</h3>
            <button onClick={() => onViewChange(AppView.REPORTS)} className="text-blue-600 text-[9px] sm:text-[11px] font-black bg-blue-50 px-2.5 py-1.5 rounded-lg">عرض التقارير ⬅️</button>
         </div>
         <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {categories.map((item, idx) => {
              const typeAccounts = accounts.filter(a => a.type === item.type);
              const balance = typeAccounts.reduce((sum, a) => sum + a.balance, 0);
              return (
                <div 
                  key={idx} 
                  onClick={() => onViewChange(getAppView(item.type))}
                  className="bg-white border border-gray-100 p-3 sm:p-5 rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer flex flex-col items-center text-center"
                >
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-50 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-2 shadow-inner">
                    {item.icon}
                  </div>
                  <p className="text-gray-400 text-[8px] sm:text-[10px] font-black mb-0.5 uppercase">{item.name}</p>
                  <p className={`text-xs sm:text-base font-black ${balance >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {Math.abs(balance).toLocaleString()} <span className="text-[8px] sm:text-[10px] opacity-60">ري</span>
                  </p>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
