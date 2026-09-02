import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { Product, StockTransfer } from "../../types";
import { ProductFormModal } from "../inventory/ProductFormModal";
import { SerialExpiryModal } from "../inventory/SerialExpiryModal";
import { StockMatrixModal } from "../inventory/StockMatrixModal";
import {
  Package,
  ArrowLeftRight,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Plus,
  Search,
  Building,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  History,
  TrendingDown,
  BarChart2,
  Warehouse,
  Store,
  RotateCcw,
  Clock,
  Filter,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  Edit2,
  Grid,
  Palette,
  Tag,
  DollarSign,
  Barcode,
  Info,
} from "lucide-react";

export const InventoryView: React.FC = () => {
  const {
    products,
    branches,
    stockTransfers,
    createStockTransfer,
    updateStockTransferStatus,
    createStockAdjustment,
    createProduct,
    updateProduct,
    currency,
    language,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"INVENTORY" | "TRANSFERS" | "LOW_STOCK">("INVENTORY");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [transferStatusFilter, setTransferStatusFilter] = useState<string>("ALL");

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);

  // New & Edit Product Modal State
  const [showProductFormModal, setShowProductFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Serial & Expiry Modal State
  const [serialModalProduct, setSerialModalProduct] = useState<Product | null>(null);

  // Stock Matrix Modal State
  const [matrixModalProduct, setMatrixModalProduct] = useState<Product | null>(null);

  // Multi-tier Prices Preview Modal
  const [viewingPricesProduct, setViewingPricesProduct] = useState<Product | null>(null);

  // Transfer form state
  const defaultFrom = branches.find((b) => b.id.includes("WH"))?.id || branches[0]?.id || "";
  const defaultTo = branches.find((b) => !b.id.includes("WH"))?.id || branches[1]?.id || branches[0]?.id || "";
  const [fromBranchId, setFromBranchId] = useState<string>(defaultFrom);
  const [toBranchId, setToBranchId] = useState<string>(defaultTo);
  const [transferProductId, setTransferProductId] = useState<string>(products[0]?.id || "");
  const [transferQty, setTransferQty] = useState<number>(5);
  const [transferMode, setTransferMode] = useState<"DIRECT_TRANSFER" | "DISPATCH_NOW" | "REQUEST_ONLY">("DIRECT_TRANSFER");
  const [transferDriver, setTransferDriver] = useState<string>("Ko Min Thu (Fleet Lead)");
  const [transferVehicle, setTransferVehicle] = useState<string>("YGN 4K-9921 (Fleet Van)");
  const [transferNote, setTransferNote] = useState<string>("Inter-branch retail showroom replenishment");
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Stock Adjust form state
  const [adjustBranchId, setAdjustBranchId] = useState<string>(branches[0]?.id || "");
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>("Physical Cycle Count Discrepancy");

  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const lowStockProducts = products.filter((p) => {
    return Object.values(p.branchStock || {}).some((q) => Number(q) <= (p.reorderLevel || 5));
  });

  const filteredTransfers = (stockTransfers || []).filter((tf) => {
    if (transferStatusFilter === "ALL") return true;
    return tf.status === transferStatusFilter;
  });

  // Selected product available stock in source branch
  const currentSelectedProduct = products.find((p) => p.id === transferProductId) || products[0];
  const sourceAvailableStock = currentSelectedProduct?.branchStock?.[fromBranchId] || 0;
  const destCurrentStock = currentSelectedProduct?.branchStock?.[toBranchId] || 0;
  const currentProdTotal = Object.values(currentSelectedProduct?.branchStock || {}).reduce<number>((a, b) => a + Number(b), 0);

  // Flash feedback toast
  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  const handleOpenTransferModal = (prodId?: string, sourceId?: string, targetId?: string) => {
    if (prodId) setTransferProductId(prodId);
    if (sourceId) setFromBranchId(sourceId);
    if (targetId) setToBranchId(targetId);
    setShowTransferModal(true);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === transferProductId);
    const fromB = branches.find((b) => b.id === fromBranchId);
    const toB = branches.find((b) => b.id === toBranchId);

    if (!prod || !fromB || !toB || fromB.id === toB.id) {
      alert(
        language === "my"
          ? "ကျေးဇူးပြု၍ မတူညီသော မူရင်းနှင့် ဦးတည်ရာ ဆိုင်ခွဲများကို ရွေးချယ်ပါ။"
          : "Please choose distinct source and destination branches."
      );
      return;
    }

    const available = prod.branchStock?.[fromB.id] || 0;
    if (transferQty <= 0) {
      alert(language === "my" ? "လွှဲပြောင်းမည့် အရေအတွက်သည် အနည်းဆုံး ၁ ခု ဖြစ်ရပါမည်။" : "Transfer quantity must be at least 1.");
      return;
    }

    if (transferQty > available) {
      const confirmExceed = window.confirm(
        language === "my"
          ? `သတိပေးချက်: ${fromB.name} တွင် လက်ကျန် ${available} ခုသာ ရှိပြီး သင်လွှဲပြောင်းမည့် အရေအတွက်မှာ ${transferQty} ဖြစ်နေပါသည်။ ဆက်လက်ဆောင်ရွက်မည်လား?`
          : `Warning: ${fromB.name} only has ${available} units available, while you requested ${transferQty}. Do you wish to proceed?`
      );
      if (!confirmExceed) return;
    }

    let initialStatus: StockTransfer["status"] = "RECEIVED";
    if (transferMode === "DISPATCH_NOW") {
      initialStatus = "IN_TRANSIT";
    } else if (transferMode === "REQUEST_ONLY") {
      initialStatus = "PENDING";
    }

    createStockTransfer({
      fromBranchId: fromB.id,
      fromBranchName: fromB.name,
      toBranchId: toB.id,
      toBranchName: toB.name,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: transferQty,
        },
      ],
      notes: transferNote,
      status: initialStatus,
      requestedBy: currentUser.name,
      driverName: transferDriver,
      vehicleNumber: transferVehicle,
    });

    setShowTransferModal(false);
    showFeedback(
      transferMode === "DIRECT_TRANSFER"
        ? language === "my"
          ? `✅ ${prod.name} (${transferQty} ခု) ကို ${fromB.name} မှ ${toB.name} သို့ တိုက်ရိုက်လွှဲပြောင်းပြီးပါပြီ။ (${fromB.name}: -${transferQty}၊ ${toB.name}: +${transferQty}၊ စုစုပေါင်းလက်ကျန်: မပြောင်းလဲပါ)`
          : `✅ Transferred ${transferQty}x ${prod.name} from ${fromB.name} to ${toB.name}. (${fromB.name}: -${transferQty}, ${toB.name}: +${transferQty}, Total Stock: Balanced)`
        : transferMode === "DISPATCH_NOW"
        ? language === "my"
          ? `🚚 ${prod.name} (${transferQty} ခု) ကို ${fromB.name} မှ ${toB.name} သို့ စတင်ပို့ဆောင်လိုက်ပါပြီ (${fromB.name} မှ နှုတ်ယူပြီး လမ်းခရီးရောက်ရှိ)`
          : `🚚 Dispatched ${transferQty}x ${prod.name} from ${fromB.name} to ${toB.name}. Source stock deducted.`
        : language === "my"
        ? `📝 ${prod.name} လွှဲပြောင်းရန် တောင်းဆိုမှုမှတ်တမ်း တင်ပြီးပါပြီ`
        : `📝 Transfer request draft created successfully.`
    );
  };

  const handleExecuteAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;

    const b = branches.find((br) => br.id === adjustBranchId);
    const prevStock = selectedProductForAdjust.branchStock?.[adjustBranchId] || 0;
    const diff = adjustQty - prevStock;

    createStockAdjustment({
      productId: selectedProductForAdjust.id,
      productName: selectedProductForAdjust.name,
      sku: selectedProductForAdjust.sku,
      branchId: adjustBranchId,
      branchName: b ? b.name : adjustBranchId,
      previousStock: prevStock,
      adjustedStock: adjustQty,
      difference: diff,
      reason: adjustReason,
      adjustedBy: currentUser.name,
      approvedBy: `${currentUser.name} (${currentUser.role})`,
    });

    setShowAdjustModal(false);
    setSelectedProductForAdjust(null);
    showFeedback(
      language === "my"
        ? `${selectedProductForAdjust.name} (${b?.name}) လက်ကျန်ကို ${prevStock} မှ ${adjustQty} သို့ အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ (${diff > 0 ? "+" : ""}${diff})`
        : `Stock count updated for ${selectedProductForAdjust.name} at ${b?.name} (${diff > 0 ? "+" : ""}${diff} units).`
    );
  };

  // Stock calculations
  const totalSKUs = products.length;
  const totalUnits = products.reduce((acc: number, p) => {
    const sum = Object.values(p.branchStock || {}).reduce<number>((a, b) => a + Number(b), 0);
    return acc + sum;
  }, 0);

  const totalInTransitUnits = (stockTransfers || [])
    .filter((t) => t.status === "IN_TRANSIT")
    .reduce((acc, t) => acc + (t.items?.reduce((s, it) => s + it.quantity, 0) || 0), 0);

  // Warehouse units vs Retail units
  const warehouseBranch = branches.find((b) => b.id.includes("WH")) || branches[branches.length - 1];
  const warehouseUnits = products.reduce((acc: number, p) => {
    return acc + (p.branchStock?.[warehouseBranch?.id || ""] || 0);
  }, 0);
  const retailUnits = Math.max(0, totalUnits - warehouseUnits);

  const totalCostValuation = products.reduce((acc: number, p) => {
    const sum = Object.values(p.branchStock || {}).reduce<number>((a, b) => a + Number(b), 0);
    const cost: number = typeof p.costPrice === "number" ? p.costPrice : Number(p.costPrice) || 0;
    return acc + sum * cost;
  }, 0);

  const totalRetailValuation = products.reduce((acc: number, p) => {
    const sum = Object.values(p.branchStock || {}).reduce<number>((a, b) => a + Number(b), 0);
    const price: number = typeof p.sellingPrice === "number" ? p.sellingPrice : Number(p.sellingPrice) || 0;
    return acc + sum * price;
  }, 0);

  return (
    <div id="inventory-transfers-view" className="space-y-4 animate-fade-in text-slate-800">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold animate-fade-in border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{actionSuccessMessage}</span>
          <button onClick={() => setActionSuccessMessage(null)} className="ml-2 text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner / Stats Header in Clean Light Style */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900">
                {language === "my" ? "ပစ္စည်းလက်ကျန်နှင့် ဆိုင်ခွဲလွှဲပြောင်းမှု" : "Inventory & Stock Transfers"}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === "my"
                ? "ဂိုဒေါင်နှင့် ဆိုင်ခွဲပေါင်းစုံ လက်ကျန်စာရင်း • Dispatch & Receive စာရင်းချိန်ညှိမှု • သတိပေးအဆင့်များ"
                : "Multi-branch & warehouse balances • Real-time dispatch & receive tracking • Cycle counts"}
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("INVENTORY")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "INVENTORY" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === "my" ? "ကုန်ပစ္စည်းလက်ကျန်များ" : "Stock Inventory"}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                {totalSKUs}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("TRANSFERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "TRANSFERS" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{language === "my" ? "လွှဲပြောင်းမှုများ" : "Transfers"}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                {stockTransfers?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("LOW_STOCK")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "LOW_STOCK" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === "my" ? "လက်ကျန်နည်း" : "Low Stock"}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono font-bold">
                {lowStockProducts.length}
              </span>
            </button>
          </div>

          {/* New Product (Inventory Creation) Button */}
          <button
            id="create-product-btn"
            onClick={() => {
              setEditingProduct(null);
              setShowProductFormModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{language === "my" ? "+ ပစ္စည်းအသစ် ထည့်မည်" : "+ New Product"}</span>
          </button>

          <button
            id="create-transfer-btn"
            onClick={() => handleOpenTransferModal()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{language === "my" ? "ပစ္စည်းလွှဲပြောင်းမည်" : "New Transfer"}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{language === "my" ? "စုစုပေါင်း လက်ကျန်အရေအတွက်" : "Total Physical Stock"}</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-black text-slate-900 font-mono">{totalUnits.toLocaleString()}</span>
            {totalInTransitUnits > 0 && (
              <span className="text-xs font-bold text-blue-600 font-mono flex items-center gap-0.5">
                <Truck className="w-3 h-3" />
                <span>+{totalInTransitUnits} in transit</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {totalSKUs} SKUs Across {branches.length} Locations
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{language === "my" ? "ဗဟိုဂိုဒေါင် လက်ကျန်" : "Warehouse vs Retail"}</span>
            <Warehouse className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-700 mt-1 font-mono">{warehouseUnits.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            WH: {warehouseUnits} • Stores: {retailUnits} units
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{language === "my" ? "ကုန်ပစ္စည်းတန်ဖိုး (Cost)" : "Inventory Valuation (Cost)"}</span>
            <BarChart2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1 font-mono">
            {formatCurrency(totalCostValuation, currency, language)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Retail: {formatCurrency(totalRetailValuation, currency, language)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{language === "my" ? "သတိပေးအဆင့် ပစ္စည်းများ" : "Low Stock Alerts"}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 mt-1 font-mono">{lowStockProducts.length}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
            {language === "my" ? "ဖြည့်တင်းရန် လိုအပ်သည်" : "Needs Reorder / Transfer"}
          </div>
        </div>
      </div>

      {/* Tab 1: Stock Inventory Table */}
      {activeTab === "INVENTORY" && (
        <div className="space-y-3">
          {/* Search and Category Filter Bar */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-col sm:flex-row gap-2.5 items-center justify-between shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={
                  language === "my"
                    ? "SKU, ဘားကုဒ်, ပစ္စည်းအမည် သို့မဟုတ် အမျိုးအစားဖြင့် ရှာပါ..."
                    : "Search inventory by SKU, Barcode, product name, or category..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                  }`}
                >
                  {cat === "ALL" ? (language === "my" ? "အားလုံး" : "All Categories") : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">{language === "my" ? "ကုန်ပစ္စည်း / Code / Barcode" : "Product / SKU / Barcode"}</th>
                    <th className="px-4 py-3.5">{language === "my" ? "အမျိုးအစား & UOM" : "Category & UOM"}</th>
                    {branches.map((b) => {
                      const isWarehouse = b.id.includes("WH") || b.name.toLowerCase().includes("warehouse");
                      return (
                        <th key={b.id} className="px-4 py-3.5 text-center font-bold">
                          <div className="flex flex-col items-center">
                            <span className="flex items-center gap-1 text-slate-900">
                              {isWarehouse && <Warehouse className="w-3 h-3 text-blue-600" />}
                              {!isWarehouse && <Store className="w-3 h-3 text-emerald-600" />}
                              {b.code || b.name.split(" ")[0]}
                            </span>
                            <span className="text-[9px] font-normal text-slate-400 capitalize">
                              {isWarehouse ? "Warehouse" : b.city}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-4 py-3.5 text-center font-bold">{language === "my" ? "စုစုပေါင်း လက်ကျန်" : "Total Stock"}</th>
                    <th className="px-4 py-3.5">{language === "my" ? "ရောင်းဈေး (Base Prices)" : "Base Selling Prices"}</th>
                    <th className="px-4 py-3.5">{language === "my" ? "ဝယ်ဈေး" : "Cost Price"}</th>
                    <th className="px-4 py-3.5 text-right">{language === "my" ? "စီမံမှု & ခွဲကပ်ခြင်း" : "Actions & Allocation"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProducts.map((p) => {
                    const totalStock = Object.values(p.branchStock || {}).reduce((a: number, b: number) => a + Number(b), 0);
                    const isLow = Object.values(p.branchStock || {}).some((q) => Number(q) <= (p.reorderLevel || 5));
                    const uomText = p.uom || "Pcs";
                    const hasMatrix = p.stockMatrix?.enabled && (p.stockMatrix?.colors?.length || 0) > 0;
                    const serialCount = p.serials?.length || 0;
                    const priceTiersCount = p.basePrices?.length || 1;

                    // In-transit items for this product across fleet transfers
                    const inTransitQty = (stockTransfers || [])
                      .filter((t) => t.status === "IN_TRANSIT")
                      .reduce((sum, t) => {
                        const it = t.items.find((i) => i.productId === p.id);
                        return sum + (it ? it.quantity : 0);
                      }, 0);

                    return (
                      <tr key={p.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {p.nameMy && p.nameMy !== p.name && (
                                  <span className="text-[11px] font-normal text-slate-500">({p.nameMy})</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="font-bold text-slate-700">{p.sku}</span>
                                {p.barcode && (
                                  <span className="text-slate-400 flex items-center gap-0.5">
                                    <Barcode className="w-3 h-3" />
                                    <span>{p.barcode}</span>
                                  </span>
                                )}
                                {p.hasIMEI && (
                                  <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[9px] font-bold rounded border border-blue-200 flex items-center gap-0.5">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    <span>Serial / Expired</span>
                                  </span>
                                )}
                                {hasMatrix && (
                                  <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 text-[9px] font-bold rounded border border-purple-200 flex items-center gap-0.5">
                                    <Grid className="w-2.5 h-2.5" />
                                    <span>Stock Matrix</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-700 font-medium">{p.category}</div>
                          <div className="mt-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                              UOM: {uomText}
                            </span>
                          </div>
                        </td>
                        {branches.map((b) => {
                          const stock = p.branchStock?.[b.id] || 0;
                          const isBranchLow = stock <= (p.reorderLevel || 5);
                          const isWarehouse = b.id.includes("WH") || b.name.toLowerCase().includes("warehouse");

                          // In-transit inbound to this specific branch
                          const inboundToBranch = (stockTransfers || [])
                            .filter((t) => t.status === "IN_TRANSIT" && t.toBranchId === b.id)
                            .reduce((sum, t) => {
                              const it = t.items.find((i) => i.productId === p.id);
                              return sum + (it ? it.quantity : 0);
                            }, 0);

                          return (
                            <td key={b.id} className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`font-mono px-2 py-0.5 rounded-lg text-xs font-bold ${
                                    isBranchLow
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : isWarehouse
                                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                                      : "bg-slate-100 text-slate-800"
                                  }`}
                                >
                                  {stock} <span className="text-[9px] font-normal text-slate-500">{uomText}</span>
                                </span>
                                {inboundToBranch > 0 && (
                                  <span
                                    className="text-[9px] font-semibold text-blue-600 font-mono flex items-center gap-0.5 mt-0.5"
                                    title={`In-transit fleet arriving: +${inboundToBranch} units`}
                                  >
                                    <Truck className="w-2.5 h-2.5" />
                                    <span>+{inboundToBranch} on way</span>
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                          <div className="flex flex-col items-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-md font-bold ${
                                isLow ? "bg-amber-100 text-amber-900" : "bg-emerald-50 text-emerald-800"
                              }`}
                            >
                              {totalStock} {uomText}
                            </span>
                            {inTransitQty > 0 && (
                              <span
                                className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-1 border border-blue-200"
                                title={`Total physical in warehouses (${totalStock}) + in-transit fleet (${inTransitQty}) = ${totalStock + inTransitQty}`}
                              >
                                +{inTransitQty} In Transit
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-emerald-800">
                            {formatCurrency(p.sellingPrice, currency, language)}
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewingPricesProduct(p)}
                            className="mt-0.5 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-[10px] font-semibold transition-colors"
                            title="View all 5 base selling price tiers"
                          >
                            <DollarSign className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{priceTiersCount} Base Tiers</span>
                          </button>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {formatCurrency(p.costPrice, currency, language)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* Edit Product */}
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setShowProductFormModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                              title={language === "my" ? "ကုန်ပစ္စည်း အချက်အလက် ပြင်ဆင်ရန်" : "Edit Product Details"}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Serial & Expired Allocator Button */}
                            <button
                              onClick={() => setSerialModalProduct(p)}
                              className={`p-1.5 rounded-lg border transition-colors relative ${
                                serialCount > 0
                                  ? "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                              }`}
                              title={
                                language === "my"
                                  ? `Serial & Expired Code ခွဲကပ်ရန် (${serialCount} ခု ရှိသည်)`
                                  : `Allocate Serials & Expiry Codes (${serialCount} assigned)`
                              }
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {serialCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center font-mono">
                                  {serialCount}
                                </span>
                              )}
                            </button>

                            {/* Stock Matrix Allocator Button */}
                            <button
                              onClick={() => setMatrixModalProduct(p)}
                              className={`p-1.5 rounded-lg border transition-colors relative ${
                                hasMatrix
                                  ? "bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100"
                                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                              }`}
                              title={
                                language === "my"
                                  ? "Stock Matrix (Color / Size) ခွဲကပ်ရန်"
                                  : "Allocate Stock Matrix (Color x Size)"
                              }
                            >
                              <Grid className="w-3.5 h-3.5" />
                            </button>

                            {/* Transfer Button */}
                            <button
                              onClick={() => {
                                handleOpenTransferModal(p.id, defaultFrom, defaultTo);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg transition-colors"
                              title={language === "my" ? "ပစ္စည်းလွှဲပြောင်းရန်" : "Transfer Product"}
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Adjust Button */}
                            <button
                              onClick={() => {
                                setSelectedProductForAdjust(p);
                                const bId = branches[0]?.id || "";
                                setAdjustBranchId(bId);
                                setAdjustQty(p.branchStock?.[bId] || 0);
                                setShowAdjustModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg transition-colors"
                              title={language === "my" ? "လက်ကျန်စစ်ဆေးချိန်ညှိရန်" : "Cycle Count Adjust"}
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Stock Transfers Workflow */}
      {activeTab === "TRANSFERS" && (
        <div className="space-y-4">
          {/* Status Filter Pills */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-wrap gap-2 items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{language === "my" ? "အခြေအနေဖြင့် စစ်ထုတ်ရန်:" : "Filter Status:"}</span>
              {["ALL", "PENDING", "IN_TRANSIT", "RECEIVED", "CANCELLED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setTransferStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                    transferStatusFilter === st
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleOpenTransferModal()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === "my" ? "လွှဲပြောင်းမှုအသစ် ပြုလုပ်ရန်" : "Create Transfer"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(!filteredTransfers || filteredTransfers.length === 0) && (
              <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <ArrowLeftRight className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-bold text-sm text-slate-700">
                  {language === "my" ? "ပစ္စည်းလွှဲပြောင်းမှုမှတ်တမ်း မရှိသေးပါ" : "No Inter-Branch Transfers Found"}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "my"
                    ? "ဆိုင်ခွဲအချင်းချင်း သို့မဟုတ် ဂိုဒေါင်မှ ဆိုင်ခွဲများသို့ ကုန်ပစ္စည်းလွှဲပြောင်းရန် အထက်ပါ ခလုတ်ကို နှိပ်ပါ"
                    : "Initiate stock movement from warehouse to branches or between retail stores."}
                </p>
              </div>
            )}

            {filteredTransfers?.map((tf) => (
              <div key={tf.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="font-mono font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{tf.transferNumber}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {tf.dispatchedAt ? formatDate(tf.dispatchedAt) : "Draft/Pending"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-700 mt-1 font-semibold">
                      <span className="flex items-center gap-1 text-slate-900">
                        {tf.fromBranchId.includes("WH") ? <Warehouse className="w-3.5 h-3.5 text-blue-600" /> : <Store className="w-3.5 h-3.5 text-emerald-600" />}
                        {tf.fromBranchName}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="flex items-center gap-1 text-slate-900">
                        {tf.toBranchId.includes("WH") ? <Warehouse className="w-3.5 h-3.5 text-blue-600" /> : <Store className="w-3.5 h-3.5 text-emerald-600" />}
                        {tf.toBranchName}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      tf.status === "RECEIVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : tf.status === "IN_TRANSIT"
                        ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                        : tf.status === "CANCELLED"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {tf.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-700 flex items-center justify-between">
                    <span>{language === "my" ? "လွှဲပြောင်းသည့် ပစ္စည်းများ:" : "Manifest Items:"}</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      Total Qty: {tf.items?.reduce((a, b) => a + b.quantity, 0)} units
                    </span>
                  </div>
                  {tf.items?.map((it, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-[11px]"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{it.productName}</div>
                        {it.sku && <div className="text-[10px] font-mono text-slate-400">{it.sku}</div>}
                      </div>
                      <span className="font-mono font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        Qty: {it.quantity}
                      </span>
                    </div>
                  ))}
                  {tf.driverName && (
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Fleet: <strong>{tf.driverName}</strong> ({tf.vehicleNumber || "Fleet Van"})
                      </span>
                    </div>
                  )}
                  {tf.notes && <p className="text-[11px] text-slate-500 italic pt-0.5">&ldquo;{tf.notes}&rdquo;</p>}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2 text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    By: {tf.requestedBy || "Admin"}
                    {tf.receivedAt && ` • Received: ${formatDate(tf.receivedAt)}`}
                  </span>
                  <div className="flex space-x-1.5">
                    {(tf.status === "PENDING" || tf.status === "REQUESTED") && (
                      <>
                        <button
                          onClick={() => {
                            updateStockTransferStatus(tf.id, "RECEIVED");
                            showFeedback(
                              language === "my"
                                ? `Transfer ${tf.transferNumber} ကို တိုက်ရိုက်လွှဲပြောင်းပြီးပါပြီ (${tf.fromBranchName}: နှုတ်ယူ၊ ${tf.toBranchName}: ပေါင်းထည့်၊ လက်ကျန် ညီမျှဆဲ)`
                                : `Direct completed ${tf.transferNumber}: Deducted from ${tf.fromBranchName} and added to ${tf.toBranchName}. Balanced.`
                            );
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1 shadow-xs"
                          title="Directly transfer and restock immediately"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Direct Complete</span>
                        </button>
                        <button
                          onClick={() => {
                            updateStockTransferStatus(tf.id, "IN_TRANSIT");
                            showFeedback(
                              language === "my"
                                ? `Transfer ${tf.transferNumber} ကို ပို့ဆောင်လိုက်ပါပြီ (${tf.fromBranchName} မှ စာရင်းနှုတ်ယူထားပါသည်)`
                                : `Dispatched ${tf.transferNumber}. Stock deducted from ${tf.fromBranchName}.`
                            );
                          }}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1 shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </button>
                        <button
                          onClick={() => {
                            updateStockTransferStatus(tf.id, "CANCELLED");
                            showFeedback(language === "my" ? `Transfer ${tf.transferNumber} ကို ပယ်ဖျက်လိုက်ပါပြီ` : `Transfer cancelled.`);
                          }}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl font-semibold text-xs border border-slate-200"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {tf.status === "IN_TRANSIT" && (
                      <>
                        <button
                          onClick={() => {
                            updateStockTransferStatus(tf.id, "RECEIVED");
                            showFeedback(
                              language === "my"
                                ? `Transfer ${tf.transferNumber} ကို လက်ခံပြီးပါပြီ (${tf.toBranchName} သို့ စာရင်းထည့်သွင်းထားပါသည်)`
                                : `Received & restocked ${tf.transferNumber} at ${tf.toBranchName}.`
                            );
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Receive & Restock</span>
                        </button>
                        <button
                          onClick={() => {
                            updateStockTransferStatus(tf.id, "CANCELLED");
                            showFeedback(
                              language === "my"
                                ? `Transfer ${tf.transferNumber} ကို ပယ်ဖျက်ပြီး ${tf.fromBranchName} သို့ ကုန်ပစ္စည်းများ ပြန်လည်သွင်းပေးလိုက်ပါပြီ`
                                : `Cancelled and returned items to ${tf.fromBranchName}.`
                            );
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-xl font-semibold text-xs border border-slate-200"
                          title="Cancel and return items back to source branch"
                        >
                          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                          <span>Return</span>
                        </button>
                      </>
                    )}
                    {tf.status === "RECEIVED" && (
                      <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>Completed & Stocked</span>
                      </span>
                    )}
                    {tf.status === "CANCELLED" && (
                      <span className="text-slate-500 font-medium text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                        Transfer Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Low Stock Alerts */}
      {activeTab === "LOW_STOCK" && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">
                  {language === "my" ? "သတိပေးအဆင့် ရောက်ရှိနေသော ကုန်ပစ္စည်းများ" : "Low Stock Alert Items"}
                </h4>
                <p className="text-amber-800">
                  {language === "my"
                    ? "ဆိုင်ခွဲများတွင် သတ်မှတ်ထားသော အနည်းဆုံးလက်ကျန်အောက် လျော့နည်းနေသော ပစ္စည်းများဖြစ်ပြီး ဗဟိုဂိုဒေါင်မှ အမြန်လွှဲပြောင်းနိုင်ပါသည်"
                    : "Products currently below safety reorder threshold in retail stores. One-click transfer from Central Warehouse available."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowStockProducts.map((p) => {
              const totalStock = Object.values(p.branchStock || {}).reduce((a: number, b: number) => a + Number(b), 0);
              const whStock = p.branchStock?.[warehouseBranch?.id || ""] || 0;

              return (
                <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0" />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{p.sku} • {p.category}</div>
                        <div className="text-xs font-semibold text-amber-700 mt-1">
                          Safety Buffer: &le;{p.reorderLevel || 5} units
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        {totalStock} in Total
                      </div>
                      <div className="text-[10px] text-blue-700 font-semibold mt-1">
                        WH Stock: {whStock} units
                      </div>
                    </div>
                  </div>

                  {/* Branch Breakdown */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 grid grid-cols-4 gap-2 text-center text-xs">
                    {branches.map((b) => {
                      const st = p.branchStock?.[b.id] || 0;
                      const isLow = st <= (p.reorderLevel || 5);
                      return (
                        <div key={b.id}>
                          <div className="text-[10px] text-slate-500 truncate">{b.code || b.name.split(" ")[0]}</div>
                          <div className={`font-mono font-bold ${isLow ? "text-amber-700" : "text-slate-800"}`}>
                            {st}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        handleOpenTransferModal(p.id, warehouseBranch?.id || defaultFrom, defaultTo);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>{language === "my" ? "ဗဟိုဂိုဒေါင်မှ ဆိုင်ခွဲသို့ လွှဲပြောင်းမည်" : "Replenish from Warehouse"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inter-Branch Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {language === "my" ? "ဆိုင်ခွဲအချင်းချင်း ပစ္စည်းလွှဲပြောင်းရန်" : "Initiate Inter-Branch Stock Transfer"}
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "မူရင်းဆိုင်ခွဲ / ဂိုဒေါင် (From)" : "Source Location (From)"}
                  </label>
                  <select
                    value={fromBranchId}
                    onChange={(e) => setFromBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "လက်ခံမည့်ဆိုင်ခွဲ (To)" : "Destination (To)"}
                  </label>
                  <select
                    value={toBranchId}
                    onChange={(e) => setToBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {language === "my" ? "ကုန်ပစ္စည်းရွေးချယ်ရန်" : "Select Product"}
                </label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                >
                  {products.map((p) => {
                    const fromStock = p.branchStock?.[fromBranchId] || 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Available: {fromStock}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Real-time Balance & Calculation Preview */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5 text-xs">
                <div className="font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === "my" ? "📊 စာရင်းတွက်ချက်မှု တိုက်ဆိုင်စစ်ဆေးချက်:" : "📊 Stock Movement Preview:"}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    transferMode === "DIRECT_TRANSFER"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : transferMode === "DISPATCH_NOW"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}>
                    {transferMode === "DIRECT_TRANSFER"
                      ? language === "my" ? "⚡ တိုက်ရိုက်လွှဲပြောင်းမှု" : "⚡ Direct Complete"
                      : transferMode === "DISPATCH_NOW"
                      ? language === "my" ? "🚚 လမ်းခရီးပို့ဆောင်မှု" : "🚚 In-Transit Dispatch"
                      : language === "my" ? "📝 အကြမ်းတောင်းဆိုမှု" : "📝 Draft Request"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  {/* Source Branch Preview */}
                  <div className="border-r border-slate-100 pr-1.5 text-left sm:text-center">
                    <span className="text-slate-500 block text-[10px] font-semibold truncate">
                      {branches.find(b => b.id === fromBranchId)?.name.split(" ")[0]} (From)
                    </span>
                    {transferMode === "REQUEST_ONLY" ? (
                      <div>
                        <span className="font-mono text-slate-800 text-xs font-bold">{sourceAvailableStock}</span>
                        <div className="text-[9px] text-slate-400 font-semibold">{language === "my" ? "(မလျော့သေးပါ)" : "(Untouched)"}</div>
                      </div>
                    ) : (
                      <div>
                        <span className="font-mono text-slate-900 text-xs font-bold">
                          {sourceAvailableStock} &rarr; <span className="text-rose-600 font-black">{Math.max(0, sourceAvailableStock - transferQty)}</span>
                        </span>
                        <div className="text-[9px] text-rose-600 font-mono font-bold">(-{transferQty} units)</div>
                      </div>
                    )}
                  </div>

                  {/* Destination Branch Preview */}
                  <div className="border-r border-slate-100 px-1.5 text-left sm:text-center">
                    <span className="text-slate-500 block text-[10px] font-semibold truncate">
                      {branches.find(b => b.id === toBranchId)?.name.split(" ")[0]} (To)
                    </span>
                    {transferMode === "DIRECT_TRANSFER" ? (
                      <div>
                        <span className="font-mono text-slate-900 text-xs font-bold">
                          {destCurrentStock} &rarr; <span className="text-emerald-600 font-black">{destCurrentStock + transferQty}</span>
                        </span>
                        <div className="text-[9px] text-emerald-600 font-mono font-bold">(+{transferQty} units)</div>
                      </div>
                    ) : transferMode === "DISPATCH_NOW" ? (
                      <div>
                        <span className="font-mono text-slate-800 text-xs font-bold">{destCurrentStock}</span>
                        <div className="text-[9px] text-blue-600 font-semibold font-mono">
                          {language === "my" ? "(Receive နှိပ်မှ +" + transferQty + ")" : "(+" + transferQty + " on Receive)"}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="font-mono text-slate-800 text-xs font-bold">{destCurrentStock}</span>
                        <div className="text-[9px] text-slate-400 font-semibold">{language === "my" ? "(မတိုးသေးပါ)" : "(Untouched)"}</div>
                      </div>
                    )}
                  </div>

                  {/* Total Company Stock Preview */}
                  <div className="pl-1.5 text-left sm:text-center">
                    <span className="text-slate-500 block text-[10px] font-semibold">Total Stock</span>
                    <span className="font-mono text-blue-800 text-xs font-black">{currentProdTotal} units</span>
                    <div className="text-[9px] text-emerald-600 font-bold">
                      {transferMode === "DIRECT_TRANSFER"
                        ? language === "my" ? "ညီမျှဆဲ (Net 0)" : "Balanced (Net 0)"
                        : transferMode === "DISPATCH_NOW"
                        ? language === "my" ? `ဂိုဒေါင် ${currentProdTotal - transferQty} + ကားပေါ် ${transferQty}` : `Wh ${currentProdTotal - transferQty} + Fleet ${transferQty}`
                        : language === "my" ? "မပြောင်းလဲသေးပါ" : "No Change"}
                    </div>
                  </div>
                </div>

                {/* Workflow Explanation Banner */}
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  {transferMode === "DIRECT_TRANSFER" ? (
                    <p>
                      ⚡ <strong>{language === "my" ? "တိုက်ရိုက်လွှဲပြောင်းမှု:" : "Direct Complete:"}</strong>{" "}
                      {language === "my"
                        ? `မူရင်း (${branches.find(b => b.id === fromBranchId)?.name}) မှ ${transferQty} ခု ချက်ချင်းနှုတ်ယူပြီး လက်ခံမည့် (${branches.find(b => b.id === toBranchId)?.name}) တွင် ${transferQty} ခု ချက်ချင်းပေါင်းထည့်ပါမည်။ စုစုပေါင်းလက်ကျန် တူညီဆဲဖြစ်ပါသည်။`
                        : `Instantly deducts ${transferQty} from source and adds ${transferQty} to destination. Total inventory stays perfectly balanced.`}
                    </p>
                  ) : transferMode === "DISPATCH_NOW" ? (
                    <p>
                      🚚 <strong>{language === "my" ? "လမ်းခရီးပို့ဆောင်မှု:" : "In-Transit Dispatch:"}</strong>{" "}
                      {language === "my"
                        ? `မူရင်း (${branches.find(b => b.id === fromBranchId)?.name}) မှ ${transferQty} ခု ချက်ချင်းနှုတ်ယူပါမည်။ လက်ခံမည့် (${branches.find(b => b.id === toBranchId)?.name}) တွင် ချက်ချင်းမတိုးသေးဘဲ ပစ္စည်းရောက်ရှိချိန် "Receive & Restock" နှိပ်မှသာ ပေါင်းထည့်ပါမည်။`
                        : `Deducts ${transferQty} from source immediately. Destination will NOT increase until destination manager clicks "Receive & Restock".`}
                    </p>
                  ) : (
                    <p>
                      📝 <strong>{language === "my" ? "အကြမ်းတောင်းဆိုမှု:" : "Draft Request:"}</strong>{" "}
                      {language === "my"
                        ? `စာရင်းတောင်းဆိုမှုအဆင့် ဖြစ်သဖြင့် မည်သည့်ဌာနမှ လက်ကျန် မလျော့/မတိုးသေးပါ။ မူရင်းဌာနမှ "Dispatch" နှိပ်မှသာ မူရင်းမှ စာရင်းနှုတ်ယူပြီး လမ်းခရီးစတင်ပါမည်။`
                        : `Requisition draft only. No stock is deducted from source or added to destination until "Dispatch" is clicked.`}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "လွှဲပြောင်းမည့် အရေအတွက်" : "Transfer Quantity"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={transferQty}
                    onChange={(e) => setTransferQty(Math.max(1, Number(e.target.value)))}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "လုပ်ဆောင်ချက်ပုံစံ" : "Transfer Mode"}
                  </label>
                  <select
                    value={transferMode}
                    onChange={(e) => setTransferMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="DIRECT_TRANSFER">
                      {language === "my" ? "⚡ တိုက်ရိုက်လွှဲပြောင်းမည် (Direct Complete)" : "⚡ Direct Transfer & Restock (Instant)"}
                    </option>
                    <option value="DISPATCH_NOW">
                      {language === "my" ? "🚚 ယာဉ်ဖြင့်ပို့ဆောင်မည် (In-Transit Dispatch)" : "🚚 Dispatch Fleet (In-Transit)"}
                    </option>
                    <option value="REQUEST_ONLY">
                      {language === "my" ? "📝 တောင်းဆိုမှုတင်မည် (Draft Request)" : "📝 Save Draft Request (Pending)"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "ယာဉ်မောင်း / တာဝန်ခံ" : "Driver / Courier"}
                  </label>
                  <input
                    type="text"
                    value={transferDriver}
                    onChange={(e) => setTransferDriver(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "ယာဉ်အမှတ်" : "Vehicle Plate #"}
                  </label>
                  <input
                    type="text"
                    value={transferVehicle}
                    onChange={(e) => setTransferVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {language === "my" ? "မှတ်ချက် / အကြောင်းပြချက်" : "Manifest Reason / Notes"}
                </label>
                <textarea
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  {language === "my" ? "မလုပ်တော့ပါ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                >
                  {transferMode === "DIRECT_TRANSFER" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {language === "my" ? "တိုက်ရိုက်လွှဲပြောင်းမှုကို အတည်ပြုမည်" : "Execute Direct Transfer & Restock"}
                      </span>
                    </>
                  ) : transferMode === "DISPATCH_NOW" ? (
                    <>
                      <Truck className="w-4 h-4" />
                      <span>
                        {language === "my" ? "ကုန်ပစ္စည်းပို့ဆောင်မည် (Dispatch)" : "Dispatch Stock Now"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {language === "my" ? "တောင်းဆိုမှု တင်မည် (Save Request)" : "Save Transfer Request"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal (Cycle Counts) */}
      {showAdjustModal && selectedProductForAdjust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {language === "my" ? "ပစ္စည်းလက်ကျန် စစ်ဆေးချိန်ညှိခြင်း" : "Physical Cycle Count Adjustment"}
                </h3>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjust} className="space-y-3.5 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <span className="text-emerald-800 font-semibold">{language === "my" ? "ရွေးချယ်ထားသော ပစ္စည်း:" : "Selected Product:"}</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedProductForAdjust.name}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedProductForAdjust.sku}</p>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {language === "my" ? "ချိန်ညှိမည့် ဆိုင်ခွဲ / ဂိုဒေါင်" : "Target Branch / Warehouse"}
                </label>
                <select
                  value={adjustBranchId}
                  onChange={(e) => {
                    setAdjustBranchId(e.target.value);
                    setAdjustQty(selectedProductForAdjust.branchStock?.[e.target.value] || 0);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Current Count: {selectedProductForAdjust.branchStock?.[b.id] || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {language === "my" ? "စစ်ဆေးတွေ့ရှိသော လက်ကျန်အရေအတွက် အသစ်" : "New Physical Count"}
                </label>
                <input
                  type="number"
                  min={0}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(0, Number(e.target.value)))}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                  <span>Previous Count: {selectedProductForAdjust.branchStock?.[adjustBranchId] || 0}</span>
                  <span className={`font-bold ${adjustQty - (selectedProductForAdjust.branchStock?.[adjustBranchId] || 0) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    Variance: {adjustQty - (selectedProductForAdjust.branchStock?.[adjustBranchId] || 0) > 0 ? "+" : ""}
                    {adjustQty - (selectedProductForAdjust.branchStock?.[adjustBranchId] || 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {language === "my" ? "ချိန်ညှိရသည့် အကြောင်းပြချက်" : "Adjustment Audit Reason"}
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                >
                  <option value="Physical Cycle Count Discrepancy">Physical Cycle Count Discrepancy</option>
                  <option value="Damaged / In-Store Breakage">Damaged / In-Store Breakage</option>
                  <option value="Showroom Display Demo Write-off">Showroom Display Demo Write-off</option>
                  <option value="Supplier Return Replacement">Supplier Return Replacement</option>
                  <option value="Shrinkage / Inventory Audit Loss">Shrinkage / Inventory Audit Loss</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  {language === "my" ? "မလုပ်တော့ပါ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs"
                >
                  {language === "my" ? "စာရင်းပြင်ဆင်မှုကို အတည်ပြုမည်" : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Product Form Modal (Create New Inventory & Edit Product) */}
      <ProductFormModal
        isOpen={showProductFormModal}
        onClose={() => {
          setShowProductFormModal(false);
          setEditingProduct(null);
        }}
        onSave={(prodData) => {
          if (editingProduct) {
            updateProduct({
              ...prodData,
              id: editingProduct.id,
            });
            showFeedback(
              language === "my"
                ? `${prodData.name} ပစ္စည်းအချက်အလက်များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`
                : `Product "${prodData.name}" updated successfully.`
            );
          } else {
            createProduct(prodData);
            showFeedback(
              language === "my"
                ? `ကုန်ပစ္စည်းအသစ် "${prodData.name}" ကို အောင်မြင်စွာ ထည့်သွင်းဆောက်လုပ်ပြီးပါပြီ။`
                : `New product "${prodData.name}" created successfully.`
            );
          }
        }}
        initialProduct={editingProduct || undefined}
        branches={branches}
        currency={currency}
        language={language}
      />

      {/* 2. Serial & Expired Allocation Modal */}
      {serialModalProduct && (
        <SerialExpiryModal
          isOpen={!!serialModalProduct}
          onClose={() => setSerialModalProduct(null)}
          product={serialModalProduct}
          branches={branches}
          onUpdateProduct={(updatedProd) => {
            updateProduct(updatedProd);
            showFeedback(
              language === "my"
                ? `${updatedProd.name} အတွက် Serial & Expired Code များကို လက်ကျန်နှင့် အောင်မြင်စွာ ခွဲကပ်ပြီးပါပြီ။`
                : `Serials & Expiry codes updated and allocated for "${updatedProd.name}".`
            );
          }}
          language={language}
        />
      )}

      {/* 3. Stock Matrix (Color / Size) Allocation Modal */}
      {matrixModalProduct && (
        <StockMatrixModal
          isOpen={!!matrixModalProduct}
          onClose={() => setMatrixModalProduct(null)}
          product={matrixModalProduct}
          branches={branches}
          onUpdateProduct={(updatedProd) => {
            updateProduct(updatedProd);
            showFeedback(
              language === "my"
                ? `${updatedProd.name} အတွက် Color & Size Stock Matrix လက်ကျန်များကို အောင်မြင်စွာ ခွဲကပ်ပြီးပါပြီ။`
                : `Stock matrix variants updated and synced for "${updatedProd.name}".`
            );
          }}
          language={language}
        />
      )}

      {/* 4. Multi-tier Base Prices Inspection Modal */}
      {viewingPricesProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{viewingPricesProduct.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    SKU: {viewingPricesProduct.sku} • UOM: {viewingPricesProduct.uom || "Pcs"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingPricesProduct(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  {language === "my" ? "သတ်မှတ်ထားသော Base Selling Price ၅ မျိုး" : "5 Base Selling Price Tiers"}
                </span>
                <span className="text-[11px] text-slate-500">
                  Cost: <span className="font-mono font-bold text-slate-700">{formatCurrency(viewingPricesProduct.costPrice, currency, language)}</span>
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {(viewingPricesProduct.basePrices && viewingPricesProduct.basePrices.length > 0
                  ? viewingPricesProduct.basePrices
                  : [
                      { id: "1", name: "Standard Retail", nameMy: "လက်လီဈေး (Retail)", price: viewingPricesProduct.sellingPrice, minQty: 1 },
                    ]
                ).map((tier, idx) => {
                  const margin =
                    viewingPricesProduct.costPrice > 0
                      ? Math.round(((tier.price - viewingPricesProduct.costPrice) / viewingPricesProduct.costPrice) * 100)
                      : 0;

                  return (
                    <div key={tier.id || idx} className="p-3 bg-slate-50/50 hover:bg-emerald-50/40 flex items-center justify-between transition-colors">
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span>{tier.nameMy || tier.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 ml-5.5">
                          Min Order: {tier.minQty || 1} {viewingPricesProduct.uom || "Pcs"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-800 text-sm">
                          {formatCurrency(tier.price, currency, language)}
                        </div>
                        <div className={`text-[10px] font-mono font-semibold ${margin >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          Margin: {margin > 0 ? `+${margin}%` : `${margin}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  const p = viewingPricesProduct;
                  setViewingPricesProduct(null);
                  setEditingProduct(p);
                  setShowProductFormModal(true);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center space-x-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{language === "my" ? "ဈေးနှုန်းများ ပြင်ဆင်ရန်" : "Edit Prices in Product"}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingPricesProduct(null)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-xs"
              >
                {language === "my" ? "ပိတ်မည်" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
