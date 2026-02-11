import React, { useState, useEffect } from 'react';
import { Product, Purchase } from './BillingBridge';
import BillingBridge from './BillingBridge';
import { Language } from '../utils/i18n';

// 產品 ID
const PRODUCT_IDS = {
  MONTHLY: 'tradeview_monthly',
  YEARLY: 'tradeview_yearly',
} as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (purchase: Purchase) => void;
  language: Language;
  userEmail: string;
}

const PurchaseModal: React.FC<Props> = ({ isOpen, onClose, onPurchaseSuccess, language, userEmail }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && BillingBridge.isAvailable()) {
      loadProducts();
    } else if (isOpen && !BillingBridge.isAvailable()) {
      setError(language === 'zh-TW' 
        ? '此功能僅在 Android 應用中可用' 
        : 'This feature is only available in Android app');
    }
  }, [isOpen, language]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await BillingBridge.queryProducts();
      setProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || (language === 'zh-TW' ? '載入產品失敗' : 'Failed to load products'));
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    if (!userEmail) {
      setError(language === 'zh-TW' ? '請先登入' : 'Please login first');
      return;
    }

    setPurchasing(productId);
    setError(null);
    try {
      const purchase = await BillingBridge.launchPurchaseFlow(productId);
      onPurchaseSuccess(purchase);
      onClose();
    } catch (err: any) {
      if (err.message === 'Purchase was canceled') {
        // 用戶取消，不顯示錯誤
        setError(null);
      } else {
        setError(err.message || (language === 'zh-TW' ? '購買失敗' : 'Purchase failed'));
        console.error('Purchase failed:', err);
      }
    } finally {
      setPurchasing(null);
    }
  };

  const getProductInfo = (productId: string) => {
    // 嘗試從 Google Play 獲取的產品資訊
    const product = products.find(p => p.productId === productId);
    if (product) {
      return {
        title: product.title,
        description: product.description,
        price: product.price,
      };
    }
    
    // 如果沒有從 Google Play 獲取到，使用本地配置
    if (productId === PRODUCT_IDS.MONTHLY) {
      return {
        title: language === 'zh-TW' ? '月制會員' : 'Monthly Subscription',
        description: language === 'zh-TW' 
          ? '按月計費，可隨時取消' 
          : 'Billed monthly, cancel anytime',
        price: 'NT$ 60/月',
      };
    } else if (productId === PRODUCT_IDS.YEARLY) {
      return {
        title: language === 'zh-TW' ? '年制會員' : 'Yearly Subscription',
        description: language === 'zh-TW' 
          ? '按年計費，更優惠' 
          : 'Billed yearly, best value',
        price: 'NT$ 590/年',
      };
    }
    return { title: '', description: '', price: '' };
  };

  if (!isOpen) return null;

  const plans = [
    { id: PRODUCT_IDS.MONTHLY, highlight: false },
    { id: PRODUCT_IDS.YEARLY, highlight: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {language === 'zh-TW' ? '選擇會員方案' : 'Choose Membership Plan'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-slate-400 mt-2">
            {language === 'zh-TW' 
              ? '選擇適合您的方案，開通完整會員功能' 
              : 'Choose a plan that suits you to unlock all premium features'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <span className="ml-3 text-slate-400">
                {language === 'zh-TW' ? '載入中...' : 'Loading...'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => {
                const info = getProductInfo(plan.id);
                const isPurchasing = purchasing === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-lg border-2 transition-all ${
                      plan.highlight
                        ? 'border-indigo-500 bg-indigo-500/10 scale-105'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {language === 'zh-TW' ? '推薦' : 'POPULAR'}
                        </span>
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-white mb-2">{info.title}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">{info.price}</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 min-h-[3rem]">{info.description}</p>
                    
                    <button
                      onClick={() => handlePurchase(plan.id)}
                      disabled={isPurchasing || !!purchasing}
                      className={`w-full py-3 rounded-lg font-bold transition-all ${
                        plan.highlight
                          ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isPurchasing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {language === 'zh-TW' ? '處理中...' : 'Processing...'}
                        </span>
                      ) : (
                        language === 'zh-TW' ? '立即購買' : 'Purchase Now'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-400 text-center">
            {language === 'zh-TW' 
              ? '購買後將自動開通會員功能。訂閱可隨時在 Google Play 商店中取消。' 
              : 'Membership will be activated automatically after purchase. Subscriptions can be cancelled anytime in Google Play Store.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;

