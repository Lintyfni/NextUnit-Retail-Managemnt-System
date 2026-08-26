export type AppLanguage = "en" | "my";
export type CurrencyCode = "MMK" | "USD";

export type RoleType = "HQ_ADMIN" | "BRANCH_MANAGER" | "CASHIER" | "WAREHOUSE_LEAD" | "ACCOUNTANT";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  branchId: string;
  branchName: string;
  avatar: string;
  phone: string;
  mfaEnabled: boolean;
  permissions: string[];
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  nameMy: string;
  city: string;
  address: string;
  phone: string;
  manager: string;
  registersCount: number;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  monthlyTarget: number;
  currentSales: number;
  cashFloat: number;
  warehouseCapacity: number; // in sq ft
  isHQ: boolean;
}

export interface CashRegister {
  id: string;
  branchId: string;
  name: string;
  status: "OPEN" | "CLOSED" | "LOCKED";
  currentCash: number;
  openedAt?: string;
  openedBy?: string;
  todayTransactions: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  nameMy: string;
  category: string;
  brand: string;
  costPrice: string | number;
  sellingPrice: number;
  image: string;
  hasIMEI: boolean; // Tracks serialized items like smartphones, laptops
  warrantyMonths: number;
  reorderLevel: number;
  safetyStock: number;
  leadTimeDays: number;
  supplierId: string;
  binLocation: string; // e.g. "Aisle 3, Shelf B-12"
  branchStock: Record<string, number>; // branchId -> quantity
  tags: string[];
  salesVelocity: number; // avg units per day
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  originalPrice?: number;
  discount: number; // in currency or %
  discountType: "FIXED" | "PERCENT";
  discountPercent?: number;
  isFOC?: boolean;
  focQuantity?: number;
  imeiList?: string[];
  notes?: string;
  cashbackAmount?: number;
}

export interface SplitPayment {
  method: "CASH" | "KBZPAY" | "WAVEPAY" | "CREDIT_CARD" | "BANK_TRANSFER" | "LOYALTY_POINTS" | "STORE_CREDIT";
  amount: number;
  referenceNumber?: string;
}

export interface SaleOrder {
  id: string;
  orderNumber: string;
  branchId: string;
  branchName: string;
  registerId: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number; // 5% commercial tax
  discountAmount: number;
  promoCode?: string;
  grandTotal: number;
  payments: SplitPayment[];
  changeGiven: number;
  status: "COMPLETED" | "HOLD" | "RETURNED" | "PARTIALLY_RETURNED" | "VOID";
  createdAt: string;
  imeiSold?: Record<string, string[]>; // productId -> serial numbers
  returnReason?: string;
  returnedItems?: { productId: string; quantity: number; refundAmount: number }[];
  deliveryTrackingNumber?: string;
  deliveryOption?: {
    enabled: boolean;
    deliveryTypeId?: string;
    deliveryTypeName?: string;
    address: string;
    recipientName: string;
    recipientPhone: string;
    notes?: string;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  destinationBranchId: string;
  destinationBranchName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    receivedQty: number;
  }[];
  totalAmount: number;
  status: "DRAFT" | "APPROVED" | "DISPATCHED" | "PARTIALLY_RECEIVED" | "GRN_COMPLETED" | "CANCELLED";
  paymentTerms: string;
  expectedDate: string;
  createdAt: string;
  grnNumber?: string;
  threeWayMatched?: boolean;
}

export interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  receivedDate: string;
  receivedBy: string;
  items: {
    productId: string;
    productName: string;
    expectedQty: number;
    acceptedQty: number;
    rejectedQty: number;
    rejectionReason?: string;
    assignedIMEIs?: string[];
  }[];
  inspectionStatus: "PASSED" | "PASSED_WITH_DISCREPANCY" | "REJECTED";
  remarks: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  membershipTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  loyaltyPoints: number;
  totalSpend: number;
  outstandingBalance: number;
  creditLimit: number;
  joinedDate: string;
  lastVisit: string;
  city: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  paymentTerms: string;
  onTimeDeliveryRate: number; // e.g. 96.5%
  rating: number; // 1 to 5
  outstandingPayable: number;
  leadTimeAvgDays: number;
  country: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
  }[];
  requestedBy: string;
  dispatchedAt?: string;
  receivedAt?: string;
  driverName?: string;
  vehicleNumber?: string;
  status: "REQUESTED" | "PENDING" | "IN_TRANSIT" | "RECEIVED" | "CANCELLED";
  notes: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  adjustedStock: number;
  difference: number;
  reason: "CYCLE_COUNT" | "DAMAGED" | "EXPIRED" | "SHRINKAGE_THEFT" | "PROMO_SAMPLE" | string;
  adjustedBy: string;
  date: string;
  approvedBy?: string;
}

export interface DeliveryType {
  id: string;
  code: string;
  name: string;
  nameMy: string;
  vehicleCategory: "MOTORBIKE" | "LIGHT_VAN" | "THREE_TON_TRUCK" | "SIX_WHEELER" | "TWELVE_WHEELER" | "COLD_CHAIN_REEFER";
  estimatedSLA: string; // e.g. "2-4 Hours (Same Day)", "24 Hours (Highway Express)", "48 Hours (Inter-State)"
  baseRate: number; // in MMK
  ratePerKm?: number;
  maxWeightKg: number;
  maxVolumeCbm?: number;
  activeVehiclesCount: number;
  status: "ACTIVE" | "INACTIVE";
  description?: string;
}

