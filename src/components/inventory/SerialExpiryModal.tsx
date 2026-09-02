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
  Layers,
  Sparkles,
  Check,
  Zap,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  QrCode,
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

  // Local state initialized with product serials & batches
  const [serials, setSerials] = useState<SerialItem[]>(product.serials || []);
  const [batches, setBatches] = useState<BatchItem[]>(product.batches || []);

  // Active Target Branch for assigning serials
  const [activeBranchId, setActiveBranchId] = useState<string>(branches[0]?.id || "");

  // Mode: Barcode Scan / Single / Bulk Paste / Auto-Gen / Batches
  const [creationMode, setCreationMode] = useState<"SCAN" | "PASTE" | "BULK" | "BATCH">("SCAN");

  // Barcode / Serial Direct Scanner input
  const [barcodeInput, setBarcodeInput] = useState("");
  const [lastScannedFeedback, setLastScannedFeedback] = useState<string | null>(null);
  const [scanLotCode, setScanLotCode] = useState("LOT-2026-08A");
  const [scanExpiryDate, setScanExpiryDate] = useState("2027-12-31");
  const [scanStatus, setScanStatus] = useState<"AVAILABLE" | "SOLD" | "DEFECTIVE" | "RESERVED">("AVAILABLE");
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Bulk Paste Input
  const [pasteInputText, setPasteInputText] = useState("");

  // Bulk Generator Inputs
  const [bulkPrefix, setBulkPrefix] = useState(`SN-${product.brand?.toUpperCase().slice(0, 3) || "PROD"}-`);
  const [bulkStartNum, setBulkStartNum] = useState(1001);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkLot, setBulkLot] = useState("LOT-2026-08A");
  const [bulkExpiry, setBulkExpiry] = useState("2027-12-31");

  // New Batch/Lot Input
  const [batchNumInput, setBatchNumInput] = useState("LOT-2026-09B");
  const [batchQtyInput, setBatchQtyInput] = useState(10);
  const [batchBranchInput, setBatchBranchInput] = useState(branches[0]?.id || "");
  const [batchExpiryInput, setBatchExpiryInput] = useState("2028-06-30");
  const [batchNotesInput, setBatchNotesInput] = useState("");

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Focus scan input on mode change
  useEffect(() => {
    if (creationMode === "SCAN") {
      setTimeout(() => {
        scanInputRef.current?.focus();
      }, 100);
    }
  }, [creationMode, activeBranchId]);

  // Calculations
  const now = new Date();
  const getExpiryStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { status: "NO_EXPIRY", label: "No Expiry", color: "bg-slate-100 text-slate-700 border-slate-200" };
    const exp = new Date(expiryDateStr);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { status: "EXPIRED", label: `Expired (${Math.abs(diffDays)}d ago)`, color: "bg-rose-100 text-rose-800 border-rose-300" };
    } else if (diffDays <= 60) {
      return { status: "NEAR_EXPIRY", label: `Expires soon (${diffDays}d left)`, color: "bg-amber-100 text-amber-800 border-amber-300" };
    }
    return { status: "VALID", label: `Valid (${diffDays}d left)`, color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  const uom = product.uom || "Pcs";
  const branchStockMap = product.branchStock || {};
  const totalPhysicalOnHand = Object.values(branchStockMap).reduce<number>((a, b) => a + Number(b || 0), 0);

  // Helper for branch metrics
  const getBranchSerialCount = (bId: string) => serials.filter((s) => s.branchId === bId).length;
  const getBranchStock = (bId: string) => Number(branchStockMap[bId] || 0);

  const activeBranchObj = branches.find((b) => b.id === activeBranchId) || branches[0];
  const activeBranchStock = getBranchStock(activeBranchId);
  const activeBranchAssigned = getBranchSerialCount(activeBranchId);
  const activeBranchRemaining = Math.max(0, activeBranchStock - activeBranchAssigned);

  // Scan or Rapid Enter Serial
  const handleScanOrAddSerial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = barcodeInput.trim();
    if (!raw) return;

    // Check duplicate
    const exists = serials.some((s) => s.serial.toLowerCase() === raw.toLowerCase());
    if (exists) {
      setLastScannedFeedback(`⚠️ Serial "${raw}" is already assigned!`);
      return;
    }

    const bObj = branches.find((b) => b.id === activeBranchId) || branches[0];
    const newItem: SerialItem = {
      serial: raw,
      branchId: activeBranchId,
      branchName: bObj?.name || activeBranchId,
      status: scanStatus,
      lotNumber: scanLotCode.trim() || undefined,
      expiryDate: scanExpiryDate || undefined,
      createdAt: new Date().toISOString(),
    };

    setSerials((prev) => [newItem, ...prev]);
    setLastScannedFeedback(`✅ Added "${raw}" to ${bObj?.name}`);
    setBarcodeInput("");
    scanInputRef.current?.focus();
  };

  // Bulk Paste Handler (e.g. paste 10 serial lines)
  const handleProcessPasteSerials = () => {
    if (!pasteInputText.trim()) return;
    const lines = pasteInputText
      .split(/[\r\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (lines.length === 0) return;

    const bObj = branches.find((b) => b.id === activeBranchId) || branches[0];
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
          branchName: bObj?.name || activeBranchId,
          status: scanStatus,
          lotNumber: scanLotCode.trim() || undefined,
          expiryDate: scanExpiryDate || undefined,
          createdAt: new Date().toISOString(),
        });
        addedCount++;
      }
    });

    if (newItems.length > 0) {
      setSerials((prev) => [...newItems, ...prev]);
    }
    setPasteInputText("");
    setLastScannedFeedback(
      `✅ Pasted ${addedCount} serials to ${bObj?.name}${skippedCount > 0 ? ` (${skippedCount} duplicates skipped)` : ""}`
    );
  };

  // 1-Click Auto Fill Missing Serials for Active Branch
  const handleAutoFillBranchSerials = (bId: string) => {
    const bObj = branches.find((b) => b.id === bId) || branches[0];
    const bStock = getBranchStock(bId);
    const bAssigned = getBranchSerialCount(bId);
    const needed = bStock - bAssigned;
    if (needed <= 0) return;

    const prefix = `SN-${(bObj.code || bObj.id).toUpperCase()}-`;
    const newItems: SerialItem[] = [];
    let curNum = 1001;

    for (let i = 0; i < needed; i++) {
      let candidate = `${prefix}${String(curNum + i).padStart(4, "0")}`;
      while (serials.some((s) => s.serial === candidate)) {
        curNum += 10;
        candidate = `${prefix}${String(curNum + i).padStart(4, "0")}`;
      }
      newItems.push({
        serial: candidate,
        branchId: bId,
        branchName: bObj.name,
        status: "AVAILABLE",
        lotNumber: scanLotCode.trim() || "LOT-2026-08A",
        expiryDate: scanExpiryDate || "2027-12-31",
        createdAt: new Date().toISOString(),
      });
    }

    setSerials((prev) => [...newItems, ...prev]);
    setLastScannedFeedback(`⚡ Auto-generated ${needed} serials for ${bObj.name}`);
  };

  // 1-Click Auto Fill All Branches to match physical stock
  const handleAutoFillAllBranches = () => {
    let totalGenerated = 0;
    const newItems: SerialItem[] = [];

    branches.forEach((b) => {
      const bStock = getBranchStock(b.id);
      const bAssigned = getBranchSerialCount(b.id);
      const needed = bStock - bAssigned;
      if (needed > 0) {
        const prefix = `SN-${(b.code || b.id).toUpperCase()}-`;
        let curNum = 1001;
        for (let i = 0; i < needed; i++) {
          let candidate = `${prefix}${String(curNum + i).padStart(4, "0")}`;
          while (
            serials.some((s) => s.serial === candidate) ||
            newItems.some((s) => s.serial === candidate)
          ) {
            curNum += 10;
            candidate = `${prefix}${String(curNum + i).padStart(4, "0")}`;
          }
          newItems.push({
            serial: candidate,
            branchId: b.id,
            branchName: b.name,
            status: "AVAILABLE",
            lotNumber: scanLotCode.trim() || "LOT-2026-08A",
            expiryDate: scanExpiryDate || "2027-12-31",
            createdAt: new Date().toISOString(),
          });
          totalGenerated++;
        }
      }
    });

    if (newItems.length > 0) {
      setSerials((prev) => [...newItems, ...prev]);
      setLastScannedFeedback(`⚡ Auto-generated ${totalGenerated} missing serials across all branches.`);
    }
  };

  // Generate Bulk Serials
  const handleGenerateBulkSerials = () => {
    const bObj = branches.find((b) => b.id === activeBranchId) || branches[0];
    const newItems: SerialItem[] = [];
    for (let i = 0; i < bulkCount; i++) {
      const sNum = `${bulkPrefix}${bulkStartNum + i}`;
      newItems.push({
        serial: sNum,
        branchId: activeBranchId,
        branchName: bObj?.name || activeBranchId,
        status: "AVAILABLE",
        lotNumber: bulkLot.trim() || undefined,
        expiryDate: bulkExpiry || undefined,
        createdAt: new Date().toISOString(),
      });
    }
    setSerials((prev) => [...newItems, ...prev]);
    setBulkStartNum((prev) => prev + bulkCount);
    setLastScannedFeedback(`⚡ Generated ${bulkCount} serials for ${bObj.name}`);
  };

  // Add Batch
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumInput.trim()) return;
    const bObj = branches.find((b) => b.id === batchBranchInput);
    const newBatch: BatchItem = {
      batchNumber: batchNumInput.trim(),
      quantity: Math.max(1, batchQtyInput),
      branchId: batchBranchInput,
      branchName: bObj?.name || batchBranchInput,
      expiryDate: batchExpiryInput,
      notes: batchNotesInput.trim() || undefined,
    };
    setBatches((prev) => [newBatch, ...prev]);
    setBatchNumInput(`LOT-2026-${Math.floor(10 + Math.random() * 89)}`);
  };

  const handleRemoveSerial = (index: number) => {
    setSerials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearBranchSerials = (bId: string) => {
    const bObj = branches.find((b) => b.id === bId);
    if (
      window.confirm(
        language === "my"
          ? `${bObj?.name} အတွက် ကပ်ထားသော Serial အားလုံးကို ဖျက်ပစ်ရန် သေချာပါသလား?`
          : `Clear all assigned serials for ${bObj?.name}?`
      )
    ) {
      setSerials((prev) => prev.filter((s) => s.branchId !== bId));
    }
  };

  const handleUpdateSerialBranch = (index: number, newBranchId: string) => {
    const bObj = branches.find((b) => b.id === newBranchId);
    setSerials((prev) =>
      prev.map((s, idx) =>
        idx === index ? { ...s, branchId: newBranchId, branchName: bObj?.name || newBranchId } : s
      )
    );
  };

  const handleUpdateSerialStatus = (
    index: number,
    newStatus: "AVAILABLE" | "SOLD" | "DEFECTIVE" | "RESERVED"
  ) => {
    setSerials((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status: newStatus } : s))
    );
  };

  const handleSaveAndClose = (syncToBranchStock: boolean = false) => {
    let updatedBranchStock = { ...(product.branchStock || {}) };
    if (syncToBranchStock) {
      branches.forEach((b) => {
        const count = getBranchSerialCount(b.id);
        if (count > 0) {
          updatedBranchStock[b.id] = count;
        }
      });
    }

    const updated: Product = {
      ...product,
      hasIMEI: true,
      branchStock: updatedBranchStock,
      serials: serials,
      batches: batches,
    };
    onUpdateProduct(updated);
    onClose();
  };

  // Filtered Serials
  const filteredSerials = serials.filter((item) => {
    const matchSearch =
      item.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.lotNumber && item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchBranch = selectedBranchFilter === "ALL" || item.branchId === selectedBranchFilter;
    const matchStatus = selectedStatusFilter === "ALL" || item.status === selectedStatusFilter;
    return matchSearch && matchBranch && matchStatus;
  });

  const availableSerialsCount = serials.filter((s) => s.status === "AVAILABLE").length;
  const expiredCount = serials.filter((s) => getExpiryStatus(s.expiryDate).status === "EXPIRED").length;
  const nearExpiryCount = serials.filter((s) => getExpiryStatus(s.expiryDate).status === "NEAR_EXPIRY").length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full text-slate-800 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
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
                  ? "Yangon, MDY စသည့် ဆိုင်ခွဲအလိုက် လက်ကျန် Qty ပေါ်တွင် Barcode ဖတ်၍ Serial Number တွဲဆက်ခွဲကပ်ခြင်း"
                  : "Assign & Scan Barcode Serials directly onto Branch On-hand Quantities"}
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

        {/* 1. TOP STATS & BRANCH QUANTITY BREAKDOWN CARDS */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-bold text-slate-800">
                {language === "my"
                  ? "ဆိုင်ခွဲအလိုက် လက်ကျန် Qty နှင့် Serial ကပ်ထားမှု အခြေအနေ (ကလစ်နှိပ်၍ ရွေးပါ):"
                  : "Branch On-Hand Quantities & Serial Allocation Status (Click branch to assign):"}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-600">
                {language === "my" ? "စုစုပေါင်း လက်ကျန်:" : "Total Physical Stock:"}{" "}
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {totalPhysicalOnHand} {uom}
                </span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-800 font-semibold">
                {language === "my" ? "ကပ်ပြီး Serial:" : "Assigned Serials:"}{" "}
                <span className="font-mono font-bold text-blue-900 text-sm">
                  {serials.length} / {totalPhysicalOnHand}
                </span>
              </span>
              <button
                type="button"
                onClick={handleAutoFillAllBranches}
                className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-colors shadow-2xs"
                title="Auto-fill missing serials for all branches up to physical stock"
              >
                <Zap className="w-3 h-3 text-blue-700" />
                <span>{language === "my" ? "ဆိုင်ခွဲအားလုံး Auto-Fill" : "Auto-Fill All"}</span>
              </button>
            </div>
          </div>

          {/* Branch Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {branches.map((b) => {
              const bStock = getBranchStock(b.id);
              const bAssigned = getBranchSerialCount(b.id);
              const bRemaining = bStock - bAssigned;
              const isSelected = activeBranchId === b.id;
              const isBalanced = bAssigned === bStock && bStock > 0;
              const isOver = bAssigned > bStock;
              const isUnder = bAssigned < bStock;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    setActiveBranchId(b.id);
                    setSelectedBranchFilter(b.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300"
                      : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <div className={`font-bold text-xs ${isSelected ? "text-white" : "text-slate-900"}`}>
                        {b.name}
                      </div>
                      <div className={`text-[10px] font-mono ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                        {b.city} • {b.code || b.id}
                      </div>
                    </div>

                    {/* Badge */}
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : isBalanced
                          ? "bg-emerald-100 text-emerald-800"
                          : isOver
                          ? "bg-rose-100 text-rose-800"
                          : isUnder
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isBalanced ? "✅ Balanced" : isOver ? `+${bAssigned - bStock} Over` : `${bRemaining} Missing`}
                    </span>
                  </div>

                  {/* Stock vs Serial Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className={isSelected ? "text-blue-100" : "text-slate-600"}>
                        Stock: <b>{bStock} {uom}</b>
                      </span>
                      <span className={isSelected ? "text-white font-bold" : "text-blue-800 font-bold"}>
                        Serials: {bAssigned}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? "bg-blue-800" : "bg-slate-100"}`}>
                      <div
                        className={`h-full transition-all ${
                          isBalanced
                            ? "bg-emerald-400"
                            : isOver
                            ? "bg-rose-400"
                            : isSelected
                            ? "bg-white"
                            : "bg-blue-600"
                        }`}
                        style={{
                          width: `${Math.min(100, bStock > 0 ? (bAssigned / bStock) * 100 : bAssigned > 0 ? 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Auto Fill Missing button if under */}
                  {bRemaining > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAutoFillBranchSerials(b.id);
                      }}
                      className={`mt-2 w-full py-1 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition-colors ${
                        isSelected
                          ? "bg-white text-blue-800 hover:bg-blue-50"
                          : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                      }`}
                    >
                      <Zap className="w-2.5 h-2.5" />
                      <span>{language === "my" ? `+${bRemaining} Missing Serial Auto-Fill` : `+${bRemaining} Auto-Fill`}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. MODE TABS & SCANNER INPUT FOR SELECTED BRANCH */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-700 mr-1 flex items-center space-x-1">
              <span>{language === "my" ? "လက်ရှိ ဆိုင်ခွဲ:" : "Active Target Branch:"}</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold">
                {activeBranchObj.name} ({activeBranchAssigned}/{activeBranchStock} {uom})
              </span>
            </span>

            <button
              onClick={() => setCreationMode("SCAN")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                creationMode === "SCAN"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>{language === "my" ? "Barcode ဖတ် / ရိုက်ထည့်မည်" : "Barcode Scanner / Rapid Scan"}</span>
            </button>

            <button
              onClick={() => setCreationMode("PASTE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                creationMode === "PASTE"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{language === "my" ? "စာရင်းကူးထည့်မည် (Paste List)" : "Batch Paste Serials"}</span>
            </button>

            <button
              onClick={() => setCreationMode("BULK")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                creationMode === "BULK"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "my" ? "Auto-Generate ထုတ်မည်" : "Sequence Generator"}</span>
            </button>

            <button
              onClick={() => setCreationMode("BATCH")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                creationMode === "BATCH"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === "my" ? "Lot / Batch စီမံမှု" : "Lot Batches"}</span>
            </button>
          </div>

          {activeBranchRemaining > 0 && (
            <button
              type="button"
              onClick={() => handleAutoFillBranchSerials(activeBranchId)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{language === "my" ? `${activeBranchObj.name} အတွက် +${activeBranchRemaining} Auto-Fill` : `Fill ${activeBranchRemaining} Missing`}</span>
            </button>
          )}
        </div>

        {/* 3. INPUT PANELS & TABLES */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 text-xs">
          {/* BARCODE SCANNER / RAPID ENTER MODE */}
          {creationMode === "SCAN" && (
            <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-2xl space-y-3 animate-fade-in shadow-2xs">
              <form onSubmit={handleScanOrAddSerial} className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                  <div className="font-bold text-blue-950 text-xs flex items-center space-x-1.5">
                    <Barcode className="w-4 h-4 text-blue-700" />
                    <span>
                      {language === "my"
                        ? `"${activeBranchObj.name}" ၏ လက်ကျန် Qty (${activeBranchStock} ${uom}) ပေါ်သို့ Barcode ဖတ်၍ ထည့်မည်:`
                        : `Scan Barcode or Type Serial into ${activeBranchObj.name} (Stock: ${activeBranchStock} ${uom}):`}
                    </span>
                  </div>

                  {lastScannedFeedback && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                      {lastScannedFeedback}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-5 h-5 text-blue-600 absolute left-3.5 top-2.5" />
                    <input
                      ref={scanInputRef}
                      type="text"
                      placeholder={
                        language === "my"
                          ? "Barcode Scanner ဖြင့် ဖတ်ပါ သို့မဟုတ် Serial Number ရိုက်ထည့်ပြီး Enter ခေါက်ပါ..."
                          : "Scan barcode with hardware scanner or type serial number and hit Enter..."
                      }
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="w-full bg-white border-2 border-blue-400 focus:border-blue-600 rounded-xl pl-11 pr-4 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none shadow-xs"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 shrink-0 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === "my" ? "Serial ထည့်မည်" : "Assign Serial"}</span>
                  </button>
                </div>

                {/* Optional Metadata Row (Lot, Expiry, Status) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                  <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-blue-200">
                    <span className="text-slate-500 shrink-0">Lot Code:</span>
                    <input
                      type="text"
                      value={scanLotCode}
                      onChange={(e) => setScanLotCode(e.target.value)}
                      className="w-full font-mono text-slate-800 focus:outline-none"
                      placeholder="e.g. LOT-2026-08A"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-blue-200">
                    <span className="text-slate-500 shrink-0">Expiry Date:</span>
                    <input
                      type="date"
                      value={scanExpiryDate}
                      onChange={(e) => setScanExpiryDate(e.target.value)}
                      className="w-full text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-blue-200">
                    <span className="text-slate-500 shrink-0">Status:</span>
                    <select
                      value={scanStatus}
                      onChange={(e) => setScanStatus(e.target.value as any)}
                      className="w-full text-slate-800 font-bold focus:outline-none bg-transparent"
                    >
                      <option value="AVAILABLE">AVAILABLE (ရောင်းချနိုင်)</option>
                      <option value="RESERVED">RESERVED (ကြိုတင်မှာယူ)</option>
                      <option value="SOLD">SOLD (ရောင်းချပြီး)</option>
                      <option value="DEFECTIVE">DEFECTIVE (ချွတ်ယွင်း)</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* BATCH PASTE MODE */}
          {creationMode === "PASTE" && (
            <div className="bg-purple-50/50 border border-purple-200 p-4 rounded-2xl space-y-3 animate-fade-in shadow-2xs">
              <div className="font-bold text-purple-950 text-xs flex items-center space-x-1.5">
                <ClipboardList className="w-4 h-4 text-purple-700" />
                <span>
                  {language === "my"
                    ? `Serial စာရင်းများကို တစ်ကြိမ်တည်း ကူးထည့်ရန် (Target: ${activeBranchObj.name}):`
                    : `Paste Multiple Serial Numbers at Once into ${activeBranchObj.name}:`}
                </span>
              </div>

              <textarea
                rows={4}
                placeholder="Paste list of Serial numbers (one per line, or separated by commas)...&#10;SN-APL-1001&#10;SN-APL-1002&#10;SN-APL-1003"
                value={pasteInputText}
                onChange={(e) => setPasteInputText(e.target.value)}
                className="w-full bg-white border border-purple-300 rounded-xl p-3 text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
              />

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-purple-900">
                  Target Branch: <b>{activeBranchObj.name}</b> (Stock: {activeBranchStock} {uom})
                </span>
                <button
                  type="button"
                  onClick={handleProcessPasteSerials}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === "my" ? "Serial စာရင်း ကပ်ထည့်မည်" : "Process & Assign Serials"}</span>
                </button>
              </div>
            </div>
          )}

          {/* BULK GENERATOR MODE */}
          {creationMode === "BULK" && (
            <div className="bg-indigo-50/50 border border-indigo-200 p-4 rounded-2xl space-y-3 animate-fade-in shadow-2xs">
              <div className="font-bold text-indigo-950 text-xs flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-indigo-700" />
                <span>
                  {language === "my"
                    ? `Serial နံပါတ်များကို ကိန်းစဉ်အလိုက် ထုတ်ပေးရန် (Target: ${activeBranchObj.name}):`
                    : `Auto-Generate Sequential Serials for ${activeBranchObj.name}:`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Prefix</label>
                  <input
                    type="text"
                    value={bulkPrefix}
                    onChange={(e) => setBulkPrefix(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Start Number</label>
                  <input
                    type="number"
                    value={bulkStartNum}
                    onChange={(e) => setBulkStartNum(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Count to Generate</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Lot Code</label>
                  <input
                    type="text"
                    value={bulkLot}
                    onChange={(e) => setBulkLot(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-indigo-900">
                  Will generate: <b>{bulkPrefix}{bulkStartNum}</b> to{" "}
                  <b>{bulkPrefix}{bulkStartNum + bulkCount - 1}</b> ({bulkCount} units)
                </span>
                <button
                  type="button"
                  onClick={handleGenerateBulkSerials}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {bulkCount} Serials</span>
                </button>
              </div>
            </div>
          )}

          {/* LOT BATCH MODE */}
          {creationMode === "BATCH" && (
            <div className="space-y-3 animate-fade-in">
              <form onSubmit={handleAddBatch} className="bg-emerald-50/40 border border-emerald-200 p-4 rounded-2xl space-y-3">
                <div className="font-bold text-emerald-950 text-xs flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === "my" ? "Lot / Batch အသစ်စာရင်းသွင်းရန်" : "Register Lot / Batch with Expiry"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-1">Batch / Lot Number *</label>
                    <input
                      type="text"
                      required
                      value={batchNumInput}
                      onChange={(e) => setBatchNumInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-1">Quantity ({uom}) *</label>
                    <input
                      type="number"
                      min={1}
                      value={batchQtyInput}
                      onChange={(e) => setBatchQtyInput(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-1">Assigned Branch</label>
                    <select
                      value={batchBranchInput}
                      onChange={(e) => setBatchBranchInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-1">Batch Expiration Date</label>
                    <input
                      type="date"
                      value={batchExpiryInput}
                      onChange={(e) => setBatchExpiryInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Batch Record</span>
                  </button>
                </div>
              </form>

              {/* Batches Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Batch / Lot #</th>
                      <th className="px-4 py-2.5">Branch</th>
                      <th className="px-4 py-2.5">Quantity</th>
                      <th className="px-4 py-2.5">Expiry Date</th>
                      <th className="px-4 py-2.5">Shelf Life Status</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {batches.map((b, bIdx) => {
                      const expStatus = getExpiryStatus(b.expiryDate);
                      return (
                        <tr key={bIdx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{b.batchNumber}</td>
                          <td className="px-4 py-3 text-slate-600">{b.branchName || b.branchId}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            {b.quantity} {uom}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700">{b.expiryDate}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${expStatus.color}`}>
                              {expStatus.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setBatches((prev) => prev.filter((_, i) => i !== bIdx))}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SERIALS LIST & ADVANCED SEARCH TABLE */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <Barcode className="w-4 h-4 text-blue-600" />
                <span>
                  {language === "my" ? "တွဲဆက်ထားသော Serial စာရင်းများ" : "Assigned Serial Inventory"} (
                  {filteredSerials.length} of {serials.length})
                </span>
                {selectedBranchFilter !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => handleClearBranchSerials(selectedBranchFilter)}
                    className="text-[10px] text-rose-600 hover:text-rose-800 ml-2 font-semibold"
                  >
                    [Clear branch serials]
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search Serial / Lot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                >
                  <option value="ALL">All Branches ({serials.length})</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({getBranchSerialCount(b.id)}/{getBranchStock(b.id)})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="SOLD">SOLD</option>
                  <option value="DEFECTIVE">DEFECTIVE</option>
                  <option value="RESERVED">RESERVED</option>
                </select>
              </div>
            </div>

            {/* Serials Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              {filteredSerials.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No serials matching current filters. Use the Barcode Scanner input above or click &apos;Auto-Fill&apos; to register serials.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-3.5 py-2.5">#</th>
                        <th className="px-3.5 py-2.5">Serial / IMEI</th>
                        <th className="px-3.5 py-2.5">Assigned Branch</th>
                        <th className="px-3.5 py-2.5">Lot / Batch</th>
                        <th className="px-3.5 py-2.5">Expiry Date</th>
                        <th className="px-3.5 py-2.5">Status</th>
                        <th className="px-3.5 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredSerials.map((s, idx) => {
                        const originalIndex = serials.findIndex((item) => item.serial === s.serial);
                        const expStatus = getExpiryStatus(s.expiryDate);

                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3.5 py-2.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                            <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 flex items-center space-x-1.5">
                              <Barcode className="w-3.5 h-3.5 text-blue-600" />
                              <span>{s.serial}</span>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <select
                                value={s.branchId}
                                onChange={(e) => handleUpdateSerialBranch(originalIndex, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none"
                              >
                                {branches.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-slate-500">{s.lotNumber || "-"}</td>
                            <td className="px-3.5 py-2.5 font-mono">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-slate-700">{s.expiryDate || "N/A"}</span>
                                {s.expiryDate && (
                                  <span className={`px-1.5 py-0.2 text-[9px] rounded-md border font-bold ${expStatus.color}`}>
                                    {expStatus.label}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <select
                                value={s.status}
                                onChange={(e) => handleUpdateSerialStatus(originalIndex, e.target.value as any)}
                                className={`rounded-lg px-2 py-1 text-[11px] font-bold border focus:outline-none ${
                                  s.status === "AVAILABLE"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : s.status === "SOLD"
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
                            <td className="px-3.5 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveSerial(originalIndex)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                title="Remove Serial"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Total Assigned Serials: <span className="font-bold text-slate-900">{serials.length}</span> • Physical Stock:{" "}
            <span className="font-bold text-blue-900">{totalPhysicalOnHand} {uom}</span> (
            <span className={serials.length === totalPhysicalOnHand ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
              {serials.length === totalPhysicalOnHand ? "✅ Fully Matched" : `${Math.abs(totalPhysicalOnHand - serials.length)} Difference`}
            </span>
            )
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors text-xs"
            >
              {language === "my" ? "ပိတ်မည်" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => handleSaveAndClose(false)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 transition-colors text-xs"
            >
              <Check className="w-4 h-4" />
              <span>{language === "my" ? "Serial များ သိမ်းဆည်းမည်" : "Save Serial Allocations"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveAndClose(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 transition-colors text-xs"
              title="Save serials and automatically update branch physical stock counts from serial quantities"
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
