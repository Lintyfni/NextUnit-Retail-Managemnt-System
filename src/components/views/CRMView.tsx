import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, DICTIONARY } from "../../utils/helpers";
import { PromotionRule } from "../../types";
import {
  Gift,
  Tag,
  Send,
  Award,
  Users,
  Percent,
  Plus,
  X,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Banknote,
  Coins,
  Calendar,
  Building2,
  Copy,
  Check,
  Edit2,
  Trash2,
  Filter,
  ArrowRight,
  Search,
  Power,
} from "lucide-react";

export const CRMView: React.FC = () => {
  const {
    promotions,
    branches,
    customers,
    currency,
    language,
    addAuditLog,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionActive,
  } = useApp();
  const t = DICTIONARY[language];

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
    "OmniChain VIP Special: Get 50,000 MMK OFF on purchases over 800,000 MMK with voucher code CASH50K! Show this message at any branch."
  );
  const [campaignSent, setCampaignSent] = useState(false);

  // Form State for Create / Edit Promo
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<"FIXED_AMOUNT" | "PERCENTAGE" | "HAPPY_HOUR" | "TIER_DISCOUNT">("FIXED_AMOUNT");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(50000);
  const [formMinSpend, setFormMinSpend] = useState<number>(500000);
  const [formStartDate, setFormStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formEndDate, setFormEndDate] = useState<string>("2026-12-31");
  const [formUsageLimit, setFormUsageLimit] = useState<number>(200);
  const [formTargetTier, setFormTargetTier] = useState<string>("ALL");
  const [formBranchRestriction, setFormBranchRestriction] = useState<string>("ALL");
  const [formActive, setFormActive] = useState(true);

  const vipTiers = [
    {
      name: "PLATINUM",
      minSpend: 10000000,
      discount: "8% Auto-VIP Discount",
      pointsRate: "2x Points Multiplier",
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      count: customers.filter((c) => c.membershipTier === "PLATINUM").length,
    },
    {
      name: "GOLD",
      minSpend: 5000000,
      discount: "5% Auto-VIP Discount",
      pointsRate: "1.5x Points Multiplier",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      count: customers.filter((c) => c.membershipTier === "GOLD").length,
    },
    {
      name: "SILVER",
      minSpend: 2000000,
      discount: "2% Auto-VIP Discount",
      pointsRate: "1.2x Points Multiplier",
      color: "text-slate-300 border-slate-500/30 bg-slate-500/10",
      count: customers.filter((c) => c.membershipTier === "SILVER").length,
    },
    {
      name: "BRONZE",
      minSpend: 0,
      discount: "Standard Member Pricing",
      pointsRate: "1x Point / 10,000 MMK",
      color: "text-orange-300 border-orange-500/30 bg-orange-500/10",
      count: customers.filter((c) => c.membershipTier === "BRONZE").length,
    },
  ];

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPromoId(null);
    setFormCode("");
    setFormTitle("");
    setFormType("FIXED_AMOUNT");
    setFormDiscountValue(50000);
    setFormMinSpend(500000);
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormEndDate("2026-12-31");
    setFormUsageLimit(200);
    setFormTargetTier("ALL");
    setFormBranchRestriction("ALL");
    setFormActive(true);
    setShowPromoModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (promo: PromotionRule) => {
    setEditingPromoId(promo.id);
    setFormCode(promo.code);
    setFormTitle(promo.title);
    setFormType(promo.type);
    setFormDiscountValue(promo.discountValue);
    setFormMinSpend(promo.minSpend);
    setFormStartDate(promo.startDate || new Date().toISOString().slice(0, 10));
    setFormEndDate(promo.endDate || "2026-12-31");
    setFormUsageLimit(promo.usageLimit || 500);
    setFormTargetTier(promo.targetTiers && promo.targetTiers.length > 0 ? promo.targetTiers[0] : "ALL");
    setFormBranchRestriction(
      promo.branchRestrictions && promo.branchRestrictions.length > 0 ? promo.branchRestrictions[0] : "ALL"
    );
    setFormActive(promo.active);
    setShowPromoModal(true);
  };

  // Save (Create or Update) Promo
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formTitle.trim()) {
      alert(language === "my" ? "Coupon Code နှင့် Campaign Title ဖြည့်သွင်းပေးပါ" : "Please fill in Coupon Code and Title");
      return;
    }

    const cleanCode = formCode.trim().toUpperCase().replace(/\s+/g, "");

    const payload: Omit<PromotionRule, "id" | "usageCount"> = {
      code: cleanCode,
      title: formTitle.trim(),
      type: formType,
      discountValue: Number(formDiscountValue) || 0,
      minSpend: Number(formMinSpend) || 0,
      startDate: formStartDate,
      endDate: formEndDate,
      active: formActive,
      branchRestrictions: formBranchRestriction === "ALL" ? [] : [formBranchRestriction],
      targetTiers: formTargetTier === "ALL" ? undefined : [formTargetTier],
      usageLimit: Number(formUsageLimit) || 100,
    };

    if (editingPromoId) {
      const existing = promotions.find((p) => p.id === editingPromoId);
      if (existing) {
        updatePromotion({
          ...payload,
          id: existing.id,
          usageCount: existing.usageCount || 0,
        });
      }
    } else {
      createPromotion(payload);
    }

    setShowPromoModal(false);
  };

  // Delete Promo
  const handleDeletePromo = (id: string, code: string) => {
    if (
      window.confirm(
        language === "my"
          ? `Coupon "${code}" ကို အပြီးတိုင် ဖျက်ပစ်ရန် သေချာပါသလား?`
          : `Are you sure you want to permanently delete coupon "${code}"?`
      )
    ) {
      deletePromotion(id);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Send Marketing Campaign Blast
  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignMessage.trim()) return;
    addAuditLog("MARKETING_CAMPAIGN_BLAST", "CRM", `Dispatched ${campaignChannel} broadcast to ${targetAudience} members.`);
    setCampaignSent(true);
    setTimeout(() => setCampaignSent(false), 3500);
  };

  // Quick Promo Insert to Blast message
  const handleSelectPromoForBlast = (code: string) => {
    setSelectedPromoForBlast(code);
    const promo = promotions.find((p) => p.code === code);
    if (promo) {
      const discountDesc =
        promo.type === "FIXED_AMOUNT" || promo.type === "HAPPY_HOUR"
          ? `${formatCurrency(promo.discountValue, currency, language)} OFF`
          : `${promo.discountValue}% OFF`;
      setCampaignMessage(
        `OmniChain VIP Special: Enjoy ${discountDesc} on orders over ${formatCurrency(
          promo.minSpend,
          currency,
          language
        )} with code ${promo.code}! Valid until ${promo.endDate}. Show at cashier to redeem.`
      );
    }
  };

  // Filtered Promotions
  const filteredPromotions = promotions.filter((promo) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      promo.code.toLowerCase().includes(q) ||
      promo.title.toLowerCase().includes(q) ||
      String(promo.discountValue).includes(q);

    if (!matchQuery) return false;

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
    <div id="crm-promotions-view" className="space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500/20 to-indigo-500/20 text-pink-400 border border-pink-500/30">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{language === "my" ? "CRM၊ အသင်းဝင်စနစ်နှင့် Coupon ကူပွန်များ" : "CRM, VIP Loyalty & Coupon Promotions"}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {language === "my" ? "ငွေသားအမောက် / % စနစ်" : "Fixed Cash & % Modes"}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {language === "my"
                ? "ငွေအမောက် တိုက်ရိုက်လျှော့ကူပွန်များ • ရာခိုင်နှုန်း လျှော့စျေးများ • VIP Member Tiers • SMS/Viber Marketing"
                : "Fixed Cash Amount Coupons • Percentage Discounts • VIP Membership Perks • Multichannel Marketing"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("PROMOS")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "PROMOS" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{language === "my" ? `Coupons (${promotions.length})` : `Coupons (${promotions.length})`}</span>
            </button>
            <button
              onClick={() => setActiveTab("TIERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "TIERS" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{language === "my" ? "VIP Tiers" : "VIP Tiers"}</span>
            </button>
            <button
              onClick={() => setActiveTab("CAMPAIGNS")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "CAMPAIGNS" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{language === "my" ? "SMS / Viber Blast" : "SMS / Viber Blast"}</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
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
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder={language === "my" ? "Coupon Code သို့မဟုတ် Title ဖြင့် ရှာဖွေပါ..." : "Search by Coupon Code or Title..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
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
                    ? "bg-slate-700 text-white border border-slate-600"
                    : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {language === "my" ? `အားလုံး (${promotions.length})` : `All (${promotions.length})`}
              </button>
              <button
                onClick={() => setTypeFilter("FIXED_AMOUNT")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  typeFilter === "FIXED_AMOUNT"
                    ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                    : "bg-slate-950/60 text-slate-400 hover:text-emerald-400 border border-slate-800"
                }`}
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === "my" ? `ငွေအမောက် လျှော့စျေး (${fixedAmountCount})` : `Fixed Cash (${fixedAmountCount})`}</span>
              </button>
              <button
                onClick={() => setTypeFilter("PERCENTAGE")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  typeFilter === "PERCENTAGE"
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50"
                    : "bg-slate-950/60 text-slate-400 hover:text-indigo-400 border border-slate-800"
                }`}
              >
                <Percent className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === "my" ? `ရာခိုင်နှုန်း % (${percentageCount})` : `Percentage % (${percentageCount})`}</span>
              </button>
              <button
                onClick={() => setTypeFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  typeFilter === "ACTIVE"
                    ? "bg-teal-600/30 text-teal-300 border border-teal-500/50"
                    : "bg-slate-950/60 text-slate-400 hover:text-teal-400 border border-slate-800"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>{language === "my" ? `အသုံးပြုနိုင်ဆဲ (${activeCount})` : `Active (${activeCount})`}</span>
              </button>
            </div>
          </div>

          {/* Grid of Promotions */}
          {filteredPromotions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <Tag className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="text-xs">
                {language === "my"
                  ? "ရှာဖွေမှုနှင့် ကိုက်ညီသော Coupon မတွေ့ရှိပါ။"
                  : "No promotions found matching the selected filter."}
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
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
                    className={`bg-slate-900 border rounded-2xl p-4 space-y-3.5 shadow-sm transition-all relative group ${
                      promo.active
                        ? "border-slate-800 hover:border-slate-700"
                        : "border-slate-800/60 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* Top Row: Code, Discount Type Badge, Active Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm tracking-wider text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/25 flex items-center gap-1.5">
                            {promo.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(promo.code)}
                            className="p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                            title="Copy code for POS"
                          >
                            {copiedCode === promo.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <h3 className="font-bold text-xs text-slate-100 line-clamp-1">{promo.title}</h3>
                      </div>

                      {/* Status Toggle & Badge */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => togglePromotionActive(promo.id)}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                            promo.active
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-500/20 hover:text-emerald-300"
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
                          ? "bg-gradient-to-r from-emerald-950/50 to-teal-950/30 border-emerald-800/40 text-emerald-300"
                          : "bg-gradient-to-r from-indigo-950/50 to-purple-950/30 border-indigo-800/40 text-indigo-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            isFixedCash ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
                          }`}
                        >
                          {isFixedCash ? <Banknote className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">
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
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}
                        >
                          {isFixedCash ? "Fixed MMK" : "Percentage"}
                        </span>
                      </div>
                    </div>

                    {/* Requirements & Target Details */}
                    <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/90">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">
                          {language === "my" ? "အနည်းဆုံး ဝယ်ယူမှု:" : "Min Spend:"}
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {promo.minSpend > 0
                            ? formatCurrency(promo.minSpend, currency, language)
                            : language === "my"
                            ? "ကန့်သတ်ချက်မရှိ (0 Ks)"
                            : "No Min Spend"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">
                          {language === "my" ? "ပစ်မှတ် VIP အဆင့်:" : "Target Member:"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-200">
                          {promo.targetTiers && promo.targetTiers.length > 0
                            ? promo.targetTiers.join(", ")
                            : language === "my"
                            ? "ဝယ်ယူသူအားလုံး"
                            : "All Customers"}
                        </span>
                      </div>

                      {/* Usage progress bar */}
                      <div className="pt-1 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{language === "my" ? "အသုံးပြုမှု အကြိမ်ရေ:" : "Redemption Usage:"}</span>
                          <span className="font-mono font-semibold text-slate-300">
                            {promo.usageCount || 0} / {promo.usageLimit || 200}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              usageRatio > 80 ? "bg-rose-500" : isFixedCash ? "bg-emerald-500" : "bg-indigo-500"
                            }`}
                            style={{ width: `${usageRatio}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>
                          {promo.endDate
                            ? `${language === "my" ? "သက်တမ်း:" : "Exp:"} ${promo.endDate}`
                            : "No Expiry"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(promo)}
                          className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo.id, promo.code)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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
                className={`border rounded-2xl p-4 space-y-3.5 bg-slate-900 shadow-sm transition-all hover:scale-[1.01] ${tier.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <h3 className="font-bold text-sm tracking-wider">{tier.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/60 border border-current">
                    {tier.count} Members
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="text-[11px] text-slate-400">
                    {language === "my" ? "အဆင့်ပြည့်ရန် ဝယ်ယူမှု:" : "Required Spend:"}
                  </div>
                  <div className="font-mono font-bold text-slate-100 text-sm">
                    {formatCurrency(tier.minSpend, currency, language)}+
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{tier.discount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              <span>
                {language === "my"
                  ? "Viber / SMS အသင်းဝင် စျေးရောင်းမက်ဆေ့ခ်ျ ပို့ဆောင်ခြင်း"
                  : "Omnichannel Customer Marketing Broadcast"}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === "my"
                ? "VIP အသင်းဝင်များနှင့် ဖောက်သည်များထံသို့ Fixed Cash Coupon သို့မဟုတ် ရာခိုင်နှုန်း လျှော့စျေးများကို တစ်ပြိုင်နက် ပေးပို့ပါ"
                : "Send bulk personalized promotional announcements and coupon vouchers directly to VIP members"}
            </p>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-3.5 text-xs">
            {/* Quick Coupon Selector to auto-populate */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {language === "my" ? "ထည့်သွင်းမည့် Coupon ရွေးချယ်ပါ (Optional)" : "Attach Coupon Code to Blast (Optional)"}
              </label>
              <select
                value={selectedPromoForBlast}
                onChange={(e) => handleSelectPromoForBlast(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
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
                <label className="block text-slate-400 mb-1">
                  {language === "my" ? "လက်ခံမည့် ဖောက်သည်အုပ်စု" : "Target Segment"}
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL_VIP">All VIP Members (Platinum, Gold, Silver)</option>
                  <option value="PLATINUM_ONLY">Platinum VIP High Rollers Only</option>
                  <option value="GOLD_ONLY">Gold VIP Members</option>
                  <option value="INACTIVE_60D">Dormant Customers (No purchase in 60d)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  {language === "my" ? "ဆက်သွယ်ရေးလမ်းကြောင်း" : "Broadcast Channel"}
                </label>
                <select
                  value={campaignChannel}
                  onChange={(e) => setCampaignChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="VIBER_SMS">Viber Business + Fallback SMS</option>
                  <option value="TELEGRAM">Telegram Bot Broadcast</option>
                  <option value="EMAIL">HTML Newsletter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{language === "my" ? "မက်ဆေ့ခ်ျ အကြောင်းအရာ" : "Message Body"}</label>
              <textarea
                rows={4}
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{language === "my" ? "Campaign စတင်ပေးပို့မည်" : "Launch Campaign Broadcast"}</span>
            </button>

            {campaignSent && (
              <div className="text-xs text-emerald-400 text-center font-bold animate-fade-in p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                ✓ Message successfully dispatched to 1,280 VIP subscribers!
              </div>
            )}
          </form>
        </div>
      )}

      {/* Create / Edit Promo Coupon Modal with Fixed Amount and Percentage Support */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl space-y-4 animate-fade-in max-h-[92vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {editingPromoId
                      ? language === "my"
                        ? "Coupon အချက်အလက် ပြင်ဆင်ခြင်း"
                        : "Edit Promo Coupon"
                      : language === "my"
                      ? "Coupon Code အသစ်ဖန်တီးခြင်း"
                      : "Create Promo Discount Coupon"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === "my"
                      ? "ငွေအမောက် တိုက်ရိုက်လျှော့ သို့မဟုတ် ရာခိုင်နှုန်း သတ်မှတ်နိုင်သည်"
                      : "Configure fixed cash amount discount or percentage discount"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPromoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
              {/* Row 1: Code and Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === "my" ? "Coupon Code *" : "Coupon Code *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CASH50K"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 uppercase font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === "my" ? "Campaign Title (အမည်) *" : "Campaign Title *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mega Cash Saver 50,000 MMK"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Discount Type Toggle: Fixed Cash Amount vs Percentage */}
              <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <label className="block text-slate-300 font-semibold">
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
                        ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/60 shadow-xs"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" />
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
                        ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/60 shadow-xs"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <Percent className="w-4 h-4 text-indigo-400" />
                    <span>{language === "my" ? "ရာခိုင်နှုန်း (Percentage %)" : "Percentage (%)"}</span>
                  </button>
                </div>

                {/* Discount Value Input with Quick Preset Chips */}
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-semibold">
                      {formType === "FIXED_AMOUNT" || formType === "HAPPY_HOUR"
                        ? language === "my"
                          ? "လျှော့ပေးမည့် ငွေပမာဏ (MMK / ကျပ်) *"
                          : "Discount Amount (MMK) *"
                        : language === "my"
                        ? "လျှော့ပေးမည့် ရာခိုင်နှုန်း (%) *"
                        : "Discount Percentage (%) *"}
                    </label>
                    <span className="font-mono text-emerald-400 font-bold">
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
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <div className="absolute right-3 top-2 text-xs font-bold text-slate-400 font-mono">
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
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === "my" ? "အနည်းဆုံး ဝယ်ယူရမည့် ပမာဏ (Min Spend)" : "Minimum Spend (MMK)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMinSpend || ""}
                    onChange={(e) => setFormMinSpend(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="0 = ကန့်သတ်ချက်မရှိ"
                  />
                  <div className="flex gap-1 mt-1">
                    {[0, 500000, 1000000, 1500000].map((spend) => (
                      <button
                        key={spend}
                        type="button"
                        onClick={() => setFormMinSpend(spend)}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          formMinSpend === spend ? "bg-slate-700 text-white" : "bg-slate-950 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {spend === 0 ? "No Min" : `${spend / 100000} သိန်း`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === "my" ? "အများဆုံး အသုံးပြုနိုင်သည့် အကြိမ်ရေ" : "Max Usage Limit"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formUsageLimit || ""}
                    onChange={(e) => setFormUsageLimit(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 4: Start Date and End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    {language === "my" ? "စတင်မည့်ရက် (Start Date)" : "Start Date"}
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    {language === "my" ? "သက်တမ်းကုန်ဆုံးမည့်ရက် (End Date)" : "End Date"}
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 5: Target VIP Tier & Branch Restrictions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    {language === "my" ? "အကျုံးဝင်မည့် VIP အဆင့်" : "Target VIP Tier"}
                  </label>
                  <select
                    value={formTargetTier}
                    onChange={(e) => setFormTargetTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">{language === "my" ? "ဝယ်သူအားလုံး (All Customers)" : "All Customers"}</option>
                    <option value="PLATINUM">Platinum VIP Only</option>
                    <option value="GOLD">Gold VIP & Above</option>
                    <option value="SILVER">Silver VIP & Above</option>
                    <option value="BRONZE">Bronze Standard Members</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    {language === "my" ? "အကျုံးဝင်မည့် ဆိုင်ခွဲ" : "Branch Restriction"}
                  </label>
                  <select
                    value={formBranchRestriction}
                    onChange={(e) => setFormBranchRestriction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
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
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="promo-active-checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="promo-active-checkbox" className="text-xs text-slate-300 font-medium cursor-pointer">
                    {language === "my" ? "ယခု ချက်ချင်း အသက်သွင်းမည် (Active)" : "Activate immediately"}
                  </label>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPromoModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                  >
                    {language === "my" ? "မလုပ်တော့ပါ" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-semibold shadow-md transition-all active:scale-95"
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
