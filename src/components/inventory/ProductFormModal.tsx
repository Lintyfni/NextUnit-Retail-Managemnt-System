import React, { useState, useEffect } from "react";
import { Product, PriceTier, Branch, SerialItem, BatchItem, StockMatrixConfig } from "../../types";
import { formatCurrency } from "../../utils/helpers";
import {
  X,
  Plus,
  Trash2,
  Barcode,
  Sparkles,
  Layers,
  DollarSign,
  ShieldCheck,
  Calendar,
  Grid,
  Palette,
  Check,
  Image as ImageIcon,
  Building,
  Info,
  Tag,
  Hash,
} from "lucide-react";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, "id"> | Product) => void;
  initialProduct?: Product | null;
  branches: Branch[];
  currency: string;
  language: string;
}

const PRESET_IMAGES = [
  { label: "Phone", url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60" },
  { label: "Samsung", url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60" },
  { label: "Laptop", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60" },
  { label: "Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60" },
  { label: "Smartwatch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60" },
  { label: "Charger/Accessory", url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60" },
  { label: "Mouse/Keyboard", url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60" },
  { label: "Home Appliance", url: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&auto=format&fit=crop&q=60" },
];

const COMMON_UOMS = ["Pcs", "Box", "Carton", "Pack", "Set", "Unit", "Bottle", "Roll", "Dozen", "Pair", "ဘူး", "ခု", "ထုပ်"];

const DEFAULT_PRICE_TIERS: PriceTier[] = [
  { name: "Retail Walk-in (Standard)", price: 0 },
  { name: "Wholesale (Bulk Tier 1)", price: 0 },
  { name: "VIP Member Tier", price: 0 },
  { name: "Dealer / Reseller", price: 0 },
  { name: "Online / E-Commerce Promo", price: 0 },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  branches,
  currency,
  language,
}) => {
  const isEditing = !!initialProduct;

  // Active form section tab
  const [activeTab, setActiveTab] = useState<"BASIC" | "PRICING" | "STOCK" | "SERIALS" | "MATRIX">("BASIC");

  // Basic Info State
  const [name, setName] = useState("");
  const [nameMy, setNameMy] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("Smartphones");
  const [customCategory, setCustomCategory] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [uom, setUom] = useState("Pcs");
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [binLocation, setBinLocation] = useState("Aisle A1, Shelf 01");
  const [supplierId, setSupplierId] = useState("SUP-001");
  const [tags, setTags] = useState<string[]>(["new-arrival"]);
  const [tagInput, setTagInput] = useState("");

  // Pricing State (5 tiers)
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(DEFAULT_PRICE_TIERS);

  // Stock & Inventory Parameters
  const [reorderLevel, setReorderLevel] = useState<number>(5);
  const [safetyStock, setSafetyStock] = useState<number>(8);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(12);
  const [branchStock, setBranchStock] = useState<Record<string, number>>({});

  // Serial & Expiry State
  const [hasIMEI, setHasIMEI] = useState(true);
  const [serials, setSerials] = useState<SerialItem[]>([]);
  const [newSerialInput, setNewSerialInput] = useState("");
  const [newSerialBranch, setNewSerialBranch] = useState(branches[0]?.id || "");
  const [newSerialExpiry, setNewSerialExpiry] = useState("2027-12-31");
  const [newSerialLot, setNewSerialLot] = useState("LOT-2026-01");

  // Stock Matrix State (Color x Size)
  const [matrixEnabled, setMatrixEnabled] = useState(false);
  const [matrixColors, setMatrixColors] = useState<string[]>(["Black", "Silver", "Blue"]);
  const [matrixSizes, setMatrixSizes] = useState<string[]>(["Standard"]);
  const [newColorInput, setNewColorInput] = useState("");
  const [newSizeInput, setNewSizeInput] = useState("");
  const [matrixValues, setMatrixValues] = useState<Record<string, number>>({});
  const [selectedMatrixBranch, setSelectedMatrixBranch] = useState(branches[0]?.id || "");

  // Initialize data on mount or when initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || "");
      setNameMy(initialProduct.nameMy || "");
      setSku(initialProduct.sku || "");
      setBarcode(initialProduct.barcode || "");
      setCategory(initialProduct.category || "Smartphones");
      setBrand(initialProduct.brand || "Apple");
      setUom(initialProduct.uom || "Pcs");
      setImage(initialProduct.image || PRESET_IMAGES[0].url);
      setBinLocation(initialProduct.binLocation || "Aisle A1, Shelf 01");
      setSupplierId(initialProduct.supplierId || "SUP-001");
      setTags(initialProduct.tags || []);
      setCostPrice(Number(initialProduct.costPrice) || 0);
      setSellingPrice(Number(initialProduct.sellingPrice) || 0);

      // Price Tiers (Up to 5)
      if (initialProduct.basePrices && initialProduct.basePrices.length > 0) {
        setPriceTiers(initialProduct.basePrices);
      } else {
        setPriceTiers([
          { name: "Retail Walk-in (Standard)", price: Number(initialProduct.sellingPrice) || 0 },
          { name: "Wholesale (Bulk Tier 1)", price: Math.round((Number(initialProduct.sellingPrice) || 0) * 0.92) },
          { name: "VIP Member Tier", price: Math.round((Number(initialProduct.sellingPrice) || 0) * 0.95) },
          { name: "Dealer / Reseller", price: Math.round((Number(initialProduct.sellingPrice) || 0) * 0.9) },
          { name: "Online / E-Commerce Promo", price: Math.round((Number(initialProduct.sellingPrice) || 0) * 0.97) },
        ]);
      }

      setReorderLevel(initialProduct.reorderLevel || 5);
      setSafetyStock(initialProduct.safetyStock || 8);
      setLeadTimeDays(initialProduct.leadTimeDays || 7);
      setWarrantyMonths(initialProduct.warrantyMonths || 12);
      setBranchStock(initialProduct.branchStock || {});
      setHasIMEI(initialProduct.hasIMEI ?? true);
      setSerials(initialProduct.serials || []);

      // Stock Matrix
      if (initialProduct.stockMatrix) {
        setMatrixEnabled(initialProduct.stockMatrix.enabled);
        setMatrixColors(initialProduct.stockMatrix.colors || ["Black", "Silver"]);
        setMatrixSizes(initialProduct.stockMatrix.sizes || ["Standard"]);
        setMatrixValues(initialProduct.stockMatrix.matrix || {});
      } else {
        setMatrixEnabled(false);
        setMatrixColors(["Black", "Silver"]);
        setMatrixSizes(["Standard"]);
        setMatrixValues({});
      }
    } else {
      // Reset to new product defaults
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      setName("");
      setNameMy("");
      setSku(`SKU-${randomCode}`);
      setBarcode(`8809${Math.floor(10000000 + Math.random() * 90000000)}`);
      setCategory("Smartphones");
      setBrand("Apple");
      setUom("Pcs");
      setImage(PRESET_IMAGES[0].url);
      setBinLocation("Aisle A1, Shelf 01");
      setSupplierId("SUP-001");
      setTags(["new-sku"]);
      setCostPrice(100000);
      setSellingPrice(150000);
      setPriceTiers([
        { name: "Retail Walk-in (Standard)", price: 150000 },
        { name: "Wholesale (Bulk Tier 1)", price: 135000 },
        { name: "VIP Member Tier", price: 140000 },
        { name: "Dealer / Reseller", price: 130000 },
        { name: "Online / E-Commerce Promo", price: 145000 },
      ]);
      setReorderLevel(5);
      setSafetyStock(8);
      setLeadTimeDays(7);
      setWarrantyMonths(12);
      const initStock: Record<string, number> = {};
      branches.forEach((b) => {
        initStock[b.id] = b.id.includes("WH") ? 20 : 5;
      });
      setBranchStock(initStock);
      setHasIMEI(true);
      setSerials([]);
      setMatrixEnabled(false);
      setMatrixColors(["Black", "Silver", "Gold"]);
      setMatrixSizes(["128GB", "256GB", "512GB"]);
      setMatrixValues({});
    }
  }, [initialProduct, isOpen, branches]);

  if (!isOpen) return null;

  // Auto-generate barcode helper
  const handleGenerateBarcode = () => {
    const randomEAN = `8809${Math.floor(10000000 + Math.random() * 90000000)}`;
    setBarcode(randomEAN);
  };

  // Auto-generate SKU helper
  const handleGenerateSKU = () => {
    const brandPrefix = (brand || "GEN").slice(0, 3).toUpperCase();
    const catPrefix = (category || "ITM").slice(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`${brandPrefix}-${catPrefix}-${rand}`);
  };

  // Price Tier Handlers
  const handleUpdatePriceTier = (index: number, field: "name" | "price", value: string | number) => {
    const updated = [...priceTiers];
    if (field === "price") {
      const numVal = Math.max(0, Number(value));
      updated[index].price = numVal;
      if (index === 0) {
        setSellingPrice(numVal);
      }
    } else {
      updated[index].name = String(value);
    }
    setPriceTiers(updated);
  };

  const handleAddPriceTier = () => {
    if (priceTiers.length >= 5) return;
    const nextTierNum = priceTiers.length + 1;
    setPriceTiers([
      ...priceTiers,
      { name: `Pricing Tier ${nextTierNum}`, price: Math.round(sellingPrice * 0.95) },
    ]);
  };

  const handleRemovePriceTier = (index: number) => {
    if (priceTiers.length <= 1) return;
    setPriceTiers(priceTiers.filter((_, i) => i !== index));
  };

  // Stock Matrix helpers
  const handleAddColor = () => {
    if (!newColorInput.trim()) return;
    if (!matrixColors.includes(newColorInput.trim())) {
      setMatrixColors([...matrixColors, newColorInput.trim()]);
    }
    setNewColorInput("");
  };

  const handleRemoveColor = (col: string) => {
    setMatrixColors(matrixColors.filter((c) => c !== col));
  };

  const handleAddSize = () => {
    if (!newSizeInput.trim()) return;
    if (!matrixSizes.includes(newSizeInput.trim())) {
      setMatrixSizes([...matrixSizes, newSizeInput.trim()]);
    }
    setNewSizeInput("");
  };

  const handleRemoveSize = (sz: string) => {
    setMatrixSizes(matrixSizes.filter((s) => s !== sz));
  };

  const handleUpdateMatrixQty = (color: string, size: string, branchId: string, qty: number) => {
    const key = `${color}__${size}__${branchId}`;
    setMatrixValues((prev) => ({
      ...prev,
      [key]: Math.max(0, qty),
    }));
  };

  // Sync Matrix Total to physical branch stock
  const handleSyncMatrixToBranch = () => {
    const newStock = { ...branchStock };
    branches.forEach((b) => {
      let bTotal = 0;
      matrixColors.forEach((c) => {
        matrixSizes.forEach((s) => {
          const key = `${c}__${s}__${b.id}`;
          bTotal += matrixValues[key] || 0;
        });
      });
      if (bTotal > 0) {
        newStock[b.id] = bTotal;
      }
    });
    setBranchStock(newStock);
  };

  // Serial Add Helper
  const handleAddSerial = () => {
    if (!newSerialInput.trim()) return;
    const bName = branches.find((b) => b.id === newSerialBranch)?.name || newSerialBranch;
    const newEntry: SerialItem = {
      serial: newSerialInput.trim(),
      branchId: newSerialBranch,
      branchName: bName,
      status: "AVAILABLE",
      expiryDate: newSerialExpiry,
      lotNumber: newSerialLot,
      createdAt: new Date().toISOString(),
    };
    setSerials((prev) => [newEntry, ...prev]);
    setNewSerialInput("");
  };

  const handleRemoveSerial = (index: number) => {
    setSerials((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(language === "my" ? "ကျေးဇူးပြု၍ ကုန်ပစ္စည်းအမည် ထည့်သွင်းပါ။" : "Please provide a product name.");
      return;
    }
    if (!sku.trim()) {
      alert(language === "my" ? "ကျေးဇူးပြု၍ Product Code / SKU ထည့်သွင်းပါ။" : "Please provide a Product Code / SKU.");
      return;
    }

    const finalCategory = customCategory.trim() ? customCategory.trim() : category;
    const mainSelling = priceTiers[0]?.price || sellingPrice || costPrice;

    // Prepare matrix config
    const matrixConfig: StockMatrixConfig | undefined = matrixEnabled
      ? {
          enabled: true,
          colors: matrixColors,
          sizes: matrixSizes,
          matrix: matrixValues,
        }
      : undefined;

    const productPayload: Omit<Product, "id"> | Product = {
      ...(initialProduct ? { id: initialProduct.id } : {}),
      name: name.trim(),
      nameMy: nameMy.trim() || name.trim(),
      sku: sku.trim(),
      barcode: barcode.trim() || `8809${Math.floor(10000000 + Math.random() * 90000000)}`,
      category: finalCategory,
      brand: brand.trim() || "Generic",
      costPrice,
      sellingPrice: mainSelling,
      basePrices: priceTiers,
      uom: uom.trim() || "Pcs",
      image: image.trim() || PRESET_IMAGES[0].url,
      hasIMEI,
      warrantyMonths,
      reorderLevel,
      safetyStock,
      leadTimeDays,
      supplierId,
      binLocation,
      branchStock,
      tags: tags.length > 0 ? tags : ["inventory"],
      salesVelocity: initialProduct?.salesVelocity || 1.5,
      serials: serials.length > 0 ? serials : undefined,
      stockMatrix: matrixConfig,
    };

    onSave(productPayload);
    onClose();
  };

  const totalPhysicalUnits = Object.values(branchStock).reduce<number>((a, b) => a + Number(b || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full text-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing
                  ? language === "my"
                    ? "ကုန်ပစ္စည်း အချက်အလက် ပြင်ဆင်ခြင်း"
                    : "Edit Inventory Product"
                  : language === "my"
                  ? "ကုန်ပစ္စည်းအသစ် ထည့်သွင်းခြင်း (Create New Inventory)"
                  : "Create New Inventory Product"}
              </h2>
              <p className="text-xs text-slate-500">
                {language === "my"
                  ? "Product Name, Code, Barcode, Base Selling Prices (၅ မျိုး), UOM, Serial & Expired Codes နှင့် Color/Size Matrix"
                  : "SKU, Barcode, 5-Tier Base Selling Prices, UOM, Serials & Expiry, and Stock Matrix"}
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

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-100 bg-white overflow-x-auto custom-scrollbar text-xs font-semibold">
          <button
            onClick={() => setActiveTab("BASIC")}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === "BASIC"
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{language === "my" ? "၁။ အခြေခံ အချက်အလက်နှင့် UOM" : "1. Basic & UOM"}</span>
          </button>
          <button
            onClick={() => setActiveTab("PRICING")}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === "PRICING"
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{language === "my" ? "၂။ ရောင်းဈေး ၅ မျိုး (5-Tier Base Prices)" : "2. 5-Tier Base Prices"}</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
              {priceTiers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("STOCK")}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === "STOCK"
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{language === "my" ? "၃။ ဆိုင်ခွဲလက်ကျန် စာရင်း" : "3. Branch Stock"}</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
              {totalPhysicalUnits} {uom}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("SERIALS")}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === "SERIALS"
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === "my" ? "၄။ Serial & Expired Code စီမံမှု" : "4. Serial & Expired Codes"}</span>
            {serials.length > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-mono">
                {serials.length} SN
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("MATRIX")}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === "MATRIX"
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{language === "my" ? "၅။ Stock Matrix (Color / Size)" : "5. Stock Matrix (Color x Size)"}</span>
            {matrixEnabled && (
              <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-mono">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 text-xs">
          {/* TAB 1: BASIC INFO & UOM */}
          {activeTab === "BASIC" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name (English) */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "ကုန်ပစ္စည်း အမည် (Product Name - English) *" : "Product Name (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 15 Pro Max (256GB - Natural Titanium)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Product Name (Myanmar) */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "ကုန်ပစ္စည်း အမည် (မြန်မာအမည်)" : "Product Name (Myanmar Localized)"}
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - အိုင်ဖုန်း ၁၅ ပရိုမက်စ် (၂၅၆ဂျီဘီ)"
                    value={nameMy}
                    onChange={(e) => setNameMy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Code / SKU & Barcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Code / SKU */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-semibold">
                      {language === "my" ? "Product Code / SKU *" : "Product Code / SKU *"}
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSKU}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{language === "my" ? "Auto SKU ထုတ်မည်" : "Auto Generate SKU"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. APL-IP15PM-256"
                      value={sku}
                      onChange={(e) => setSku(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Barcode / EAN */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-semibold">
                      {language === "my" ? "ဘားကုဒ် (Barcode / EAN-13)" : "Barcode / EAN-13"}
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                    >
                      <Barcode className="w-3 h-3" />
                      <span>{language === "my" ? "ဘားကုဒ်အသစ်ထုတ်မည်" : "Generate Barcode"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. 880912345601"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* UOM (Unit of Measure) Section */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-emerald-900">
                      {language === "my" ? "ရေတွက်ယူနစ် (UOM - Unit of Measure)" : "Unit of Measure (UOM)"}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    {language === "my" ? "စိတ်ကြိုက်ရိုက်ထည့်နိုင်သည် (သို့) အောက်ပါထဲမှ ရွေးနိုင်ပါသည်" : "Choose quick chip or type custom"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-1/3">
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                      {language === "my" ? "စိတ်ကြိုက် UOM ရိုက်ထည့်ရန်:" : "Custom UOM Text:"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pcs, Box, Carton, ထုပ်, ဘူး"
                      value={uom}
                      onChange={(e) => setUom(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div className="w-full sm:w-2/3">
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                      {language === "my" ? "အသုံးများသော ယူနစ်များ (Quick Select):" : "Common Preset Units:"}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_UOMS.map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setUom(unit)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            uom === unit
                              ? "bg-emerald-700 text-white shadow-xs"
                              : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category, Brand, Supplier, Bin Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "အမျိုးအစား (Category)" : "Category"}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Laptops & Computing">Laptops & Computing</option>
                    <option value="Audio & Accessories">Audio & Accessories</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Smart Home">Smart Home</option>
                    <option value="Gaming & Consoles">Gaming & Consoles</option>
                    <option value="Cameras & Drones">Cameras & Drones</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "တံဆိပ် (Brand)" : "Brand"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Samsung, Sony"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Bin Location */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "စင်တည်နေရာ (Bin Location)" : "Bin Location"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aisle 3, Shelf B-12"
                    value={binLocation}
                    onChange={(e) => setBinLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "ကုန်သွင်းသူ (Supplier ID)" : "Supplier"}
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="SUP-001">Apex Tech Distribution (SUP-001)</option>
                    <option value="SUP-002">Global Tech Hub Singapore (SUP-002)</option>
                    <option value="SUP-003">Yangon Premium Electronics (SUP-003)</option>
                    <option value="SUP-004">Mandalay Direct Importers (SUP-004)</option>
                  </select>
                </div>
              </div>

              {/* Product Image URL & Preset Selection */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold">
                  {language === "my" ? "ကုန်ပစ္စည်း ဓာတ်ပုံ (Image URL & Presets)" : "Product Image URL & Presets"}
                </label>
                <div className="flex items-center space-x-3">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                    }}
                  />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium mr-1">Presets:</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors ${
                        image === preset.url
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5-TIER BASE SELLING PRICES & COST */}
          {activeTab === "PRICING" && (
            <div className="space-y-5 animate-fade-in">
              {/* Cost Price Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>{language === "my" ? "မူရင်းဝယ်ဈေး (Cost Price)" : "Base Cost Price (COGS)"}</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === "my" ? "ကုန်ပစ္စည်းတစ်ခုချင်းစီ၏ ဝယ်ယူရရှိသော ကုန်ကျစရိတ်" : "Purchase acquisition cost per unit"}
                  </p>
                </div>
                <div className="w-full sm:w-48">
                  <input
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 text-right focus:outline-none focus:border-emerald-500"
                  />
                  <div className="text-[10px] text-slate-400 text-right mt-0.5">
                    {formatCurrency(costPrice, currency as any, language as any)} / {uom}
                  </div>
                </div>
              </div>

              {/* 5-Tier Selling Price Builder */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">
                      {language === "my" ? "ရောင်းဈေး ၅ မျိုး သတ်မှတ်ချက် (Up to 5 Base Selling Price Tiers)" : "5-Tier Base Selling Price Configuration"}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {language === "my"
                        ? "Retail (လက်လီ)၊ Wholesale (လက်ကား)၊ VIP Club၊ Dealer နှင့် Online ဈေးနှုန်းများကို သီးခြားသတ်မှတ်နိုင်ပါသည်"
                        : "Define specialized pricing tiers for Retail, Wholesale, VIP Members, Dealers, and E-Commerce"}
                    </p>
                  </div>
                  {priceTiers.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddPriceTier}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === "my" ? "ဈေးနှုန်းအမျိုးအစား ထပ်ထည့်မည်" : "Add Price Tier"}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {priceTiers.map((tier, idx) => {
                    const margin = tier.price > 0 && costPrice > 0 ? ((tier.price - costPrice) / tier.price) * 100 : 0;
                    const profit = tier.price - costPrice;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          idx === 0
                            ? "bg-emerald-50/60 border-emerald-300"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          {/* Tier Name */}
                          <div className="flex-1 w-full">
                            <div className="flex items-center space-x-2 mb-1">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  idx === 0
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={tier.name}
                                onChange={(e) => handleUpdatePriceTier(idx, "name", e.target.value)}
                                className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-emerald-600 focus:outline-none px-1 py-0.5 text-xs w-full max-w-xs"
                                placeholder={`Pricing Tier ${idx + 1}`}
                              />
                              {idx === 0 && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                                  Default POS Price
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 ml-7">
                              Unit: <span className="font-semibold text-slate-700">{uom}</span> • Profit:{" "}
                              <span className={`font-bold ${profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                {profit > 0 ? "+" : ""}
                                {formatCurrency(profit, currency as any, language as any)}
                              </span>{" "}
                              ({margin.toFixed(1)}% margin)
                            </div>
                          </div>

                          {/* Price Input & Remove */}
                          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                            <div className="w-40">
                              <input
                                type="number"
                                min={0}
                                value={tier.price}
                                onChange={(e) => handleUpdatePriceTier(idx, "price", e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 text-right focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            {priceTiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePriceTier(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Remove Tier"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Warranty & Lead Time Settings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "အာမခံကာလ (လ)" : "Warranty (Months)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "သတိပေးလက်ကျန် (Reorder Level)" : "Reorder Level"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "အကာအကွယ်လက်ကျန် (Safety Stock)" : "Safety Stock"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    {language === "my" ? "ပစ္စည်းရောက်ချိန် (Lead Time Days)" : "Lead Time (Days)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRANCH STOCK ALLOCATION */}
          {activeTab === "STOCK" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 text-xs">
                    {language === "my" ? "ဆိုင်ခွဲနှင့် ဂိုဒေါင်အလိုက် လက်ကျန်ခွဲဝေမှု" : "Initial Stock by Location"}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === "my"
                      ? "ဆိုင်ခွဲတစ်ခုချင်းစီတွင် ရှိသော လက်ကျန်အရေအတွက် (UOM: " + uom + ") ကို သတ်မှတ်ပါ"
                      : "Allocate initial inventory units per branch and central logistics hub"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800">
                    Total: {totalPhysicalUnits} {uom}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {branches.map((b) => {
                  const isWarehouse = b.id.includes("WH") || b.name.toLowerCase().includes("warehouse");
                  const stockVal = branchStock[b.id] || 0;

                  return (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        isWarehouse ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isWarehouse ? "bg-blue-600 text-white" : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{b.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {b.code || b.id} • {b.city}
                          </div>
                        </div>
                      </div>

                      <div className="w-28 flex items-center space-x-1.5">
                        <input
                          type="number"
                          min={0}
                          value={stockVal}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setBranchStock((prev) => ({
                              ...prev,
                              [b.id]: val,
                            }));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 text-right focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] font-semibold text-slate-500">{uom}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SERIAL & EXPIRED CODE TRACKING */}
          {activeTab === "SERIALS" && (
            <div className="space-y-4 animate-fade-in">
              {/* Toggle Has Serial / IMEI */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === "my"
                        ? "Serial / IMEI & Expired Code စာရင်းကပ် စနစ်ဖွင့်မည်"
                        : "Enable Serial / IMEI & Expiry Date Tracking"}
                    </span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === "my"
                      ? "လက်ကျန်အရေအတွက်တစ်ခုချင်းစီတွင် Serial Number၊ Lot Code နှင့် သက်တမ်းကုန်ဆုံးရက် (Expiry Date) ခွဲခြားကပ်နိုင်ပါသည်"
                      : "Track individual device serials, lot batches, warranty validation, and product shelf-life expiration"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hasIMEI}
                  onChange={(e) => setHasIMEI(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
              </div>

              {hasIMEI && (
                <div className="space-y-4">
                  {/* Add New Serial Entry Box */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs">
                    <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === "my" ? "Serial & Expired Code အသစ်ထည့်သွင်းရန်" : "Add New Serial & Expiry Code"}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Serial Number / IMEI</label>
                        <input
                          type="text"
                          placeholder="e.g. SN-8823901"
                          value={newSerialInput}
                          onChange={(e) => setNewSerialInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Assign to Branch</label>
                        <select
                          value={newSerialBranch}
                          onChange={(e) => setNewSerialBranch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Lot / Batch Code</label>
                        <input
                          type="text"
                          placeholder="e.g. LOT-2026-08A"
                          value={newSerialLot}
                          onChange={(e) => setNewSerialLot(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Expired Date (သက်တမ်းကုန်ရက်)</label>
                        <input
                          type="date"
                          value={newSerialExpiry}
                          onChange={(e) => setNewSerialExpiry(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddSerial}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === "my" ? "Serial စာရင်းထဲသို့ ထည့်မည်" : "Add Serial to List"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Serial List Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span>Assigned Serials & Expired Codes ({serials.length})</span>
                      <span className="text-[11px] text-slate-500">UOM: {uom}</span>
                    </div>

                    {serials.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No serial numbers recorded yet. Use the inputs above to add individual serials with expiry codes.
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-500 border-b border-slate-100">
                            <tr>
                              <th className="px-3 py-2">Serial / IMEI</th>
                              <th className="px-3 py-2">Branch</th>
                              <th className="px-3 py-2">Lot Code</th>
                              <th className="px-3 py-2">Expiry Date</th>
                              <th className="px-3 py-2">Status</th>
                              <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {serials.map((s, sIdx) => (
                              <tr key={sIdx} className="hover:bg-slate-50">
                                <td className="px-3 py-2 font-mono font-bold text-slate-900">{s.serial}</td>
                                <td className="px-3 py-2 text-slate-600">{s.branchName || s.branchId}</td>
                                <td className="px-3 py-2 font-mono text-slate-500">{s.lotNumber || "-"}</td>
                                <td className="px-3 py-2 font-mono text-slate-700">
                                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
                                    {s.expiryDate || "N/A"}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                                    {s.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSerial(sIdx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STOCK MATRIX (COLOR X SIZE) */}
          {activeTab === "MATRIX" && (
            <div className="space-y-4 animate-fade-in">
              {/* Matrix Toggle */}
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-700" />
                    <span>
                      {language === "my"
                        ? "Stock Matrix စနစ်ဖွင့်မည် (Color / Size အလိုက် ခွဲခြားကပ်ခြင်း)"
                        : "Enable 2D Stock Matrix (Color x Size / Spec Variant Matrix)"}
                    </span>
                  </span>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    {language === "my"
                      ? "လက်ကျန်အရေအတွက်များကို အရောင် (Color) နှင့် အရွယ်အစား/သိုလှောင်မှု (Size/Spec) စစ်တမ်းဖြင့် ဇယားကွက်ပုံစံ ထည့်သွင်းစီမံနိုင်ပါသည်"
                      : "Distribute inventory counts across multi-attribute variant matrix grid per branch"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={matrixEnabled}
                  onChange={(e) => setMatrixEnabled(e.target.checked)}
                  className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                />
              </div>

              {matrixEnabled && (
                <div className="space-y-4">
                  {/* Color & Size Attribute Builders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-200 p-4 rounded-2xl">
                    {/* Color Tags */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <Palette className="w-3.5 h-3.5 text-purple-600" />
                        <span>{language === "my" ? "အရောင်များ (Colors)" : "Configured Colors"}</span>
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. Natural Titanium, Black, Gold"
                          value={newColorInput}
                          onChange={(e) => setNewColorInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {matrixColors.map((col) => (
                          <span
                            key={col}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg text-xs font-semibold"
                          >
                            <span>{col}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(col)}
                              className="text-purple-400 hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Size / Capacity Tags */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <Grid className="w-3.5 h-3.5 text-purple-600" />
                        <span>{language === "my" ? "အရွယ်အစား / စပက်များ (Sizes / Capacities)" : "Configured Sizes / Specs"}</span>
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. 128GB, 256GB, 512GB or S, M, L"
                          value={newSizeInput}
                          onChange={(e) => setNewSizeInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddSize}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {matrixSizes.map((sz) => (
                          <span
                            key={sz}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-semibold"
                          >
                            <span>{sz}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(sz)}
                              className="text-blue-400 hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2D Matrix Table Preview & Inputs per Branch */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-slate-800 text-xs">
                          {language === "my" ? "ဆိုင်ခွဲရွေးချယ်၍ Matrix စာရင်းထည့်ရန်:" : "Matrix View for Branch:"}
                        </span>
                        <select
                          value={selectedMatrixBranch}
                          onChange={(e) => setSelectedMatrixBranch(e.target.value)}
                          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-bold focus:outline-none"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncMatrixToBranch}
                        className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        {language === "my" ? "Matrix ပေါင်းလဒ်ကို ဆိုင်ခွဲလက်ကျန်သို့ ကူးယူမည်" : "Sync Matrix Totals to Branch Stock"}
                      </button>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar p-3">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="p-2 font-bold text-slate-600 bg-slate-50 rounded-tl-lg">
                              Color \ Size
                            </th>
                            {matrixSizes.map((sz) => (
                              <th key={sz} className="p-2 text-center font-bold text-slate-800 bg-slate-50">
                                {sz}
                              </th>
                            ))}
                            <th className="p-2 text-right font-bold text-slate-800 bg-slate-50 rounded-tr-lg">
                              Color Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {matrixColors.map((color) => {
                            let rowSum = 0;
                            return (
                              <tr key={color} className="hover:bg-slate-50/60">
                                <td className="p-2 font-bold text-slate-800 flex items-center space-x-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                                  <span>{color}</span>
                                </td>
                                {matrixSizes.map((sz) => {
                                  const key = `${color}__${sz}__${selectedMatrixBranch}`;
                                  const cellQty = matrixValues[key] || 0;
                                  rowSum += cellQty;

                                  return (
                                    <td key={sz} className="p-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={cellQty}
                                        onChange={(e) =>
                                          handleUpdateMatrixQty(
                                            color,
                                            sz,
                                            selectedMatrixBranch,
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-16 text-center bg-slate-50 border border-slate-300 rounded-lg py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                                      />
                                    </td>
                                  );
                                })}
                                <td className="p-2 text-right font-mono font-bold text-purple-900">
                                  {rowSum} {uom}
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
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{name || "New Product"}</span> • {sku || "NO-SKU"} • UOM:{" "}
              <span className="font-bold text-emerald-800">{uom}</span> • Total Stock:{" "}
              <span className="font-bold text-slate-900">{totalPhysicalUnits}</span>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                {language === "my" ? "မလုပ်တော့ပါ" : "Cancel"}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isEditing
                    ? language === "my"
                      ? "ပြင်ဆင်ချက်များ သိမ်းဆည်းမည်"
                      : "Save Changes"
                    : language === "my"
                    ? "ကုန်ပစ္စည်းအသစ် ဖန်တီးသိမ်းဆည်းမည်"
                    : "Create Product"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
