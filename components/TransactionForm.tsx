
import React, { useState, useEffect } from 'react';
import { Market, Transaction, TransactionType, Account, Holding } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Language, t } from '../utils/i18n';

interface Props {
  accounts: Account[];
  holdings?: Holding[]; // 資產配置明細，用於自動判斷市場
  onAdd: (tx: Transaction) => void;
  onUpdate: (tx: Transaction) => void;
  onClose: () => void;
  editingTransaction: Transaction | null;
  language: Language;
}

const TransactionForm: React.FC<Props> = ({ accounts, holdings = [], onAdd, onUpdate, onClose, editingTransaction, language }) => {
  const isEditing = !!editingTransaction;
  const translations = t(language);
  const tf = translations.transactionForm;
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    ticker: '',
    market: Market.TW,
    type: TransactionType.BUY,
    price: '',
    quantity: '',
    fees: '0',
    accountId: accounts[0]?.id || '',
    note: ''
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null);

  // 當進入編輯模式時，載入現有交易資料
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        date: editingTransaction.date,
        ticker: editingTransaction.ticker,
        market: editingTransaction.market,
        type: editingTransaction.type,
        price: editingTransaction.price.toString(),
        quantity: editingTransaction.quantity.toString(),
        fees: editingTransaction.fees.toString(),
        accountId: editingTransaction.accountId,
        note: editingTransaction.note || ''
      });
    } else {
      // 重置為預設值
      setFormData({
        date: new Date().toISOString().split('T')[0],
        ticker: '',
        market: Market.TW,
        type: TransactionType.BUY,
        price: '',
        quantity: '',
        fees: '0',
        accountId: accounts[0]?.id || '',
        note: ''
      });
    }
  }, [editingTransaction, accounts]);

  // 當交易類型變更為現金股息時，自動將數量設為 1
  useEffect(() => {
    if (formData.type === TransactionType.CASH_DIVIDEND && formData.quantity !== '1' && !editingTransaction) {
      setFormData(prev => ({ ...prev, quantity: '1' }));
    }
  }, [formData.type, editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId) return alert(tf.errorNoAccount);

    const price = parseFloat(formData.price);
    // 現金股息時，數量固定為 1
    const quantity = formData.type === TransactionType.CASH_DIVIDEND ? 1 : parseFloat(formData.quantity);
    const fees = parseFloat(formData.fees) || 0;
    
    // 計算總金額邏輯
    let finalAmount = 0;
    
    if (formData.type === TransactionType.BUY || formData.type === TransactionType.SELL) {
        let baseAmount = price * quantity;
        
        // 台股特殊邏輯：無條件捨去
        if (formData.market === Market.TW) {
            baseAmount = Math.floor(baseAmount);
        }
        
        // 加上/減去 手續費
        if (formData.type === TransactionType.BUY) {
            finalAmount = baseAmount + fees;
        } else {
            // 賣出時通常是 總金額 - 手續費 - 稅，這裡僅處理手續費欄位
            finalAmount = baseAmount - fees;
        }
    } else if (formData.type === TransactionType.CASH_DIVIDEND) {
        // 現金股息通常直接輸入總額於 Price 欄位，Quantity 設為 1
        finalAmount = (price * quantity) - fees;
    } else {
        // 其他類別如股息再投入，這裡暫時使用基本乘積
        finalAmount = price * quantity;
    }

    const newTx: Transaction = {
      id: isEditing && editingTransaction ? editingTransaction.id : uuidv4(),
      date: formData.date,
      ticker: formData.ticker.toUpperCase(),
      market: formData.market,
      type: formData.type,
      price: price,
      quantity: quantity,
      fees: fees,
      accountId: formData.accountId,
      note: formData.note,
      amount: finalAmount // 儲存計算後的總金額
    };
    
    // 顯示確認對話框，不直接儲存
    setPendingTransaction(newTx);
    setShowConfirmDialog(true);
  };

  // 確認並儲存交易
  const confirmAndSave = () => {
    if (!pendingTransaction) return;
    
    if (isEditing) {
      onUpdate(pendingTransaction);
    } else {
      onAdd(pendingTransaction);
    }
    setShowConfirmDialog(false);
    setPendingTransaction(null);
    onClose();
  };

  // 取消確認，返回編輯
  const cancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingTransaction(null);
  };

  // 取得交易類型的名稱
  const getTypeName = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.BUY: return tf.typeBuy;
      case TransactionType.SELL: return tf.typeSell;
      case TransactionType.CASH_DIVIDEND: return tf.typeCashDividend;
      case TransactionType.DIVIDEND: return tf.typeDividend;
      case TransactionType.TRANSFER_IN: return tf.typeTransferIn;
      case TransactionType.TRANSFER_OUT: return tf.typeTransferOut;
      default: return type;
    }
  };

  // 取得市場的貨幣符號
  const getCurrency = (market: Market): string => {
    switch (market) {
      case Market.TW: return 'TWD';
      case Market.JP: return 'JPY';
      case Market.UK: return 'USD';
      case Market.US: return 'USD';
      case Market.CN: return 'CNY';
      case Market.SZ: return 'CNY';
      case Market.IN: return 'INR';
      case Market.CA: return 'CAD';
      case Market.FR: return 'EUR';
      case Market.HK: return 'HKD';
      case Market.KR: return 'KRW';
      case Market.DE: return 'EUR';
      case Market.AU: return 'AUD';
      case Market.SA: return 'SAR';
      case Market.BR: return 'BRL';
      default: return 'USD';
    }
  };

  // 從 holdings 中根據 ticker 查找對應的市場
  const findMarketFromHoldings = (ticker: string): Market | null => {
    if (!ticker || !holdings || holdings.length === 0) return null;
    
    const upperTicker = ticker.toUpperCase().trim();
    
    // 在 holdings 中查找匹配的 ticker
    const matchedHolding = holdings.find((h: Holding) => {
      const holdingTicker = h.ticker.toUpperCase().trim();
      // 支援完全匹配或移除前綴後匹配（如 TPE:2330 匹配 2330）
      return holdingTicker === upperTicker || 
             holdingTicker.replace(/^(TPE:|TW|US|LON|TYO)/i, '') === upperTicker ||
             upperTicker.replace(/^(TPE:|TW|US|LON|TYO)/i, '') === holdingTicker;
    });
    
    return matchedHolding ? matchedHolding.market : null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    
    // 當交易類型變為現金股息時，自動將數量設為 1
    if (e.target.name === 'type' && e.target.value === TransactionType.CASH_DIVIDEND) {
      newFormData.quantity = '1';
    }
    
    // 當輸入代號時，從 holdings 中自動判斷市場
    if (e.target.name === 'ticker' && e.target.value) {
      const detectedMarket = findMarketFromHoldings(e.target.value);
      if (detectedMarket) {
        newFormData.market = detectedMarket;
      }
    }
    
    setFormData(newFormData);
  };

  // 計算預覽金額
  const calculatePreviewAmount = (): number => {
    const price = parseFloat(formData.price) || 0;
    const quantity = formData.type === TransactionType.CASH_DIVIDEND ? 1 : (parseFloat(formData.quantity) || 0);
    const fees = parseFloat(formData.fees) || 0;
    
    if (formData.type === TransactionType.BUY || formData.type === TransactionType.SELL) {
      let baseAmount = price * quantity;
      if (formData.market === Market.TW) {
        baseAmount = Math.floor(baseAmount);
      }
      return formData.type === TransactionType.BUY ? baseAmount + fees : baseAmount - fees;
    } else if (formData.type === TransactionType.CASH_DIVIDEND) {
      return (price * quantity) - fees;
    }
    return price * quantity;
  };

  // 取得帳戶名稱
  const getAccountName = (accountId: string): string => {
    const account = accounts.find(a => a.id === accountId);
    return account ? `${account.name} (${account.currency})` : accountId;
  };

  return (
    <>
      {/* 確認對話框 */}
      {showConfirmDialog && pendingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 p-4">
              <h3 className="text-white font-bold text-lg">{tf.confirmTitle}</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium">{tf.confirmMessage}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{tf.dateLabel}</span>
                  <span className="font-medium">{pendingTransaction.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{tf.accountLabel}</span>
                  <span className="font-medium">{getAccountName(pendingTransaction.accountId)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{tf.marketLabel}</span>
                  <span className="font-medium">{pendingTransaction.market}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{tf.tickerLabel}</span>
                  <span className="font-medium">{pendingTransaction.ticker}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{tf.typeLabel}</span>
                  <span className="font-medium">{getTypeName(pendingTransaction.type)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{tf.priceLabel}</span>
                  <span className="font-medium">
                    {pendingTransaction.price.toFixed(2)} {getCurrency(pendingTransaction.market)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{tf.quantityLabel}</span>
                  <span className="font-medium">{pendingTransaction.quantity} {tf.shares}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{tf.feesLabel}</span>
                  <span className="font-medium">
                    {pendingTransaction.fees.toFixed(2)} {getCurrency(pendingTransaction.market)}
                  </span>
                </div>
                {pendingTransaction.note && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">{tf.noteLabel}</span>
                    <span className="font-medium text-right max-w-[60%]">{pendingTransaction.note}</span>
                  </div>
                )}
                <div className="border-t-2 border-slate-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-semibold">{tf.totalAmount}</span>
                    <span className="font-bold text-lg text-slate-900">
                      {pendingTransaction.amount?.toFixed(2) || '0.00'} {getCurrency(pendingTransaction.market)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={cancelConfirm}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
                >
                  {tf.backToEdit}
                </button>
                <button
                  type="button"
                  onClick={confirmAndSave}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800"
                >
                  {tf.confirmSave}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="bg-slate-900 p-4 flex justify-between items-center">
            <h2 className="text-white font-bold text-lg">{isEditing ? tf.editTransaction : tf.addTransaction}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
          </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{tf.date}</label>
              <input 
                type="date" name="date" required
                value={formData.date} onChange={handleChange}
                className="mt-1 w-full border border-slate-300 rounded-md p-2 focus:ring-accent focus:border-accent"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">{tf.account}</label>
              <select 
                name="accountId" required
                value={formData.accountId} onChange={handleChange}
                className="mt-1 w-full border border-slate-300 rounded-md p-2"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700">{tf.market}</label>
              <select 
                name="market" 
                value={formData.market} onChange={handleChange}
                className="mt-1 w-full border border-slate-300 rounded-md p-2"
              >
                <option value={Market.TW}>{tf.marketTW}</option>
                <option value={Market.US}>{tf.marketUS}</option>
                <option value={Market.UK}>{tf.marketUK}</option>
                <option value={Market.JP}>{tf.marketJP}</option>
                <option value={Market.CN}>{tf.marketCN}</option>
                <option value={Market.SZ}>{tf.marketSZ}</option>
                <option value={Market.IN}>{tf.marketIN}</option>
                <option value={Market.CA}>{tf.marketCA}</option>
                <option value={Market.FR}>{tf.marketFR}</option>
                <option value={Market.HK}>{tf.marketHK}</option>
                <option value={Market.KR}>{tf.marketKR}</option>
                <option value={Market.DE}>{tf.marketDE}</option>
                <option value={Market.AU}>{tf.marketAU}</option>
                <option value={Market.SA}>{tf.marketSA}</option>
                <option value={Market.BR}>{tf.marketBR}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{tf.ticker}</label>
              <input 
                type="text" name="ticker" required placeholder={tf.tickerPlaceholder}
                value={formData.ticker} onChange={handleChange}
                className="mt-1 w-full border border-slate-300 rounded-md p-2 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{tf.category}</label>
              <select 
                name="type" 
                value={formData.type} onChange={handleChange}
                className="mt-1 w-full border border-slate-300 rounded-md p-2"
              >
                <option value={TransactionType.BUY}>{tf.typeBuy}</option>
                <option value={TransactionType.SELL}>{tf.typeSell}</option>
                <option value={TransactionType.DIVIDEND}>{tf.typeDividend}</option>
                <option value={TransactionType.CASH_DIVIDEND}>{tf.typeCashDividend}</option>
                <option value={TransactionType.TRANSFER_IN}>{tf.typeTransferIn}</option>
                <option value={TransactionType.TRANSFER_OUT}>{tf.typeTransferOut}</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">{tf.price} ({
                formData.market === Market.TW ? 'TWD' : 
                formData.market === Market.UK ? 'USD' : 
                formData.market === Market.JP ? 'JPY' : 
                formData.market === Market.CN ? 'CNY' :
                formData.market === Market.SZ ? 'CNY' :
                formData.market === Market.IN ? 'INR' :
                formData.market === Market.CA ? 'CAD' :
                formData.market === Market.FR ? 'EUR' :
                formData.market === Market.HK ? 'HKD' :
                formData.market === Market.KR ? 'KRW' :
                formData.market === Market.DE ? 'EUR' :
                formData.market === Market.AU ? 'AUD' :
                formData.market === Market.SA ? 'SAR' :
                formData.market === Market.BR ? 'BRL' :
                'USD'
              })</label>
              <input 
                type="number" name="price" required step="any" min="0"
                value={formData.price} onChange={handleChange}
                placeholder={formData.type === TransactionType.CASH_DIVIDEND ? tf.placeholderQuantity : tf.placeholderPrice}
                className="mt-1 w-full border border-slate-300 rounded-md p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700">
                {formData.type === TransactionType.CASH_DIVIDEND ? tf.quantityFixed : tf.quantity}
              </label>
              <input 
                type="number" name="quantity" required step="any" min="0"
                value={formData.type === TransactionType.CASH_DIVIDEND ? '1' : formData.quantity}
                onChange={handleChange}
                disabled={formData.type === TransactionType.CASH_DIVIDEND}
                className={`mt-1 w-full border border-slate-300 rounded-md p-2 ${formData.type === TransactionType.CASH_DIVIDEND ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">{tf.fees}</label>
              <input 
                type="number" name="fees" step="0.01" min="0"
                value={formData.fees} onChange={handleChange}
                className="mt-1 w-full border border-slate-300 rounded-md p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">{tf.note}</label>
            <input 
              type="text" name="note"
              value={formData.note} onChange={handleChange}
              className="mt-1 w-full border border-slate-300 rounded-md p-2"
            />
          </div>

          {/* 計算金額預覽 */}
          {formData.price && formData.quantity && (
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <div className="text-xs text-slate-600 mb-1">{tf.previewTitle}</div>
              <div className="text-lg font-bold text-slate-800">
                {calculatePreviewAmount().toFixed(2)}
                <span className="text-xs text-slate-500 ml-2">
                  ({getCurrency(formData.market)})
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {tf.calculationFormula}{formData.price} × {formData.quantity} 
                {formData.market === Market.TW ? tf.formulaNote : ''} 
                {formData.type === TransactionType.BUY ? ' + ' : formData.type === TransactionType.SELL ? ' - ' : ''}
                {formData.fees || 0} ({tf.feesShort})
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
             <button 
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
            >
              {tf.cancel}
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800"
            >
              {isEditing ? tf.updateTransaction : tf.saveTransaction}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default TransactionForm;


