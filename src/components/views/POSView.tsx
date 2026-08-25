import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, DICTIONARY } from "../../utils/helpers";
import { Product, Customer, SplitPayment, CartItem } from "../../types";
import { SerialNumberPicker, getProductSerialList } from "../pos/SerialNumberPicker";
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  CreditCard,
  QrCode,
  Banknote,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Tag,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Percent,
  Gift,
  Edit3,
  Coins,
  Filter,
  Layers,
  Boxes,
  Zap,
  CheckCircle2,
} from "lucide-react";

/**
 * Inline Cart Quantity Input that supports seamless typing without snapping on backspace
 */
interface CartQtyInputProps {
  value: number;
  onChange: (qty: number) => void;
}

const CartQtyInput: React.FC<CartQtyInputProps> = ({ value, onChange }) => {
  const [text, setText] = useState<string>(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setText(raw);
    if (raw !== "") {
      const parsed = parseInt(raw, 10);
      if (parsed > 0) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    if (text === "" || parseInt(text, 10) < 1) {
      setText(String(value || 1));
      onChange(value || 1);
    } else {
      const parsed = parseInt(text, 10);
      setText(String(parsed));
      onChange(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={(e) => e.target.select()}
      className="w-12 bg-slate-950 border border-slate-700 rounded text-center text-xs font-bold font-mono text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-0.5"
      title="Click and type any quantity (အရေအတွက် ရိုက်ထည့်ပါ)"
    />
  );
};

export const POSView: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    applyCartItemDiscount,
    toggleCartItemFOC,
    updateCartItemIMEI,
    removeFromCart,
    clearCart,
    parkCurrentCart,
    parkedTickets,
    restoreParkedCart,
    deleteParkedTicket,
    activeCustomer,
    setActiveCustomer,
    customers,
    completeSale,
    orders,
    goodsReceivedNotes,
    processReturn,
    activeBranchId,
    branches,
    currency,
    language,
    promotions,
    getDynamicPrice,
  } = useApp();

  const t = DICTIONARY[language];
  const currentBranch = branches.find((b) => b.id === (activeBranchId === "ALL" ? "BR-YGN-01" : activeBranchId)) || branches[0];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReturnsModal, setShowReturnsModal] = useState(false);
  const [showParkedModal, setShowParkedModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Split payment state
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [kbzPayAmount, setKbzPayAmount] = useState<number>(0);
  const [wavePayAmount, setWavePayAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [kbzPayRef, setKbzPayRef] = useState("");
  const [wavePayRef, setWavePayRef] = useState("");

  // Item Sales & Serial / Options Modal State (FOC & Discount % with flexible typing)
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [itemModalQuantityStr, setItemModalQuantityStr] = useState<string>("1");
  const [itemModalIMEI, setItemModalIMEI] = useState<string>("");
  const [itemModalIsFOC, setItemModalIsFOC] = useState<boolean>(false);
  const [itemModalFOCQuantityStr, setItemModalFOCQuantityStr] = useState<string>("1");
  const [itemModalIsDiscount, setItemModalIsDiscount] = useState<boolean>(false);
  const [itemModalDiscountPercentStr, setItemModalDiscountPercentStr] = useState<string>("10");

  // In-Cart Item Edit Modal
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
  const [editCartIsFOC, setEditCartIsFOC] = useState<boolean>(false);
  const [editCartFOCQtyStr, setEditCartFOCQtyStr] = useState<string>("1");
  const [editCartIsDiscount, setEditCartIsDiscount] = useState<boolean>(false);
  const [editCartDiscountPercentStr, setEditCartDiscountPercentStr] = useState<string>("10");
  const [editCartIMEI, setEditCartIMEI] = useState<string>("");

  // Global SN & Barcode Finder Modal State
  const [showSNFinderModal, setShowSNFinderModal] = useState<boolean>(false);
  const [snFinderQuery, setSnFinderQuery] = useState<string>("");

  // Returns state
  const [returnOrderId, setReturnOrderId] = useState("");
  const [returnReason, setReturnReason] = useState("Customer Change of Mind");
  const [returnItemSelection, setReturnItemSelection] = useState<Record<string, number>>({});

  const categories = ["All", "Smartphones", "Laptops & Computing", "Audio & Accessories", "Wearables", "Smart Home"];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Open item modal for product
  const handleOpenItemModal = (prod: Product) => {
    setSelectedProductForModal(prod);
    setItemModalQuantityStr("1");
    setItemModalIMEI(prod.hasIMEI ? `SN-${Date.now().toString().slice(-8)}` : "");
    setItemModalIsFOC(false);
    setItemModalFOCQuantityStr("1");
    setItemModalIsDiscount(false);
    setItemModalDiscountPercentStr("10");
  };

  // Confirm addition from item modal
  const handleConfirmAddToCart = () => {
    if (!selectedProductForModal) return;

    if (itemModalIsFOC) {
      const focQty = Math.max(1, parseInt(itemModalFOCQuantityStr) || 1);
      addToCart(selectedProductForModal, focQty, itemModalIMEI || undefined, {
        isFOC: true,
        focQuantity: focQty,
      });
    } else if (itemModalIsDiscount && parseFloat(itemModalDiscountPercentStr) > 0) {
      const saleQty = Math.max(1, parseInt(itemModalQuantityStr) || 1);
      const disPct = Math.min(100, Math.max(0, parseFloat(itemModalDiscountPercentStr) || 0));
      addToCart(selectedProductForModal, saleQty, itemModalIMEI || undefined, {
        discountPercent: disPct,
      });
    } else {
      const saleQty = Math.max(1, parseInt(itemModalQuantityStr) || 1);
      addToCart(selectedProductForModal, saleQty, itemModalIMEI || undefined);
    }

    setSelectedProductForModal(null);
  };

  // Open in-cart quick edit
  const handleOpenCartEdit = (idx: number) => {
    const item = cart[idx];
    if (!item) return;
    setEditingCartIndex(idx);
    setEditCartIsFOC(!!item.isFOC);
    setEditCartFOCQtyStr(String(item.focQuantity || item.quantity || 1));
    setEditCartIsDiscount(!!item.discountPercent && item.discountPercent > 0 && !item.isFOC);
    setEditCartDiscountPercentStr(String(item.discountPercent || 10));
    setEditCartIMEI(item.imeiList && item.imeiList.length > 0 ? item.imeiList[0] : "");
  };

  const handleSaveCartEdit = () => {
    if (editingCartIndex === null) return;
    if (editCartIsFOC) {
      const focQty = Math.max(1, parseInt(editCartFOCQtyStr) || 1);
      toggleCartItemFOC(editingCartIndex, true, focQty);
    } else if (editCartIsDiscount && parseFloat(editCartDiscountPercentStr) > 0) {
      const disPct = Math.min(100, Math.max(0, parseFloat(editCartDiscountPercentStr) || 0));
      applyCartItemDiscount(editingCartIndex, disPct, "PERCENT", disPct);
    } else {
      toggleCartItemFOC(editingCartIndex, false);
      applyCartItemDiscount(editingCartIndex, 0, "FIXED", 0);
    }
    updateCartItemIMEI(editingCartIndex, editCartIMEI.trim() ? [editCartIMEI.trim()] : []);
    setEditingCartIndex(null);
  };

  // Financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      if (item.isFOC) return acc; // FOC lines have 0 amount
      let line = item.unitPrice * item.quantity;
      return acc + Math.max(0, line);
    }, 0);
  }, [cart]);

  let promoDiscount = 0;
  let activePromoRule: (typeof promotions)[0] | undefined = undefined;
  if (appliedPromo) {
    const promo = promotions.find((p) => p.code.toUpperCase() === appliedPromo.toUpperCase() && p.active);
    if (promo) {
      activePromoRule = promo;
      if (promo.type === "PERCENTAGE" || promo.type === "TIER_DISCOUNT") {
        promoDiscount = (subtotal * promo.discountValue) / 100;
      } else {
        // FIXED_AMOUNT, HAPPY_HOUR, or direct cash discount
        promoDiscount = promo.discountValue;
      }
      promoDiscount = Math.min(subtotal, promoDiscount);
    }
  }

  // VIP Customer Perk
  let customerPerkDiscount = 0;
  if (activeCustomer?.membershipTier === "PLATINUM") {
    customerPerkDiscount = subtotal * 0.08; // 8% VIP discount
  } else if (activeCustomer?.membershipTier === "GOLD") {
    customerPerkDiscount = subtotal * 0.05; // 5% VIP discount
  }

  const effectiveDiscount = promoDiscount + customerPerkDiscount;
  const discountedSubtotal = Math.max(0, subtotal - effectiveDiscount);
  const taxAmount = Math.round(discountedSubtotal * 0.05); // 5% IRD Tax
  const grandTotal = discountedSubtotal + taxAmount;

  const totalPaid = cashAmount + kbzPayAmount + wavePayAmount + cardAmount;
  const balanceDue = Math.max(0, grandTotal - totalPaid);
  const changeDue = Math.max(0, totalPaid - grandTotal);

  // Quick Barcode Scan Simulation
  const handleSimulateScan = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    handleOpenItemModal(randomProduct);
  };

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;
    const found = promotions.find(
      (p) => p.code.toUpperCase() === promoCodeInput.trim().toUpperCase() && p.active
    );
    if (found) {
      if (found.minSpend && subtotal < found.minSpend) {
        alert(
          language === "my"
            ? `ဤ Coupon (${found.code}) ကို အသုံးပြုရန် အနည်းဆုံး ${formatCurrency(found.minSpend, currency, language)} ဖိုး ဝယ်ယူရပါမည်။ (လက်ရှိ: ${formatCurrency(subtotal, currency, language)})`
            : `Minimum spend of ${formatCurrency(found.minSpend, currency, language)} is required for coupon ${found.code}. (Current: ${formatCurrency(subtotal, currency, language)})`
        );
        return;
      }
      setAppliedPromo(found.code);
      setPromoCodeInput("");
    } else {
      alert(
        language === "my"
          ? "မှားယွင်းနေသော သို့မဟုတ် သက်တမ်းကုန်ဆုံးသွားသော Coupon Code ဖြစ်ပါသည်။"
          : "Invalid or expired coupon promo code."
      );
    }
  };

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCashAmount(grandTotal); // Default to full cash
    setKbzPayAmount(0);
    setWavePayAmount(0);
    setCardAmount(0);
    setShowPaymentModal(true);
  };

  const handleFinishCheckout = () => {
    if (totalPaid < grandTotal) {
      alert("Total payments must equal or exceed Grand Total.");
      return;
    }

    const payments: SplitPayment[] = [];
    if (cashAmount > 0) payments.push({ method: "CASH", amount: cashAmount });
    if (kbzPayAmount > 0) payments.push({ method: "KBZPAY", amount: kbzPayAmount, referenceNumber: kbzPayRef || `KP-${Date.now().toString().slice(-6)}` });
    if (wavePayAmount > 0) payments.push({ method: "WAVEPAY", amount: wavePayAmount, referenceNumber: wavePayRef || `WV-${Date.now().toString().slice(-6)}` });
    if (cardAmount > 0) payments.push({ method: "CREDIT_CARD", amount: cardAmount });

    completeSale(payments, appliedPromo || undefined);
    setShowPaymentModal(false);
    setAppliedPromo(null);
  };

  // Return Processing logic
  const handleExecuteReturn = () => {
    if (!returnOrderId) return;
    const itemsToRet = Object.entries(returnItemSelection)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([productId, quantity]) => ({ productId, quantity: Number(quantity) }));

    if (itemsToRet.length === 0) {
      alert("Please select at least 1 item and quantity to return.");
      return;
    }

    processReturn(returnOrderId, itemsToRet, returnReason);
    setShowReturnsModal(false);
    setReturnOrderId("");
    setReturnItemSelection({});
    alert("Return and refund processed successfully. Stock returned to inventory.");
  };

  return (
    <div id="pos-billing-view" className="space-y-4 animate-fade-in">
      {/* Top POS Action Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-100">
                {language === "my" ? "POS ကောင်တာ အရောင်းစနစ်" : "POS Billing & Fast Checkout"}
              </h1>
              <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-indigo-300 rounded font-mono font-semibold border border-slate-700">
                {currentBranch.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Barcode Ready • Split Payments • RMA Warranty Tracking</p>
          </div>
        </div>

        {/* Quick Utility Buttons */}
        <div className="flex items-center space-x-2">
          {/* Quick SN & Barcode Stock Finder Button */}
          <button
            id="quick-sn-lookup-btn"
            onClick={() => setShowSNFinderModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 hover:border-indigo-500/50 transition-colors"
            title="Browse and select available Serial Numbers with Stock Qty"
          >
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>{language === "my" ? "SN ရွေးချယ်/ရှာဖွေမည်" : "Select SN Code"}</span>
          </button>

          {/* Barcode Simulator */}
          <button
            id="simulate-barcode-scan-btn"
            onClick={handleSimulateScan}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            title="Simulate Barcode Scanner Hardware input"
          >
            <Barcode className="w-4 h-4 text-indigo-400" />
            <span>{language === "my" ? "ဘားကုတ် စကင်ဖတ်မည်" : "Scan Barcode"}</span>
          </button>

          {/* Parked Tickets */}
          <button
            id="parked-tickets-btn"
            onClick={() => setShowParkedModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors relative"
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>{language === "my" ? "ဆိုင်းငံ့အော်ဒါများ" : "Held Tickets"}</span>
            {parkedTickets.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {parkedTickets.length}
              </span>
            )}
          </button>

          {/* Returns & Refunds */}
          <button
            id="returns-refunds-btn"
            onClick={() => setShowReturnsModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>{language === "my" ? "ပစ္စည်းပြန်သွင်း/ငွေပြန်အမ်း" : "Returns & Refund"}</span>
          </button>
        </div>
      </div>

      {/* Main POS Split Layout: Products Grid (Left) & Active Cart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Product Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search & Category Filter Pills */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={language === "my" ? "SKU, ဘားကုတ်, ပစ္စည်းအမည် ဖြင့် ရှာပါ..." : "Search products by SKU, name, barcode..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white font-semibold shadow-sm"
                      : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
            {filteredProducts.map((prod) => {
              const currentStock = prod.branchStock[currentBranch.id] || 0;
              const isLowStock = currentStock <= prod.reorderLevel;

              return (
                <div
                  key={prod.id}
                  onClick={() => handleOpenItemModal(prod)}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/80 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-sm group"
                >
                  <div className="space-y-2">
                    <div className="h-28 w-full bg-slate-950 rounded-xl overflow-hidden relative">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {prod.hasIMEI && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-slate-900/90 text-indigo-300 font-mono text-[9px] font-bold rounded border border-indigo-500/30">
                          IMEI/SN
                        </span>
                      )}
                      <span
                        className={`absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold rounded ${
                          currentStock === 0
                            ? "bg-rose-500/80 text-white"
                            : isLowStock
                            ? "bg-amber-500/80 text-slate-950"
                            : "bg-emerald-500/80 text-white"
                        }`}
                      >
                        {currentStock} in stock
                      </span>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">{prod.sku}</div>
                      <h3 className="font-bold text-xs text-slate-200 line-clamp-2 leading-tight">
                        {prod.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">ရောင်းဈေး</div>
                      <span className="font-bold text-xs text-emerald-400 font-mono">
                        {formatCurrency(prod.sellingPrice, currency, language)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenItemModal(prod);
                      }}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ရောင်းမည်</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Cart & Checkout Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-md">
          {/* Cart Top: Customer Selector & Clear */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {activeCustomer ? `${activeCustomer.name} (${activeCustomer.membershipTier})` : "Assign VIP Customer"}
                  </span>
                </button>
                {activeCustomer && (
                  <button
                    onClick={() => setActiveCustomer(null)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => parkCurrentCart()}
                  disabled={cart.length === 0}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
                  title="Park / Hold Order"
                >
                  <PauseCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => clearCart()}
                  disabled={cart.length === 0}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cart Line Items - Formatted with high readability, justified layout, Selling Price & Discount % display */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>Cart is currently empty</span>
                  <p className="text-[11px] text-slate-600 mt-1">Select items or scan barcode to add</p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const originalSellingPrice = item.originalPrice || item.product.sellingPrice;
                  const hasDiscount = !item.isFOC && item.discountPercent && item.discountPercent > 0;
                  const dynEval = getDynamicPrice(item.product, item.quantity);
                  const matchedCashback = item.cashbackAmount || (dynEval.totalCashback > 0 ? dynEval.totalCashback : 0);

                  return (
                    <div
                      key={idx}
                      className="bg-slate-950/85 p-3 rounded-xl border border-slate-800/90 space-y-2 transition-all hover:border-slate-700"
                    >
                      {/* Top row: Item Name and Status Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-slate-100 text-xs leading-snug line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">{item.product.sku}</span>
                        </div>

                        {/* Badges for FOC or Discount */}
                        <div className="flex items-center gap-1 shrink-0">
                          {item.isFOC ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              <span>FOC (အခမဲ့)</span>
                            </span>
                          ) : hasDiscount ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              <span>Dis: -{item.discountPercent}%</span>
                            </span>
                          ) : null}

                          <button
                            onClick={() => removeFromCart(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="Remove from cart"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Middle row: Selling Price & Discount Breakdown & SN / Cash Back */}
                      <div className="flex items-center justify-between text-[11px] bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-slate-400">
                          <span>
                            {language === "my" ? "ရောင်းဈေး:" : "Selling Price:"}{" "}
                            {item.isFOC ? (
                              <span className="line-through text-slate-500 font-mono">
                                {formatCurrency(originalSellingPrice, currency, language)}
                              </span>
                            ) : hasDiscount ? (
                              <>
                                <span className="line-through text-slate-500 font-mono">
                                  {formatCurrency(originalSellingPrice, currency, language)}
                                </span>
                                <span className="text-amber-300 font-bold font-mono ml-1">
                                  {formatCurrency(item.unitPrice, currency, language)}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-200 font-mono font-medium">
                                {formatCurrency(item.unitPrice, currency, language)}
                              </span>
                            )}
                          </span>

                          {hasDiscount && (
                            <span className="text-amber-400/90 text-[10px] font-mono">
                              (-{item.discountPercent}%)
                            </span>
                          )}

                          {item.isFOC && (
                            <span className="text-emerald-400 font-bold font-mono">
                              0 Ks (Free)
                            </span>
                          )}
                        </div>

                        {/* Right: SN and Cash Back Amount */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {item.imeiList && item.imeiList.length > 0 && (
                            <div className="text-[10px] text-indigo-300 font-mono flex items-center gap-1 shrink-0">
                              <ShieldCheck className="w-3 h-3 text-indigo-400" />
                              <span>SN: {item.imeiList[0]}</span>
                            </div>
                          )}

                          {matchedCashback > 0 && (
                            <div
                              className="text-[10px] text-amber-300 font-mono font-bold flex items-center gap-1 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30"
                              title={language === "my" ? `Cash Back ပမာဏ: ${formatCurrency(matchedCashback, currency, language)}` : `Cash Back: ${formatCurrency(matchedCashback, currency, language)}`}
                            >
                              <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>({formatCurrency(matchedCashback, currency, language)} Cash Back)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom row: Quantity controls, Quick edit & Total Amount */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-900/80">
                        {/* Left: Quantity Adjuster & Quick Edit */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(idx, Math.max(1, item.quantity - 1))}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <CartQtyInput
                              value={item.quantity}
                              onChange={(newQty) => updateCartQuantity(idx, newQty)}
                            />
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleOpenCartEdit(idx)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
                            title="Edit FOC or Discount %"
                          >
                            <Edit3 className="w-3 h-3 text-indigo-400" />
                            <span>FOC / Dis %</span>
                          </button>
                        </div>

                        {/* Right: Calculated Line Total */}
                        <div className="text-right">
                          {item.isFOC ? (
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                              0 Ks
                            </span>
                          ) : hasDiscount ? (
                            <div>
                              <div className="text-[10px] line-through text-slate-500 font-mono leading-none">
                                {formatCurrency(originalSellingPrice * item.quantity, currency, language)}
                              </div>
                              <div className="text-xs font-mono font-bold text-amber-300 leading-tight">
                                {formatCurrency(item.unitPrice * item.quantity, currency, language)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-mono font-bold text-slate-100">
                              {formatCurrency(item.unitPrice * item.quantity, currency, language)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Cart Bottom: Coupon, Financial Totals, Complete Sale Button */}
          <div className="space-y-3 border-t border-slate-800 pt-3">
            {/* Promo Code Input & Active Coupon Display */}
            {appliedPromo ? (
              <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold">{appliedPromo}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        {activePromoRule?.type === "FIXED_AMOUNT" || activePromoRule?.type === "HAPPY_HOUR"
                          ? `-${formatCurrency(activePromoRule?.discountValue || promoDiscount, currency, language)} တိုက်ရိုက်လျှော့`
                          : `-${activePromoRule?.discountValue || 10}% OFF`}
                      </span>
                    </div>
                    {activePromoRule?.title && (
                      <p className="text-[10px] text-slate-400 truncate">{activePromoRule.title}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setAppliedPromo(null)}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  title="Remove Coupon"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  placeholder={language === "my" ? "Coupon Code (ဥပမာ CASH50K, WEEKEND10)" : "Coupon Code (e.g. CASH50K, WEEKEND10)"}
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyPromo();
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 uppercase focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
                >
                  {language === "my" ? "အသုံးပြုမည်" : "Apply"}
                </button>
              </div>
            )}

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatCurrency(subtotal, currency, language)}
                </span>
              </div>
              {effectiveDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discounts & VIP Perks:</span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(effectiveDiscount, currency, language)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Commercial Tax (5% IRD):</span>
                <span className="font-mono">{formatCurrency(taxAmount, currency, language)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-100 pt-1.5 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(grandTotal, currency, language)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              id="pos-pay-button"
              disabled={cart.length === 0}
              onClick={handleOpenPayment}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <Banknote className="w-4 h-4" />
              <span>
                {language === "my" ? "ငွေပေးချေမည်" : "Proceed to Payment"} (
                {formatCurrency(grandTotal, currency, language)})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Item Sales & Serial Modal with FOC & Discount % Options */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 text-slate-200 shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {language === "my" ? "အရောင်းအချက်အလက် & Serial / FOC / Dis % ရွေးချယ်မှု" : "Item Sale & Serial / FOC / Discount %"}
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure Serial, Free of Charge (FOC) or Item Discount %</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <img
                src={selectedProductForModal.image}
                alt={selectedProductForModal.name}
                className="w-12 h-12 object-cover rounded-lg bg-slate-900 border border-slate-800"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-slate-100 truncate">{selectedProductForModal.name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                  <span className="text-slate-400 font-mono">{selectedProductForModal.sku}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">
                    ရောင်းဈေး:{" "}
                    <strong className="text-emerald-400 font-mono">
                      {formatCurrency(selectedProductForModal.sellingPrice, currency, language)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Serial / IMEI input box with Barcode Scan, Direct Typing, & Filter Options */}
            <div className="pt-1">
              <SerialNumberPicker
                product={selectedProductForModal}
                branchId={currentBranch.id}
                selectedSN={itemModalIMEI}
                onChangeSN={setItemModalIMEI}
                language={language}
                grnList={goodsReceivedNotes}
                onEnterPress={handleConfirmAddToCart}
              />
            </div>

            {/* Options Grid: FOC vs Discount % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 1. FOC (Free of Charge) Option */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  itemModalIsFOC
                    ? "bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemModalIsFOC}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setItemModalIsFOC(checked);
                        if (checked) {
                          setItemModalIsDiscount(false);
                        }
                      }}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      <span>FOC (အခမဲ့ လက်ဆောင်)</span>
                    </span>
                  </label>
                </div>

                {itemModalIsFOC && (
                  <div className="mt-2.5 pt-2.5 border-t border-emerald-900/40 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">FOC Qty (အရေအတွက်):</span>
                      <div className="flex items-center space-x-1.5 bg-slate-900 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Math.max(1, parseInt(itemModalFOCQuantityStr) || 1);
                            setItemModalFOCQuantityStr(String(Math.max(1, cur - 1)));
                          }}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={itemModalFOCQuantityStr}
                          onChange={(e) => setItemModalFOCQuantityStr(e.target.value.replace(/[^0-9]/g, ""))}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmAddToCart();
                          }}
                          className="w-12 bg-transparent text-center text-xs font-bold font-mono text-emerald-300 focus:outline-none"
                          placeholder="1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Math.max(1, parseInt(itemModalFOCQuantityStr) || 1);
                            setItemModalFOCQuantityStr(String(cur + 1));
                          }}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Quick chips for FOC quantity */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 5, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setItemModalFOCQuantityStr(String(num))}
                          className={`flex-1 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            itemModalFOCQuantityStr === String(num)
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <div className="p-2 bg-emerald-950/60 rounded-lg text-[11px] text-emerald-300 font-medium border border-emerald-800/40">
                      ✓ Cart တွင် Amount = <strong>0 Ks (Free)</strong> ဖြင့် စာရင်းဝင်ပါမည်။
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Discount % Option */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  itemModalIsDiscount
                    ? "bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemModalIsDiscount}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setItemModalIsDiscount(checked);
                        if (checked) {
                          setItemModalIsFOC(false);
                        }
                      }}
                      className="w-4 h-4 rounded text-amber-600 bg-slate-900 border-slate-700 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      <span>Discount % (လျှော့ဈေး ရာခိုင်နှုန်း)</span>
                    </span>
                  </label>
                </div>

                {itemModalIsDiscount && (
                  <div className="mt-2.5 pt-2.5 border-t border-amber-900/40 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Dis % (ရာခိုင်နှုန်း ရိုက်ထည့်ပါ):</span>
                      <div className="flex items-center space-x-1 bg-slate-900 border border-amber-800/60 px-2 py-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Math.max(0, parseFloat(itemModalDiscountPercentStr) || 0);
                            setItemModalDiscountPercentStr(String(Math.max(0, cur - 1)));
                          }}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={itemModalDiscountPercentStr}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9.]/g, "");
                            setItemModalDiscountPercentStr(v);
                          }}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmAddToCart();
                          }}
                          className="w-14 bg-transparent text-center text-xs font-bold font-mono text-amber-300 focus:outline-none"
                          placeholder="10"
                        />
                        <span className="text-amber-400 text-xs font-bold">%</span>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Math.max(0, parseFloat(itemModalDiscountPercentStr) || 0);
                            setItemModalDiscountPercentStr(String(Math.min(100, cur + 1)));
                          }}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Quick discount presets */}
                    <div className="flex items-center gap-1">
                      {[5, 10, 15, 20, 25, 30, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setItemModalDiscountPercentStr(String(pct))}
                          className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors ${
                            itemModalDiscountPercentStr === String(pct)
                              ? "bg-amber-600 text-white border-amber-500"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Standard Quantity Selector (Only if not FOC) */}
            {!itemModalIsFOC && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {language === "my" ? "ရောင်းချမည့် အရေအတွက် (Qty ရိုက်ထည့်ပါ):" : "Sale Quantity (Enter Qty):"}
                  </span>
                  <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = Math.max(1, parseInt(itemModalQuantityStr) || 1);
                        setItemModalQuantityStr(String(Math.max(1, cur - 1)));
                      }}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={itemModalQuantityStr}
                      onChange={(e) => setItemModalQuantityStr(e.target.value.replace(/[^0-9]/g, ""))}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirmAddToCart();
                      }}
                      className="w-14 bg-transparent text-center font-bold text-slate-100 font-mono text-xs focus:outline-none"
                      placeholder="1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cur = Math.max(1, parseInt(itemModalQuantityStr) || 1);
                        setItemModalQuantityStr(String(cur + 1));
                      }}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Quantity Chips */}
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 5, 10, 25, 50, 100].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setItemModalQuantityStr(String(q))}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        itemModalQuantityStr === String(q)
                          ? "bg-indigo-600 text-white border-indigo-500"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Calculation Preview & Dynamic Pricing Feedback */}
            {(() => {
              const modalQty = Math.max(1, parseInt(itemModalQuantityStr) || 1);
              const modalDiscount = Math.min(100, Math.max(0, parseFloat(itemModalDiscountPercentStr) || 0));
              const dynamicCalculation = getDynamicPrice(
                selectedProductForModal,
                modalQty,
                currentBranch.id
              );
              const isDynamicModified = dynamicCalculation.appliedRule !== null;

              return (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>မူရင်းရောင်းဈေး:</span>
                    <span className="font-mono">
                      {formatCurrency(selectedProductForModal.sellingPrice, currency, language)} each
                    </span>
                  </div>

                  {/* Dynamic Pricing Notification */}
                  {!itemModalIsFOC && !itemModalIsDiscount && isDynamicModified && (
                    <div className="p-2 bg-indigo-950/50 border border-indigo-500/40 rounded-lg flex items-center justify-between text-[11px] text-indigo-300">
                      <span className="flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Dynamic Rule: {dynamicCalculation.appliedRule}</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(dynamicCalculation.unitPrice, currency, language)} / unit
                      </span>
                    </div>
                  )}

                  {itemModalIsFOC ? (
                    <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                      <span>ကျသင့်ငွေ (FOC Free):</span>
                      <span className="font-mono">0 Ks</span>
                    </div>
                  ) : itemModalIsDiscount && modalDiscount > 0 ? (
                    <>
                      <div className="flex justify-between text-amber-400">
                        <span>လျှော့ဈေး (-{modalDiscount}%):</span>
                        <span className="font-mono">
                          -
                          {formatCurrency(
                            ((selectedProductForModal.sellingPrice * modalDiscount) / 100) * modalQty,
                            currency,
                            language
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-100 font-bold pt-1 border-t border-slate-800">
                        <span>စုစုပေါင်း ကျသင့်ငွေ:</span>
                        <span className="font-mono text-emerald-400">
                          {formatCurrency(
                            (selectedProductForModal.sellingPrice -
                              (selectedProductForModal.sellingPrice * modalDiscount) / 100) *
                              modalQty,
                            currency,
                            language
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-100 font-bold pt-1 border-t border-slate-800">
                      <span>စုစုပေါင်း ကျသင့်ငွေ:</span>
                      <span className="font-mono text-emerald-400">
                        {formatCurrency(
                          dynamicCalculation.unitPrice * modalQty,
                          currency,
                          language
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                {language === "my" ? "ပယ်ဖျက်မည်" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmAddToCart}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all hover:scale-[1.02]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "my" ? "Cart ထဲသို့ ထည့်မည်" : "Add to Cart"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Cart Quick Edit Modal (FOC / Discount %) */}
      {editingCartIndex !== null && cart[editingCartIndex] && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-slate-200 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>{language === "my" ? "Cart ပစ္စည်း FOC / Discount % ပြင်ဆင်ခြင်း" : "Edit Cart Line Options"}</span>
              </h3>
              <button onClick={() => setEditingCartIndex(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="font-bold text-slate-100">{cart[editingCartIndex].product.name}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  မူရင်းရောင်းဈေး:{" "}
                  <span className="font-mono text-emerald-400">
                    {formatCurrency(
                      cart[editingCartIndex].originalPrice || cart[editingCartIndex].product.sellingPrice,
                      currency,
                      language
                    )}
                  </span>
                </div>
              </div>

              {/* In-Cart Serial Number Picker */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <SerialNumberPicker
                  product={cart[editingCartIndex].product}
                  branchId={currentBranch.id}
                  selectedSN={editCartIMEI}
                  onChangeSN={setEditCartIMEI}
                  language={language}
                  grnList={goodsReceivedNotes}
                  onEnterPress={handleSaveCartEdit}
                  label={language === "my" ? "Serial Number / Expired ပြင်ဆင်ရန်" : "Edit Serial Number / Expired"}
                />
              </div>

              {/* FOC Option */}
              <div
                className={`p-3 rounded-xl border ${
                  editCartIsFOC ? "bg-emerald-950/30 border-emerald-500/50" : "bg-slate-950 border-slate-800"
                }`}
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCartIsFOC}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditCartIsFOC(checked);
                      if (checked) setEditCartIsDiscount(false);
                    }}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    <span>FOC (Free of Charge / အခမဲ့) - 0 Ks</span>
                  </span>
                </label>

                {editCartIsFOC && (
                  <div className="mt-2 pt-2 border-t border-emerald-900/40 flex items-center justify-between">
                    <span className="text-slate-300">FOC Quantity:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editCartFOCQtyStr}
                      onChange={(e) => setEditCartFOCQtyStr(e.target.value.replace(/[^0-9]/g, ""))}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveCartEdit();
                      }}
                      className="w-16 bg-slate-900 border border-emerald-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-emerald-300 text-xs"
                      placeholder="1"
                    />
                  </div>
                )}
              </div>

              {/* Discount % Option */}
              <div
                className={`p-3 rounded-xl border space-y-2 ${
                  editCartIsDiscount ? "bg-amber-950/30 border-amber-500/50" : "bg-slate-950 border-slate-800"
                }`}
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCartIsDiscount}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditCartIsDiscount(checked);
                      if (checked) setEditCartIsFOC(false);
                    }}
                    className="w-4 h-4 rounded text-amber-600 bg-slate-900 border-slate-700 focus:ring-amber-500"
                  />
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Discount % (ပစ္စည်းသီးသန့် လျှော့ဈေး)</span>
                  </span>
                </label>

                {editCartIsDiscount && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Discount % (ရိုက်ထည့်ပါ):</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editCartDiscountPercentStr}
                          onChange={(e) => setEditCartDiscountPercentStr(e.target.value.replace(/[^0-9.]/g, ""))}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveCartEdit();
                          }}
                          className="w-16 bg-slate-900 border border-amber-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-300 text-xs"
                          placeholder="10"
                        />
                        <span className="text-amber-400 font-bold">%</span>
                      </div>
                    </div>

                    {/* Quick discount chips */}
                    <div className="flex items-center gap-1">
                      {[5, 10, 15, 20, 25, 30, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setEditCartDiscountPercentStr(String(pct))}
                          className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors ${
                            editCartDiscountPercentStr === String(pct)
                              ? "bg-amber-600 text-white border-amber-500"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingCartIndex(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCartEdit}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100">Multi-Method Split Payment</h3>
                <p className="text-[11px] text-slate-400">Total Payable: {formatCurrency(grandTotal, currency, language)}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Cash Field */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-semibold text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Cash Payment (Drawer)</span>
                  </span>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* KBZPay Field */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center font-semibold text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <QrCode className="w-4 h-4 text-blue-400" />
                    <span>KBZPay Merchant QR</span>
                  </span>
                  <input
                    type="number"
                    value={kbzPayAmount}
                    onChange={(e) => setKbzPayAmount(Number(e.target.value))}
                    className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {kbzPayAmount > 0 && (
                  <input
                    type="text"
                    placeholder="KBZPay Transaction ID Ref"
                    value={kbzPayRef}
                    onChange={(e) => setKbzPayRef(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono"
                  />
                )}
              </div>

              {/* WavePay Field */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center font-semibold text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>WavePay Merchant QR</span>
                  </span>
                  <input
                    type="number"
                    value={wavePayAmount}
                    onChange={(e) => setWavePayAmount(Number(e.target.value))}
                    className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {wavePayAmount > 0 && (
                  <input
                    type="text"
                    placeholder="WavePay Transaction ID Ref"
                    value={wavePayRef}
                    onChange={(e) => setWavePayRef(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono"
                  />
                )}
              </div>

              {/* Credit Card Field */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-semibold text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <span>Credit / Debit Card (MPU/Visa)</span>
                  </span>
                  <input
                    type="number"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(Number(e.target.value))}
                    className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Balance & Change Reconciliation */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Tendered:</span>
                  <span className="font-bold text-slate-200">{formatCurrency(totalPaid, currency, language)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Balance Due:</span>
                  <span className={`font-bold ${balanceDue > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {formatCurrency(balanceDue, currency, language)}
                  </span>
                </div>
                {changeDue > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                    <span>Change to Return:</span>
                    <span>{formatCurrency(changeDue, currency, language)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs"
              >
                Cancel
              </button>
              <button
                id="confirm-checkout-btn"
                disabled={totalPaid < grandTotal}
                onClick={handleFinishCheckout}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Confirm & Print Thermal Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Lookup & Assignment Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-200 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-100">Select Customer for Loyalty Points</h3>
              <button onClick={() => setShowCustomerModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar text-xs">
              {customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveCustomer(c);
                    setShowCustomerModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-slate-200">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.phone} • {c.membershipTier} Member</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
                      {c.loyaltyPoints} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Parked Tickets Modal */}
      {showParkedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-200 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-100">Held / Parked Tickets</h3>
              <button onClick={() => setShowParkedModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {parkedTickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No held orders found.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {parkedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{ticket.ticketName}</div>
                      <div className="text-[10px] text-slate-400">{ticket.items.length} items lines</div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          restoreParkedCart(ticket.id);
                          setShowParkedModal(false);
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                      >
                        Recall
                      </button>
                      <button
                        onClick={() => deleteParkedTicket(ticket.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Returns & Refund Modal */}
      {showReturnsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Process Sale Return & Restock</span>
              </h3>
              <button onClick={() => setShowReturnsModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Sale Invoice</label>
                <select
                  value={returnOrderId}
                  onChange={(e) => {
                    setReturnOrderId(e.target.value);
                    setReturnItemSelection({});
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Completed Invoice --</option>
                  {orders
                    .filter((o) => o.status === "COMPLETED")
                    .map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        {ord.orderNumber} ({formatCurrency(ord.grandTotal, currency, language)}) - {ord.customerName || "Walk-in"}
                      </option>
                    ))}
                </select>
              </div>

              {returnOrderId && (
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-slate-200 mb-1">Select Items to Return:</div>
                  {orders
                    .find((o) => o.id === returnOrderId)
                    ?.items.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <span className="truncate pr-2">
                          {item.product.name} (Max {item.quantity})
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={item.quantity}
                          value={returnItemSelection[item.product.id] || 0}
                          onChange={(e) =>
                            setReturnItemSelection({
                              ...returnItemSelection,
                              [item.product.id]: Number(e.target.value),
                            })
                          }
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center text-slate-100 font-mono"
                        />
                      </div>
                    ))}
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Return Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Customer Change of Mind">Customer Change of Mind</option>
                  <option value="Defective Hardware (Sent to RMA)">Defective Hardware (Sent to RMA)</option>
                  <option value="Wrong Specification Purchased">Wrong Specification Purchased</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowReturnsModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReturn}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-md"
              >
                Process Refund & Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Serial Number & Barcode Inventory Modal */}
      {showSNFinderModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-5 space-y-4 text-slate-200 shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {language === "my" ? "Serial Number / Expired ပစ္စည်းလက်ကျန် စစ်ဆေးရွေးချယ်ခြင်း" : "Serial Number / Expired & Stock Explorer"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === "my"
                      ? `ဆိုင်ခွဲ: ${currentBranch.name} တွင်ရှိသော Serial Number နှင့် လက်ကျန်စာရင်းများ`
                      : `Active Branch: ${currentBranch.name} • Filter available serials & current stock`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSNFinderModal(false);
                  setSnFinderQuery("");
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                autoFocus
                value={snFinderQuery}
                onChange={(e) => setSnFinderQuery(e.target.value)}
                placeholder={
                  language === "my"
                    ? "Serial Number (SN), Barcode, SKU သို့မဟုတ် ပစ္စည်းအမည်ဖြင့် ရှာဖွေပါ..."
                    : "Search by Serial Number (SN), Barcode, SKU, or Product Name..."
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              {snFinderQuery && (
                <button
                  onClick={() => setSnFinderQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* SN Records List with Stock Qty */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 min-h-[320px]">
              {(() => {
                // Collect all serialized items & serial list across products in current branch
                const allSerializedList: Array<{
                  product: Product;
                  snCode: string;
                  stockQty: number;
                  source: string;
                  location?: string;
                  warrantyMonths?: number;
                }> = [];

                products.forEach((prod) => {
                  const serials = getProductSerialList(prod, currentBranch.id, goodsReceivedNotes);
                  serials.forEach((sn) => {
                    allSerializedList.push({
                      product: prod,
                      snCode: sn.snCode,
                      stockQty: sn.qty,
                      source: sn.source || "INVENTORY_BATCH",
                      location: sn.binLocation,
                      warrantyMonths: sn.warrantyMonths,
                    });
                  });
                });

                const q = snFinderQuery.toLowerCase().trim();
                const filtered = allSerializedList.filter((item) => {
                  if (!q) return true;
                  return (
                    item.snCode.toLowerCase().includes(q) ||
                    item.product.name.toLowerCase().includes(q) ||
                    item.product.sku.toLowerCase().includes(q) ||
                    item.product.barcode.includes(q) ||
                    (item.location && item.location.toLowerCase().includes(q))
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      <Boxes className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
                      <p className="font-semibold text-slate-400">
                        {language === "my" ? "ကိုက်ညီသော Serial Number မတွေ့ရှိပါ" : "No matching serial numbers found"}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {language === "my"
                          ? "အခြားစကားလုံး သို့မဟုတ် SN Code ဖြင့် ပြန်လည်ရှာဖွေကြည့်ပါ"
                          : "Try searching with a different SN code or keyword"}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filtered.map((item, idx) => {
                      const isOutOfStock = item.stockQty <= 0;
                      return (
                        <div
                          key={`${item.product.id}-${item.snCode}-${idx}`}
                          className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                            isOutOfStock
                              ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                              : "bg-slate-950/80 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950"
                          }`}
                        >
                          <div>
                            {/* Product Title & Category */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="font-semibold text-xs text-slate-100 truncate">
                                  {item.product.name}
                                </h4>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-slate-500">{item.product.sku}</span>
                                  <span>•</span>
                                  <span className="text-slate-400">{item.product.category}</span>
                                </div>
                              </div>

                              {/* Price */}
                              <span className="font-mono font-bold text-xs text-emerald-400 shrink-0">
                                {formatCurrency(item.product.sellingPrice, currency, language)}
                              </span>
                            </div>

                            {/* SN Highlight Card */}
                            <div className="mt-2 p-2 rounded-lg bg-indigo-950/30 border border-indigo-900/40 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-indigo-300 font-semibold flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                                  <span>SN Code:</span>
                                </span>
                                <span className="text-xs font-mono font-bold text-indigo-200">
                                  {item.snCode}
                                </span>
                              </div>

                              {/* Stock Qty & Location */}
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-indigo-900/30">
                                <div className="flex items-center gap-1">
                                  <span>{language === "my" ? "လက်ကျန်:" : "Stock:"}</span>
                                  <span
                                    className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                      item.stockQty > 5
                                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                        : item.stockQty > 0
                                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                        : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                    }`}
                                  >
                                    {item.stockQty} {language === "my" ? "ခု" : "units"}
                                  </span>
                                </div>

                                {item.location && (
                                  <span className="text-slate-400 font-mono">
                                    Bin: {item.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Button: Add to Cart with SN */}
                          <div className="mt-3 pt-2 border-t border-slate-900/80 flex items-center justify-end">
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => {
                                addToCart(item.product, 1, item.snCode);
                                setShowSNFinderModal(false);
                                setSnFinderQuery("");
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950/40 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{language === "my" ? "Cart သို့ ထည့်မည် (ဒီ SN ဖြင့်)" : "Add to Cart (with SN)"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] text-slate-500">
                {language === "my"
                  ? "Serial Number ရွေးချယ်ပြီးပါက Cart သို့ တိုက်ရိုက်ထည့်သွင်းပေးပါမည်"
                  : "Selecting a Serial Number adds it directly to the active Cart"}
              </span>
              <button
                onClick={() => {
                  setShowSNFinderModal(false);
                  setSnFinderQuery("");
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
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
