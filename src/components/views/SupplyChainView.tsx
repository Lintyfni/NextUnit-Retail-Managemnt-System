import React from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, DICTIONARY } from "../../utils/helpers";
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Globe2,
  Building,
} from "lucide-react";

export const SupplyChainView: React.FC = () => {
  const { suppliers, products, language, currency } = useApp();
  const t = DICTIONARY[language];

  // Supply Chain Calculations
  const criticalReorderItems = products.map((p) => {
    const totalStock = (Object.values(p.branchStock) as number[]).reduce((a, b) => a + Number(b), 0);
    const avgDailyVelocity = Math.max(1, Math.round(p.reorderLevel / 4));
    const daysOfCover = Math.round(totalStock / avgDailyVelocity);
    const supplier = suppliers.find((s) => s.id === p.supplierId) || suppliers[0];
    const leadTime: number = supplier?.leadTimeAvgDays || 7;
    const safetyStockRecommended: number = Math.round(avgDailyVelocity * leadTime * 1.3);

    return {
      product: p,
      totalStock,
      avgDailyVelocity,
      daysOfCover,
      supplier,
      safetyStockRecommended,
      stockoutRisk: daysOfCover < leadTime ? "HIGH" : daysOfCover < 14 ? "MEDIUM" : "LOW",
    };
  });

  return (
    <div id="supply-chain-view" className="space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              {language === "my" ? "ထောက်ပံ့ပို့ဆောင်ရေး ကွင်းဆက်နှင့် စတော့ခန့်မှန်းချက် (SCM)" : "Supply Chain Management, Lead Times & Safety Stock"}
            </h1>
            <p className="text-xs text-slate-400">
              Replenishment Velocity • Days of Cover • Vendor Disruption Risk Radar
            </p>
          </div>
        </div>
      </div>

      {/* SCM KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Global Average Lead Time</span>
          <div className="text-xl font-bold text-slate-100 mt-1">7.3 Business Days</div>
          <div className="text-[11px] text-emerald-400 mt-1">Vendor Port to Warehouse Arrival</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Overall Supplier OTIF Rate</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">94.8% (On-Time In-Full)</div>
          <div className="text-[11px] text-slate-400 mt-1">Fulfillment compliance across 3 suppliers</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Stockout Risk SKUs</span>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {criticalReorderItems.filter((i) => i.stockoutRisk === "HIGH").length} Critical SKUs
          </div>
          <div className="text-[11px] text-amber-300 mt-1">Days of cover less than supplier lead time</div>
        </div>
      </div>

      {/* Reorder Matrix & Days of Cover Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Safety Stock & Lead Time Replenishment Calculator
          </h2>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Product / SKU</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-center">Current Total Stock</th>
                <th className="px-4 py-3 text-center">Daily Burn Rate</th>
                <th className="px-4 py-3 text-center">Days of Cover</th>
                <th className="px-4 py-3 text-center">Recommended Buffer</th>
                <th className="px-4 py-3">Stockout Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {criticalReorderItems.map((item) => (
                <tr key={item.product.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-100">{item.product.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.product.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {item.supplier?.name} ({item.supplier?.leadTimeDays}d lead)
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-200">
                    {item.totalStock} units
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-400">
                    ~{item.avgDailyVelocity} / day
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        item.daysOfCover < 10
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : item.daysOfCover < 20
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "text-emerald-400"
                      }`}
                    >
                      {item.daysOfCover} Days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-indigo-300 font-bold">
                    {item.safetyStockRecommended} units
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.stockoutRisk === "HIGH"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : item.stockoutRisk === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {item.stockoutRisk} RISK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
