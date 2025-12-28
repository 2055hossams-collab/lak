
import React, { useState, useEffect } from 'react';

type SubView = 'main' | 'personal' | 'print' | 'vouchers' | 'inventory' | 'whatsapp' | 'other' | 'drive' | 'activation' | 'maintenance';

interface SettingsViewProps {
  onBack: () => void;
  initialSubView?: SubView;
  onExportFullExcel?: () => void;
}

// المكونات المساعدة للواجهة
const RadioGroup = ({ label, options, value, onChange, grid = false }: { label: string, options: { label: string, val: string }[], value: string, onChange: (v: string) => void, grid?: boolean }) => (
  <div className="bg-[#141d26] border border-blue-900/30 rounded-xl p-3 mb-2 shadow-sm">
    <p className="text-right font-bold text-gray-300 mb-3 text-[13px]">{label}</p>
    <div className={`flex items-center gap-2 ${grid ? 'justify-between flex-row-reverse' : 'justify-around'}`}>
      {options.map((opt) => (
        <label key={opt.val} className="flex items-center gap-1.5 cursor-pointer group">
           <div 
             onClick={() => onChange(opt.val)} 
             className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${value === opt.val ? 'border-orange-500 bg-transparent' : 'border-gray-600'}`}
           >
              {value === opt.val && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}
           </div>
           <span className={`text-[11px] font-bold ${value === opt.val ? 'text-blue-400' : 'text-gray-400'}`}>{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
);

const ToggleItem = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
  <div className="bg-[#141d26] border border-blue-900/30 rounded-xl p-3 mb-2 flex items-center justify-between shadow-sm hover:bg-[#1a2b3c] transition-colors">
     <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-5 bg-gray-700 rounded-full peer peer-checked:bg-orange-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 shadow-inner"></div>
     </label>
     <span className="text-[14px] font-bold text-gray-200 text-right flex-grow pr-4">{label}</span>
  </div>
);

const MediaRow = ({ label, onRemove }: { label: string, onRemove: () => void }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5">
     <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-[#141d26] border border-blue-900/30 rounded-lg flex items-center justify-center overflow-hidden">
           <img src="https://api.dicebear.com/7.x/initials/svg?seed=SA&backgroundColor=004b93" className="w-10 h-10 opacity-60" alt="preview" />
        </div>
        <button onClick={onRemove} className="text-orange-500 active:scale-90 transition-transform">
           <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z"/></svg>
        </button>
     </div>
     <span className="text-sm font-bold text-gray-200">{label}</span>
  </div>
);

const InputPair = ({ label, val1, val2, onChange1, onChange2, placeholder1, placeholder2 }: any) => (
  <div className="space-y-1 mb-3">
    <p className="text-right font-bold text-gray-300 text-sm mb-1">{label}</p>
    <div className="grid grid-cols-2 gap-2">
       <input 
         type="text" 
         value={val2} 
         placeholder={placeholder2}
         onChange={e => onChange2(e.target.value)} 
         className="w-full bg-[#0c0c0c] border border-blue-900/30 p-2.5 rounded text-xs text-center font-bold text-gray-400 outline-none focus:border-blue-500 placeholder-gray-600" 
       />
       <input 
         type="text" 
         value={val1} 
         placeholder={placeholder1}
         onChange={e => onChange1(e.target.value)} 
         className="w-full bg-[#0c0c0c] border border-blue-900/30 p-2.5 rounded text-xs text-center font-bold text-gray-400 outline-none focus:border-blue-500 placeholder-gray-600" 
       />
    </div>
  </div>
);

const SettingsView: React.FC<SettingsViewProps> = ({ onBack, initialSubView = 'main', onExportFullExcel }) => {
  const [activeSubView, setActiveSubView] = useState<SubView>(initialSubView);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sa_settings_full');
    return saved ? JSON.parse(saved) : {
      personal: { 
        nameAr: 'المحاسب المحستني برو', 
        nameEn: 'Smart Accountant Pro', 
        addressAr: 'الجمهورية اليمنية - صنعاء', 
        addressEn: "YEMEN SANA'A",
        phone: '000000000 967+',
        logoSize: 1.0
      },
      drive: { enabled: false, email: '', lastSync: '', autoBackup: true },
      activation: { status: 'نسخة برو مفعلة', code: 'SA-967-PRO-2025', expiryDate: '2030-01-01' },
      whatsapp: { header: 'المحاسب المحستني برو', footer: '', formatOwe: 'عليه : عليكم', formatHas: 'له : لكم', sendMethod: 'mobile', whatsappType: 'standard', countryKey: '+967', shareType: 'text', docFormat: 'pdf', docType: 'notice', imageSize: 1.0 },
      other: { multiCurrency: false, currencyName: 'ريال يمني', currencySymbol: 'ري', cloudBackupTo: 'drive', repeatBackupAlert: true, showDailyAsBox: true, showDebtPeriod: true, showTotalInMain: true },
      vouchers: { opTypeReceive: 'قبض : لــــه', opTypeSpend: 'صرف : عليــــه', receiptLine1: 'سطر1 : الأخ', receiptLine2: 'سطر2 : لكم مبلغ', paymentLine1: 'سطر1 : الأخ', paymentLine2: 'سطر2 : عليكم مبلغ', addRemBalance: true, showPrevBalance: true },
      inventory: { showItemsInStatement: true, useWareUnits: true, enableDiscount: false, enableVat: false, sellerName: 'المحاسب المحستني', taxNumber: '0', taxRate: '0%' },
      print: { method: 'pdf', size: 'A4', color: '#004b93', showHeader: true, repeatHeader: true, showDate: true, fontSize: 1.0 }
    };
  });

  useEffect(() => {
    localStorage.setItem('sa_settings_full', JSON.stringify(settings));
  }, [settings]);

  const renderMainSettings = () => {
    const mainOptions = [
      { id: 'personal', label: 'البيانات الشخصية والشعار', icon: '👤', color: 'bg-blue-600' },
      { id: 'print', label: 'إعدادات الطباعة والخطوط', icon: '🖨️', color: 'bg-indigo-600' },
      { id: 'inventory', label: 'الفواتير والمخازن والضرائب', icon: '📦', color: 'bg-emerald-600' },
      { id: 'whatsapp', label: 'إعدادات مراسلات الواتساب', icon: '💬', color: 'bg-green-600' },
      { id: 'drive', label: 'النسخ السحابي (Google Drive)', icon: '☁️', color: 'bg-sky-600' },
      { id: 'other', label: 'إعدادات العملات والنظام العامة', icon: '⚙️', color: 'bg-gray-600' },
      { id: 'activation', label: 'حالة التفعيل والاشتراك', icon: '💎', color: 'bg-amber-600' },
      { id: 'maintenance', label: 'صيانة قاعدة البيانات', icon: '🛠️', color: 'bg-rose-600' },
    ];

    return (
      <div className="p-4 space-y-3 pb-32 animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-[#004b93] to-[#002d5a] p-6 rounded-3xl mb-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-white/5 pointer-events-none"></div>
           <h3 className="text-xl font-black text-white mb-2">إعدادات النظام</h3>
           <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">تحكم كامل في واجهة وخصائص تطبيقك</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
           {mainOptions.map(opt => (
             <button 
               key={opt.id} 
               onClick={() => setActiveSubView(opt.id as SubView)}
               className="bg-[#141d26] p-4 rounded-2xl flex items-center justify-between border border-white/5 active:scale-[0.98] transition-all hover:bg-[#1a2b3c] group shadow-lg"
             >
                <div className="flex items-center gap-4">
                   <div className={`${opt.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner`}>
                      {opt.icon}
                   </div>
                   <span className="font-bold text-gray-200 text-sm">{opt.label}</span>
                </div>
                <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
             </button>
           ))}
        </div>

        {/* زر تصدير إكسل الشامل */}
        <div className="pt-6">
           <button 
             onClick={onExportFullExcel}
             className="w-full bg-[#107c41] hover:bg-[#0e6b38] p-5 rounded-2xl flex items-center justify-between shadow-xl active:scale-95 transition-all group border border-green-400/20"
           >
              <div className="flex items-center gap-4">
                 <div className="bg-white/10 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1.8 18H14l-2-3.4-2 3.4H8.2l2.9-4.5L8.2 9H10l2 3.4 2-3.4h1.8l-2.9 4.5 2.9 4.5zM13 9V3.5L18.5 9H13z"/>
                    </svg>
                 </div>
                 <div className="text-right">
                    <p className="font-black text-white text-sm">تصدير قاعدة البيانات (Excel)</p>
                    <p className="text-[10px] text-green-100 font-bold opacity-80">تصدير كافة الجداول والحسابات في ملف واحد</p>
                 </div>
              </div>
              <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
           </button>
        </div>
      </div>
    );
  };

  const renderSubView = () => {
    switch (activeSubView) {
      case 'main': return renderMainSettings();
      case 'personal':
        return (
          <div className="flex flex-col h-full bg-[#0c0c0c] overflow-y-auto pb-32 p-4 space-y-5 animate-in slide-in-from-right duration-300">
             <div className="space-y-1">
                <p className="text-right font-bold text-gray-400 text-sm">الإسم باللغة العربية</p>
                <input type="text" value={settings.personal.nameAr} onChange={e => setSettings({...settings, personal: {...settings.personal, nameAr: e.target.value}})} className="w-full bg-[#0c0c0c] border border-blue-900/30 p-2.5 rounded text-xs text-center font-bold text-gray-400 outline-none" />
             </div>
             <div className="space-y-1">
                <p className="text-right font-bold text-gray-400 text-sm">الإسم باللغة الإنجليزية</p>
                <input type="text" value={settings.personal.nameEn} onChange={e => setSettings({...settings, personal: {...settings.personal, nameEn: e.target.value}})} className="w-full bg-[#0c0c0c] border border-blue-900/30 p-2.5 rounded text-xs text-center font-bold text-gray-400 outline-none" />
             </div>
             <InputPair label="العنوان (عربي/إنجليزي)" val1={settings.personal.addressAr} val2={settings.personal.addressEn} onChange1={(v:any)=>setSettings({...settings, personal: {...settings.personal, addressAr: v}})} onChange2={(v:any)=>setSettings({...settings, personal: {...settings.personal, addressEn: v}})} />
             <div className="space-y-1">
                <p className="text-right font-bold text-gray-400 text-sm">أرقام التواصل</p>
                <input type="text" value={settings.personal.phone} onChange={e => setSettings({...settings, personal: {...settings.personal, phone: e.target.value}})} className="w-full bg-[#0c0c0c] border border-blue-900/30 p-2.5 rounded text-xs text-center font-bold text-gray-400 outline-none" />
             </div>
             <div className="pt-2 space-y-4">
                <MediaRow label="شعار المؤسسة" onRemove={() => {}} />
                <MediaRow label="ختم المؤسسة" onRemove={() => {}} />
             </div>
             <div className="bg-[#141d26] border border-blue-900/30 rounded-xl p-3 mt-4">
                <p className="text-right font-bold text-gray-200 mb-3 text-[14px]">حجم الشعار في المطبوعات</p>
                <div className="flex items-center justify-between">
                   <button onClick={() => setSettings({...settings, personal: {...settings.personal, logoSize: Math.max(0, settings.personal.logoSize - 0.1)}})} className="w-9 h-9 bg-orange-600 rounded flex items-center justify-center shadow-lg active:scale-90"><span className="text-xl font-black">-</span></button>
                   <span className="text-lg font-bold text-blue-400 font-mono">{settings.personal.logoSize.toFixed(1)}</span>
                   <button onClick={() => setSettings({...settings, personal: {...settings.personal, logoSize: settings.personal.logoSize + 0.1}})} className="w-9 h-9 bg-[#004b93] rounded flex items-center justify-center shadow-lg active:scale-90"><span className="text-xl font-black">+</span></button>
                </div>
             </div>
          </div>
        );

      case 'print':
        return (
          <div className="flex flex-col h-full bg-[#0c0c0c] overflow-y-auto pb-32 p-4 space-y-2 animate-in slide-in-from-right duration-300">
            <RadioGroup label="طريقة الطباعة" options={[{label: 'PDF', val: 'pdf'}, {label: 'طابعة مباشرة', val: 'printer'}]} value={settings.print.method} onChange={v => setSettings({...settings, print: {...settings.print, method: v}})} />
            <RadioGroup label="حجم الصفحة" options={[{label: 'A4', val: 'A4'}, {label: '80mm', val: '80mm'}, {label: '58mm', val: '58mm'}]} value={settings.print.size} onChange={v => setSettings({...settings, print: {...settings.print, size: v}})} />
            <ToggleItem label="عرض الترويسة العلوية" value={settings.print.showHeader} onChange={v => setSettings({...settings, print: {...settings.print, showHeader: v}})} />
            <ToggleItem label="عرض تاريخ الطباعة" value={settings.print.showDate} onChange={v => setSettings({...settings, print: {...settings.print, showDate: v}})} />
            <div className="bg-[#141d26] border border-blue-900/30 rounded-xl p-3 mb-2">
                <p className="text-right font-bold text-gray-200 mb-3 text-[14px]">حجم خط المطبوعات</p>
                <div className="flex items-center justify-between">
                   <button onClick={() => setSettings({...settings, print: {...settings.print, fontSize: Math.max(0, settings.print.fontSize - 0.1)}})} className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center"><span className="text-xl font-black">-</span></button>
                   <span className="text-lg font-bold text-blue-400 font-mono">{settings.print.fontSize.toFixed(1)}</span>
                   <button onClick={() => setSettings({...settings, print: {...settings.print, fontSize: settings.print.fontSize + 0.1}})} className="w-8 h-8 bg-[#004b93] rounded flex items-center justify-center"><span className="text-xl font-black">+</span></button>
                </div>
             </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="flex flex-col h-full bg-[#0c0c0c] overflow-y-auto pb-32 p-4 space-y-4 animate-in slide-in-from-right duration-300">
             <div className="bg-[#004b93] p-1.5 text-center rounded-sm font-bold text-xs text-white uppercase">بيانات الفواتير والمخازن</div>
             <ToggleItem label="عرض أصناف الفاتورة في كشف الحساب" value={settings.inventory.showItemsInStatement} onChange={v => setSettings({...settings, inventory: {...settings.inventory, showItemsInStatement: v}})} />
             <ToggleItem label="استخدام الوحدات (كرتون/حبة)" value={settings.inventory.useWareUnits} onChange={v => setSettings({...settings, inventory: {...settings.inventory, useWareUnits: v}})} />
             <ToggleItem label="تفعيل الخصومات في المبيعات" value={settings.inventory.enableDiscount} onChange={v => setSettings({...settings, inventory: {...settings.inventory, enableDiscount: v}})} />
             <ToggleItem label="تفعيل ضريبة القيمة المضافة" value={settings.inventory.enableVat} onChange={v => setSettings({...settings, inventory: {...settings.inventory, enableVat: v}})} />
             <div className="space-y-1">
                <p className="text-right font-bold text-gray-300 text-xs px-2">إسم البائع الضريبي</p>
                <input type="text" value={settings.inventory.sellerName} onChange={e => setSettings({...settings, inventory: {...settings.inventory, sellerName: e.target.value}})} className="w-full bg-[#141d26] border border-blue-900/30 p-3 rounded-xl text-right font-bold text-gray-400 outline-none" />
             </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="flex flex-col h-full bg-[#0c0c0c] overflow-y-auto pb-32 p-4 space-y-3 animate-in slide-in-from-right duration-300">
             <div className="space-y-1">
                <p className="text-right font-bold text-gray-200 text-[13px] mb-1">مقدمة الرسالة</p>
                <input type="text" value={settings.whatsapp.header} onChange={e => setSettings({...settings, whatsapp: {...settings.whatsapp, header: e.target.value}})} className="w-full bg-[#141d26] border border-blue-900/30 p-2.5 rounded text-xs text-center font-bold text-gray-300 outline-none" />
             </div>
             <InputPair label="صيغة الرصيد (له/عليه)" val1={settings.whatsapp.formatHas} val2={settings.whatsapp.formatOwe} onChange1={(v:any)=>setSettings({...settings, whatsapp: {...settings.whatsapp, formatHas: v}})} onChange2={(v:any)=>setSettings({...settings, whatsapp: {...settings.whatsapp, formatOwe: v}})} />
             <RadioGroup label="نوع الواتساب" options={[{label: 'الأخضر العادي', val: 'standard'}, {label: 'واتساب أعمال', val: 'business'}]} value={settings.whatsapp.whatsappType} onChange={v => setSettings({...settings, whatsapp: {...settings.whatsapp, whatsappType: v}})} />
             <div className="bg-[#141d26] border border-blue-900/30 rounded-xl p-3 mb-2 shadow-sm">
                <p className="text-right font-bold text-gray-200 mb-4 text-[13px]">حجم الصورة المرسلة</p>
                <div className="flex items-center justify-between">
                   <button onClick={() => setSettings({...settings, whatsapp: {...settings.whatsapp, imageSize: Math.max(0, settings.whatsapp.imageSize - 0.1)}})} className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center"><span className="text-xl font-black">-</span></button>
                   <span className="text-lg font-bold text-blue-400 font-mono">{settings.whatsapp.imageSize.toFixed(1)}</span>
                   <button onClick={() => setSettings({...settings, whatsapp: {...settings.whatsapp, imageSize: settings.whatsapp.imageSize + 0.1}})} className="w-8 h-8 bg-[#004b93] rounded flex items-center justify-center"><span className="text-xl font-black">+</span></button>
                </div>
             </div>
          </div>
        );

      case 'drive':
        return (
          <div className="p-4 space-y-4 animate-in slide-in-from-right duration-300">
             <div className="bg-[#141d26] p-6 rounded-2xl border border-blue-900/30 text-center space-y-4 shadow-xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl border border-white/10">🔺</div>
                <h3 className="font-black text-xl">جوجل درايف</h3>
                <p className="text-xs text-gray-500">قم بربط حسابك لتأمين بياناتك وسهولة استعادتها</p>
             </div>
             <ToggleItem label="تفعيل المزامنة التلقائية" value={settings.drive.enabled} onChange={v => setSettings({...settings, drive: {...settings.drive, enabled: v}})} />
             <div className="space-y-1">
                <p className="text-right font-bold text-gray-400 text-xs px-2">البريد الإلكتروني</p>
                <input type="email" value={settings.drive.email} placeholder="example@gmail.com" onChange={e => setSettings({...settings, drive: {...settings.drive, email: e.target.value}})} className="w-full bg-[#141d26] border border-blue-900/30 p-3 rounded-xl text-center font-bold text-blue-400 outline-none" />
             </div>
             <button className="w-full bg-blue-700 py-4 rounded-xl font-black shadow-lg active:scale-95 transition-all text-sm">تسجيل الدخول وربط الحساب</button>
          </div>
        );

      case 'activation':
        return (
          <div className="p-4 space-y-4 animate-in slide-in-from-right duration-300">
             <div className="bg-[#141d26] p-6 rounded-2xl border border-yellow-900/30 text-center space-y-3 shadow-2xl">
                <div className="text-5xl mb-2">💎</div>
                <h3 className="font-black text-xl">المحاسب المحستني برو</h3>
                <div className="bg-yellow-900/20 text-yellow-500 py-1.5 px-6 rounded-full text-[12px] font-black inline-block border border-yellow-500/30 uppercase">الحالة: {settings.activation.status}</div>
             </div>
             <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded-2xl space-y-2">
                <p className="text-right text-gray-400 text-xs font-bold">كود الجهاز</p>
                <div className="bg-[#141d26] p-3 rounded-xl text-center font-black text-blue-400 tracking-widest text-lg">SA-967-8822-PRO</div>
             </div>
             <div className="space-y-1">
                <p className="text-right font-bold text-gray-400 text-xs px-2">كود التفعيل</p>
                <input type="text" value={settings.activation.code} readOnly className="w-full bg-[#141d26] border border-blue-900/30 p-3 rounded-xl text-center font-black text-white outline-none tracking-widest" />
             </div>
             <p className="text-center text-[10px] text-gray-500 font-bold">تاريخ الإنتهاء: {settings.activation.expiryDate}</p>
             <button className="w-full bg-[#b05b00] py-4 rounded-xl font-black shadow-lg active:scale-95 transition-all">تحديث التفعيل</button>
          </div>
        );

      case 'maintenance':
        return (
          <div className="p-4 space-y-4 animate-in slide-in-from-right duration-300">
             <div className="bg-red-900/10 border border-red-900/30 p-5 rounded-2xl text-center">
                <p className="text-sm text-red-400 font-black mb-1">مركز صيانة قاعدة البيانات</p>
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed">استخدم هذه الأدوات فقط في حالة وجود خلل في الأرصدة أو الحركات.</p>
             </div>
             <button className="w-full bg-[#141d26] border border-white/5 p-5 rounded-xl flex items-center justify-between active:bg-red-900/20 transition-all group">
                <span className="text-red-500 font-black text-xs group-active:scale-95">بدء التنفيذ</span>
                <span className="text-sm font-bold">إصلاح توازن الحسابات</span>
             </button>
             <button className="w-full bg-[#141d26] border border-white/5 p-5 rounded-xl flex items-center justify-between active:bg-red-900/20 transition-all group">
                <span className="text-red-500 font-black text-xs group-active:scale-95">بدء التنفيذ</span>
                <span className="text-sm font-bold">إعادة جدولة الحركات اليومية</span>
             </button>
             <button className="w-full bg-[#141d26] border border-red-900/40 p-5 rounded-xl flex items-center justify-between active:bg-red-900/60 transition-all group shadow-2xl">
                <span className="text-white font-black text-xs group-active:scale-95">مسح</span>
                <span className="text-sm font-black text-red-500">حذف كافة البيانات (تصفير التطبيق)</span>
             </button>
          </div>
        );

      case 'other':
        return (
          <div className="flex flex-col h-full bg-[#0c0c0c] overflow-y-auto pb-32 p-4 animate-in slide-in-from-right duration-300">
             <div className="bg-[#004b93] p-1.5 text-center rounded-sm font-bold text-xs text-white mb-2 uppercase">إعدادات العملات الرسمية</div>
             <ToggleItem label="تفعيل تعدد العملات" value={settings.other.multiCurrency} onChange={v => setSettings({...settings, other: {...settings.other, multiCurrency: v}})} />
             <div className="bg-[#141d26] border border-blue-900/30 rounded-xl p-3 mb-2 shadow-sm">
                <p className="text-right font-bold text-gray-300 mb-3 text-[12px]">العملة الرئيسية (الريال اليمني)</p>
                <div className="grid grid-cols-2 gap-2">
                   <input type="text" value={settings.other.currencySymbol} onChange={e => setSettings({...settings, other: {...settings.other, currencySymbol: e.target.value}})} className="w-full bg-[#0c0c0c] border border-blue-900/30 p-2 rounded text-[11px] text-center font-bold text-gray-400 outline-none" placeholder="الإختصار : ري" />
                   <input type="text" value={settings.other.currencyName} onChange={e => setSettings({...settings, other: {...settings.other, currencyName: e.target.value}})} className="w-full bg-[#0c0c0c] border border-blue-900/30 p-2 rounded text-[11px] text-center font-bold text-gray-400 outline-none" placeholder="الأسم : ريال يمني" />
                </div>
             </div>
             <ToggleItem label="عرض إجمالي الحسابات في الواجهة" value={settings.other.showTotalInMain} onChange={v => setSettings({...settings, other: {...settings.other, showTotalInMain: v}})} />
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] text-white">
      <div className="bg-[#004b93] p-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (activeSubView === 'main') onBack();
              else setActiveSubView('main');
            }} 
            className="p-2 bg-white/10 rounded-xl active:scale-90 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-lg font-black">
            {activeSubView === 'main' ? 'إعدادات التطبيق' : 'الرجوع للقائمة'}
          </h2>
        </div>
      </div>

      <div className="flex-grow overflow-hidden relative">
        {renderSubView()}
      </div>
    </div>
  );
};

export default SettingsView;
