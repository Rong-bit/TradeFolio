import React, { useState, useEffect } from 'react';
import { Language, t } from '../utils/i18n';
import { purchaseSubscription, SUBSCRIPTION_PRODUCTS, SubscriptionInfo } from '../services/subscriptionService';
import { useSubscription } from '../hooks/useSubscription';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  language: Language;
  onPurchaseSuccess?: () => void;
}

const SubscriptionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  email,
  language,
  onPurchaseSuccess,
}) => {
  const translations = t(language);
  const { subscription, isLoading, isActive, refreshSubscription, restore, products, loadingProducts } = useSubscription(email);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      refreshSubscription();
    }
  }, [isOpen, refreshSubscription]);

  const handlePurchase = async (productId: string) => {
    if (!email) {
      setError(language === 'zh-TW' ? '請先登入' : 'Please login first');
      return;
    }

    try {
      setPurchasing(productId);
      setError(null);

      const result = await purchaseSubscription(productId, email);

      if (result.success) {
        await refreshSubscription();
        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
        // 延遲關閉，讓用戶看到成功訊息
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || (language === 'zh-TW' ? '購買失敗' : 'Purchase failed'));
      }
    } catch (err: any) {
      setError(err.message || (language === 'zh-TW' ? '購買失敗' : 'Purchase failed'));
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      setError(null);

      const restored = await restore();
      if (restored) {
        await refreshSubscription();
        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(language === 'zh-TW' ? '未找到可恢復的購買記錄' : 'No purchases found to restore');
      }
    } catch (err: any) {
      setError(err.message || (language === 'zh-TW' ? '恢復失敗' : 'Restore failed'));
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen) return null;

  const monthlyProduct = products.find(p => p.productId === SUBSCRIPTION_PRODUCTS.MONTHLY);
  const yearlyProduct = products.find(p => p.productId === SUBSCRIPTION_PRODUCTS.YEARLY);

  const formatPrice = (product: any) => {
    if (!product) return '';
    return product.localizedPrice || product.price || '';
  };

  const getSubscriptionStatusText = () => {
    if (isLoading) {
      return language === 'zh-TW' ? '檢查訂閱狀態...' : 'Checking subscription status...';
    }
    if (isActive && subscription) {
      const expiryDate = subscription.expiryDate;
      if (expiryDate) {
        const dateStr = expiryDate.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US');
        return language === 'zh-TW' 
          ? `訂閱有效至：${dateStr}` 
          : `Subscription valid until: ${dateStr}`;
      }
      return language === 'zh-TW' ? '訂閱有效' : 'Subscription active';
    }
    return language === 'zh-TW' ? '尚未訂閱' : 'Not subscribed';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-xl text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {language === 'zh-TW' ? '升級為會員' : 'Upgrade to Premium'}
              </h2>
              <p className="text-indigo-100 text-sm">
                {language === 'zh-TW' 
                  ? '解鎖進階功能：再平衡、AI 分析等' 
                  : 'Unlock advanced features: Rebalance, AI Analysis, and more'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-200 text-2xl font-bold transition"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          {isActive && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-medium">{getSubscriptionStatusText()}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Subscription Plans */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {language === 'zh-TW' ? '選擇訂閱方案' : 'Choose a Plan'}
            </h3>

            {/* Monthly Plan */}
            <div className={`border-2 rounded-lg p-4 transition ${
              subscription?.productId === SUBSCRIPTION_PRODUCTS.MONTHLY && isActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">
                    {language === 'zh-TW' ? '月訂閱' : 'Monthly'}
                  </h4>
                  <p className="text-slate-600 text-sm mt-1">
                    {language === 'zh-TW' ? '每月自動續訂' : 'Auto-renewable monthly'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">
                    {formatPrice(monthlyProduct) || 'NT$ 60'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {language === 'zh-TW' ? '/月' : '/month'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handlePurchase(SUBSCRIPTION_PRODUCTS.MONTHLY)}
                disabled={purchasing !== null || isLoading || loadingProducts}
                className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                  subscription?.productId === SUBSCRIPTION_PRODUCTS.MONTHLY && isActive
                    ? 'bg-green-600 text-white'
                    : purchasing === SUBSCRIPTION_PRODUCTS.MONTHLY
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {purchasing === SUBSCRIPTION_PRODUCTS.MONTHLY
                  ? (language === 'zh-TW' ? '處理中...' : 'Processing...')
                  : subscription?.productId === SUBSCRIPTION_PRODUCTS.MONTHLY && isActive
                  ? (language === 'zh-TW' ? '✓ 已訂閱' : '✓ Subscribed')
                  : (language === 'zh-TW' ? '訂閱' : 'Subscribe')}
              </button>
            </div>

            {/* Yearly Plan */}
            <div className={`border-2 rounded-lg p-4 transition relative ${
              subscription?.productId === SUBSCRIPTION_PRODUCTS.YEARLY && isActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300'
            }`}>
              {/* Best Value Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {language === 'zh-TW' ? '最划算' : 'Best Value'}
                </span>
              </div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">
                    {language === 'zh-TW' ? '年訂閱' : 'Yearly'}
                  </h4>
                  <p className="text-slate-600 text-sm mt-1">
                    {language === 'zh-TW' ? '每年自動續訂，節省 17%' : 'Auto-renewable yearly, save 17%'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">
                    {formatPrice(yearlyProduct) || 'NT$ 600'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {language === 'zh-TW' ? '/年' : '/year'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handlePurchase(SUBSCRIPTION_PRODUCTS.YEARLY)}
                disabled={purchasing !== null || isLoading || loadingProducts}
                className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                  subscription?.productId === SUBSCRIPTION_PRODUCTS.YEARLY && isActive
                    ? 'bg-green-600 text-white'
                    : purchasing === SUBSCRIPTION_PRODUCTS.YEARLY
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {purchasing === SUBSCRIPTION_PRODUCTS.YEARLY
                  ? (language === 'zh-TW' ? '處理中...' : 'Processing...')
                  : subscription?.productId === SUBSCRIPTION_PRODUCTS.YEARLY && isActive
                  ? (language === 'zh-TW' ? '✓ 已訂閱' : '✓ Subscribed')
                  : (language === 'zh-TW' ? '訂閱' : 'Subscribe')}
              </button>
            </div>
          </div>

          {/* Restore Purchases */}
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleRestore}
              disabled={restoring || isLoading}
              className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2 transition disabled:text-slate-400"
            >
              {restoring
                ? (language === 'zh-TW' ? '恢復中...' : 'Restoring...')
                : (language === 'zh-TW' ? '恢復購買' : 'Restore Purchases')}
            </button>
          </div>

          {/* Features List */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-bold text-slate-800 mb-2">
              {language === 'zh-TW' ? '會員功能' : 'Premium Features'}
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {language === 'zh-TW' ? '再平衡功能（Rebalance）' : 'Rebalance Feature'}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {language === 'zh-TW' ? 'AI 投資分析' : 'AI Investment Analysis'}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {language === 'zh-TW' ? '完整圖表功能' : 'Full Chart Features'}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {language === 'zh-TW' ? '歷史數據 AI 修正' : 'Historical Data AI Correction'}
              </li>
            </ul>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-slate-500 text-center">
            {language === 'zh-TW' 
              ? '訂閱將自動續訂，您可以在 App Store 設定中隨時取消' 
              : 'Subscriptions auto-renew. You can cancel anytime in App Store settings'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;

