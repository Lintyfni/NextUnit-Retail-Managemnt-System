import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { FinancialVoucher } from "../../types";
import { Calculator, Plus, X } from "lucide-react";

export const AccountingView: React.FC = () => {
  const { vouchers, chartOfAccounts, branches, currency, language, createVoucher } = useApp();

  const [activeTab, setActiveTab] = useState<"VOUCHERS" | "COA" | "PL">("VOUCHERS");
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // New Voucher Form
  const [newVoucher, setNewVoucher] = useState({
    type: "CPV" as FinancialVoucher["type"],
    debitAccount: "5000",
    creditAccount: "1010",
    amount: 150000,
    description: "",
  });

  const totalAssets = chartOfAccounts
    .filter((a) => a.category === "ASSET")
    .reduce((acc, a) => acc + a.balance, 0);

  const totalExpenses = chartOfAccounts
    .filter((a) => a.category === "EXPENSE")
    .reduce((acc, a) => acc + a.balance, 0);

  const totalRevenue = chartOfAccounts
    .filter((a) => a.category === "REVENUE")
    .reduce((acc, a) => acc + a.balance, 0);

  const netOperatingProfit = totalRevenue - totalExpenses;

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucher.amount || !newVoucher.description) return;

    createVoucher({
      type: newVoucher.type,
      branchId: branches[0]?.id || "BRANCH-001",
      branchName: branches[0]?.name || "Main Branch",
      amount: Number(newVoucher.amount),
      currency: "MMK",
      debitAccountId: newVoucher.debitAccount,
      creditAccountId: newVoucher.creditAccount,
      description: newVoucher.description,
    });

    setShowVoucherModal(false);
  };

  return (
    <div id="accounting-finance-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header & Financial KPI Summary */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {language === "my" ? "ငွေစာရင်း၊ ဘောက်ချာများနှင့် ဘဏ္ဍာရေး အစီရင်ခံစာ" : "Enterprise Accounting, Vouchers & Real-time P&L"}
            </h1>
            <p className="text-xs text-slate-500">
              Double-Entry General Ledger • Cash Flow • CPV / CRV / Journal Entries
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("VOUCHERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "VOUCHERS" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Vouchers ({vouchers.length})
            </button>
            <button
              onClick={() => setActiveTab("COA")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "COA" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Chart of Accounts
            </button>
            <button
              onClick={() => setActiveTab("PL")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "PL" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              P&L Income Statement
            </button>
          </div>

          <button
            onClick={() => setShowVoucherModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Post Voucher</span>
          </button>
        </div>
      </div>

      {/* 3 Executive Finance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Liquid Assets & Bank</span>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(totalAssets, currency, language)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Cash In Hand + KBZ Bank + AYA Bank</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Operating Expenses (MTD)</span>
          <div className="text-lg font-bold text-rose-600 font-mono mt-1">
            {formatCurrency(totalExpenses, currency, language)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Rent, Utilities, Wages, Commercial Tax</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Net Operating Profit</span>
          <div className="text-lg font-bold text-emerald-700 font-mono mt-1">
            {formatCurrency(netOperatingProfit, currency, language)}
          </div>
          <div className="text-[11px] text-emerald-800 font-medium mt-1">Real-time Margin: +24.8%</div>
        </div>
      </div>

      {/* Tab 1: Vouchers Table */}
      {activeTab === "VOUCHERS" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-4 py-3">Voucher No</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Debit / Credit</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{v.voucherNumber}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {v.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{v.branchName}</td>
                    <td className="px-4 py-3 text-slate-900">{v.description}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      Dr: {v.debitAccountId} / Cr: {v.creditAccountId}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      {formatCurrency(v.amount, currency, language)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Chart of Accounts (COA) */}
      {activeTab === "COA" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chartOfAccounts.map((acc) => (
            <div key={acc.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{acc.code}</span>
                    <span className="font-bold text-xs text-slate-900">{acc.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{acc.nameMy}</p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    acc.category === "ASSET"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : acc.category === "LIABILITY"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : acc.category === "REVENUE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {acc.category}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">General Ledger Balance:</span>
                <span className="font-bold text-slate-900">{formatCurrency(acc.balance, currency, language)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Profit & Loss Income Statement */}
      {activeTab === "PL" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 max-w-2xl mx-auto">
          <div className="text-center space-y-1 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-slate-900">NEXTUNIT TECH RETAIL ENTERPRISE</h2>
            <p className="text-xs text-slate-500">Statement of Profit & Loss (Consolidated Multi-Store)</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Revenue */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-800 uppercase text-[11px] flex justify-between">
                <span>Operating Revenue</span>
                <span>{formatCurrency(totalRevenue, currency, language)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pl-4">
                <span>4000 - Retail Merchandising Sales</span>
                <span>{formatCurrency(totalRevenue, currency, language)}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="font-bold text-rose-700 uppercase text-[11px] flex justify-between">
                <span>Operating & Administrative Expenses</span>
                <span>-{formatCurrency(totalExpenses, currency, language)}</span>
              </div>
              {chartOfAccounts
                .filter((a) => a.category === "EXPENSE")
                .map((exp) => (
                  <div key={exp.id} className="flex justify-between text-slate-600 pl-4">
                    <span>
                      {exp.code} - {exp.name}
                    </span>
                    <span>-{formatCurrency(exp.balance, currency, language)}</span>
                  </div>
                ))}
            </div>

            {/* Net Income */}
            <div className="pt-3 border-t-2 border-slate-200 flex justify-between text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-xl">
              <span className="text-emerald-800">Net Operating Income:</span>
              <span className="text-emerald-800 font-mono">
                {formatCurrency(netOperatingProfit, currency, language)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Post Financial Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Post Financial Voucher</h3>
              <button onClick={() => setShowVoucherModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Voucher Type</label>
                <select
                  value={newVoucher.type}
                  onChange={(e) => setNewVoucher({ ...newVoucher, type: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="CPV">CPV - Cash Payment Voucher</option>
                  <option value="CRV">CRV - Cash Receipt Voucher</option>
                  <option value="BPV">BPV - Bank Payment Voucher</option>
                  <option value="BRV">BRV - Bank Receipt Voucher</option>
                  <option value="JV">JV - Journal Voucher</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Debit Account</label>
                  <select
                    value={newVoucher.debitAccount}
                    onChange={(e) => setNewVoucher({ ...newVoucher, debitAccount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {chartOfAccounts.map((a) => (
                      <option key={a.id} value={a.code}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Credit Account</label>
                  <select
                    value={newVoucher.creditAccount}
                    onChange={(e) => setNewVoucher({ ...newVoucher, creditAccount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {chartOfAccounts.map((a) => (
                      <option key={a.id} value={a.code}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Amount (MMK)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newVoucher.amount}
                  onChange={(e) => setNewVoucher({ ...newVoucher, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Description / Memo</label>
                <textarea
                  required
                  rows={2}
                  value={newVoucher.description}
                  onChange={(e) => setNewVoucher({ ...newVoucher, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 resize-none font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs transition-all hover:scale-[1.02]"
                >
                  Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
