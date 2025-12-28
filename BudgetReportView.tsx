
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

interface BudgetReportViewProps {
  transactions: Transaction[];
  budgetLimits: Record<string, number>;
  onUpdateBudgetLimit: (category: string, amount: number) => void;
  onBack: () => void;
  onCategoryClick?: (categoryName: string) => void;
  startDate: string;
  endDate: string;
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
}

const BudgetReportView: React.FC<BudgetReportViewProps> = ({ 
  transactions, 
  budgetLimits, 
  onUpdateBudgetLimit, 
  onBack, 
  onCategoryClick,
  startDate,
  endDate,
  setStartDate,
  setEndDate
}) => {
  const formatNum = (num: number) => {
    if (num === 0) return "0";
    return Math.floor(num).toLocaleString('en-US');
  };

  const budgetCategories = [
    "نفقات ذات طابع خاص", "تنقلات داخلية", "قرطاسية", "اتصالات", "مياه", "كهرباء",
    "أجور عمال", "إيجارات", "الورشات الثقافية", "صرف المواقع اليومية والمواجهة",
    "مواجهة الاعتماد الشهري", "صيانة"
  ];

  const reportItems = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return budgetCategories.map((cat, index) => {
      const spentInPeriod = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.category === cat && t.type === 'debit' && tDate >= start && tDate <= end;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSpent = transactions
        .filter(t => t.category === cat && t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      const approved = budgetLimits[cat] || 0; 
      const diff = approved - totalSpent;
      
      let statusText = "آمن ✅";
      const usageRatio = approved > 0 ? (totalSpent / approved) : 0;

      if (diff < 0) statusText = "تجاوز ❌";
      else if (usageRatio >= 0.8) statusText = "قارب ⚠️";

      return {
        id: index + 1,
        name: cat,
        spentInPeriod,
        totalSpent,
        approved,
        diff,
        statusText,
        isExceeded: diff < 0
      };
    });
  }, [transactions, startDate, endDate, budgetLimits]);

  const totals = useMemo(() => {
    const mainItems = reportItems.filter(item => item.name !== "صيانة");
    return mainItems.reduce((acc, curr) => ({
      spentInPeriod: acc.spentInPeriod + curr.spentInPeriod,
      totalSpent: acc.totalSpent + curr.totalSpent,
      approved: acc.approved + curr.approved,
      diff: acc.diff + curr.diff
    }), { spentInPeriod: 0, totalSpent: 0, approved: 0, diff: 0 });
  }, [reportItems]);

  const maintenanceItem = reportItems.find(i => i.name === "صيانة");

  const exportToExcel = () => {
    try {
      const headers = ["م", "البند", "المنصرف للفترة", "إجمالي المنصرف", "المعتمد", "الفارق", "الحالة"];
      
      // تجهيز البيانات للجدول الرئيسي
      const mainData = reportItems.filter(i => i.name !== "صيانة").map(item => ({
        "م": item.id,
        "البند": item.name,
        "المنصرف للفترة": item.spentInPeriod,
        "إجمالي المنصرف": item.totalSpent,
        "المعتمد": item.approved,
        "الفارق": item.diff,
        "الحالة": item.statusText
      }));

      // إضافة سطر الإجمالي
      mainData.push({
        "م": "",
        "البند": "الإجمالي الكلي",
        "المنصرف للفترة": totals.spentInPeriod,
        "إجمالي المنصرف": totals.totalSpent,
        "المعتمد": totals.approved,
        "الفارق": totals.diff,
        "الحالة": totals.diff < 0 ? "تجاوز" : "مستقر"
      });

      // إضافة سطر الصيانة
      if (maintenanceItem) {
        mainData.push({
          "م": maintenanceItem.id.toString(),
          "البند": maintenanceItem.name,
          "المنصرف للفترة": maintenanceItem.spentInPeriod,
          "إجمالي المنصرف": maintenanceItem.totalSpent,
          "المعتمد": maintenanceItem.approved,
          "الفارق": maintenanceItem.diff,
          "الحالة": maintenanceItem.statusText
        });
      }

      const worksheet = XLSX.utils.json_to_sheet(mainData, { header: headers });
      
      // إعدادات الاتجاه من اليمين لليسار
      worksheet['!dir'] = 'rtl';
      const workbook = XLSX.utils.book_new();
      workbook.Workbook = { Views: [{ RTL: true }] };
      
      XLSX.utils.book_append_sheet(workbook, worksheet, "تقرير الاعتماد");
      XLSX.writeFile(workbook, `تقرير_الاعتماد_${startDate}_الى_${endDate}.xlsx`);
    } catch (error) {
      alert("حدث خطأ أثناء تصدير ملف الإكسل");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-black overflow-hidden font-sans">
      {/* هيدر التقرير العلوي */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between print:hidden shrink-0 safe-top">
        <button onClick={onBack} className="p-2 bg-white border-2 border-gray-200 rounded-xl active:scale-95 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-center">
          <h1 className="text-sm sm:text-lg font-black text-black">تقرير الاعتماد الشهري</h1>
          <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">المحاسب المستني برو</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToExcel} 
            className="p-2 bg-green-600 text-white rounded-xl active:scale-95 shadow-md"
            title="تصدير إكسل"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1.8 18H14l-2-3.4-2 3.4H8.2l2.9-4.5L8.2 9H10l2 3.4 2-3.4h1.8l-2.9 4.5 2.9 4.5zM13 9V3.5L18.5 9H13z"/>
            </svg>
          </button>
          <button onClick={() => window.print()} className="p-2 bg-black text-white rounded-xl active:scale-95 shadow-md">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"/></svg>
          </button>
        </div>
      </div>

      {/* فلاتر التاريخ المحسنة للجوال */}
      <div className="bg-white p-3 border-b print:hidden shrink-0">
         <div className="grid grid-cols-2 gap-3">
           <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black text-gray-400 mr-1">من:</span>
             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-black text-black outline-none w-full" />
           </div>
           <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black text-gray-400 mr-1">إلى:</span>
             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-black text-black outline-none w-full" />
           </div>
         </div>
      </div>

      {/* منطقة الجدول مع دعم التمرير الأفقي */}
      <div className="flex-grow overflow-auto select-text custom-scrollbar bg-gray-50/30">
        <div className="min-w-[900px] p-4 bg-white scroll-hint">
          <table className="w-full border-collapse border-[3px] border-black text-sm font-bold text-black">
            <thead>
              <tr className="bg-[#b3ffb3]">
                <th className="border-2 border-black p-3 w-12 text-center font-black">م</th>
                <th className="border-2 border-black p-3 text-right font-black">البند</th>
                <th className="border-2 border-black p-3 w-32 text-center font-black bg-gray-200/50">المنصرف للفترة</th>
                <th className="border-2 border-black p-3 w-32 text-center font-black">إجمالي المنصرف</th>
                <th className="border-2 border-black p-3 w-32 text-center font-black bg-[#ffff99]/50">المعتمد</th>
                <th className="border-2 border-black p-3 w-32 text-center font-black">الفارق</th>
                <th className="border-2 border-black p-3 w-28 text-center font-black">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {reportItems.filter(i => i.name !== "صيانة").map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 border-b-2 border-black">
                  <td className="border-2 border-black p-2 text-center bg-gray-100 font-black">{item.id}</td>
                  <td 
                    className="border-2 border-black p-2 text-right pr-4 font-black cursor-pointer active:bg-gray-200 transition-colors" 
                    onClick={() => onCategoryClick?.(item.name)}
                  >
                    {item.name}
                  </td>
                  <td className="border-2 border-black p-2 text-center font-black bg-gray-50/50">{formatNum(item.spentInPeriod)}</td>
                  <td className="border-2 border-black p-2 text-center font-black">{formatNum(item.totalSpent)}</td>
                  <td className="border-2 border-black p-0 text-center font-black">
                    <input 
                      type="number"
                      value={budgetLimits[item.name] || ""}
                      onChange={(e) => onUpdateBudgetLimit(item.name, parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-center p-2 font-black outline-none focus:bg-black focus:text-white"
                      placeholder="0"
                    />
                  </td>
                  <td className={`border-2 border-black p-2 text-center font-black ${item.isExceeded ? 'bg-red-600 text-white' : ''}`}>
                    {formatNum(item.diff)}
                  </td>
                  <td className="border-2 border-black p-2 text-center font-black text-[10px]">
                    {item.statusText}
                  </td>
                </tr>
              ))}
              
              <tr className="bg-[#ffff00] border-t-4 border-black">
                <td className="border-2 border-black p-3 text-center">---</td>
                <td className="border-2 border-black p-3 text-right pr-4 font-black">الإجمالي الكلي</td>
                <td className="border-2 border-black p-3 text-center font-black">{formatNum(totals.spentInPeriod)}</td>
                <td className="border-2 border-black p-3 text-center font-black">{formatNum(totals.totalSpent)}</td>
                <td className="border-2 border-black p-3 text-center font-black">{formatNum(totals.approved)}</td>
                <td className="border-2 border-black p-3 text-center font-black">{formatNum(totals.diff)}</td>
                <td className="border-2 border-black p-3 text-center text-[10px] font-black">{totals.diff < 0 ? "تجاوز" : "مستقر"}</td>
              </tr>

              {maintenanceItem && (
                <tr className="border-t-4 border-black">
                  <td className="border-2 border-black p-2 text-center bg-gray-100 font-black">{maintenanceItem.id}</td>
                  <td 
                    className="border-2 border-black p-2 text-right pr-4 font-black cursor-pointer active:bg-gray-200 transition-colors"
                    onClick={() => onCategoryClick?.(maintenanceItem.name)}
                  >
                    {maintenanceItem.name}
                  </td>
                  <td className="border-2 border-black p-2 text-center font-black bg-gray-50/50">{formatNum(maintenanceItem.spentInPeriod)}</td>
                  <td className="border-2 border-black p-2 text-center font-black">{formatNum(maintenanceItem.totalSpent)}</td>
                  <td className="border-2 border-black p-0 text-center font-black">
                    <input 
                      type="number"
                      value={budgetLimits[maintenanceItem.name] || ""}
                      onChange={(e) => onUpdateBudgetLimit(maintenanceItem.name, parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-center p-2 font-black outline-none focus:bg-black focus:text-white"
                      placeholder="0"
                    />
                  </td>
                  <td className={`border-2 border-black p-2 text-center font-black ${maintenanceItem.isExceeded ? 'bg-red-600 text-white' : ''}`}>
                    {formatNum(maintenanceItem.diff)}
                  </td>
                  <td className="border-2 border-black p-2 text-center font-black text-[10px]">{maintenanceItem.statusText}</td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="mt-10 hidden print:grid grid-cols-3 text-center font-black text-sm gap-8 text-black">
             <div className="border-t-2 border-black pt-4">المحاسب المختص</div>
             <div className="border-t-2 border-black pt-4">المدير المالي</div>
             <div className="border-t-2 border-black pt-4">المدير العام</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetReportView;
