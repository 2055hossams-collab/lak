
import React from 'react';
import { AppMessage } from '../types';

const MessagesView: React.FC<{ messages: AppMessage[]; onBack: () => void }> = ({ messages, onBack }) => {
  return (
    <div className="p-4 space-y-6">
       <div className="flex items-center gap-4">
        <button onClick={onBack} className="bg-[#1a2b3c] p-3 rounded-xl"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
        <h2 className="text-xl font-black">الرسائل المرسلة</h2>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-20 grayscale opacity-20"><span className="text-6xl">💬</span><p className="mt-4 font-black">لا يوجد سجل رسائل</p></div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="bg-[#141d26] p-4 rounded-xl border border-white/5 space-y-2 shadow-lg">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-blue-400">{msg.to}</span>
                  <span className="text-[10px] bg-blue-900/30 px-2 py-0.5 rounded text-blue-300 font-bold">{msg.method}</span>
               </div>
               <p className="text-xs text-gray-300 leading-relaxed">{msg.content}</p>
               <p className="text-[8px] text-gray-600 text-left font-bold">{new Date(msg.date).toLocaleString('ar-YE')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesView;
