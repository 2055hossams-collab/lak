
import React from 'react';

interface GenericPlaceholderViewProps {
  title: string;
  icon: string;
  onBack: () => void;
}

const GenericPlaceholderView: React.FC<GenericPlaceholderViewProps> = ({ title, icon, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] text-white p-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="bg-[#1a2b3c] p-3 rounded-xl active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-black">{title}</h2>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center space-y-6 opacity-60">
        <div className="w-32 h-32 bg-[#141d26] rounded-full flex items-center justify-center text-6xl shadow-2xl border border-white/5 animate-pulse">
          {icon}
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-black tracking-tight">واجهة {title}</p>
          <p className="text-xs font-bold text-gray-500">جاري تفعيل كافة الوظائف البرمجية لهذا القسم...</p>
        </div>
      </div>

      <div className="bg-[#141d26] p-6 rounded-3xl border border-blue-900/20 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
           <span className="text-xs font-black text-gray-400">الحالة البرمجية</span>
           <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full font-bold">نشط</span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
           <div className="bg-blue-500 h-full w-3/4"></div>
        </div>
      </div>
    </div>
  );
};

export default GenericPlaceholderView;
