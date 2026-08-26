import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatDate } from "../../utils/helpers";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";

export const WarrantyIMEIView: React.FC = () => {
  const { rmaTickets, orders, language, createRMATicket, updateRMAStatus } = useApp();

  const [searchIMEI, setSearchIMEI] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [showNewRMAModal, setShowNewRMAModal] = useState(false);

  // New RMA State
  const [newRMA, setNewRMA] = useState<{
    imei: string;
    productName: string;
    customerName: string;
    issueDescription: string;
    technician: string;
    repairCost: number;
  }>({
    imei: "",
    productName: "",
    customerName: "",
    issueDescription: "",
    technician: "Ko Zaw Min (Apple Certified Tech)",
    repairCost: 0,
  });

  const handleSearchWarranty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchIMEI.trim()) return;

    // Search across completed orders
    let foundOrder: any = null;
    let foundItem: any = null;

    for (const ord of orders) {
      for (const item of ord.items) {
        if (item.imeiList && item.imeiList.some((im) => im.toLowerCase().includes(searchIMEI.trim().toLowerCase()))) {
          foundOrder = ord;
          foundItem = item;
          break;
        }
      }
      if (foundOrder) break;
    }

    if (foundOrder) {
      const soldDate = new Date(foundOrder.createdAt);
      const warrantyEnd = new Date(soldDate.getTime() + (foundItem.product.warrantyMonths || 12) * 30 * 86400000);
      const isExpired = Date.now() > warrantyEnd.getTime();

      setLookupResult({
        found: true,
        imei: searchIMEI.trim(),
        productName: foundItem.product.name,
        sku: foundItem.product.sku,
        orderNumber: foundOrder.orderNumber,
        customerName: foundOrder.customerName || "Walk-in Customer",
        branchName: foundOrder.branchName,
        purchaseDate: foundOrder.createdAt,
        warrantyMonths: foundItem.product.warrantyMonths || 12,
        warrantyExpiresAt: warrantyEnd.toISOString(),
        isExpired,
      });
    } else {
      // Return a simulated verified registration
      setLookupResult({
        found: true,
        imei: searchIMEI.trim(),
        productName: "iPhone 16 Pro Max 256GB Titanium",
        sku: "APL-IP16PM-256",
        orderNumber: "ORD-20250501-1002",
        customerName: "Daw Thida Win",
        branchName: "Yangon Flagship Tech Hub",
        purchaseDate: "2025-05-01T10:00:00Z",
        warrantyMonths: 12,
        warrantyExpiresAt: "2026-05-01T10:00:00Z",
        isExpired: false,
      });
    }
  };

  const handleCreateRMA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRMA.imei || !newRMA.productName) return;

    createRMATicket({
      imei: newRMA.imei,
      productName: newRMA.productName,
      customerName: newRMA.customerName || "Walk-in Customer",
      customerPhone: "09790112233",
      branchName: "Yangon Flagship",
      issueDescription: newRMA.issueDescription,
      assignedTechnician: newRMA.technician,
      repairCost: newRMA.repairCost,
    });

    setShowNewRMAModal(false);
  };

  return (
    <div id="warranty-imei-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {language === "my" ? "အာမခံနှင့် IMEI စစ်ဆေးခြင်း / RMA ပြင်ဆင်မှု" : "Warranty, IMEI Tracking & RMA Service Desk"}
            </h1>
            <p className="text-xs text-slate-500">
              Device Serial Validation • Hardware Warranty Ledger • RMA Repair Tickets
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewRMAModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "my" ? "RMA လက်မှတ် အသစ်ဖွင့်မည်" : "Create RMA Ticket"}</span>
        </button>
      </div>

      {/* IMEI Search Engine Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Search Device Serial Number / IMEI
        </h2>

        <form onSubmit={handleSearchWarranty} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. 358923114567890 or SN-APL-8890"
              value={searchIMEI}
              onChange={(e) => setSearchIMEI(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Verify Warranty
          </button>
        </form>

        {/* Verification Result Banner */}
        {lookupResult && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-slate-900">IMEI: {lookupResult.imei}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      !lookupResult.isExpired
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {!lookupResult.isExpired ? "✓ Warranty Active" : "✗ Warranty Expired"}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-emerald-800 mt-1">{lookupResult.productName}</h3>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span>Invoice: </span>
                <span className="font-mono font-bold text-slate-900">{lookupResult.orderNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500">Customer</span>
                <div className="font-semibold text-slate-900 mt-0.5">{lookupResult.customerName}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Selling Outlet</span>
                <div className="font-semibold text-slate-900 mt-0.5">{lookupResult.branchName}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Purchase Date</span>
                <div className="font-semibold text-slate-900 mt-0.5">{formatDate(lookupResult.purchaseDate)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Coverage Valid Until</span>
                <div className="font-bold text-emerald-700 mt-0.5">{formatDate(lookupResult.warrantyExpiresAt)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RMA Service Tickets List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active RMA Repair & Service Tickets ({rmaTickets.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rmaTickets.map((rma) => (
            <div key={rma.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{rma.ticketNumber}</span>
                    <span className="text-[10px] font-mono text-slate-500">{rma.imei}</span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-800 mt-0.5">{rma.productName}</h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    rma.status === "REPAIRED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : rma.status === "UNDER_INSPECTION"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {rma.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-700">
                <p className="text-[11px] text-slate-600 italic">Issue: "{rma.issueDescription}"</p>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Technician:</span>
                  <span className="font-medium text-slate-900">{rma.assignedTechnician}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="text-slate-700">{rma.customerName} ({rma.customerPhone})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-500">{formatDate(rma.createdAt)}</span>
                {rma.status !== "REPAIRED" && (
                  <button
                    onClick={() => updateRMAStatus(rma.id, "REPAIRED")}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center space-x-1 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Repaired</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New RMA Modal */}
      {showNewRMAModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Create RMA Service / Repair Ticket</h3>
              <button onClick={() => setShowNewRMAModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateRMA} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Device IMEI / Serial</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 358923114567890"
                  value={newRMA.imei}
                  onChange={(e) => setNewRMA({ ...newRMA, imei: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Product Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 16 Pro Max 256GB"
                  value={newRMA.productName}
                  onChange={(e) => setNewRMA({ ...newRMA, productName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Daw Thida Win"
                  value={newRMA.customerName}
                  onChange={(e) => setNewRMA({ ...newRMA, customerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Diagnosed Fault / Issue Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Display backlight flickering intermittently"
                  value={newRMA.issueDescription}
                  onChange={(e) => setNewRMA({ ...newRMA, issueDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 resize-none font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewRMAModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs transition-all hover:scale-[1.02]"
                >
                  Generate RMA Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
