
import React, { useState } from 'react';
import { Category } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  onSaveCategory: (c: Category) => void;
  onBack: () => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, onSaveCategory, onBack }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name) return;
    onSaveCategory({ id: Math.random().toString(36).substr(2, 9), name });
    setName('');
  };

  return (
    <div className="p-4 space-y-6">
       <div className="flex items-center gap-4">
        <button onClick={onBack} className="bg-[#1a2b3c] p-3 rounded-xl"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
        <h2 className="text-xl font-black">إدارة الأصناف والفئات</h2>
      </div>

      <div className="bg-[#141d26] p-5 rounded-2xl border border-blue-500/20 space-y-3">
         <input 
           type="text" value={name} onChange={e => setName(e.target.value)} 
           className="w-full bg-[#0c0c0c] border border-gray-800 p-3 rounded-lg text-center font-bold outline-none" 
           placeholder="اسم الفئة الجديدة" 
         />
         <button onClick={handleSave} className="w-full bg-blue-700 py-3 rounded-lg font-black text-white active:scale-95 transition-all">إضافة فئة</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
         {categories.map(c => (
           <div key={c.id} className="bg-[#141d26] p-4 rounded-xl border border-white/5 text-center font-bold text-sm shadow-md">
              {c.name}
           </div>
         ))}
      </div>
    </div>
  );
};

export default CategoriesView;
