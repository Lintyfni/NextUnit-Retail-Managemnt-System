import { AppLanguage, CurrencyCode } from "../types";

export const MMK_TO_USD_RATE = 2100; // Reference conversion rate

export function formatCurrency(amount: number, currency: CurrencyCode = "MMK", language: AppLanguage = "en"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount / MMK_TO_USD_RATE);
  }

  // MMK formatting
  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);

  if (language === "my") {
    return `${formattedNumber} ကျပ်`;
  }
  return `MMK ${formattedNumber}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ",";
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    "\n" +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? "" : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const DICTIONARY = {
  en: {
    // Navigation
    appName: "NextUnit Tech",
    hqControl: "HQ Control Panel",
    branches: "Branch & Stores",
    posBilling: "POS Billing & Sales",
    purchaseGrn: "Purchasing & GRN",
    partners: "Customers & Vendors",
    inventory: "Inventory & Transfers",
    logistics: "Warehouse & Fleet",
    warranty: "Warranty & IMEI",
    accounting: "Accounting & Vouchers",
    crm: "CRM & Loyalty",
    reports: "BI Reports & Analytics",
    supplyChain: "Supply Chain (SCM)",
    dynamicPricing: "Dynamic Pricing",
    hrm: "HRM & Workforce",
    security: "Security & Audit",
    aiSuite: "AI Intelligence Suite",

    // Common Buttons & Labels
    overview: "Overview",
    totalRevenue: "Gross Consolidated Sales",
    activeStores: "Active Stores",
    netMargin: "Gross Margin",
    lowStockAlerts: "Reorder Warnings",
    fraudRiskIndex: "Fraud Risk Index",
    fleetInTransit: "Fleet Deliveries in Transit",
    searchPlaceholder: "Search by SKU, Barcode, Name, or Serial...",
    checkout: "Complete Payment",
    holdTicket: "Hold Order",
    printReceipt: "Print Receipt",
    filter: "Filter",
    exportCsv: "Export CSV",
    add: "Create New",
    status: "Status",
    actions: "Actions",
    allBranches: "All HQ Branches",
    currentBranch: "Current Branch",
    switchBranch: "Switch Store",
    userRole: "Role",
    notifications: "Live Feed",
    copilotButton: "AI ERP Copilot",
  },
  my: {
    // Navigation
    appName: "NextUnit Tech လက်လီအရောင်းနှင့် စီမံခန့်ခွဲမှုစနစ်",
    hqControl: "HQ ပင်မထိန်းချုပ်ခန်း",
    branches: "ဆိုင်ခွဲများနှင့် စတိုးများ",
    posBilling: "POS အရောင်းနှင့် ပြန်သွင်း",
    purchaseGrn: "ဝယ်ယူမှုနှင့် ကုန်လက်ခံလွှာ",
    partners: "ဝယ်သူနှင့် ပေးသွင်းသူများ",
    inventory: "ပစ္စည်းလက်ကျန်နှင့် လွှဲပြောင်းမှု",
    logistics: "ဂိုဒေါင်နှင့် ပို့ဆောင်ရေး",
    warranty: "အာမခံနှင့် IMEI မှတ်တမ်း",
    accounting: "ငွေစာရင်းနှင့် ဘောက်ချာများ",
    crm: "ဖောက်သည်ထိန်းသိမ်းရေး & VIP",
    reports: "စီးပွားရေးအစီရင်ခံစာနှင့် BI",
    supplyChain: "ထောက်ပံ့ပို့ဆောင်ရေးကွင်းဆက်",
    dynamicPricing: "ပြောင်းလဲဈေးနှုန်းသတ်မှတ်ချက်",
    hrm: "ဝန်ထမ်းရေးရာ & ခွင့်ပြုချက်",
    security: "လုံခြုံရေး & စစ်ဆေးမှုမှတ်တမ်း",
    aiSuite: "AI အဆင့်မြင့်ဉာဏ်ရည်စနစ်",

    // Common Buttons & Labels
    overview: "ခြုံငုံသုံးသပ်ချက်",
    totalRevenue: "စုစုပေါင်းအရောင်းပမာဏ",
    activeStores: "ဖွင့်လှစ်ထားသော ဆိုင်ခွဲများ",
    netMargin: "စုစုပေါင်း အမြတ်ရာခိုင်နှုန်း",
    lowStockAlerts: "ပစ္စည်းပြတ်လပ်မှု သတိပေးချက်",
    fraudRiskIndex: "လိမ်လည်မှု အန္တရာယ်ညွှန်းကိန်း",
    fleetInTransit: "လမ်းခရီးရောက် ပို့ဆောင်မှုများ",
    searchPlaceholder: "SKU, ဘားကုတ်, ပစ္စည်းအမည် သို့မဟုတ် IMEI ဖြင့် ရှာပါ...",
    checkout: "ငွေပေးချေမှု အပြီးသတ်မည်",
    holdTicket: "အော်ဒါခေတ္တထိန်းသိမ်းမည်",
    printReceipt: "ပြေစာထုတ်မည်",
    filter: "စစ်ထုတ်မည်",
    exportCsv: "CSV ဒေါင်းလုဒ်",
    add: "အသစ်ထည့်မည်",
    status: "အခြေအနေ",
    actions: "လုပ်ဆောင်ချက်",
    allBranches: "ဆိုင်ခွဲအားလုံး",
    currentBranch: "လက်ရှိဆိုင်ခွဲ",
    switchBranch: "ဆိုင်ခွဲပြောင်းမည်",
    userRole: "ရာထူး/အခန်းကဏ္ဍ",
    notifications: "တိုက်ရိုက်လှုပ်ရှားမှု",
    copilotButton: "AI လက်ထောက်",
  },
};
