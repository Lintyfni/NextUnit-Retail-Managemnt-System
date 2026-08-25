import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, DICTIONARY } from "../../utils/helpers";
import { Promotion } from "../../types";
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
} from "lucide-react";

export const CRMView: React.FC = () => {
  const { promotions, customers, currency, language, addAuditLog } = useApp();
  const t = DICTIONARY[language];

  const [activeTab, setActiveTab] = useState<"PROMOS" | "TIERS" | "CAMPAIGNS">("PROMOS");
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Campaign Blast State
  const [targetAudience, setTargetAudience] = useState("ALL_VIP");
  const [campaignChannel, setCampaignChannel] = useState("VIBER_SMS");
  const [campaignMessage, setCampaignMessage] = useState(
    "OmniChain VIP Special: Get 10% OFF on all Apple & Samsung items this weekend with code WEEKEND10! Show this message at any branch."
  );
  const [campaignSent, setCampaignSent] = useState(false);

  // New Promo State
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    code: "",
    title: "",
    type: "PERCENTAGE",
    discountValue: 10,
    minSpend: 500000,
    validUntil: "2025-12-31",
    active: true,
  });

  const vipTiers = [
    { name: "PLATINUM", minSpend: 10000000, discount: "8% Auto-VIP Discount", pointsRate: "2x Points", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
    { name: "GOLD", minSpend: 5000000, discount: "5% Auto-VIP Discount", pointsRate: "1.5x Points", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    { name: "SILVER", minSpend: 2000000, discount: "2% Auto-VIP Discount", pointsRate: "1.2x Points", color: "text-slate-300 border-slate-500/30 bg-slate-500/10" },
    { name: "BRONZE", minSpend: 0, discount: "Standard Member Pricing", pointsRate: "1x Point / 1,000 MMK", color: "text-orange-300 border-orange-500/30 bg-orange-500/10" },
  ];

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignMessage.trim()) return;
    addAuditLog("MARKETING_CAMPAIGN_BLAST", "CRM", `Dispatched ${campaignChannel} broadcast to ${targetAudience} members.`);
    setCampaignSent(true);
    setTimeout(() => setCampaignSent(false), 3500);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.title) return;
    addAuditLog("CREATE_PROMOTION", "CRM", `Created coupon code ${newPromo.code}`);
    alert(`Promotion ${newPromo.code} created.`);
    setShowPromoModal(false);
  };

  return (
    <div id="crm-promotions-view" className="space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              {language === "my" ? "CRM၊ အသင်းဝင်စနစ်နှင့် အရောင်းမြှင့်တင်ရေး" : "CRM, VIP Loyalty Tiers & Marketing Campaigns"}
            </h1>
            <p className="text-xs text-slate-400">
              Membership Tiers • Dynamic Promo Codes • Viber & SMS Marketing Blasts
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("PROMOS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "PROMOS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Promo Coupons ({promotions.length})
            </button>
            <button
              onClick={() => setActiveTab("TIERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "TIERS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              VIP Tier Rules
            </button>
            <button
              onClick={() => setActiveTab("CAMPAIGNS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "CAMPAIGNS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              SMS / Viber Blast
            </button>
          </div>

          <button
            onClick={() => setShowPromoModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Promo Coupons List */}
      {activeTab === "PROMOS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {promo.code}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-100 mt-1.5">{promo.title}</h3>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    promo.active
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-slate-700 text-slate-400 border-slate-600"
                  }`}
                >
                  {promo.active ? "ACTIVE" : "EXPIRED"}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Discount Value:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {promo.type === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `${formatCurrency(promo.discountValue, currency, language)} OFF`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Spend:</span>
                  <span className="font-mono">{formatCurrency(promo.minSpend, currency, language)}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Valid Until:</span>
                <span className="font-medium text-slate-400">{promo.validUntil}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: VIP Tiers */}
      {activeTab === "TIERS" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vipTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`border rounded-2xl p-4 space-y-3 bg-slate-900 shadow-sm ${tier.color}`}
            >
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <h3 className="font-bold text-sm tracking-wider">{tier.name}</h3>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="text-[11px] text-slate-400">Required Spend:</div>
                <div className="font-mono font-bold text-slate-100">
                  {formatCurrency(tier.minSpend, currency, language)}+
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-300">
                <div>• {tier.discount}</div>
                <div>• {tier.pointsRate}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Marketing Broadcast Campaign */}
      {activeTab === "CAMPAIGNS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              <span>Omnichannel Customer Marketing Broadcast</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Send bulk personalized promotional announcements to VIP members
            </p>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Target Segment</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL_VIP">All VIP Members (Platinum, Gold, Silver)</option>
                  <option value="PLATINUM_ONLY">Platinum VIP High Rollers Only</option>
                  <option value="INACTIVE_60D">Dormant Customers (No purchase in 60d)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Broadcast Channel</label>
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
              <label className="block text-slate-400 mb-1">Message Body</label>
              <textarea
                rows={4}
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Launch Campaign Broadcast</span>
            </button>

            {campaignSent && (
              <div className="text-xs text-emerald-400 text-center font-bold animate-fade-in">
                ✓ Message successfully delivered to 1,280 VIP subscribers!
              </div>
            )}
          </form>
        </div>
      )}

      {/* New Promo Coupon Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Create Promo Discount Coupon</h3>
              <button onClick={() => setShowPromoModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Coupon Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. THINGYAN20"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 uppercase font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thingyan Water Festival Mega Sale"
                  value={newPromo.title}
                  onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Discount Type</label>
                  <select
                    value={newPromo.type}
                    onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed MMK Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Discount Value</label>
                  <input
                    type="number"
                    min={1}
                    value={newPromo.discountValue}
                    onChange={(e) => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
