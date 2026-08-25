import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, DICTIONARY } from "../../utils/helpers";
import { Product, StockTransfer } from "../../types";
import {
  Package,
  ArrowLeftRight,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Plus,
  Search,
  Building,
  X,
} from "lucide-react";

export const InventoryView: React.FC = () => {
  const {
    products,
    branches,
    transfers,
    createTransfer,
    updateTransferStatus,
    adjustStock,
    currency,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"MATRIX" | "TRANSFERS">("MATRIX");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);

  // Transfer form state
  const [fromBranchId, setFromBranchId] = useState(branches[3]?.id || branches[0]?.id);
  const [toBranchId, setToBranchId] = useState(branches[1]?.id || branches[0]?.id);
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || "");
  const [transferQty, setTransferQty] = useState(5);
  const [transferNote, setTransferNote] = useState("Restocking retail showroom floor");

  // Stock Adjust form state
  const [adjustBranchId, setAdjustBranchId] = useState(branches[0]?.id || "");
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState("Physical Cycle Count Discrepancy");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === transferProductId);
    const fromB = branches.find((b) => b.id === fromBranchId);
    const toB = branches.find((b) => b.id === toBranchId);

    if (!prod || !fromB || !toB || fromB.id === toB.id) {
      alert("Please choose distinct source and destination branches.");
      return;
    }

    createTransfer({
      fromBranchId: fromB.id,
      fromBranchName: fromB.name,
      toBranchId: toB.id,
      toBranchName: toB.name,
      items: [{ productId: prod.id, productName: prod.name, quantity: transferQty }],
      notes: transferNote,
    });

    setShowTransferModal(false);
    alert("Inter-branch stock transfer created in PENDING status.");
  };

  const handleExecuteAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;

    adjustStock(selectedProductForAdjust.id, adjustBranchId, adjustQty, adjustReason);
    setShowAdjustModal(false);
    setSelectedProductForAdjust(null);
    alert("Stock count adjusted and logged into security audit ledger.");
  };

  return (
    <div id="inventory-transfers-view" className="space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              {language === "my" ? "ပစ္စည်းလက်ကျန်နှင့် ဆိုင်ခွဲအချင်းချင်း လွှဲပြောင်းမှု" : "Inventory & Inter-Branch Stock Transfers"}
            </h1>
            <p className="text-xs text-slate-400">
              Multi-Location Stock Matrix • Reorder Buffers • Transit Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("MATRIX")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "MATRIX" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Stock Matrix ({products.length} SKUs)
            </button>
            <button
              onClick={() => setActiveTab("TRANSFERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "TRANSFERS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Transfers ({transfers.length})
            </button>
          </div>

          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{language === "my" ? "ပစ္စည်းလွှဲပြောင်းမည်" : "New Transfer"}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Stock Matrix Across All Branches */}
      {activeTab === "MATRIX" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search inventory by SKU, product name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Product / SKU</th>
                    <th className="px-4 py-3">Category</th>
                    {branches.map((b) => (
                      <th key={b.id} className="px-4 py-3 text-center">
                        {b.name.split(" ")[0]}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center">Total Stock</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3 text-right">Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredProducts.map((p) => {
                    const totalQty = Object.values(p.branchStock).reduce((a: number, b: number) => a + Number(b), 0);
                    const isLow = Object.values(p.branchStock).some((q) => Number(q) <= p.reorderLevel);

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-8 h-8 rounded-lg object-cover bg-slate-950 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-100">{p.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{p.category}</td>
                        {branches.map((b) => {
                          const stock = p.branchStock[b.id] || 0;
                          return (
                            <td key={b.id} className="px-4 py-3 text-center">
                              <span
                                className={`font-mono px-2 py-0.5 rounded text-xs ${
                                  stock <= p.reorderLevel
                                    ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                                    : "text-slate-200"
                                }`}
                              >
                                {stock}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-100">
                          {totalQty}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                          {formatCurrency(p.sellingPrice, currency, language)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedProductForAdjust(p);
                              setAdjustQty(p.branchStock[branches[0].id] || 0);
                              setShowAdjustModal(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition-colors"
                            title="Adjust Cycle Count"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Stock Transfers Workflow */}
      {activeTab === "TRANSFERS" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transfers.map((tf) => (
              <div key={tf.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="font-mono font-bold text-sm text-slate-100">{tf.transferNumber}</div>
                    <div className="flex items-center space-x-2 text-xs text-slate-300 mt-1">
                      <span>{tf.fromBranchName}</span>
                      <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{tf.toBranchName}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tf.status === "RECEIVED"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : tf.status === "IN_TRANSIT"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {tf.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-300">Items in Transfer:</div>
                  {tf.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]"
                    >
                      <span>{it.productName}</span>
                      <span className="font-mono font-bold text-indigo-300">Qty: {it.quantity}</span>
                    </div>
                  ))}
                  {tf.notes && <p className="text-[11px] text-slate-400 italic pt-1">"{tf.notes}"</p>}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-slate-500">Initiator: {tf.requestedBy}</span>
                  <div className="flex space-x-1.5">
                    {tf.status === "PENDING" && (
                      <button
                        onClick={() => updateTransferStatus(tf.id, "IN_TRANSIT")}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center space-x-1"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Dispatch</span>
                      </button>
                    )}
                    {tf.status === "IN_TRANSIT" && (
                      <button
                        onClick={() => updateTransferStatus(tf.id, "RECEIVED")}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Receive & Restock</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Inter-Branch Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Initiate Inter-Branch Transfer</h3>
              <button onClick={() => setShowTransferModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Source (From)</label>
                  <select
                    value={fromBranchId}
                    onChange={(e) => setFromBranchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Destination (To)</label>
                  <select
                    value={toBranchId}
                    onChange={(e) => setToBranchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Select Product</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reason / Manifest Notes</label>
                <textarea
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Dispatch Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedProductForAdjust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Cycle Count Stock Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjust} className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Product:</span>
                <p className="font-bold text-slate-200 text-sm mt-0.5">{selectedProductForAdjust.name}</p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Branch Location</label>
                <select
                  value={adjustBranchId}
                  onChange={(e) => {
                    setAdjustBranchId(e.target.value);
                    setAdjustQty(selectedProductForAdjust.branchStock[e.target.value] || 0);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Current: {selectedProductForAdjust.branchStock[b.id] || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">New Verified Physical Count</label>
                <input
                  type="number"
                  min={0}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Adjustment Audit Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Physical Cycle Count Discrepancy">Physical Cycle Count Discrepancy</option>
                  <option value="Damaged / In-Store Breakage">Damaged / In-Store Breakage</option>
                  <option value="Showroom Display Demo Write-off">Showroom Display Demo Write-off</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
