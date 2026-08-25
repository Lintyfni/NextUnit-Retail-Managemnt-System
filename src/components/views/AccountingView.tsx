import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate, DICTIONARY } from "../../utils/helpers";
import { Account, FinancialVoucher } from "../../types";
import {
  Calculator,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  DollarSign,
  PieChart,
  CheckCircle2,
  X,
  Building,
} from "lucide-react";

export const AccountingView: React.FC = () => {
  const { chartOfAccounts, vouchers, currency, language, createVoucher, branches } = useApp();
  const t = DICTIONARY[language];

  const [activeTab, setActiveTab] = useState<"COA" | "VOUCHERS" | "PL">("VOUCHERS");
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // New Voucher State
  const [newVoucher, setNewVoucher] = useState<{
    type: "CPV" | "CRV" | "BPV" | "BRV" | "JV";
    debitAccount: string;
    creditAccount: string;
    amount: number;
    description: string;
  }>({
    type: "CPV",
    debitAccount: "5000", // Store Rent
    creditAccount: "1000", // Cash on Hand
    amount: 1500000,
    description: "Monthly retail store rental expense payment",
  });

  const totalAssets = chartOfAccounts
    .filter((a) => a.category === "ASSET")
    .reduce((acc, a) => acc + a.balance, 0);

  const totalRevenue = chartOfAccounts
    .filter((a) => a.category === "REVENUE")
    .reduce((acc, a) => acc + a.balance, 0);

  const totalExpenses = chartOfAccounts
    .filter((a) => a.category === "EXPENSE")
    .reduce((acc, a) => acc + a.balance, 0);

  const netOperatingProfit = totalRevenue - totalExpenses;

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucher.amount || !newVoucher.description) return;

    createVoucher({
      type: newVoucher.type,
      branchId: branches[0].id,
      branchName: branches[0].name,
      amount: Number(newVoucher.amount),
      currency: "MMK",
      debitAccountId: newVoucher.debitAccount,
      creditAccountId: newVoucher.creditAccount,
      description: newVoucher.description,
    });

    setShowVoucherModal(false);
    alert("Financial voucher posted and ledger updated.");
  };

  return (
    <div id="accounting-finance-view" className="space-y-5 animate-fade-in">
      {/* Top Header & Financial KPI Summary */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              {language === "my" ? "ငွေစာရင်း၊ ဘောက်ချာများနှင့် ဘဏ္ဍာရေး အစီရင်ခံစာ" : "Enterprise Accounting, Vouchers & Real-time P&L"}
            </h1>
            <p className="text-xs text-slate-400">
              Double-Entry General Ledger • Cash Flow • CPV / CRV / Journal Entries
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("VOUCHERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "VOUCHERS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Vouchers ({vouchers.length})
            </button>
            <button
              onClick={() => setActiveTab("COA")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "COA" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Chart of Accounts
            </button>
            <button
              onClick={() => setActiveTab("PL")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "PL" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              P&L Income Statement
            </button>
          </div>

          <button
            onClick={() => setShowVoucherModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Post Voucher</span>
          </button>
        </div>
      </div>

      {/* 3 Executive Finance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Total Liquid Assets & Bank</span>
          <div className="text-lg font-bold text-slate-100 font-mono mt-1">
            {formatCurrency(totalAssets, currency, language)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Cash In Hand + KBZ Bank + AYA Bank</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Operating Expenses (MTD)</span>
          <div className="text-lg font-bold text-rose-400 font-mono mt-1">
            {formatCurrency(totalExpenses, currency, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Rent, Utilities, Wages, Commercial Tax</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Net Operating Profit</span>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
            {formatCurrency(netOperatingProfit, currency, language)}
          </div>
          <div className="text-[11px] text-emerald-300 mt-1">Real-time Margin: +24.8%</div>
        </div>
      </div>

      {/* Tab 1: Vouchers Table */}
      {activeTab === "VOUCHERS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-100">{v.voucherNumber}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {v.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{v.branchName}</td>
                    <td className="px-4 py-3 text-slate-200">{v.description}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      Dr: {v.debitAccountId} / Cr: {v.creditAccountId}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      {formatCurrency(v.amount, currency, language)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
            <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-indigo-400">{acc.code}</span>
                    <span className="font-bold text-xs text-slate-100">{acc.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{acc.nameMy}</p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    acc.category === "ASSET"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : acc.category === "LIABILITY"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : acc.category === "REVENUE"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  }`}
                >
                  {acc.category}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">General Ledger Balance:</span>
                <span className="font-bold text-slate-100">{formatCurrency(acc.balance, currency, language)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Profit & Loss Income Statement */}
      {activeTab === "PL" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 max-w-2xl mx-auto">
          <div className="text-center space-y-1 border-b border-slate-800 pb-3">
            <h2 className="font-bold text-base text-slate-100">OMNICHAIN RETAIL ENTERPRISE</h2>
            <p className="text-xs text-slate-400">Statement of Profit & Loss (Consolidated Multi-Store)</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Revenue */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-200 uppercase text-[11px] flex justify-between">
                <span>Operating Revenue</span>
                <span>{formatCurrency(totalRevenue, currency, language)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-4">
                <span>4000 - Retail Merchandising Sales</span>
                <span>{formatCurrency(totalRevenue, currency, language)}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="font-bold text-rose-300 uppercase text-[11px] flex justify-between">
                <span>Operating & Administrative Expenses</span>
                <span>-{formatCurrency(totalExpenses, currency, language)}</span>
              </div>
              {chartOfAccounts
                .filter((a) => a.category === "EXPENSE")
                .map((exp) => (
                  <div key={exp.id} className="flex justify-between text-slate-400 pl-4">
                    <span>
                      {exp.code} - {exp.name}
                    </span>
                    <span>-{formatCurrency(exp.balance, currency, language)}</span>
                  </div>
                ))}
            </div>

            {/* Net Income */}
            <div className="pt-3 border-t-2 border-slate-700 flex justify-between text-sm font-bold text-slate-100 bg-slate-950/80 p-3 rounded-xl">
              <span className="text-emerald-400">Net Operating Income:</span>
              <span className="text-emerald-400 font-mono">
                {formatCurrency(netOperatingProfit, currency, language)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Post Financial Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Post Financial Voucher</h3>
              <button onClick={() => setShowVoucherModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Voucher Type</label>
                <select
                  value={newVoucher.type}
                  onChange={(e) => setNewVoucher({ ...newVoucher, type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
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
                  <label className="block text-slate-400 mb-1">Debit Account</label>
                  <select
                    value={newVoucher.debitAccount}
                    onChange={(e) => setNewVoucher({ ...newVoucher, debitAccount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    {chartOfAccounts.map((a) => (
                      <option key={a.id} value={a.code}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Credit Account</label>
                  <select
                    value={newVoucher.creditAccount}
                    onChange={(e) => setNewVoucher({ ...newVoucher, creditAccount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
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
                <label className="block text-slate-400 mb-1">Amount (MMK)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newVoucher.amount}
                  onChange={(e) => setNewVoucher({ ...newVoucher, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description / Memo</label>
                <textarea
                  required
                  rows={2}
                  value={newVoucher.description}
                  onChange={(e) => setNewVoucher({ ...newVoucher, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
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
