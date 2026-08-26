import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  AppLanguage,
  CurrencyCode,
  UserProfile,
  Branch,
  CashRegister,
  Product,
  Customer,
  Supplier,
  SaleOrder,
  CartItem,
  SplitPayment,
  PurchaseOrder,
  GoodsReceivedNote,
  StockTransfer,
  StockAdjustment,
  DeliveryFleet,
  DeliveryType,
  WarehouseBin,
  WarrantyClaim,
  AccountLedger,
  AccountingVoucher,
  PromotionRule,
  DynamicPricingRule,
  Employee,
  AuditLog,
} from "../types";
import {
  INITIAL_BRANCHES,
  INITIAL_REGISTERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_ORDERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GRN,
  INITIAL_STOCK_TRANSFERS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_DELIVERIES,
  INITIAL_DELIVERY_TYPES,
  INITIAL_WAREHOUSE_BINS,
  INITIAL_WARRANTY_CLAIMS,
  INITIAL_ACCOUNTS,
  INITIAL_VOUCHERS,
  INITIAL_PROMOTIONS,
  INITIAL_DYNAMIC_PRICING,
  INITIAL_EMPLOYEES,
  INITIAL_AUDIT_LOGS,
  INITIAL_USER_PROFILES,
} from "../mockData";

export interface ParkedTicket {
  id: string;
  ticketName: string;
  items: CartItem[];
  customer?: Customer;
  createdAt: string;
}

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  activeView: string;
  setActiveView: (v: string) => void;
  activeBranchId: string; // "ALL" or branchId
  setActiveBranchId: (id: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (u: UserProfile) => void;
  allUsers: UserProfile[];

  // Data Collections
  branches: Branch[];
  registers: CashRegister[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: SaleOrder[];
  purchaseOrders: PurchaseOrder[];
  goodsReceivedNotes: GoodsReceivedNote[];
  stockTransfers: StockTransfer[];
  stockAdjustments: StockAdjustment[];
  deliveries: DeliveryFleet[];
  deliveryTypes: DeliveryType[];
  warehouseBins: WarehouseBin[];
  warrantyClaims: WarrantyClaim[];
  accounts: AccountLedger[];
  chartOfAccounts: AccountLedger[];
  vouchers: AccountingVoucher[];
  promotions: PromotionRule[];
  dynamicPricing: DynamicPricingRule[];
  employees: Employee[];
  auditLogs: AuditLog[];
  rmaTickets: any[];
  createRMATicket: (ticket: any) => void;
  updateRMAStatus: (id: string, status: string) => void;

  // POS & Cart
  cart: CartItem[];
  parkedTickets: ParkedTicket[];
  activeCustomer: Customer | null;
  setActiveCustomer: (c: Customer | null) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    imei?: string,
    options?: { isFOC?: boolean; focQuantity?: number; discountPercent?: number }
  ) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  applyCartItemDiscount: (index: number, discount: number, type: "FIXED" | "PERCENT", discountPercent?: number) => void;
  toggleCartItemFOC: (index: number, isFOC: boolean, focQuantity?: number) => void;
  updateCartItemIMEI: (index: number, imeiList: string[]) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  parkCurrentCart: (name?: string) => void;
  restoreParkedCart: (id: string) => void;
  deleteParkedTicket: (id: string) => void;
  completeSale: (
    payments: SplitPayment[],
    discountCode?: string,
    extraOptions?: {
      customDiscountAmount?: number;
      redeemedPoints?: number;
      deliveryInfo?: {
        enabled: boolean;
        deliveryTypeId?: string;
        deliveryTypeName?: string;
        address: string;
        recipientName: string;
        recipientPhone: string;
        notes?: string;
      };
    }
  ) => SaleOrder | null;
  processReturn: (orderId: string, itemsToReturn: { productId: string; quantity: number }[], reason: string) => void;

  // Active Receipt Modal
  activeReceipt: SaleOrder | null;
  setActiveReceipt: (order: SaleOrder | null) => void;

  // AI Copilot
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;

  // Actions
  addAuditLog: (action: string, category: AuditLog["category"], details: string, riskScore?: AuditLog["riskScore"]) => void;
  createWarehouse: (warehouse: Omit<Branch, "id" | "currentSales" | "cashFloat">) => void;
  createDeliveryType: (type: Omit<DeliveryType, "id">) => void;
  updateDeliveryType: (type: DeliveryType) => void;
  deleteDeliveryType: (id: string) => void;
  createWarehouseBin: (bin: Omit<WarehouseBin, "id" | "occupancyPercentage">) => void;
  updateWarehouseBin: (bin: WarehouseBin) => void;
  deleteWarehouseBin: (id: string) => void;
  createDelivery: (delivery: Omit<DeliveryFleet, "id" | "trackingNumber">) => void;
  updateDeliveryStatus: (id: string, status: DeliveryFleet["status"]) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "poNumber" | "createdAt" | "status">) => void;
  createGRN: (grn: Omit<GoodsReceivedNote, "id" | "grnNumber">) => void;
  createStockTransfer: (transfer: Omit<StockTransfer, "id" | "transferNumber">) => void;
  updateStockTransferStatus: (id: string, status: StockTransfer["status"]) => void;
  createStockAdjustment: (adj: Omit<StockAdjustment, "id" | "adjustmentNumber" | "date">) => void;
  createWarrantyClaim: (claim: Omit<WarrantyClaim, "id" | "ticketNumber" | "dateOpened">) => void;
  updateWarrantyStatus: (id: string, status: WarrantyClaim["status"]) => void;
  createVoucher: (vch: Omit<AccountingVoucher, "id" | "voucherNumber">) => void;
  createProduct: (prod: Omit<Product, "id">) => void;
  updateProduct: (prod: Product) => void;
  createCustomer: (c: Omit<Customer, "id" | "loyaltyPoints" | "totalSpend" | "joinedDate">) => void;
  createSupplier: (s: Omit<Supplier, "id">) => void;
  createPromotion: (promo: Omit<PromotionRule, "id" | "usageCount">) => void;
  updatePromotion: (promo: PromotionRule) => void;
  deletePromotion: (id: string) => void;
  togglePromotionActive: (id: string) => void;
  createDynamicPricingRule: (rule: Omit<DynamicPricingRule, "id">) => void;
  updateDynamicPricingRule: (rule: DynamicPricingRule) => void;
  deleteDynamicPricingRule: (id: string) => void;
  toggleDynamicPricingRule: (id: string) => void;
  getDynamicPrice: (
    product: Product,
    quantity?: number,
    branchId?: string,
    targetTime?: string
  ) => {
    baseUnitPrice: number;
    adjustedUnitPrice: number;
    netAdjustmentPercent: number;
    appliedRules: DynamicPricingRule[];
    hasAdjustment: boolean;
  };
  toggleEmployeeClockIn: (employeeId: string) => void;
  toggleMFA: (enabled: boolean) => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [currency, setCurrency] = useState<CurrencyCode>("MMK");
  const [activeView, setActiveView] = useState<string>("pos");
  const [activeBranchId, setActiveBranchId] = useState<string>("ALL");
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_PROFILES[0]);
  const [allUsers] = useState<UserProfile[]>(INITIAL_USER_PROFILES);

  // Persistence in LocalStorage or initial seed
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem("omnichain_branches");
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [registers, setRegisters] = useState<CashRegister[]>(() => {
    const saved = localStorage.getItem("omnichain_registers");
    return saved ? JSON.parse(saved) : INITIAL_REGISTERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("omnichain_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("omnichain_customers");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem("omnichain_suppliers");
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [orders, setOrders] = useState<SaleOrder[]>(() => {
    const saved = localStorage.getItem("omnichain_orders");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem("omnichain_pos");
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [goodsReceivedNotes, setGoodsReceivedNotes] = useState<GoodsReceivedNote[]>(() => {
    const saved = localStorage.getItem("omnichain_grn");
    return saved ? JSON.parse(saved) : INITIAL_GRN;
  });

  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem("omnichain_transfers");
    return saved ? JSON.parse(saved) : INITIAL_STOCK_TRANSFERS;
  });

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem("omnichain_adjustments");
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ADJUSTMENTS;
  });

  const [deliveries, setDeliveries] = useState<DeliveryFleet[]>(() => {
    const saved = localStorage.getItem("omnichain_deliveries");
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>(() => {
    const saved = localStorage.getItem("omnichain_delivery_types");
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_TYPES;
  });

  const [warehouseBins, setWarehouseBins] = useState<WarehouseBin[]>(() => {
    const saved = localStorage.getItem("omnichain_warehouse_bins");
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSE_BINS;
  });

  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>(() => {
    const saved = localStorage.getItem("omnichain_warranty");
    return saved ? JSON.parse(saved) : INITIAL_WARRANTY_CLAIMS;
  });

  const [accounts, setAccounts] = useState<AccountLedger[]>(() => {
    const saved = localStorage.getItem("omnichain_accounts");
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [vouchers, setVouchers] = useState<AccountingVoucher[]>(() => {
    const saved = localStorage.getItem("omnichain_vouchers");
    return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
  });

  const [promotions, setPromotions] = useState<PromotionRule[]>(() => {
    const saved = localStorage.getItem("omnichain_promotions");
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [dynamicPricing, setDynamicPricing] = useState<DynamicPricingRule[]>(() => {
    const saved = localStorage.getItem("omnichain_dynpricing");
    return saved ? JSON.parse(saved) : INITIAL_DYNAMIC_PRICING;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem("omnichain_employees");
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("omnichain_auditlogs");
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Cart & POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [parkedTickets, setParkedTickets] = useState<ParkedTicket[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<SaleOrder | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("omnichain_branches", JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem("omnichain_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("omnichain_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("omnichain_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("omnichain_auditlogs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem("omnichain_deliveries", JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem("omnichain_delivery_types", JSON.stringify(deliveryTypes));
  }, [deliveryTypes]);

  useEffect(() => {
    localStorage.setItem("omnichain_warehouse_bins", JSON.stringify(warehouseBins));
  }, [warehouseBins]);

  useEffect(() => {
    localStorage.setItem("omnichain_promotions", JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem("omnichain_dynpricing", JSON.stringify(dynamicPricing));
  }, [dynamicPricing]);

  // Audit Logger Helper
  const addAuditLog = (
    action: string,
    category: AuditLog["category"],
    details: string,
    riskScore: AuditLog["riskScore"] = "NORMAL"
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      branchName: currentUser.branchName,
      action,
      category,
      ipAddress: "192.168.1." + Math.floor(Math.random() * 50 + 10),
      details,
      riskScore,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Dynamic Pricing Calculation Engine
  const getDynamicPrice = (
    product: Product,
    quantity: number = 1,
    branchId?: string,
    targetTime?: string,
    targetDate?: string
  ) => {
    const baseUnitPrice = Number(product.sellingPrice) || 0;
    let netAdjustmentPercent = 0;
    let netFixedDiscount = 0;
    const appliedRules: DynamicPricingRule[] = [];

    const nowTime = targetTime || new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const nowDate = targetDate || new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const targetBranch = branchId || (activeBranchId === "ALL" ? "BR-YGN-01" : activeBranchId);

    dynamicPricing
      .filter((r) => r.active)
      .forEach((rule) => {
        const categoryMatch =
          !rule.targetCategory ||
          rule.targetCategory === "All Categories" ||
          rule.targetCategory.toLowerCase() === "all price category" ||
          rule.targetCategory.toLowerCase() === product.category.toLowerCase();

        if (!categoryMatch) return;

        let matched = false;
        if (rule.ruleType === "TIME_WINDOW") {
          if (rule.startTime && rule.endTime) {
            if (rule.startTime <= rule.endTime) {
              if (nowTime >= rule.startTime && nowTime <= rule.endTime) {
                matched = true;
              }
            } else {
              if (nowTime >= rule.startTime || nowTime <= rule.endTime) {
                matched = true;
              }
            }
          } else {
            matched = true;
          }
        } else if (rule.ruleType === "VOLUME_TIER") {
          if (quantity >= (rule.minUnits || 1)) {
            matched = true;
          }
        } else if (rule.ruleType === "DATE_RANGE") {
          const isDateInRange =
            (!rule.startDate || nowDate >= rule.startDate) &&
            (!rule.endDate || nowDate <= rule.endDate);
          const isQtyMet = quantity >= (rule.minUnits || 1);
          if (isDateInRange && isQtyMet) {
            matched = true;
          }
        } else if (rule.ruleType === "SPEND_CASHBACK") {
          const lineSpend = baseUnitPrice * quantity;
          if (lineSpend >= (rule.minSpend || 0)) {
            matched = true;
          }
        } else if (rule.ruleType === "REGIONAL_INDEX") {
          if (!rule.branchId || rule.branchId === "ALL" || rule.branchId === targetBranch) {
            matched = true;
          }
        } else if (rule.ruleType === "CLEARANCE_AGING") {
          matched = true;
        }

        if (matched) {
          if (rule.adjustmentType === "FIXED_AMOUNT") {
            const fixedAmt = rule.cashbackAmount || Math.abs(rule.adjustmentValue);
            // Deduct per-unit equivalent of cashback or fixed discount
            const perUnitCashDiscount = Math.round(fixedAmt / Math.max(1, quantity));
            netFixedDiscount += perUnitCashDiscount;
          } else {
            netAdjustmentPercent += rule.adjustmentValue;
          }
          appliedRules.push(rule);
        }
      });

    let totalCashback = 0;
    appliedRules.forEach((r) => {
      if (r.ruleType === "SPEND_CASHBACK" || r.adjustmentType === "FIXED_AMOUNT" || (r.cashbackAmount && r.cashbackAmount > 0)) {
        totalCashback += (r.cashbackAmount || Math.abs(r.adjustmentValue) || 0);
      }
    });

    let adjustedUnitPrice = Math.round(baseUnitPrice * (1 + netAdjustmentPercent / 100));
    if (netFixedDiscount > 0) {
      adjustedUnitPrice = Math.max(0, adjustedUnitPrice - netFixedDiscount);
    }
    adjustedUnitPrice = Math.max(0, adjustedUnitPrice);

    return {
      baseUnitPrice,
      adjustedUnitPrice,
      netAdjustmentPercent,
      netFixedDiscount,
      totalCashback,
      appliedRules,
      hasAdjustment: appliedRules.length > 0 && (netAdjustmentPercent !== 0 || netFixedDiscount > 0),
    };
  };

  // POS Cart Management
  const addToCart = (
    product: Product,
    quantity = 1,
    imei?: string,
    options?: { isFOC?: boolean; focQuantity?: number; discountPercent?: number }
  ) => {
    setCart((prev) => {
      const isFOC = !!options?.isFOC;
      const focQty = options?.focQuantity || quantity || 1;
      const originalPrice = Number(product.sellingPrice) || 0;

      if (isFOC) {
        // Look for existing FOC item for this product
        const existingFocIndex = prev.findIndex((item) => item.product.id === product.id && item.isFOC);
        if (existingFocIndex > -1) {
          const updated = [...prev];
          const currentItem = updated[existingFocIndex];
          const newQty = currentItem.quantity + focQty;
          const imeiList = currentItem.imeiList ? [...currentItem.imeiList] : [];
          if (imei && !imeiList.includes(imei)) {
            imeiList.push(imei);
          }
          updated[existingFocIndex] = {
            ...currentItem,
            quantity: newQty,
            focQuantity: newQty,
            imeiList,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              product,
              quantity: focQty,
              focQuantity: focQty,
              unitPrice: 0, // FOC has 0 amount
              originalPrice,
              discount: originalPrice,
              discountPercent: 100,
              discountType: "PERCENT",
              isFOC: true,
              imeiList: imei ? [imei] : undefined,
            },
          ];
        }
      }

      // Check if custom manual discount percent was specified
      const isManualDiscount = options?.discountPercent !== undefined && options.discountPercent > 0;
      const existingIndex = prev.findIndex((item) => item.product.id === product.id && !item.isFOC);

      if (existingIndex > -1 && !isManualDiscount && prev[existingIndex].discountType !== "FIXED") {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;
        const dynPrice = getDynamicPrice(product, newQty);
        const unitPrice = dynPrice.adjustedUnitPrice;
        const discountAmt = Math.max(0, originalPrice - unitPrice);
        const discPct =
          dynPrice.netAdjustmentPercent !== 0
            ? Math.abs(dynPrice.netAdjustmentPercent)
            : originalPrice > 0
            ? Math.round((discountAmt / originalPrice) * 100)
            : 0;

        const imeiList = existing.imeiList ? [...existing.imeiList] : [];
        if (imei && !imeiList.includes(imei)) {
          imeiList.push(imei);
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          unitPrice,
          originalPrice,
          discount: discountAmt,
          discountPercent: discPct,
          discountType: "PERCENT",
          cashbackAmount: dynPrice.totalCashback > 0 ? dynPrice.totalCashback : undefined,
          notes: dynPrice.hasAdjustment ? dynPrice.appliedRules.map((r) => r.name).join(", ") : undefined,
          imeiList,
        };
        return updated;
      } else if (existingIndex > -1 && isManualDiscount) {
        const updated = [...prev];
        const currentItem = updated[existingIndex];
        const newQty = currentItem.quantity + quantity;
        const imeiList = currentItem.imeiList ? [...currentItem.imeiList] : [];
        if (imei && !imeiList.includes(imei)) {
          imeiList.push(imei);
        }
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          imeiList,
        };
        return updated;
      } else {
        let finalUnitPrice = originalPrice;
        let unitDiscount = 0;
        let discPct = 0;
        let dynamicNotes: string | undefined = undefined;
        let dynamicCashback: number | undefined = undefined;

        if (isManualDiscount) {
          discPct = options!.discountPercent!;
          unitDiscount = (originalPrice * discPct) / 100;
          finalUnitPrice = Math.max(0, originalPrice - unitDiscount);
        } else {
          // Check dynamic pricing
          const dynPrice = getDynamicPrice(product, quantity);
          if (dynPrice.hasAdjustment) {
            finalUnitPrice = dynPrice.adjustedUnitPrice;
            unitDiscount = Math.max(0, originalPrice - finalUnitPrice);
            discPct =
              dynPrice.netAdjustmentPercent !== 0
                ? Math.abs(dynPrice.netAdjustmentPercent)
                : originalPrice > 0
                ? Math.round((unitDiscount / originalPrice) * 100)
                : 0;
            dynamicNotes = dynPrice.appliedRules.map((r) => r.name).join(", ");
            if (dynPrice.totalCashback > 0) {
              dynamicCashback = dynPrice.totalCashback;
            }
          }
        }

        return [
          ...prev,
          {
            product,
            quantity,
            unitPrice: finalUnitPrice,
            originalPrice,
            discount: unitDiscount,
            discountPercent: discPct,
            discountType: discPct > 0 ? "PERCENT" : "FIXED",
            cashbackAmount: dynamicCashback,
            isFOC: false,
            notes: dynamicNotes,
            imeiList: imei ? [imei] : undefined,
          },
        ];
      }
    });
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;

      if (item.isFOC) {
        updated[index] = {
          ...item,
          quantity,
          focQuantity: quantity,
        };
        return updated;
      }

      const originalPrice = item.originalPrice || item.product.sellingPrice;
      let unitPrice = item.unitPrice;
      let discount = item.discount;
      let discountPercent = item.discountPercent;
      let notes = item.notes;
      let cashbackAmount = item.cashbackAmount;

      // Re-evaluate dynamic tier if item is not locked with a manual fixed discount
      if (item.discountType !== "FIXED") {
        const dynPrice = getDynamicPrice(item.product, quantity);
        if (dynPrice.hasAdjustment) {
          unitPrice = dynPrice.adjustedUnitPrice;
          discount = Math.max(0, originalPrice - unitPrice);
          discountPercent =
            dynPrice.netAdjustmentPercent !== 0
              ? Math.abs(dynPrice.netAdjustmentPercent)
              : originalPrice > 0
              ? Math.round((discount / originalPrice) * 100)
              : 0;
          notes = dynPrice.appliedRules.map((r) => r.name).join(", ");
          cashbackAmount = dynPrice.totalCashback > 0 ? dynPrice.totalCashback : undefined;
        } else {
          unitPrice = originalPrice;
          discount = 0;
          discountPercent = 0;
          notes = undefined;
          cashbackAmount = undefined;
        }
      }

      updated[index] = {
        ...item,
        quantity,
        unitPrice,
        originalPrice,
        discount,
        discountPercent,
        cashbackAmount,
        notes,
      };
      return updated;
    });
  };

  const applyCartItemDiscount = (
    index: number,
    discount: number,
    type: "FIXED" | "PERCENT",
    discountPercent?: number
  ) => {
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;

      const originalPrice = item.originalPrice || item.product.sellingPrice;
      let unitPrice = item.unitPrice;
      let discPct = discountPercent || 0;

      if (type === "PERCENT") {
        discPct = discountPercent !== undefined ? discountPercent : discount;
        const unitDisc = (originalPrice * discPct) / 100;
        unitPrice = Math.max(0, originalPrice - unitDisc);
      } else {
        unitPrice = Math.max(0, originalPrice - discount);
      }

      updated[index] = {
        ...item,
        isFOC: false,
        unitPrice,
        originalPrice,
        discount,
        discountPercent: discPct,
        discountType: type,
      };
      return updated;
    });
  };

  const toggleCartItemFOC = (index: number, isFOC: boolean, focQuantity?: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;

      const originalPrice = item.originalPrice || item.product.sellingPrice;
      const targetQty = focQuantity !== undefined ? focQuantity : item.quantity;

      if (isFOC) {
        updated[index] = {
          ...item,
          isFOC: true,
          focQuantity: targetQty,
          quantity: targetQty,
          unitPrice: 0,
          originalPrice,
          discount: originalPrice,
          discountPercent: 100,
          discountType: "PERCENT",
        };
      } else {
        const discPct = item.discountPercent && item.discountPercent < 100 ? item.discountPercent : 0;
        const unitDisc = (originalPrice * discPct) / 100;
        updated[index] = {
          ...item,
          isFOC: false,
          unitPrice: originalPrice - unitDisc,
          originalPrice,
          discount: unitDisc,
          discountPercent: discPct,
          discountType: discPct > 0 ? "PERCENT" : "FIXED",
        };
      }
      return updated;
    });
  };

  const updateCartItemIMEI = (index: number, imeiList: string[]) => {
    setCart((prev) => {
      const updated = [...prev];
      if (!updated[index]) return prev;
      updated[index] = {
        ...updated[index],
        imeiList: imeiList.length > 0 ? imeiList : undefined,
      };
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setActiveCustomer(null);
  };

  const parkCurrentCart = (name?: string) => {
    if (cart.length === 0) return;
    const newTicket: ParkedTicket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      ticketName: name || `Held Order #${parkedTickets.length + 1}`,
      items: [...cart],
      customer: activeCustomer || undefined,
      createdAt: new Date().toISOString(),
    };
    setParkedTickets((prev) => [newTicket, ...prev]);
    clearCart();
    addAuditLog("PARKED_POS_ORDER", "POS", `Parked order ${newTicket.ticketName} with ${cart.length} item lines.`);
  };

  const restoreParkedCart = (id: string) => {
    const ticket = parkedTickets.find((t) => t.id === id);
    if (!ticket) return;
    setCart(ticket.items);
    if (ticket.customer) setActiveCustomer(ticket.customer);
    setParkedTickets((prev) => prev.filter((t) => t.id !== id));
    addAuditLog("RESTORED_PARKED_ORDER", "POS", `Restored parked ticket ${ticket.ticketName}`);
  };

  const deleteParkedTicket = (id: string) => {
    setParkedTickets((prev) => prev.filter((t) => t.id !== id));
  };

  // Complete Checkout Sale
  const completeSale = (
    payments: SplitPayment[],
    discountCode?: string,
    extraOptions?: {
      customDiscountAmount?: number;
      redeemedPoints?: number;
      deliveryInfo?: {
        enabled: boolean;
        deliveryTypeId?: string;
        deliveryTypeName?: string;
        address: string;
        recipientName: string;
        recipientPhone: string;
        notes?: string;
      };
    }
  ): SaleOrder | null => {
    if (cart.length === 0) return null;

    const currentBranch = branches.find((b) => b.id === (activeBranchId === "ALL" ? "BR-YGN-01" : activeBranchId)) || branches[0];
    const subtotal = cart.reduce((acc, item) => {
      if (item.isFOC) return acc + 0;
      const lineTotal = item.unitPrice * item.quantity;
      return acc + Math.max(0, lineTotal);
    }, 0);

    let promoDiscount = 0;
    if (discountCode) {
      const promo = promotions.find((p) => p.code.toUpperCase() === discountCode.toUpperCase() && p.active);
      if (promo) {
        if (promo.type === "PERCENTAGE" || promo.type === "TIER_DISCOUNT") {
          promoDiscount = (subtotal * promo.discountValue) / 100;
        } else {
          // FIXED_AMOUNT, HAPPY_HOUR, or direct cash value
          promoDiscount = promo.discountValue;
        }
        promoDiscount = Math.min(subtotal, promoDiscount);
      }
    }

    // Customer VIP Perk Discount
    let customerPerkDiscount = 0;
    if (activeCustomer?.membershipTier === "PLATINUM") {
      customerPerkDiscount = Math.round(subtotal * 0.08);
    } else if (activeCustomer?.membershipTier === "GOLD") {
      customerPerkDiscount = Math.round(subtotal * 0.05);
    }

    const pointsDiscount = extraOptions?.redeemedPoints ? extraOptions.redeemedPoints * 100 : 0; // 1 pt = 100 Ks
    const calculatedDiscount = promoDiscount + customerPerkDiscount + pointsDiscount;
    const finalDiscountAmount = Math.min(
      subtotal,
      extraOptions?.customDiscountAmount !== undefined
        ? extraOptions.customDiscountAmount
        : calculatedDiscount
    );

    const discountedSubtotal = Math.max(0, subtotal - finalDiscountAmount);
    const taxAmount = Math.round(discountedSubtotal * 0.05); // 5% Commercial Tax
    const grandTotal = discountedSubtotal + taxAmount;

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const changeGiven = Math.max(0, totalPaid - grandTotal);

    const imeiSoldMap: Record<string, string[]> = {};
    cart.forEach((c) => {
      if (c.imeiList && c.imeiList.length > 0) {
        imeiSoldMap[c.product.id] = c.imeiList;
      }
    });

    const orderNumber = `INV-${Date.now().toString().slice(-6)}`;
    let deliveryTrackingNumber: string | undefined = undefined;

    // If Fleet Delivery is requested for this sale order
    if (extraOptions?.deliveryInfo?.enabled) {
      deliveryTrackingNumber = `TRK-POS-${Date.now().toString().slice(-6)}`;
      const newDelivery: DeliveryFleet = {
        id: `DEL-${Date.now().toString().slice(-4)}`,
        trackingNumber: deliveryTrackingNumber,
        orderId: orderNumber,
        deliveryTypeId: extraOptions.deliveryInfo.deliveryTypeId || "DT-02",
        deliveryTypeName: extraOptions.deliveryInfo.deliveryTypeName || "Express Motorbike (Yangon Same-day)",
        warehouseId: currentBranch.id,
        warehouseName: currentBranch.name,
        recipientName: extraOptions.deliveryInfo.recipientName || activeCustomer?.name || "Walk-in VIP",
        recipientPhone: extraOptions.deliveryInfo.recipientPhone || activeCustomer?.phone || "09790123456",
        deliveryAddress: extraOptions.deliveryInfo.address || "Yangon Dispatch Delivery Address",
        driverName: "Ko Aung Kyaw (Fleet Courier)",
        driverPhone: "09-798881234",
        vehicle: "YGN 5B-8832 (Motorbike)",
        status: "ASSIGNED",
        estimatedArrival: new Date(Date.now() + 3 * 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setDeliveries((prev) => [newDelivery, ...prev]);
    }

    const newOrder: SaleOrder = {
      id: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
      orderNumber,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      registerId: "REG-YGN-01",
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: activeCustomer?.id,
      customerName: activeCustomer?.name,
      customerPhone: activeCustomer?.phone,
      items: [...cart],
      subtotal,
      discountAmount: finalDiscountAmount,
      promoCode: discountCode,
      taxAmount,
      grandTotal,
      payments,
      changeGiven,
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
      imeiSold: imeiSoldMap,
      deliveryTrackingNumber,
      deliveryOption: extraOptions?.deliveryInfo,
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const inCart = cart.find((c) => c.product.id === prod.id);
        if (!inCart) return prod;
        const currentBranchQty = prod.branchStock[currentBranch.id] || 0;
        return {
          ...prod,
          branchStock: {
            ...prod.branchStock,
            [currentBranch.id]: Math.max(0, currentBranchQty - inCart.quantity),
          },
        };
      })
    );

    // Update Customer loyalty points and spend
    if (activeCustomer) {
      setCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id === activeCustomer.id) {
            const pointsEarned = Math.floor(grandTotal / 10000); // 1 pt per 10,000 Ks
            const pointsSpent = extraOptions?.redeemedPoints || 0;
            return {
              ...cust,
              loyaltyPoints: Math.max(0, cust.loyaltyPoints - pointsSpent) + pointsEarned,
              totalSpend: cust.totalSpend + grandTotal,
              lastVisit: new Date().toISOString().slice(0, 10),
            };
          }
          return cust;
        })
      );
    }

    // Update Branch Sales
    setBranches((prev) =>
      prev.map((b) => (b.id === currentBranch.id ? { ...b, currentSales: b.currentSales + grandTotal } : b))
    );

    setOrders((prev) => [newOrder, ...prev]);
    setActiveReceipt(newOrder);
    clearCart();

    addAuditLog(
      "COMPLETED_POS_SALE",
      "POS",
      `Completed sale ${newOrder.orderNumber} for MMK ${grandTotal.toLocaleString()} by ${currentUser.name} (${currentBranch.name})${deliveryTrackingNumber ? ` [Fleet Delivery: ${deliveryTrackingNumber}]` : ""}.`
    );

    return newOrder;
  };

  // Process Returns & Refunds
  const processReturn = (orderId: string, itemsToReturn: { productId: string; quantity: number }[], reason: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    let totalRefund = 0;
    const returnedItemsList: { productId: string; quantity: number; refundAmount: number }[] = [];

    itemsToReturn.forEach((ret) => {
      const orderItem = order.items.find((i) => i.product.id === ret.productId);
      if (orderItem) {
        const itemRefund = orderItem.unitPrice * ret.quantity;
        totalRefund += itemRefund;
        returnedItemsList.push({ productId: ret.productId, quantity: ret.quantity, refundAmount: itemRefund });

        // Restock to inventory
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === ret.productId) {
              const currentStock = p.branchStock[order.branchId] || 0;
              return {
                ...p,
                branchStock: {
                  ...p.branchStock,
                  [order.branchId]: currentStock + ret.quantity,
                },
              };
            }
            return p;
          })
        );
      }
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: "RETURNED",
            returnReason: reason,
            returnedItems: returnedItemsList,
          };
        }
        return o;
      })
    );

    addAuditLog(
      "PROCESSED_SALE_RETURN",
      "POS",
      `Processed return for Invoice ${order.orderNumber}. Refund Amount: MMK ${totalRefund.toLocaleString()}. Reason: ${reason}`
    );
  };

  // Purchase Order & GRN
  const createPurchaseOrder = (poData: Omit<PurchaseOrder, "id" | "poNumber" | "createdAt" | "status">) => {
    const newPO: PurchaseOrder = {
      ...poData,
      id: `PO-${Date.now().toString().slice(-4)}`,
      poNumber: `PO-${new Date().toISOString().slice(2, 4)}${new Date().getMonth() + 1}-${Math.floor(100 + Math.random() * 900)}`,
      status: "APPROVED",
      createdAt: new Date().toISOString(),
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    addAuditLog("CREATED_PURCHASE_ORDER", "INVENTORY", `Created PO ${newPO.poNumber} for ${newPO.supplierName}`);
  };

  const createGRN = (grnData: Omit<GoodsReceivedNote, "id" | "grnNumber">) => {
    const newGRN: GoodsReceivedNote = {
      ...grnData,
      id: `GRN-${Date.now().toString().slice(-4)}`,
      grnNumber: `GRN-${Date.now().toString().slice(-6)}`,
    };

    // Update PO status
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.poNumber === grnData.poNumber ? { ...po, status: "GRN_COMPLETED", grnNumber: newGRN.grnNumber, threeWayMatched: true } : po))
    );

    // Increase stock at destination branch
    setProducts((prev) =>
      prev.map((prod) => {
        const grnItem = grnData.items.find((i) => i.productId === prod.id);
        if (grnItem) {
          const currentQty = prod.branchStock[grnData.branchId] || 0;
          return {
            ...prod,
            branchStock: {
              ...prod.branchStock,
              [grnData.branchId]: currentQty + grnItem.acceptedQty,
            },
          };
        }
        return prod;
      })
    );

    setGoodsReceivedNotes((prev) => [newGRN, ...prev]);
    addAuditLog("INSPECTED_GRN", "INVENTORY", `Processed GRN ${newGRN.grnNumber} for PO ${grnData.poNumber}.`);
  };

  // Stock Transfer Engine
  const createStockTransfer = (transferData: Omit<StockTransfer, "id" | "transferNumber">) => {
    const isDirectReceive = transferData.status === "RECEIVED";
    const isInTransit = transferData.status === "IN_TRANSIT";

    const newTransfer: StockTransfer = {
      ...transferData,
      id: `TRF-${Date.now().toString().slice(-4)}`,
      transferNumber: `TRF-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`,
      dispatchedAt: isInTransit || isDirectReceive ? new Date().toISOString() : transferData.dispatchedAt,
      receivedAt: isDirectReceive ? new Date().toISOString() : transferData.receivedAt,
    };

    // If Direct Transfer (RECEIVED): Deduct from source branch AND Add to destination branch immediately
    if (isDirectReceive) {
      setProducts((pList) =>
        pList.map((prod) => {
          const item = transferData.items.find((i) => i.productId === prod.id);
          if (item) {
            const fromQty = prod.branchStock[transferData.fromBranchId] || 0;
            const toQty = prod.branchStock[transferData.toBranchId] || 0;
            return {
              ...prod,
              branchStock: {
                ...prod.branchStock,
                [transferData.fromBranchId]: Math.max(0, fromQty - item.quantity),
                [transferData.toBranchId]: toQty + item.quantity,
              },
            };
          }
          return prod;
        })
      );
      addAuditLog(
        "RECEIVED_STOCK_TRANSFER",
        "INVENTORY",
        `Direct Transfer Completed ${newTransfer.transferNumber}: Transferred ${transferData.items.map(i => `${i.productName} (${i.quantity})`).join(", ")} from ${newTransfer.fromBranchName} to ${newTransfer.toBranchName}. Total stock balanced.`
      );
    } else if (isInTransit) {
      // If created directly in dispatched / in-transit state, immediately deduct from source branch
      setProducts((pList) =>
        pList.map((prod) => {
          const item = transferData.items.find((i) => i.productId === prod.id);
          if (item) {
            const fromQty = prod.branchStock[transferData.fromBranchId] || 0;
            return {
              ...prod,
              branchStock: {
                ...prod.branchStock,
                [transferData.fromBranchId]: Math.max(0, fromQty - item.quantity),
              },
            };
          }
          return prod;
        })
      );
      addAuditLog(
        "DISPATCHED_STOCK_TRANSFER",
        "INVENTORY",
        `Dispatched transfer ${newTransfer.transferNumber} from ${newTransfer.fromBranchName} to ${newTransfer.toBranchName} (${transferData.items.map(i => `${i.productName}: ${i.quantity}`).join(", ")})`
      );
    } else {
      addAuditLog(
        "REQUESTED_STOCK_TRANSFER",
        "INVENTORY",
        `Created transfer request ${newTransfer.transferNumber} from ${newTransfer.fromBranchName} to ${newTransfer.toBranchName}`
      );
    }

    setStockTransfers((prev) => [newTransfer, ...prev]);
  };

  const updateStockTransferStatus = (id: string, newStatus: StockTransfer["status"]) => {
    const targetTransfer = stockTransfers.find((t) => t.id === id);
    if (!targetTransfer) return;

    const oldStatus = targetTransfer.status;
    if (oldStatus === newStatus) return;

    // Case 1: DISPATCH (REQUESTED/PENDING -> IN_TRANSIT)
    // Deduct stock from source branch/warehouse ONLY. Destination is untouched.
    if ((oldStatus === "REQUESTED" || oldStatus === "PENDING") && newStatus === "IN_TRANSIT") {
      setProducts((pList) =>
        pList.map((prod) => {
          const item = targetTransfer.items.find((i) => i.productId === prod.id);
          if (item) {
            const fromQty = prod.branchStock[targetTransfer.fromBranchId] || 0;
            return {
              ...prod,
              branchStock: {
                ...prod.branchStock,
                [targetTransfer.fromBranchId]: Math.max(0, fromQty - item.quantity),
              },
            };
          }
          return prod;
        })
      );
      addAuditLog(
        "DISPATCHED_STOCK_TRANSFER",
        "INVENTORY",
        `Dispatched ${targetTransfer.transferNumber}: Deducted items from ${targetTransfer.fromBranchName} (In Transit to ${targetTransfer.toBranchName})`
      );
    }

    // Case 2: RECEIVE & RESTOCK (IN_TRANSIT -> RECEIVED)
    // Add stock to destination branch ONLY (source was already deducted during dispatch).
    else if (oldStatus === "IN_TRANSIT" && newStatus === "RECEIVED") {
      setProducts((pList) =>
        pList.map((prod) => {
          const item = targetTransfer.items.find((i) => i.productId === prod.id);
          if (item) {
            const toQty = prod.branchStock[targetTransfer.toBranchId] || 0;
            return {
              ...prod,
              branchStock: {
                ...prod.branchStock,
                [targetTransfer.toBranchId]: toQty + item.quantity,
              },
            };
          }
          return prod;
        })
      );
      addAuditLog(
        "RECEIVED_STOCK_TRANSFER",
        "INVENTORY",
        `Received & Restocked ${targetTransfer.transferNumber}: Added items to ${targetTransfer.toBranchName}`
      );
    }

    // Case 3: DIRECT IMMEDIATE RECEIPT (REQUESTED/PENDING -> RECEIVED)
    // Deduct from source AND Add to destination simultaneously (1 step)
    else if ((oldStatus === "REQUESTED" || oldStatus === "PENDING") && newStatus === "RECEIVED") {
      setProducts((pList) =>
        pList.map((prod) => {
          const item = targetTransfer.items.find((i) => i.productId === prod.id);
          if (item) {
            const fromQty = prod.branchStock[targetTransfer.fromBranchId] || 0;
            const toQty = prod.branchStock[targetTransfer.toBranchId] || 0;
            return {
              ...prod,
              branchStock: {
                ...prod.branchStock,
                [targetTransfer.fromBranchId]: Math.max(0, fromQty - item.quantity),
                [targetTransfer.toBranchId]: toQty + item.quantity,
              },
            };
          }
          return prod;
        })
      );
      addAuditLog(
        "RECEIVED_STOCK_TRANSFER",
        "INVENTORY",
        `Direct Transfer Completed ${targetTransfer.transferNumber}: Moved from ${targetTransfer.fromBranchName} to ${targetTransfer.toBranchName}`
      );
    }

    // Case 4: CANCEL IN-TRANSIT (IN_TRANSIT -> CANCELLED)
    // Refund / restore stock back to source branch
    else if (oldStatus === "IN_TRANSIT" && newStatus === "CANCELLED") {
      setProducts((pList) =>
        pList.map((prod) => {
          const item = targetTransfer.items.find((i) => i.productId === prod.id);
          if (item) {
            const fromQty = prod.branchStock[targetTransfer.fromBranchId] || 0;
            return {
              ...prod,
              branchStock: {
                ...prod.branchStock,
                [targetTransfer.fromBranchId]: fromQty + item.quantity,
              },
            };
          }
          return prod;
        })
      );
      addAuditLog(
        "CANCELLED_STOCK_TRANSFER",
        "INVENTORY",
        `Cancelled in-transit transfer ${targetTransfer.transferNumber}: Returned items back to ${targetTransfer.fromBranchName}`,
        "MEDIUM"
      );
    }

    // Case 5: CANCEL PENDING (REQUESTED/PENDING -> CANCELLED)
    else if ((oldStatus === "REQUESTED" || oldStatus === "PENDING") && newStatus === "CANCELLED") {
      addAuditLog(
        "CANCELLED_STOCK_TRANSFER",
        "INVENTORY",
        `Cancelled pending transfer request ${targetTransfer.transferNumber}`
      );
    }

    // Purely update the stock transfer record status
    setStockTransfers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: newStatus,
          dispatchedAt:
            newStatus === "IN_TRANSIT" || (newStatus === "RECEIVED" && !t.dispatchedAt)
              ? t.dispatchedAt || new Date().toISOString()
              : t.dispatchedAt,
          receivedAt: newStatus === "RECEIVED" ? new Date().toISOString() : t.receivedAt,
        };
      })
    );
  };

  // Stock Adjustment (Cycle Counts & Discrepancies)
  const createStockAdjustment = (adjData: any) => {
    const adjustedStock = Number(adjData.adjustedStock ?? adjData.adjustedQuantity ?? 0);
    const previousStock = Number(adjData.previousStock ?? adjData.previousQuantity ?? 0);
    const difference = adjustedStock - previousStock;

    const newAdj: StockAdjustment = {
      id: `ADJ-${Date.now().toString().slice(-4)}`,
      adjustmentNumber: `ADJ-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`,
      branchId: adjData.branchId,
      branchName: adjData.branchName,
      productId: adjData.productId,
      productName: adjData.productName,
      sku: adjData.sku || "",
      previousStock,
      adjustedStock,
      difference,
      reason: adjData.reason || "CYCLE_COUNT",
      adjustedBy: adjData.adjustedBy || currentUser.name,
      date: new Date().toISOString(),
      approvedBy: adjData.approvedBy || `${currentUser.name} (Auditor)`,
    };

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === adjData.productId) {
          return {
            ...prod,
            branchStock: {
              ...prod.branchStock,
              [adjData.branchId]: Math.max(0, adjustedStock),
            },
          };
        }
        return prod;
      })
    );

    setStockAdjustments((prev) => [newAdj, ...prev]);
    addAuditLog(
      "STOCK_ADJUSTMENT",
      "INVENTORY",
      `Adjusted physical count for ${adjData.productName} at ${adjData.branchName} from ${previousStock} to ${adjustedStock} (Diff: ${difference > 0 ? "+" : ""}${difference}, Reason: ${adjData.reason})`,
      Math.abs(difference) > 5 ? "FLAGGED" : "MEDIUM"
    );
  };

  // Warranty Claims
  const createWarrantyClaim = (claimData: Omit<WarrantyClaim, "id" | "ticketNumber" | "dateOpened">) => {
    const newClaim: WarrantyClaim = {
      ...claimData,
      id: `RMA-${Date.now().toString().slice(-4)}`,
      ticketNumber: `RMA-${Date.now().toString().slice(-6)}`,
      dateOpened: new Date().toISOString(),
    };
    setWarrantyClaims((prev) => [newClaim, ...prev]);
    addAuditLog("OPENED_WARRANTY_CLAIM", "POS", `Opened RMA ticket for Serial/IMEI ${claimData.imeiOrSerial}`);
  };

  const updateWarrantyStatus = (id: string, status: WarrantyClaim["status"]) => {
    setWarrantyClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, resolvedDate: status === "CLOSED" ? new Date().toISOString() : undefined } : c))
    );
  };

  // Accounting Vouchers
  const createVoucher = (vchData: Omit<AccountingVoucher, "id" | "voucherNumber">) => {
    const newVch: AccountingVoucher = {
      ...vchData,
      id: `VCH-${Date.now().toString().slice(-4)}`,
      voucherNumber: `${vchData.type}-${Date.now().toString().slice(-6)}`,
    };
    setVouchers((prev) => [newVch, ...prev]);
    addAuditLog("POSTED_ACCOUNTING_VOUCHER", "FINANCE", `Created ${newVch.voucherNumber} for MMK ${newVch.amount.toLocaleString()}`);
  };

  // CRUD for Products, Customers, Suppliers
  const createProduct = (prodData: Omit<Product, "id">) => {
    const newProd: Product = {
      ...prodData,
      id: `PROD-${(products.length + 1).toString().padStart(3, "0")}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    addAuditLog("CREATED_PRODUCT", "INVENTORY", `Added new SKU ${newProd.sku} - ${newProd.name}`);
  };

  const updateProduct = (prod: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
    addAuditLog("UPDATED_PRODUCT", "INVENTORY", `Updated details for ${prod.sku}`);
  };

  const createCustomer = (cData: Omit<Customer, "id" | "loyaltyPoints" | "totalSpend" | "joinedDate">) => {
    const newCust: Customer = {
      ...cData,
      id: `CUST-${(customers.length + 1).toString().padStart(3, "0")}`,
      loyaltyPoints: 100, // Welcome bonus points
      totalSpend: 0,
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    setCustomers((prev) => [newCust, ...prev]);
    addAuditLog("REGISTERED_CUSTOMER", "CRM", `Registered customer ${newCust.name} (${newCust.phone})`);
  };

  const createSupplier = (sData: Omit<Supplier, "id">) => {
    const newSup: Supplier = {
      ...sData,
      id: `SUP-${(suppliers.length + 1).toString().padStart(3, "0")}`,
    };
    setSuppliers((prev) => [newSup, ...prev]);
  };

  const createPromotion = (promoData: Omit<PromotionRule, "id" | "usageCount">) => {
    const newPromo: PromotionRule = {
      ...promoData,
      id: `PROMO-${(promotions.length + 1).toString().padStart(3, "0")}`,
      usageCount: 0,
    };
    setPromotions((prev) => [newPromo, ...prev]);
    addAuditLog(
      "CREATE_PROMOTION",
      "CRM",
      `Created coupon "${newPromo.code}" (${newPromo.type === "FIXED_AMOUNT" ? `${newPromo.discountValue.toLocaleString()} MMK Cash Discount` : `${newPromo.discountValue}% Off`})`
    );
  };

  const updatePromotion = (updatedPromo: PromotionRule) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === updatedPromo.id ? updatedPromo : p))
    );
    addAuditLog("UPDATE_PROMOTION", "CRM", `Updated coupon "${updatedPromo.code}"`);
  };

  const deletePromotion = (id: string) => {
    const target = promotions.find((p) => p.id === id);
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    addAuditLog("DELETE_PROMOTION", "CRM", `Deleted coupon "${target ? target.code : id}"`, "MEDIUM");
  };

  const togglePromotionActive = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const createDynamicPricingRule = (ruleData: Omit<DynamicPricingRule, "id">) => {
    const newRule: DynamicPricingRule = {
      ...ruleData,
      id: `DPR-${Date.now().toString().slice(-4)}`,
    };
    setDynamicPricing((prev) => [newRule, ...prev]);
    addAuditLog(
      "CREATE_PRICING_RULE",
      "PRICING",
      `Created dynamic pricing rule "${newRule.name}" (${newRule.ruleType}, ${newRule.adjustmentValue > 0 ? "+" : ""}${newRule.adjustmentValue}%)`
    );
  };

  const updateDynamicPricingRule = (updatedRule: DynamicPricingRule) => {
    setDynamicPricing((prev) =>
      prev.map((r) => (r.id === updatedRule.id ? updatedRule : r))
    );
    addAuditLog(
      "UPDATE_PRICING_RULE",
      "PRICING",
      `Updated dynamic pricing rule "${updatedRule.name}"`
    );
  };

  const deleteDynamicPricingRule = (id: string) => {
    const target = dynamicPricing.find((r) => r.id === id);
    setDynamicPricing((prev) => prev.filter((r) => r.id !== id));
    addAuditLog(
      "DELETE_PRICING_RULE",
      "PRICING",
      `Deleted dynamic pricing rule "${target ? target.name : id}"`,
      "MEDIUM"
    );
  };

  const toggleDynamicPricingRule = (id: string) => {
    setDynamicPricing((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextActive = !r.active;
          addAuditLog(
            "TOGGLE_PRICING_RULE",
            "PRICING",
            `Dynamic pricing rule "${r.name}" set to ${nextActive ? "ENABLED" : "DISABLED"}`
          );
          return { ...r, active: nextActive };
        }
        return r;
      })
    );
  };

  const toggleEmployeeClockIn = (empId: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          const newClockState = !emp.clockedIn;
          return {
            ...emp,
            clockedIn: newClockState,
            clockInTime: newClockState ? new Date().toISOString() : emp.clockInTime,
          };
        }
        return emp;
      })
    );
  };

  const toggleMFA = (enabled: boolean) => {
    setCurrentUser((prev) => ({ ...prev, mfaEnabled: enabled }));
    addAuditLog("MFA_POLICY_TOGGLED", "SECURITY", `MFA security setting set to ${enabled ? "ENABLED" : "DISABLED"} for ${currentUser.name}`);
  };

  // Warehouse Creation (YGN / MDY / Regional Warehouses)
  const createWarehouse = (whData: Omit<Branch, "id" | "currentSales" | "cashFloat">) => {
    const cityCode = (whData.city || "YGN").toUpperCase().slice(0, 3);
    const newId = `BR-WH-${cityCode}-${Date.now().toString().slice(-4)}`;
    const newWarehouse: Branch = {
      ...whData,
      id: newId,
      currentSales: 0,
      cashFloat: 500000,
    };

    setBranches((prev) => [...prev, newWarehouse]);

    // Initialize stock of 0 for this new warehouse across all existing products
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        branchStock: {
          ...p.branchStock,
          [newId]: p.branchStock[newId] ?? 0,
        },
      }))
    );

    addAuditLog(
      "CREATED_WAREHOUSE",
      "INVENTORY",
      `Constructed new Warehouse facility: [${newWarehouse.code}] ${newWarehouse.name} in ${newWarehouse.city}`
    );
  };

  // Delivery Types CRUD
  const createDeliveryType = (typeData: Omit<DeliveryType, "id">) => {
    const newId = `DT-${Date.now().toString().slice(-6)}`;
    const newType: DeliveryType = {
      ...typeData,
      id: newId,
    };
    setDeliveryTypes((prev) => [newType, ...prev]);
    addAuditLog(
      "CREATED_DELIVERY_TYPE",
      "INVENTORY",
      `Configured new Fleet Delivery Type: [${newType.code}] ${newType.name} (${newType.estimatedSLA})`
    );
  };

  const updateDeliveryType = (updated: DeliveryType) => {
    setDeliveryTypes((prev) => prev.map((dt) => (dt.id === updated.id ? updated : dt)));
    addAuditLog("UPDATED_DELIVERY_TYPE", "INVENTORY", `Updated Delivery Type ${updated.name}`);
  };

  const deleteDeliveryType = (id: string) => {
    const target = deliveryTypes.find((dt) => dt.id === id);
    setDeliveryTypes((prev) => prev.filter((dt) => dt.id !== id));
    addAuditLog(
      "DELETED_DELIVERY_TYPE",
      "INVENTORY",
      `Removed Delivery Type: ${target ? target.name : id}`,
      "MEDIUM"
    );
  };

  // Warehouse Bins & Layout CRUD
  const createWarehouseBin = (binData: Omit<WarehouseBin, "id" | "occupancyPercentage">) => {
    const maxCap = Math.max(1, Number(binData.maxCapacityUnits || 100));
    const currUnits = Number(binData.currentUnits || 0);
    const occupancyPercentage = Math.min(100, Math.round((currUnits / maxCap) * 100));
    const newId = `BIN-${Date.now().toString().slice(-6)}`;
    const newBin: WarehouseBin = {
      ...binData,
      id: newId,
      maxCapacityUnits: maxCap,
      currentUnits: currUnits,
      occupancyPercentage,
      barcode: binData.barcode || `BIN-${binData.binCode.replace(/\s+/g, "-").toUpperCase()}`,
    };
    setWarehouseBins((prev) => [newBin, ...prev]);
    addAuditLog(
      "CREATED_WAREHOUSE_BIN",
      "INVENTORY",
      `Allocated new Bin & Layout: ${newBin.binCode} (${newBin.zone}) for ${newBin.warehouseName}`
    );
  };

  const updateWarehouseBin = (updated: WarehouseBin) => {
    const maxCap = Math.max(1, Number(updated.maxCapacityUnits || 1));
    const currUnits = Number(updated.currentUnits || 0);
    const occupancyPercentage = Math.min(100, Math.round((currUnits / maxCap) * 100));
    const refreshed = { ...updated, maxCapacityUnits: maxCap, currentUnits: currUnits, occupancyPercentage };
    setWarehouseBins((prev) => prev.map((b) => (b.id === updated.id ? refreshed : b)));
    addAuditLog("UPDATED_WAREHOUSE_BIN", "INVENTORY", `Updated Bin ${updated.binCode}`);
  };

  const deleteWarehouseBin = (id: string) => {
    const target = warehouseBins.find((b) => b.id === id);
    setWarehouseBins((prev) => prev.filter((b) => b.id !== id));
    addAuditLog(
      "DELETED_WAREHOUSE_BIN",
      "INVENTORY",
      `Deleted Bin: ${target ? target.binCode : id}`,
      "MEDIUM"
    );
  };

  // Delivery creation and status updates
  const createDelivery = (delData: Omit<DeliveryFleet, "id" | "trackingNumber">) => {
    const newDel: DeliveryFleet = {
      ...delData,
      id: `DLV-${Date.now().toString().slice(-4)}`,
      trackingNumber: `TRK-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setDeliveries((prev) => [newDel, ...prev]);
    addAuditLog("CREATED_DELIVERY_DISPATCH", "INVENTORY", `Dispatched delivery ${newDel.trackingNumber} to ${newDel.recipientName}`);
  };

  const updateDeliveryStatus = (id: string, status: DeliveryFleet["status"]) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
    addAuditLog("UPDATED_DELIVERY_STATUS", "INVENTORY", `Delivery ${id} status changed to ${status}`);
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setBranches(INITIAL_BRANCHES);
    setRegisters(INITIAL_REGISTERS);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setOrders(INITIAL_ORDERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setGoodsReceivedNotes(INITIAL_GRN);
    setStockTransfers(INITIAL_STOCK_TRANSFERS);
    setStockAdjustments(INITIAL_STOCK_ADJUSTMENTS);
    setDeliveries(INITIAL_DELIVERIES);
    setDeliveryTypes(INITIAL_DELIVERY_TYPES);
    setWarehouseBins(INITIAL_WAREHOUSE_BINS);
    setWarrantyClaims(INITIAL_WARRANTY_CLAIMS);
    setAccounts(INITIAL_ACCOUNTS);
    setVouchers(INITIAL_VOUCHERS);
    setPromotions(INITIAL_PROMOTIONS);
    setDynamicPricing(INITIAL_DYNAMIC_PRICING);
    setEmployees(INITIAL_EMPLOYEES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCart([]);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      currency,
      setCurrency,
      activeView,
      setActiveView,
      activeBranchId,
      setActiveBranchId,
      currentUser,
      setCurrentUser,
      allUsers,
      branches,
      registers,
      products,
      customers,
      suppliers,
      orders,
      purchaseOrders,
      goodsReceivedNotes,
      stockTransfers,
      stockAdjustments,
      deliveries,
      deliveryTypes,
      warehouseBins,
      warrantyClaims,
      accounts,
      chartOfAccounts: accounts,
      vouchers,
      promotions,
      dynamicPricing,
      employees,
      auditLogs,
      rmaTickets: warrantyClaims,
      createRMATicket: createWarrantyClaim,
      updateRMAStatus: updateWarrantyStatus,
      cart,
      parkedTickets,
      activeCustomer,
      setActiveCustomer,
      addToCart,
      updateCartQuantity,
      applyCartItemDiscount,
      toggleCartItemFOC,
      updateCartItemIMEI,
      removeFromCart,
      clearCart,
      parkCurrentCart,
      restoreParkedCart,
      deleteParkedTicket,
      completeSale,
      processReturn,
      activeReceipt,
      setActiveReceipt,
      isCopilotOpen,
      setIsCopilotOpen,
      addAuditLog,
      createWarehouse,
      createDeliveryType,
      updateDeliveryType,
      deleteDeliveryType,
      createWarehouseBin,
      updateWarehouseBin,
      deleteWarehouseBin,
      createDelivery,
      updateDeliveryStatus,
      createPurchaseOrder,
      createGRN,
      createStockTransfer,
      updateStockTransferStatus,
      createStockAdjustment,
      createWarrantyClaim,
      updateWarrantyStatus,
      createVoucher,
      createProduct,
      updateProduct,
      createCustomer,
      createSupplier,
      createPromotion,
      updatePromotion,
      deletePromotion,
      togglePromotionActive,
      createDynamicPricingRule,
      updateDynamicPricingRule,
      deleteDynamicPricingRule,
      toggleDynamicPricingRule,
      getDynamicPrice,
      toggleEmployeeClockIn,
      toggleMFA,
      resetToDefaultData,
    }),
    [
      language,
      currency,
      activeView,
      activeBranchId,
      currentUser,
      allUsers,
      branches,
      registers,
      products,
      customers,
      suppliers,
      orders,
      purchaseOrders,
      goodsReceivedNotes,
      stockTransfers,
      stockAdjustments,
      deliveries,
      deliveryTypes,
      warehouseBins,
      warrantyClaims,
      accounts,
      vouchers,
      promotions,
      dynamicPricing,
      employees,
      auditLogs,
      cart,
      parkedTickets,
      activeCustomer,
      activeReceipt,
      isCopilotOpen,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
