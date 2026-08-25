import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency, DICTIONARY } from "../../utils/helpers";
import { Customer, Supplier } from "../../types";
import {
  Users,
  Building,
  Plus,
  Phone,
  Mail,
  Award,
  CreditCard,
  Clock,
  CheckCircle2,
  DollarSign,
  X,
  Search,
} from "lucide-react";

export const PartnersView: React.FC = () => {
  const { customers, suppliers, currency, language, addAuditLog } = useApp();
  const t = DICTIONARY[language];

  const [activeTab, setActiveTab] = useState<"CUSTOMERS" | "SUPPLIERS">("CUSTOMERS");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPartnerModal, setShowNewPartnerModal] = useState(false);

  // New Customer Form State
  const [newCust, setNewCust] = useState<Partial<Customer>>({
    name: "",
    phone: "",
    email: "",
    membershipTier: "BRONZE",
    loyaltyPoints: 100,
    totalSpent: 0,
    creditLimit: 2000000,
    currentCreditBalance: 0,
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.phone) return;
    addAuditLog("CREATE_CUSTOMER", "CRM", `Registered customer ${newCust.name} (${newCust.phone})`);
    alert(`Customer ${newCust.name} registered.`);
    setShowNewPartnerModal(false);
  };

  return (
    <div id="partners-crm-view" className="space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              {language === "my" ? "ဖောက်သည်များနှင့် ကုန်ပစ္စည်းပေးသွင်းသူများ" : "Customers, Suppliers & Partner Directory"}
            </h1>
            <p className="text-xs text-slate-400">
              VIP Loyalty Management • Vendor Scorecards • Credit Balances
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("CUSTOMERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "CUSTOMERS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              VIP Customers ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab("SUPPLIERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "SUPPLIERS" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Global Suppliers ({suppliers.length})
            </button>
          </div>

          <button
            onClick={() => setShowNewPartnerModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === "CUSTOMERS" ? "New Customer" : "New Supplier"}</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder={activeTab === "CUSTOMERS" ? "Search customer by name, phone, email..." : "Search supplier by company name, country, contact..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Tab 1: Customers Cards */}
      {activeTab === "CUSTOMERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-100">{cust.name}</h3>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{cust.phone}</span>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    cust.membershipTier === "PLATINUM"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : cust.membershipTier === "GOLD"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : cust.membershipTier === "SILVER"
                      ? "bg-slate-300/20 text-slate-200 border-slate-400/30"
                      : "bg-orange-900/30 text-orange-300 border-orange-700/30"
                  }`}
                >
                  ★ {cust.membershipTier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400">Total Lifetime Spent</span>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">
                    {formatCurrency(cust.totalSpent, currency, language)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Loyalty Points</span>
                  <div className="font-mono font-bold text-indigo-400 mt-0.5">
                    {cust.loyaltyPoints.toLocaleString()} pts
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Credit Limit: {formatCurrency(cust.creditLimit, currency, language)}</span>
                <span className="text-emerald-400 font-semibold">Active Member</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Suppliers Cards */}
      {activeTab === "SUPPLIERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-100">{sup.name}</h3>
                  <p className="text-[11px] text-slate-400">{sup.country} • {sup.paymentTerms}</p>
                </div>
                <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  <Award className="w-3.5 h-3.5" />
                  <span>{sup.rating} / 5.0</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-medium text-slate-200">{sup.contactPerson}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-400">{sup.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400">Lead Time</span>
                  <div className="font-bold text-slate-200 mt-0.5">{sup.leadTimeDays} Days</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">On-Time Delivery</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{sup.onTimeDeliveryRate}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Partner Modal */}
      {showNewPartnerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Register New Customer</h3>
              <button onClick={() => setShowNewPartnerModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daw Khin Khin"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="09790123456"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Membership Tier</label>
                  <select
                    value={newCust.membershipTier}
                    onChange={(e) => setNewCust({ ...newCust, membershipTier: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@gmail.com"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewPartnerModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
