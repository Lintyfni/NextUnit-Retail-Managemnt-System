import React, { useState, useEffect } from "react";
import { Product, PriceTier, Branch, SerialItem, StockMatrixConfig } from "../../types";
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
  Grid,
  Palette,
  Check,
  Building,
  Info,
  Tag,
  Hash,
  Edit2,
  CheckCircle2,
  Star,
  Percent,
  TrendingUp,
  RefreshCw,
  HelpCircle,
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

const INITIAL_DEFAULT_UOMS = [
  "Pcs",
  "Box",
  "Carton",
  "Pack",
  "Set",
  "Unit",
  "Bottle",
  "Roll",
  "Dozen",
  "Pair",
  "ဘူး",
  "ခု",
  "ထုပ်",
  "လိပ်",
  "တွဲ",
  "ကတ်",
  "အိတ်",
  "လုံး",
];

const QUICK_PRICE_TIER_NAMES = [
  { en: "Standard Retail (Walk-in)", my: "လက်လီရောင်းဈေး (Retail)", minQty: 1 },
  { en: "Wholesale (Bulk Tier 1)", my: "လက်ကားဈေး (Wholesale)", minQty: 5 },
  { en: "VIP / Gold Member", my: "ဗီအိုင်ပီဈေး (VIP Member)", minQty: 1 },
  { en: "Dealer / Agent", my: "ကိုယ်စားလှယ်ဈေး (Dealer/Agent)", minQty: 10 },
  { en: "Online / Promo Tier", my: "အွန်လိုင်း ပရိုမိုးရှင်းဈေး (Online)", minQty: 1 },
  { en: "Corporate / B2B", my: "ကုမ္ပဏီဈေး (Corporate B2B)", minQty: 20 },
  { en: "Staff Discount", my: "ဝန်ထမ်းဈေး (Staff Price)", minQty: 1 },
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

  // UOM Management State
  const [uomList, setUomList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pos_custom_uoms");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_DEFAULT_UOMS;
  });
  const [newUomInput, setNewUomInput] = useState("");
  const [editingUomIdx, setEditingUomIdx] = useState<number | null>(null);
  const [editingUomText, setEditingUomText] = useState("");

  // Pricing State (5 tiers)
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([
    {
      id: "tier_1",
      name: "Standard Retail (Walk-in)",
      nameMy: "လက်လီရောင်းဈေး (Retail)",
      price: 0,
      minQty: 1,
      isDefault: true,
    },
    {
      id: "tier_2",
      name: "Wholesale (Bulk Tier 1)",
      nameMy: "လက်ကားဈေး (Wholesale)",
      price: 0,
      minQty: 5,
      isDefault: false,
    },
    {
      id: "tier_3",
      name: "VIP / Gold Member",
      nameMy: "ဗီအိုင်ပီဈေး (VIP Member)",
      price: 0,
      minQty: 1,
      isDefault: false,
    },
    {
      id: "tier_4",
      name: "Dealer / Agent",
      nameMy: "ကိုယ်စားလှယ်ဈေး (Dealer/Agent)",
      price: 0,
      minQty: 10,
      isDefault: false,
    },
    {
      id: "tier_5",
      name: "Online / Promo Tier",
      nameMy: "အွန်လိုင်း ပရိုမိုးရှင်းဈေး (Online)",
      price: 0,
      minQty: 1,
      isDefault: false,
    },
  ]);

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
      const currentUom = initialProduct.uom || "Pcs";
      setUom(currentUom);
      // Ensure product UOM is in the list
      setUomList((prev) => (prev.includes(currentUom) ? prev : [currentUom, ...prev]));

      setImage(initialProduct.image || PRESET_IMAGES[0].url);
      setBinLocation(initialProduct.binLocation || "Aisle A1, Shelf 01");
      setSupplierId(initialProduct.supplierId || "SUP-001");
      setTags(initialProduct.tags || []);
      const cost = Number(initialProduct.costPrice) || 0;
      const retail = Number(initialProduct.sellingPrice) || 0;
      setCostPrice(cost);
      setSellingPrice(retail);

      // Price Tiers (Up to 5)
      if (initialProduct.basePrices && initialProduct.basePrices.length > 0) {
        setPriceTiers(
          initialProduct.basePrices.map((tier, idx) => ({
            id: tier.id || `tier_${idx + 1}`,
            name: tier.name || `Price Tier ${idx + 1}`,
            nameMy: tier.nameMy || tier.name || `ရောင်းဈေး ${idx + 1}`,
            price: Number(tier.price) || 0,
            minQty: Number(tier.minQty) || 1,
            isDefault: tier.isDefault ?? idx === 0,
          }))
        );
      } else {
        setPriceTiers([
          {
            id: "tier_1",
            name: "Standard Retail (Walk-in)",
            nameMy: "လက်လီရောင်းဈေး (Retail)",
            price: retail,
            minQty: 1,
            isDefault: true,
          },
          {
            id: "tier_2",
            name: "Wholesale (Bulk Tier 1)",
            nameMy: "လက်ကားဈေး (Wholesale)",
            price: Math.round(retail * 0.92),
            minQty: 5,
            isDefault: false,
          },
          {
            id: "tier_3",
            name: "VIP / Gold Member",
            nameMy: "ဗီအိုင်ပီဈေး (VIP Member)",
            price: Math.round(retail * 0.95),
            minQty: 1,
            isDefault: false,
          },
          {
            id: "tier_4",
            name: "Dealer / Agent",
            nameMy: "ကိုယ်စားလှယ်ဈေး (Dealer/Agent)",
            price: Math.round(retail * 0.9),
            minQty: 10,
            isDefault: false,
          },
          {
            id: "tier_5",
            name: "Online / Promo Tier",
            nameMy: "အွန်လိုင်း ပရိုမိုးရှင်းဈေး (Online)",
            price: Math.round(retail * 0.97),
            minQty: 1,
            isDefault: false,
          },
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
        {
          id: "tier_1",
          name: "Standard Retail (Walk-in)",
          nameMy: "လက်လီရောင်းဈေး (Retail)",
          price: 150000,
          minQty: 1,
          isDefault: true,
        },
        {
          id: "tier_2",
          name: "Wholesale (Bulk Tier 1)",
          nameMy: "လက်ကားဈေး (Wholesale)",
          price: 135000,
          minQty: 5,
          isDefault: false,
        },
        {
          id: "tier_3",
          name: "VIP / Gold Member",
          nameMy: "ဗီအိုင်ပီဈေး (VIP Member)",
          price: 140000,
          minQty: 1,
          isDefault: false,
        },
        {
          id: "tier_4",
          name: "Dealer / Agent",
          nameMy: "ကိုယ်စားလှယ်ဈေး (Dealer/Agent)",
          price: 130000,
          minQty: 10,
          isDefault: false,
        },
        {
          id: "tier_5",
          name: "Online / Promo Tier",
          nameMy: "အွန်လိုင်း ပရိုမိုးရှင်းဈေး (Online)",
          price: 145000,
          minQty: 1,
          isDefault: false,
        },
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

  // ==========================================
  // UOM (Unit of Measure) CRUD Handlers
  // ==========================================
  const saveUomList = (updated: string[]) => {
    setUomList(updated);
    try {
      localStorage.setItem("pos_custom_uoms", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleAddUom = () => {
    const val = newUomInput.trim();
    if (!val) return;
    if (!uomList.includes(val)) {
      const updated = [...uomList, val];
      saveUomList(updated);
      setUom(val);
    } else {
      setUom(val);
    }
    setNewUomInput("");
  };

  const handleStartEditUom = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUomIdx(index);
    setEditingUomText(uomList[index]);
  };

  const handleSaveEditUom = (index: number) => {
    const trimmed = editingUomText.trim();
    if (!trimmed) {
      setEditingUomIdx(null);
      return;
    }
    const oldVal = uomList[index];
    const updated = [...uomList];
    updated[index] = trimmed;
    saveUomList(updated);

    if (uom === oldVal) {
      setUom(trimmed);
    }
    setEditingUomIdx(null);
  };

  const handleDeleteUom = (valToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (uomList.length <= 1) return;
    const updated = uomList.filter((item) => item !== valToDelete);
    saveUomList(updated);
    if (uom === valToDelete) {
      setUom(updated[0] || "Pcs");
    }
  };

  // ==========================================
  // 5-Tier Base Selling Price CRUD Handlers
  // ==========================================
  const handleUpdatePriceTier = (
    index: number,
    field: "name" | "nameMy" | "price" | "minQty" | "isDefault",
    value: string | number | boolean
  ) => {
    const updated = [...priceTiers];
    if (field === "price") {
      const numVal = Math.max(0, Number(value));
      updated[index].price = numVal;
      if (updated[index].isDefault || index === 0) {
        setSellingPrice(numVal);
      }
    } else if (field === "name") {
      updated[index].name = String(value);
    } else if (field === "nameMy") {
      updated[index].nameMy = String(value);
    } else if (field === "minQty") {
      updated[index].minQty = Math.max(1, Number(value));
    } else if (field === "isDefault") {
      updated.forEach((t, i) => {
        t.isDefault = i === index;
      });
      setSellingPrice(updated[index].price);
    }
    setPriceTiers(updated);
  };

  const handleAddPriceTier = () => {
    const nextTierNum = priceTiers.length + 1;
    const presetName =
      QUICK_PRICE_TIER_NAMES[priceTiers.length] || {
        en: `Custom Tier ${nextTierNum}`,
        my: `ရောင်းဈေးအဆင့် ${nextTierNum}`,
        minQty: nextTierNum * 2,
      };

    const newTier: PriceTier = {
      id: `tier_${Date.now()}_${nextTierNum}`,
      name: presetName.en,
      nameMy: presetName.my,
      price: Math.round(sellingPrice > 0 ? sellingPrice * (1 - nextTierNum * 0.03) : costPrice * 1.2),
      minQty: presetName.minQty || 1,
      isDefault: false,
    };

    setPriceTiers([...priceTiers, newTier]);
  };

  const handleRemovePriceTier = (index: number) => {
    if (priceTiers.length <= 1) {
      alert(language === "my" ? "အနည်းဆုံး ရောင်းဈေး ၁ မျိုး ရှိရပါမည်။" : "At least 1 base selling price is required.");
      return;
    }
    const wasDefault = priceTiers[index]?.isDefault;
    const updated = priceTiers.filter((_, i) => i !== index);
    if (wasDefault && updated.length > 0) {
      updated[0].isDefault = true;
      setSellingPrice(updated[0].price);
    }
    setPriceTiers(updated);
  };

  // Quick Markup Helpers
  const handleApplyMarkupToTier = (index: number, percent: number) => {
    if (costPrice <= 0) return;
    const calculated = Math.round(costPrice * (1 + percent / 100));
    handleUpdatePriceTier(index, "price", calculated);
  };

  const handleApplyDiscountFromRetail = (index: number, percent: number) => {
    const retail = priceTiers[0]?.price || sellingPrice;
    if (retail <= 0) return;
    const calculated = Math.round(retail * (1 - percent / 100));
    handleUpdatePriceTier(index, "price", calculated);
  };

  // Quick 5-Tier Templates
  const handleApply5TierTemplate = (type: "OMNI" | "VOLUME" | "VIP") => {
    const base = costPrice > 0 ? costPrice : 100000;
    const baseRetail = sellingPrice > 0 ? sellingPrice : Math.round(base * 1.4);

    if (type === "OMNI") {
      setPriceTiers([
        {
          id: "t1",
          name: "Standard Retail (Walk-in)",
          nameMy: "လက်လီရောင်းဈေး (Retail)",
          price: baseRetail,
          minQty: 1,
          isDefault: true,
        },
        {
          id: "t2",
          name: "Wholesale (Bulk Tier 1)",
          nameMy: "လက်ကားဈေး (Wholesale)",
          price: Math.round(baseRetail * 0.88),
          minQty: 5,
          isDefault: false,
        },
        {
          id: "t3",
          name: "VIP Member Tier",
          nameMy: "ဗီအိုင်ပီဈေး (VIP Member)",
          price: Math.round(baseRetail * 0.94),
          minQty: 1,
          isDefault: false,
        },
        {
          id: "t4",
          name: "Dealer / Reseller",
          nameMy: "ကိုယ်စားလှယ်ဈေး (Dealer/Agent)",
          price: Math.round(baseRetail * 0.82),
          minQty: 20,
          isDefault: false,
        },
        {
          id: "t5",
          name: "Online / Flash Promo",
          nameMy: "အွန်လိုင်း ပရိုမိုးရှင်းဈေး (Online Promo)",
          price: Math.round(baseRetail * 0.95),
          minQty: 1,
          isDefault: false,
        },
      ]);
      setSellingPrice(baseRetail);
    } else if (type === "VOLUME") {
      setPriceTiers([
        {
          id: "v1",
          name: "Qty 1-4 (Single Retail)",
          nameMy: "၁-၄ ခု (လက်လီဈေး)",
          price: baseRetail,
          minQty: 1,
          isDefault: true,
        },
        {
          id: "v2",
          name: "Qty 5-9 (Small Pack)",
          nameMy: "၅-၉ ခု (အထုပ်ငယ်ဈေး)",
          price: Math.round(baseRetail * 0.93),
          minQty: 5,
          isDefault: false,
        },
        {
          id: "v3",
          name: "Qty 10-49 (Box Wholesale)",
          nameMy: "၁၀-၄၉ ခု (သေတ္တာလိုက်ဈေး)",
          price: Math.round(baseRetail * 0.87),
          minQty: 10,
          isDefault: false,
        },
        {
          id: "v4",
          name: "Qty 50-99 (Carton Bulk)",
          nameMy: "၅၀-၉၉ ခု (ဖာလိုက်ဈေး)",
          price: Math.round(baseRetail * 0.8),
          minQty: 50,
          isDefault: false,
        },
        {
          id: "v5",
          name: "Qty 100+ (Master Distributor)",
          nameMy: "၁၀၀+ ခု (ပင်မဖောက်သည်ကြီးဈေး)",
          price: Math.round(baseRetail * 0.75),
          minQty: 100,
          isDefault: false,
        },
      ]);
      setSellingPrice(baseRetail);
    } else if (type === "VIP") {
      setPriceTiers([
        {
          id: "c1",
          name: "Walk-in Guest",
          nameMy: "သာမန်ဧည့်သည်ဈေး (Standard)",
          price: baseRetail,
          minQty: 1,
          isDefault: true,
        },
        {
          id: "c2",
          name: "Silver Member (5% Off)",
          nameMy: "ဆာလ်ဗာ မန်ဘာဈေး (Silver 5%)",
          price: Math.round(baseRetail * 0.95),
          minQty: 1,
          isDefault: false,
        },
        {
          id: "c3",
          name: "Gold Member (10% Off)",
          nameMy: "ဂိုးလ် မန်ဘာဈေး (Gold 10%)",
          price: Math.round(baseRetail * 0.9),
          minQty: 1,
          isDefault: false,
        },
        {
          id: "c4",
          name: "Platinum VIP (15% Off)",
          nameMy: "ပလက်တီနမ် ဗီအိုင်ပီဈေး (Platinum 15%)",
          price: Math.round(baseRetail * 0.85),
          minQty: 1,
          isDefault: false,
        },
        {
          id: "c5",
          name: "Diamond Partner (20% Off)",
          nameMy: "ဒိုင်မွန်း မိတ်ဖက်ဈေး (Diamond 20%)",
          price: Math.round(baseRetail * 0.8),
          minQty: 1,
          isDefault: false,
        },
      ]);
      setSellingPrice(baseRetail);
    }
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

    // Find default price tier or first tier
    const defaultTier = priceTiers.find((t) => t.isDefault) || priceTiers[0];
    const mainSelling = defaultTier ? defaultTier.price : sellingPrice || costPrice;

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
                  ? "Product Name, Code, Barcode, Base Selling Prices (၅ မျိုး စိတ်ကြိုက်ပြင်ဆင်/ထည့်/ဖျက်), UOM စီမံမှု, Serial/Expired Codes နှင့် Color/Size Matrix"
                  : "SKU, Barcode, Editable 5-Tier Base Selling Prices (New/Edit/Delete), UOM Management, Serials & Expiry, and Stock Matrix"}
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
            <span>{language === "my" ? "၁။ အခြေခံ & UOM စီမံမှု" : "1. Basic & UOM"}</span>
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
            <span>{language === "my" ? "၂။ ရောင်းဈေး ၅ မျိုး (5 Base Prices)" : "2. 5-Tier Base Prices"}</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
              {priceTiers.length} Tiers
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
          {/* TAB 1: BASIC INFO & UOM MANAGEMENT (EDIT / NEW / DELETE) */}
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

              {/* UOM (Unit of Measure) Complete Management: New / Edit / Delete */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950 text-xs">
                        {language === "my" ? "ရေတွက်ယူနစ် စီမံမှု (UOM - Unit of Measure)" : "Unit of Measure (UOM) Manager"}
                      </span>
                      <p className="text-[11px] text-emerald-800">
                        {language === "my"
                          ? "ယူနစ်အသစ် ထည့်သွင်းခြင်း (New)၊ အမည်ပြင်ဆင်ခြင်း (Edit)၊ ဖျက်ခြင်း (Delete) နှင့် ကုန်ပစ္စည်းအတွက် ရွေးချယ်ခြင်း"
                          : "Create custom UOMs, rename/edit existing units, delete unused ones, and select for this item"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-white px-3 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                    <span className="text-[11px] text-slate-500">{language === "my" ? "ရွေးထားသော UOM:" : "Active:"}</span>
                    <span className="font-bold text-emerald-800 text-xs font-mono">{uom}</span>
                  </div>
                </div>

                {/* Add New UOM Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      language === "my"
                        ? "UOM အသစ်ရိုက်ထည့်ပါ (e.g. Bucket, Meter, Yard, ဖာ, အိတ်, စုံ)..."
                        : "Type new UOM (e.g. Bucket, Meter, Yard, Bag, Carton)..."
                    }
                    value={newUomInput}
                    onChange={(e) => setNewUomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUom())}
                    className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddUom}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === "my" ? "UOM အသစ်ထည့်မည် (New UOM)" : "+ Add New UOM"}</span>
                  </button>
                </div>

                {/* UOM List with Selection, Inline Edit & Delete */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-600">
                    <span className="font-semibold">
                      {language === "my"
                        ? `အသုံးပြုနိုင်သော UOM စာရင်း (${uomList.length} မျိုး) — ကလစ်နှိပ်၍ ရွေးပါ:`
                        : `Available UOMs (${uomList.length}) — Click to select:`}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {language === "my" ? "✏️ Edit / 🗑️ Delete လုပ်နိုင်ပါသည်" : "Inline edit & delete supported"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-2 bg-white/80 rounded-xl border border-emerald-200/80 max-h-36 overflow-y-auto custom-scrollbar">
                    {uomList.map((unit, idx) => {
                      const isSelected = uom === unit;
                      const isEditingThis = editingUomIdx === idx;

                      if (isEditingThis) {
                        return (
                          <div
                            key={idx}
                            className="inline-flex items-center space-x-1 bg-white border-2 border-emerald-500 rounded-lg p-0.5 shadow-xs"
                          >
                            <input
                              type="text"
                              value={editingUomText}
                              onChange={(e) => setEditingUomText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveEditUom(idx);
                                } else if (e.key === "Escape") {
                                  setEditingUomIdx(null);
                                }
                              }}
                              autoFocus
                              className="px-1.5 py-0.5 text-xs font-bold text-slate-900 w-24 bg-slate-50 rounded focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditUom(idx)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                              title="Save Name"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUomIdx(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={unit}
                          onClick={() => setUom(unit)}
                          className={`group inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-700 text-white shadow-xs border border-emerald-800"
                              : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-emerald-200" />}
                          <span>{unit}</span>

                          {/* Inline Edit & Delete controls */}
                          <div className="flex items-center space-x-0.5 ml-1 opacity-70 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => handleStartEditUom(idx, e)}
                              className={`p-0.5 rounded hover:bg-black/10 transition-colors ${
                                isSelected ? "text-emerald-200 hover:text-white" : "text-slate-400 hover:text-slate-700"
                              }`}
                              title="Edit UOM Name"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            {uomList.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteUom(unit, e)}
                                className={`p-0.5 rounded hover:bg-black/10 transition-colors ${
                                  isSelected ? "text-emerald-200 hover:text-rose-200" : "text-slate-400 hover:text-rose-600"
                                }`}
                                title="Delete UOM"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

          {/* TAB 2: 5-TIER BASE SELLING PRICES (FULL CRUD: NEW / EDIT NAME & PRICE / DELETE / PRESETS) */}
          {activeTab === "PRICING" && (
            <div className="space-y-5 animate-fade-in">
              {/* Cost Price Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>{language === "my" ? "မူရင်းဝယ်ဈေး (Base Cost Price - COGS)" : "Base Cost Price (COGS)"}</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === "my"
                      ? "ကုန်ပစ္စည်းတစ်ခုချင်းစီ၏ ဝယ်ယူရရှိသော ကုန်ကျစရိတ်ဖြစ်ပြီး အောက်ပါရောင်းဈေးများ၏ အမြတ် (Margin %) ကို တွက်ချက်ရာတွင် အသုံးပြုပါသည်"
                      : "Direct acquisition cost used to calculate profit margins and markups across all selling tiers"}
                  </p>
                </div>
                <div className="w-full sm:w-48">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={costPrice}
                      onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 text-right focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right mt-0.5">
                    {formatCurrency(costPrice, currency as any, language as any)} / {uom}
                  </div>
                </div>
              </div>

              {/* 5-Tier Selling Price Header & Templates */}
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-1 border-b border-slate-200">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-900 text-xs">
                        {language === "my"
                          ? `ရောင်းဈေး ၅ မျိုး စီမံမှု (Base Selling Price Tiers — လက်ရှိ ${priceTiers.length} မျိုး)`
                          : `Base Selling Price Tiers (${priceTiers.length} Configured)`}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                        Editable Tiers
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === "my"
                        ? "Tier Name ပြောင်းခြင်း၊ ရောင်းဈေးပြောင်းခြင်း၊ အသစ်ထည့်ခြင်း (New) နှင့် ဖျက်ခြင်း (Delete) များကို လွတ်လပ်စွာ လုပ်ဆောင်နိုင်ပါသည်"
                        : "Freely edit tier names, adjust prices/margins, add new pricing tiers, delete tiers, or pick POS default"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* 1-Click Preset Templates */}
                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                      <span className="text-[10px] font-semibold text-slate-500 px-1">
                        {language === "my" ? "နမူနာပုံစံ:" : "Presets:"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApply5TierTemplate("OMNI")}
                        className="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[10px] font-semibold border border-slate-200 shadow-2xs transition-colors"
                        title="Retail, Wholesale, VIP, Dealer, Online"
                      >
                        Omni-5 Tiers
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApply5TierTemplate("VOLUME")}
                        className="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[10px] font-semibold border border-slate-200 shadow-2xs transition-colors"
                        title="Qty 1+, 5+, 10+, 50+, 100+"
                      >
                        Volume Tiers
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApply5TierTemplate("VIP")}
                        className="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[10px] font-semibold border border-slate-200 shadow-2xs transition-colors"
                        title="Standard, Silver, Gold, Platinum, Diamond"
                      >
                        VIP Club Tiers
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPriceTier}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-xs transition-colors text-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === "my" ? "ဈေးနှုန်းအသစ်ထည့်မည်" : "+ Add Price Tier"}</span>
                    </button>
                  </div>
                </div>

                {/* Price Tiers List (Dynamic Full CRUD) */}
                <div className="space-y-3">
                  {priceTiers.map((tier, idx) => {
                    const margin =
                      tier.price > 0 && costPrice > 0 ? ((tier.price - costPrice) / tier.price) * 100 : 0;
                    const profit = tier.price - costPrice;
                    const isDefault = tier.isDefault || idx === 0;

                    return (
                      <div
                        key={tier.id || idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDefault
                            ? "bg-emerald-50/70 border-emerald-400 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          {/* Left: Tier Number, Default Star & Names (EN & MY) */}
                          <div className="flex-1 w-full space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Tier Badge */}
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono shadow-2xs ${
                                  isDefault ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-800"
                                }`}
                              >
                                {idx + 1}
                              </span>

                              {/* Tier English Name Input */}
                              <div className="flex-1 min-w-[180px]">
                                <input
                                  type="text"
                                  value={tier.name}
                                  onChange={(e) => handleUpdatePriceTier(idx, "name", e.target.value)}
                                  className="w-full font-bold text-slate-900 bg-white border border-slate-300 hover:border-emerald-500 focus:border-emerald-600 focus:outline-none px-2.5 py-1 text-xs rounded-lg shadow-2xs"
                                  placeholder={`Tier ${idx + 1} Name (English)`}
                                />
                              </div>

                              {/* Tier Myanmar Localized Name Input */}
                              <div className="flex-1 min-w-[180px]">
                                <input
                                  type="text"
                                  value={tier.nameMy || ""}
                                  onChange={(e) => handleUpdatePriceTier(idx, "nameMy", e.target.value)}
                                  className="w-full text-slate-800 bg-white border border-slate-300 hover:border-emerald-500 focus:border-emerald-600 focus:outline-none px-2.5 py-1 text-xs rounded-lg shadow-2xs"
                                  placeholder={language === "my" ? "မြန်မာအမည် (ဥပမာ - လက်ကားဈေး)" : "Myanmar Name"}
                                />
                              </div>

                              {/* Default POS Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleUpdatePriceTier(idx, "isDefault", true)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all ${
                                  isDefault
                                    ? "bg-emerald-700 text-white shadow-2xs"
                                    : "bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800"
                                }`}
                                title="Click to set as primary default price for POS cash registers"
                              >
                                <Star className={`w-3 h-3 ${isDefault ? "fill-amber-300 text-amber-300" : ""}`} />
                                <span>{isDefault ? "Default POS Price" : "Set as Default"}</span>
                              </button>
                            </div>

                            {/* Sub-row: Min Order Qty, Profit & Margin info */}
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pl-8">
                              {/* Min Qty */}
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-500">Min Order:</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={tier.minQty || 1}
                                  onChange={(e) => handleUpdatePriceTier(idx, "minQty", e.target.value)}
                                  className="w-14 bg-white border border-slate-300 rounded-md px-1.5 py-0.5 text-center font-bold text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                                />
                                <span className="font-semibold text-slate-700">{uom}</span>
                              </div>

                              <span className="text-slate-300">|</span>

                              {/* Profit */}
                              <div>
                                Profit:{" "}
                                <span className={`font-mono font-bold ${profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                  {profit > 0 ? "+" : ""}
                                  {formatCurrency(profit, currency as any, language as any)}
                                </span>
                              </div>

                              <span className="text-slate-300">|</span>

                              {/* Margin */}
                              <div>
                                Margin:{" "}
                                <span
                                  className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                                    margin >= 20
                                      ? "bg-emerald-100 text-emerald-800"
                                      : margin >= 0
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {margin.toFixed(1)}%
                                </span>
                              </div>

                              {/* Quick Markup Calculation Chips */}
                              <div className="flex items-center space-x-1 ml-auto">
                                <span className="text-[10px] text-slate-400">Cost Markup:</span>
                                <button
                                  type="button"
                                  onClick={() => handleApplyMarkupToTier(idx, 10)}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 hover:bg-emerald-100 text-[10px] font-semibold text-slate-700"
                                >
                                  +10%
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyMarkupToTier(idx, 20)}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 hover:bg-emerald-100 text-[10px] font-semibold text-slate-700"
                                >
                                  +20%
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyMarkupToTier(idx, 30)}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 hover:bg-emerald-100 text-[10px] font-semibold text-slate-700"
                                >
                                  +30%
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyMarkupToTier(idx, 50)}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 hover:bg-emerald-100 text-[10px] font-semibold text-slate-700"
                                >
                                  +50%
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right: Price Input & Delete Button */}
                          <div className="flex items-center space-x-2.5 w-full lg:w-auto justify-end shrink-0">
                            <div className="w-44">
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 text-right">
                                {language === "my" ? `ရောင်းဈေး (${currency})` : `Selling Price (${currency})`}
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={tier.price}
                                onChange={(e) => handleUpdatePriceTier(idx, "price", e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 text-right focus:outline-none focus:border-emerald-600 shadow-2xs"
                              />
                            </div>

                            {/* Delete Tier Button */}
                            {priceTiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePriceTier(idx)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-colors mt-4.5"
                                title="Delete this price tier"
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
          {/* TAB 4: SERIAL & EXPIRED CODE ASSIGNMENT */}
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
                      ? "Yangon, MDY စသည့် ဆိုင်ခွဲအလိုက် လက်ကျန် Qty ပေါ်တွင် Barcode ဖတ်၍ Serial Number တွဲဆက်ခွဲကပ်နိုင်ပါသည်"
                      : "Assign & scan barcode serials directly onto Yangon, MDY branch on-hand quantities with expiry tracking"}
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
                  {/* Branch Stock & Assigned Progress Breakdown */}
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2.5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-blue-700" />
                        <span className="font-bold text-slate-800">
                          {language === "my" ? "ဆိုင်ခွဲအလိုက် လက်ကျန်နှင့် Serial အခြေအနေ:" : "Branch Stock & Assigned Serials:"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 font-mono text-[11px]">
                        <span className="text-slate-600">
                          Total Stock: <b>{Object.values(branchStock).reduce<number>((a, b) => a + Number(b || 0), 0)} {uom}</b>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-blue-900 font-bold">
                          Assigned: {serials.length} / {Object.values(branchStock).reduce<number>((a, b) => a + Number(b || 0), 0)}
                        </span>
                      </div>
                    </div>

                    {/* Branch Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {branches.map((b) => {
                        const bStock = Number(branchStock[b.id] || 0);
                        const bAssigned = serials.filter((s) => s.branchId === b.id).length;
                        const bRemaining = bStock - bAssigned;
                        const isSelected = newSerialBranch === b.id;
                        const isBalanced = bAssigned === bStock && bStock > 0;

                        return (
                          <div
                            key={b.id}
                            onClick={() => setNewSerialBranch(b.id)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300"
                                : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
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
                                    : bRemaining > 0
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {isBalanced ? "✅ Balanced" : bRemaining > 0 ? `${bRemaining} Missing` : "Complete"}
                              </span>
                            </div>

                            <div className="flex justify-between text-[11px] font-mono">
                              <span className={isSelected ? "text-blue-100" : "text-slate-600"}>Stock: {bStock}</span>
                              <span className={isSelected ? "text-white font-bold" : "text-blue-800 font-bold"}>
                                Serials: {bAssigned}
                              </span>
                            </div>

                            {/* Auto-fill button */}
                            {bRemaining > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const prefix = `SN-${(b.code || b.id).toUpperCase()}-`;
                                  const newItems: SerialItem[] = [];
                                  let cur = 1001;
                                  for (let i = 0; i < bRemaining; i++) {
                                    let cand = `${prefix}${String(cur + i).padStart(4, "0")}`;
                                    while (serials.some((s) => s.serial === cand)) {
                                      cur += 10;
                                      cand = `${prefix}${String(cur + i).padStart(4, "0")}`;
                                    }
                                    newItems.push({
                                      serial: cand,
                                      branchId: b.id,
                                      branchName: b.name,
                                      status: "AVAILABLE",
                                      expiryDate: newSerialExpiry || undefined,
                                      lotNumber: newSerialLot || undefined,
                                      createdAt: new Date().toISOString(),
                                    });
                                  }
                                  setSerials((prev) => [...newItems, ...prev]);
                                }}
                                className={`mt-1.5 w-full py-0.5 rounded text-[10px] font-bold transition-colors ${
                                  isSelected
                                    ? "bg-white text-blue-800 hover:bg-blue-50"
                                    : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                                }`}
                              >
                                + Auto-Fill {bRemaining} Serials
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add New Serial Entry Box with Barcode Scan */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs">
                    <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <Barcode className="w-4 h-4 text-blue-600" />
                      <span>
                        {language === "my"
                          ? "Barcode ဖတ် / ရိုက်ထည့်၍ Serial & Expired Code သတ်မှတ်ရန်"
                          : "Scan Barcode / Type Serial & Expiry Code"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Serial Number / Barcode *</label>
                        <input
                          type="text"
                          placeholder="e.g. SN-8823901 (Enter to add)"
                          value={newSerialInput}
                          onChange={(e) => setNewSerialInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSerial();
                            }
                          }}
                          className="w-full bg-slate-50 border border-blue-400 focus:border-blue-600 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Assign to Branch</label>
                        <select
                          value={newSerialBranch}
                          onChange={(e) => setNewSerialBranch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({serials.filter((s) => s.branchId === b.id).length}/{Number(branchStock[b.id] || 0)})
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
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Expired Date (သက်တမ်းကုန်ရက်)</label>
                        <input
                          type="date"
                          value={newSerialExpiry}
                          onChange={(e) => setNewSerialExpiry(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddSerial}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5"
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
                      <span className="text-[11px] text-slate-500 font-mono">UOM: {uom}</span>
                    </div>

                    {serials.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No serial numbers recorded yet. Use the inputs above to scan or enter individual serials.
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
                      ? "Yangon, MDY စသည့် ဆိုင်ခွဲအလိုက် လက်ကျန်အရေအတွက်များကို အရောင် (Color) နှင့် အရွယ်အစား (Size/Spec) စစ်တမ်းဖြင့် ဇယားကွက်ပုံစံ ထည့်သွင်းစီမံနိုင်ပါသည်"
                      : "Distribute on-hand inventory counts across Color x Size variant matrix per store branch"}
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
                  {/* Branch Stock & Matrix Allocation Breakdown Cards */}
                  <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2.5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-purple-700" />
                        <span className="font-bold text-slate-800">
                          {language === "my" ? "ဆိုင်ခွဲအလိုက် Matrix လက်ကျန် အခြေအနေ:" : "Branch Stock & Matrix Totals:"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 font-mono text-[11px]">
                        <span className="text-slate-600">
                          Physical Stock: <b>{Object.values(branchStock).reduce<number>((a, b) => a + Number(b || 0), 0)} {uom}</b>
                        </span>
                      </div>
                    </div>

                    {/* Branch Matrix Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {branches.map((b) => {
                        const bStock = Number(branchStock[b.id] || 0);
                        let bMatrixSum = 0;
                        matrixColors.forEach((c) => {
                          matrixSizes.forEach((s) => {
                            const k = `${c}__${s}__${b.id}`;
                            bMatrixSum += Number(matrixValues[k] || 0);
                          });
                        });
                        const bDiff = bStock - bMatrixSum;
                        const isSelected = selectedMatrixBranch === b.id;
                        const isBalanced = bMatrixSum === bStock && bStock > 0;

                        return (
                          <div
                            key={b.id}
                            onClick={() => setSelectedMatrixBranch(b.id)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? "bg-purple-700 text-white border-purple-800 shadow-xs ring-2 ring-purple-300"
                                : "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/40"
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
                                    : bDiff > 0
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {isBalanced ? "✅ Balanced" : bDiff > 0 ? `${bDiff} Missing` : "Complete"}
                              </span>
                            </div>

                            <div className="flex justify-between text-[11px] font-mono">
                              <span className={isSelected ? "text-purple-100" : "text-slate-600"}>Stock: {bStock}</span>
                              <span className={isSelected ? "text-white font-bold" : "text-purple-900 font-bold"}>
                                Matrix: {bMatrixSum}
                              </span>
                            </div>

                            {/* Auto Distribute button */}
                            {bDiff > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const totalCells = matrixColors.length * matrixSizes.length;
                                  if (totalCells === 0) return;
                                  const base = Math.floor(bStock / totalCells);
                                  let rem = bStock % totalCells;
                                  const updated = { ...matrixValues };
                                  matrixColors.forEach((c) => {
                                    matrixSizes.forEach((s) => {
                                      const k = `${c}__${s}__${b.id}`;
                                      updated[k] = base + (rem > 0 ? 1 : 0);
                                      if (rem > 0) rem--;
                                    });
                                  });
                                  setMatrixValues(updated);
                                }}
                                className={`mt-1.5 w-full py-0.5 rounded text-[10px] font-bold transition-colors ${
                                  isSelected
                                    ? "bg-white text-purple-900 hover:bg-purple-50"
                                    : "bg-purple-100 hover:bg-purple-200 text-purple-900"
                                }`}
                              >
                                ⚡ Distribute {bStock} {uom}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

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
