import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Account, Market, Transaction, TransactionType } from '../types';

interface Props {
  accounts: Account[];
  onImport: (transactions: Transaction[]) => void;
  onClose: () => void;
}

const BatchImportModal: React.FC<Props> = ({ accounts, onImport, onClose }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [inputText, setInputText] = useState(''); // New state for text area
  const [previewData, setPreviewData] = useState<Transaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // 追蹤選中的交易 ID
  const [failCount, setFailCount] = useState(0); // Track failed lines
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('paste'); // Default to paste for ease

  // Helper to parse date MM/DD/YYYY or YYYY/MM/DD to YYYY-MM-DD
  const parseDate = (dateStr: string | undefined) => {
    try {
      if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) return new Date().toISOString().split('T')[0];
      
      const trimmed = dateStr.trim();
      const parts = trimmed.split('/');
      
      if (parts.length === 3) {
        const part1 = parseInt(parts[0], 10);
        const part2 = parseInt(parts[1], 10);
        const part3 = parseInt(parts[2], 10);
        
        if (!isNaN(part1) && !isNaN(part2) && !isNaN(part3)) {
          let year: number, month: number, day: number;
          
          // 判斷格式：MM/DD/YYYY 或 YYYY/MM/DD
          // 如果第一個部分 > 12，肯定是年份（YYYY/MM/DD）
          // 如果第三個部分有4位數字，那第三個部分是年份（MM/DD/YYYY）
          // 如果第一個部分有4位數字，那第一個部分是年份（YYYY/MM/DD）
          
          if (part1 > 12 || parts[0].length === 4) {
            // YYYY/MM/DD 格式
            year = part1;
            month = part2;
            day = part3;
          } else if (part3 > 12 || parts[2].length === 4) {
            // MM/DD/YYYY 格式
            year = part3;
            month = part1;
            day = part2;
          } else {
            // 無法確定，嘗試使用 Date 構造函數（會假設 MM/DD/YYYY）
            const date = new Date(trimmed);
            if (!isNaN(date.getTime())) {
              year = date.getFullYear();
              month = date.getMonth() + 1;
              day = date.getDate();
            } else {
              // 預設使用 MM/DD/YYYY 格式
              year = part3;
              month = part1;
              day = part2;
            }
          }
          
          // 驗證日期有效性
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
            // 使用本地時間創建日期，避免時區問題
            const date = new Date(year, month - 1, day);
            const yearStr = date.getFullYear().toString();
            const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
            const dayStr = date.getDate().toString().padStart(2, '0');
            return `${yearStr}-${monthStr}-${dayStr}`;
          }
        }
      }
      
      // 如果格式不符合，嘗試使用 Date 構造函數
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
      
      // 使用本地時間格式化，避免時區問題
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Helper to clean currency string "$1,234.56" -> 1234.56, "-6,674.00" -> -6674.00
  const parseNumber = (str: string | undefined) => {
    if (!str || typeof str !== 'string') return 0;
    // 保留負號，移除貨幣符號和逗號
    const cleaned = str.replace(/[$,]/g, '');
    const result = parseFloat(cleaned);
    return isNaN(result) ? 0 : result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseImportData(text);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleParseText = () => {
    parseImportData(inputText);
  };

  const parseImportData = (text: string) => {
    try {
      setErrorMsg('');
      setFailCount(0); // Reset failure count
      console.log('開始解析文字:', text);
      const lines = text.split('\n');
      console.log('分割後的行數:', lines.length, lines);
      const transactions: Transaction[] = [];
      let currentFailures = 0;
      let headers: string[] = [];
      
      // Detection: Check if it looks like Schwab CSV or Firstrade CSV (has specific headers)
      const firstLine = lines.find(l => l.trim().length > 0) || '';
      // Firstrade 有 TradeDate 列，嘉信只有 Date 列
      const isFirstradeCSV = firstLine.includes('TradeDate') && firstLine.includes('Action') && firstLine.includes('Symbol') && firstLine.includes(',');
      const isSchwabCSV = !isFirstradeCSV && firstLine.includes('Date') && firstLine.includes('Action') && firstLine.includes(',');
      const isTabSeparated = firstLine.includes('\t');

      lines.forEach((line, index) => {
        // Skip empty lines
        if (!line.trim()) return;

        let dateVal = '';
        let type: TransactionType | null = null;
        let tickerVal = '';
        let priceVal = 0;
        let quantityVal = 0;
        let feesVal = 0;
        let amountVal = 0;
        let market = Market.US; // Default
        let noteVal = 'Batch Import';

        if (isSchwabCSV) {
            // --- Logic for Schwab CSV ---
            const cleanLine = line.trim();
            if (index === 0 || (cleanLine.includes('"Date"') && cleanLine.includes('"Action"'))) {
              headers = cleanLine.split(',').map(h => h.replace(/"/g, '').trim());
              return; // Header row is not a failure
            }
            const columns = cleanLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || cleanLine.split(',');
            const cols = columns.map(c => c.replace(/^"|"$/g, '').trim());
            
            if (cols.length < 5) {
                currentFailures++;
                return;
            }

            const dateIdx = headers.indexOf('Date');
            const actionIdx = headers.indexOf('Action');
            const symbolIdx = headers.indexOf('Symbol');
            const qtyIdx = headers.indexOf('Quantity');
            const priceIdx = headers.indexOf('Price');
            const feesIdx = headers.indexOf('Fees & Comm');
            const amountIdx = headers.indexOf('Amount');

            dateVal = parseDate(cols[dateIdx !== -1 ? dateIdx : 0]);
            tickerVal = cols[symbolIdx !== -1 ? symbolIdx : 2];
            const rawQty = parseNumber(cols[qtyIdx !== -1 ? qtyIdx : 4]);
            quantityVal = Math.abs(rawQty);
            priceVal = parseNumber(cols[priceIdx !== -1 ? priceIdx : 5]);
            feesVal = Math.abs(parseNumber(cols[feesIdx !== -1 ? feesIdx : 6]));

            const actionVal = cols[actionIdx !== -1 ? actionIdx : 1];
            const actionLower = actionVal.toLowerCase();

            // 跳過不需要解析的 Action 類型
            // 注意：只跳過 "Reinvest Dividend"（完整字串），"Reinvest Shares" 會被解析為 DIVIDEND
            if (actionLower.includes('reinvest dividend') || actionLower.includes('nra tax adj')) {
                return; // 直接跳過，不計入失敗數
            }

            if (actionLower.includes('buy')) type = TransactionType.BUY;
            else if (actionLower.includes('sell')) type = TransactionType.SELL;
            else if (actionLower.includes('reinvest')) {
                // "Reinvest Shares" 會被解析為 DIVIDEND 類型
                type = TransactionType.DIVIDEND;
            }
            else if (actionLower.includes('cash dividend') || actionLower.includes('qual div')) {
                type = TransactionType.CASH_DIVIDEND;
                amountVal = parseNumber(cols[amountIdx !== -1 ? amountIdx : 7]);
                priceVal = Math.abs(amountVal); 
                quantityVal = 1;
            }
            else if (actionLower.includes('journal') || actionLower.includes('transfer')) {
                if (rawQty > 0) type = TransactionType.TRANSFER_IN;
                else type = TransactionType.TRANSFER_OUT;
            }
            
            // 為 Schwab CSV 設置 amountVal（如果還沒設置的話）
            if (amountVal === 0 && amountIdx !== -1) {
                amountVal = parseNumber(cols[amountIdx]);
            }

        } else if (isFirstradeCSV) {
            // --- Logic for Firstrade CSV ---
            const cleanLine = line.trim();
            if (index === 0 || (cleanLine.includes('TradeDate') && cleanLine.includes('Action'))) {
              headers = cleanLine.split(',').map(h => h.replace(/"/g, '').trim());
              return; // Header row is not a failure
            }
            
            // 移除行尾的 \r\n
            const trimmedLine = cleanLine.replace(/\r\n?$/, '').trim();
            
            // 使用简单的 split(',') 方法，因为 Firstrade CSV 格式固定，字段用逗号分隔
            // 先尝试处理引号包裹的字段
            let cols: string[] = [];
            let currentField = '';
            let inQuotes = false;
            
            for (let i = 0; i < trimmedLine.length; i++) {
                const char = trimmedLine[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    cols.push(currentField.trim());
                    currentField = '';
                } else {
                    currentField += char;
                }
            }
            // 添加最后一个字段
            if (currentField || trimmedLine.endsWith(',')) {
                cols.push(currentField.trim());
            }
            
            // 如果解析出来的列数太少，使用备用方法
            if (cols.length < 5) {
                const columns = trimmedLine.split(',');
                cols = columns.map(c => c.replace(/^"|"$/g, '').trim());
            }
            
            if (cols.length < 5) {
                currentFailures++;
                return;
            }

            const tradeDateIdx = headers.indexOf('TradeDate');
            const actionIdx = headers.indexOf('Action');
            const symbolIdx = headers.indexOf('Symbol');
            const qtyIdx = headers.indexOf('Quantity');
            const priceIdx = headers.indexOf('Price');
            // 嘗試多種可能的列名
            let descriptionIdx = headers.indexOf('Description');
            if (descriptionIdx === -1) {
                descriptionIdx = headers.indexOf('Descriptor');
            }
            if (descriptionIdx === -1) {
                descriptionIdx = headers.findIndex(h => h.toLowerCase().includes('description') || h.toLowerCase().includes('descriptor'));
            }
            // Firstrade 的列名是分開的：Commission 和 Fee
            // Fee 列才是手續費（索引 10），Commission 列通常是 0（索引 9）
            let feeIdx = headers.indexOf('Fee');
            if (feeIdx === -1) {
                feeIdx = headers.findIndex(h => h.toLowerCase().trim() === 'fee');
            }
            if (feeIdx === -1) {
                // 如果找不到，根據 Firstrade 標準格式，Fee 應該在索引 10
                feeIdx = headers.length > 10 ? 10 : -1;
            }
            const amountIdx = headers.indexOf('Amount');
            const recordTypeIdx = headers.indexOf('RecordType');

            // 使用 TradeDate 作為日期，如果沒有則使用 SettledDate
            const settledDateIdx = headers.indexOf('SettledDate');
            const dateColumnIdx = tradeDateIdx !== -1 ? tradeDateIdx : (settledDateIdx !== -1 ? settledDateIdx : 0);
            dateVal = parseDate(cols[dateColumnIdx] || '');
            
            // 安全地获取各个列的值，避免 undefined 错误
            // Firstrade 标准列顺序: Symbol(0), Quantity(1), Price(2), Action(3), Description(4), 
            // TradeDate(5), SettledDate(6), Interest(7), Amount(8), Commission(9), Fee(10), CUSIP(11), RecordType(12)
            tickerVal = (symbolIdx !== -1 && symbolIdx < cols.length && cols[symbolIdx]) ? String(cols[symbolIdx]).trim() : '';
            const rawQty = parseNumber((qtyIdx !== -1 && qtyIdx < cols.length) ? cols[qtyIdx] : (cols[1] || ''));
            quantityVal = Math.abs(rawQty);
            priceVal = parseNumber((priceIdx !== -1 && priceIdx < cols.length) ? cols[priceIdx] : (cols[2] || ''));
            // Fee 列在索引 10，這是手續費（不是 Commission，也不是 CUSIP）
            // 先嘗試從列名獲取，如果找不到則使用默認索引 10
            let rawFeesStr = '';
            if (feeIdx !== -1 && feeIdx < cols.length) {
                rawFeesStr = cols[feeIdx] || '';
            } else if (cols.length > 10) {
                // 如果找不到列名，使用默認位置（索引 10）
                rawFeesStr = cols[10] || '';
            } else {
                rawFeesStr = '0';
            }
            
            // 檢查是否是科學記數法（CUSIP 可能是科學記數法）或異常大的數字
            // 正常手續費通常在 0-100 之間，超過 100 可能是錯誤數據（如 CUSIP）
            if (rawFeesStr && typeof rawFeesStr === 'string') {
                const trimmedFeesStr = rawFeesStr.trim();
                if (trimmedFeesStr.includes('E+') || trimmedFeesStr.includes('e+')) {
                    // 科學記數法，可能是 CUSIP，設為 0
                    rawFeesStr = '0';
                } else {
                    const feesNum = parseFloat(trimmedFeesStr.replace(/[$,]/g, '') || '0');
                    if (!isNaN(feesNum) && feesNum > 100) {
                        // 手續費超過 100，可能是 CUSIP 或其他錯誤數據，設為 0
                        rawFeesStr = '0';
                    }
                }
            }
            
            feesVal = Math.abs(parseNumber(rawFeesStr));
            // 再次驗證：如果解析出的手續費異常大（>100），設為 0（正常手續費不會超過 100）
            // 但保留小數點後的手續費（如 0.09, 2.33, 0.41, 0.35, 1.19 等）
            if (feesVal > 100) {
                feesVal = 0;
            }
            // Amount 在索引 8
            let rawAmountStr = (amountIdx !== -1 && amountIdx < cols.length) ? cols[amountIdx] : (cols.length > 8 ? cols[8] : '0');
            // 檢查是否是科學記數法（CUSIP 可能是科學記數法）或異常大的數字
            if (rawAmountStr && (rawAmountStr.includes('E+') || rawAmountStr.includes('e+'))) {
                // 這可能是 CUSIP，不是 Amount，設為 0
                rawAmountStr = '0';
            }
            // 先解析原始值（可能是負數，如股息再投入）
            amountVal = parseNumber(rawAmountStr);
            // 如果解析出的金額異常大（可能是 CUSIP），設為 0（保留負數，因為股息再投入的 Amount 是負數）
            if (Math.abs(amountVal) > 1000000) {
                amountVal = 0;
            }

            const actionVal = (actionIdx !== -1 && actionIdx < cols.length && cols[actionIdx]) 
                ? String(cols[actionIdx]) 
                : ((cols[3] && cols.length > 3) ? String(cols[3]) : '');
            const actionLower = (actionVal || '').toLowerCase();
            const recordTypeVal = (recordTypeIdx !== -1 && recordTypeIdx < cols.length && cols[recordTypeIdx]) 
                ? String(cols[recordTypeIdx]) 
                : '';
            const recordType = recordTypeVal ? recordTypeVal.toLowerCase() : '';
            // 獲取 Description 列（用於判斷 REIN、XFER 等特殊類型）
            // 先嘗試從列名獲取，如果找不到則使用默認索引 4
            let descriptionVal = '';
            if (descriptionIdx !== -1 && descriptionIdx < cols.length) {
                descriptionVal = String(cols[descriptionIdx] || '').trim();
            }
            // 如果還是空的，使用默認位置（索引 4，因為格式是：Symbol,Quantity,Price,Action,Description,...）
            if (!descriptionVal && cols.length > 4) {
                descriptionVal = String(cols[4] || '').trim();
            }
            // 如果還是空的，嘗試在其他列中查找（Description 通常較長且包含公司名稱）
            if (!descriptionVal) {
                for (let i = 3; i < Math.min(cols.length, 6); i++) {
                    const testVal = String(cols[i] || '').trim();
                    if (testVal && testVal.length > 20) { // Description 通常較長
                        descriptionVal = testVal;
                        break;
                    }
                }
            }
            let descriptionUpper = (descriptionVal || '').toUpperCase();

            // 跳過不需要解析的 Action 類型
            if (actionLower.includes('reinvest dividend') || actionLower.includes('nra tax adj')) {
                return; // 直接跳過，不計入失敗數
            }

            // 根據 Action 和 RecordType 判斷交易類型
            if (actionLower.includes('buy')) {
                // 檢查是否有有效的價格或金額
                // 如果 Price = 0 且 Amount 無效，可能是數據錯誤，跳過
                if (priceVal === 0 && (amountVal === 0 || isNaN(amountVal))) {
                    // 檢查是否可能是再投資股息（應該有數量）
                    if (quantityVal > 0 && recordType !== 'trade') {
                        // 可能是再投資股息，但被標記為 BUY，跳過（應該由 DIVIDEND 處理）
                        return;
                    } else {
                        // 無效的 BUY 記錄，跳過
                        return;
                    }
                }
                type = TransactionType.BUY;
            } else if (actionLower.includes('sell')) {
                type = TransactionType.SELL;
            } else if (actionLower.includes('dividend')) {
                // Firstrade 的 Dividend 可能是現金股息或再投資股息
                // 判斷標準：
                // 1. 股息再投入：RecordType = "Trade" 且 Quantity > 0 且 Price > 0
                // 2. 現金股息：RecordType = "Financial" 或 (Quantity = 0 且 Price = 0)
                const isReinvestDividend = recordType === 'trade' && quantityVal > 0 && priceVal > 0;
                const isCashDividend = recordType === 'financial' || (quantityVal === 0 && priceVal === 0);
                
                if (isReinvestDividend) {
                    // 股息再投入（股票股息）：自動買入股票，有數量和價格
                    type = TransactionType.DIVIDEND;
                    feesVal = 0; // 股息不應該有手續費
                    // 確保 amountVal 正確（應該是價格 × 數量）
                    if (amountVal <= 0 || amountVal > 1000000) {
                        amountVal = priceVal * quantityVal;
                    }
                } else if (isCashDividend) {
                    // 現金股息：使用 Amount 作為股息金額
                    type = TransactionType.CASH_DIVIDEND;
                    // 確保 amountVal 是正確的值（不應該是 CUSIP）
                    // 如果 amountVal 還是 0 或異常，嘗試從 Interest 列獲取
                    if (amountVal <= 0 || amountVal > 1000000) {
                        const interestIdx = headers.indexOf('Interest');
                        if (interestIdx !== -1 && interestIdx < cols.length && cols[interestIdx]) {
                            const interestVal = parseNumber(cols[interestIdx]);
                            if (interestVal > 0 && interestVal <= 1000000) {
                                amountVal = interestVal;
                            } else {
                                // 無法確定股息金額，跳過這筆記錄
                                return;
                            }
                        } else {
                            // 無法確定股息金額，跳過
                            return;
                        }
                    }
                    amountVal = Math.abs(amountVal);
                    priceVal = amountVal; // 現金股息用 amount 作為 price
                    quantityVal = 1;
                    feesVal = 0; // 股息不應該有手續費
                } else {
                    // 無法確定類型，根據數量判斷
                    if (quantityVal > 0 && priceVal > 0) {
                        // 有數量和價格，視為再投資股息
                        type = TransactionType.DIVIDEND;
                        feesVal = 0;
                        if (amountVal <= 0 || amountVal > 1000000) {
                            amountVal = priceVal * quantityVal;
                        }
                    } else {
                        // 沒有數量或價格，視為現金股息
                        type = TransactionType.CASH_DIVIDEND;
                        if (amountVal <= 0 || amountVal > 1000000) {
                            const interestIdx = headers.indexOf('Interest');
                            if (interestIdx !== -1 && interestIdx < cols.length && cols[interestIdx]) {
                                const interestVal = parseNumber(cols[interestIdx]);
                                if (interestVal > 0 && interestVal <= 1000000) {
                                    amountVal = interestVal;
                                } else {
                                    return; // 無法確定股息金額，跳過
                                }
                            } else {
                                return; // 無法確定股息金額，跳過
                            }
                        }
                        amountVal = Math.abs(amountVal);
                        priceVal = amountVal;
                        quantityVal = 1;
                        feesVal = 0;
                    }
                }
            } else if (actionLower.includes('interest')) {
                // 利息收入，跳過（通常不屬於股票交易）
                return;
            } else if (actionLower.includes('other')) {
                // Other 類型需要根據 Description 判斷具體類型
                // 1. REIN（股息再投入）- 識別為 DIVIDEND
                // 2. XFER（轉帳）- 識別為 TRANSFER_IN/OUT
                // 3. 稅務相關記錄（NRA ADJ, TAX WITHHELD 等）- 跳過
                // 4. 其他情況根據數量判斷
                
                // 調試：檢查 Description 列是否正確獲取
                // 如果 descriptionVal 為空，嘗試從所有列中查找包含 REIN 的列
                // 同時也嘗試從 Description 索引附近的列查找
                if (!descriptionVal || descriptionVal === '') {
                    // 嘗試在 Description 索引附近的列中查找（索引 3, 4, 5）
                    for (let offset = -1; offset <= 1; offset++) {
                        const tryIdx = (descriptionIdx !== -1 ? descriptionIdx : 4) + offset;
                        if (tryIdx >= 0 && tryIdx < cols.length && cols[tryIdx]) {
                            const tryVal = String(cols[tryIdx]).trim();
                            if (tryVal && tryVal.length > 10) { // Description 通常較長
                                descriptionVal = tryVal;
                                descriptionUpper = descriptionVal.toUpperCase();
                                break;
                            }
                        }
                    }
                    // 如果還是找不到，嘗試在所有列中查找包含 REIN 的內容
                    if (!descriptionVal || descriptionVal === '') {
                        for (let i = 0; i < cols.length; i++) {
                            const colVal = String(cols[i] || '').trim().toUpperCase();
                            if (colVal.includes('REIN') || colVal.includes('REINVEST')) {
                                descriptionVal = String(cols[i] || '').trim();
                                descriptionUpper = descriptionVal.toUpperCase();
                                break;
                            }
                        }
                    }
                }
                
                // 優先檢查是否為稅務相關記錄（應該跳過，不計入失敗數）
                const isTaxRelated = descriptionUpper.includes('NRA ADJ') || 
                                   descriptionUpper.includes('NON-RES TAX') || 
                                   descriptionUpper.includes('TAX WITHHELD') || 
                                   descriptionUpper.includes('WITHHELD') ||
                                   descriptionUpper.includes('NON RESIDENT') ||
                                   (descriptionUpper.includes('ADJ') && (descriptionUpper.includes('TAX') || descriptionUpper.includes('NRA')));
                
                if (isTaxRelated) {
                    // 稅務相關記錄，跳過（不屬於股票交易）
                    return;
                }
                
                // 檢查是否為股息再投入：檢查 Description 中是否包含 REIN，或者檢查是否有 Symbol、正數量但 Price 為空（這通常是股息再投入的特徵）
                // 優先檢查 Description，如果 Description 為空，則使用其他特徵判斷
                const hasReinInDescription = descriptionUpper.includes('REIN') || descriptionUpper.includes('REINVEST');
                // 股息再投入的特徵：Symbol + 正數量 + Price = 0 + RecordType = Financial + Amount < 0
                const hasReinvestCharacteristics = tickerVal && tickerVal !== '' && quantityVal > 0 && (priceVal === 0 || isNaN(priceVal)) && recordType === 'financial' && amountVal < 0;
                const isReinvest = hasReinInDescription || hasReinvestCharacteristics;
                
                if (isReinvest) {
                    // 股息再投入：自動用股息購買股票
                    // 必須有 Symbol 和數量才能處理
                    if (!tickerVal || tickerVal === '' || quantityVal <= 0) {
                        // 如果沒有 Symbol 或數量，可能是數據錯誤，跳過
                        return;
                    }
                    
                    type = TransactionType.DIVIDEND;
                    feesVal = 0; // 股息不應該有手續費
                    
                    // 確保 amountVal 正確：股息再投入的 Amount 是負數（支出），需要先轉為正數
                    let workingAmount = amountVal;
                    if (workingAmount < 0) {
                        workingAmount = Math.abs(workingAmount);
                    }
                    
                    // 從 Description 中提取價格（格式：REIN @ 513.2849 或 REIN @  513.2849）
                    // 嘗試多種格式：REIN @ 513.2849, REIN @  513.2849, REIN@513.2849
                    let extractedPrice = 0;
                    const pricePatterns = [
                        /REIN\s*@\s*(\d+\.?\d*)/i,  // REIN @ 513.2849
                        /REIN\s*@\s*\s*(\d+\.?\d*)/i, // REIN @  513.2849 (多個空格)
                        /@\s*(\d+\.?\d*)\s*REC/i,    // @ 513.2849 REC
                    ];
                    
                    for (const pattern of pricePatterns) {
                        const match = descriptionVal.match(pattern);
                        if (match && match[1]) {
                            const parsed = parseNumber(match[1]);
                            if (parsed > 0) {
                                extractedPrice = parsed;
                                break;
                            }
                        }
                    }
                    
                    // 如果從 Description 中提取到價格，使用它
                    if (extractedPrice > 0) {
                        priceVal = extractedPrice;
                    }
                    
                    // 如果 Price 列有值，優先使用 Price 列（但應該檢查 Price 列是否正確）
                    if (priceVal > 0 && !isNaN(priceVal)) {
                        // Price 列或從 Description 提取的價格有效
                    } else {
                        // 如果 Price 列為空或無效，使用 Amount / Quantity 計算
                        if (workingAmount > 0 && !isNaN(workingAmount) && quantityVal > 0) {
                            priceVal = workingAmount / quantityVal;
                        } else {
                            // 無法確定價格，嘗試從原始 Price 列獲取（雖然可能為 0）
                            // 如果還是無法確定，跳過
                            if (priceVal === 0 || isNaN(priceVal)) {
                                return; // 無法確定價格，跳過
                            }
                        }
                    }
                    
                    // 確保 amountVal 正確：使用計算出的價格和數量，或使用原始 Amount（轉為正數）
                    if (priceVal > 0 && quantityVal > 0) {
                        const calculatedAmount = priceVal * quantityVal;
                        // 使用計算出的金額，或者原始金額（如果合理）
                        if (workingAmount > 0 && Math.abs(calculatedAmount - workingAmount) / Math.max(calculatedAmount, workingAmount) < 0.1) {
                            // 計算值和原始值接近（誤差 < 10%），使用原始值
                            amountVal = workingAmount;
                        } else {
                            // 使用計算值
                            amountVal = calculatedAmount;
                        }
                    } else if (workingAmount > 0) {
                        amountVal = workingAmount;
                    } else {
                        // 無法確定金額，跳過
                        return;
                    }
                    
                    noteVal = 'Batch Import - 股息再投入 (Firstrade)';
                } else if (descriptionUpper.includes('XFER') || descriptionUpper.includes('TRANSFER')) {
                    // 轉帳操作 - 需要有 Symbol 才能處理為股票轉帳
                    if (!tickerVal || tickerVal === '') {
                        // 如果沒有 Symbol，是現金轉帳，跳過（不屬於股票交易）
                        return;
                    }
                    // 根據數量正負或 Amount 正負判斷轉入/轉出
                    if (rawQty > 0 || (amountVal > 0 && rawQty === 0)) {
                        type = TransactionType.TRANSFER_IN;
                        noteVal = 'Batch Import - 轉入 (Firstrade)';
                    } else if (rawQty < 0 || amountVal < 0) {
                        type = TransactionType.TRANSFER_OUT;
                        noteVal = 'Batch Import - 轉出 (Firstrade)';
                        amountVal = Math.abs(amountVal);
                    } else {
                        // 無法判斷，跳過
                        return;
                    }
                } else {
                    // 其他 Other 類型 - 需要根據具體情況判斷
                    // 如果沒有 Symbol，跳過這筆記錄（可能是現金操作，不屬於股票交易）
                    if (!tickerVal || tickerVal === '') {
                        return;
                    }
                    
                    // 檢查是否是稅務或調整記錄（數量為 0 且金額很小，通常小於 10）
                    if (quantityVal === 0 && Math.abs(amountVal) > 0 && Math.abs(amountVal) < 10) {
                        // 很可能是稅務或調整記錄，跳過
                        return;
                    }
                    
                    // 如果數量為 0 且金額也為 0，跳過（無意義記錄）
                    if (quantityVal === 0 && Math.abs(amountVal) === 0) {
                        return;
                    }
                    
                    // 只有當有實際的數量變化時，才判斷為轉帳
                    if (rawQty > 0 && quantityVal > 0) {
                        type = TransactionType.TRANSFER_IN;
                        noteVal = 'Batch Import - 轉入 (Firstrade)';
                    } else if (rawQty < 0 && quantityVal > 0) {
                        type = TransactionType.TRANSFER_OUT;
                        noteVal = 'Batch Import - 轉出 (Firstrade)';
                        amountVal = Math.abs(amountVal);
                    } else {
                        // 無法判斷為有效的股票交易，跳過
                        return;
                    }
                }
            } else if (actionLower.includes('wire funds') || actionLower.includes('xfer cas')) {
                // 現金轉帳，跳過（不屬於股票交易）
                return;
            }

            // 如果沒有找到有效的交易類型，跳過這筆記錄
            if (!type) {
                return;
            }

            // 為 Firstrade CSV 設置 amountVal（如果還沒設置的話）
            if (amountVal === 0 && amountIdx !== -1) {
                amountVal = parseNumber(cols[amountIdx]);
            }

        } else {
            // --- Logic for Simple/Custom Text (Tab or Comma) ---
            // Expected format: Date | Type | Ticker | Price | Qty | Fees | (Amount)
            let cols: string[];
            if (isTabSeparated) {
              // 使用 split('\t') 確保正確分割制表符，不過濾空字串以保持欄位對齊
              cols = line.split('\t').map(c => c.trim());
            } else {
              cols = line.trim().split(/\s+/).map(c => c.trim());
            }
            
            if (cols.length < 3) {
              currentFailures++;
              return; // Need at least Date, Type, Ticker
            }

            dateVal = parseDate(cols[0]);
            const typeStr = cols[1];
            const typeStrLower = typeStr.toLowerCase();
            
            // 跳過不需要解析的 Action 類型
            if (typeStrLower.includes('reinvest dividend') || typeStrLower.includes('nra tax adj')) {
                return; // 直接跳過，不計入失敗數
            }
            
            tickerVal = cols[2] || '';
            priceVal = cols.length > 3 && cols[3] ? parseNumber(cols[3]) : 0;
            const rawQty = cols.length > 4 && cols[4] ? parseNumber(cols[4]) : 0;
            quantityVal = Math.abs(rawQty);
            feesVal = cols.length > 5 && cols[5] ? parseNumber(cols[5]) : 0;
            amountVal = cols.length > 6 && cols[6] ? parseNumber(cols[6]) : 0;
            
            // Map Chinese / English Types
            if (typeStr.includes('買') || typeStrLower === 'buy') type = TransactionType.BUY;
            else if (typeStr.includes('賣') || typeStr.toLowerCase() === 'sell') type = TransactionType.SELL;
            
            // --- New Logic for Transfer (嘉信/Schwab 格式) ---
            else if (typeStr.includes('轉移') || typeStr.toLowerCase().includes('transfer') || typeStr.includes('journal')) {
                // 邏輯：股數為負 -> 轉出 (TRANSFER_OUT)；股數為正 -> 轉入 (TRANSFER_IN)
                if (rawQty < 0) {
                    type = TransactionType.TRANSFER_OUT;
                    noteVal = 'Batch Import - 轉出';
                } else {
                    type = TransactionType.TRANSFER_IN;
                    noteVal = 'Batch Import - 轉入';
                }
            }
            // ---------------------------------------------
            
            else if (typeStr.includes('股息') || typeStr.includes('配息') || typeStr.toLowerCase().includes('div')) {
                if (quantityVal > 0) {
                    type = TransactionType.DIVIDEND;
                } else {
                    type = TransactionType.CASH_DIVIDEND;
                    // Fix: If Price column is 0, check Amount column for total dividend
                    if (priceVal === 0 && amountVal > 0) {
                        priceVal = amountVal;
                    }
                    quantityVal = 1; // Force quantity to 1 for cash dividends
                }
            }
        }

        // --- Common Validation & Ticker Cleaning ---
        if (!tickerVal || tickerVal === '' || !type) {
            currentFailures++;
            return;
        }

        // Auto-detect Taiwan Market (TPE: prefix OR 4-digit code)
        if (tickerVal.includes('TPE:') || tickerVal.includes('TW') || /^\d{4}$/.test(tickerVal)) {
            market = Market.TW;
            // Remove 'TPE:', 'TW', 'US' prefixes to clean ticker
            tickerVal = tickerVal.replace(/^(TPE:|TW|US)/i, '');
        }

        // 計算金額：優先使用提供的金額欄位
        let finalAmount = 0;
        // 檢查是否提供了金額欄位（不為0且有效）
        if (amountVal !== 0 && !isNaN(amountVal)) {
          // 如果提供了金額欄位，使用其絕對值
          finalAmount = Math.abs(amountVal);
        } else {
          // 如果沒有提供金額欄位，則計算
          let baseVal = priceVal * quantityVal;
          // 台股邏輯：無條件捨去
          if (market === Market.TW) {
              baseVal = Math.floor(baseVal);
          }
          finalAmount = baseVal + feesVal;
        }
        
        transactions.push({
          id: uuidv4(),
          date: dateVal,
          ticker: tickerVal.toUpperCase(),
          market: market,
          type: type,
          price: priceVal,
          quantity: quantityVal,
          fees: feesVal,
          amount: finalAmount, // 使用提供的金額或計算值
          accountId: selectedAccountId,
          note: noteVal
        });
      });

      setFailCount(currentFailures);

      if (transactions.length === 0) {
        if (currentFailures > 0) {
            setErrorMsg(`無法解析資料。共 ${currentFailures} 筆資料格式錯誤，請檢查。`);
        } else {
            setErrorMsg('無法解析資料。請確認是否貼上了正確的內容。');
        }
      } else {
        setPreviewData(transactions);
        // 預設全選所有解析成功的交易
        setSelectedIds(new Set(transactions.map(t => t.id)));
      }

    } catch (err) {
      console.error('解析錯誤詳情:', err);
      console.error('輸入文字:', text);
      setErrorMsg(`解析發生錯誤：${err instanceof Error ? err.message : '未知錯誤'}。請檢查資料格式。`);
    }
  };

  const handleConfirm = () => {
    // 嚴格驗證帳戶
    if (accounts.length === 0) {
      alert("❌ 無法匯入：系統中沒有任何帳戶\n請先到「證券戶管理」頁面建立帳戶，然後再回來進行批次匯入。");
      return;
    }
    
    if (!selectedAccountId || selectedAccountId === '') {
      alert("❌ 無法匯入：請先選擇一個帳戶");
      return;
    }
    
    // 新增：檢查是否有資料
    if (previewData.length === 0) {
      if (activeTab === 'paste' && inputText.trim().length > 0) {
         alert("⚠️ 請先點擊「解析貼上內容」按鈕，確認表格預覽出現資料後，再按下確認匯入。");
      } else {
         alert("❌ 無法匯入：沒有資料。請貼上交易文字並解析，或上傳 CSV 檔案。");
      }
      return;
    }

    // 檢查選擇的帳戶是否真的存在
    const selectedAccount = accounts.find(a => a.id === selectedAccountId);
    if (!selectedAccount) {
      alert("❌ 無法匯入：選擇的帳戶不存在");
      return;
    }
    
    // 只匯入選中的交易
    const selectedTransactions = previewData.filter(t => selectedIds.has(t.id));
    
    if (selectedTransactions.length === 0) {
      alert("❌ 請至少選擇一筆交易進行匯入");
      return;
    }
    
    const finalData = selectedTransactions.map(t => ({...t, accountId: selectedAccountId}));
    onImport(finalData);
    onClose();
  };

  // 切換單筆選擇
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 全選/取消全選
  const toggleSelectAll = () => {
    if (selectedIds.size === previewData.length) {
      // 全部已選中，取消全選
      setSelectedIds(new Set());
    } else {
      // 全選
      setSelectedIds(new Set(previewData.map(t => t.id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center shrink-0">
          <h2 className="text-white font-bold text-lg">批次匯入交易 (Batch Import)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Account Selection */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
             <label className="block text-sm font-bold text-slate-700 mb-2">1. 選擇匯入帳戶</label>
             
             {accounts.length === 0 ? (
               <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                 <p className="text-red-800 text-sm font-medium mb-2">
                   ⚠️ 無法進行批次匯入
                 </p>
                 <p className="text-red-700 text-sm">
                   系統中沒有任何帳戶，請先到「證券戶管理」頁面建立帳戶，然後再回來進行批次匯入。
                 </p>
               </div>
             ) : (
               <select 
                  value={selectedAccountId}
                  onChange={(e) => {
                    setSelectedAccountId(e.target.value);
                    setPreviewData(prev => prev.map(t => ({...t, accountId: e.target.value})));
                  }}
                  className="w-full md:w-1/2 border border-slate-300 rounded p-2"
               >
                 <option value="">-- 請選擇帳戶 --</option>
                 {accounts.map(a => (
                   <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                 ))}
               </select>
             )}
          </div>

          {/* Tabs */}
          <div>
            <div className="flex border-b border-slate-200 mb-4">
              <button 
                onClick={() => setActiveTab('paste')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'paste' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                直接貼上文字 (Paste)
              </button>
              <button 
                onClick={() => setActiveTab('file')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'file' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                上傳 CSV 檔案 (Upload)
              </button>
            </div>

            {activeTab === 'paste' ? (
              <div className="space-y-3">
                <label className="block text-sm text-slate-600">
                  請將 Excel 或表格資料複製貼上於此 (支援格式: 日期 | 買/賣/股息/轉移 | 代號 | 價格 | 數量 | 手續費 | 總金額)
                  <br />
                  <span className="text-xs text-slate-500">💡 「轉移」類別：若數量為負視為轉出，正則視為轉入。</span>
                </label>
                <textarea 
                  className="w-full h-40 border border-slate-300 rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-accent outline-none"
                  placeholder={`2022/3/30	買	VT	103.23	1.00	0.00\n2025/2/11	轉移	VT	93.41	-167.73	0.00`}
                  value={inputText}
                  onChange={handleTextChange}
                />
                <button 
                  onClick={handleParseText}
                  disabled={!inputText.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50 text-sm"
                >
                  解析貼上內容
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm text-slate-600">
                  支援 CSV 匯出檔：嘉信 (Charles Schwab)、Firstrade
                </label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded text-sm">
              {errorMsg}
            </div>
          )}

          {/* Preview Table */}
          {previewData.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex justify-between items-center">
                <span>
                    預覽匯入資料
                    <span className="ml-2 font-normal text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        成功: <span className="text-green-600 font-bold">{previewData.length}</span>
                    </span>
                    <span className="ml-2 font-normal text-sm bg-blue-100 px-2 py-0.5 rounded text-blue-600 border border-blue-200">
                        已選: <span className="text-blue-700 font-bold">{selectedIds.size}</span> 筆
                    </span>
                    {failCount > 0 && (
                        <span className="ml-2 font-normal text-sm bg-red-50 px-2 py-0.5 rounded text-red-600 border border-red-100">
                            未成功: <strong>{failCount}</strong> 筆
                        </span>
                    )}
                </span>
                <span className="text-xs font-normal text-slate-500">請選擇要匯入的交易</span>
              </h3>
              <div className="mb-2 flex items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="text-xs px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 transition"
                >
                  {selectedIds.size === previewData.length ? '取消全選' : '全選'}
                </button>
                <span className="text-xs text-slate-500">
                  {selectedIds.size === previewData.length ? '已全選' : `已選擇 ${selectedIds.size} / ${previewData.length} 筆`}
                </span>
              </div>
              <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === previewData.length && previewData.length > 0}
                          onChange={toggleSelectAll}
                          className="cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Action</th>
                      <th className="px-4 py-2">Market</th>
                      <th className="px-4 py-2">Symbol</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Fees</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((row, idx) => {
                      const isSelected = selectedIds.has(row.id);
                      return (
                        <tr 
                          key={row.id} 
                          className={`hover:bg-slate-50 ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelection(row.id)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                             <span className={`px-2 py-0.5 rounded text-xs ${
                               row.type === TransactionType.BUY ? 'bg-red-100 text-red-700' : 
                               row.type === TransactionType.SELL ? 'bg-green-100 text-green-700' :
                               row.type === TransactionType.TRANSFER_IN ? 'bg-blue-100 text-blue-700' :
                               row.type === TransactionType.TRANSFER_OUT ? 'bg-orange-100 text-orange-700' :
                               'bg-yellow-100 text-yellow-700'
                             }`}>
                               {row.type}
                             </span>
                          </td>
                          <td className="px-4 py-2">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.market === Market.TW ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                               {row.market}
                             </span>
                          </td>
                          <td className="px-4 py-2 font-mono">{row.ticker}</td>
                          <td className="px-4 py-2 text-right font-mono">{row.quantity}</td>
                          <td className="px-4 py-2 text-right font-mono">{row.price.toFixed(2)}</td>
                           <td className="px-4 py-2 text-right text-slate-400">{row.fees}</td>
                           <td className="px-4 py-2 text-right font-mono font-semibold text-slate-800">
                             {(row as any).amount ? ((row as any).amount % 1 === 0 ? Math.abs((row as any).amount).toString() : Math.abs((row as any).amount).toFixed(2)) : '-'}
                           </td>
                         </tr>
                       );
                     })}
                    </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition"
          >
            取消
          </button>
          <button 
            onClick={handleConfirm}
            // 移除 disabled，讓使用者可以點擊並獲得錯誤提示
            className={`px-6 py-2 rounded-lg transition shadow-lg text-white ${
               (previewData.length > 0 && accounts.length > 0 && selectedAccountId)
               ? 'bg-slate-900 hover:bg-slate-800'
               : 'bg-slate-400'
            }`}
            title={
              accounts.length === 0 ? "沒有帳戶，無法匯入" :
              !selectedAccountId ? "請先選擇帳戶" :
              previewData.length === 0 ? "請先解析資料" : 
              selectedIds.size === 0 ? "請至少選擇一筆交易" :
              `匯入 ${selectedIds.size} 筆交易到 ${accounts.find(a => a.id === selectedAccountId)?.name}`
            }
          >
            確認匯入 {selectedIds.size > 0 ? `(${selectedIds.size} 筆)` : previewData.length > 0 ? `(${previewData.length} 筆)` : ''}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BatchImportModal;
