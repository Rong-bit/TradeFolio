import { useMemo } from 'react';
import { Language, translate } from '../utils/i18n';

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
  cashFlowCleared: string;
  historicalSaved: string;
  loginPasswordPlaceholder: string;
  confirmClearTxTitle: string;
  confirmClearTxMessage: string;
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
          ? '已為您登入「非會員模式」。\n\n您尚未註冊，若需開通會員模式，請按\'申請開通\'發送申請信通知管理員開通權限。'
          : 'You are now logged in as a guest.\n\nIf you want full membership access, click "Upgrade" to send an application email to the administrator.'
      ),
      contactSubject: tx(
        'contactSubject',
        isChinese ? 'TradeView 購買/權限開通申請' : 'TradeView Purchase / Access Request'
      ),
      contactBody: tx(
        'contactBody',
        isChinese
          ? `Hi 管理員,\n\n我的帳號是: ${currentUser}\n\n我目前是非會員身份，希望申請/購買完整權限。\n\n請協助處理，謝謝。`
          : `Hi Admin,\n\nMy account is: ${currentUser}\n\nI am currently on guest access and would like to apply/purchase full permissions.\n\nPlease assist. Thank you.`,
        { user: currentUser }
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
      txUpdated: tx('txUpdated', isChinese ? '交易記錄已更新' : 'Transaction updated'),
      marketUpdated: (count: number) =>
        tx(
          'marketUpdated',
          isChinese ? `成功更新 ${count} 筆交易的市場設置` : `Updated market settings for ${count} transactions`,
          { count }
        ),
      txDeleted: tx('txDeleted', isChinese ? '交易記錄已刪除' : 'Transaction deleted'),
      txCleared: (count: number) =>
        tx(
          'txCleared',
          isChinese ? `✅ 成功清空 ${count} 筆交易紀錄！` : `✅ Cleared ${count} transactions successfully!`,
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
      cashFlowCleared: tx(
        'cashFlowCleared',
        isChinese ? '✅ 成功清空所有資金紀錄！' : '✅ Cleared all fund records successfully!'
      ),
      historicalSaved: tx(
        'historicalSaved',
        isChinese
          ? '歷史資產數據更新完成！報表已根據真實股價修正。'
          : 'Historical asset data updated. Reports are now corrected by real prices.'
      ),
      loginPasswordPlaceholder: tx('loginPasswordPlaceholder', isChinese ? '請輸入密碼' : 'Enter password'),
      confirmClearTxTitle: tx(
        'confirmClearTxTitle',
        isChinese ? '確認清空所有交易？' : 'Confirm clearing all transactions?'
      ),
      confirmClearTxMessage: tx(
        'confirmClearTxMessage',
        isChinese ? '此操作無法復原，請確認您已備份資料。' : 'This action cannot be undone. Please make sure you have a backup.'
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
          isChinese
            ? `此帳戶有 ${count} 筆相關交易記錄。刪除此資金紀錄可能會影響帳戶餘額計算的準確性。`
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
