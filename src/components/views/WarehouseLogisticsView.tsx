import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatDate } from "../../utils/helpers";
import {
  Truck,
  MapPin,
  CheckCircle2,
  User,
  Navigation,
  Layers,
} from "lucide-react";

export const WarehouseLogisticsView: React.FC = () => {
  const { deliveries, updateDeliveryStatus, language } = useApp();

  const [activeTab, setActiveTab] = useState<"DELIVERIES" | "BINS">("DELIVERIES");

  const warehouseBins = [
    { zone: "Zone A (High-Value Mobile Devices)", aisle: "A-01 to A-04", capacity: "92% Full", items: "Smartphones, iPads" },
    { zone: "Zone B (Computing & Displays)", aisle: "B-01 to B-06", capacity: "65% Full", items: "MacBooks, Monitors" },
    { zone: "Zone C (Audio & Wearables)", aisle: "C-01 to C-03", capacity: "40% Full", items: "AirPods, Galaxy Watch" },
    { zone: "Zone D (Dispatch & Cross-Docking)", aisle: "D-01 to D-02", capacity: "Staging Ready", items: "Pending Delivery Manifests" },
  ];

  return (
    <div id="warehouse-logistics-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {language === "my" ? "ဂိုဒေါင်စီမံခန့်ခွဲမှုနှင့် အရောက်ပို့ယာဉ်တန်း" : "Warehouse Logistics & Last-Mile Delivery Fleet"}
            </h1>
            <p className="text-xs text-slate-500">
              Bin Location Mapping • Order Picking • Real-time Courier Status
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("DELIVERIES")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "DELIVERIES" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Fleet Deliveries ({deliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("BINS")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "BINS" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Warehouse Bins & Layout
          </button>
        </div>
      </div>

      {/* Tab 1: Delivery Fleet & Couriers */}
      {activeTab === "DELIVERIES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveries.map((del) => (
            <div
              key={del.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-xs"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <div className="font-mono font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <span>{del.trackingNumber}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal border border-slate-200">
                      Order: {del.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-1">{del.recipientName}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    del.status === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : del.status === "OUT_FOR_DELIVERY"
                      ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                      : del.status === "IN_TRANSIT"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {del.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-800">{del.deliveryAddress}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Driver: <strong className="text-slate-900">{del.driverName}</strong> ({del.driverPhone})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-slate-500">Est. Arrival: {formatDate(del.estimatedArrival)}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                {del.status === "READY_FOR_PICKUP" && (
                  <button
                    onClick={() => updateDeliveryStatus(del.id, "OUT_FOR_DELIVERY")}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    Dispatch to Courier
                  </button>
                )}
                {del.status === "OUT_FOR_DELIVERY" && (
                  <button
                    onClick={() => updateDeliveryStatus(del.id, "DELIVERED")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Signed Delivery</span>
                  </button>
                )}
                {del.status === "DELIVERED" && (
                  <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Customer Signature Received</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Warehouse Layout & Bin Zones */}
      {activeTab === "BINS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouseBins.map((bin, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{bin.zone}</span>
                </h3>
                <span className="text-[10px] bg-slate-100 text-emerald-800 font-mono px-2 py-0.5 rounded font-bold border border-slate-200">
                  {bin.capacity}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Aisles:</span>
                  <span className="font-mono text-slate-900 font-semibold">{bin.aisle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Designated Stock:</span>
                  <span className="text-slate-800">{bin.items}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
