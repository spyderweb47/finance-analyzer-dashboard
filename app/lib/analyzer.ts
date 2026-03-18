import * as XLSX from 'xlsx';
import { format, isValid } from 'date-fns';

export interface Transaction {
  id: string;
  date: Date;
  narration: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  refNo?: string;
  valueDate?: Date;
}

export interface Summary {
  totalExpenses: number;
  totalIncome: number;
  netCashflow: number;
  transactionCount: number;
  expenseCount: number;
  incomeCount: number;
  avgExpense: number;
  avgIncome: number;
  startDate: Date;
  endDate: Date;
  savingsRate: number;
  highestExpense: number;
  highestExpenseDate: Date | null;
  lowestExpense: number;
  daysAnalyzed: number;
}

export interface CategoryStat {
  category: string;
  total: number;
  average: number;
  count: number;
  percentage: number;
}

export interface MerchantStat {
  merchant: string;
  total: number;
  count: number;
  average: number;
}

export interface DailySpending {
  date: string;
  amount: number;
  count: number;
  dayOfWeek: string;
}

export interface TimeAnalysis {
  byDayOfWeek: { day: string; amount: number; count: number }[];
  byWeek: { week: string; amount: number; count: number }[];
  weekendVsWeekday: { weekend: number; weekday: number };
  averageTransactionSize: number;
  medianTransactionSize: number;
  mostActiveDay: DailySpending | null;
  quietestDay: DailySpending | null;
  spendingVelocity: number; // per day
  categoryTrends: { category: string; dailyAverage: number }[];
}

export interface DetailedReport {
  executiveSummary: string[];
  spendingPatterns: string[];
  recommendations: string[];
  unusualActivity: string[];
  topInsights: string[];
}

export interface AnalysisResult {
  summary: Summary;
  categoryStats: CategoryStat[];
  merchantStats: MerchantStat[];
  transactions: Transaction[];
  dailySpending: DailySpending[];
  timeAnalysis: TimeAnalysis;
  detailedReport: DetailedReport;
  insights: string[];
}

const CATEGORIES: Record<string, string[]> = {
  'Food & Dining': ['zomato', 'swiggy', 'blinkit', 'zepto', 'restaurant', 'food', 'dining', 'pizza', 'burger', 'cafe', 'hotel', 'mess', 'tiffin', 'lunch', 'dinner', 'doolally'],
  'Groceries': ['dmart', 'supermart', 'grocery', 'kirana', 'bigbasket', 'jiomart', 'avenue supermarts', 'general store', 'provision'],
  'Transportation': ['petrol', 'diesel', 'fuel', 'uber', 'ola', 'rapido', 'auto', 'taxi', 'metro', 'bus', 'train', 'irctc', 'makemytrip', 'goibibo', 'cleartrip', 'petroleum'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'snapdeal', 'shopping', 'mall', 'retail', 'store', 'bazaar', 'mart'],
  'Entertainment': ['bookmyshow', 'movies', 'theatre', 'pvr', 'inox', 'netflix', 'prime', 'hotstar', 'disney', 'sony', 'spotify', 'youtube', 'gaming', 'riot games', 'pubg', 'playstation', 'xbox', 'bigtree'],
  'Bills & Utilities': ['electricity', 'water', 'gas', 'broadband', 'wifi', 'mobile', 'recharge', 'jio', 'airtel', 'vi', 'vodafone', 'idea', 'bill', 'utility', 'rent', 'maintenance', 'lic', 'insurance', 'emi', 'rentomojo'],
  'Health & Medical': ['hospital', 'clinic', 'pharmacy', 'medical', 'doctor', 'diagnostic', 'lab', 'medicine', 'health', 'apollo'],
  'Cash & ATM': ['cash', 'atm', 'nwd', 'withdrawal', 'wdl'],
  'Subscriptions': ['subscription', 'membership', 'nobroker', 'apple services', 'google', 'microsoft', 'adobe', 'zoho', 'notion'],
  'Fitness': ['gym', 'fitness', 'yoga', 'sports', 'cult.fit', 'fitternity'],
  'Personal Care': ['salon', 'spa', 'hair', 'beauty', 'parlour'],
  'Transfers': ['upi-', 'neft', 'rtgs', 'imps', 'transfer'],
  'Income': ['salary', 'credit', 'deposit', 'refund', 'cashback', 'interest', 'dividend'],
  'Bank Charges': ['charge', 'fee', 'markup', 'gst', 'tax', 'annual fee', 'card fee'],
};

