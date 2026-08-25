import React from "react";
import { useApp } from "../../context/AppContext";
import { DICTIONARY } from "../../utils/helpers";
import {
  ShoppingCart,
  Receipt,
  Users,
  Package,
  Truck,
  ShieldAlert,
  Calculator,
  Gift,
  BarChart3,
  Boxes,
  Tag,
  UserCheck,
  Lock,
  ChevronRight,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, language, cart } = useApp();
  const t = DICTIONARY[language];

  const menuSections = [
    {
      group: language === "my" ? "အရောင်းနှင့် ကုန်သွယ်ရေး" : "Sales & POS Operations",
      items: [
        {
          id: "pos",
          label: t.posBilling,
          icon: ShoppingCart,
          badge: cart.length > 0 ? `${cart.length}` : undefined,
          badgeColor: "bg-emerald-500",
        },
        { id: "dynamic-pricing", label: t.dynamicPricing, icon: Tag },
        { id: "crm", label: t.crm, icon: Gift },
      ],
    },
    {
      group: language === "my" ? "ပစ္စည်းလက်ကျန် & ထောက်ပံ့ရေး" : "Supply & Logistics",
      items: [
        { id: "inventory", label: t.inventory, icon: Package, badge: "Low Stock: 4", badgeColor: "bg-amber-500" },
        { id: "purchasing", label: t.purchaseGrn, icon: Receipt },
        { id: "logistics", label: t.logistics, icon: Truck },
        { id: "warranty", label: t.warranty, icon: ShieldAlert },
        { id: "supply-chain", label: t.supplyChain, icon: Boxes },
      ],
    },
    {
      group: language === "my" ? "ငွေစာရင်းနှင့် မိတ်ဖက်များ" : "Finance & Partners",
      items: [
        { id: "accounting", label: t.accounting, icon: Calculator },
        { id: "partners", label: t.partners, icon: Users },
        { id: "reports", label: t.reports, icon: BarChart3 },
      ],
    },
    {
      group: language === "my" ? "စီမံခန့်ခွဲမှုနှင့် လုံခြုံရေး" : "Administration & Security",
      items: [
        { id: "hrm", label: t.hrm, icon: UserCheck },
        { id: "security", label: t.security, icon: Lock },
      ],
    },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-[calc(100vh-53px)] sticky top-[53px] select-none flex-shrink-0"
    >
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 custom-scrollbar">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {section.group}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-indigo-600/90 text-white font-semibold shadow-sm"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full text-white ${
                            item.badgeColor || "bg-indigo-500"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Sync Active</span>
        </div>
        <span className="text-slate-500 font-mono">v4.8 Enterprise</span>
      </div>
    </aside>
  );
};
