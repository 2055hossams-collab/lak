
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppView, Account, Transaction, AccountType, Product, Order, Category, AppMessage } from './types.ts';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Dashboard from './components/Dashboard.tsx';
import Sidebar from './components/Sidebar.tsx';
import AccountListView from './components/AccountListView.tsx';
import AddAccountModal from './components/AddAccountModal.tsx';
import AddTransactionModal from './components/AddTransactionModal.tsx';
import StatementView from './components/StatementView.tsx';
import DailyMovementView from './components/DailyMovementView.tsx';
import InventoryView from './components/InventoryView.tsx';
import ReportsView from './components/ReportsView.tsx';
import ExchangeView from './components/ExchangeView.tsx';
import SettingsView from './components/SettingsView.tsx';
import MessagesView from './components/MessagesView.tsx';
import BudgetReportView from './components/BudgetReportView.tsx';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

const Toast: React.FC<{ message: string; type: 'success' | 'info' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-600/90 border-green-400',
    info: 'bg-blue-600/90 border-blue-400',
    error: 'bg-red-600/90 border-red-400'
  };

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 duration-300 ${colors[type]}`}>
      <span className="text-white font-black text-sm whitespace-nowrap">{message}</span>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  const [reportStartDate, setReportStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);

  // تهيئة مميزات الـ APK الأصلية عند التشغيل
  useEffect(() => {
    const onDeviceReady = () => {
      console.log("Cordova is ready!");
      
      // ضبط شريط الحالة (StatusBar)
      if ((window as any).StatusBar) {
        (window as any).StatusBar.backgroundColorByHexString("#004b93");
        (window as any).StatusBar.styleLightContent();
      }
      
      // ضبط لون شريط التنقل السفلي في أندرويد
      if ((window as any).NavigationBar) {
        (window as any).NavigationBar.backgroundColorByHexString("#0c0c0c", false);
      }

      // طلب أذونات التخزين في أندرويد 10 وما فوق
      const permissions = (window as any).cordova?.plugins?.permissions;
      if (permissions) {
        permissions.requestPermissions([
          permissions.WRITE_EXTERNAL_STORAGE,
          permissions.READ_EXTERNAL_STORAGE
        ], (status: any) => {
          if(!status.hasPermission) console.warn("Storage permission denied");
        }, () => console.error("Permission error"));
      }
    };
    document.addEventListener("deviceready", onDeviceReady, false);
    return () => document.removeEventListener("deviceready", onDeviceReady);
  }, []);

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('sa_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sa_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sa_budget_limits');
    return saved ? JSON.parse(saved) : {};
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sa_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<AppMessage[]>(() => {
    const saved = localStorage.getItem('sa_messages');
    return saved ? JSON.parse(saved) : [];
  });

  // حفظ البيانات في LocalStorage (يعمل أوفلاين بالكامل)
  useEffect(() => {
    setIsSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem('sa_accounts', JSON.stringify(accounts));
      localStorage.setItem('sa_transactions', JSON.stringify(transactions));
      localStorage.setItem('sa_budget_limits', JSON.stringify(budgetLimits));
      localStorage.setItem('sa_products', JSON.stringify(products));
      localStorage.setItem('sa_messages', JSON.stringify(messages));
      setIsSaving(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [accounts, transactions, budgetLimits, products, messages]);

  const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // دالة تصدير الملفات الأصلية لـ APK (Excel / PDF)
  const cordovaAction = (data: Uint8Array, fileName: string, mimeType: string, isShare: boolean = false) => {
    if (!(window as any).cordova) {
      // إذا كان يعمل كـ PWA أو في المتصفح
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      return;
    }
    
    // التعامل مع نظام ملفات Cordova (Android/iOS)
    const blob = new Blob([data], { type: mimeType });
    const storagePath = (window as any).cordova.file.externalRootDirectory || (window as any).cordova.file.dataDirectory;
    const downloadFolder = storagePath + "Download/";

    (window as any).resolveLocalFileSystemURL(storagePath, (dirEntry: any) => {
      // محاولة الحفظ في مجلد التنزيلات العام إذا أمكن، أو مجلد التطبيق الخاص
      dirEntry.getFile(fileName, { create: true, exclusive: false }, (fileEntry: any) => {
        fileEntry.createWriter((fileWriter: any) => {
          fileWriter.onwriteend = () => {
            if (isShare && (window as any).plugins?.socialsharing) {
              (window as any).plugins.socialsharing.share(null, fileName, fileEntry.nativeURL, null);
            } else {
              notify("تم تصدير الملف بنجاح إلى ذاكرة الهاتف", "success");
              // فتح الملف فوراً بعد التصدير
              if ((window as any).cordova.plugins.fileOpener2) {
                (window as any).cordova.plugins.fileOpener2.open(fileEntry.nativeURL, mimeType);
              }
            }
          };
          fileWriter.onerror = (e: any) => notify("خطأ في كتابة الملف", "error");
          fileWriter.write(blob);
        });
      }, (err: any) => notify("لا يمكن إنشاء ملف في هذا المسار", "error"));
    }, (err: any) => notify("خطأ في الوصول لذاكرة الهاتف", "error"));
  };

  const getContextWorkbook = () => {
    const wb = XLSX.utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };
    let data: any[] = [];
    let name = "المحاسب_المحستني";

    switch (currentView) {
      case AppView.STATEMENT:
        if (selectedAccountId) {
          const acc = accounts.find(a => a.id === selectedAccountId);
          name = `كشف_${acc?.name || 'حساب'}`;
          const accTxs = transactions.filter(t => t.accountId === selectedAccountId).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          let bal = 0;
          data = accTxs.map((t, i) => {
            bal += (t.type === 'debit' ? t.amount : -t.amount);
            return { "م": i + 1, "التاريخ": new Date(t.date).toLocaleDateString('ar-YE'), "البيان": t.note, "مدين": t.type === 'debit' ? t.amount : 0, "دائن": t.type === 'credit' ? t.amount : 0, "الرصيد": bal, "البند": t.category || "عام" };
          });
        }
        break;
      case AppView.DAILY_MOVEMENT:
        name = "الحركة_اليومية";
        const todayStr = new Date().toDateString();
        data = transactions.filter(t => new Date(t.date).toDateString() === todayStr).map((t, i) => ({
          "م": i + 1, "الحساب": accounts.find(a => a.id === t.accountId)?.name || "---", "مدين": t.type === 'debit' ? t.amount : 0, "دائن": t.type === 'credit' ? t.amount : 0, "البيان": t.note, "الوقت": new Date(t.date).toLocaleTimeString('ar-YE')
        }));
        break;
      case AppView.BUDGET_REPORT:
        name = "تقرير_الميزانية";
        data = Object.keys(budgetLimits).map((cat, i) => {
          const spent = transactions.filter(t => t.category === cat && t.type === 'debit').reduce((s, t) => s + t.amount, 0);
          return { "م": i + 1, "البند": cat, "المعتمد": budgetLimits[cat], "المنصرف": spent, "المتبقي": budgetLimits[cat] - spent };
        });
        break;
      default:
        data = accounts.map((a, i) => ({ "م": i + 1, "الاسم": a.name, "النوع": a.type, "الرصيد": a.balance, "الحالة": a.balance >= 0 ? "مدين" : "دائن" }));
        break;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!dir'] = 'rtl';
    XLSX.utils.book_append_sheet(wb, ws, "التقرير");
    return { wb, name };
  };

  const handleExportExcel = (isShare = false) => {
    try {
      setIsPrintMenuOpen(false);
      const { wb, name } = getContextWorkbook();
      const fileName = `${name}_${new Date().getTime()}.xlsx`;
      const mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      cordovaAction(new Uint8Array(wbout), fileName, mime, isShare);
    } catch (e) { notify("خطأ في معالجة ملف الإكسل", "error"); }
  };

  const handleNativePrint = (html: string) => {
    if ((window as any).cordova?.plugins?.printer) {
      (window as any).cordova.plugins.printer.print(html);
    } else {
      window.print();
    }
  };

  const handleBalanceConfirmation = (isShare = false) => {
    setIsPrintMenuOpen(false);
    if (!selectedAccountId) {
      notify("يرجى فتح كشف حساب أولاً", "info");
      return;
    }
    const acc = accounts.find(a => a.id === selectedAccountId);
    if (!acc) return;
    
    const msg = `💎 مصادقة رصيد 💎\nإلى الأخ/ ${acc.name}\nنحيطكم علماً بأن رصيدكم لدينا هو: ${Math.abs(acc.balance).toLocaleString()} ريال (${acc.balance >= 0 ? 'مدين' : 'دائن'}).\nتاريخ: ${new Date().toLocaleString('ar-YE')}\nصادر عن: المحاسب المحستني برو`;

    if (isShare) {
      if ((window as any).plugins?.socialsharing) {
        (window as any).plugins.socialsharing.share(msg, "مصادقة رصيد");
      } else if (navigator.share) {
        navigator.share({ title: 'مصادقة رصيد', text: msg });
      }
    } else {
      const printHtml = `<div dir="rtl" style="font-family: Arial; padding: 40px; border: 4px double #004b93; text-align: center;"><h2>مـصادقة رصـيد</h2><hr/><p>الأخ/ ${acc.name}</p><h3>الرصيد الحالي: ${Math.abs(acc.balance).toLocaleString()} ريال</h3><p>الحالة: <b>${acc.balance >= 0 ? 'مدين (عليكم)' : 'دائن (لكم)'}</b></p><br/><br/><p>توقيع المختص: ....................</p></div>`;
      handleNativePrint(printHtml);
    }
  };

  const appTotals = useMemo(() => {
    let owe = 0; let has = 0;
    accounts.forEach(acc => {
      if (acc.balance > 0) owe += acc.balance;
      else has += Math.abs(acc.balance);
    });
    return { owe, has, diff: owe - has };
  }, [accounts]);

  return (
    <div className="flex flex-col h-screen bg-[#0c0c0c] text-white overflow-hidden font-sans select-none">
      <div className={`h-1 w-full fixed top-0 z-[100] transition-colors ${isOnline ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-orange-500 shadow-[0_0_10px_#f97316]'}`}></div>

      <Header 
        onMenuClick={() => setIsSidebarOpen(true)} 
        viewTitle={currentView === AppView.DASHBOARD ? 'المحاسب المحستني برو' : 'الرجوع'} 
        onSearchChange={setSearchTerm} 
        onPrintClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
        isSaving={isSaving} 
      />
      
      {notifications.map(n => (
        <Toast key={n.id} message={n.message} type={n.type} onClose={() => removeNotification(n.id)} />
      ))}

      {isPrintMenuOpen && (
        <div className="fixed top-24 left-4 z-[60] animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="fixed inset-0 bg-transparent" onClick={() => setIsPrintMenuOpen(false)}></div>
          <div className="relative bg-white border border-gray-100 rounded-3xl shadow-2xl p-1.5 min-w-[240px] backdrop-blur-xl overflow-hidden">
            <button onClick={() => { setIsPrintMenuOpen(false); handleNativePrint(document.body.innerHTML); }} className="w-full text-right p-3.5 hover:bg-gray-50 rounded-2xl flex items-center justify-between group">
              <span className="text-gray-800 text-[14px] font-black">طباعة الصفحة (PDF)</span>
              <img src="https://img.icons8.com/color/48/pdf-2.png" className="w-6 h-6" alt="pdf" />
            </button>
            <button onClick={() => handleExportExcel(false)} className="w-full text-right p-3.5 hover:bg-gray-50 rounded-2xl flex items-center justify-between group">
              <span className="text-gray-800 text-[14px] font-black">تصدير الصفحة (Excel)</span>
              <img src="https://img.icons8.com/color/48/microsoft-excel-2019.png" className="w-6 h-6" alt="excel" />
            </button>
            <button onClick={() => handleExportExcel(true)} className="w-full text-right p-3.5 hover:bg-gray-50 rounded-2xl flex items-center justify-between group">
              <span className="text-gray-800 text-[14px] font-black">مشاركة الصفحة (Excel)</span>
              <img src="https://img.icons8.com/color/48/share--v1.png" className="w-6 h-6" alt="share" />
            </button>
            <div className="h-px bg-gray-100 mx-3 my-0.5"></div>
            <button onClick={() => handleBalanceConfirmation(false)} className="w-full text-right p-3.5 hover:bg-gray-50 rounded-2xl flex items-center justify-between group">
              <span className="text-gray-800 text-[14px] font-black">طباعة مصادقة الرصيد</span>
              <img src="https://img.icons8.com/color/48/us-dollar-circled--v1.png" className="w-6 h-6" alt="confirm" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow overflow-y-auto relative custom-scrollbar">
        {currentView === AppView.DASHBOARD && <Dashboard accounts={accounts} onViewChange={setCurrentView} onQuickAction={(a) => {
          if (a === 'سند جديد') setIsAddTransactionModalOpen(true);
          if (a === 'تقرير الاعتماد') setCurrentView(AppView.BUDGET_REPORT);
          if (a === 'الحركة اليومية') setCurrentView(AppView.DAILY_MOVEMENT);
          if (a === 'فاتورة جديدة') setCurrentView(AppView.INVENTORY);
        }} />}
        {currentView === AppView.BUDGET_REPORT && <BudgetReportView transactions={transactions} budgetLimits={budgetLimits} onUpdateBudgetLimit={(cat, amt) => setBudgetLimits(prev => ({...prev, [cat]: amt}))} onBack={() => setCurrentView(AppView.DASHBOARD)} startDate={reportStartDate} endDate={reportEndDate} setStartDate={setReportStartDate} setEndDate={setReportEndDate} />}
        {(currentView === AppView.CUSTOMERS || currentView === AppView.SUPPLIERS || currentView === AppView.DEBTS || currentView === AppView.EMPLOYEES || currentView === AppView.EXPENSES) && (
          <AccountListView 
            type={currentView === AppView.EXPENSES ? 'expense' : currentView.toLowerCase().slice(0, -1) as AccountType} accounts={accounts.filter(a => a.name.includes(searchTerm))} 
            onBack={() => setCurrentView(AppView.DASHBOARD)} onAddTransaction={() => setIsAddTransactionModalOpen(true)} onAddAccount={() => setIsAddAccountModalOpen(true)} 
            onSelectAccount={(id) => { setSelectedAccountId(id); setCurrentView(AppView.STATEMENT); }} 
            onEditAccount={(acc) => { setEditingAccount(acc); setIsAddAccountModalOpen(true); }} 
            onDeleteAccounts={(ids) => setAccounts(prev => prev.filter(a => !ids.includes(a.id)))} 
            onLockAccounts={(ids) => setAccounts(prev => prev.map(a => ids.includes(a.id) ? {...a, isLocked: !a.isLocked} : a))} 
            totals={appTotals} 
          />
        )}
        {currentView === AppView.STATEMENT && selectedAccountId && (
          <StatementView account={accounts.find(a => a.id === selectedAccountId)!} transactions={transactions.filter(t => t.accountId === selectedAccountId)} onBack={() => setCurrentView(AppView.DASHBOARD)} onAddTransaction={() => setIsAddTransactionModalOpen(true)} />
        )}
        {currentView === AppView.DAILY_MOVEMENT && <DailyMovementView transactions={transactions} accounts={accounts} onBack={() => setCurrentView(AppView.DASHBOARD)} />}
        {currentView === AppView.INVENTORY && <InventoryView products={products} onAddProduct={(p) => setProducts([...products, p])} onBack={() => setCurrentView(AppView.DASHBOARD)} />}
        {currentView === AppView.MESSAGES && <MessagesView messages={messages} onBack={() => setCurrentView(AppView.DASHBOARD)} />}
        {currentView === AppView.SETTINGS && <SettingsView onBack={() => setCurrentView(AppView.DASHBOARD)} onExportFullExcel={() => handleExportExcel(false)} />}
      </main>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onNavigate={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} onExportExcel={() => handleExportExcel(false)} />
      {currentView === AppView.DASHBOARD && <Footer />}
      
      {isAddAccountModalOpen && <AddAccountModal accountToEdit={editingAccount || undefined} targetType={currentView === AppView.CUSTOMERS ? 'customer' : 'supplier'} onClose={() => { setIsAddAccountModalOpen(false); setEditingAccount(null); }} onSave={(acc) => { setAccounts(prev => editingAccount ? prev.map(a => a.id === acc.id ? acc : a) : [...prev, acc]); notify("تم حفظ الحساب"); setIsAddAccountModalOpen(false); }} />}
      {isAddTransactionModalOpen && <AddTransactionModal accounts={accounts} preselectedId={selectedAccountId || undefined} onClose={() => setIsAddTransactionModalOpen(false)} onSave={(tx) => { setTransactions(prev => [tx, ...prev]); setAccounts(prev => prev.map(acc => acc.id === tx.accountId ? { ...acc, balance: acc.balance + (tx.type === 'debit' ? tx.amount : -tx.amount), lastTransaction: tx.date } : acc)); notify("تم حفظ السند"); setIsAddTransactionModalOpen(false); }} />}
    </div>
  );
};

export default App;