function categorizeTransaction(narration: string): string {
  const lowerNarration = narration.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const keyword of keywords) {
      if (lowerNarration.includes(keyword)) {
        return category;
      }
    }
  }
  
  if (lowerNarration.includes('upi-') && /(mr |mrs |miss |-q|@ok)/.test(lowerNarration)) {
    return 'Person-to-Person';
  }
  
  return 'Others';
}

function extractMerchant(narration: string): string {
  const upperNarration = narration.toUpperCase();
  
  const upiMatch = upperNarration.match(/UPI-([^-]+)-/);
  if (upiMatch) {
    return upiMatch[1].trim();
  }
  
  if (upperNarration.includes('POS')) {
    const parts = upperNarration.split(/\s+/);
    if (parts.length > 3) {
      return parts.slice(3).join(' ').slice(0, 30);
    }
  }
  
  const parts = narration.split('-');
  if (parts.length > 0) {
    return parts[0].trim().slice(0, 30);
  }
  
  return 'Unknown';
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const parts = dateStr.trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    let year = parseInt(parts[2]);
    
    if (year < 50) year += 2000;
    else if (year < 100) year += 1900;
    
    const date = new Date(year, month, day);
    if (isValid(date)) return date;
  }
  
  return null;
}

function cleanAmount(amountStr: string): number {
  if (!amountStr) return 0;
  const cleaned = String(amountStr)
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .replace(/cr|dr|CR|DR/gi, '')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function detectUnusualActivity(transactions: Transaction[]): string[] {
  const unusual: string[] = [];
  const expenses = transactions.filter(t => t.type === 'expense');
  
  if (expenses.length === 0) return unusual;
  
  const amounts = expenses.map(t => t.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const threshold = avg * 3;
  
  const largeTransactions = expenses.filter(t => t.amount > threshold);
  if (largeTransactions.length > 0) {
    const top = largeTransactions[0];
    unusual.push(`Large transaction detected: Rs.${top.amount.toLocaleString()} on ${format(top.date, 'dd MMM')} (${top.narration.slice(0, 40)}...)`);
  }
  
  // Detect multiple transactions on same day
  const dayCounts = new Map<string, number>();
  expenses.forEach(t => {
    const day = format(t.date, 'yyyy-MM-dd');
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  });
  
  const busyDays = Array.from(dayCounts.entries())
    .filter(([_, count]) => count > 10)
    .sort((a, b) => b[1] - a[1]);
  
  if (busyDays.length > 0) {
    const [day, count] = busyDays[0];
    unusual.push(`High activity day: ${count} transactions on ${format(new Date(day), 'dd MMM yyyy')}`);
  }
  
  return unusual;
}

function generateRecommendations(summary: Summary, categoryStats: CategoryStat[], timeAnalysis: TimeAnalysis): string[] {
  const recommendations: string[] = [];
  
  // Savings recommendations
  if (summary.savingsRate < 0) {
    recommendations.push('Urgent: Your spending exceeds income. Review discretionary expenses immediately.');
  } else if (summary.savingsRate < 10) {
    recommendations.push('Consider reducing Food & Dining expenses to improve savings rate to 20%+');
  }
  
  // Category-specific recommendations
  const foodCategory = categoryStats.find(c => c.category === 'Food & Dining');
  if (foodCategory && foodCategory.percentage > 20) {
    recommendations.push(`Food spending is ${foodCategory.percentage.toFixed(1)}% of total. Try meal planning to reduce this.`);
  }
  
  const subscriptionCategory = categoryStats.find(c => c.category === 'Subscriptions');
  if (subscriptionCategory && subscriptionCategory.count === 1 && subscriptionCategory.total > 10000) {
    recommendations.push('Large one-time subscription payment detected. Consider if this is a necessary expense.');
  }
  
  // Weekend spending
  const weekendRatio = timeAnalysis.weekendVsWeekday.weekend / 
    (timeAnalysis.weekendVsWeekday.weekend + timeAnalysis.weekendVsWeekday.weekday);
  if (weekendRatio > 0.4) {
    recommendations.push(`${(weekendRatio * 100).toFixed(0)}% of spending happens on weekends. Consider weekend budgeting.`);
  }
  
  // Transaction frequency
  if (timeAnalysis.spendingVelocity > 5) {
    recommendations.push(`You're making ${timeAnalysis.spendingVelocity.toFixed(1)} transactions per day. Consider consolidating purchases.`);
  }
  
  return recommendations;
}

export async function analyzeStatement(file: File): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
        
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(30, rawData.length); i++) {
          const row = rawData[i] as string[];
          const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
          if (rowStr.includes('date') && (rowStr.includes('narration') || rowStr.includes('description'))) {
            headerRowIdx = i;
            break;
          }
        }
        
        if (headerRowIdx === -1) {
          reject(new Error('Could not find header row. Please ensure this is a valid HDFC statement.'));
          return;
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: rawData[headerRowIdx] as string[],
          range: headerRowIdx,
          raw: false,
          defval: ''
        });
        
        const transactions: Transaction[] = [];
        
        for (const row of jsonData) {
          const record = row as Record<string, any>;
          
          const dateKey = Object.keys(record).find(k => k.toLowerCase().includes('date') && !k.toLowerCase().includes('value'));
          const valueDateKey = Object.keys(record).find(k => k.toLowerCase().includes('value'));
          const narrationKey = Object.keys(record).find(k => k.toLowerCase().includes('narration') || k.toLowerCase().includes('description'));
          const refKey = Object.keys(record).find(k => k.toLowerCase().includes('ref') || k.toLowerCase().includes('chq'));
          const withdrawalKey = Object.keys(record).find(k => k.toLowerCase().includes('withdrawal') || k.toLowerCase().includes('debit'));
          const depositKey = Object.keys(record).find(k => k.toLowerCase().includes('deposit') || k.toLowerCase().includes('credit'));
          
          if (!dateKey || !narrationKey) continue;
          
          const dateStr = String(record[dateKey] || '');
          const narration = String(record[narrationKey] || '');
          const refNo = refKey ? String(record[refKey] || '') : undefined;
          
          if (!dateStr || !narration) continue;
          if (/opening balance|closing balance|statement summary|end of statement|^\*+$|^date$/i.test(narration)) {
            continue;
          }
          
          const date = parseDate(dateStr);
          if (!date) continue;
          
          const withdrawal = cleanAmount(String(record[withdrawalKey || ''] || '0'));
          const deposit = cleanAmount(String(record[depositKey || ''] || '0'));
          
          const amount = withdrawal > 0 ? withdrawal : deposit;
          const type: 'expense' | 'income' = withdrawal > 0 ? 'expense' : 'income';
          const category = categorizeTransaction(narration);
          
          if (amount > 0) {
            transactions.push({
              id: `${date.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
              date,
              narration,
              amount,
              type,
              category,
              refNo,
            });
          }
        }
        
        if (transactions.length === 0) {
          reject(new Error('No valid transactions found. Please check the file format.'));
          return;
        }
        
        transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const expenses = transactions.filter(t => t.type === 'expense');
        const income = transactions.filter(t => t.type === 'income');
        
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const netCashflow = totalIncome - totalExpenses;
        
        const dates = transactions.map(t => t.date);
        const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
        const daysAnalyzed = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;
        
        const expenseAmounts = expenses.map(t => t.amount);
        const highestExpense = expenseAmounts.length > 0 ? Math.max(...expenseAmounts) : 0;
        const lowestExpense = expenseAmounts.length > 0 ? Math.min(...expenseAmounts) : 0;
        const highestExpenseTx = expenses.find(t => t.amount === highestExpense);
        
        const summary: Summary = {
          totalExpenses,
          totalIncome,
          netCashflow,
          transactionCount: transactions.length,
          expenseCount: expenses.length,
          incomeCount: income.length,
          avgExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
          avgIncome: income.length > 0 ? totalIncome / income.length : 0,
          startDate,
          endDate,
          savingsRate,
          highestExpense,
          highestExpenseDate: highestExpenseTx?.date || null,
          lowestExpense,
          daysAnalyzed,
        };
        
        // Category stats
        const categoryMap = new Map<string, { total: number; count: number }>();
        for (const t of expenses) {
          const existing = categoryMap.get(t.category) || { total: 0, count: 0 };
          existing.total += t.amount;
          existing.count += 1;
          categoryMap.set(t.category, existing);
        }
        
        const categoryStats: CategoryStat[] = Array.from(categoryMap.entries())
          .map(([category, data]) => ({
            category,
            total: data.total,
            count: data.count,
            average: data.total / data.count,
            percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
          }))
          .sort((a, b) => b.total - a.total);
        
        // Merchant stats
        const merchantMap = new Map<string, { total: number; count: number }>();
        for (const t of expenses) {
          const merchant = extractMerchant(t.narration);
          const existing = merchantMap.get(merchant) || { total: 0, count: 0 };
          existing.total += t.amount;
          existing.count += 1;
          merchantMap.set(merchant, existing);
        }
        
        const merchantStats: MerchantStat[] = Array.from(merchantMap.entries())
          .map(([merchant, data]) => ({
            merchant,
            total: data.total,
            count: data.count,
            average: data.total / data.count,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 20);
        
        // Daily spending
        const dailyMap = new Map<string, { amount: number; count: number; dayOfWeek: string }>();
        for (const t of expenses) {
          const dateKey = format(t.date, 'yyyy-MM-dd');
          const existing = dailyMap.get(dateKey);
          if (existing) {
            existing.amount += t.amount;
            existing.count += 1;
          } else {
            dailyMap.set(dateKey, { 
              amount: t.amount, 
              count: 1, 
              dayOfWeek: format(t.date, 'EEEE') 
            });
          }
        }
        
        const dailySpending: DailySpending[] = Array.from(dailyMap.entries())
          .map(([date, data]) => ({
            date,
            amount: data.amount,
            count: data.count,
            dayOfWeek: data.dayOfWeek,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        // Time analysis
        const dayOfWeekMap = new Map<string, { amount: number; count: number }>();
        const weekMap = new Map<string, { amount: number; count: number }>();
        let weekendTotal = 0;
        let weekdayTotal = 0;
        
        for (const t of expenses) {
          const dayOfWeek = format(t.date, 'EEEE');
          const weekKey = format(t.date, "yyyy-'W'ww");
          const dayNum = t.date.getDay();
          
          const dowExisting = dayOfWeekMap.get(dayOfWeek) || { amount: 0, count: 0 };
          dowExisting.amount += t.amount;
          dowExisting.count += 1;
          dayOfWeekMap.set(dayOfWeek, dowExisting);
          
          const weekExisting = weekMap.get(weekKey) || { amount: 0, count: 0 };
          weekExisting.amount += t.amount;
          weekExisting.count += 1;
          weekMap.set(weekKey, weekExisting);
          
          if (dayNum === 0 || dayNum === 6) {
            weekendTotal += t.amount;
          } else {
            weekdayTotal += t.amount;
          }
        }
        
        const byDayOfWeek = Array.from(dayOfWeekMap.entries())
          .map(([day, data]) => ({ day, amount: data.amount, count: data.count }))
          .sort((a, b) => b.amount - a.amount);
        
        const byWeek = Array.from(weekMap.entries())
          .map(([week, data]) => ({ week, amount: data.amount, count: data.count }))
          .sort((a, b) => a.week.localeCompare(b.week));
        
        const categoryTrends = categoryStats.slice(0, 5).map(cat => ({
          category: cat.category,
          dailyAverage: cat.total / daysAnalyzed,
        }));
        
        const timeAnalysis: TimeAnalysis = {
          byDayOfWeek,
          byWeek,
          weekendVsWeekday: { weekend: weekendTotal, weekday: weekdayTotal },
          averageTransactionSize: expenses.length > 0 ? totalExpenses / expenses.length : 0,
          medianTransactionSize: calculateMedian(expenseAmounts),
          mostActiveDay: dailySpending.length > 0 
            ? dailySpending.reduce((max, day) => day.amount > max.amount ? day : max, dailySpending[0])
            : null,
          quietestDay: dailySpending.length > 0 
            ? dailySpending.reduce((min, day) => day.amount < min.amount ? day : min, dailySpending[0])
            : null,
          spendingVelocity: expenses.length / daysAnalyzed,
          categoryTrends,
        };
        
        // Insights
        const insights: string[] = [];
        
        if (categoryStats.length > 0) {
          const topCat = categoryStats[0];
          insights.push(`Your highest spending category is ${topCat.category} at Rs.${topCat.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (${topCat.percentage.toFixed(1)}% of total)`);
        }
        
        if (byDayOfWeek.length > 0) {
          insights.push(`You spend most on ${byDayOfWeek[0].day}s (Rs.${byDayOfWeek[0].amount.toLocaleString()})`);
        }
        
        if (savingsRate > 20) {
          insights.push(`Great savings rate of ${savingsRate.toFixed(1)}%! Keep it up.`);
        } else if (savingsRate < 0) {
          insights.push(`Warning: Spending exceeds income by Rs.${Math.abs(netCashflow).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
        } else {
          insights.push(`Savings rate is ${savingsRate.toFixed(1)}% - aim for 20%+ for healthy finances`);
        }
        
        insights.push(`Average of ${timeAnalysis.spendingVelocity.toFixed(1)} expense transactions per day`);
        
        if (merchantStats.length > 0) {
          const topMerchant = merchantStats[0];
          insights.push(`Top merchant: ${topMerchant.merchant} with Rs.${topMerchant.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })} spent across ${topMerchant.count} transactions`);
        }
        
        insights.push(`Median transaction size: Rs.${timeAnalysis.medianTransactionSize.toLocaleString()}`);
        
        const weekendPercent = (weekendTotal / (weekendTotal + weekdayTotal)) * 100;
        insights.push(`${weekendPercent.toFixed(1)}% of spending happens on weekends`);
        
        // Detailed report
        const executiveSummary = [
          `Analysis period: ${format(startDate, 'dd MMM yyyy')} to ${format(endDate, 'dd MMM yyyy')} (${daysAnalyzed} days)`,
          `Total transactions analyzed: ${transactions.length} (${expenses.length} expenses, ${income.length} income)`,
          `Net financial position: ${netCashflow >= 0 ? 'Surplus' : 'Deficit'} of Rs.${Math.abs(netCashflow).toLocaleString()}`,
          `Average daily spending: Rs.${(totalExpenses / daysAnalyzed).toLocaleString()}`,
        ];
        
        const spendingPatterns = [
          `Peak spending day: ${byDayOfWeek[0]?.day || 'N/A'} with Rs.${byDayOfWeek[0]?.amount.toLocaleString() || 0}`,
          `Most active spending date: ${timeAnalysis.mostActiveDay ? format(new Date(timeAnalysis.mostActiveDay.date), 'dd MMM') : 'N/A'} (Rs.${timeAnalysis.mostActiveDay?.amount.toLocaleString() || 0})`,
          `Transaction frequency: ${timeAnalysis.spendingVelocity.toFixed(1)} per day`,
          `Typical transaction size: Rs.${timeAnalysis.medianTransactionSize.toLocaleString()} (median)`,
        ];
        
        const unusualActivity = detectUnusualActivity(transactions);
        const recommendations = generateRecommendations(summary, categoryStats, timeAnalysis);
        
        const detailedReport: DetailedReport = {
          executiveSummary,
          spendingPatterns,
          recommendations,
          unusualActivity: unusualActivity.length > 0 ? unusualActivity : ['No unusual activity detected'],
          topInsights: insights.slice(0, 5),
        };
        
        resolve({
          summary,
          categoryStats,
          merchantStats,
          transactions,
          dailySpending,
          timeAnalysis,
          detailedReport,
          insights,
        });
        
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to analyze statement'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}
