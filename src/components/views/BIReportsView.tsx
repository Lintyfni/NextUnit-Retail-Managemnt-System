import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate, DICTIONARY } from "../../utils/helpers";
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Layers,
  Building,
} from "lucide-react";

export const BIReportsView: React.FC = () => {
  const { orders, products, branches, currency, language } = useApp();
  const t = DICTIONARY[language];

  const [reportRange, setReportRange] = useState("TODAY");

  // Top Selling Products Calculation
  const topSellers = products.slice(0, 4).map((p, idx) => ({
    name: p.name,
    category: p.category,
    unitsSold: [38, 29, 24, 19][idx] || 10,
    revenue: p.sellingPrice * ([38, 29, 24, 19][idx] || 10),
  }));

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["OrderNumber,Branch,Total,Status,Date"].join(",") +
      "\n" +
      orders
        .map((o) => `${o.orderNumber},${o.branchName},${o.grandTotal},${o.status},${o.createdAt}`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OmniChain_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="bi-reports-view" className="space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              {language === "my" ? "အစီရင်ခံစာများ၊ အရောင်းဒေတာနှင့် BI စနစ်" : "Business Intelligence, Sales Analytics & BI Reports"}
            </h1>
            <p className="text-xs text-slate-400">
              Sales Velocity • Margin Analysis • Multi-Branch Product Performance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODAY">Today's Transactions</option>
            <option value="THIS_WEEK">This Week (MTD)</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="THIS_YEAR">Full Fiscal Year 2025</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Sellers & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 4 Selling Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Top Performing SKUs by Revenue
          </h2>

          <div className="space-y-3">
            {topSellers.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-100">{item.name}</div>
                  <div className="text-[10px] text-slate-400">{item.category} • {item.unitsSold} units sold</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400 text-xs">
                    {formatCurrency(item.revenue, currency, language)}
                  </div>
                  <span className="text-[10px] text-indigo-400 font-medium">Rank #{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Category Contribution to Gross Margin
          </h2>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Smartphones & Flagship Devices</span>
                <span className="font-mono font-bold text-slate-100">54% (32.4M MMK)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "54%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Laptops & Computing</span>
                <span className="font-mono font-bold text-slate-100">28% (16.8M MMK)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: "28%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Audio & Accessories (High Margin 45%)</span>
                <span className="font-mono font-bold text-slate-100">18% (10.8M MMK)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "18%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
