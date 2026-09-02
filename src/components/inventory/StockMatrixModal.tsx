import React, { useState } from "react";
import { Product, Branch, StockMatrixConfig } from "../../types";
import {
  X,
  Plus,
  Trash2,
  Grid,
  Palette,
  Building,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  Copy,
  AlertCircle,
  RotateCcw,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
} from "lucide-react";

interface StockMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  branches: Branch[];
  onUpdateProduct: (updatedProduct: Product) => void;
  language: string;
}

const PRESET_COLOR_PALETTES = [
  { name: "Tech Titanium", colors: ["Natural Titanium", "Black Titanium", "White Titanium", "Desert Titanium"] },
  { name: "Classic Monochrome", colors: ["Space Black", "Silver", "Midnight", "Starlight"] },
  { name: "Vibrant Lifestyle", colors: ["Deep Purple", "Pacific Blue", "Forest Green", "Rose Gold"] },
  { name: "Apparel Basics", colors: ["Black", "White", "Navy Blue", "Heather Gray", "Olive"] },
];

const PRESET_SIZES = [
  { name: "Phone Storage", sizes: ["128GB", "256GB", "512GB", "1TB"] },
  { name: "RAM / SSD Specs", sizes: ["16GB / 512GB", "18GB / 512GB", "36GB / 1TB", "64GB / 2TB"] },
  { name: "Clothing Sizes", sizes: ["XS", "S", "M", "L", "XL", "2XL"] },
  { name: "General Hardware", sizes: ["Standard", "Plus", "Max", "Ultra"] },
];

