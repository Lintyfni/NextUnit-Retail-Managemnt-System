import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { DynamicPricingRule } from "../../types";
import { formatCurrency } from "../../utils/helpers";
import {
  Tag,
  Clock,
  MapPin,
  Layers,
  Plus,
  X,
  AlertCircle,
  Edit3,
  Trash2,
  Search,
  Calculator,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Package,
  Calendar,
  Zap,
  Coins,
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

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState<string>("" );
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form Fields
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
  const [simBranchId] = useState<string>(branches[0]?.id || "ALL");
  const [simDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [simTime] = useState<string>(() => {
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
      const matchesSearch =
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.targetCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.ruleType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedTypeFilter === "ALL" || rule.ruleType === selectedTypeFilter;

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
    <div id="dynamic-pricing-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                {language === "my"
                  ? "အလိုအလျောက် ပြောင်းလဲသော ဈေးနှုန်းနှင့် Promotion စည်းမျဉ်းများ (Dynamic Pricing)"
                  : "Dynamic Pricing Engine & Campaign Promotions"}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeCount} / {dynamicPricing.length} {language === "my" ? "အသက်ဝင်နေသည်" : "Active"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
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
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "my" ? "+ စည်းမျဉ်းအသစ် သတ်မှတ်မည်" : "+ Create New Pricing Rule"}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === "my" ? "စုစုပေါင်း စည်းမျဉ်း" : "Total Rules"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{dynamicPricing.length}</div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === "my" ? "ရက်အလိုက် Promo" : "Date-Range Promo"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {dynamicPricing.filter((r) => r.ruleType === "DATE_RANGE").length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === "my" ? "Spend Cashback" : "Spend Cashback"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            {dynamicPricing.filter((r) => r.ruleType === "SPEND_CASHBACK").length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>{language === "my" ? "Happy Hour" : "Happy Hour"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-purple-700 mt-1">
            {dynamicPricing.filter((r) => r.ruleType === "TIME_WINDOW").length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-teal-600" />
            <span>{language === "my" ? "Volume Tier" : "Volume Tier"}</span>
          </div>
          <div className="text-xl font-bold font-mono text-teal-700 mt-1">
            {dynamicPricing.filter((r) => r.ruleType === "VOLUME_TIER").length}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Rules List & Right Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Filter & Rules (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-3 shadow-xs">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0 w-full sm:w-auto font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {language === "my" ? "အားလုံး" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === "ACTIVE"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {language === "my" ? "Active သာ" : "Active"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("INACTIVE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === "INACTIVE"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
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
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {language === "my" ? "အားလုံး (All Types)" : "All Types"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter("DATE_RANGE")}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                  selectedTypeFilter === "DATE_RANGE"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
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
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
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
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
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
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
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
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
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
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Clearance Aging</span>
              </button>
            </div>
          </div>

          {/* Pricing Rules Grid */}
          {filteredRules.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
              <Tag className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">
                {language === "my" ? "စည်းမျဉ်း ရှာမတွေ့ပါ" : "No pricing rules found"}
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === "my"
                  ? "အထက်ပါ '+ စည်းမျဉ်းအသစ် သတ်မှတ်မည်' ခလုတ်ကို နှိပ်၍ အလိုအလျောက် ဈေးနှုန်းစည်းမျဉ်းအသစ် ထည့်သွင်းနိုင်ပါသည်။"
                  : "Click the '+ Create New Pricing Rule' button above to configure dynamic discount, date range promo, or cashback rules."}
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{language === "my" ? "စည်းမျဉ်းအသစ် ဖန်တီးမည်" : "Create Rule Now"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map((rule) => {
                const isFixed = rule.adjustmentType === "FIXED_AMOUNT" || (rule.cashbackAmount && rule.cashbackAmount > 0);
                const percentVal = Math.abs(rule.adjustmentValue);
                const cashbackVal = rule.cashbackAmount || Math.abs(rule.adjustmentValue);

                // Type details badge formatting
                let typeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                let typeIcon = <Tag className="w-3 h-3" />;
                let conditionText = "";

                if (rule.ruleType === "DATE_RANGE") {
                  typeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  typeIcon = <Calendar className="w-3 h-3" />;
                  conditionText = `${rule.startDate || "Start"} to ${rule.endDate || "End"} (Min ${rule.minUnits || 1} Qty)`;
                } else if (rule.ruleType === "SPEND_CASHBACK") {
                  typeColor = "bg-amber-50 text-amber-700 border-amber-200";
                  typeIcon = <Coins className="w-3 h-3" />;
                  conditionText = `Spend ≥ ${formatCurrency(rule.minSpend || 0, currency, language)}`;
                } else if (rule.ruleType === "TIME_WINDOW") {
                  typeColor = "bg-purple-50 text-purple-700 border-purple-200";
                  typeIcon = <Clock className="w-3 h-3" />;
                  conditionText = `Daily ${rule.startTime || "14:00"} - ${rule.endTime || "18:00"}`;
                } else if (rule.ruleType === "VOLUME_TIER") {
                  typeColor = "bg-teal-50 text-teal-700 border-teal-200";
                  typeIcon = <Layers className="w-3 h-3" />;
                  conditionText = `Min Quantity ≥ ${rule.minUnits || 1} units`;
                } else if (rule.ruleType === "REGIONAL_INDEX") {
                  typeColor = "bg-blue-50 text-blue-700 border-blue-200";
                  typeIcon = <MapPin className="w-3 h-3" />;
                  conditionText = `Branch: ${rule.branchId || "All Branches"}`;
                } else if (rule.ruleType === "CLEARANCE_AGING") {
                  typeColor = "bg-rose-50 text-rose-700 border-rose-200";
                  typeIcon = <Zap className="w-3 h-3" />;
                  conditionText = `Aging > ${rule.agingDays || 90} Days`;
                }

                return (
                  <div
                    key={rule.id}
                    className={`bg-white border rounded-2xl p-4 space-y-3 transition-all shadow-xs ${
                      rule.active
                        ? "border-slate-200 hover:border-emerald-300"
                        : "border-slate-200 opacity-60 bg-slate-50/50"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${typeColor}`}
                          >
                            {typeIcon}
                            <span>{rule.ruleType.replace("_", " ")}</span>
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {rule.targetCategory || "All Categories"}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900 leading-snug">{rule.name}</h3>
                      </div>

                      {/* Toggle Active Switch */}
                      <button
                        type="button"
                        onClick={() => toggleDynamicPricingRule(rule.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                          rule.active ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                        title={rule.active ? "Click to Disable Rule" : "Click to Enable Rule"}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            rule.active ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Condition Pill */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="font-medium flex items-center justify-between">
                        <span>Condition Trigger:</span>
                        <span className="font-mono text-slate-900 font-bold">{conditionText}</span>
                      </div>
                      {rule.description && (
                        <p className="text-[10px] text-slate-500 italic pt-0.5 border-t border-slate-200">
                          {rule.description}
                        </p>
                      )}
                    </div>

                    {/* Value Badge */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500">Reward / Effect:</span>
                        <div className="font-bold font-mono text-xs">
                          {isFixed ? (
                            <span className="text-emerald-700">
                              -{formatCurrency(cashbackVal, currency, language)} Cashback
                            </span>
                          ) : rule.adjustmentValue < 0 ? (
                            <span className="text-emerald-700">-{percentVal}% Discount</span>
                          ) : (
                            <span className="text-amber-700">+{percentVal}% Markup</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(rule)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit Rule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(language === "my" ? "ဤစည်းမျဉ်းကို ဖျက်မည်လား?" : "Delete this pricing rule?")) {
                              deleteDynamicPricingRule(rule.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Pricing Calculator / Simulator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4 shadow-xs sticky top-16">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">
                  {language === "my" ? "ဈေးနှုန်းတွက်ချက်မှု စမ်းသပ်စက်" : "Live Dynamic Pricing Simulator"}
                </h3>
                <p className="text-[10px] text-slate-500">
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
                <label className="block text-slate-600 mb-1 font-medium text-[11px]">
                  {language === "my" ? "စမ်းသပ်မည့် ပစ္စည်း (Sample Product):" : "Sample Product:"}
                </label>
                <select
                  value={simProductId}
                  onChange={(e) => setSimProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) - {formatCurrency(p.sellingPrice, currency, language)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input with Stepper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-600 font-medium text-[11px]">
                    {language === "my" ? "ဝယ်ယူမည့် အရေအတွက် (Quantity / Qty):" : "Quantity (Qty):"}
                  </label>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                    {simQuantity} {simQuantity > 1 ? "units" : "unit"}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setSimQuantityStr(String(Math.max(1, (parseInt(simQuantityStr) || 1) - 1)))}
                    className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
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
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold text-center focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSimQuantityStr(String((parseInt(simQuantityStr) || 0) + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimQuantityStr(String((parseInt(simQuantityStr) || 0) + 5))}
                    className="px-2 h-8 rounded-lg bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200 text-[10px] font-mono font-semibold"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            {simulationResult && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>မူရင်း ရောင်းဈေး (Base Unit Price):</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {formatCurrency(simulationResult.baseUnitPrice, currency, language)}
                  </span>
                </div>

                {/* Applied Rules Chips */}
                <div className="space-y-1 py-1.5 border-y border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>{language === "my" ? "ကိုက်ညီသော စည်းမျဉ်းများ:" : "Triggered Rules:"}</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {simulationResult.appliedRules.length} matched
                    </span>
                  </div>
                  {simulationResult.appliedRules.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic py-0.5">
                      {language === "my"
                        ? "မည်သည့် စည်းမျဉ်းမှ မကိုက်ညီပါ (မူရင်းဈေးအတိုင်း)"
                        : "No active rules matched current conditions"}
                    </div>
                  ) : (
                    simulationResult.appliedRules.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-[11px] items-center bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-xs"
                      >
                        <span className="truncate pr-2 text-slate-800 font-medium">• {item.text}</span>
                        <span
                          className={`font-mono font-bold shrink-0 text-xs ${
                            item.isDiscount ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {item.amountOrPct}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Adjusted Unit Price */}
                <div className="flex justify-between text-slate-800 font-semibold items-center">
                  <span>သတ်မှတ်ပြီး တစ်ခုချင်းရောင်းဈေး:</span>
                  <span className="font-mono text-emerald-700 font-bold text-sm">
                    {formatCurrency(simulationResult.adjustedUnitPrice, currency, language)}
                  </span>
                </div>

                {/* Total Calculated Line */}
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>မူရင်းစုစုပေါင်း ({simQuantity} ခု):</span>
                    <span className="font-mono line-through text-slate-400">
                      {formatCurrency(simulationResult.originalTotal, currency, language)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm">
                    <span>နောက်ဆုံး ကျသင့်ငွေ:</span>
                    <span className="font-mono text-emerald-700 text-base">
                      {formatCurrency(simulationResult.finalTotal, currency, language)}
                    </span>
                  </div>
                  {simulationResult.difference !== 0 && (
                    <div className="text-right text-[11px] font-mono font-bold pt-0.5">
                      {simulationResult.difference < 0 ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                          Total Discount: -{formatCurrency(Math.abs(simulationResult.difference), currency, language)}
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 space-y-4 text-slate-800 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingRuleId
                      ? language === "my"
                        ? "စည်းမျဉ်း ပြင်ဆင်ခြင်း (Edit Pricing Rule)"
                        : "Edit Dynamic Pricing Rule"
                      : language === "my"
                      ? "စည်းမျဉ်းအသစ် သတ်မှတ်ခြင်း (New Pricing Rule)"
                      : "Create Dynamic Pricing Rule"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === "my"
                      ? "ရက်အလိုက် Promotion၊ ငွေပမာဏ Cash Back သို့မဟုတ် အချိန်ပိုင်း/လက်ကား လျှော့ဈေး သတ်မှတ်ပါ"
                      : "Configure date promotions, spend cashback tiers, happy hour or volume discount rules"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              {/* 1. Rule Name */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {language === "my" ? "စည်းမျဉ်းအမည် (Rule Name) *" : "Rule Name *"}
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Monsoon Promotion (Buy 2+ Get 12% Off), Spend 500k Get 25k Cashback..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>

              {/* 2. Rule Type Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
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
                        ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400 text-emerald-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-800">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Date-Range Promo</span>
                    </div>
                    <span className="text-[10px] text-slate-500">ရက်အလိုက် ကာလသတ်မှတ်ပြီး Qty အလိုက် လျှော့ပေးခြင်း</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRuleType("SPEND_CASHBACK");
                      setFormAdjustmentType("FIXED_AMOUNT");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formRuleType === "SPEND_CASHBACK"
                        ? "bg-amber-50 border-amber-500 ring-1 ring-amber-400 text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-amber-800">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>Spend Cashback</span>
                    </div>
                    <span className="text-[10px] text-slate-500">ငွေအမောက် ဘယ်လောက်ဖိုးဝယ်ရင် Cashback ပေးမည်</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRuleType("TIME_WINDOW");
                      setFormAdjustmentType("PERCENTAGE");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formRuleType === "TIME_WINDOW"
                        ? "bg-purple-50 border-purple-500 ring-1 ring-purple-400 text-purple-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-purple-800">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>Happy Hour / Time</span>
                    </div>
                    <span className="text-[10px] text-slate-500">နေ့စဉ် အချိန်ပိုင်း အလိုအလျောက် ဈေးလျှော့ခြင်း</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRuleType("VOLUME_TIER");
                      setFormAdjustmentType("PERCENTAGE");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      formRuleType === "VOLUME_TIER"
                        ? "bg-teal-50 border-teal-500 ring-1 ring-teal-400 text-teal-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs text-teal-800">
                      <Layers className="w-3.5 h-3.5 text-teal-600" />
                      <span>Volume Tier / Bulk</span>
                    </div>
                    <span className="text-[10px] text-slate-500">အရေအတွက်များလျှင် လက်ကားဈေးပေးခြင်း</span>
                  </button>
                </div>
              </div>

              {/* 3. Conditional Parameters based on Type */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                {/* DATE_RANGE Fields */}
                {formRuleType === "DATE_RANGE" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1 text-[11px] font-medium">
                          {language === "my" ? "စတင်မည့် ရက် (Start Date):" : "Start Date:"}
                        </label>
                        <input
                          type="date"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 text-[11px] font-medium">
                          {language === "my" ? "ပြီးဆုံးမည့် ရက် (End Date):" : "End Date:"}
                        </label>
                        <input
                          type="date"
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Minimum Units Requirement */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-600 text-[11px] font-medium">
                          {language === "my"
                            ? "အနည်းဆုံး ဝယ်ယူရမည့် အရေအတွက် (Min Quantity):"
                            : "Min Units Threshold:"}
                        </label>
                        <span className="text-emerald-700 font-mono text-[10px] font-semibold">
                          ≥ {formMinUnits} {formMinUnits > 1 ? "units" : "unit"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setFormMinUnitsStr(String(Math.max(1, (parseInt(formMinUnitsStr) || 1) - 1)))
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
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
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold text-center focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setFormMinUnitsStr(String((parseInt(formMinUnitsStr) || 0) + 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SPEND_CASHBACK Fields */}
                {formRuleType === "SPEND_CASHBACK" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-600 text-[11px] font-medium">
                          {language === "my"
                            ? "အနည်းဆုံး ဝယ်ယူရမည့် ငွေပမာဏ (Minimum Spend Amount in MMK):"
                            : "Minimum Spend Amount (MMK):"}
                        </label>
                        <span className="text-amber-700 font-mono text-[10px] font-semibold">
                          ≥ {formatCurrency(formMinSpend, currency, language)}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        inputMode="numeric"
                        value={formMinSpendStr}
                        onChange={(e) => setFormMinSpendStr(e.target.value)}
                        placeholder="e.g. 500000"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-600 text-[11px] font-medium">
                          {language === "my"
                            ? "ပေးမည့် Cash Back Amount (Cashback / Direct Cash Discount in MMK):"
                            : "Cashback Reward Amount (MMK):"}
                        </label>
                        <span className="text-emerald-700 font-mono text-[10px] font-semibold">
                          -{formatCurrency(formCashbackAmount, currency, language)}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        inputMode="numeric"
                        value={formCashbackAmountStr}
                        onChange={(e) => setFormCashbackAmountStr(e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Target Category */}
                <div>
                  <label className="block text-slate-600 mb-1 text-[11px] font-medium">
                    {language === "my"
                      ? "အကျုံးဝင်မည့် ပစ္စည်း အမျိုးအစား (Target Product Category):"
                      : "Target Product Category (ALL Price Category or Specific):"}
                  </label>
                  <select
                    value={formTargetCategory}
                    onChange={(e) => setFormTargetCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {productCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "All Categories" ? "All Categories (ALL Price Category အကုန်လုံး)" : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Price Adjustment Type & Values */}
              {formRuleType !== "SPEND_CASHBACK" && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    {language === "my"
                      ? "ဈေးနှုန်း လျှော့ချမှု / တိုးမြှင့်မှု (Price Adjustment %)"
                      : "Price Adjustment (% Percentage)"}
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setFormAdjustmentMode("DISCOUNT")}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors ${
                          formAdjustmentMode === "DISCOUNT"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
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
                            ? "bg-amber-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Markup (+%)</span>
                      </button>
                    </div>

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
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-center focus:outline-none focus:border-emerald-500 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
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

                return (
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-800 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Live Calculation Preview on Sample Item:</span>
                      </span>
                      <select
                        value={formSampleProductId}
                        onChange={(e) => setFormSampleProductId(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none"
                      >
                        {products.slice(0, 8).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name.slice(0, 20)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2 rounded-lg border border-slate-200">
                      <div>
                        <div className="text-slate-500 text-[10px]">Original Unit Price</div>
                        <div className="text-slate-900 font-semibold">{formatCurrency(basePrice, currency, language)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">
                          {formRuleType === "SPEND_CASHBACK"
                            ? "Effective Price (w/ Cashback)"
                            : formAdjustmentMode === "DISCOUNT"
                            ? "Calculated Discounted Price"
                            : "Calculated Markup Price"}
                        </div>
                        <div className="text-emerald-700 font-bold text-xs">{formatCurrency(adjPrice, currency, language)}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 5. Description / Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {language === "my" ? "ရှင်းလင်းချက် မှတ်ချက် (Description / Notes)" : "Description / Notes"}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional internal note for cashiers and audit trail..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                />
              </div>

              {/* 6. Active Status Switch */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900 text-xs">
                    {language === "my" ? "စည်းမျဉ်းကို ချက်ချင်း အသက်သွင်းမည်" : "Enable Rule Immediately"}
                  </div>
                  <div className="text-[11px] text-slate-500">Active rules apply automatically during POS sales</div>
                </div>
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-white border-slate-300 focus:ring-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  {language === "my" ? "ပယ်ဖျက်မည်" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
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
