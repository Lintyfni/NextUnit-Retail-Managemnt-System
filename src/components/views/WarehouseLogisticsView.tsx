import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatDate, DICTIONARY } from "../../utils/helpers";
import { DeliveryOrder } from "../../types";
import {
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Navigation,
  Layers,
  Plus,
} from "lucide-react";

export const WarehouseLogisticsView: React.FC = () => {
  const { deliveries, updateDeliveryStatus, language } = useApp();
  const t = DICTIONARY[language];

  const [activeTab, setActiveTab] = useState<"DELIVERIES" | "BINS">("DELIVERIES");

  const warehouseBins = [
    { zone: "Zone A (High-Value Mobile Devices)", aisle: "A-01 to A-04", capacity: "92% Full", items: "Smartphones, iPads" },
    { zone: "Zone B (Computing & Displays)", aisle: "B-01 to B-06", capacity: "65% Full", items: "MacBooks, Monitors" },
    { zone: "Zone C (Audio & Wearables)", aisle: "C-01 to C-03", capacity: "40% Full", items: "AirPods, Galaxy Watch" },
    { zone: "Zone D (Dispatch & Cross-Docking)", aisle: "D-01 to D-02", capacity: "Staging Ready", items: "Pending Delivery Manifests" },
  ];

  return (
    <div id="warehouse-logistics-view" className="space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              {language === "my" ? "ဂိုဒေါင်စီမံခန့်ခွဲမှုနှင့် အရောက်ပို့ယာဉ်တန်း" : "Warehouse Logistics & Last-Mile Delivery Fleet"}
            </h1>
            <p className="text-xs text-slate-400">
              Bin Location Mapping • Order Picking • Real-time Courier Status
            </p>
          </div>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("DELIVERIES")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "DELIVERIES" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Fleet Deliveries ({deliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("BINS")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "BINS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
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
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <div className="font-mono font-bold text-sm text-slate-100 flex items-center space-x-2">
                    <span>{del.trackingNumber}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-normal">
                      Order: {del.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold mt-1">{del.recipientName}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    del.status === "DELIVERED"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : del.status === "OUT_FOR_DELIVERY"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                      : del.status === "IN_TRANSIT"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : "bg-slate-700/40 text-slate-300 border-slate-600/30"
                  }`}
                >
                  {del.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-300">{del.deliveryAddress}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Driver: <strong className="text-slate-200">{del.driverName}</strong> ({del.driverPhone})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Navigation className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-slate-400">Est. Arrival: {formatDate(del.estimatedArrival)}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                {del.status === "READY_FOR_PICKUP" && (
                  <button
                    onClick={() => updateDeliveryStatus(del.id, "OUT_FOR_DELIVERY")}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    Dispatch to Courier
                  </button>
                )}
                {del.status === "OUT_FOR_DELIVERY" && (
                  <button
                    onClick={() => updateDeliveryStatus(del.id, "DELIVERED")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Signed Delivery</span>
                  </button>
                )}
                {del.status === "DELIVERED" && (
                  <span className="text-emerald-400 font-bold text-xs flex items-center space-x-1">
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
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-xs text-slate-100 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>{bin.zone}</span>
                </h3>
                <span className="text-[10px] bg-slate-800 text-teal-300 font-mono px-2 py-0.5 rounded font-bold">
                  {bin.capacity}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Aisles:</span>
                  <span className="font-mono text-slate-200">{bin.aisle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Designated Stock:</span>
                  <span className="text-slate-300">{bin.items}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
