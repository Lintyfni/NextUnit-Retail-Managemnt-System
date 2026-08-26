import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { PromotionRule } from "../../types";
import {
  Gift,
  Tag,
  Send,
  Award,
  Percent,
  Plus,
  X,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Banknote,
  Calendar,
  Copy,
  Check,
  Edit2,
  Trash2,
  Search,
  Power,
} from "lucide-react";

export const CRMView: React.FC = () => {
  const {
    promotions,
    branches,
    currency,
    language,
    addAuditLog,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionActive,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"PROMOS" | "TIERS" | "CAMPAIGNS">("PROMOS");
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FIXED_AMOUNT" | "PERCENTAGE" | "ACTIVE">("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Campaign Blast State
  const [targetAudience, setTargetAudience] = useState("ALL_VIP");
  const [campaignChannel, setCampaignChannel] = useState("VIBER_SMS");
  const [selectedPromoForBlast, setSelectedPromoForBlast] = useState<string>("");
  const [campaignMessage, setCampaignMessage] = useState(
    "NextUnit Tech VIP Special: Get 50,000 MMK OFF on purchases over 800,000 MMK with voucher code CASH50K! Show this message at any branch."
  );
  const [campaignSent, setCampaignSent] = useState(false);

  // Form State for Create / Edit Promo
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<"FIXED_AMOUNT" | "PERCENTAGE" | "HAPPY_HOUR" | "TIER_DISCOUNT">("FIXED_AMOUNT");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(50000);
  const [formMinSpend, setFormMinSpend] = useState<number>(500000);
  const [formStartDate, setFormStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formEndDate, setFormEndDate] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [formUsageLimit, setFormUsageLimit] = useState<number>(200);
  const [formTargetTier, setFormTargetTier] = useState<string>("ALL");
  const [formBranchRestriction, setFormBranchRestriction] = useState<string>("ALL");
  const [formActive, setFormActive] = useState(true);

  const vipTiers = [
    {
      name: "BRONZE",
      minSpend: 0,
      discount: "1% Standard Cashback",
      pointsRate: "1 Pt per 1,000 Ks",
      color: "border-amber-300 bg-amber-50/50 text-amber-900",
      count: 420,
    },
    {
      name: "SILVER",
      minSpend: 1500000,
      discount: "3% Instant Discount on Accessories",
      pointsRate: "1.5 Pts per 1,000 Ks",
      color: "border-slate-300 bg-slate-50 text-slate-800",
      count: 180,
    },
    {
      name: "GOLD",
      minSpend: 5000000,
      discount: "5% Storewide + Priority Pre-orders",
      pointsRate: "2 Pts per 1,000 Ks",
      color: "border-yellow-300 bg-yellow-50/50 text-yellow-900",
      count: 75,
    },
    {
      name: "PLATINUM",
      minSpend: 15000000,
      discount: "8% Storewide + Free On-site Express Delivery",
      pointsRate: "3 Pts per 1,000 Ks",
      color: "border-emerald-300 bg-emerald-50/50 text-emerald-950",
      count: 24,
    },
  ];

  const handleOpenCreateModal = () => {
    setEditingPromoId(null);
    setFormCode(`PROMO-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormTitle("");
    setFormType("FIXED_AMOUNT");
    setFormDiscountValue(50000);
    setFormMinSpend(500000);
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormEndDate(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setFormUsageLimit(200);
    setFormTargetTier("ALL");
    setFormBranchRestriction("ALL");
    setFormActive(true);
    setShowPromoModal(true);
  };

  const handleOpenEditModal = (promo: PromotionRule) => {
    setEditingPromoId(promo.id);
    setFormCode(promo.code);
    setFormTitle(promo.title);
    setFormType(promo.type);
    setFormDiscountValue(promo.discountValue);
    setFormMinSpend(promo.minSpend || 0);
    setFormStartDate(promo.startDate ? promo.startDate.slice(0, 10) : "");
    setFormEndDate(promo.endDate ? promo.endDate.slice(0, 10) : "");
    setFormUsageLimit(promo.usageLimit || 200);
    setFormTargetTier(promo.targetTiers?.[0] || "ALL");
    setFormBranchRestriction(promo.branchRestrictions?.[0] || "ALL");
    setFormActive(promo.active);
    setShowPromoModal(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitle) return;

    const promoData: Partial<PromotionRule> = {
      code: formCode.toUpperCase().trim(),
      title: formTitle.trim(),
      type: formType,
      discountValue: Number(formDiscountValue),
      minSpend: Number(formMinSpend) || 0,
      startDate: formStartDate ? new Date(formStartDate).toISOString() : undefined,
      endDate: formEndDate ? new Date(formEndDate).toISOString() : undefined,
      usageLimit: Number(formUsageLimit) || 200,
      targetTiers: formTargetTier === "ALL" ? undefined : [formTargetTier as any],
      branchRestrictions: formBranchRestriction === "ALL" ? [] : [formBranchRestriction],
      active: formActive,
    };

    if (editingPromoId) {
      updatePromotion({
        ...promoData,
        id: editingPromoId,
      });
      addAuditLog("PROMOTION_UPDATED", `Updated coupon ${formCode} (${formTitle})`);
    } else {
      createPromotion({
        ...promoData,
        code: formCode.toUpperCase().trim(),
        title: formTitle.trim(),
        type: formType,
        discountValue: Number(formDiscountValue),
        minSpend: Number(formMinSpend) || 0,
        active: formActive,
      });
      addAuditLog("PROMOTION_CREATED", `Created new coupon ${formCode} with ${formDiscountValue} discount`);
    }

    setShowPromoModal(false);
  };

  const handleDeletePromo = (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      deletePromotion(id);
      addAuditLog("PROMOTION_DELETED", `Deleted promo coupon ${code}`);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectPromoForBlast = (code: string) => {
    setSelectedPromoForBlast(code);
    const promo = promotions.find((p) => p.code === code);
    if (promo) {
      const discountDesc =
        promo.type === "FIXED_AMOUNT" || promo.type === "HAPPY_HOUR"
          ? `${formatCurrency(promo.discountValue, currency, language)} MMK OFF`
          : `${promo.discountValue}% OFF`;
      const minSpendDesc = promo.minSpend > 0 ? ` on purchases over ${formatCurrency(promo.minSpend, currency, language)} MMK` : "";
      setCampaignMessage(
        `NextUnit Tech VIP Alert: Enjoy ${discountDesc}${minSpendDesc} using voucher code ${promo.code}! Valid until ${
          promo.endDate ? promo.endDate.slice(0, 10) : "end of month"
        }. Shop at any branch or online.`
      );
    }
  };

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setCampaignSent(true);
    addAuditLog("MARKETING_CAMPAIGN_SENT", `Dispatched ${campaignChannel} broadcast to ${targetAudience}`);
    setTimeout(() => {
      setCampaignSent(false);
    }, 4000);
  };

  // Filtered promotions
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (typeFilter === "FIXED_AMOUNT") {
      return promo.type === "FIXED_AMOUNT" || promo.type === "HAPPY_HOUR";
    }
    if (typeFilter === "PERCENTAGE") {
      return promo.type === "PERCENTAGE" || promo.type === "TIER_DISCOUNT";
    }
    if (typeFilter === "ACTIVE") {
      return promo.active;
    }
    return true;
  });

  const fixedAmountCount = promotions.filter((p) => p.type === "FIXED_AMOUNT" || p.type === "HAPPY_HOUR").length;
  const percentageCount = promotions.filter((p) => p.type === "PERCENTAGE" || p.type === "TIER_DISCOUNT").length;
  const activeCount = promotions.filter((p) => p.active).length;

  return (
    <div id="crm-promotions-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{language === "my" ? "CRM၊ အသင်းဝင်စနစ်နှင့် Coupon ကူပွန်များ" : "CRM, VIP Loyalty & Coupon Promotions"}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {language === "my" ? "ငွေသားအမောက် / % စနစ်" : "Fixed Cash & % Modes"}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {language === "my"
                ? "ငွေအမောက် တိုက်ရိုက်လျှော့ကူပွန်များ • ရာခိုင်နှုန်း လျှော့စျေးများ • VIP Member Tiers • SMS/Viber Marketing"
                : "Fixed Cash Amount Coupons • Percentage Discounts • VIP Membership Perks • Multichannel Marketing"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("PROMOS")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "PROMOS" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{language === "my" ? `Coupons (${promotions.length})` : `Coupons (${promotions.length})`}</span>
            </button>
            <button
              onClick={() => setActiveTab("TIERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "TIERS" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{language === "my" ? "VIP Tiers" : "VIP Tiers"}</span>
            </button>
            <button
              onClick={() => setActiveTab("CAMPAIGNS")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "CAMPAIGNS" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{language === "my" ? "SMS / Viber Blast" : "SMS / Viber Blast"}</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{language === "my" ? "Coupon အသစ်ဖန်တီးမည်" : "Create Coupon"}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Promo Coupons List with Filters */}
      {activeTab === "PROMOS" && (
        <div className="space-y-4">
          {/* Filter Bar & Search */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={language === "my" ? "Coupon Code သို့မဟုတ် Title ဖြင့် ရှာဖွေပါ..." : "Search by Coupon Code or Title..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  typeFilter === "ALL"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {language === "my" ? `အားလုံး (${promotions.length})` : `All (${promotions.length})`}
              </button>
              <button
                onClick={() => setTypeFilter("FIXED_AMOUNT")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  typeFilter === "FIXED_AMOUNT"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:text-emerald-700 border border-slate-200"
                }`}
              >
                <Banknote className="w-3.5 h-3.5 text-current" />
                <span>{language === "my" ? `ငွေအမောက် (${fixedAmountCount})` : `Fixed Cash (${fixedAmountCount})`}</span>
              </button>
              <button
                onClick={() => setTypeFilter("PERCENTAGE")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  typeFilter === "PERCENTAGE"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:text-emerald-700 border border-slate-200"
                }`}
              >
                <Percent className="w-3.5 h-3.5 text-current" />
                <span>{language === "my" ? `ရာခိုင်နှုန်း % (${percentageCount})` : `Percentage % (${percentageCount})`}</span>
              </button>
              <button
                onClick={() => setTypeFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  typeFilter === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:text-emerald-700 border border-slate-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-current" />
                <span>{language === "my" ? `အသုံးပြုနိုင်ဆဲ (${activeCount})` : `Active (${activeCount})`}</span>
              </button>
            </div>
          </div>

          {/* Grid of Promotions */}
          {filteredPromotions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-xs">
              <Tag className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="text-xs">
                {language === "my"
                  ? "ရှာဖွေမှုနှင့် ကိုက်ညီသော Coupon မတွေ့ရှိပါ။"
                  : "No promotions found matching the selected filter."}
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                {language === "my" ? "Coupon အသစ်တစ်ခု ထည့်သွင်းမည်" : "Create New Coupon"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPromotions.map((promo) => {
                const isFixedCash = promo.type === "FIXED_AMOUNT" || promo.type === "HAPPY_HOUR";
                const usageRatio = Math.min(100, Math.round(((promo.usageCount || 0) / (promo.usageLimit || 100)) * 100));

                return (
                  <div
                    key={promo.id}
                    className={`bg-white border rounded-2xl p-4 space-y-3.5 shadow-xs transition-all relative group ${
                      promo.active
                        ? "border-slate-200 hover:border-emerald-300"
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* Top Row: Code, Discount Type Badge, Active Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                            {promo.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(promo.code)}
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                            title="Copy code for POS"
                          >
                            {copiedCode === promo.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{promo.title}</h3>
                      </div>

                      {/* Status Toggle & Badge */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => togglePromotionActive(promo.id)}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                            promo.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                          title={promo.active ? "Click to Deactivate" : "Click to Activate"}
                        >
                          <Power className="w-2.5 h-2.5" />
                          <span>{promo.active ? "ACTIVE" : "INACTIVE"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Discount Value Display Banner */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isFixedCash
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                          : "bg-teal-50/70 border-teal-200 text-teal-900"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            isFixedCash ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {isFixedCash ? <Banknote className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {isFixedCash
                              ? language === "my"
                                ? "ငွေသားအမောက် လျှော့ပေးမှု"
                                : "Fixed Cash Discount"
                              : language === "my"
                              ? "ရာခိုင်နှုန်း လျှော့ပေးမှု"
                              : "Percentage Discount"}
                          </div>
                          <div className="text-sm font-black font-mono">
                            {isFixedCash
                              ? `-${formatCurrency(promo.discountValue, currency, language)} OFF`
                              : `-${promo.discountValue}% OFF`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                            isFixedCash
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-teal-100 text-teal-800 border border-teal-200"
                          }`}
                        >
                          {isFixedCash ? "Fixed MMK" : "Percentage"}
                        </span>
                      </div>
                    </div>

                    {/* Requirements & Target Details */}
                    <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px]">
                          {language === "my" ? "အနည်းဆုံး ဝယ်ယူမှု:" : "Min Spend:"}
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {promo.minSpend > 0
                            ? formatCurrency(promo.minSpend, currency, language)
                            : language === "my"
                            ? "ကန့်သတ်ချက်မရှိ (0 Ks)"
                            : "No Min Spend"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px]">
                          {language === "my" ? "ပစ်မှတ် VIP အဆင့်:" : "Target Member:"}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-900">
                          {promo.targetTiers && promo.targetTiers.length > 0
                            ? promo.targetTiers.join(", ")
                            : language === "my"
                            ? "ဝယ်ယူသူအားလုံး"
                            : "All Customers"}
                        </span>
                      </div>

                      {/* Usage progress bar */}
                      <div className="pt-1 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{language === "my" ? "အသုံးပြုမှု အကြိမ်ရေ:" : "Redemption Usage:"}</span>
                          <span className="font-mono font-semibold text-slate-700">
                            {promo.usageCount || 0} / {promo.usageLimit || 200}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              usageRatio > 80 ? "bg-rose-500" : isFixedCash ? "bg-emerald-600" : "bg-teal-600"
                            }`}
                            style={{ width: `${usageRatio}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {promo.endDate
                            ? `${language === "my" ? "သက်တမ်း:" : "Exp:"} ${promo.endDate}`
                            : "No Expiry"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(promo)}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo.id, promo.code)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Coupon"
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
      )}

      {/* Tab 2: VIP Tiers */}
      {activeTab === "TIERS" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vipTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`border rounded-2xl p-4 space-y-3.5 shadow-xs transition-all hover:scale-[1.01] ${tier.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <h3 className="font-bold text-sm tracking-wider">{tier.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                    {tier.count} Members
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-[11px] opacity-80">
                    {language === "my" ? "အဆင့်ပြည့်ရန် ဝယ်ယူမှု:" : "Required Spend:"}
                  </div>
                  <div className="font-mono font-bold text-sm">
                    {formatCurrency(tier.minSpend, currency, language)}+
                  </div>
                </div>

                <div className="pt-2.5 border-t border-current/20 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{tier.discount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{tier.pointsRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Marketing Broadcast Campaign */}
      {activeTab === "CAMPAIGNS" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>
                {language === "my"
                  ? "Viber / SMS အသင်းဝင် စျေးရောင်းမက်ဆေ့ခ်ျ ပို့ဆောင်ခြင်း"
                  : "Omnichannel Customer Marketing Broadcast"}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === "my"
                ? "VIP အသင်းဝင်များနှင့် ဖောက်သည်များထံသို့ Fixed Cash Coupon သို့မဟုတ် ရာခိုင်နှုန်း လျှော့စျေးများကို တစ်ပြိုင်နက် ပေးပို့ပါ"
                : "Send bulk personalized promotional announcements and coupon vouchers directly to VIP members"}
            </p>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-medium">
                {language === "my" ? "ထည့်သွင်းမည့် Coupon ရွေးချယ်ပါ (Optional)" : "Attach Coupon Code to Blast (Optional)"}
              </label>
              <select
                value={selectedPromoForBlast}
                onChange={(e) => handleSelectPromoForBlast(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="">-- Custom Message (No Coupon Code) --</option>
                {promotions
                  .filter((p) => p.active)
                  .map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} - {p.title} (
                      {p.type === "FIXED_AMOUNT" || p.type === "HAPPY_HOUR"
                        ? `-${formatCurrency(p.discountValue, currency, language)} MMK`
                        : `-${p.discountValue}%`}
                      )
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">
                  {language === "my" ? "လက်ခံမည့် ဖောက်သည်အုပ်စု" : "Target Segment"}
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="ALL_VIP">All VIP Members (Platinum, Gold, Silver)</option>
                  <option value="PLATINUM_ONLY">Platinum VIP High Rollers Only</option>
                  <option value="GOLD_ONLY">Gold VIP Members</option>
                  <option value="INACTIVE_60D">Dormant Customers (No purchase in 60d)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-medium">
                  {language === "my" ? "ဆက်သွယ်ရေးလမ်းကြောင်း" : "Broadcast Channel"}
                </label>
                <select
                  value={campaignChannel}
                  onChange={(e) => setCampaignChannel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="VIBER_SMS">Viber Business + Fallback SMS</option>
                  <option value="TELEGRAM">Telegram Bot Broadcast</option>
                  <option value="EMAIL">HTML Newsletter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-medium">{language === "my" ? "မက်ဆေ့ခ်ျ အကြောင်းအရာ" : "Message Body"}</label>
              <textarea
                rows={4}
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-xs transition-all hover:scale-[1.01] active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{language === "my" ? "Campaign စတင်ပေးပို့မည်" : "Launch Campaign Broadcast"}</span>
            </button>

            {campaignSent && (
              <div className="text-xs text-emerald-700 text-center font-bold animate-fade-in p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                ✓ Message successfully dispatched to 1,280 VIP subscribers!
              </div>
            )}
          </form>
        </div>
      )}

      {/* Create / Edit Promo Coupon Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-fade-in max-h-[92vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingPromoId
                      ? language === "my"
                        ? "Coupon အချက်အလက် ပြင်ဆင်ခြင်း"
                        : "Edit Promo Coupon"
                      : language === "my"
                      ? "Coupon Code အသစ်ဖန်တီးခြင်း"
                      : "Create Promo Discount Coupon"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === "my"
                      ? "ငွေအမောက် တိုက်ရိုက်လျှော့ သို့မဟုတ် ရာခိုင်နှုန်း သတ်မှတ်နိုင်သည်"
                      : "Configure fixed cash amount discount or percentage discount"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPromoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
              {/* Row 1: Code and Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "Coupon Code *" : "Coupon Code *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CASH50K"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "Campaign Title (အမည်) *" : "Campaign Title *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mega Cash Saver 50,000 MMK"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Discount Type Toggle: Fixed Cash Amount vs Percentage */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-slate-700 font-semibold">
                  {language === "my" ? "လျှော့စျေးအမျိုးအစား (Discount Type) *" : "Discount Type *"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("FIXED_AMOUNT");
                      if (formDiscountValue < 1000) setFormDiscountValue(50000);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formType === "FIXED_AMOUNT" || formType === "HAPPY_HOUR"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-current" />
                    <span>{language === "my" ? "ငွေအမောက် (Fixed MMK)" : "Fixed Cash Amount (MMK)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType("PERCENTAGE");
                      if (formDiscountValue > 100) setFormDiscountValue(10);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formType === "PERCENTAGE" || formType === "TIER_DISCOUNT"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <Percent className="w-4 h-4 text-current" />
                    <span>{language === "my" ? "ရာခိုင်နှုန်း (Percentage %)" : "Percentage (%)"}</span>
                  </button>
                </div>

                {/* Discount Value Input with Quick Preset Chips */}
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-700 font-semibold">
                      {formType === "FIXED_AMOUNT" || formType === "HAPPY_HOUR"
                        ? language === "my"
                          ? "လျှော့ပေးမည့် ငွေပမာဏ (MMK / ကျပ်) *"
                          : "Discount Amount (MMK) *"
                        : language === "my"
                        ? "လျှော့ပေးမည့် ရာခိုင်နှုန်း (%) *"
                        : "Discount Percentage (%) *"}
                    </label>
                    <span className="font-mono text-emerald-700 font-bold">
                      {formType === "FIXED_AMOUNT" || formType === "HAPPY_HOUR"
                        ? `${formatCurrency(formDiscountValue, currency, language)} လျှော့ပေးမည်`
                        : `${formDiscountValue}% OFF`}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      required
                      value={formDiscountValue || ""}
                      onChange={(e) => setFormDiscountValue(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <div className="absolute right-3 top-2 text-xs font-bold text-slate-500 font-mono">
                      {formType === "FIXED_AMOUNT" || formType === "HAPPY_HOUR" ? "MMK" : "%"}
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500">{language === "my" ? "အမြန်ရွေးရန်:" : "Presets:"}</span>
                    {formType === "FIXED_AMOUNT" || formType === "HAPPY_HOUR"
                      ? [10000, 20000, 30000, 50000, 100000, 200000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setFormDiscountValue(val)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-colors ${
                              formDiscountValue === val
                                ? "bg-emerald-600 text-white"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            +{val.toLocaleString()} Ks
                          </button>
                        ))
                      : [5, 10, 15, 20, 25, 30].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setFormDiscountValue(val)}
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-colors ${
                              formDiscountValue === val
                                ? "bg-emerald-600 text-white"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Minimum Spend & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "အနည်းဆုံး ဝယ်ယူရမည့် ပမာဏ (Min Spend)" : "Minimum Spend (MMK)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMinSpend || ""}
                    onChange={(e) => setFormMinSpend(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-bold"
                    placeholder="0 = ကန့်သတ်ချက်မရှိ"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {language === "my" ? "အများဆုံး အသုံးပြုနိုင်သည့် အကြိမ်ရေ" : "Max Usage Limit"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formUsageLimit || ""}
                    onChange={(e) => setFormUsageLimit(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Start Date and End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">
                    {language === "my" ? "စတင်မည့်ရက် (Start Date)" : "Start Date"}
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">
                    {language === "my" ? "သက်တမ်းကုန်ဆုံးမည့်ရက် (End Date)" : "End Date"}
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 5: Target VIP Tier & Branch Restrictions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">
                    {language === "my" ? "အကျုံးဝင်မည့် VIP အဆင့်" : "Target VIP Tier"}
                  </label>
                  <select
                    value={formTargetTier}
                    onChange={(e) => setFormTargetTier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="ALL">{language === "my" ? "ဝယ်သူအားလုံး (All Customers)" : "All Customers"}</option>
                    <option value="PLATINUM">Platinum VIP Only</option>
                    <option value="GOLD">Gold VIP & Above</option>
                    <option value="SILVER">Silver VIP & Above</option>
                    <option value="BRONZE">Bronze Standard Members</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">
                    {language === "my" ? "အကျုံးဝင်မည့် ဆိုင်ခွဲ" : "Branch Restriction"}
                  </label>
                  <select
                    value={formBranchRestriction}
                    onChange={(e) => setFormBranchRestriction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="ALL">{language === "my" ? "ဆိုင်ခွဲအားလုံး (All Branches)" : "All Branches"}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="promo-active-checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                  />
                  <label htmlFor="promo-active-checkbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                    {language === "my" ? "ယခု ချက်ချင်း အသက်သွင်းမည် (Active)" : "Activate immediately"}
                  </label>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPromoModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    {language === "my" ? "မလုပ်တော့ပါ" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs transition-all hover:scale-[1.02]"
                  >
                    {editingPromoId
                      ? language === "my"
                        ? "သိမ်းဆည်းမည်"
                        : "Save Changes"
                      : language === "my"
                      ? "Coupon ဖန်တီးမည်"
                      : "Create Coupon"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
