import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { ReceiptModal } from "./components/modals/ReceiptModal";

// Feature Views
import { POSView } from "./components/views/POSView";
import { PurchasingView } from "./components/views/PurchasingView";
import { PartnersView } from "./components/views/PartnersView";
import { InventoryView } from "./components/views/InventoryView";
import { WarehouseLogisticsView } from "./components/views/WarehouseLogisticsView";
import { WarrantyIMEIView } from "./components/views/WarrantyIMEIView";
import { AccountingView } from "./components/views/AccountingView";
import { CRMView } from "./components/views/CRMView";
import { SupplyChainView } from "./components/views/SupplyChainView";
import { DynamicPricingView } from "./components/views/DynamicPricingView";
import { HRMView } from "./components/views/HRMView";
import { SecurityAuditView } from "./components/views/SecurityAuditView";
import { BIReportsView } from "./components/views/BIReportsView";

const MainContent: React.FC = () => {
  const { activeView } = useApp();

  const renderCurrentView = () => {
    switch (activeView) {
      case "pos":
        return <POSView />;
      case "purchasing":
        return <PurchasingView />;
      case "partners":
        return <PartnersView />;
      case "inventory":
        return <InventoryView />;
      case "logistics":
        return <WarehouseLogisticsView />;
      case "warranty":
        return <WarrantyIMEIView />;
      case "accounting":
        return <AccountingView />;
      case "crm":
        return <CRMView />;
      case "supply-chain":
        return <SupplyChainView />;
      case "dynamic-pricing":
        return <DynamicPricingView />;
      case "hrm":
        return <HRMView />;
      case "security":
        return <SecurityAuditView />;
      case "reports":
        return <BIReportsView />;
      default:
        return <POSView />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-50 text-slate-800 min-h-[calc(100vh-57px)] custom-scrollbar">
      <div className="max-w-7xl mx-auto">{renderCurrentView()}</div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
        <ReceiptModal />
      </div>
    </AppProvider>
  );
}