export const StockMatrixModal: React.FC<StockMatrixModalProps> = ({
  isOpen,
  onClose,
  product,
  branches,
  onUpdateProduct,
  language,
}) => {
  if (!isOpen) return null;

  const existingConfig = product.stockMatrix || {
    enabled: true,
    colors: ["Black", "Silver", "Blue"],
    sizes: ["128GB", "256GB", "512GB"],
    matrix: {},
  };

  const [colors, setColors] = useState<string[]>(
    existingConfig.colors && existingConfig.colors.length > 0
      ? existingConfig.colors
      : ["Black", "Silver"]
  );
  const [sizes, setSizes] = useState<string[]>(
    existingConfig.sizes && existingConfig.sizes.length > 0
      ? existingConfig.sizes
      : ["128GB", "256GB"]
  );
  const [matrix, setMatrix] = useState<Record<string, number>>(existingConfig.matrix || {});

  // Active Selected Branch for Matrix allocation
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || "");

  // View Mode: Active Branch Grid vs All-Branches Consolidated Matrix
  const [viewMode, setViewMode] = useState<"BRANCH_GRID" | "CONSOLIDATED">("BRANCH_GRID");

  // New attribute input fields
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");

  const uom = product.uom || "Pcs";
  const branchStockMap = product.branchStock || {};
  const totalPhysicalOnHand = Object.values(branchStockMap).reduce<number>((a, b) => a + Number(b || 0), 0);

  // Helper calculation for branch matrix total
  const getBranchMatrixTotal = (bId: string) => {
    let sum = 0;
    colors.forEach((c) => {
      sizes.forEach((s) => {
        const key = `${c}__${s}__${bId}`;
        sum += Number(matrix[key] || 0);
      });
    });
    return sum;
  };

  // Grand total allocated across all branches
  const getTotalMatrixAllocated = () => {
    let sum = 0;
    branches.forEach((b) => {
      sum += getBranchMatrixTotal(b.id);
    });
    return sum;
  };

  // Current active branch metrics
  const activeBranchObj = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const activeBranchPhysicalStock = Number(branchStockMap[selectedBranchId] || 0);
  const activeBranchMatrixTotal = getBranchMatrixTotal(selectedBranchId);
  const activeBranchDiff = activeBranchPhysicalStock - activeBranchMatrixTotal;

  // Add Color
  const handleAddColor = () => {
    if (!newColor.trim()) return;
    const c = newColor.trim();
    if (!colors.includes(c)) {
      setColors([...colors, c]);
    }
    setNewColor("");
  };

  const handleRemoveColor = (col: string) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((c) => c !== col));
  };

  // Add Size
  const handleAddSize = () => {
    if (!newSize.trim()) return;
    const s = newSize.trim();
    if (!sizes.includes(s)) {
      setSizes([...sizes, s]);
    }
    setNewSize("");
  };

  const handleRemoveSize = (sz: string) => {
    if (sizes.length <= 1) return;
    setSizes(sizes.filter((s) => s !== sz));
  };

  // Presets
  const handleApplyPalette = (paletteColors: string[]) => {
    setColors(paletteColors);
  };

  const handleApplySizes = (presetSizes: string[]) => {
    setSizes(presetSizes);
  };

  // Cell change
  const handleCellChange = (color: string, size: string, branchId: string, val: number) => {
    const key = `${color}__${size}__${branchId}`;
    setMatrix((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  // 1-Click Distribute Active Branch Stock Evenly across Color x Size combinations
  const handleDistributeEvenly = (bId: string) => {
    const targetStock = Number(branchStockMap[bId] || 0);
    if (targetStock <= 0 || colors.length === 0 || sizes.length === 0) return;

    const totalCells = colors.length * sizes.length;
    const basePerCell = Math.floor(targetStock / totalCells);
    let remainder = targetStock % totalCells;

    const updated = { ...matrix };
    colors.forEach((c) => {
      sizes.forEach((s) => {
        const key = `${c}__${s}__${bId}`;
        const extra = remainder > 0 ? 1 : 0;
        updated[key] = basePerCell + extra;
        if (remainder > 0) remainder--;
      });
    });

    setMatrix(updated);
  };

  // 1-Click Auto-Fill Remaining Difference into the first/selected cell
  const handleAutoFillRemaining = (bId: string) => {
    const targetStock = Number(branchStockMap[bId] || 0);
    const currentSum = getBranchMatrixTotal(bId);
    const diff = targetStock - currentSum;
    if (diff <= 0 || colors.length === 0 || sizes.length === 0) return;

    const firstKey = `${colors[0]}__${sizes[0]}__${bId}`;
    setMatrix((prev) => ({
      ...prev,
      [firstKey]: (prev[firstKey] || 0) + diff,
    }));
  };

  // Copy matrix allocation from another branch
  const handleCopyMatrixFromBranch = (fromBranchId: string, toBranchId: string) => {
    if (fromBranchId === toBranchId) return;
    const updated = { ...matrix };
    colors.forEach((c) => {
      sizes.forEach((s) => {
        const srcKey = `${c}__${s}__${fromBranchId}`;
        const dstKey = `${c}__${s}__${toBranchId}`;
        updated[dstKey] = updated[srcKey] || 0;
      });
    });
    setMatrix(updated);
  };

  // Reset active branch matrix cells
  const handleResetBranchMatrix = (bId: string) => {
    const updated = { ...matrix };
    colors.forEach((c) => {
      sizes.forEach((s) => {
        const key = `${c}__${s}__${bId}`;
        updated[key] = 0;
      });
    });
    setMatrix(updated);
  };

  // Save changes
  const handleSave = (syncToBranchStock: boolean = false) => {
    const newConfig: StockMatrixConfig = {
      enabled: true,
      colors,
      sizes,
      matrix,
    };

    let updatedBranchStock = { ...(product.branchStock || {}) };
    if (syncToBranchStock) {
      branches.forEach((b) => {
        const bTotal = getBranchMatrixTotal(b.id);
        if (bTotal > 0) {
          updatedBranchStock[b.id] = bTotal;
        }
      });
    }

    const updatedProduct: Product = {
      ...product,
      branchStock: updatedBranchStock,
      stockMatrix: newConfig,
    };

    onUpdateProduct(updatedProduct);
    onClose();
  };

  const totalMatrixAllocated = getTotalMatrixAllocated();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full text-slate-800 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">{product.name}</h2>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono text-[11px] font-bold">
                  {product.sku}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px] font-bold">
                  UOM: {uom}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === "my"
                  ? "Yangon, MDY စသည့် ဆိုင်ခွဲအလိုက် လက်ကျန် Qty ပေါ်တွင် Color x Size Matrix ဇယားကွက်ဖြင့် ခွဲဝေကပ်ခြင်း"
                  : "Allocate & balance Color x Size Stock Matrix variants across Branch on-hand inventory"}
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
              <Building className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-bold text-slate-800">
                {language === "my"
                  ? "ဆိုင်ခွဲအလိုက် လက်ကျန် Qty နှင့် Matrix တွဲဆက်မှု (ကလစ်နှိပ်၍ ရွေးပါ):"
                  : "Branch Stock & Matrix Allocation Status (Click branch to allocate):"}
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
              <span className="text-purple-800 font-semibold">
                {language === "my" ? "Matrix တွင် ခွဲပြီး:" : "Matrix Allocated:"}{" "}
                <span className="font-mono font-bold text-purple-900 text-sm">
                  {totalMatrixAllocated} / {totalPhysicalOnHand} {uom}
                </span>
              </span>
            </div>
          </div>

          {/* Branch Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {branches.map((b) => {
              const bStock = Number(branchStockMap[b.id] || 0);
              const bMatrixSum = getBranchMatrixTotal(b.id);
              const bDiff = bStock - bMatrixSum;
              const isSelected = selectedBranchId === b.id;
              const isBalanced = bMatrixSum === bStock && bStock > 0;
              const isOver = bMatrixSum > bStock;
              const isUnder = bMatrixSum < bStock;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-purple-700 text-white border-purple-800 shadow-md ring-2 ring-purple-300"
                      : "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <div className={`font-bold text-xs ${isSelected ? "text-white" : "text-slate-900"}`}>
                        {b.name}
                      </div>
                      <div className={`text-[10px] font-mono ${isSelected ? "text-purple-200" : "text-slate-500"}`}>
                        {b.city} • {b.code || b.id}
                      </div>
                    </div>

                    {/* Status Badge */}
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
                      {isBalanced ? "✅ Balanced" : isOver ? `+${bMatrixSum - bStock} Over` : `${bDiff} Missing`}
                    </span>
                  </div>

                  {/* Stock vs Matrix Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className={isSelected ? "text-purple-100" : "text-slate-600"}>
                        Stock: <b>{bStock} {uom}</b>
                      </span>
                      <span className={isSelected ? "text-white font-bold" : "text-purple-900 font-bold"}>
                        Matrix: {bMatrixSum}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? "bg-purple-900" : "bg-slate-100"}`}>
                      <div
                        className={`h-full transition-all ${
                          isBalanced
                            ? "bg-emerald-400"
                            : isOver
                            ? "bg-rose-400"
                            : isSelected
                            ? "bg-white"
                            : "bg-purple-600"
                        }`}
                        style={{
                          width: `${Math.min(100, bStock > 0 ? (bMatrixSum / bStock) * 100 : bMatrixSum > 0 ? 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Auto Balance Helper */}
                  {bDiff > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDistributeEvenly(b.id);
                      }}
                      className={`mt-2 w-full py-1 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition-colors ${
                        isSelected
                          ? "bg-white text-purple-800 hover:bg-purple-50"
                          : "bg-purple-50 hover:bg-purple-100 text-purple-700"
                      }`}
                    >
                      <Zap className="w-2.5 h-2.5" />
                      <span>{language === "my" ? `+${bDiff} လက်ကျန် ညှိဖြန့်ခွဲမည်` : `Distribute +${bDiff} Units`}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. ATTRIBUTES BUILDER & VIEW TOGGLES */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 mr-1 flex items-center space-x-1">
              <span>{language === "my" ? "လက်ရှိ ဆိုင်ခွဲ:" : "Active Branch Matrix:"}</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold">
                {activeBranchObj.name} ({activeBranchMatrixTotal}/{activeBranchPhysicalStock} {uom})
              </span>
            </span>

            <button
              onClick={() => setViewMode("BRANCH_GRID")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "BRANCH_GRID"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {language === "my" ? "ဆိုင်ခွဲအလိုက် Matrix ဇယား" : "Branch 2D Matrix"}
            </button>

            <button
              onClick={() => setViewMode("CONSOLIDATED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                viewMode === "CONSOLIDATED"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === "my" ? "ဆိုင်ခွဲအားလုံး ပေါင်းစုဇယား" : "All Branches Summary"}</span>
            </button>
          </div>

          {/* Quick Helper Actions for Selected Branch */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => handleDistributeEvenly(selectedBranchId)}
              className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-colors"
              title="Distribute this branch's stock evenly among all variant cells"
            >
              <Zap className="w-3 h-3 text-purple-700" />
              <span>{language === "my" ? "ညီမျှစွာ ဖြန့်ခွဲမည်" : "Distribute Evenly"}</span>
            </button>

            {activeBranchDiff > 0 && (
              <button
                type="button"
                onClick={() => handleAutoFillRemaining(selectedBranchId)}
                className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-colors"
                title="Fill remaining difference into the matrix"
              >
                <Check className="w-3 h-3 text-emerald-700" />
                <span>{language === "my" ? `+${activeBranchDiff} ဖြည့်မည်` : `Fill +${activeBranchDiff}`}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleResetBranchMatrix(selectedBranchId)}
              className="px-2 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Reset this branch matrix cells to 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. BODY CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 text-xs">
          {/* Attributes configuration row (Colors & Sizes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colors Card */}
            <div className="bg-purple-50/50 border border-purple-200 p-4 rounded-2xl space-y-2.5 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-950 text-xs flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-700" />
                  <span>{language === "my" ? "အရောင်များ (Color Rows)" : "Color Attributes (Rows)"}</span>
                </span>
                <span className="text-[10px] text-purple-700 font-semibold">{colors.length} configured</span>
              </div>

              {/* Add color */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Space Black, Titanium Gray"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
                  className="flex-1 bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold"
                >
                  + Add Color
                </button>
              </div>

              {/* Color chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {colors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-purple-300 text-purple-900 rounded-lg font-bold text-xs shadow-2xs"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span>{c}</span>
                    {colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(c)}
                        className="text-purple-400 hover:text-rose-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Quick Presets */}
              <div className="pt-1 flex flex-wrap items-center gap-1 text-[10px] text-purple-900">
                <span className="font-semibold text-purple-700">Presets:</span>
                {PRESET_COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => handleApplyPalette(pal.colors)}
                    className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 rounded text-[10px] font-semibold transition-colors"
                  >
                    {pal.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes / Specs Card */}
            <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-2xl space-y-2.5 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-950 text-xs flex items-center space-x-1.5">
                  <Grid className="w-3.5 h-3.5 text-blue-700" />
                  <span>{language === "my" ? "အရွယ်အစား / စပက်များ (Size Columns)" : "Size / Spec Attributes (Columns)"}</span>
                </span>
                <span className="text-[10px] text-blue-700 font-semibold">{sizes.length} configured</span>
              </div>

              {/* Add size */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. 128GB, 256GB, 512GB or M, L, XL"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                  className="flex-1 bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  + Add Size
                </button>
              </div>

              {/* Size chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-blue-300 text-blue-900 rounded-lg font-bold text-xs shadow-2xs"
                  >
                    <span>{s}</span>
                    {sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(s)}
                        className="text-blue-400 hover:text-rose-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Quick Presets */}
              <div className="pt-1 flex flex-wrap items-center gap-1 text-[10px] text-blue-900">
                <span className="font-semibold text-blue-700">Presets:</span>
                {PRESET_SIZES.map((psz) => (
                  <button
                    key={psz.name}
                    type="button"
                    onClick={() => handleApplySizes(psz.sizes)}
                    className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 rounded text-[10px] font-semibold transition-colors"
                  >
                    {psz.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VIEW 1: ACTIVE BRANCH 2D MATRIX GRID */}
          {viewMode === "BRANCH_GRID" && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs animate-fade-in">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Matrix Distribution Grid — {activeBranchObj.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                        activeBranchDiff === 0
                          ? "bg-emerald-100 text-emerald-800"
                          : activeBranchDiff > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {activeBranchDiff === 0
                        ? "✅ 100% Balanced"
                        : activeBranchDiff > 0
                        ? `${activeBranchDiff} ${uom} Unallocated`
                        : `${Math.abs(activeBranchDiff)} ${uom} Over-allocated`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Type quantity in each cell. Totals sum horizontally by Color and vertically by Size.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-600">
                    Branch Stock:{" "}
                    <span className="font-mono font-bold text-slate-900">
                      {activeBranchPhysicalStock} {uom}
                    </span>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-purple-900 font-semibold">
                    Matrix Sum:{" "}
                    <span className="font-mono font-bold text-purple-900 text-sm">
                      {activeBranchMatrixTotal} {uom}
                    </span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar p-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-2.5 font-bold text-slate-700 bg-slate-50 rounded-tl-xl">
                        Color (Row) \ Size (Col)
                      </th>
                      {sizes.map((sz) => {
                        let colSum = 0;
                        colors.forEach((c) => {
                          const key = `${c}__${sz}__${selectedBranchId}`;
                          colSum += Number(matrix[key] || 0);
                        });

                        return (
                          <th key={sz} className="p-2.5 text-center bg-slate-50">
                            <div className="font-bold text-slate-900">{sz}</div>
                            <div className="text-[10px] font-mono text-slate-500 font-semibold">
                              {colSum} {uom}
                            </div>
                          </th>
                        );
                      })}
                      <th className="p-2.5 text-right font-bold text-purple-900 bg-slate-50 rounded-tr-xl">
                        Color Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {colors.map((color) => {
                      let rowSum = 0;
                      return (
                        <tr key={color} className="hover:bg-purple-50/30 transition-colors">
                          <td className="p-2.5 font-bold text-slate-900">
                            <div className="flex items-center space-x-2">
                              <span className="w-3 h-3 rounded-full bg-purple-600 shadow-2xs"></span>
                              <span>{color}</span>
                            </div>
                          </td>

                          {sizes.map((sz) => {
                            const key = `${color}__${sz}__${selectedBranchId}`;
                            const cellQty = matrix[key] || 0;
                            rowSum += cellQty;

                            return (
                              <td key={sz} className="p-2 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  value={cellQty}
                                  onChange={(e) =>
                                    handleCellChange(
                                      color,
                                      sz,
                                      selectedBranchId,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-20 text-center bg-slate-50 border border-slate-300 rounded-xl py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                                />
                              </td>
                            );
                          })}

                          <td className="p-2.5 text-right font-mono font-bold text-purple-900 text-xs">
                            {rowSum} {uom}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                      <td className="p-2.5 text-slate-900">Branch Subtotal:</td>
                      {sizes.map((sz) => {
                        let colSum = 0;
                        colors.forEach((c) => {
                          const key = `${c}__${sz}__${selectedBranchId}`;
                          colSum += Number(matrix[key] || 0);
                        });
                        return (
                          <td key={sz} className="p-2.5 text-center font-mono text-slate-900">
                            {colSum}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-right font-mono text-purple-900 text-sm">
                        {activeBranchMatrixTotal} {uom}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: ALL BRANCHES CONSOLIDATED SUMMARY TABLE */}
          {viewMode === "CONSOLIDATED" && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs animate-fade-in">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 text-xs">
                    All Branches Consolidated Matrix Overview
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Grand totals of each variant color/size combination across all store locations
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-purple-900">
                    Grand Total: {totalMatrixAllocated} {uom}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar p-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-2.5 font-bold text-slate-700 bg-slate-50">Color \ Size</th>
                      {sizes.map((sz) => (
                        <th key={sz} className="p-2.5 text-center font-bold text-slate-900 bg-slate-50">
                          {sz}
                        </th>
                      ))}
                      <th className="p-2.5 text-right font-bold text-purple-900 bg-slate-50">
                        Combined Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {colors.map((color) => {
                      let colorGrandSum = 0;
                      return (
                        <tr key={color} className="hover:bg-purple-50/20">
                          <td className="p-2.5 font-bold text-slate-900 flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                            <span>{color}</span>
                          </td>
                          {sizes.map((sz) => {
                            let variantSum = 0;
                            branches.forEach((b) => {
                              const key = `${color}__${sz}__${b.id}`;
                              variantSum += Number(matrix[key] || 0);
                            });
                            colorGrandSum += variantSum;

                            return (
                              <td key={sz} className="p-2.5 text-center font-mono font-bold text-slate-800">
                                {variantSum} {uom}
                              </td>
                            );
                          })}
                          <td className="p-2.5 text-right font-mono font-bold text-purple-900">
                            {colorGrandSum} {uom}
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Total Allocated: <span className="font-bold text-slate-900">{totalMatrixAllocated}</span> / Physical Stock:{" "}
            <span className="font-bold text-purple-900">{totalPhysicalOnHand} {uom}</span> (
            <span className={totalMatrixAllocated === totalPhysicalOnHand ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
              {totalMatrixAllocated === totalPhysicalOnHand ? "✅ Fully Matched" : `${Math.abs(totalPhysicalOnHand - totalMatrixAllocated)} Difference`}
            </span>
            )
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
            >
              {language === "my" ? "ပိတ်မည်" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 text-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{language === "my" ? "Stock Matrix သိမ်းဆည်းမည်" : "Save Matrix"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 text-xs transition-colors"
              title="Save Matrix and update physical branch stock counts to match matrix totals"
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
