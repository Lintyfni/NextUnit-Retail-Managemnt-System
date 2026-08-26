import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { PurchaseOrder } from "../../types";
import {
  Receipt,
  Plus,
  CheckCircle2,
  X,
} from "lucide-react";

export const PurchasingView: React.FC = () => {
  const {
    purchaseOrders,
    goodsReceivedNotes,
    suppliers,
    products,
    branches,
    currency,
    language,
    createPurchaseOrder,
    createGRN,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"PO" | "GRN">("PO");
  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [showInspectGRNModal, setShowInspectGRNModal] = useState(false);
  const [selectedPOForGRN, setSelectedPOForGRN] = useState<PurchaseOrder | null>(null);

  // New PO form state
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || "");
  const [destBranchId, setDestBranchId] = useState(branches[3]?.id || branches[0]?.id); // Default warehouse
  const [poLines, setPoLines] = useState<{ productId: string; quantity: number; unitCost: number }[]>([
    { productId: products[0]?.id || "", quantity: 10, unitCost: Number(products[0]?.costPrice) || 4000000 },
  ]);

  // GRN form inspection state
  const [grnItemsState, setGrnItemsState] = useState<
    { productId: string; expectedQty: number; acceptedQty: number; rejectedQty: number; imeis: string }[]
  >([]);

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    const dest = branches.find((b) => b.id === destBranchId);
    if (!sup || !dest) return;

    const items = poLines.map((line) => {
      const prod = products.find((p) => p.id === line.productId);
      return {
        productId: line.productId,
        productName: prod?.name || "Product",
        sku: prod?.sku || "SKU",
        quantity: line.quantity,
        unitCost: line.unitCost,
        totalCost: line.quantity * line.unitCost,
        receivedQty: 0,
      };
    });

    const totalAmount = items.reduce((acc, i) => acc + i.totalCost, 0);

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      destinationBranchId: dest.id,
      destinationBranchName: dest.name,
      items,
      totalAmount,
      paymentTerms: sup.paymentTerms,
      expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    });

    setShowNewPOModal(false);
  };

  const handleOpenGRNModal = (po: PurchaseOrder) => {
    setSelectedPOForGRN(po);
    setGrnItemsState(
      po.items.map((i) => ({
        productId: i.productId,
        expectedQty: i.quantity,
        acceptedQty: i.quantity,
        rejectedQty: 0,
        imeis: `IMEI-${Math.floor(100000000 + Math.random() * 900000000)}`,
      }))
    );
    setShowInspectGRNModal(true);
  };

  const handleFinishGRN = () => {
    if (!selectedPOForGRN) return;
    const dest = branches.find((b) => b.id === selectedPOForGRN.destinationBranchId) || branches[0];

    const grnItems = grnItemsState.map((state) => {
      const poItem = selectedPOForGRN.items.find((i) => i.productId === state.productId);
      return {
        productId: state.productId,
        productName: poItem?.productName || "",
        expectedQty: state.expectedQty,
        acceptedQty: state.acceptedQty,
        rejectedQty: state.rejectedQty,
        assignedIMEIs: state.imeis ? state.imeis.split(",").map((s) => s.trim()) : undefined,
      };
    });

    createGRN({
      poNumber: selectedPOForGRN.poNumber,
      supplierName: selectedPOForGRN.supplierName,
      branchId: dest.id,
      branchName: dest.name,
      receivedDate: new Date().toISOString(),
      receivedBy: "Warehouse Receiving Team",
      items: grnItems,
      inspectionStatus: grnItems.some((i) => i.rejectedQty > 0) ? "PASSED_WITH_DISCREPANCY" : "PASSED",
      remarks: "Goods verified against packing slip and warehouse barcode scan.",
    });

    setShowInspectGRNModal(false);
    setSelectedPOForGRN(null);
  };

  return (
    <div id="purchasing-grn-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header & Tab Controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {language === "my" ? "ဝယ်ယူမှု (PO) နှင့် ကုန်လက်ခံလွှာ (GRN)" : "Procurement, Purchase Orders & GRN Inspection"}
            </h1>
            <p className="text-xs text-slate-500">
              3-Way Matching • Vendor Invoices • Serial Number Registration
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("PO")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "PO" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Purchase Orders ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("GRN")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "GRN" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              GRN Inspection ({goodsReceivedNotes.length})
            </button>
          </div>

          <button
            onClick={() => setShowNewPOModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{language === "my" ? "PO အသစ်ဖွင့်မည်" : "Create PO"}</span>
          </button>
        </div>
      </div>

      {/* PO Tab Content */}
      {activeTab === "PO" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">PO Number</th>
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3 font-semibold">Destination</th>
                  <th className="px-4 py-3 font-semibold">Items / Lines</th>
                  <th className="px-4 py-3 font-semibold">Total Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{po.poNumber}</td>
                    <td className="px-4 py-3 text-slate-900 font-semibold">{po.supplierName}</td>
                    <td className="px-4 py-3 text-slate-600">{po.destinationBranchName}</td>
                    <td className="px-4 py-3 text-slate-600">{po.items.length} Product Lines</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      {formatCurrency(po.totalAmount, currency, language)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          po.status === "GRN_COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : po.status === "DISPATCHED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {po.status !== "GRN_COMPLETED" ? (
                        <button
                          onClick={() => handleOpenGRNModal(po)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          Receive GRN
                        </button>
                      ) : (
                        <span className="flex items-center justify-end space-x-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Matched (3-Way)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRN Tab Content */}
      {activeTab === "GRN" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goodsReceivedNotes.map((grn) => (
              <div key={grn.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{grn.grnNumber}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        PO: {grn.poNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Supplier: {grn.supplierName}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {grn.inspectionStatus}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800">Inspected Items:</div>
                  {grn.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-[11px]"
                    >
                      <span className="text-slate-800 font-medium">{item.productName}</span>
                      <span className="font-mono font-bold text-emerald-700">
                        Accepted: {item.acceptedQty} / {item.expectedQty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Inspector: {grn.receivedBy}</span>
                  <span>{formatDate(grn.receivedDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Purchase Order Modal */}
      {showNewPOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Create New Purchase Order (PO)</h3>
              <button onClick={() => setShowNewPOModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Select Supplier</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Destination Branch</label>
                  <select
                    value={destBranchId}
                    onChange={(e) => setDestBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
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
                <label className="block text-slate-600 mb-1 font-medium">Product Item</label>
                <select
                  value={poLines[0].productId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    setPoLines([
                      {
                        productId: e.target.value,
                        quantity: poLines[0].quantity,
                        unitCost: Number(prod?.costPrice) || 100000,
                      },
                    ]);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Order Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={poLines[0].quantity}
                    onChange={(e) =>
                      setPoLines([
                        {
                          ...poLines[0],
                          quantity: Number(e.target.value),
                        },
                      ])
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Unit Cost (MMK)</label>
                  <input
                    type="number"
                    value={poLines[0].unitCost}
                    onChange={(e) =>
                      setPoLines([
                        {
                          ...poLines[0],
                          unitCost: Number(e.target.value),
                        },
                      ])
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-600 font-medium">Total PO Value:</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {formatCurrency(poLines[0].quantity * poLines[0].unitCost, currency, language)}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPOModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs transition-all hover:scale-[1.02]"
                >
                  Generate PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect and Receive GRN Modal */}
      {showInspectGRNModal && selectedPOForGRN && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Goods Receiving & Quality Inspection</h3>
                <p className="text-[11px] text-slate-500 font-mono">PO Ref: {selectedPOForGRN.poNumber}</p>
              </div>
              <button onClick={() => setShowInspectGRNModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-72 overflow-y-auto custom-scrollbar">
              {grnItemsState.map((state, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">
                    Item #{idx + 1}: {selectedPOForGRN.items[idx]?.productName}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 font-medium">Accepted Qty</label>
                      <input
                        type="number"
                        value={state.acceptedQty}
                        onChange={(e) => {
                          const updated = [...grnItemsState];
                          updated[idx].acceptedQty = Number(e.target.value);
                          setGrnItemsState(updated);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 font-medium">Rejected / Damaged Qty</label>
                      <input
                        type="number"
                        value={state.rejectedQty}
                        onChange={(e) => {
                          const updated = [...grnItemsState];
                          updated[idx].rejectedQty = Number(e.target.value);
                          setGrnItemsState(updated);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-medium">Assigned IMEI/Serial Barcodes (Comma separated)</label>
                    <input
                      type="text"
                      value={state.imeis}
                      onChange={(e) => {
                        const updated = [...grnItemsState];
                        updated[idx].imeis = e.target.value;
                        setGrnItemsState(updated);
                      }}
                      placeholder="e.g. 358923114567890, 358923114567891"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-mono text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowInspectGRNModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinishGRN}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-xs transition-all hover:scale-[1.02]"
              >
                Sign & Accept GRN to Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
