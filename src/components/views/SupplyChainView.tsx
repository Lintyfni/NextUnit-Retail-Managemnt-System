import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Boxes,
} from "lucide-react";

export const SupplyChainView: React.FC = () => {
  const { suppliers, products, language } = useApp();

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
    <div id="supply-chain-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {language === "my" ? "ထောက်ပံ့ပို့ဆောင်ရေး ကွင်းဆက်နှင့် စတော့ခန့်မှန်းချက် (SCM)" : "Supply Chain Management, Lead Times & Safety Stock"}
            </h1>
            <p className="text-xs text-slate-500">
              Replenishment Velocity • Days of Cover • Vendor Disruption Risk Radar
            </p>
          </div>
        </div>
      </div>

      {/* SCM KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Global Average Lead Time</span>
          <div className="text-xl font-bold text-slate-900 mt-1">7.3 Business Days</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Vendor Port to Warehouse Arrival</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Overall Supplier OTIF Rate</span>
          <div className="text-xl font-bold text-emerald-700 mt-1">94.8% (On-Time In-Full)</div>
          <div className="text-[11px] text-slate-500 mt-1">Fulfillment compliance across 3 suppliers</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Stockout Risk SKUs</span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {criticalReorderItems.filter((i) => i.stockoutRisk === "HIGH").length} Critical SKUs
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Days of cover less than supplier lead time</div>
        </div>
      </div>

      {/* Reorder Matrix & Days of Cover Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Safety Stock & Lead Time Replenishment Calculator
          </h2>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
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
            <tbody className="divide-y divide-slate-100 font-medium">
              {criticalReorderItems.map((item) => (
                <tr key={item.product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{item.product.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.product.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.supplier?.name} ({item.supplier?.leadTimeDays}d lead)
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                    {item.totalStock} units
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-500">
                    ~{item.avgDailyVelocity} / day
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        item.daysOfCover < 10
                          ? "bg-rose-50 text-rose-700 border border-rose-200 font-bold"
                          : item.daysOfCover < 20
                          ? "bg-amber-50 text-amber-700 border border-amber-200 font-bold"
                          : "text-emerald-700 font-bold"
                      }`}
                    >
                      {item.daysOfCover} Days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-700 font-bold">
                    {item.safetyStockRecommended} units
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.stockoutRisk === "HIGH"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : item.stockoutRisk === "MEDIUM"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
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
