import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { DynamicPricingRule } from "../../types";
import { formatCurrency, DICTIONARY } from "../../utils/helpers";
import {
  Tag,
  Clock,
  MapPin,
  Layers,
  Percent,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Search,
  SlidersHorizontal,
  Calculator,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Package,
  Calendar,
  Zap,
  Gift,
  Coins,
  DollarSign,
} from "lucide-react";

export const DynamicPricingView: React.FC = () => {
  const {
    dynamicPricing,
    createDynamicPricingRule,
    updateDynamicPricingRule,
    deleteDynamicPricingRule,
    toggleDynamicPricingRule,
    branches,
    products,
    currency,
    language,
  } = useApp();

  const t = DICTIONARY[language];

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form Fields with smooth string-backed inputs for natural typing & backspacing
  const [formName, setFormName] = useState<string>("");
  const [formTargetCategory, setFormTargetCategory] = useState<string>("All Categories");
  const [formRuleType, setFormRuleType] = useState<
    "TIME_WINDOW" | "VOLUME_TIER" | "REGIONAL_INDEX" | "CLEARANCE_AGING" | "DATE_RANGE" | "SPEND_CASHBACK"
  >("DATE_RANGE");
  const [formAdjustmentType, setFormAdjustmentType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [formAdjustmentMode, setFormAdjustmentMode] = useState<"DISCOUNT" | "MARKUP">("DISCOUNT");
  const [formAdjustmentPercentStr, setFormAdjustmentPercentStr] = useState<string>("10");
  const [formCashbackAmountStr, setFormCashbackAmountStr] = useState<string>("25000");
  const [formMinSpendStr, setFormMinSpendStr] = useState<string>("500000");
  const [formStartDate, setFormStartDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [formStartTime, setFormStartTime] = useState<string>("14:00");
  const [formEndTime, setFormEndTime] = useState<string>("18:00");
  const [formMinUnitsStr, setFormMinUnitsStr] = useState<string>("2");
  const [formBranchId, setFormBranchId] = useState<string>("ALL");
  const [formAgingDaysStr, setFormAgingDaysStr] = useState<string>("90");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>("");
  const [formSampleProductId, setFormSampleProductId] = useState<string>(products[0]?.id || "");

  // Live Pricing Simulator State
  const [simProductId, setSimProductId] = useState<string>(products[0]?.id || "");
  const [simQuantityStr, setSimQuantityStr] = useState<string>("2");
  const [simBranchId, setSimBranchId] = useState<string>(branches[0]?.id || "ALL");
  const [simDate, setSimDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [simTime, setSimTime] = useState<string>(() => {
    return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  });

  // Numeric equivalents safely derived
  const simQuantity = Math.max(1, parseInt(simQuantityStr) || 1);
  const formAdjustmentPercent = Math.max(0, parseFloat(formAdjustmentPercentStr) || 0);
  const formCashbackAmount = Math.max(0, parseFloat(formCashbackAmountStr) || 0);
  const formMinSpend = Math.max(0, parseFloat(formMinSpendStr) || 0);
  const formMinUnits = Math.max(1, parseInt(formMinUnitsStr) || 1);
  const formAgingDays = Math.max(1, parseInt(formAgingDaysStr) || 1);

  // Category List extracted from products + common options
  const productCategories = useMemo(() => {
    const categories = Array.from(new Set(products.map((p) => p.category)));
    return ["All Categories", ...categories];
  }, [products]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingRuleId(null);
    setFormName("");
    setFormTargetCategory("All Categories");
    setFormRuleType("DATE_RANGE");
    setFormAdjustmentType("PERCENTAGE");
    setFormAdjustmentMode("DISCOUNT");
    setFormAdjustmentPercentStr("12");
    setFormCashbackAmountStr("25000");
    setFormMinSpendStr("500000");
    const today = new Date().toISOString().split("T")[0];
    const end = new Date();
    end.setDate(end.getDate() + 14);
    setFormStartDate(today);
    setFormEndDate(end.toISOString().split("T")[0]);
    setFormStartTime("14:00");
    setFormEndTime("18:00");
    setFormMinUnitsStr("2");
    setFormBranchId("ALL");
    setFormAgingDaysStr("90");
    setFormDescription("");
    setFormActive(true);
    setFormError("");
    setFormSampleProductId(products[0]?.id || "");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (rule: DynamicPricingRule) => {
    setEditingRuleId(rule.id);
    setFormName(rule.name);
    setFormTargetCategory(rule.targetCategory || "All Categories");
    setFormRuleType(rule.ruleType);
    setFormAdjustmentType(rule.adjustmentType || (rule.cashbackAmount ? "FIXED_AMOUNT" : "PERCENTAGE"));
    setFormAdjustmentMode(rule.adjustmentValue < 0 || rule.cashbackAmount ? "DISCOUNT" : "MARKUP");
    setFormAdjustmentPercentStr(String(Math.abs(rule.adjustmentValue)));
    setFormCashbackAmountStr(String(rule.cashbackAmount || Math.abs(rule.adjustmentValue) || 25000));
    setFormMinSpendStr(String(rule.minSpend || 500000));
    setFormStartDate(rule.startDate || new Date().toISOString().split("T")[0]);
    setFormEndDate(rule.endDate || new Date().toISOString().split("T")[0]);
    setFormStartTime(rule.startTime || "14:00");
    setFormEndTime(rule.endTime || "18:00");
    setFormMinUnitsStr(String(rule.minUnits || 2));
    setFormBranchId(rule.branchId || "ALL");
    setFormAgingDaysStr(String(rule.agingDays || 90));
    setFormDescription(rule.description || "");
    setFormActive(rule.active);
    setFormError("");
    setFormSampleProductId(products[0]?.id || "");
    setIsModalOpen(true);
  };

  // Save Rule (Create or Update)
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError(language === "my" ? "စည်းမျဉ်းအမည် ထည့်သွင်းပေးပါ" : "Rule name is required.");
      return;
    }

    let adjustmentValue = 0;
    if (formAdjustmentType === "FIXED_AMOUNT") {
      const fixedCash = parseFloat(formCashbackAmountStr);
      if (isNaN(fixedCash) || fixedCash <= 0) {
        setFormError(language === "my" ? "Cashback / လျှော့ငွေ ပမာဏ မှန်ကန်စွာ ထည့်သွင်းပါ" : "Please enter a valid cashback amount.");
        return;
      }
      adjustmentValue = -Math.abs(fixedCash);
    } else {
      const pct = parseFloat(formAdjustmentPercentStr);
      if (isNaN(pct) || pct < 0) {
        setFormError(language === "my" ? "ရာခိုင်နှုန်း ပမာဏ မှန်ကန်စွာ ထည့်သွင်းပါ" : "Please enter a valid percentage.");
        return;
      }
      adjustmentValue = formAdjustmentMode === "DISCOUNT" ? -Math.abs(pct) : Math.abs(pct);
    }

    const minUnitsVal = parseInt(formMinUnitsStr) || 1;
    const minSpendVal = parseFloat(formMinSpendStr) || 0;
    const cashbackAmtVal = parseFloat(formCashbackAmountStr) || 0;
    const agingDaysVal = parseInt(formAgingDaysStr) || 90;

    if (formRuleType === "DATE_RANGE") {
      if (!formStartDate || !formEndDate) {
        setFormError(language === "my" ? "စတင်မည့်ရက်နှင့် ပြီးဆုံးမည့်ရက် ထည့်သွင်းပါ" : "Start date and end date are required.");
        return;
      }
      if (formStartDate > formEndDate) {
        setFormError(language === "my" ? "စတင်မည့်ရက်သည် ပြီးဆုံးမည့်ရက်ထက် မကျော်လွန်ရပါ" : "Start date cannot be after end date.");
        return;
      }
    }

    const rulePayload = {
      name: formName.trim(),
      targetCategory: formTargetCategory,
      ruleType: formRuleType,
      adjustmentValue,
      adjustmentType: formAdjustmentType,
      startDate: formRuleType === "DATE_RANGE" ? formStartDate : undefined,
      endDate: formRuleType === "DATE_RANGE" ? formEndDate : undefined,
      minUnits: formRuleType === "VOLUME_TIER" || formRuleType === "DATE_RANGE" ? minUnitsVal : undefined,
      minSpend: formRuleType === "SPEND_CASHBACK" ? minSpendVal : undefined,
      cashbackAmount: formRuleType === "SPEND_CASHBACK" || formAdjustmentType === "FIXED_AMOUNT" ? cashbackAmtVal : undefined,
      startTime: formRuleType === "TIME_WINDOW" ? formStartTime : undefined,
      endTime: formRuleType === "TIME_WINDOW" ? formEndTime : undefined,
      branchId: formRuleType === "REGIONAL_INDEX" && formBranchId !== "ALL" ? formBranchId : undefined,
      agingDays: formRuleType === "CLEARANCE_AGING" ? agingDaysVal : undefined,
      description: formDescription.trim() || undefined,
      active: formActive,
    };

    if (editingRuleId) {
      updateDynamicPricingRule({
        ...rulePayload,
        id: editingRuleId,
      });
    } else {
      createDynamicPricingRule(rulePayload);
    }

    setIsModalOpen(false);
  };

  // Filtered Rules List
  const filteredRules = useMemo(() => {
    return dynamicPricing.filter((rule) => {
      // Search
      const matchesSearch =
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.targetCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.ruleType.toLowerCase().includes(searchTerm.toLowerCase());

      // Type
      const matchesType = selectedTypeFilter === "ALL" || rule.ruleType === selectedTypeFilter;

      // Status
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && rule.active) ||
        (statusFilter === "INACTIVE" && !rule.active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [dynamicPricing, searchTerm, selectedTypeFilter, statusFilter]);

  // Selected Simulation Product
  const selectedSimProduct = useMemo(() => {
    return products.find((p) => p.id === simProductId) || products[0];
  }, [products, simProductId]);

  // Simulator Active Matches Calculation
  const simulationResult = useMemo(() => {
    if (!selectedSimProduct) return null;

    const baseUnitPrice = selectedSimProduct.sellingPrice;
    let netAdjustmentPercent = 0;
    let netFixedDiscount = 0;
    const appliedRules: { rule: DynamicPricingRule; text: string; amountOrPct: string; isDiscount: boolean }[] = [];

    dynamicPricing
      .filter((r) => r.active)
      .forEach((rule) => {
        const categoryMatch =
          !rule.targetCategory ||
          rule.targetCategory === "All Categories" ||
          rule.targetCategory.toLowerCase() === "all price category" ||
          rule.targetCategory.toLowerCase() === selectedSimProduct.category.toLowerCase();

        if (!categoryMatch) return;

        let ruleMatched = false;

        if (rule.ruleType === "TIME_WINDOW") {
          if (rule.startTime && rule.endTime) {
            if (simTime >= rule.startTime && simTime <= rule.endTime) {
              ruleMatched = true;
            }
          } else {
            ruleMatched = true;
          }
        } else if (rule.ruleType === "VOLUME_TIER") {
          if (simQuantity >= (rule.minUnits || 1)) {
            ruleMatched = true;
          }
        } else if (rule.ruleType === "DATE_RANGE") {
          const isDateInRange =
            (!rule.startDate || simDate >= rule.startDate) &&
            (!rule.endDate || simDate <= rule.endDate);
          const isQtyMet = simQuantity >= (rule.minUnits || 1);
          if (isDateInRange && isQtyMet) {
            ruleMatched = true;
          }
        } else if (rule.ruleType === "SPEND_CASHBACK") {
          const totalSpend = baseUnitPrice * simQuantity;
          if (totalSpend >= (rule.minSpend || 0)) {
            ruleMatched = true;
          }
        } else if (rule.ruleType === "REGIONAL_INDEX") {
          if (!rule.branchId || rule.branchId === "ALL" || rule.branchId === simBranchId) {
            ruleMatched = true;
          }
        } else if (rule.ruleType === "CLEARANCE_AGING") {
          ruleMatched = true;
        }

        if (ruleMatched) {
          if (rule.adjustmentType === "FIXED_AMOUNT") {
            const fixedAmt = rule.cashbackAmount || Math.abs(rule.adjustmentValue);
            const perUnitCash = Math.round(fixedAmt / Math.max(1, simQuantity));
            netFixedDiscount += perUnitCash;
            appliedRules.push({
              rule,
              text: rule.name,
              amountOrPct: `-${formatCurrency(fixedAmt, currency, language)} Cashback`,
              isDiscount: true,
            });
          } else {
            netAdjustmentPercent += rule.adjustmentValue;
            const isDisc = rule.adjustmentValue < 0;
            appliedRules.push({
              rule,
              text: rule.name,
              amountOrPct: `${rule.adjustmentValue > 0 ? "+" : ""}${rule.adjustmentValue}%`,
              isDiscount: isDisc,
            });
          }
        }
      });

    let adjustedUnitPrice = Math.round(baseUnitPrice * (1 + netAdjustmentPercent / 100));
    if (netFixedDiscount > 0) {
      adjustedUnitPrice = Math.max(0, adjustedUnitPrice - netFixedDiscount);
    }
    adjustedUnitPrice = Math.max(0, adjustedUnitPrice);

    const originalTotal = baseUnitPrice * simQuantity;
    const finalTotal = adjustedUnitPrice * simQuantity;
    const difference = finalTotal - originalTotal;

    return {
      baseUnitPrice,
      adjustedUnitPrice,
      netAdjustmentPercent,
      netFixedDiscount,
      originalTotal,
      finalTotal,
      difference,
      appliedRules,
    };
  }, [selectedSimProduct, dynamicPricing, simQuantity, simBranchId, simTime, simDate, currency, language]);

  const activeCount = dynamicPricing.filter((r) => r.active).length;

  return (
    <div id="dynamic-pricing-view" className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">
                {language === "my"
                  ? "အလိုအလျောက် ပြောင်းလဲသော ဈေးနှုန်းနှင့် Promotion စည်းမျဉ်းများ (Dynamic Pricing)"
                  : "Dynamic Pricing Engine & Campaign Promotions"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {activeCount} / {dynamicPricing.length} {language === "my" ? "အသက်ဝင်နေသည်" : "Active"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === "my"
                ? "ရက်အလိုက် Promotion (Date Window & Min Qty)၊ ငွေအမောက်အလိုက် Cash Back / Discount နှင့် Happy Hour စည်းမျဉ်းများ စီမံခြင်း"
                : "Manage Date-Range Promotions, Spend Cashback Tiers, Happy Hours & Bulk Volume Discounts across All Price Categories."}
            </p>
          </div>
        </div>

        {/* Action: Add New Rule Button */}
        <button
          id="btn-create-pricing-rule"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "my" ? "+ စည်းမျဉ်းအသစ် သတ်မှတ်မည်" : "+ Create New Pricing Rule"}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === "my" ? "စုစုပေါင်း စည်းမျဉ်း" : "Total Rules"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">{dynamicPricing.length}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === "my" ? "ရက်အလိုက် Promo" : "Date-Range Promo"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {dynamicPricing.filter((r) => r.ruleType === "DATE_RANGE").length}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === "my" ? "Spend Cashback" : "Spend Cashback"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {dynamicPricing.filter((r) => r.ruleType === "SPEND_CASHBACK").length}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === "my" ? "Happy Hour" : "Happy Hour"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">
            {dynamicPricing.filter((r) => r.ruleType === "TIME_WINDOW").length}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === "my" ? "Volume Tier" : "Volume Tier"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {dynamicPricing.filter((r) => r.ruleType === "VOLUME_TIER").length}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Rules List & Right Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter & Rules (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    language === "my"
                      ? "စည်းမျဉ်းအမည် သို့မဟုတ် အမျိုးအစားဖြင့် ရှာဖွေပါ..."
                      : "Search by rule name, type, or category..."
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === "ALL"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {language === "my" ? "အားလုံး" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === "ACTIVE"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {language === "my" ? "Active သာ" : "Active"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("INACTIVE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === "INACTIVE"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {language === "my" ? "Disabled သာ" : "Disabled"}
                </button>
              </div>
            </div>

            {/* Rule Type Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedTypeFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  selectedTypeFilter === "ALL"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {language === "my" ? "အားလုံး (All Types)" : "All Types"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter("DATE_RANGE")}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                  selectedTypeFilter === "DATE_RANGE"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Date-Range Promo</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter("SPEND_CASHBACK")}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                  selectedTypeFilter === "SPEND_CASHBACK"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Spend Cashback</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter("TIME_WINDOW")}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                  selectedTypeFilter === "TIME_WINDOW"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Happy Hour / Time</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter("VOLUME_TIER")}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                  selectedTypeFilter === "VOLUME_TIER"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Volume Tier / Bulk</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter("REGIONAL_INDEX")}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                  selectedTypeFilter === "REGIONAL_INDEX"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Regional Markup</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter("CLEARANCE_AGING")}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                  selectedTypeFilter === "CLEARANCE_AGING"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Clearance Aging</span>
              </button>
            </div>
          </div>

          {/* Pricing Rules Grid */}
          {filteredRules.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <Tag className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                {language === "my" ? "စည်းမျဉ်း ရှာမတွေ့ပါ" : "No pricing rules found"}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === "my"
                  ? "အထက်ပါ '+ စည်းမျဉ်းအသစ် သတ်မှတ်မည်' ခလုတ်ကို နှိပ်၍ အလိုအလျောက် ဈေးနှုန်းစည်းမျဉ်းအသစ် ထည့်သွင်းနိုင်ပါသည်။"
                  : "Click the '+ Create New Pricing Rule' button above to configure dynamic discount, date range promo, or cashback rules."}
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{language === "my" ? "စည်းမျဉ်းအသစ် ဖန်တီးမည်" : "Create Rule Now"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map((rule) => {
                const isFixed = rule.adjustmentType === "FIXED_AMOUNT" || (rule.cashbackAmount && rule.cashbackAmount > 0);
                const isDiscount = rule.adjustmentValue < 0 || isFixed;
                const percentVal = Math.abs(rule.adjustmentValue);
                const cashbackVal = rule.cashbackAmount || Math.abs(rule.adjustmentValue);

                // Type details badge formatting
                let typeColor = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
                let typeIcon = <Tag className="w-3 h-3" />;
                let conditionText = "";

                if (rule.ruleType === "DATE_RANGE") {
                  typeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                  typeIcon = <Calendar className="w-3 h-3" />;
                  conditionText = `${rule.startDate || "Start"} to ${rule.endDate || "End"} (Min ${rule.minUnits || 1} Qty)`;
                } else if (rule.ruleType === "SPEND_CASHBACK") {
                  typeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
                  typeIcon = <Coins className="w-3 h-3" />;
                  conditionText = `Spend ≥ ${formatCurrency(rule.minSpend || 0, currency, language)}`;
                } else if (rule.ruleType === "TIME_WINDOW") {
                  typeColor = "bg-purple-500/20 text-purple-300 border-purple-500/40";
                  typeIcon = <Clock className="w-3 h-3" />;
                  conditionText = `Daily ${rule.startTime || "14:00"} - ${rule.endTime || "18:00"}`;
                } else if (rule.ruleType === "VOLUME_TIER") {
                  typeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
                  typeIcon = <Layers className="w-3 h-3" />;
                  conditionText = `Min Quantity ≥ ${rule.minUnits || 1} units`;
                } else if (rule.ruleType === "REGIONAL_INDEX") {
                  typeColor = "bg-blue-500/20 text-blue-300 border-blue-500/40";
                  typeIcon = <MapPin className="w-3 h-3" />;
                  const bName = branches.find((b) => b.id === rule.branchId)?.name || "All Branches";
                  conditionText = `Applies to: ${bName}`;
                } else if (rule.ruleType === "CLEARANCE_AGING") {
                  typeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
                  typeIcon = <Zap className="w-3 h-3" />;
                  conditionText = `Aging Stock > ${rule.agingDays || 90} days`;
                }

                return (
                  <div
                    key={rule.id}
                    className={`bg-slate-900 border rounded-2xl p-4 space-y-3.5 shadow-sm transition-all hover:border-slate-700 flex flex-col justify-between ${
                      rule.active ? "border-slate-800" : "border-slate-800/50 opacity-75"
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Header: Badge & Status Toggle */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${typeColor}`}
                          >
                            {typeIcon}
                            <span>{rule.ruleType.replace("_", " ")}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {rule.targetCategory || "All Categories"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleDynamicPricingRule(rule.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                            rule.active
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          {rule.active ? "ENABLED" : "DISABLED"}
                        </button>
                      </div>

                      {/* Rule Name */}
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 leading-snug">{rule.name}</h3>
                        {rule.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{rule.description}</p>
                        )}
                      </div>

                      {/* Condition & Price Adjustment Card */}
                      <div className="space-y-1.5 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 font-mono">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span className="font-sans">Trigger Condition:</span>
                          <span className="text-slate-200 font-semibold truncate max-w-[190px]" title={conditionText}>
                            {conditionText}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                          <span className="font-sans text-slate-400 text-[11px]">Benefit / Adjustment:</span>
                          <span
                            className={`font-bold text-xs flex items-center gap-1 ${
                              isDiscount ? "text-emerald-400" : "text-amber-400"
                            }`}
                          >
                            {isDiscount ? (
                              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span>
                              {isFixed
                                ? `-${formatCurrency(cashbackVal, currency, language)} Cashback`
                                : isDiscount
                                ? `-${percentVal}% Discount`
                                : `+${percentVal}% Markup`}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions: Edit & Delete */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(rule)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-400" />
                        <span>{language === "my" ? "ပြင်ဆင်မည်" : "Edit"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${rule.name}"?`)) {
                            deleteDynamicPricingRule(rule.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-800/40 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>{language === "my" ? "ဖျက်မည်" : "Delete"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Pricing Calculator / Simulator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-md sticky top-16">
            <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-100">
                  {language === "my" ? "ဈေးနှုန်းတွက်ချက်မှု စမ်းသပ်စက်" : "Live Dynamic Pricing Simulator"}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {language === "my"
                    ? "ရက်စွဲ၊ အချိန်၊ အရေအတွက်နှင့် Cash Back စည်းမျဉ်းများ တိုက်ရိုက် စမ်းသပ်ပါ"
                    : "Simulate date ranges, quantities, spend cashback & time windows live"}
                </p>
              </div>
            </div>

            {/* Simulator Inputs */}
            <div className="space-y-3.5 text-xs">
              {/* Product Picker */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                  {language === "my" ? "စမ်းသပ်မည့် ပစ္စည်း (Sample Product):" : "Sample Product:"}
                </label>
                <select
                  value={simProductId}
                  onChange={(e) => setSimProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) - {formatCurrency(p.sellingPrice, currency, language)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input with Stepper & Quick Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-medium text-[11px]">
                    {language === "my" ? "ဝယ်ယူမည့် အရေအတွက် (Quantity / Qty):" : "Quantity (Qty):"}
                  </label>
                  <span className="text-[10px] text-indigo-400 font-mono font-semibold">
                    {simQuantity} {simQuantity > 1 ? "units" : "unit"}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setSimQuantityStr(String(Math.max(1, (parseInt(simQuantityStr) || 1) - 1)))}
                    className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center font-bold text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={simQuantityStr}
                    onChange={(e) => setSimQuantityStr(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="Enter any qty..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono font-bold text-center focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSimQuantityStr(String((parseInt(simQuantityStr) || 0) + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center font-bold text-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimQuantityStr(String((parseInt(simQuantityStr) || 0) + 5))}
                    className="px-2 h-8 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white text-[10px] font-mono"
                  >
                    +5
                  </button>
                </div>

                {/* Quick Qty Chips */}
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pt-0.5">
                  {[1, 2, 5, 10, 20, 50, 100].map((qtyVal) => (
                    <button
                      key={qtyVal}
                      type="button"
                      onClick={() => setSimQuantityStr(String(qtyVal))}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors shrink-0 ${
                        simQuantity === qtyVal
                          ? "bg-indigo-600 text-white border-indigo-500"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {qtyVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Date Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-medium text-[11px]">
                    {language === "my" ? "စမ်းသပ်မည့် ရက်စွဲ (Simulated Date):" : "Simulated Date:"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setSimDate(new Date().toISOString().split("T")[0])}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{language === "my" ? "ယနေ့ရက်စွဲ" : "Today"}</span>
                  </button>
                </div>
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Simulated Time & Quick Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-medium text-[11px]">
                    {language === "my" ? "စမ်းသပ်ချိန် (Simulated Time):" : "Simulated Time:"}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSimTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))
                    }
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{language === "my" ? "လက်ရှိအချိန်" : "Set to Now"}</span>
                  </button>
                </div>
                <input
                  type="time"
                  value={simTime}
                  onChange={(e) => setSimTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />

                <div className="flex items-center gap-1">
                  {[
                    { label: "14:00 (Happy)", time: "14:00" },
                    { label: "16:30 (Peak)", time: "16:30" },
                    { label: "20:00 (Night)", time: "20:00" },
                  ].map((preset) => (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={() => setSimTime(preset.time)}
                      className={`flex-1 py-0.5 rounded text-[10px] font-mono border text-center transition-colors ${
                        simTime === preset.time
                          ? "bg-amber-600/30 text-amber-300 border-amber-500/50"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                  {language === "my" ? "အရောင်းဆိုင် (Branch Location):" : "Branch Location:"}
                </label>
                <select
                  value={simBranchId}
                  onChange={(e) => setSimBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Branches (Global)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {language === "my" ? b.nameMy : b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            {simulationResult && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>မူရင်း ရောင်းဈေး (Base Unit Price):</span>
                  <span className="font-mono text-slate-300">
                    {formatCurrency(simulationResult.baseUnitPrice, currency, language)}
                  </span>
                </div>

                {/* Applied Rules Chips */}
                <div className="space-y-1 py-1.5 border-y border-slate-850">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>{language === "my" ? "ကိုက်ညီသော စည်းမျဉ်းများ:" : "Triggered Rules:"}</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {simulationResult.appliedRules.length} matched
                    </span>
                  </div>
                  {simulationResult.appliedRules.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic py-0.5">
                      {language === "my"
                        ? "မည်သည့် စည်းမျဉ်းမှ မကိုက်ညီပါ (မူရင်းဈေးအတိုင်း)"
                        : "No active rules matched current conditions"}
                    </div>
                  ) : (
                    simulationResult.appliedRules.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-[11px] items-center bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-850"
                      >
                        <span className="truncate pr-2 text-slate-200 font-medium">• {item.text}</span>
                        <span
                          className={`font-mono font-bold shrink-0 text-xs ${
                            item.isDiscount ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {item.amountOrPct}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Adjusted Unit Price */}
                <div className="flex justify-between text-slate-200 font-semibold items-center">
                  <span>သတ်မှတ်ပြီး တစ်ခုချင်းရောင်းဈေး:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {formatCurrency(simulationResult.adjustedUnitPrice, currency, language)}
                  </span>
                </div>

                {/* Total Calculated Line */}
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>မူရင်းစုစုပေါင်း ({simQuantity} ခု):</span>
                    <span className="font-mono line-through text-slate-500">
                      {formatCurrency(simulationResult.originalTotal, currency, language)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-100 font-bold text-sm">
                    <span>နောက်ဆုံး ကျသင့်ငွေ:</span>
                    <span className="font-mono text-amber-400 text-base">
                      {formatCurrency(simulationResult.finalTotal, currency, language)}
                    </span>
                  </div>
                  {simulationResult.difference !== 0 && (
                    <div className="text-right text-[11px] font-mono font-bold pt-0.5">
                      {simulationResult.difference < 0 ? (
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md inline-block">
                          Total Discount: -{formatCurrency(Math.abs(simulationResult.difference), currency, language)}
                        </span>
                      ) : (
                        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md inline-block">
                          Total Markup: +{formatCurrency(simulationResult.difference, currency, language)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT PRICING RULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 text-slate-200 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {editingRuleId
                      ? language === "my"
                        ? "စည်းမျဉ်း ပြင်ဆင်ခြင်း (Edit Pricing Rule)"
                        : "Edit Dynamic Pricing Rule"
                      : language === "my"
                      ? "စည်းမျဉ်းအသစ် သတ်မှတ်ခြင်း (New Pricing Rule)"
                      : "Create Dynamic Pricing Rule"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === "my"
                      ? "ရက်အလိုက် Promotion၊ ငွေပမာဏ Cash Back သို့မဟုတ် အချိန်ပိုင်း/လက်ကား လျှော့ဈေး သတ်မှတ်ပါ"
                      : "Configure date promotions, spend cashback tiers, happy hour or volume discount rules"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              {/* 1. Rule Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === "my" ? "စည်းမျဉ်းအမည် (Rule Name) *" : "Rule Name *"}
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Monsoon Promotion (Buy 2+ Get 12% Off), Spend 500k Get 25k Cashback..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* 2. Rule Type Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  {language === "my" ? "စည်းမျဉ်း အမျိုးအစား (Rule Type)" : "Rule Type"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormRuleType("DATE_RANGE");
                      setFormAdjustmentType("PERCENTAGE");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formRuleType === "DATE_RANGE"
                        ? "bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30 text-emerald-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Date-Range Promo</span>
                    </div>
                    <span className="text-[10px] text-slate-400">ရက်အလိုက် ကာလသတ်မှတ်ပြီး Qty အလိုက် လျှော့ပေးခြင်း</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRuleType("SPEND_CASHBACK");
                      setFormAdjustmentType("FIXED_AMOUNT");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formRuleType === "SPEND_CASHBACK"
                        ? "bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30 text-amber-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Spend Cashback</span>
                    </div>
                    <span className="text-[10px] text-slate-400">ငွေအမောက် ဘယ်လောက်ဖိုးဝယ်ရင် Cashback ပေးမည်</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRuleType("TIME_WINDOW");
                      setFormAdjustmentType("PERCENTAGE");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formRuleType === "TIME_WINDOW"
                        ? "bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/30 text-purple-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Happy Hour / Time</span>
                    </div>
                    <span className="text-[10px] text-slate-400">နေ့စဉ် အချိန်ပိုင်း အလိုအလျောက် ဈေးလျှော့ခြင်း</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRuleType("VOLUME_TIER");
                      setFormAdjustmentType("PERCENTAGE");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formRuleType === "VOLUME_TIER"
                        ? "bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30 text-cyan-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Volume Tier / Bulk</span>
                    </div>
                    <span className="text-[10px] text-slate-400">အရေအတွက်များလျှင် လက်ကားဈေးပေးခြင်း</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRuleType("REGIONAL_INDEX");
                      setFormAdjustmentType("PERCENTAGE");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formRuleType === "REGIONAL_INDEX"
                        ? "bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/30 text-blue-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span>Regional Markup</span>
                    </div>
                    <span className="text-[10px] text-slate-400">သယ်ယူပို့ဆောင်ခ ဒေသအလိုက် ဈေးနှုန်းတိုးခြင်း</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRuleType("CLEARANCE_AGING");
                      setFormAdjustmentType("PERCENTAGE");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formRuleType === "CLEARANCE_AGING"
                        ? "bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/30 text-rose-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <Zap className="w-3.5 h-3.5 text-rose-400" />
                      <span>Clearance Aging</span>
                    </div>
                    <span className="text-[10px] text-slate-400">ရက်ကြာပစ္စည်းများ အမြန်ရှင်း လျှော့ဈေး</span>
                  </button>
                </div>
              </div>

              {/* 3. Conditional Parameters based on Type */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                {/* DATE_RANGE Fields */}
                {formRuleType === "DATE_RANGE" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 text-[11px]">
                          {language === "my" ? "စတင်မည့် ရက် (Start Date):" : "Start Date:"}
                        </label>
                        <input
                          type="date"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 text-[11px]">
                          {language === "my" ? "ပြီးဆုံးမည့် ရက် (End Date):" : "End Date:"}
                        </label>
                        <input
                          type="date"
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Quick Date Presets */}
                    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
                      {[
                        {
                          label: "Next 7 Days",
                          days: 7,
                        },
                        {
                          label: "Next 14 Days",
                          days: 14,
                        },
                        {
                          label: "Next 30 Days",
                          days: 30,
                        },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            const today = new Date().toISOString().split("T")[0];
                            const future = new Date();
                            future.setDate(future.getDate() + preset.days);
                            setFormStartDate(today);
                            setFormEndDate(future.toISOString().split("T")[0]);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Minimum Units Requirement for this Date Promo */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-850">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-400 text-[11px] font-medium">
                          {language === "my"
                            ? "အနည်းဆုံး ဝယ်ယူရမည့် အရေအတွက် (Min Quantity):"
                            : "Min Units Threshold:"}
                        </label>
                        <span className="text-emerald-400 font-mono text-[10px] font-semibold">
                          ≥ {formMinUnits} {formMinUnits > 1 ? "units" : "unit"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setFormMinUnitsStr(String(Math.max(1, (parseInt(formMinUnitsStr) || 1) - 1)))
                          }
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={formMinUnitsStr}
                          onChange={(e) => setFormMinUnitsStr(e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="e.g. 1, 2, 5..."
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono font-bold text-center focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setFormMinUnitsStr(String((parseInt(formMinUnitsStr) || 0) + 1))}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pt-0.5">
                        {[1, 2, 3, 5, 10, 20].map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setFormMinUnitsStr(String(u))}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors shrink-0 ${
                              formMinUnits === u
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                            }`}
                          >
                            {u} {u > 1 ? "units" : "unit"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPEND_CASHBACK Fields */}
                {formRuleType === "SPEND_CASHBACK" && (
                  <div className="space-y-3">
                    {/* Minimum Spend Amount (ငွေအမောက် ဘယ်လောက်ဖိုးဝယ်ရင်) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-400 text-[11px] font-medium">
                          {language === "my"
                            ? "အနည်းဆုံး ဝယ်ယူရမည့် ငွေပမာဏ (Minimum Spend Amount in MMK):"
                            : "Minimum Spend Amount (MMK):"}
                        </label>
                        <span className="text-amber-400 font-mono text-[10px] font-semibold">
                          ≥ {formatCurrency(formMinSpend, currency, language)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setFormMinSpendStr(String(Math.max(0, (parseFloat(formMinSpendStr) || 0) - 50000)))
                          }
                          className="px-2.5 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                        >
                          -50k
                        </button>
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          inputMode="numeric"
                          value={formMinSpendStr}
                          onChange={(e) => setFormMinSpendStr(e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="e.g. 500000"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono font-bold text-center focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormMinSpendStr(String((parseFloat(formMinSpendStr) || 0) + 50000))
                          }
                          className="px-2.5 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                        >
                          +50k
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormMinSpendStr(String((parseFloat(formMinSpendStr) || 0) + 100000))
                          }
                          className="px-2.5 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-[10px]"
                        >
                          +100k
                        </button>
                      </div>

                      {/* Quick Spend Chips */}
                      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pt-0.5">
                        {[50000, 100000, 200000, 300000, 500000, 1000000, 2000000].map((spend) => (
                          <button
                            key={spend}
                            type="button"
                            onClick={() => setFormMinSpendStr(String(spend))}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors shrink-0 ${
                              formMinSpend === spend
                                ? "bg-amber-600 text-white border-amber-500"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                            }`}
                          >
                            {formatCurrency(spend, currency, language)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cashback Reward Amount (Cash back amount ဘယ်လောက်ပေးမယ်) */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-850">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-400 text-[11px] font-medium">
                          {language === "my"
                            ? "ပေးမည့် Cash Back Amount (Cashback / Direct Cash Discount in MMK):"
                            : "Cashback Reward Amount (MMK):"}
                        </label>
                        <span className="text-emerald-400 font-mono text-[10px] font-semibold">
                          -{formatCurrency(formCashbackAmount, currency, language)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setFormCashbackAmountStr(String(Math.max(0, (parseFloat(formCashbackAmountStr) || 0) - 5000)))
                          }
                          className="px-2.5 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                        >
                          -5k
                        </button>
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          inputMode="numeric"
                          value={formCashbackAmountStr}
                          onChange={(e) => setFormCashbackAmountStr(e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="e.g. 25000"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono font-bold text-center focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormCashbackAmountStr(String((parseFloat(formCashbackAmountStr) || 0) + 5000))
                          }
                          className="px-2.5 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                        >
                          +5k
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormCashbackAmountStr(String((parseFloat(formCashbackAmountStr) || 0) + 10000))
                          }
                          className="px-2.5 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-[10px]"
                        >
                          +10k
                        </button>
                      </div>

                      {/* Quick Cashback Chips */}
                      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pt-0.5">
                        {[5000, 10000, 20000, 25000, 50000, 100000].map((cb) => (
                          <button
                            key={cb}
                            type="button"
                            onClick={() => setFormCashbackAmountStr(String(cb))}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors shrink-0 ${
                              formCashbackAmount === cb
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                            }`}
                          >
                            {formatCurrency(cb, currency, language)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TIME_WINDOW Fields */}
                {formRuleType === "TIME_WINDOW" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Start Time (စတင်ချိန်):</label>
                      <input
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">End Time (ပြီးဆုံးချိန်):</label>
                      <input
                        type="time"
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* VOLUME_TIER Fields */}
                {formRuleType === "VOLUME_TIER" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-400 text-[11px] font-medium">
                        Minimum Purchase Units (အနည်းဆုံး ဝယ်ယူရမည့် အရေအတွက်):
                      </label>
                      <span className="text-cyan-400 font-mono text-[10px] font-semibold">
                        ≥ {formMinUnits} units
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setFormMinUnitsStr(String(Math.max(1, (parseInt(formMinUnitsStr) || 1) - 1)))
                        }
                        className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={formMinUnitsStr}
                        onChange={(e) => setFormMinUnitsStr(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="e.g. 5, 10, 50..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono font-bold text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormMinUnitsStr(String((parseInt(formMinUnitsStr) || 0) + 1))}
                        className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pt-0.5">
                      {[2, 3, 5, 10, 20, 50, 100].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setFormMinUnitsStr(String(u))}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors shrink-0 ${
                            formMinUnits === u
                              ? "bg-cyan-600 text-white border-cyan-500"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {u} units
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* REGIONAL_INDEX Fields */}
                {formRuleType === "REGIONAL_INDEX" && (
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Target Branch (သက်ဆိုင်ရာ ဆိုင်):</label>
                    <select
                      value={formBranchId}
                      onChange={(e) => setFormBranchId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
                    >
                      <option value="ALL">All Branches (Global)</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {language === "my" ? b.nameMy : b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* CLEARANCE_AGING Fields */}
                {formRuleType === "CLEARANCE_AGING" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-400 text-[11px] font-medium">
                        Stock Aging Threshold Days (သိုလှောင်သက်တမ်း ရက်):
                      </label>
                      <span className="text-rose-400 font-mono text-[10px] font-semibold">
                        &gt; {formAgingDays} days
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setFormAgingDaysStr(String(Math.max(1, (parseInt(formAgingDaysStr) || 30) - 10)))
                        }
                        className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={formAgingDaysStr}
                        onChange={(e) => setFormAgingDaysStr(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="e.g. 90, 180..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono font-bold text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormAgingDaysStr(String((parseInt(formAgingDaysStr) || 0) + 10))}
                        className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1 pt-0.5">
                      {[30, 60, 90, 180, 365].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFormAgingDaysStr(String(d))}
                          className={`flex-1 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                            formAgingDays === d
                              ? "bg-rose-600 text-white border-rose-500"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Category (All Categories / ALL Price Category or Specific) */}
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">
                    {language === "my"
                      ? "အကျုံးဝင်မည့် ပစ္စည်း အမျိုးအစား (Target Product Category):"
                      : "Target Product Category (ALL Price Category or Specific):"}
                  </label>
                  <select
                    value={formTargetCategory}
                    onChange={(e) => setFormTargetCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
                  >
                    {productCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "All Categories" ? "All Categories (ALL Price Category အကုန်လုံး)" : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Price Adjustment Type & Values (Only if not SPEND_CASHBACK or if choosing between % and Fixed) */}
              {formRuleType !== "SPEND_CASHBACK" && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    {language === "my"
                      ? "ဈေးနှုန်း လျှော့ချမှု / တိုးမြှင့်မှု (Price Adjustment %)"
                      : "Price Adjustment (% Percentage)"}
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setFormAdjustmentMode("DISCOUNT")}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors ${
                          formAdjustmentMode === "DISCOUNT"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Discount (-%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormAdjustmentMode("MARKUP")}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors ${
                          formAdjustmentMode === "MARKUP"
                            ? "bg-amber-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Markup (+%)</span>
                      </button>
                    </div>

                    {/* Input with free typing */}
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        inputMode="decimal"
                        value={formAdjustmentPercentStr}
                        onChange={(e) => setFormAdjustmentPercentStr(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="e.g. 10, 12, 15..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold text-center focus:outline-none focus:border-indigo-500 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons & Steppers */}
                  <div className="flex items-center gap-1 mt-2 overflow-x-auto custom-scrollbar pb-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setFormAdjustmentPercentStr(String(Math.max(0, (parseFloat(formAdjustmentPercentStr) || 0) - 1)))
                      }
                      className="px-2 py-1 rounded text-[10px] font-mono font-semibold bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      -1%
                    </button>
                    {[5, 8, 10, 12, 15, 20, 25, 30, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setFormAdjustmentPercentStr(String(pct))}
                        className={`flex-1 py-1 rounded text-[11px] font-mono font-semibold border transition-colors shrink-0 ${
                          formAdjustmentPercent === pct
                            ? formAdjustmentMode === "DISCOUNT"
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : "bg-amber-600 text-white border-amber-500"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {formAdjustmentMode === "DISCOUNT" ? `-${pct}%` : `+${pct}%`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setFormAdjustmentPercentStr(String(Math.min(100, (parseFloat(formAdjustmentPercentStr) || 0) + 1)))
                      }
                      className="px-2 py-1 rounded text-[10px] font-mono font-semibold bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      +1%
                    </button>
                  </div>
                </div>
              )}

              {/* LIVE REAL-TIME RULE IMPACT PREVIEW BOX */}
              {(() => {
                const sampleProd = products.find((p) => p.id === formSampleProductId) || products[0];
                if (!sampleProd) return null;
                const basePrice = sampleProd.sellingPrice;
                let adjPrice = basePrice;
                let diff = 0;
                const minUnits =
                  formRuleType === "VOLUME_TIER" || formRuleType === "DATE_RANGE" ? formMinUnits : 1;

                if (formRuleType === "SPEND_CASHBACK") {
                  const lineTotal = basePrice * minUnits;
                  const qualifies = lineTotal >= formMinSpend;
                  diff = qualifies ? -formCashbackAmount : 0;
                  const perUnitDiscount = Math.round(formCashbackAmount / Math.max(1, minUnits));
                  adjPrice = qualifies ? Math.max(0, basePrice - perUnitDiscount) : basePrice;
                } else {
                  adjPrice =
                    formAdjustmentMode === "DISCOUNT"
                      ? Math.max(0, Math.round(basePrice * (1 - formAdjustmentPercent / 100)))
                      : Math.round(basePrice * (1 + formAdjustmentPercent / 100));
                  diff = adjPrice - basePrice;
                }

                const totalTierSum = adjPrice * minUnits;

                return (
                  <div className="bg-slate-950/90 p-3 rounded-xl border border-indigo-900/40 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-indigo-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>Live Calculation Preview on Sample Item:</span>
                      </span>
                      <select
                        value={formSampleProductId}
                        onChange={(e) => setFormSampleProductId(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
                      >
                        {products.slice(0, 8).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name.slice(0, 20)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div>
                        <div className="text-slate-500 text-[10px]">Original Unit Price</div>
                        <div className="text-slate-300 font-semibold">{formatCurrency(basePrice, currency, language)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">
                          {formRuleType === "SPEND_CASHBACK"
                            ? "Effective Price (w/ Cashback)"
                            : formAdjustmentMode === "DISCOUNT"
                            ? "Calculated Discounted Price"
                            : "Calculated Markup Price"}
                        </div>
                        <div className="text-emerald-400 font-bold text-xs">{formatCurrency(adjPrice, currency, language)}</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>
                        Rule Impact:{" "}
                        <span className={diff <= 0 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {formRuleType === "SPEND_CASHBACK"
                            ? `Cashback Reward: -${formatCurrency(formCashbackAmount, currency, language)} (When spend ≥ ${formatCurrency(formMinSpend, currency, language)})`
                            : diff < 0
                            ? `- ${formatCurrency(Math.abs(diff), currency, language)} (${formAdjustmentPercent}%)`
                            : `+ ${formatCurrency(diff, currency, language)} (+${formAdjustmentPercent}%)`}
                        </span>
                      </span>
                      {minUnits > 1 && (
                        <span className="font-mono text-slate-300">
                          {minUnits} units total: <strong className="text-amber-400">{formatCurrency(totalTierSum, currency, language)}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 5. Description / Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === "my" ? "ရှင်းလင်းချက် မှတ်ချက် (Description / Notes)" : "Description / Notes"}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional internal note for cashiers and audit trail..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* 6. Active Status Switch */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200 text-xs">
                    {language === "my" ? "စည်းမျဉ်းကို ချက်ချင်း အသက်သွင်းမည်" : "Enable Rule Immediately"}
                  </div>
                  <div className="text-[11px] text-slate-500">Active rules apply automatically during POS sales</div>
                </div>
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  {language === "my" ? "ပယ်ဖျက်မည်" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
                >
                  {editingRuleId
                    ? language === "my"
                      ? "အပြောင်းအလဲ သိမ်းဆည်းမည်"
                      : "Save Changes"
                    : language === "my"
                    ? "စည်းမျဉ်းအသစ် သတ်မှတ်မည်"
                    : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
