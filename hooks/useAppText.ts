import { useMemo } from 'react';
import { Language, translate } from '../utils/i18n';
import { ADMIN_EMAIL } from '../config';

export interface AppText {
  alertTitleInfo: string;
  loginErrorTitle: string;
  loginSuccessTitle: string;
  loginFailedTitle: string;
  updateSuccessTitle: string;
  deleteSuccessTitle: string;
  restoreSuccessTitle: string;
  importFailedTitle: string;
  downloadErrorTitle: string;
  genericErrorTitle: string;
  enterEmail: string;
  adminWelcome: string;
  adminPasswordWrong: string;
  guestLoginNotice: string;
  contactSubject: string;
  contactBody: string;
  contactSentSuccess: string;
  contactMailtoFallback: string;
  contactStaticPagesHint: string;
  updatePriceSuccess: (count: number, rate: number) => string;
  autoUpdateFailed: string;
  downloadFailed: string;
  shareTitle: string;
  backupFailed: (err: string) => string;
  restoreSuccess: string;
  importFailed: string;
  txUpdated: string;
  marketUpdated: (count: number) => string;
  txDeleted: string;
  txCleared: (count: number) => string;
  accountUpdated: (name: string) => string;
  accountDeleted: (name?: string) => string;
  cashFlowUpdated: string;
  cashFlowDeleted: string;
  cashFlowCleared: (count: number) => string;
  historicalSaved: string;
  loginPasswordPlaceholder: string;
  confirmClearTxTitle: (count: number) => string;
  confirmClearTxMessage: (count: number) => string;
  confirmClearAction: string;
  deleteTxTitle: string;
  deleteTxMessage: string;
  cashFlowDeleteTitle: string;
  unknownAccount: string;
  accountLabel: string;
  dateLabel: string;
  typeLabel: string;
  amountLabel: string;
  cashFlowDeleteWarningTitle: string;
  cashFlowDeleteWarningBody: (count: number) => string;
  cashFlowDeleteMessage: string;
  confirmDeleteAction: string;
}

