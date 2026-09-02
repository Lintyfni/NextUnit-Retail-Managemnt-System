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
  Info,
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
  { name: "Phone / Storage", sizes: ["128GB", "256GB", "512GB", "1TB"] },
  { name: "RAM / SSD Spec", sizes: ["16GB / 512GB", "18GB / 512GB", "36GB / 1TB", "64GB / 2TB"] },
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
    sizes: ["256GB", "512GB"],
    matrix: {},
  };

  const [colors, setColors] = useState<string[]>(existingConfig.colors || ["Black", "Silver"]);
  const [sizes, setSizes] = useState<string[]>(existingConfig.sizes || ["Standard"]);
  const [matrix, setMatrix] = useState<Record<string, number>>(existingConfig.matrix || {});
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "");

  // New attribute input fields
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");

  const uom = product.uom || "Pcs";

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

  // Apply Palette
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

  // Fill Row
  const handleFillRow = (color: string, qty: number) => {
    const updated = { ...matrix };
    sizes.forEach((sz) => {
      const key = `${color}__${sz}__${selectedBranchId}`;
      updated[key] = Math.max(0, qty);
    });
    setMatrix(updated);
  };

  // Calculate totals for selected branch
  const getBranchMatrixTotal = (bId: string) => {
    let sum = 0;
    colors.forEach((c) => {
      sizes.forEach((s) => {
        const key = `${c}__${s}__${bId}`;
        sum += matrix[key] || 0;
      });
    });
    return sum;
  };

  const selectedBranchTotal = getBranchMatrixTotal(selectedBranchId);
  const currentPhysicalBranchStock = product.branchStock?.[selectedBranchId] || 0;

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full text-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
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
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                  UOM: {uom}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === "my"
                  ? "လက်ကျန် Qty များကို Color နှင့် Size / Spec အလိုက် Stock Matrix ဇယားကွက်ပုံစံ ခွဲပီး ကပ်ခြင်း"
                  : "Allocate & distribute on-hand inventory across Color and Size/Spec variant matrix grid"}
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

        {/* Branch Selector Bar */}
        <div className="flex items-center space-x-2 px-6 py-3 bg-white border-b border-slate-100 overflow-x-auto custom-scrollbar">
          <span className="text-xs font-bold text-slate-600 flex items-center space-x-1 shrink-0">
            <Building className="w-3.5 h-3.5 text-purple-600" />
            <span>Select Location:</span>
          </span>
          <div className="flex space-x-1.5">
            {branches.map((b) => {
              const bTotal = getBranchMatrixTotal(b.id);
              const isSelected = selectedBranchId === b.id;

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{b.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? "bg-purple-700 text-white" : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {bTotal} {uom}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 text-xs">
          {/* Attributes configuration row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colors Card */}
            <div className="bg-purple-50/50 border border-purple-200 p-4 rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-950 text-xs flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-700" />
                  <span>{language === "my" ? "အရောင်များ (Colors Matrix Rows)" : "Color Attributes (Rows)"}</span>
                </span>
                <span className="text-[10px] text-purple-700 font-semibold">{colors.length} configured</span>
              </div>

              {/* Add color */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Desert Titanium, Space Black"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
                  className="flex-1 bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                >
                  Add Color
                </button>
              </div>

              {/* Color chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {colors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-purple-300 text-purple-900 rounded-lg font-bold text-xs shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>{c}</span>
                    {colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(c)}
                        className="text-purple-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Quick Preset Colors */}
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
            <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-950 text-xs flex items-center space-x-1.5">
                  <Grid className="w-3.5 h-3.5 text-blue-700" />
                  <span>
                    {language === "my" ? "အရွယ်အစား / စပက်များ (Sizes Matrix Columns)" : "Size / Spec Attributes (Columns)"}
                  </span>
                </span>
                <span className="text-[10px] text-blue-700 font-semibold">{sizes.length} configured</span>
              </div>

              {/* Add size */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. 128GB, 256GB, 512GB, 1TB or M, L, XL"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                  className="flex-1 bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                >
                  Add Size
                </button>
              </div>

              {/* Size chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-blue-300 text-blue-900 rounded-lg font-bold text-xs shadow-2xs"
                  >
                    <span>{s}</span>
                    {sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(s)}
                        className="text-blue-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Quick Preset Sizes */}
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

          {/* Interactive 2D Matrix Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="font-bold text-slate-900 text-xs">
                  Stock Matrix Table — {branches.find((b) => b.id === selectedBranchId)?.name || selectedBranchId}
                </span>
                <p className="text-[11px] text-slate-500">
                  Type quantity in each intersection cell. All numbers automatically sum horizontally and vertically.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-600">
                  Matrix Total:{" "}
                  <span className="font-mono font-bold text-purple-900 text-sm">
                    {selectedBranchTotal} {uom}
                  </span>
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-600">
                  Current Branch Stock:{" "}
                  <span className="font-mono font-bold text-slate-900">
                    {currentPhysicalBranchStock} {uom}
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
                      // Calculate column total for this size
                      let colSum = 0;
                      colors.forEach((c) => {
                        const key = `${c}__${sz}__${selectedBranchId}`;
                        colSum += matrix[key] || 0;
                      });

                      return (
                        <th key={sz} className="p-2.5 text-center bg-slate-50">
                          <div className="font-bold text-slate-900">{sz}</div>
                          <div className="text-[10px] font-mono text-slate-500 font-semibold">{colSum} {uom}</div>
                        </th>
                      );
                    })}
                    <th className="p-2.5 text-right font-bold text-purple-900 bg-slate-50 rounded-tr-xl">
                      Color Subtotal
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
                    <td className="p-2.5 text-slate-900">Total by Location:</td>
                    {sizes.map((sz) => {
                      let colSum = 0;
                      colors.forEach((c) => {
                        const key = `${c}__${sz}__${selectedBranchId}`;
                        colSum += matrix[key] || 0;
                      });
                      return (
                        <td key={sz} className="p-2.5 text-center font-mono text-slate-900">
                          {colSum}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-right font-mono text-purple-900 text-sm">
                      {selectedBranchTotal} {uom}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-500">
            {language === "my"
              ? "Matrix ပေါင်းလဒ်များကို ဆိုင်ခွဲလက်ကျန် (Branch Stock) နှင့် တိုက်ရိုက်ချိတ်ဆက် သိမ်းဆည်းနိုင်ပါသည်"
              : "Synchronize matrix distribution totals with branch on-hand stock counts automatically"}
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs"
            >
              {language === "my" ? "ပိတ်မည်" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === "my" ? "Sync & သိမ်းဆည်းမည် (Save & Sync Stock)" : "Save & Sync Stock"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
