import React, { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode, Truck, User, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, currency, language, setActiveView } = useApp();

  useEffect(() => {
    if (activeReceipt) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [activeReceipt]);

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="receipt-modal-card"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-slate-800"
      >
        {/* Header bar */}
        <div className="bg-emerald-600 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-bold text-sm">Payment Successful</h3>
              <p className="text-[11px] text-emerald-100">Invoice: {activeReceipt.orderNumber}</p>
            </div>
          </div>
          <button
            id="close-receipt-modal-btn"
            onClick={() => setActiveReceipt(null)}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="p-6 bg-slate-50 font-mono text-xs text-slate-700 leading-relaxed border-b border-slate-200 print:p-0 print:bg-white">
          <div className="text-center space-y-1 mb-4">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm mb-1 shadow-xs">
              NU
            </div>
            <h2 className="font-bold text-base tracking-wider text-slate-900">NEXTUNIT TECH RETAIL POS</h2>
            <p className="text-[10px] text-slate-500">{activeReceipt.branchName}</p>
            <p className="text-[10px] text-slate-500">Tel: +95 9 790 123456 • Tax Reg: IRD-MM-9901</p>
          </div>

          <div className="border-t border-b border-dashed border-slate-300 py-2 my-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Receipt No:</span>
              <span className="font-bold text-slate-900">{activeReceipt.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{formatDate(activeReceipt.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{activeReceipt.cashierName}</span>
            </div>
            {activeReceipt.customerName && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>VIP Customer:</span>
                <span>{activeReceipt.customerName}</span>
              </div>
            )}
          </div>

          {/* Item Lines */}
          <div className="py-2 space-y-2">
            <div className="flex justify-between font-bold text-[11px] text-slate-900 border-b border-slate-200 pb-1">
              <span>Item Description</span>
              <span>Total</span>
            </div>
            {activeReceipt.items.map((item, idx) => {
              const originalPrice = item.originalPrice || item.product.sellingPrice;
              const hasDiscount = !item.isFOC && item.discountPercent && item.discountPercent > 0;

              return (
                <div key={idx} className="space-y-0.5 border-b border-dashed border-slate-200 pb-1.5 last:border-b-0">
                  <div className="flex justify-between font-medium">
                    <span className="truncate pr-2">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-bold">
                      {item.isFOC
                        ? "0 Ks (FOC)"
                        : formatCurrency(item.unitPrice * item.quantity, currency, language)}
                    </span>
                  </div>

                  {item.isFOC && (
                    <div className="text-[10px] text-emerald-700 flex justify-between">
                      <span>• Free of Charge (FOC)</span>
                      <span className="line-through text-slate-400">
                        {formatCurrency(originalPrice * item.quantity, currency, language)}
                      </span>
                    </div>
                  )}

                  {hasDiscount && (
                    <div className="text-[10px] text-amber-700 flex justify-between">
                      <span>
                        • Dis (-{item.discountPercent}%) [Orig: {formatCurrency(originalPrice, currency, language)}]
                      </span>
                      <span>
                        -{formatCurrency(
                          ((originalPrice * (item.discountPercent || 0)) / 100) * item.quantity,
                          currency,
                          language
                        )}
                      </span>
                    </div>
                  )}

                  {item.imeiList && item.imeiList.length > 0 && (
                    <div className="text-[9px] text-slate-500">
                      IMEI/SN: {item.imeiList.join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(activeReceipt.subtotal, currency, language)}</span>
            </div>
            {activeReceipt.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promo Discount:</span>
                <span>-{formatCurrency(activeReceipt.discountAmount, currency, language)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Commercial Tax (5% IRD):</span>
              <span>{formatCurrency(activeReceipt.taxAmount, currency, language)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Grand Total:</span>
              <span>{formatCurrency(activeReceipt.grandTotal, currency, language)}</span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="border-t border-slate-200 pt-2 mt-2 space-y-1 text-[10px]">
            <div className="font-bold text-slate-600">Payment Breakdown:</div>
            {activeReceipt.payments.map((p, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  • {p.method} {p.referenceNumber ? `(${p.referenceNumber})` : ""}:
                </span>
                <span className="font-semibold">{formatCurrency(p.amount, currency, language)}</span>
              </div>
            ))}
            {activeReceipt.changeGiven > 0 && (
              <div className="flex justify-between text-slate-600 font-bold">
                <span>Change Returned:</span>
                <span>{formatCurrency(activeReceipt.changeGiven, currency, language)}</span>
              </div>
            )}
          </div>

          {/* Fleet Delivery Info (If Dispatched via Fleet) */}
          {activeReceipt.deliveryTrackingNumber && (
            <div className="border-t border-dashed border-slate-300 pt-2 my-2 space-y-1 text-[11px] bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Logistics Fleet Dispatch</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Tracking Number:</span>
                <span className="font-mono font-bold text-slate-900">{activeReceipt.deliveryTrackingNumber}</span>
              </div>
              {activeReceipt.deliveryOption?.deliveryTypeName && (
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>Method:</span>
                  <span>{activeReceipt.deliveryOption.deliveryTypeName}</span>
                </div>
              )}
              {activeReceipt.deliveryOption?.address && (
                <div className="text-[10px] text-slate-600 truncate">
                  <span>To: </span>
                  <span>{activeReceipt.deliveryOption.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Barcode & Footer note */}
          <div className="text-center pt-4 space-y-2">
            <div className="inline-block bg-slate-900 text-white px-3 py-1 font-mono tracking-widest text-xs rounded">
              *{activeReceipt.orderNumber}*
            </div>
            <p className="text-[10px] text-slate-500">
              Official Warranty Valid with this Receipt • Thank you for shopping with us!
            </p>
            <div className="flex justify-center items-center space-x-1 text-[9px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified POS Transaction Signature</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-2">
          {activeReceipt.deliveryTrackingNumber ? (
            <button
              id="track-fleet-order-btn"
              onClick={() => {
                setActiveReceipt(null);
                setActiveView("logistics");
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Track in Fleet Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 font-mono">Status: Settled & Recorded</div>
          )}

          <div className="flex items-center space-x-2">
            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Thermal (80mm)</span>
            </button>
            <button
              id="done-receipt-btn"
              onClick={() => setActiveReceipt(null)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
