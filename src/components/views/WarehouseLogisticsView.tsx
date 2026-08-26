import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { formatDate } from "../../utils/helpers";
import {
  Truck,
  MapPin,
  CheckCircle2,
  User,
  Navigation,
  Layers,
  Building2,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Tag,
  Box,
  Bike,
  Gauge,
  Barcode,
  X,
  PackageCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  Branch,
  DeliveryFleet,
  DeliveryType,
  WarehouseBin,
} from "../../types";

const WAREHOUSE_CATEGORY_MAP: Record<
  WarehouseBin["warehouseCategory"],
  { label: string; labelMy: string; color: string; bg: string; border: string }
> = {
  HIGH_VALUE_VAULT: {
    label: "High-Value Vault & Secured Cage (Smartphones / Tablets)",
    labelMy: "တန်ဖိုးကြီး လုံခြုံရေးဂိုဒေါင်ခန်း (စမတ်ဖုန်း / တက်ဘလက်)",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  COMPUTING_DISPLAYS: {
    label: "Computing & Large Displays (Laptops / Monitors)",
    labelMy: "ကွန်ပျူတာနှင့် မော်နီတာ သိုလှောင်ခန်း",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  AUDIO_WEARABLES: {
    label: "Audio & Smart Wearables (AirPods / Smartwatches)",
    labelMy: "အသံထွက်ပစ္စည်းနှင့် စမတ်နာရီ သိုလှောင်ခန်း",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  FAST_MOVING_PICK: {
    label: "Fast-Moving Pick Zone (Cables / Chargers / Cases)",
    labelMy: "ရောင်းအားသွက် အပိုပစ္စည်းထုတ်ယူခန်း (အားသွင်းကြိုး/ကာဗာ)",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  BULK_PALLET: {
    label: "High-Density Bulk Pallet Racks (Master Cartons)",
    labelMy: "အထပ်လိုက် ပလက်ဖောင်း အလုံးလိုက်သိုလှောင်ခန်း",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  DISPATCH_STAGING: {
    label: "Dispatch & Outbound Cross-Dock Staging",
    labelMy: "ယာဉ်တန်းတင်ပို့ရန် ပြင်ဆင်စစ်ဆေးရာဇုန်",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  QUARANTINE_RMA: {
    label: "Quarantine & Warranty RMA Hold Area",
    labelMy: "အာမခံစစ်ဆေးရန် သီးသန့်ခွဲထားရာဇုန် (RMA)",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  GENERAL_STORAGE: {
    label: "General Ambient Storage & Accessories",
    labelMy: "အထွေထွေသိုလှောင်ရာဇုန်",
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
};

const VEHICLE_CATEGORY_LABELS: Record<DeliveryType["vehicleCategory"], { label: string; icon: any }> = {
  MOTORBIKE: { label: "Express Motorbike (Under 20kg)", icon: Bike },
  LIGHT_VAN: { label: "1-Ton Light Commercial Van", icon: Truck },
  THREE_TON_TRUCK: { label: "3-Ton Medium Covered Truck", icon: Truck },
  SIX_WHEELER: { label: "6-Wheeler Inter-State Freight", icon: Truck },
  TWELVE_WHEELER: { label: "12-Wheeler Heavy Freight Carrier", icon: Truck },
  COLD_CHAIN_REEFER: { label: "Temperature-Controlled Reefer Truck", icon: Truck },
};

export const WarehouseLogisticsView: React.FC = () => {
  const {
    branches,
    deliveries,
    deliveryTypes,
    warehouseBins,
    createWarehouse,
    createDeliveryType,
    updateDeliveryType,
    deleteDeliveryType,
    createWarehouseBin,
    updateWarehouseBin,
    deleteWarehouseBin,
    createDelivery,
    updateDeliveryStatus,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"WAREHOUSES" | "FLEET" | "DELIVERY_TYPES" | "BINS">("WAREHOUSES");

  // Search and Filter states
  const [binSearch, setBinSearch] = useState("");
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("ALL");
  const [deliverySearch, setDeliverySearch] = useState("");

  // Modals state
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isDeliveryTypeModalOpen, setIsDeliveryTypeModalOpen] = useState(false);
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [isNewDispatchModalOpen, setIsNewDispatchModalOpen] = useState(false);

  // Edit states
  const [editingDeliveryType, setEditingDeliveryType] = useState<DeliveryType | null>(null);
  const [editingBin, setEditingBin] = useState<WarehouseBin | null>(null);

  // Form states: New Warehouse
  const [whForm, setWhForm] = useState({
    code: "",
    name: "",
    nameMy: "",
    city: "Yangon",
    address: "",
    phone: "+95 9 ",
    manager: "",
    registersCount: 1,
    status: "ACTIVE" as Branch["status"],
    monthlyTarget: 30000000,
    warehouseCapacity: 15000,
    isHQ: false,
  });

  // Form states: New Delivery Type
  const [dtForm, setDtForm] = useState({
    code: "",
    name: "",
    nameMy: "",
    vehicleCategory: "MOTORBIKE" as DeliveryType["vehicleCategory"],
    estimatedSLA: "2-4 Hours (Same Day Express)",
    baseRate: 3500,
    ratePerKm: 500,
    maxWeightKg: 20,
    maxVolumeCbm: 0.1,
    activeVehiclesCount: 5,
    status: "ACTIVE" as DeliveryType["status"],
    description: "",
  });

  // Form states: New Bin & Layout
  const [binForm, setBinForm] = useState({
    binCode: "",
    warehouseId: branches[0]?.id || "BR-WH-01",
    warehouseName: branches[0]?.name || "Yangon Central Logistics & Fulfillment Hub",
    warehouseCategory: "HIGH_VALUE_VAULT" as WarehouseBin["warehouseCategory"],
    zone: "Zone A (High-Value Secured Vault)",
    aisle: "A-01",
    rack: "Rack R-01",
    shelf: "Tier 1",
    maxCapacityUnits: 500,
    currentUnits: 120,
    designatedCategory: "Smartphones & Tablets",
    barcode: "",
    status: "AVAILABLE" as WarehouseBin["status"],
    notes: "",
  });

  // Form states: New Dispatch Delivery
  const [dispatchForm, setDispatchForm] = useState({
    recipientName: "",
    recipientPhone: "+95 9 ",
    deliveryAddress: "",
    driverName: "Ko Aung Kyaw",
    driverPhone: "+95 9 790 889900",
    vehicle: "YGN-9B/4521 (Yamaha Express)",
    deliveryTypeId: deliveryTypes[0]?.id || "",
    deliveryTypeName: deliveryTypes[0]?.name || "Express Motorbike Courier",
    warehouseId: branches[0]?.id || "BR-WH-01",
    warehouseName: branches[0]?.name || "Yangon Central Hub",
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    status: "ASSIGNED" as DeliveryFleet["status"],
    estimatedArrival: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
  });

  // Derived filtered bins
  const filteredBins = useMemo(() => {
    return warehouseBins.filter((bin) => {
      const matchSearch =
        bin.binCode.toLowerCase().includes(binSearch.toLowerCase()) ||
        bin.zone.toLowerCase().includes(binSearch.toLowerCase()) ||
        bin.designatedCategory.toLowerCase().includes(binSearch.toLowerCase()) ||
        bin.warehouseName.toLowerCase().includes(binSearch.toLowerCase());

      const matchWarehouse =
        selectedWarehouseFilter === "ALL" || bin.warehouseId === selectedWarehouseFilter;

      const matchCategory =
        selectedCategoryFilter === "ALL" || bin.warehouseCategory === selectedCategoryFilter;

      return matchSearch && matchWarehouse && matchCategory;
    });
  }, [warehouseBins, binSearch, selectedWarehouseFilter, selectedCategoryFilter]);

  // Derived filtered deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((del) => {
      const matchSearch =
        del.trackingNumber.toLowerCase().includes(deliverySearch.toLowerCase()) ||
        del.recipientName.toLowerCase().includes(deliverySearch.toLowerCase()) ||
        del.driverName.toLowerCase().includes(deliverySearch.toLowerCase()) ||
        del.deliveryAddress.toLowerCase().includes(deliverySearch.toLowerCase()) ||
        (del.orderNumber && del.orderNumber.toLowerCase().includes(deliverySearch.toLowerCase()));

      const matchStatus = deliveryStatusFilter === "ALL" || del.status === deliveryStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [deliveries, deliverySearch, deliveryStatusFilter]);

  // Handlers for Warehouse Creation
  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whForm.name || !whForm.code) return;
    createWarehouse({
      ...whForm,
      warehouseCapacity: Number(whForm.warehouseCapacity) || 10000,
      monthlyTarget: Number(whForm.monthlyTarget) || 30000000,
      registersCount: Number(whForm.registersCount) || 1,
    });
    setIsWarehouseModalOpen(false);
    setWhForm({
      code: "",
      name: "",
      nameMy: "",
      city: "Yangon",
      address: "",
      phone: "+95 9 ",
      manager: "",
      registersCount: 1,
      status: "ACTIVE",
      monthlyTarget: 30000000,
      warehouseCapacity: 15000,
      isHQ: false,
    });
  };

  // Handlers for Delivery Type
  const handleSaveDeliveryType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dtForm.name || !dtForm.code) return;

    if (editingDeliveryType) {
      updateDeliveryType({
        ...editingDeliveryType,
        ...dtForm,
        baseRate: Number(dtForm.baseRate),
        ratePerKm: Number(dtForm.ratePerKm),
        maxWeightKg: Number(dtForm.maxWeightKg),
        maxVolumeCbm: Number(dtForm.maxVolumeCbm),
        activeVehiclesCount: Number(dtForm.activeVehiclesCount),
      });
      setEditingDeliveryType(null);
    } else {
      createDeliveryType({
        ...dtForm,
        baseRate: Number(dtForm.baseRate),
        ratePerKm: Number(dtForm.ratePerKm),
        maxWeightKg: Number(dtForm.maxWeightKg),
        maxVolumeCbm: Number(dtForm.maxVolumeCbm),
        activeVehiclesCount: Number(dtForm.activeVehiclesCount),
      });
    }
    setIsDeliveryTypeModalOpen(false);
  };

  const openEditDeliveryType = (dt: DeliveryType) => {
    setEditingDeliveryType(dt);
    setDtForm({
      code: dt.code,
      name: dt.name,
      nameMy: dt.nameMy,
      vehicleCategory: dt.vehicleCategory,
      estimatedSLA: dt.estimatedSLA,
      baseRate: dt.baseRate,
      ratePerKm: dt.ratePerKm || 0,
      maxWeightKg: dt.maxWeightKg,
      maxVolumeCbm: dt.maxVolumeCbm || 0,
      activeVehiclesCount: dt.activeVehiclesCount,
      status: dt.status,
      description: dt.description || "",
    });
    setIsDeliveryTypeModalOpen(true);
  };

  // Handlers for Warehouse Bin
  const handleSaveBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!binForm.binCode) return;

    const selectedWh = branches.find((b) => b.id === binForm.warehouseId);
    const whName = selectedWh ? selectedWh.name : binForm.warehouseName;

    if (editingBin) {
      updateWarehouseBin({
        ...editingBin,
        ...binForm,
        warehouseName: whName,
        maxCapacityUnits: Number(binForm.maxCapacityUnits),
        currentUnits: Number(binForm.currentUnits),
        occupancyPercentage: Math.round(
          (Number(binForm.currentUnits) / (Number(binForm.maxCapacityUnits) || 1)) * 100
        ),
      });
      setEditingBin(null);
    } else {
      createWarehouseBin({
        ...binForm,
        warehouseName: whName,
        maxCapacityUnits: Number(binForm.maxCapacityUnits),
        currentUnits: Number(binForm.currentUnits),
      });
    }
    setIsBinModalOpen(false);
  };

  const openEditBin = (bin: WarehouseBin) => {
    setEditingBin(bin);
    setBinForm({
      binCode: bin.binCode,
      warehouseId: bin.warehouseId,
      warehouseName: bin.warehouseName,
      warehouseCategory: bin.warehouseCategory,
      zone: bin.zone,
      aisle: bin.aisle,
      rack: bin.rack,
      shelf: bin.shelf,
      maxCapacityUnits: bin.maxCapacityUnits,
      currentUnits: bin.currentUnits,
      designatedCategory: bin.designatedCategory,
      barcode: bin.barcode,
      status: bin.status,
      notes: bin.notes || "",
    });
    setIsBinModalOpen(true);
  };

  // Quick Bin Stock adjuster
  const handleAdjustBinUnits = (bin: WarehouseBin, delta: number) => {
    const newUnits = Math.max(0, Math.min(bin.maxCapacityUnits, bin.currentUnits + delta));
    updateWarehouseBin({
      ...bin,
      currentUnits: newUnits,
    });
  };

  // Dispatch Delivery creation
  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.recipientName || !dispatchForm.deliveryAddress) return;

    const chosenType = deliveryTypes.find((dt) => dt.id === dispatchForm.deliveryTypeId);
    const chosenWh = branches.find((b) => b.id === dispatchForm.warehouseId);

    createDelivery({
      ...dispatchForm,
      deliveryTypeName: chosenType ? chosenType.name : dispatchForm.deliveryTypeName,
      warehouseName: chosenWh ? chosenWh.name : dispatchForm.warehouseName,
    });
    setIsNewDispatchModalOpen(false);
    setDispatchForm({
      recipientName: "",
      recipientPhone: "+95 9 ",
      deliveryAddress: "",
      driverName: "Ko Aung Kyaw",
      driverPhone: "+95 9 790 889900",
      vehicle: "YGN-9B/4521 (Yamaha Express)",
      deliveryTypeId: deliveryTypes[0]?.id || "",
      deliveryTypeName: deliveryTypes[0]?.name || "Express Motorbike Courier",
      warehouseId: branches[0]?.id || "BR-WH-01",
      warehouseName: branches[0]?.name || "Yangon Central Hub",
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      status: "ASSIGNED",
      estimatedArrival: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    });
  };

  // Warehouse total stats
  const totalWarehouseCapacity = branches.reduce((sum, b) => sum + (b.warehouseCapacity || 0), 0);
  const totalBinCapacityUnits = warehouseBins.reduce((sum, b) => sum + b.maxCapacityUnits, 0);
  const totalCurrentStoredUnits = warehouseBins.reduce((sum, b) => sum + b.currentUnits, 0);
  const overallBinOccupancy =
    totalBinCapacityUnits > 0
      ? Math.round((totalCurrentStoredUnits / totalBinCapacityUnits) * 100)
      : 0;

  return (
    <div id="warehouse-logistics-view" className="space-y-5 animate-fade-in text-slate-800 pb-10">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900">
                {language === "my"
                  ? "ဂိုဒေါင်၊ ယာဉ်တန်းနှင့် Bin & Layout စီမံခန့်ခွဲမှုစနစ်"
                  : "Warehouse Hubs, Fleet Deliveries & Bin Layout Management"}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              YGN & MDY Central Hubs • Multi-tier Bin Mapping • Delivery Fleet SLA Dispatch • Real-time Tracking
            </p>
          </div>
        </div>

        {/* Global Action Navigation Tabs */}
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold gap-1">
          <button
            id="tab-warehouses"
            onClick={() => setActiveTab("WAREHOUSES")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "WAREHOUSES"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Warehouses ({branches.length})</span>
          </button>
          <button
            id="tab-fleet"
            onClick={() => setActiveTab("FLEET")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "FLEET"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fleet Deliveries ({deliveries.length})</span>
          </button>
          <button
            id="tab-delivery-types"
            onClick={() => setActiveTab("DELIVERY_TYPES")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "DELIVERY_TYPES"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Delivery Types ({deliveryTypes.length})</span>
          </button>
          <button
            id="tab-bins"
            onClick={() => setActiveTab("BINS")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "BINS"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bin & Layout ({warehouseBins.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Active Facilities</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{branches.length} Locations</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Yangon, Mandalay & Regional Hubs
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Bin Units Stored</span>
            <Box className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {totalCurrentStoredUnits.toLocaleString()} / {totalBinCapacityUnits.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
            <span className="font-semibold text-blue-700">{overallBinOccupancy}%</span>
            <span>allocated capacity</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Fleet Delivery Types</span>
            <Bike className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{deliveryTypes.length} Configured</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Bike, Van, 6W, 12W & Reefer</div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Active Dispatches</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {deliveries.filter((d) => d.status !== "DELIVERED" && d.status !== "FAILED").length} In Transit
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {deliveries.filter((d) => d.status === "DELIVERED").length} Completed
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WAREHOUSES & HUBS (YGN / MDY Warehouse အသစ်ဆောက်တာ) */}
      {/* ========================================================================= */}
      {activeTab === "WAREHOUSES" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Warehouse Hubs & Distribution Depots</span>
                <span className="text-xs font-normal text-slate-500">
                  (YGN, MDY & Regional Distribution Facilities)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Manage high-capacity logistics fulfillment centers, regional depots, and retail hubs.
              </p>
            </div>

            <button
              id="btn-create-warehouse"
              onClick={() => {
                setWhForm({
                  code: `WH-${branches.length >= 2 ? "MDY" : "YGN"}-${Date.now().toString().slice(-3)}`,
                  name: "",
                  nameMy: "",
                  city: "Yangon",
                  address: "",
                  phone: "+95 9 ",
                  manager: "",
                  registersCount: 1,
                  status: "ACTIVE",
                  monthlyTarget: 30000000,
                  warehouseCapacity: 15000,
                  isHQ: false,
                });
                setIsWarehouseModalOpen(true);
              }}
              className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{language === "my" ? "+ YGN/MDY ဂိုဒေါင်အသစ်ဆောက်မည်" : "+ Add Warehouse Facility"}</span>
            </button>
          </div>

          {/* Warehouse Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((wh) => {
              const whBins = warehouseBins.filter((b) => b.warehouseId === wh.id);
              const storedInBins = whBins.reduce((sum, b) => sum + b.currentUnits, 0);
              const maxBinUnits = whBins.reduce((sum, b) => sum + b.maxCapacityUnits, 0);
              const binOccPct = maxBinUnits > 0 ? Math.round((storedInBins / maxBinUnits) * 100) : 0;

              return (
                <div
                  key={wh.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                            {wh.code}
                          </span>
                          {wh.isHQ && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                              HQ Hub
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              wh.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {wh.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5">{wh.name}</h3>
                        {wh.nameMy && <p className="text-xs text-slate-500">{wh.nameMy}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">
                          {wh.city} • {wh.address}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          Facility Lead: <strong className="text-slate-900">{wh.manager}</strong> ({wh.phone})
                        </span>
                      </div>
                    </div>

                    {/* Capacity & Bins Progress */}
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Bin Units Occupied</span>
                        <span className="text-slate-900 font-mono">
                          {storedInBins.toLocaleString()} / {maxBinUnits.toLocaleString()} units ({binOccPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            binOccPct > 90
                              ? "bg-rose-500"
                              : binOccPct > 70
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, binOccPct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Allocated Bins: <strong>{whBins.length} zones</strong></span>
                        <span>Facility Cap: {(wh.warehouseCapacity || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedWarehouseFilter(wh.id);
                        setActiveTab("BINS");
                      }}
                      className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center space-x-1"
                    >
                      <span>View {whBins.length} Bins & Layout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setBinForm({
                          binCode: `${wh.code.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
                          warehouseId: wh.id,
                          warehouseName: wh.name,
                          warehouseCategory: "HIGH_VALUE_VAULT",
                          zone: "Zone A (High-Value Secured Vault)",
                          aisle: "A-01",
                          rack: "Rack R-01",
                          shelf: "Tier 1",
                          maxCapacityUnits: 500,
                          currentUnits: 0,
                          designatedCategory: "Smartphones & Tablets",
                          barcode: `BIN-${wh.code.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
                          status: "AVAILABLE",
                          notes: "",
                        });
                        setIsBinModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      + Add Bin
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FLEET DELIVERIES */}
      {/* ========================================================================= */}
      {activeTab === "FLEET" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search tracking, driver, customer..."
                  value={deliverySearch}
                  onChange={(e) => setDeliverySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={deliveryStatusFilter}
                onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="ALL">All Delivery Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <button
              id="btn-dispatch-new"
              onClick={() => setIsNewDispatchModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Dispatch New Delivery</span>
            </button>
          </div>

          {/* Deliveries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDeliveries.map((del) => (
              <div
                key={del.id}
                className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="font-mono font-bold text-sm text-slate-900 flex items-center space-x-2">
                        <span>{del.trackingNumber}</span>
                        {del.orderNumber && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal border border-slate-200">
                            Order: {del.orderNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-semibold mt-1 flex items-center space-x-1.5">
                        <span>{del.recipientName}</span>
                        <span className="text-slate-400 font-normal">({del.recipientPhone})</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        del.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : del.status === "OUT_FOR_DELIVERY"
                          ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                          : del.status === "IN_TRANSIT"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : del.status === "PICKED_UP"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {del.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Delivery details */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-800 font-medium">{del.deliveryAddress}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Driver: <strong className="text-slate-900">{del.driverName}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{del.driverPhone}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1">
                      <div className="flex items-center space-x-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-slate-700">{del.vehicle}</span>
                      </div>
                      {del.deliveryTypeName && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold">
                          {del.deliveryTypeName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Est. Delivery SLA: {formatDate(del.estimatedArrival)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap justify-end gap-2">
                  {del.status === "ASSIGNED" && (
                    <button
                      onClick={() => updateDeliveryStatus(del.id, "PICKED_UP")}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      Confirm Driver Pick-Up
                    </button>
                  )}
                  {del.status === "PICKED_UP" && (
                    <button
                      onClick={() => updateDeliveryStatus(del.id, "IN_TRANSIT")}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      Dispatch on Transit Route
                    </button>
                  )}
                  {del.status === "IN_TRANSIT" && (
                    <button
                      onClick={() => updateDeliveryStatus(del.id, "OUT_FOR_DELIVERY")}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      Mark Out for Delivery
                    </button>
                  )}
                  {del.status === "OUT_FOR_DELIVERY" && (
                    <button
                      onClick={() => updateDeliveryStatus(del.id, "DELIVERED")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Signed Delivery</span>
                    </button>
                  )}
                  {del.status === "DELIVERED" && (
                    <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1 py-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Signed & Delivered Successfully</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DELIVERY TYPES ("Fleet မှာ Delivery Type အသစ်ဆောက်တာရယ်") */}
      {/* ========================================================================= */}
      {activeTab === "DELIVERY_TYPES" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Fleet Delivery Types & Vehicle Categories</span>
                <span className="text-xs font-normal text-slate-500">
                  (Express Bike, 1-Ton Van, 6-Wheeler, Reefer Cold Chain, 12W)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Configure delivery rates, turnaround SLAs, maximum payload limits, and active fleet capacities.
              </p>
            </div>

            <button
              id="btn-create-delivery-type"
              onClick={() => {
                setEditingDeliveryType(null);
                setDtForm({
                  code: `DT-${Date.now().toString().slice(-4)}`,
                  name: "",
                  nameMy: "",
                  vehicleCategory: "MOTORBIKE",
                  estimatedSLA: "2-4 Hours (Same Day)",
                  baseRate: 3500,
                  ratePerKm: 500,
                  maxWeightKg: 20,
                  maxVolumeCbm: 0.1,
                  activeVehiclesCount: 5,
                  status: "ACTIVE",
                  description: "",
                });
                setIsDeliveryTypeModalOpen(true);
              }}
              className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{language === "my" ? "+ Delivery Type အသစ်ဆောက်မည်" : "+ New Delivery Type"}</span>
            </button>
          </div>

          {/* Delivery Types Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryTypes.map((dt) => {
              const categoryMeta = VEHICLE_CATEGORY_LABELS[dt.vehicleCategory] || {
                label: dt.vehicleCategory,
                icon: Truck,
              };
              const CategoryIcon = categoryMeta.icon;

              return (
                <div
                  key={dt.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {dt.code}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                dt.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {dt.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">{dt.name}</h3>
                          {dt.nameMy && <p className="text-xs text-slate-500">{dt.nameMy}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle Category:</span>
                        <span className="font-medium text-slate-900 text-right">{categoryMeta.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Turnaround SLA:</span>
                        <span className="font-semibold text-emerald-700">{dt.estimatedSLA}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Base Fare:</span>
                        <span className="font-bold text-slate-900">
                          {dt.baseRate.toLocaleString()} MMK
                          {dt.ratePerKm ? ` (+${dt.ratePerKm.toLocaleString()}/km)` : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payload Limit:</span>
                        <span className="font-medium text-slate-800">
                          {dt.maxWeightKg} kg {dt.maxVolumeCbm ? `(${dt.maxVolumeCbm} CBM)` : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Vehicles:</span>
                        <span className="font-bold text-purple-700">{dt.activeVehiclesCount} units ready</span>
                      </div>
                    </div>

                    {dt.description && (
                      <p className="text-xs text-slate-500 italic px-1">{dt.description}</p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => openEditDeliveryType(dt)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete delivery type ${dt.name}?`)) {
                          deleteDeliveryType(dt.id);
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BIN & LAYOUT ("Bin & Layout ဆိုပီး ခွဲပါ Bin & Layout အသစ်ဆောက်ရင် Main Warehouse Category ရွေးချယ်နိုင်ပါစေ") */}
      {/* ========================================================================= */}
      {activeTab === "BINS" && (
        <div className="space-y-4">
          {/* Bin Filters & Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Warehouse Bin Location & Structural Layout Mapping</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Manage Aisle, Rack, Shelf, and Warehouse Category-specific storage bins with live occupancy tracking.
                </p>
              </div>

              <button
                id="btn-create-bin"
                onClick={() => {
                  setEditingBin(null);
                  const firstBranch = branches[0];
                  setBinForm({
                    binCode: `BIN-${Date.now().toString().slice(-5)}`,
                    warehouseId: firstBranch?.id || "BR-WH-01",
                    warehouseName: firstBranch?.name || "Yangon Central Logistics & Fulfillment Hub",
                    warehouseCategory: "HIGH_VALUE_VAULT",
                    zone: "Zone A (High-Value Secured Vault)",
                    aisle: "A-01",
                    rack: "Rack R-01",
                    shelf: "Tier 1",
                    maxCapacityUnits: 500,
                    currentUnits: 100,
                    designatedCategory: "Smartphones, iPads & Mobile Tech",
                    barcode: `BIN-${Date.now().toString().slice(-5)}`,
                    status: "AVAILABLE",
                    notes: "",
                  });
                  setIsBinModalOpen(true);
                }}
                className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{language === "my" ? "+ Bin & Layout အသစ်ဆောက်မည်" : "+ Create New Bin & Layout"}</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Bin code, Zone, SKU category..."
                  value={binSearch}
                  onChange={(e) => setBinSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={selectedWarehouseFilter}
                onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="ALL">🏢 All Warehouse Hubs</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="ALL">📦 All Main Warehouse Categories</option>
                {Object.entries(WAREHOUSE_CATEGORY_MAP).map(([catKey, catMeta]) => (
                  <option key={catKey} value={catKey}>
                    {catMeta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBins.map((bin) => {
              const catMeta =
                WAREHOUSE_CATEGORY_MAP[bin.warehouseCategory] ||
                WAREHOUSE_CATEGORY_MAP.GENERAL_STORAGE;
              const occPct =
                bin.maxCapacityUnits > 0
                  ? Math.round((bin.currentUnits / bin.maxCapacityUnits) * 100)
                  : 0;

              return (
                <div
                  key={bin.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-white rounded">
                            {bin.binCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              bin.status === "AVAILABLE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : bin.status === "NEAR_FULL"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : bin.status === "FULL"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {bin.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1.5">{bin.zone}</p>
                        <p className="text-[11px] text-slate-500">{bin.warehouseName}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {occPct}%
                        </span>
                        <span className="block text-[10px] text-slate-400">Occupancy</span>
                      </div>
                    </div>

                    {/* Main Warehouse Category Badge */}
                    <div
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}
                    >
                      {catMeta.label}
                    </div>

                    {/* Location coordinates */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Aisle</span>
                        <strong className="font-mono text-slate-800">{bin.aisle}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Rack</span>
                        <strong className="font-mono text-slate-800">{bin.rack}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Shelf</span>
                        <strong className="font-mono text-slate-800">{bin.shelf}</strong>
                      </div>
                    </div>

                    {/* Designated Items */}
                    <div className="text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Designated Stock:</span>
                        <span className="font-medium text-slate-900 text-right">
                          {bin.designatedCategory}
                        </span>
                      </div>

                      {bin.barcode && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center space-x-1">
                            <Barcode className="w-3.5 h-3.5 text-slate-400" />
                            <span>Barcode:</span>
                          </span>
                          <span className="text-slate-700">{bin.barcode}</span>
                        </div>
                      )}
                    </div>

                    {/* Capacity Visual Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Stored Units:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {bin.currentUnits} / {bin.maxCapacityUnits} units
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full transition-all ${
                            occPct > 90
                              ? "bg-rose-500"
                              : occPct > 70
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, occPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bin actions & Quick +/- Stock */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleAdjustBinUnits(bin, -10)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                        title="Reduce 10 units"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleAdjustBinUnits(bin, 10)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                        title="Add 10 units"
                      >
                        +10
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => openEditBin(bin)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete bin location ${bin.binCode}?`)) {
                            deleteWarehouseBin(bin.id);
                          }
                        }}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW WAREHOUSE / HUB (YGN / MDY) */}
      {/* ========================================================================= */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {language === "my" ? "ဂိုဒေါင်သစ် ဖွင့်လှစ်သတ်မှတ်ခြင်း" : "Add New Warehouse / Logistics Facility"}
                </h3>
              </div>
              <button
                onClick={() => setIsWarehouseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Facility Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={whForm.code}
                    onChange={(e) => setWhForm({ ...whForm, code: e.target.value })}
                    placeholder="e.g. WH-YGN-02"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    City Location *
                  </label>
                  <select
                    value={whForm.city}
                    onChange={(e) => setWhForm({ ...whForm, city: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Yangon">Yangon (ရန်ကုန်)</option>
                    <option value="Mandalay">Mandalay (မန္တလေး)</option>
                    <option value="Naypyidaw">Naypyidaw (နေပြည်တော်)</option>
                    <option value="Bago">Bago (ပဲခူး)</option>
                    <option value="Mawlamyine">Mawlamyine (မော်လမြိုင်)</option>
                    <option value="Taunggyi">Taunggyi (တောင်ကြီး)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Facility Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={whForm.name}
                  onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
                  placeholder="e.g. Yangon North Sub-Fulfillment & Cross-Dock Hub"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Facility Name (Burmese)
                </label>
                <input
                  type="text"
                  value={whForm.nameMy}
                  onChange={(e) => setWhForm({ ...whForm, nameMy: e.target.value })}
                  placeholder="ဥပမာ - ရန်ကုန် မြောက်ပိုင်း အမြန်ထောက်ပံ့ရေးဂိုဒေါင်"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Facility Lead / Manager
                  </label>
                  <input
                    type="text"
                    value={whForm.manager}
                    onChange={(e) => setWhForm({ ...whForm, manager: e.target.value })}
                    placeholder="e.g. U Kyaw Min"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={whForm.phone}
                    onChange={(e) => setWhForm({ ...whForm, phone: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Address / Industrial Park
                </label>
                <input
                  type="text"
                  value={whForm.address}
                  onChange={(e) => setWhForm({ ...whForm, address: e.target.value })}
                  placeholder="e.g. Mingaladon Industrial Zone, Yangon"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Storage Capacity (Units)
                  </label>
                  <input
                    type="number"
                    value={whForm.warehouseCapacity}
                    onChange={(e) => setWhForm({ ...whForm, warehouseCapacity: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Monthly Sales/Dispatch Target
                  </label>
                  <input
                    type="number"
                    value={whForm.monthlyTarget}
                    onChange={(e) => setWhForm({ ...whForm, monthlyTarget: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                >
                  Confirm & Provision Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT DELIVERY TYPE ("Fleet မှာ Delivery Type အသစ်ဆောက်တာရယ်") */}
      {/* ========================================================================= */}
      {isDeliveryTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Bike className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingDeliveryType ? "Edit Delivery Type" : "Create New Fleet Delivery Type"}
                </h3>
              </div>
              <button
                onClick={() => setIsDeliveryTypeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeliveryType} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Delivery Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={dtForm.code}
                    onChange={(e) => setDtForm({ ...dtForm, code: e.target.value })}
                    placeholder="e.g. DT-EXP-BIKE"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Vehicle Category *
                  </label>
                  <select
                    value={dtForm.vehicleCategory}
                    onChange={(e) =>
                      setDtForm({
                        ...dtForm,
                        vehicleCategory: e.target.value as DeliveryType["vehicleCategory"],
                      })
                    }
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="MOTORBIKE">Express Motorbike (&lt; 20kg)</option>
                    <option value="LIGHT_VAN">1-Ton Commercial Van</option>
                    <option value="THREE_TON_TRUCK">3-Ton Medium Truck</option>
                    <option value="SIX_WHEELER">6-Wheeler Inter-City Freight</option>
                    <option value="TWELVE_WHEELER">12-Wheeler Heavy Freight</option>
                    <option value="COLD_CHAIN_REEFER">Cold-Chain Reefer Truck</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Delivery Type Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={dtForm.name}
                  onChange={(e) => setDtForm({ ...dtForm, name: e.target.value })}
                  placeholder="e.g. Same-Day City Motorbike Express"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Delivery Type Name (Burmese)
                </label>
                <input
                  type="text"
                  value={dtForm.nameMy}
                  onChange={(e) => setDtForm({ ...dtForm, nameMy: e.target.value })}
                  placeholder="ဥပမာ - မြို့တွင်း အမြန်ဆိုင်ကယ်ပို့ဆောင်ရေး"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Turnaround SLA *
                  </label>
                  <input
                    type="text"
                    required
                    value={dtForm.estimatedSLA}
                    onChange={(e) => setDtForm({ ...dtForm, estimatedSLA: e.target.value })}
                    placeholder="e.g. 2-4 Hours (Same Day)"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Active Vehicles in Fleet
                  </label>
                  <input
                    type="number"
                    value={dtForm.activeVehiclesCount}
                    onChange={(e) => setDtForm({ ...dtForm, activeVehiclesCount: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Base Fare Rate (MMK) *
                  </label>
                  <input
                    type="number"
                    required
                    value={dtForm.baseRate}
                    onChange={(e) => setDtForm({ ...dtForm, baseRate: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Rate Per KM (MMK)
                  </label>
                  <input
                    type="number"
                    value={dtForm.ratePerKm}
                    onChange={(e) => setDtForm({ ...dtForm, ratePerKm: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Max Weight (Kg)
                  </label>
                  <input
                    type="number"
                    value={dtForm.maxWeightKg}
                    onChange={(e) => setDtForm({ ...dtForm, maxWeightKg: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Max Volume (CBM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dtForm.maxVolumeCbm}
                    onChange={(e) => setDtForm({ ...dtForm, maxVolumeCbm: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Routing / Service Description
                </label>
                <textarea
                  rows={2}
                  value={dtForm.description}
                  onChange={(e) => setDtForm({ ...dtForm, description: e.target.value })}
                  placeholder="Special instructions or service coverage area..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDeliveryTypeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                >
                  {editingDeliveryType ? "Update Delivery Type" : "Save Delivery Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE / EDIT BIN & LAYOUT WITH MAIN WAREHOUSE CATEGORY SELECTOR */}
      {/* ========================================================================= */}
      {isBinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingBin ? "Edit Bin Location" : "Create New Bin & Layout Location"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Assign storage coordinates and select Main Warehouse Category
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBinModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBin} className="space-y-3.5">
              {/* Warehouse Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Warehouse Hub / Facility *
                </label>
                <select
                  required
                  value={binForm.warehouseId}
                  onChange={(e) => {
                    const sel = branches.find((b) => b.id === e.target.value);
                    setBinForm({
                      ...binForm,
                      warehouseId: e.target.value,
                      warehouseName: sel ? sel.name : "",
                    });
                  }}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.code}] {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* CRITICAL: Main Warehouse Category Selector */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <label className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Main Warehouse Category (ပင်မဂိုဒေါင်အမျိုးအစား ရွေးချယ်မှု) *</span>
                </label>
                <select
                  required
                  value={binForm.warehouseCategory}
                  onChange={(e) =>
                    setBinForm({
                      ...binForm,
                      warehouseCategory: e.target.value as WarehouseBin["warehouseCategory"],
                    })
                  }
                  className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 shadow-xs"
                >
                  {Object.entries(WAREHOUSE_CATEGORY_MAP).map(([catKey, catMeta]) => (
                    <option key={catKey} value={catKey}>
                      {catMeta.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-emerald-800">
                  {WAREHOUSE_CATEGORY_MAP[binForm.warehouseCategory]?.labelMy}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Bin Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={binForm.binCode}
                    onChange={(e) => setBinForm({ ...binForm, binCode: e.target.value })}
                    placeholder="e.g. BIN-YGN-A01-R2-01"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Zone Identifier
                  </label>
                  <input
                    type="text"
                    value={binForm.zone}
                    onChange={(e) => setBinForm({ ...binForm, zone: e.target.value })}
                    placeholder="e.g. Zone A (High-Value Secured)"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Coordinates Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Aisle
                  </label>
                  <input
                    type="text"
                    value={binForm.aisle}
                    onChange={(e) => setBinForm({ ...binForm, aisle: e.target.value })}
                    placeholder="A-01"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Rack
                  </label>
                  <input
                    type="text"
                    value={binForm.rack}
                    onChange={(e) => setBinForm({ ...binForm, rack: e.target.value })}
                    placeholder="Rack R-01"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Shelf
                  </label>
                  <input
                    type="text"
                    value={binForm.shelf}
                    onChange={(e) => setBinForm({ ...binForm, shelf: e.target.value })}
                    placeholder="Tier 2"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Designated Items / Product Classification
                </label>
                <input
                  type="text"
                  value={binForm.designatedCategory}
                  onChange={(e) => setBinForm({ ...binForm, designatedCategory: e.target.value })}
                  placeholder="e.g. Smartphones, Tablets, MacBooks"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Max Capacity (Units) *
                  </label>
                  <input
                    type="number"
                    required
                    value={binForm.maxCapacityUnits}
                    onChange={(e) =>
                      setBinForm({ ...binForm, maxCapacityUnits: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Current Units in Bin
                  </label>
                  <input
                    type="number"
                    value={binForm.currentUnits}
                    onChange={(e) =>
                      setBinForm({ ...binForm, currentUnits: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Bin Barcode
                  </label>
                  <input
                    type="text"
                    value={binForm.barcode}
                    onChange={(e) => setBinForm({ ...binForm, barcode: e.target.value })}
                    placeholder="e.g. BIN-YGN-A01"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Status
                  </label>
                  <select
                    value={binForm.status}
                    onChange={(e) =>
                      setBinForm({ ...binForm, status: e.target.value as WarehouseBin["status"] })
                    }
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="NEAR_FULL">NEAR_FULL</option>
                    <option value="FULL">FULL</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="RESERVED">RESERVED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBinModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                >
                  {editingBin ? "Update Bin & Layout" : "Save Bin Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DISPATCH NEW DELIVERY ORDER */}
      {/* ========================================================================= */}
      {isNewDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Dispatch New Fleet Delivery Manifest
                </h3>
              </div>
              <button
                onClick={() => setIsNewDispatchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Origin Warehouse Hub *
                  </label>
                  <select
                    value={dispatchForm.warehouseId}
                    onChange={(e) => {
                      const sel = branches.find((b) => b.id === e.target.value);
                      setDispatchForm({
                        ...dispatchForm,
                        warehouseId: e.target.value,
                        warehouseName: sel ? sel.name : "",
                      });
                    }}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Fleet Delivery Type *
                  </label>
                  <select
                    value={dispatchForm.deliveryTypeId}
                    onChange={(e) => {
                      const sel = deliveryTypes.find((dt) => dt.id === e.target.value);
                      setDispatchForm({
                        ...dispatchForm,
                        deliveryTypeId: e.target.value,
                        deliveryTypeName: sel ? sel.name : "",
                      });
                    }}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    {deliveryTypes.map((dt) => (
                      <option key={dt.id} value={dt.id}>
                        [{dt.code}] {dt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Recipient / Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.recipientName}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, recipientName: e.target.value })
                    }
                    placeholder="e.g. Daw Khin Hnin"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Recipient Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.recipientPhone}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, recipientPhone: e.target.value })
                    }
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Delivery Destination Address *
                </label>
                <input
                  type="text"
                  required
                  value={dispatchForm.deliveryAddress}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, deliveryAddress: e.target.value })
                  }
                  placeholder="e.g. No. 42, Sayar San Road, Bahan, Yangon"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Courier Driver Name
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.driverName}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, driverName: e.target.value })
                    }
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Courier Driver Phone
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.driverPhone}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })
                    }
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Vehicle Registration / Plate
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.vehicle}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, vehicle: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Related Sale Order / Transfer #
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.orderNumber}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, orderNumber: e.target.value })
                    }
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewDispatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
                >
                  Dispatch Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
