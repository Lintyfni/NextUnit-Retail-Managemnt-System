import React, { useState } from "react";
import { Product, Branch, SerialItem, BatchItem } from "../../types";
import {
  X,
  Plus,
  Trash2,
  ShieldCheck,
  Calendar,
  Building,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Barcode,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Check,
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

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Mode: Single Add vs Bulk Generator
  const [creationMode, setCreationMode] = useState<"SINGLE" | "BULK" | "BATCH">("SINGLE");

  // Single Serial Inputs
  const [serialInput, setSerialInput] = useState("");
  const [branchInput, setBranchInput] = useState(branches[0]?.id || "");
  const [lotInput, setLotInput] = useState("LOT-2026-08A");
  const [mfgDateInput, setMfgDateInput] = useState("2026-05-10");
  const [expiryDateInput, setExpiryDateInput] = useState("2027-12-31");
  const [statusInput, setStatusInput] = useState<"AVAILABLE" | "SOLD" | "DEFECTIVE" | "RESERVED">("AVAILABLE");

  // Bulk Serial Generator Inputs
  const [bulkPrefix, setBulkPrefix] = useState(`SN-${product.brand?.toUpperCase().slice(0, 3) || "GEN"}-`);
  const [bulkStartNum, setBulkStartNum] = useState(1001);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkBranch, setBulkBranch] = useState(branches[0]?.id || "");
  const [bulkLot, setBulkLot] = useState("LOT-2026-08A");
  const [bulkExpiry, setBulkExpiry] = useState("2027-12-31");

  // New Batch/Lot Input
  const [batchNumInput, setBatchNumInput] = useState("LOT-2026-09B");
  const [batchQtyInput, setBatchQtyInput] = useState(10);
  const [batchBranchInput, setBatchBranchInput] = useState(branches[0]?.id || "");
  const [batchExpiryInput, setBatchExpiryInput] = useState("2028-06-30");
  const [batchNotesInput, setBatchNotesInput] = useState("");

  // Calculations
  const now = new Date();
  const getExpiryStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { status: "NO_EXPIRY", label: "No Expiry", color: "bg-slate-100 text-slate-700" };
    const exp = new Date(expiryDateStr);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { status: "EXPIRED", label: `Expired (${Math.abs(diffDays)}d ago)`, color: "bg-rose-100 text-rose-800 border-rose-300" };
    } else if (diffDays <= 60) {
      return { status: "NEAR_EXPIRY", label: `Expires soon (${diffDays}d left)`, color: "bg-amber-100 text-amber-800 border-amber-300" };
    }
    return { status: "VALID", label: `Valid (${diffDays}d left)`, color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  // Add Single Serial
  const handleAddSingleSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim()) return;
    const bObj = branches.find((b) => b.id === branchInput);
    const newItem: SerialItem = {
      serial: serialInput.trim(),
      branchId: branchInput,
      branchName: bObj?.name || branchInput,
      status: statusInput,
      lotNumber: lotInput.trim() || undefined,
      mfgDate: mfgDateInput || undefined,
      expiryDate: expiryDateInput || undefined,
      createdAt: new Date().toISOString(),
    };
    setSerials((prev) => [newItem, ...prev]);
    setSerialInput("");
  };

  // Generate Bulk Serials
  const handleGenerateBulkSerials = () => {
    const bObj = branches.find((b) => b.id === bulkBranch);
    const newItems: SerialItem[] = [];
    for (let i = 0; i < bulkCount; i++) {
      const sNum = `${bulkPrefix}${bulkStartNum + i}`;
      newItems.push({
        serial: sNum,
        branchId: bulkBranch,
        branchName: bObj?.name || bulkBranch,
        status: "AVAILABLE",
        lotNumber: bulkLot.trim() || undefined,
        expiryDate: bulkExpiry || undefined,
        createdAt: new Date().toISOString(),
      });
    }
    setSerials((prev) => [...newItems, ...prev]);
    setBulkStartNum((prev) => prev + bulkCount);
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

  const handleUpdateSerialBranch = (index: number, newBranchId: string) => {
    const bObj = branches.find((b) => b.id === newBranchId);
    setSerials((prev) =>
      prev.map((s, idx) =>
        idx === index ? { ...s, branchId: newBranchId, branchName: bObj?.name || newBranchId } : s
      )
    );
  };

  const handleUpdateSerialStatus = (index: number, newStatus: "AVAILABLE" | "SOLD" | "DEFECTIVE" | "RESERVED") => {
    setSerials((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status: newStatus } : s))
    );
  };

  const handleSaveAndClose = () => {
    const updated: Product = {
      ...product,
      hasIMEI: true,
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

  const totalOnHand = Object.values(product.branchStock || {}).reduce<number>((a, b) => a + Number(b || 0), 0);
  const availableSerialsCount = serials.filter((s) => s.status === "AVAILABLE").length;
  const expiredCount = serials.filter((s) => getExpiryStatus(s.expiryDate).status === "EXPIRED").length;
  const nearExpiryCount = serials.filter((s) => getExpiryStatus(s.expiryDate).status === "NEAR_EXPIRY").length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full text-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
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
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                  UOM: {product.uom || "Pcs"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === "my"
                  ? "လက်ကျန် Qty တွင် Serial & Expired Code များကို သီးခြားခွဲပီး ကပ်ခြင်းနှင့် စီမံခန့်ခွဲခြင်း"
                  : "Allocate and manage individual Serial Numbers, Lot Codes, and Expiry Dates on On-hand Inventory"}
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

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-white border-b border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 font-semibold">Total Physical On-Hand</div>
            <div className="text-base font-mono font-bold text-slate-900">
              {totalOnHand} {product.uom || "Pcs"}
            </div>
          </div>
          <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200">
            <div className="text-[10px] text-blue-700 font-semibold">Allocated Available Serials</div>
            <div className="text-base font-mono font-bold text-blue-900">
              {availableSerialsCount} / {serials.length}
            </div>
          </div>
          <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
            <div className="text-[10px] text-amber-700 font-semibold">Expiring Soon (≤ 60d)</div>
            <div className="text-base font-mono font-bold text-amber-900">{nearExpiryCount} items</div>
          </div>
          <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200">
            <div className="text-[10px] text-rose-700 font-semibold">Expired Serial/Lots</div>
            <div className="text-base font-mono font-bold text-rose-900">{expiredCount} items</div>
          </div>
        </div>

        {/* Action Tabs & Sub-header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-100 bg-white">
          <div className="flex space-x-1">
            <button
              onClick={() => setCreationMode("SINGLE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                creationMode === "SINGLE"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {language === "my" ? "+ Serial တစ်ခုချင်း ထည့်မည်" : "+ Single Serial Add"}
            </button>
            <button
              onClick={() => setCreationMode("BULK")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                creationMode === "BULK"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "my" ? "Serial များ အစုလိုက်ထုတ်မည်" : "Bulk Serial Generator"}</span>
            </button>
            <button
              onClick={() => setCreationMode("BATCH")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                creationMode === "BATCH"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === "my" ? "Lot / Batch သက်တမ်း စီမံမှု" : "Lot / Batch Expiry Breakdown"}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 text-xs">
          {/* CREATION FORM PANELS */}
          {creationMode === "SINGLE" && (
            <form
              onSubmit={handleAddSingleSerial}
              className="bg-blue-50/40 border border-blue-200 p-4 rounded-2xl space-y-3 animate-fade-in"
            >
              <div className="font-bold text-blue-950 text-xs flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-700" />
                <span>{language === "my" ? "Serial & သက်တမ်းကုန်ရက် အသစ်ကပ်ရန်" : "Allocate New Serial & Expiry"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Serial / IMEI Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 359876123456789"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Assign to Branch *</label>
                  <select
                    value={branchInput}
                    onChange={(e) => setBranchInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Lot / Batch Code</label>
                  <input
                    type="text"
                    placeholder="e.g. LOT-2026-08A"
                    value={lotInput}
                    onChange={(e) => setLotInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Expiration Date (သက်တမ်းကုန်ရက်)</label>
                  <input
                    type="date"
                    value={expiryDateInput}
                    onChange={(e) => setExpiryDateInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    value={mfgDateInput}
                    onChange={(e) => setMfgDateInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="AVAILABLE">AVAILABLE (ရောင်းချနိုင်သည်)</option>
                    <option value="RESERVED">RESERVED (ကြိုတင်မှာယူထား)</option>
                    <option value="SOLD">SOLD (ရောင်းချပြီး)</option>
                    <option value="DEFECTIVE">DEFECTIVE (ချွတ်ယွင်းချက်ရှိ)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === "my" ? "Serial ကပ်ထည့်မည်" : "Assign Serial"}</span>
                </button>
              </div>
            </form>
          )}

          {creationMode === "BULK" && (
            <div className="bg-purple-50/40 border border-purple-200 p-4 rounded-2xl space-y-3 animate-fade-in">
              <div className="font-bold text-purple-950 text-xs flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>
                  {language === "my"
                    ? "Serial နံပါတ်များကို ကိန်းစဉ်အလိုက် အများအပြား ထုတ်ပေးရန်"
                    : "Auto-Generate Sequential Serials with Lot/Expiry"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Prefix</label>
                  <input
                    type="text"
                    value={bulkPrefix}
                    onChange={(e) => setBulkPrefix(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Starting Number</label>
                  <input
                    type="number"
                    value={bulkStartNum}
                    onChange={(e) => setBulkStartNum(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Quantity to Generate</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Target Branch</label>
                  <select
                    value={bulkBranch}
                    onChange={(e) => setBulkBranch(e.target.value)}
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
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Lot / Batch Code</label>
                  <input
                    type="text"
                    value={bulkLot}
                    onChange={(e) => setBulkLot(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={bulkExpiry}
                    onChange={(e) => setBulkExpiry(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-purple-900">
                  Will generate: <code className="font-bold">{bulkPrefix}{bulkStartNum}</code> to{" "}
                  <code className="font-bold">{bulkPrefix}{bulkStartNum + bulkCount - 1}</code> ({bulkCount} units)
                </span>
                <button
                  type="button"
                  onClick={handleGenerateBulkSerials}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate & Allocate {bulkCount} Serials</span>
                </button>
              </div>
            </div>
          )}

          {creationMode === "BATCH" && (
            <div className="space-y-3 animate-fade-in">
              {/* Add Batch Form */}
              <form
                onSubmit={handleAddBatch}
                className="bg-emerald-50/40 border border-emerald-200 p-4 rounded-2xl space-y-3"
              >
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
                    <label className="text-[10px] font-semibold text-slate-700 block mb-1">Quantity ({product.uom || "Pcs"}) *</label>
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
                            {b.quantity} {product.uom || "Pcs"}
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

          {/* SERIALS LIST & FILTERS */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <Barcode className="w-4 h-4 text-slate-600" />
                <span>
                  {language === "my" ? "လက်ကျန် Serial စာရင်းများ" : "On-Hand Serial & Expiry Inventory"} (
                  {filteredSerials.length} of {serials.length})
                </span>
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
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
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
                  No serials matching current filters. Click &apos;+ Single Serial Add&apos; or &apos;Bulk Serial Generator&apos; to register serials.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200 sticky top-0">
                      <tr>
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
                            <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 flex items-center space-x-1.5">
                              <Barcode className="w-3.5 h-3.5 text-slate-400" />
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Total Serials: <span className="font-bold text-slate-900">{serials.length}</span> • Available:{" "}
            <span className="font-bold text-emerald-700">{availableSerialsCount}</span>
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
              onClick={handleSaveAndClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 transition-colors text-xs"
            >
              <Check className="w-4 h-4" />
              <span>{language === "my" ? "Serial & Expired အပြောင်းအလဲများ သိမ်းမည်" : "Save Serial Allocations"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