export function useAppText(language: Language, currentUser: string): AppText {
  const isChinese = language === 'zh-TW' || language === 'zh-CN';

  return useMemo(() => {
    const tx = (key: string, fallback: string, params?: Record<string, string | number>) => {
      const fullKey = `appMessages.${key}`;
      const resolved = translate(fullKey, language, params);
      return resolved === fullKey ? fallback : resolved;
    };

    return {
      alertTitleInfo: tx('alertTitleInfo', isChinese ? '提示' : 'Notice'),
      loginErrorTitle: tx('loginErrorTitle', isChinese ? '登入錯誤' : 'Login Error'),
      loginSuccessTitle: tx('loginSuccessTitle', isChinese ? '登入成功' : 'Login Success'),
      loginFailedTitle: tx('loginFailedTitle', isChinese ? '登入失敗' : 'Login Failed'),
      updateSuccessTitle: tx('updateSuccessTitle', isChinese ? '更新成功' : 'Updated'),
      deleteSuccessTitle: tx('deleteSuccessTitle', isChinese ? '刪除成功' : 'Deleted'),
      restoreSuccessTitle: tx('restoreSuccessTitle', isChinese ? '還原成功' : 'Restore Success'),
      importFailedTitle: tx('importFailedTitle', isChinese ? '匯入失敗' : 'Import Failed'),
      downloadErrorTitle: tx('downloadErrorTitle', isChinese ? '下載錯誤' : 'Download Error'),
      genericErrorTitle: tx('genericErrorTitle', isChinese ? '錯誤' : 'Error'),
      enterEmail: tx('enterEmail', isChinese ? '請輸入 Email 信箱' : 'Please enter your email address'),
      adminWelcome: tx('adminWelcome', isChinese ? '歡迎回來，管理員！' : 'Welcome back, admin!'),
      adminPasswordWrong: tx('adminPasswordWrong', isChinese ? '管理員密碼錯誤' : 'Incorrect admin password'),
      guestLoginNotice: tx(
        'guestLoginNotice',
        isChinese
          ? '已為您登入「非會員模式」。\n\n部分進階功能可能受限。若遇到問題，可使用頂部「問題回報」按鈕通知開發者。'
          : 'You are now logged in as guest mode.\n\nSome advanced features may be limited. If you encounter issues, use the "Report Issue" button to notify the developer.'
      ),
      contactSubject: tx(
        'contactSubject',
        isChinese ? 'TradeView 問題回報' : 'TradeView Bug / Issue Report'
      ),
      contactBody: tx(
        'contactBody',
        isChinese
          ? `Hi 管理員,\n\n我的帳號是: ${currentUser}\n\n【問題描述】\n請在此說明您遇到的 Bug 或問題：\n\n\n\n謝謝協助。`
          : `Hi Admin,\n\nMy account: ${currentUser}\n\n[Issue Description]\nPlease describe the bug or issue you encountered:\n\n\n\nThank you.`,
        { user: currentUser }
      ),
      contactSentSuccess: tx(
        'contactSentSuccess',
        isChinese
          ? '問題回報已送出！開發者將盡快查閱，謝謝您的回饋。'
          : 'Your report has been submitted. The developer will review it soon. Thank you!'
      ),
      contactMailtoFallback: tx(
        'contactMailtoFallback',
        isChinese
          ? '無法直接送出回報，已為您開啟郵件程式。請填寫問題後按「傳送」，開發者才會收到。'
          : 'Could not submit directly. Your email app has been opened — please describe the issue and press Send.'
      ),
      contactStaticPagesHint: tx(
        'contactStaticPagesHint',
        isChinese
          ? `已開啟郵件程式，並複製回報內容到剪貼簿。\n\n請補充問題說明後按「傳送」。\n\n若郵件程式未開啟，請手動寄信至：${ADMIN_EMAIL}`
          : `Your email app has been opened and the report was copied to your clipboard.\n\nPlease add details and press Send.\n\nIf email did not open, send manually to: ${ADMIN_EMAIL}`,
        { email: ADMIN_EMAIL }
      ),
      updatePriceSuccess: (count: number, rate: number) =>
        rate > 0
          ? tx(
              'updatePriceSuccessWithRate',
              isChinese
                ? `成功更新 ${count} 筆股價，並同步更新匯率為 ${rate}`
                : `Updated ${count} prices and synced exchange rate to ${rate}`,
              { count, rate }
            )
          : tx(
              'updatePriceSuccess',
              isChinese ? `成功更新 ${count} 筆股價` : `Updated ${count} prices`,
              { count }
            ),
      autoUpdateFailed: tx('autoUpdateFailed', isChinese ? '自動更新失敗' : 'Auto update failed'),
      downloadFailed: tx(
        'downloadFailed',
        isChinese ? '下載失敗：請嘗試使用瀏覽器開啟此頁面。' : 'Download failed. Please try opening this page in a browser.'
      ),
      shareTitle: tx('shareTitle', isChinese ? 'TradeView 備份檔案' : 'TradeView Backup File'),
      backupFailed: (err: string) =>
        tx('backupFailed', isChinese ? `備份失敗：${err}` : `Backup failed: ${err}`, { error: err }),
      restoreSuccess: tx('restoreSuccess', isChinese ? '成功還原資料！' : 'Data restored successfully!'),
      importFailed: tx(
        'importFailed',
        isChinese ? '匯入失敗：檔案格式錯誤。' : 'Import failed: invalid file format.'
      ),
      txUpdated: tx(
        'txUpdated',
        language === 'zh-TW' ? '交易紀錄已更新' : isChinese ? '交易记录已更新' : 'Transaction updated'
      ),
      marketUpdated: (count: number) =>
        tx(
          'marketUpdated',
          isChinese ? `成功更新 ${count} 筆交易的市場設置` : `Updated market settings for ${count} transactions`,
          { count }
        ),
      txDeleted: tx(
        'txDeleted',
        language === 'zh-TW' ? '交易紀錄已刪除' : isChinese ? '交易记录已删除' : 'Transaction deleted'
      ),
      txCleared: (count: number) =>
        tx(
          'txCleared',
          isChinese ? `✅ 成功清空篩選的 ${count} 筆紀錄！` : `✅ Cleared ${count} filtered records successfully!`,
          { count }
        ),
      accountUpdated: (name: string) =>
        tx('accountUpdated', isChinese ? `帳戶「${name}」已更新` : `Account "${name}" updated`, { name }),
      accountDeleted: (name?: string) =>
        tx(
          'accountDeleted',
          isChinese ? `帳戶「${name ?? ''}」已刪除` : `Account "${name ?? ''}" deleted`,
          { name: name ?? '' }
        ),
      cashFlowUpdated: tx('cashFlowUpdated', isChinese ? '資金記錄已更新' : 'Fund record updated'),
      cashFlowDeleted: tx('cashFlowDeleted', isChinese ? '現金流紀錄已刪除' : 'Cash flow record deleted'),
      cashFlowCleared: (count: number) =>
        tx(
          'cashFlowCleared',
          isChinese ? `✅ 成功清空篩選的 ${count} 筆資金紀錄！` : `✅ Cleared ${count} filtered fund records successfully!`,
          { count }
        ),
      historicalSaved: tx(
        'historicalSaved',
        isChinese
          ? '歷史資產數據更新完成！報表已根據真實股價修正。'
          : 'Historical asset data updated. Reports are now corrected by real prices.'
      ),
      loginPasswordPlaceholder: tx('loginPasswordPlaceholder', isChinese ? '請輸入密碼' : 'Enter password'),
      confirmClearTxTitle: (count: number) =>
        tx(
          'confirmClearTxTitle',
          isChinese ? `確認清空篩選的 ${count} 筆紀錄？` : `Confirm clearing ${count} filtered records?`,
          { count }
        ),
      confirmClearTxMessage: (count: number) =>
        tx(
          'confirmClearTxMessage',
          isChinese
            ? '此操作將刪除目前篩選條件下的交易與資金紀錄，且無法復原。建議先備份資料。'
            : 'This will delete transactions and fund records matching your current filters. This action cannot be undone. Please backup your data first.',
          { count }
        ),
      confirmClearAction: tx('confirmClearAction', isChinese ? '確認清空' : 'Confirm Clear'),
      deleteTxTitle: tx('deleteTxTitle', isChinese ? '刪除交易' : 'Delete Transaction'),
      deleteTxMessage: tx(
        'deleteTxMessage',
        isChinese ? '確定要刪除這筆交易紀錄嗎？' : 'Are you sure you want to delete this transaction?'
      ),
      cashFlowDeleteTitle: tx(
        'cashFlowDeleteTitle',
        isChinese ? '確認刪除資金紀錄' : 'Confirm Delete Fund Record'
      ),
      unknownAccount: tx('unknownAccount', isChinese ? '未知帳戶' : 'Unknown Account'),
      accountLabel: tx('accountLabel', isChinese ? '帳戶：' : 'Account:'),
      dateLabel: tx('dateLabel', isChinese ? '日期：' : 'Date:'),
      typeLabel: tx('typeLabel', isChinese ? '類型：' : 'Type:'),
      amountLabel: tx('amountLabel', isChinese ? '金額：' : 'Amount:'),
      cashFlowDeleteWarningTitle: tx('cashFlowDeleteWarningTitle', isChinese ? '⚠️ 注意' : '⚠️ Attention'),
      cashFlowDeleteWarningBody: (count: number) =>
        tx(
          'cashFlowDeleteWarningBody',
          language === 'zh-TW'
            ? `此帳戶有 ${count} 筆相關交易紀錄。刪除此資金紀錄可能會影響帳戶餘額計算的準確性。`
            : isChinese
              ? `此账户有 ${count} 笔相关交易记录。删除此资金记录可能会影响账户余额计算的准确性。`
              : `This account has ${count} related transactions. Deleting this fund record may affect account balance accuracy.`,
          { count }
        ),
      cashFlowDeleteMessage: tx(
        'cashFlowDeleteMessage',
        isChinese
          ? '確定要刪除這筆資金紀錄嗎？此操作無法復原。'
          : 'Are you sure you want to delete this fund record? This action cannot be undone.'
      ),
      confirmDeleteAction: tx('confirmDeleteAction', isChinese ? '確認刪除' : 'Confirm Delete'),
    };
  }, [language, currentUser, isChinese]);
}
