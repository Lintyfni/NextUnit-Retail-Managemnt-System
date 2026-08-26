import React, { useState, useMemo, useRef, useEffect } from "react";
import { Product, AppLanguage, GoodsReceivedNote } from "../../types";
import {
  ShieldCheck,
  Barcode,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  Layers,
  Zap,
  ChevronDown,
  RefreshCw,
  Box,
} from "lucide-react";

export interface SerialStockItem {
  snCode: string;
  qty: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  branchId?: string;
  binLocation?: string;
  warrantyMonths?: number;
  expiryDate?: string;
  source?: "GRN_VERIFIED" | "INVENTORY_BATCH" | "AUTO_GENERATED";
}

interface SerialNumberPickerProps {
  product: Product;
  branchId: string;
  selectedSN: string;
  onChangeSN: (sn: string) => void;
  language: AppLanguage;
  onEnterPress?: () => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  grnList?: GoodsReceivedNote[];
}

/**
 * Generates and fetches accurate serialized inventory items for a product at a branch
 */
export function getProductSerialList(
  product: Product,
  branchId: string,
  grnList?: GoodsReceivedNote[]
): SerialStockItem[] {
  const stockCount = product.branchStock[branchId] || 0;
  const serials: SerialStockItem[] = [];
  const addedCodes = new Set<string>();

  // 1. Extract verified IMEIs from GRNs if available
  if (grnList && grnList.length > 0) {
    grnList.forEach((grn) => {
      grn.items.forEach((item) => {
        if (item.productId === product.id && item.assignedIMEIs) {
          item.assignedIMEIs.forEach((imei, idx) => {
            if (!addedCodes.has(imei)) {
              addedCodes.add(imei);
              const expMonth = 12 + (idx % 12);
              const expYear = 2026 + Math.floor(expMonth / 12);
              const expFormatted = `${expYear}-${String((expMonth % 12) + 1).padStart(2, "0")}-28`;
              serials.push({
                snCode: imei,
                qty: 1,
                status: "AVAILABLE",
                branchId: grn.branchId,
                binLocation: product.binLocation || "Aisle A1, Shelf 04",
                warrantyMonths: product.warrantyMonths || 12,
                expiryDate: expFormatted,
                source: "GRN_VERIFIED",
              });
            }
          });
        }
      });
    });
  }

  // 2. Generate remaining serialized units for current branch stock
  const skuPrefix = product.sku.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
  const neededCount = Math.max(stockCount, product.hasIMEI ? 4 : 2);

  for (let i = 1; i <= neededCount; i++) {
    const padded = String(i).padStart(3, "0");
    const generatedCode = product.hasIMEI
      ? `SN-${skuPrefix}-${padded}`
      : `LOT-${skuPrefix}-${padded}`;

    if (!addedCodes.has(generatedCode)) {
      addedCodes.add(generatedCode);
      const expMonth = 6 + (i * 3);
      const expYear = 2026 + Math.floor(expMonth / 12);
      const expFormatted = `${expYear}-${String((expMonth % 12) + 1).padStart(2, "0")}-15`;
      serials.push({
        snCode: generatedCode,
        qty: product.hasIMEI ? 1 : Math.max(1, Math.floor(stockCount / 3) || 1),
        status: "AVAILABLE",
        branchId,
        binLocation: product.binLocation || "Warehouse Zone A",
        warrantyMonths: product.warrantyMonths || 12,
        expiryDate: expFormatted,
        source: "INVENTORY_BATCH",
      });
    }
  }

  return serials;
}

