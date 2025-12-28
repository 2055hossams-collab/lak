
import React, { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  viewTitle: string;
  onSearchChange: (val: string) => void;
  onPrintClick: () => void;
  isSaving?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, viewTitle, onSearchChange, onPrintClick, isSaving }) => {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <header className="bg-[#004b93] text-white pt-10 pb-3 px-4 sticky top-0 z-50 shadow-lg border-b border-white/5 safe-top">
      <div className="flex items-center justify-between gap-2 h-10">
        {!isSearching ? (
          <>
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <button 
                onClick={onMenuClick} 
                className="p-2.5 -mr-2 active:scale-90 transition-transform rounded-xl hover:bg-white/10"
                aria-label="القائمة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex flex-col truncate">
                <h1 className="text-sm sm:text-base font-black truncate leading-tight tracking-tight">{viewTitle}</h1>
                {isSaving && (
                  <span className="text-[7px] font-bold text-blue-200 animate-pulse flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                    جارِ الحفظ...
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-0.5">
              <button 
                onClick={onPrintClick}
                className="p-2.5 hover:bg-white/10 rounded-xl active:scale-90 transition-all text-blue-100"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                 </svg>
              </button>
              <button 
                onClick={() => setIsSearching(true)}
                className="p-2.5 hover:bg-white/10 rounded-xl active:scale-90 transition-all text-blue-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center w-full bg-white/15 rounded-xl px-2 py-0.5 animate-in fade-in slide-in-from-left duration-200">
            <input 
              autoFocus
              type="text" 
              placeholder="ابحث هنا..."
              className="bg-transparent border-none outline-none flex-grow text-white placeholder-white/50 py-2 text-xs font-bold text-center"
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <button onClick={() => { setIsSearching(false); onSearchChange(''); }} className="p-2 text-white/70 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
