
import React from 'react';
import { AppView } from '../types.ts';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onExportExcel?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, onExportExcel }) => {
  const menuGroups = [
    {
      items: [
        { label: 'الرسائل المرسلة', icon: '💬', view: AppView.MESSAGES },
        { label: 'الإعدادات', icon: '⚙️', view: AppView.SETTINGS },
      ]
    },
    {
      title: 'أدوات التصدير',
      items: [
        { label: 'تصدير قاعدة البيانات (Excel)', icon: '📊', action: 'export' },
      ]
    },
    {
      title: 'التقارير المالية',
      items: [
        { label: 'تقرير الاعتماد الشهري', icon: '📄', view: AppView.BUDGET_REPORT },
        { label: 'تقرير حركة المخزون والارباح', icon: '📈', view: AppView.REPORTS },
        { label: 'الحركة اليومية الكلية', icon: '💸', view: AppView.DAILY_MOVEMENT },
      ]
    },
    {
      title: 'المخازن والفواتير',
      items: [
        { label: 'فاتورة مردود جديدة', icon: '🛒', view: AppView.INVENTORY },
        { label: 'عروض الاسعار', icon: '💰', view: AppView.QUOTES },
        { label: 'الطلبيات', icon: '📦', view: AppView.ORDERS },
        { label: 'المخازن', icon: '🏗️', view: AppView.INVENTORY },
        { label: 'الأصناف', icon: '🏷️', view: AppView.CATEGORIES },
      ]
    },
    {
      title: 'النسخ الإحتياطي',
      items: [
        { label: 'حفظ نسخة احتياطية على الهاتف', icon: '💾', view: AppView.BACKUP },
        { label: 'إستعادة نسخة احتياطية', icon: '🔄', view: AppView.BACKUP },
      ]
    }
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/80 z-[60] transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`fixed inset-y-0 right-0 w-[310px] bg-[#111] z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl flex flex-col`}
      >
        <div className="bg-[#004b93] p-6 flex flex-col items-center relative shadow-lg">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/80 active:scale-90 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
             </svg>
          </button>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-3 shadow-2xl border-2 border-white/20 p-2 overflow-hidden">
             <img src="https://api.dicebear.com/7.x/initials/svg?seed=SA&backgroundColor=004b93" className="w-full h-full object-contain" alt="logo" />
          </div>
          <h2 className="text-xl font-black text-white">المحاسب المحستني برو</h2>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar bg-[#111]">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="border-b border-gray-800/30 last:border-0">
              {group.title && (
                <div className="px-5 pt-6 pb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                  {group.title}
                </div>
              )}
              <div className="py-1">
                {group.items.map((item: any, iIdx) => (
                  <button 
                    key={iIdx} 
                    onClick={() => {
                      if (item.action === 'export' && onExportExcel) {
                        onExportExcel();
                        onClose();
                      } else if (item.view) {
                        onNavigate(item.view);
                      } else {
                        onClose();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 active:bg-white/10 transition-colors group ${item.action === 'export' ? 'bg-green-900/10' : ''}`}
                  >
                    <span className={`text-xl opacity-80 group-active:scale-125 transition-transform ${item.action === 'export' ? 'text-green-500 opacity-100' : ''}`}>
                      {item.icon}
                    </span>
                    <span className={`text-[14px] font-bold text-gray-300 group-hover:text-white transition-colors text-right flex-grow pr-5 ${item.action === 'export' ? 'text-green-400' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="p-10 text-center opacity-30">
            <button className="text-[10px] font-black text-gray-500 hover:text-white transition-colors">جميع الحقوق محفوظه للمهندس حسام القباطي</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