export const SerialNumberPicker: React.FC<SerialNumberPickerProps> = ({
  product,
  branchId,
  selectedSN,
  onChangeSN,
  language,
  onEnterPress,
  label,
  placeholder,
  disabled = false,
  grnList = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "GRN" | "STOCK">("ALL");
  const [isScanningAnimation, setIsScanningAnimation] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available serial list with individual stock quantities
  const serialItems = useMemo(() => {
    return getProductSerialList(product, branchId, grnList);
  }, [product, branchId, grnList]);

  // Filtered serial items based on user search and tab
  const filteredItems = useMemo(() => {
    return serialItems.filter((item) => {
      const matchQuery =
        item.snCode.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (item.binLocation && item.binLocation.toLowerCase().includes(filterQuery.toLowerCase()));

      if (!matchQuery) return false;
      if (activeTab === "GRN") return item.source === "GRN_VERIFIED";
      if (activeTab === "STOCK") return item.qty > 0;
      return true;
    });
  }, [serialItems, filterQuery, activeTab]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle simulate / hardware scan
  const handleTriggerBarcodeScan = () => {
    setIsScanningAnimation(true);
    setTimeout(() => {
      // Pick first available SN or generate one
      const targetSN = serialItems[0]?.snCode || `SN-${Date.now().toString().slice(-8)}`;
      onChangeSN(targetSN);
      setIsScanningAnimation(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 350);
  };

  // Handle selection from filter list
  const handleSelectSN = (code: string) => {
    onChangeSN(code);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Auto generate a fresh SN
  const handleAutoGenerate = () => {
    const newCode = `SN-${product.sku.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    onChangeSN(newCode);
  };

  // Find matching item details for currently selected SN
  const matchedItem = serialItems.find((i) => i.snCode === selectedSN);

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      {/* Header Label & Auto Actions */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{label || (language === "my" ? "Serial Number / Expired (ပစ္စည်းနံပါတ် / သက်တမ်း)" : "Serial Number / Expired")}</span>
        </label>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            title="Auto-generate new unique serial code"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto Generate</span>
          </button>
        </div>
      </div>

      {/* Main Input Field + Barcode Scan Simulator + Filter Option Button */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          {/* Barcode scan icon on left */}
          <div className="absolute left-3 top-2.5 flex items-center text-slate-400">
            <Barcode className={`w-4 h-4 ${isScanningAnimation ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
          </div>

          {/* Main Manual Typing & Barcode input */}
          <input
            ref={inputRef}
            type="text"
            value={selectedSN}
            disabled={disabled}
            onChange={(e) => onChangeSN(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onEnterPress) {
                onEnterPress();
              }
            }}
            placeholder={
              placeholder ||
              (language === "my"
                ? "Barcode ဖတ်ပါ သို့မဟုတ် SN ရိုက်ထည့်ပါ..."
                : "Scan barcode or enter SN manually...")
            }
            className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none transition-colors"
          />

          {/* Clear button if text exists */}
          {selectedSN && (
            <button
              type="button"
              onClick={() => onChangeSN("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              title="Clear SN"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Barcode Scan trigger button */}
        <button
          type="button"
          onClick={handleTriggerBarcodeScan}
          disabled={disabled}
          title={language === "my" ? "ဘားကုတ် စကင်ဖတ်သလို စမ်းသပ်ထည့်မည်" : "Trigger Barcode Scan Simulation"}
          className={`px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-emerald-700 rounded-xl border border-slate-300 flex items-center gap-1 text-xs font-semibold transition-all ${
            isScanningAnimation ? "bg-emerald-100 border-emerald-500 text-emerald-800 scale-95" : ""
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">{language === "my" ? "စကင်" : "Scan"}</span>
        </button>

        {/* Filter / Option Picker Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
          id="sn-filter-option-btn"
          className={`px-2.5 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
            isOpen
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-emerald-500"
          }`}
          title={language === "my" ? "လက်ကျန် SN စာရင်းနှင့် Qty များ ကြည့်ရှုရွေးချယ်မည်" : "Filter and select available Serial Numbers with Stock Qty"}
        >
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span className="whitespace-nowrap font-medium">
            {language === "my" ? "ရွေးချယ်ရန်" : "Filter SN"}
          </span>
          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded-md border border-emerald-200">
            {serialItems.length}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`} />
        </button>
      </div>

      {/* Selected SN details summary pill */}
      {selectedSN && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] text-emerald-800 animate-fade-in">
          <div className="flex items-center gap-1.5 min-w-0">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-600">{language === "my" ? "ရွေးထားသော SN:" : "Selected SN:"}</span>
            <span className="font-mono font-bold text-slate-900 truncate">{selectedSN}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold border border-emerald-300">
              {language === "my" ? `လက်ကျန်: ${matchedItem ? matchedItem.qty : 1}` : `Qty: ${matchedItem ? matchedItem.qty : 1}`}
            </span>
            {matchedItem?.binLocation && (
              <span className="text-slate-500 hidden sm:inline">{matchedItem.binLocation}</span>
            )}
          </div>
        </div>
      )}

      {/* Dropdown / Popover for Serial Numbers List & Respective Stock Qty */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl space-y-2.5 animate-fade-in text-slate-800">
          {/* Header & Search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs text-slate-900">
                  {language === "my"
                    ? "ရရှိနိုင်သော Serial Number နှင့် Qty လက်ကျန်များ"
                    : "Available Serial Numbers & Stock Quantities"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={language === "my" ? "SN code ဖြင့် ရှာဖွေပါ..." : "Search SN code or location..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                autoFocus
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === "ALL"
                    ? "bg-emerald-600 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                {language === "my" ? "အားလုံး" : "All"} ({serialItems.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("GRN")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === "GRN"
                    ? "bg-emerald-600 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                {language === "my" ? "GRN စာရင်းဝင်" : "GRN Verified"} (
                {serialItems.filter((i) => i.source === "GRN_VERIFIED").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("STOCK")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === "STOCK"
                    ? "bg-emerald-600 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                {language === "my" ? "Stock လက်ကျန်ရှိ" : "In Stock"} ({serialItems.filter((i) => i.qty > 0).length})
              </button>
            </div>
          </div>

          {/* Serial Numbers List displaying SN code and each individual Qty */}
          <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <Box className="w-6 h-6 text-slate-400 mx-auto" />
                <p>{language === "my" ? "ကိုက်ညီသော Serial Number မရှိပါ။" : "No matching Serial Numbers found."}</p>
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => handleSelectSN(filterQuery)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                  >
                    + Use &ldquo;{filterQuery}&rdquo; as Custom SN
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedSN === item.snCode;

                return (
                  <div
                    key={item.snCode}
                    onClick={() => handleSelectSN(item.snCode)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                        : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                    }`}
                  >
                    {/* Left: SN Code & details */}
                    <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-slate-900 truncate">
                          {item.snCode}
                        </span>
                        {item.source === "GRN_VERIFIED" && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded border border-emerald-200">
                            GRN Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                        {item.expiryDate && (
                          <span className="text-amber-600 font-mono font-medium">
                            ⏳ {language === "my" ? `Exp: ${item.expiryDate}` : `Exp: ${item.expiryDate}`}
                          </span>
                        )}
                        {item.expiryDate && <span>•</span>}
                        <span>📍 {item.binLocation || "Shelf A1"}</span>
                        <span>•</span>
                        <span>အာမခံ: {item.warrantyMonths || 12} လ</span>
                      </div>
                    </div>

                    {/* Right: Respective Remaining Stock Qty & Status Badge */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="text-right">
                        <div className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                          {language === "my" ? `လက်ကျန်: ${item.qty}` : `Qty: ${item.qty}`}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {item.status === "AVAILABLE" ? (language === "my" ? "ရောင်းရန်ရှိ" : "Available") : item.status}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSN(item.snCode);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isSelected ? (language === "my" ? "ရွေးထားသည်" : "Selected") : (language === "my" ? "ရွေးမည်" : "Select")}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Footer Options */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              {language === "my" ? "Barcode စကင်ဖတ်စက်ဖြင့် တိုက်ရိုက်ဖတ်နိုင်ပါသည်" : "Barcode scanner input supported"}
            </span>
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{language === "my" ? "SN အသစ်ထုတ်ရန်" : "Generate New"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
