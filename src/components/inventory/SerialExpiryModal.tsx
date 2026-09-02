import React, { useState, useRef, useEffect } from "react";
import { Product, Branch, SerialItem, BatchItem } from "../../types";
import {
  X,
  Plus,
  Trash2,
  ShieldCheck,
  Building,
  Search,
  CheckCircle2,
  Barcode,
  Sparkles,
  Check,
  Zap,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  Copy,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface SerialExpiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  branches: Branch[];
  onUpdateProduct: (updatedProduct: Product) => void;
  language: string;
}

export const SerialExpiryModal: React.FC<SerialExpiryModalProps> = ({
  isOpen,
  onClose,
  product,
  branches,
  onUpdateProduct,
  language,
}) => {
  if (!isOpen) return null;

  // Local state initialized with product serials
  const [serials, setSerials] = useState<SerialItem[]>(() => {
    return (product.serials || []).map((s) => ({
      ...s,
      qty: s.qty ?? 1,
    }));
  });

  // Active Selected Branch (e.g. Yangon HQ)
  const [activeBranchId, setActiveBranchId] = useState<string>(branches[0]?.id || "");

  // Top Default Template Values (အပေါ်က Lot/Expired ထည့်ထားရင် အောက်က add လုပ်တိုင်း auto default ပေါ်မယ်)
  const [defaultLotNumber, setDefaultLotNumber] = useState("LOT-2026-08A");
  const [defaultExpiryDate, setDefaultExpiryDate] = useState("2027-12-31");
  const [defaultQty, setDefaultQty] = useState<number>(1);
  const [defaultStatus, setDefaultStatus] = useState<"AVAILABLE" | "SOLD" | "DEFECTIVE" | "RESERVED">("AVAILABLE");

  // Fast Serial/Barcode Input
  const [quickSerialInput, setQuickSerialInput] = useState("");
  const [quickLotInput, setQuickLotInput] = useState("");
  const [quickExpiryInput, setQuickExpiryInput] = useState("");
  const [quickQtyInput, setQuickQtyInput] = useState<number>(1);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Bulk Paste / Sequence view toggle
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState("");

  // Search in table
  const [searchTerm, setSearchTerm] = useState("");

  const quickInputRef = useRef<HTMLInputElement>(null);

  // Sync quick input defaults with top template when changed
  useEffect(() => {
    setQuickLotInput(defaultLotNumber);
    setQuickExpiryInput(defaultExpiryDate);
    setQuickQtyInput(defaultQty);
  }, [defaultLotNumber, defaultExpiryDate, defaultQty, activeBranchId]);

  // Focus quick input on branch change
  useEffect(() => {
    setTimeout(() => {
      quickInputRef.current?.focus();
    }, 100);
  }, [activeBranchId]);

  const uom = product.uom || "Pcs";
  const branchStockMap = product.branchStock || {};
  const totalPhysicalOnHand = Object.values(branchStockMap).reduce<number>((a, b) => a + Number(b || 0), 0);

  // Active branch details & metrics
  const activeBranchObj = branches.find((b) => b.id === activeBranchId) || branches[0];
  const activeBranchTargetStock = Number(branchStockMap[activeBranchId] || 0);

  // All serial items for current active branch
  const activeBranchSerials = serials.filter((s) => s.branchId === activeBranchId);

  // Total Added / Assigned Qty for active branch (sum of Qty across rows)
  const activeBranchAssignedQty = activeBranchSerials.reduce<number>((sum, item) => sum + Number(item.qty || 1), 0);

  // Difference / Balance Qty (Target Stock - Added Qty)
  const activeBranchDifference = activeBranchTargetStock - activeBranchAssignedQty;

  // Helper for expiry color/badge
  const now = new Date();
  const getExpiryStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { status: "NO_EXPIRY", label: "No Expiry", color: "bg-slate-100 text-slate-600 border-slate-200" };
    const exp = new Date(expiryDateStr);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { status: "EXPIRED", label: `Expired (${Math.abs(diffDays)}d ago)`, color: "bg-rose-100 text-rose-800 border-rose-300" };
    } else if (diffDays <= 60) {
      return { status: "NEAR_EXPIRY", label: `Expires soon (${diffDays}d left)`, color: "bg-amber-100 text-amber-800 border-amber-300" };
    }
    return { status: "VALID", label: `Valid (${diffDays}d left)`, color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  // 1. ADD NEW LINE (Using Quick Entry or Empty Line)
  const handleAddLine = (customSerial?: string) => {
    const sVal = (customSerial !== undefined ? customSerial : quickSerialInput).trim();
    if (!sVal) {
      // If empty, generate a placeholder sequential serial
      const prefix = `SN-${(activeBranchObj?.code || activeBranchId).toUpperCase()}-`;
      let cur = 1001 + activeBranchSerials.length;
      let cand = `${prefix}${String(cur).padStart(4, "0")}`;
      while (serials.some((s) => s.serial === cand)) {
        cur += 1;
        cand = `${prefix}${String(cur).padStart(4, "0")}`;
      }

      const newLine: SerialItem = {
        serial: cand,
        branchId: activeBranchId,
        branchName: activeBranchObj?.name || activeBranchId,
        qty: quickQtyInput || defaultQty || 1,
        lotNumber: quickLotInput.trim() || defaultLotNumber || undefined,
        expiryDate: quickExpiryInput || defaultExpiryDate || undefined,
        status: defaultStatus,
        createdAt: new Date().toISOString(),
      };

      setSerials((prev) => [newLine, ...prev]);
      setFeedbackMsg(`✅ Added 1 Line (${cand}) to ${activeBranchObj?.name}`);
      setQuickSerialInput("");
      setTimeout(() => quickInputRef.current?.focus(), 50);
      return;
    }

    // Check if duplicate in the whole list
    const exists = serials.some((s) => s.serial.toLowerCase() === sVal.toLowerCase());
    if (exists) {
      setFeedbackMsg(`⚠️ Serial "${sVal}" is already registered!`);
      return;
    }

    const newLine: SerialItem = {
      serial: sVal,
      branchId: activeBranchId,
      branchName: activeBranchObj?.name || activeBranchId,
      qty: quickQtyInput || defaultQty || 1,
      lotNumber: (quickLotInput.trim() || defaultLotNumber) || undefined,
      expiryDate: (quickExpiryInput || defaultExpiryDate) || undefined,
      status: defaultStatus,
      createdAt: new Date().toISOString(),
    };

    setSerials((prev) => [newLine, ...prev]);
    setFeedbackMsg(`✅ Added "${sVal}" to ${activeBranchObj?.name}`);
    setQuickSerialInput("");
    setTimeout(() => quickInputRef.current?.focus(), 50);
  };

  // 2. AUTO-FILL REMAINING LINES UP TO BRANCH TARGET QTY
  const handleAutoFillBranch = () => {
    if (activeBranchDifference <= 0) return;
    const prefix = `SN-${(activeBranchObj?.code || activeBranchId).toUpperCase()}-`;
    const newItems: SerialItem[] = [];
    let cur = 1001 + activeBranchSerials.length;

    for (let i = 0; i < activeBranchDifference; i++) {
      let cand = `${prefix}${String(cur + i).padStart(4, "0")}`;
      while (serials.some((s) => s.serial === cand) || newItems.some((s) => s.serial === cand)) {
        cur += 1;
        cand = `${prefix}${String(cur + i).padStart(4, "0")}`;
      }
      newItems.push({
        serial: cand,
        branchId: activeBranchId,
        branchName: activeBranchObj?.name || activeBranchId,
        qty: 1,
        lotNumber: defaultLotNumber || undefined,
        expiryDate: defaultExpiryDate || undefined,
        status: defaultStatus,
        createdAt: new Date().toISOString(),
      });
    }

    setSerials((prev) => [...newItems, ...prev]);
    setFeedbackMsg(`⚡ Auto-filled ${activeBranchDifference} lines for ${activeBranchObj?.name}`);
  };

  // 3. APPLY DEFAULT LOT & EXPIRY TO ALL ROWS IN CURRENT BRANCH
  const handleApplyDefaultsToAllCurrentBranch = () => {
    setSerials((prev) =>
      prev.map((item) => {
        if (item.branchId === activeBranchId) {
          return {
            ...item,
            lotNumber: defaultLotNumber || item.lotNumber,
            expiryDate: defaultExpiryDate || item.expiryDate,
          };
        }
        return item;
      })
    );
    setFeedbackMsg(`✨ Updated Default Lot & Expiry for all lines in ${activeBranchObj?.name}`);
  };

  // 4. UPDATE INDIVIDUAL ROW IN REAL-TIME
  const handleUpdateLine = (globalIndex: number, field: keyof SerialItem, value: any) => {
    setSerials((prev) =>
      prev.map((item, idx) => {
        if (idx === globalIndex) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // 5. DELETE A LINE
  const handleDeleteLine = (globalIndex: number) => {
    setSerials((prev) => prev.filter((_, idx) => idx !== globalIndex));
  };

  // 6. DUPLICATE A LINE
  const handleDuplicateLine = (item: SerialItem) => {
    const prefix = `SN-${(activeBranchObj?.code || activeBranchId).toUpperCase()}-`;
    let cur = 1001 + serials.length;
    let cand = `${prefix}${String(cur).padStart(4, "0")}`;
    while (serials.some((s) => s.serial === cand)) {
      cur += 1;
      cand = `${prefix}${String(cur).padStart(4, "0")}`;
    }

    const duplicated: SerialItem = {
      ...item,
      serial: cand,
      createdAt: new Date().toISOString(),
    };
    setSerials((prev) => [duplicated, ...prev]);
  };

  // 7. BULK PASTE HANDLER
  const handleProcessPaste = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText
      .split(/[\r\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (lines.length === 0) return;

    const existingSet = new Set(serials.map((s) => s.serial.toLowerCase()));
    const newItems: SerialItem[] = [];
    let addedCount = 0;
    let skippedCount = 0;

    lines.forEach((sVal) => {
      if (existingSet.has(sVal.toLowerCase())) {
        skippedCount++;
      } else {
        existingSet.add(sVal.toLowerCase());
        newItems.push({
          serial: sVal,
          branchId: activeBranchId,
          branchName: activeBranchObj?.name || activeBranchId,
          qty: 1,
          lotNumber: defaultLotNumber || undefined,
          expiryDate: defaultExpiryDate || undefined,
          status: defaultStatus,
          createdAt: new Date().toISOString(),
        });
        addedCount++;
      }
    });

    if (newItems.length > 0) {
      setSerials((prev) => [...newItems, ...prev]);
    }
    setPasteText("");
    setShowPasteModal(false);
    setFeedbackMsg(
      `✅ Pasted ${addedCount} lines into ${activeBranchObj?.name}${skippedCount > 0 ? ` (${skippedCount} duplicates skipped)` : ""}`
    );
  };

  // 8. SAVE CHANGES AND CLOSE
  const handleSave = (syncToBranchStock: boolean = false) => {
    let updatedBranchStock = { ...(product.branchStock || {}) };
    if (syncToBranchStock) {
      branches.forEach((b) => {
        const bAssignedSum = serials
          .filter((s) => s.branchId === b.id)
          .reduce<number>((acc, cur) => acc + Number(cur.qty || 1), 0);
        if (bAssignedSum > 0) {
          updatedBranchStock[b.id] = bAssignedSum;
        }
      });
    }

    const updated: Product = {
      ...product,
      hasIMEI: true,
      branchStock: updatedBranchStock,
      serials: serials,
    };

    onUpdateProduct(updated);
    onClose();
  };

  // Filtered rows for current active branch
  const displayedRows = serials
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => {
      if (item.branchId !== activeBranchId) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.serial.toLowerCase().includes(term) ||
        (item.lotNumber && item.lotNumber.toLowerCase().includes(term))
      );
    });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full text-slate-800 shadow-2xl flex flex-col max-h-[96vh] overflow-hidden animate-fade-in">
        {/* MODAL HEADER */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">{product.name}</h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[11px] font-bold">
                  {product.sku}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px] font-bold">
                  UOM: {uom}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === "my"
                  ? "ဆိုင်ခွဲအလိုက် Serial / Lot / Expired / Qty တစ်လိုင်းချင်းစီ Add ထည့်သွင်းစီမံခြင်း"
                  : "Line-by-line Serial, Lot, Expiry & Qty Assignment per Branch"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. BRANCH SELECTOR BUTTONS */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-200 shrink-0 space-y-2">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 text-xs">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-700" />
              <span className="font-bold text-slate-900">
                {language === "my" ? "၁။ ဆိုင်ခွဲ ရွေးချယ်ပါ (Select Target Branch):" : "1. Select Branch:"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-600">
              <span>
                Total Stock: <b>{totalPhysicalOnHand} {uom}</b>
              </span>
              <span>|</span>
              <span className="text-blue-900 font-bold">
                Total Assigned Serials: {serials.reduce((a, b) => a + Number(b.qty || 1), 0)} / {totalPhysicalOnHand}
              </span>
            </div>
          </div>

          {/* Branch Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {branches.map((b) => {
              const bStock = Number(branchStockMap[b.id] || 0);
              const bAssigned = serials
                .filter((s) => s.branchId === b.id)
                .reduce((a, bItem) => a + Number(bItem.qty || 1), 0);
              const bDiff = bStock - bAssigned;
              const isSelected = activeBranchId === b.id;
              const isBalanced = bAssigned === bStock && bStock > 0;
              const isOver = bAssigned > bStock;

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBranchId(b.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300"
                      : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-bold text-xs ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {b.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : isBalanced
                          ? "bg-emerald-100 text-emerald-800"
                          : isOver
                          ? "bg-rose-100 text-rose-800"
                          : bDiff > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isBalanced ? "✅ Balanced" : isOver ? `+${Math.abs(bDiff)} Over` : bDiff > 0 ? `${bDiff} Missing` : "Complete"}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono">
                    <span className={isSelected ? "text-blue-100" : "text-slate-500"}>Stock: {bStock} {uom}</span>
                    <span className={isSelected ? "text-white font-bold" : "text-blue-800 font-bold"}>
                      Serials: {bAssigned}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. TOP DEFAULT TEMPLATE HEADER (အပေါ်က Lot/Expired ထည့်ထားရင် အောက်က add လုပ်တိုင်း auto default ပေါ်မယ်) */}
        <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-200 shrink-0 space-y-2">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-bold text-slate-900">
                {language === "my"
                  ? "၂။ Default Lot Code & Expired Date သတ်မှတ်ချက် (အောက်က Add လုပ်တိုင်း Auto Default ပါရှိမည့် တန်ဖိုးများ):"
                  : "2. Default Preset for New Rows (Auto-applied to new serial lines):"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyDefaultsToAllCurrentBranch}
              className="text-[11px] text-blue-800 hover:text-blue-950 font-bold underline cursor-pointer self-start sm:self-auto"
              title="Apply these default lot & expiry date values to all existing rows in this branch"
            >
              ⚡ {language === "my" ? `ဒီတန်ဖိုးများကို "${activeBranchObj.name}" ရှိ လိုင်းအားလုံးသို့ ပြောင်းမည်` : `Apply defaults to all rows in ${activeBranchObj.name}`}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                {language === "my" ? "Default Lot / Batch #" : "Default Lot / Batch #"}
              </label>
              <input
                type="text"
                placeholder="e.g. LOT-2026-08A"
                value={defaultLotNumber}
                onChange={(e) => setDefaultLotNumber(e.target.value)}
                className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                {language === "my" ? "Default Expired Date" : "Default Expired Date"}
              </label>
              <input
                type="date"
                value={defaultExpiryDate}
                onChange={(e) => setDefaultExpiryDate(e.target.value)}
                className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                {language === "my" ? "Default Qty" : "Default Qty"}
              </label>
              <input
                type="number"
                min={1}
                value={defaultQty}
                onChange={(e) => setDefaultQty(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                {language === "my" ? "Default Status" : "Default Status"}
              </label>
              <select
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value as any)}
                className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
              >
                <option value="AVAILABLE">AVAILABLE (ရောင်းချနိုင်)</option>
                <option value="RESERVED">RESERVED (ကြိုတင်မှာယူ)</option>
                <option value="SOLD">SOLD (ရောင်းချပြီး)</option>
                <option value="DEFECTIVE">DEFECTIVE (ချွတ်ယွင်း)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. FAST SCAN / ADD LINE CONTROLS */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 shrink-0 space-y-2">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="flex items-center space-x-1.5">
              <Barcode className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">
                {language === "my"
                  ? `၃။ Serial / Barcode ထည့်၍ တစ်လိုင်းချင်းစီ Add လုပ်ရန် (${activeBranchObj.name}):`
                  : `3. Add Lines for ${activeBranchObj.name}:`}
              </span>
            </div>

            {feedbackMsg && (
              <span className="text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg animate-fade-in">
                {feedbackMsg}
              </span>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddLine();
            }}
            className="flex flex-wrap items-center gap-2"
          >
            {/* Serial input */}
            <div className="relative flex-1 min-w-[180px]">
              <Barcode className="w-4 h-4 text-blue-500 absolute left-3 top-2.5" />
              <input
                ref={quickInputRef}
                type="text"
                placeholder={
                  language === "my"
                    ? "Serial / Barcode ရိုက်ထည့်ပါ (Enter ခေါက်လျှင် ချက်ချင်း ၁ လိုင်း add မည်)..."
                    : "Type / Scan Serial Barcode (Hit Enter to add line)..."
                }
                value={quickSerialInput}
                onChange={(e) => setQuickSerialInput(e.target.value)}
                className="w-full bg-slate-50 border-2 border-blue-400 focus:border-blue-600 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none shadow-2xs"
              />
            </div>

            {/* Lot code (pre-filled with default) */}
            <div className="w-32">
              <input
                type="text"
                placeholder="Lot Code"
                value={quickLotInput}
                onChange={(e) => setQuickLotInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                title="Lot Code for next added row (defaults from top)"
              />
            </div>

            {/* Expiry date (pre-filled with default) */}
            <div className="w-36">
              <input
                type="date"
                value={quickExpiryInput}
                onChange={(e) => setQuickExpiryInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                title="Expiry Date for next added row (defaults from top)"
              />
            </div>

            {/* Qty */}
            <div className="w-16">
              <input
                type="number"
                min={1}
                value={quickQtyInput}
                onChange={(e) => setQuickQtyInput(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-blue-500"
                title="Qty for next added row"
              />
            </div>

            {/* Add Line Button */}
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === "my" ? "+ ၁ လိုင်းထည့်မည်" : "+ Add Line"}</span>
            </button>

            {/* Quick Blank Line Button */}
            <button
              type="button"
              onClick={() => handleAddLine("")}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shrink-0 transition-colors"
              title="Add empty row with prefilled lot and expiry"
            >
              + {language === "my" ? "လိုင်းလွတ်တိုးမည်" : "Empty Row"}
            </button>

            {/* Auto Fill Missing Button */}
            {activeBranchDifference > 0 && (
              <button
                type="button"
                onClick={handleAutoFillBranch}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1 shrink-0 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{language === "my" ? `+${activeBranchDifference} လိုင်း Auto-Fill` : `Auto-Fill ${activeBranchDifference} Lines`}</span>
              </button>
            )}

            {/* Paste Button */}
            <button
              type="button"
              onClick={() => setShowPasteModal(!showPasteModal)}
              className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0 transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{language === "my" ? "စာရင်းကူးထည့် (Paste)" : "Paste List"}</span>
            </button>
          </form>

          {/* Bulk Paste Box (Optional Expandable) */}
          {showPasteModal && (
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 mt-2 animate-fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-purple-900">
                  {language === "my" ? `Serial စာရင်းများကို တစ်ကြိမ်တည်း ကူးထည့်ပါ (${activeBranchObj.name}):` : `Paste Multiple Serials into ${activeBranchObj.name}:`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Paste list of Serial numbers (one per line, or separated by commas)...&#10;SN-YGN-1001&#10;SN-YGN-1002&#10;SN-YGN-1003"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full bg-white border border-purple-300 rounded-xl p-2.5 text-xs font-mono font-medium text-slate-900 focus:outline-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleProcessPaste}
                  className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === "my" ? "စာရင်းများကို Add မည်" : "Process & Add"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. LINE-BY-LINE EDITABLE TABLE (Serial / Lot / Expired / Qty / Actions) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 text-xs bg-slate-50/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>
                {language === "my"
                  ? `"${activeBranchObj.name}" ၏ Serial စာရင်းလိုင်းများ`
                  : `Serial Line Items for ${activeBranchObj.name}`}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-mono text-[11px] font-bold">
                {activeBranchSerials.length} Lines ({activeBranchAssignedQty} {uom})
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search serial / lot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {displayedRows.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <p>
                  {language === "my"
                    ? `"${activeBranchObj.name}" တွင် Serial လိုင်းများ မထည့်ရသေးပါ။ အပေါ်ရှိ Input တွင် Barcode ဖတ် / ရိုက်ထည့်၍သော်လည်းကောင်း၊ "+ ၁ လိုင်းထည့်မည်" ကို နှိပ်၍သော်လည်းကောင်း စတင်ထည့်သွင်းနိုင်ပါသည်။`
                    : `No serial lines recorded yet for ${activeBranchObj.name}. Use the scanner input above or click '+ Add Line' to start.`}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddLine("")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs text-xs inline-flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === "my" ? "+ ပထမဆုံး Serial ၁ လိုင်းထည့်မည်" : "+ Add First Serial Line"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-[38vh] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] uppercase text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
                    <tr>
                      <th className="px-3 py-2.5 text-center w-10">#</th>
                      <th className="px-3 py-2.5 min-w-[170px]">Serial Number / Barcode *</th>
                      <th className="px-3 py-2.5 min-w-[130px]">Lot / Batch Code</th>
                      <th className="px-3 py-2.5 min-w-[140px]">Expired Date</th>
                      <th className="px-3 py-2.5 text-center w-20">Qty</th>
                      <th className="px-3 py-2.5 w-32">Status</th>
                      <th className="px-3 py-2.5 text-right w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {displayedRows.map(({ item, originalIndex }, idx) => {
                      const expStatus = getExpiryStatus(item.expiryDate);

                      return (
                        <tr key={originalIndex} className="hover:bg-blue-50/30 transition-colors">
                          {/* Row # */}
                          <td className="px-3 py-2 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>

                          {/* Serial / Barcode Input */}
                          <td className="px-3 py-2">
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={item.serial}
                                onChange={(e) => handleUpdateLine(originalIndex, "serial", e.target.value)}
                                className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-slate-900 focus:outline-none shadow-2xs"
                                placeholder="SN-XXXX"
                              />
                            </div>
                          </td>

                          {/* Lot / Batch Code Input */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.lotNumber || ""}
                              onChange={(e) => handleUpdateLine(originalIndex, "lotNumber", e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-2.5 py-1.5 font-mono text-xs text-slate-800 focus:outline-none"
                              placeholder="LOT-XXXX"
                            />
                          </td>

                          {/* Expired Date Input */}
                          <td className="px-3 py-2">
                            <div className="flex items-center space-x-1">
                              <input
                                type="date"
                                value={item.expiryDate || ""}
                                onChange={(e) => handleUpdateLine(originalIndex, "expiryDate", e.target.value)}
                                className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                              />
                              {item.expiryDate && (
                                <span
                                  className={`px-1.5 py-0.5 text-[9px] rounded-md border font-bold shrink-0 ${expStatus.color}`}
                                  title={expStatus.label}
                                >
                                  {expStatus.status === "VALID" ? "OK" : expStatus.status === "EXPIRED" ? "EXP" : "NEAR"}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Qty Input */}
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.qty ?? 1}
                              onChange={(e) =>
                                handleUpdateLine(originalIndex, "qty", Math.max(1, Number(e.target.value)))
                              }
                              className="w-16 bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-2 py-1.5 font-mono text-xs font-bold text-slate-900 text-center focus:outline-none"
                            />
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2">
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateLine(originalIndex, "status", e.target.value as any)}
                              className={`w-full rounded-xl px-2 py-1.5 text-[11px] font-bold border focus:outline-none ${
                                item.status === "AVAILABLE"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : item.status === "SOLD"
                                  ? "bg-slate-100 text-slate-700 border-slate-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              <option value="AVAILABLE">AVAILABLE</option>
                              <option value="RESERVED">RESERVED</option>
                              <option value="SOLD">SOLD</option>
                              <option value="DEFECTIVE">DEFECTIVE</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                type="button"
                                onClick={() => handleDuplicateLine(item)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Duplicate row"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLine(originalIndex)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 5. RECONCILIATION & BALANCE STATUS BAR (Reconcile / Branch Total Qty / Balance Qty / Different Qty) */}
        <div className="px-6 py-3 bg-slate-100/90 border-t border-slate-200 shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            {/* Reconcile Metric Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center space-x-1.5 shadow-2xs">
                <span className="text-slate-500 font-semibold">{activeBranchObj.name} Target Stock:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {activeBranchTargetStock} {uom}
                </span>
              </div>

              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-1.5 shadow-2xs">
                <span className="text-blue-700 font-semibold">Total Assigned Qty:</span>
                <span className="font-mono font-bold text-blue-950 text-sm">
                  {activeBranchAssignedQty} {uom}
                </span>
              </div>

              {/* Different / Balance Status Pill */}
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 shadow-2xs font-bold ${
                  activeBranchDifference === 0
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : activeBranchDifference > 0
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-rose-100 text-rose-900 border-rose-300"
                }`}
              >
                <span>{language === "my" ? "Balance / Different Qty:" : "Different Qty:"}</span>
                <span className="font-mono text-sm">
                  {activeBranchDifference === 0
                    ? "✅ Balanced (0 Diff)"
                    : activeBranchDifference > 0
                    ? `⚠️ ${activeBranchDifference} Missing (Diff: -${activeBranchDifference})`
                    : `⚠️ +${Math.abs(activeBranchDifference)} Over (Diff: +${Math.abs(activeBranchDifference)})`}
                </span>
              </div>
            </div>

            {/* Quick Button to add next line */}
            <button
              type="button"
              onClick={() => handleAddLine("")}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors self-end sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === "my" ? "+ နောက် ၁ လိုင်းတိုးမည်" : "+ Add Next Line"}</span>
            </button>
          </div>
        </div>

        {/* 6. BOTTOM ACTIONS FOOTER (Save & Cancel) */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Total Serials across All Branches: <span className="font-bold text-slate-900">{serials.length}</span> (
            <span className={serials.length === totalPhysicalOnHand ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
              {serials.length === totalPhysicalOnHand ? "✅ All Branches Matched" : `${Math.abs(totalPhysicalOnHand - serials.length)} Total Diff`}
            </span>
            )
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors text-xs cursor-pointer"
            >
              {language === "my" ? "ပယ်ဖျက်မည် (Cancel)" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 transition-colors text-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{language === "my" ? "သိမ်းဆည်းမည် (Save Changes)" : "Save Changes"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 transition-colors text-xs cursor-pointer"
              title="Save serials and sync physical branch stock count to match assigned serial quantities"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === "my" ? "Save & Sync Stock" : "Save & Sync Stock"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
