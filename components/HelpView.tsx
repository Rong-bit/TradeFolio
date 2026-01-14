import React, { useRef, useState } from 'react';
import { Language, t, translate } from '../utils/i18n';
import { useSubscription } from '../hooks/useSubscription';

interface Props {
  onExport: () => void | Promise<void>;
  onImport: (file: File) => void;
  authorizedUsers: string[]; 
  currentUser: string;
  language: Language;
  onOpenSubscription?: () => void;
}

const HelpView: React.FC<Props> = ({ 
  onExport, 
  onImport, 
  authorizedUsers,
  currentUser,
  language,
  onOpenSubscription
}) => {
  const translations = t(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { subscription, isLoading, isActive, restore } = useSubscription(currentUser);
  
  // State for custom confirmation modals
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImportFile(file);
      // Reset input immediately so change event fires even if same file selected again later
      e.target.value = '';
    }
  };

  const confirmImport = () => {
    if (pendingImportFile) {
      onImport(pendingImportFile);
      setPendingImportFile(null);
    }
  };

  const cancelImport = () => {
    setPendingImportFile(null);
  };

  // Helper to mask email for privacy
  const maskEmail = (email: string) => {
    try {
      const atIndex = email.indexOf('@');
      if (atIndex === -1) return email;
      
      const domain = email.substring(atIndex);
      const name = email.substring(0, atIndex);
      
      // 處理短帳號
      if (name.length <= 2) {
        return name[0] + '****' + domain;
      }
      
      // 保留前3碼
      return name.substring(0, 3) + '****' + domain;
    } catch (e) {
      return email;
    }
  };

  const content = translations.help.documentationContent;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      setRestoreMessage(null);
      const restored = await restore();
      if (restored) {
        setRestoreMessage(language === 'zh-TW' ? '購買已恢復！' : 'Purchases restored!');
      } else {
        setRestoreMessage(language === 'zh-TW' ? '未找到可恢復的購買記錄' : 'No purchases found to restore');
      }
    } catch (error: any) {
      setRestoreMessage(error.message || (language === 'zh-TW' ? '恢復失敗' : 'Restore failed'));
    } finally {
      setRestoring(false);
      setTimeout(() => setRestoreMessage(null), 5000);
    }
  };

  const getSubscriptionStatusText = () => {
    if (isLoading) {
      return language === 'zh-TW' ? '檢查中...' : 'Checking...';
    }
    if (isActive && subscription) {
      const expiryDate = subscription.expiryDate;
      if (expiryDate) {
        const dateStr = expiryDate.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US');
        return language === 'zh-TW' 
          ? `訂閱有效至：${dateStr}` 
          : `Valid until: ${dateStr}`;
      }
      return language === 'zh-TW' ? '訂閱有效' : 'Subscription active';
    }
    return language === 'zh-TW' ? '尚未訂閱' : 'Not subscribed';
  };

  return (
    <div className="space-y-6">
      {/* Data Management Section */}
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h9v-9h-9v-5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7V4h16v3M9 21v-9h6v9" />
          </svg>
          {translations.help.dataManagement}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-2">{translations.help.export}</h4>
                <p className="text-sm text-slate-500 mb-4">
                    {translations.help.exportDesc}
                </p>
                <button 
                  type="button"
                  onClick={onExport}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition shadow flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {translations.help.downloadBackup}
                </button>
            </div>

            <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-2">{translations.help.import}</h4>
                <p className="text-sm text-red-500 mb-4">
                    {translations.help.importWarning}
                </p>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".json"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded border border-slate-300 transition shadow-sm flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        {translations.help.uploadBackup}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Subscription Status Section */}
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {language === 'zh-TW' ? '訂閱狀態' : 'Subscription Status'}
        </h3>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${
            isActive 
              ? 'bg-green-50 border-green-200' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-700">
                {language === 'zh-TW' ? '當前狀態：' : 'Current Status: '}
              </span>
              <span className={`font-bold ${
                isActive ? 'text-green-700' : 'text-slate-600'
              }`}>
                {getSubscriptionStatusText()}
              </span>
            </div>
            {subscription && subscription.productId && (
              <p className="text-sm text-slate-600 mt-2">
                {language === 'zh-TW' ? '產品：' : 'Product: '}
                {subscription.productId.includes('monthly') 
                  ? (language === 'zh-TW' ? '月訂閱' : 'Monthly')
                  : (language === 'zh-TW' ? '年訂閱' : 'Yearly')}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {restoring 
                ? (language === 'zh-TW' ? '恢復中...' : 'Restoring...')
                : (language === 'zh-TW' ? '恢復購買' : 'Restore Purchases')}
            </button>
          </div>

          {restoreMessage && (
            <div className={`p-3 rounded-lg ${
              restoreMessage.includes('成功') || restoreMessage.includes('restored')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-sm">{restoreMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Purchase & Contact Section */}
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-amber-500">
         <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {translations.help.contact}
         </h3>
         
         <div className="space-y-4">
           {/* Purchase Section */}
           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200">
             <p className="mb-2 font-bold text-slate-800 text-base">
               {language === 'zh-TW' ? '💳 購買會員訂閱' : '💳 Purchase Subscription'}
             </p>
             <p className="text-sm text-slate-600 mb-4">
               {language === 'zh-TW' 
                 ? '透過 App Store 內購購買會員，即可解鎖進階功能（再平衡、AI 分析等）。' 
                 : 'Purchase a subscription through App Store in-app purchase to unlock advanced features (Rebalance, AI Analysis, etc.).'}
             </p>
             {onOpenSubscription ? (
               <button
                 onClick={onOpenSubscription}
                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                   <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                 </svg>
                 {language === 'zh-TW' ? '立即購買會員' : 'Purchase Premium'}
               </button>
             ) : (
               <p className="text-xs text-slate-500 italic">
                 {language === 'zh-TW' 
                   ? '（請在 iOS 裝置上使用 App Store 內購功能）' 
                   : '(Please use App Store in-app purchase on iOS device)'}
               </p>
             )}
           </div>

           {/* Contact Section */}
           <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
             <p className="mb-2 font-bold text-slate-800 text-base">{translations.help.contactTitle}</p>
             <p className="text-sm text-slate-700 mb-4">
                 {translations.help.contactDesc}
             </p>
             <div className="flex flex-col sm:flex-row gap-2">
               <a 
                 href="mailto:hjr640511@gmail.com"
                 className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow transition"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                     <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {translations.help.contactEmail}
               </a>
             </div>
           </div>
         </div>
      </div>

      {/* Help Content */}
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-slate-500">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {translations.help.documentation}
              </h3>
              <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-sm px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition">
                      {copyFeedback ? translations.help.copied : translations.help.copyAll}
                  </button>
                  <button onClick={handlePrint} className="text-sm px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition">
                      {translations.help.print}
                  </button>
              </div>
          </div>
          <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-6 rounded-lg border border-slate-200 whitespace-pre-line">
              {content}
          </div>
      </div>

      {/* Import Confirmation Modal */}
      {pendingImportFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
              <div className="bg-white rounded-lg shadow-xl max-sm w-full p-6 text-center">
                  <h3 className="text-lg font-bold mb-2 text-red-600">
                      {translations.help.confirmImport}
                  </h3>
                  <p className="text-slate-600 mb-6">
                      {translate('help.confirmImportMessage', language, { fileName: pendingImportFile.name })}<br/>
                      {translations.help.confirmImportWarning}
                  </p>
                  <div className="flex justify-center gap-4">
                      <button onClick={cancelImport} className="bg-slate-200 text-slate-800 px-4 py-2 rounded hover:bg-slate-300">
                          {language === 'zh-TW' ? '取消' : 'Cancel'}
                      </button>
                      <button onClick={confirmImport} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 shadow">
                          {translations.help.confirmOverride}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HelpView;