export interface WarehouseBin {
  id: string;
  binCode: string; // e.g. "BIN-YGN-A01-R2-01"
  warehouseId: string; // references branchId (e.g. BR-WH-01, BR-WH-MDY-01)
  warehouseName: string;
  warehouseCategory: "HIGH_VALUE_VAULT" | "COMPUTING_DISPLAYS" | "AUDIO_WEARABLES" | "FAST_MOVING_PICK" | "BULK_PALLET" | "DISPATCH_STAGING" | "QUARANTINE_RMA" | "GENERAL_STORAGE";
  zone: string; // e.g. "Zone A (High-Value Secured)", "Zone B (Heavy Computing)"
  aisle: string; // e.g. "A-01 to A-04"
  rack: string; // e.g. "Rack R-02"
  shelf: string; // e.g. "Shelf Tier 3"
  maxCapacityUnits: number;
  currentUnits: number;
  occupancyPercentage: number;
  designatedCategory: string; // e.g. "Smartphones, iPads", "MacBooks, Monitors"
  barcode: string;
  status: "AVAILABLE" | "NEAR_FULL" | "FULL" | "MAINTENANCE" | "RESERVED";
  notes?: string;
}

export interface DeliveryFleet {
  id: string;
  trackingNumber: string;
  orderId?: string;
  transferId?: string;
  deliveryTypeId?: string;
  deliveryTypeName?: string;
  warehouseId?: string;
  warehouseName?: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  driverName: string;
  driverPhone: string;
  vehicle: string;
  status: "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED";
  estimatedArrival: string;
  signatureUrl?: string;
}

export interface WarrantyClaim {
  id: string;
  ticketNumber: string;
  imeiOrSerial: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  saleDate: string;
  warrantyExpiryDate: string;
  issueDescription: string;
  technicianAssigned: string;
  status: "REGISTERED" | "DIAGNOSING" | "WAITING_PARTS" | "REPAIRED" | "REPLACED" | "CLOSED";
  costEstimate: number;
  dateOpened: string;
  resolvedDate?: string;
}

export interface AccountLedger {
  id: string;
  code: string;
  name: string;
  category: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  balance: number;
  normalBalance: "DEBIT" | "CREDIT";
}

export interface AccountingVoucher {
  id: string;
  voucherNumber: string;
  type: "CPV" | "CRV" | "BPV" | "JV"; // Cash Payment, Cash Receipt, Bank Payment, Journal
  date: string;
  branchId: string;
  branchName: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  narration: string;
  approvedBy: string;
  referenceNo?: string;
}

export interface PromotionRule {
  id: string;
  code: string;
  title: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "HAPPY_HOUR" | "BUY_X_GET_Y" | "TIER_DISCOUNT";
  discountValue: number;
  minSpend: number;
  startDate: string;
  endDate: string;
  active: boolean;
  branchRestrictions: string[]; // empty = all
  targetTiers?: string[];
  usageCount: number;
  usageLimit: number;
}

export interface DynamicPricingRule {
  id: string;
  name: string;
  targetCategory: string;
  ruleType: "TIME_WINDOW" | "VOLUME_TIER" | "REGIONAL_INDEX" | "CLEARANCE_AGING" | "DATE_RANGE" | "SPEND_CASHBACK";
  adjustmentValue: number; // e.g. -10 for 10% discount, +5 for 5% markup, or negative cash amount if fixed
  adjustmentType?: "PERCENTAGE" | "FIXED_AMOUNT";
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  minUnits?: number;
  minSpend?: number;
  cashbackAmount?: number;
  branchId?: string;
  agingDays?: number;
  description?: string;
  active: boolean;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  role: RoleType;
  branchId: string;
  branchName: string;
  email: string;
  phone: string;
  baseSalary: number;
  monthlyTargetSales: number;
  salesAchieved: number;
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
  clockedIn: boolean;
  clockInTime?: string;
  totalShiftHoursToday?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: RoleType;
  branchName: string;
  action: string;
  category: "POS" | "INVENTORY" | "PRICING" | "SECURITY" | "FINANCE" | "HRM" | "SYSTEM" | "CRM";
  ipAddress: string;
  details: string;
  riskScore: "NORMAL" | "MEDIUM" | "FLAGGED" | "LOW";
}

export type Account = AccountLedger;
export type FinancialVoucher = AccountingVoucher;
export type Promotion = PromotionRule;
export type User = UserProfile & { salary?: number };
export type DeliveryOrder = DeliveryFleet;
export type RMATicket = {
  id: string;
  ticketNumber: string;
  imei: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  branchName: string;
  issueDescription: string;
  assignedTechnician: string;
  repairCost: number;
  status: string;
  createdAt: string;
};


export interface AIForecastItem {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  confidenceScore: number;
  restockSuggested: number;
  riskLevel: "HIGH_STOCKOUT_RISK" | "MEDIUM" | "HEALTHY";
  seasonalityFactor: string;
}

export interface AIFraudAnomaly {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  timestamp: string;
  flaggedEntity: string;
  recommendation: string;
}
