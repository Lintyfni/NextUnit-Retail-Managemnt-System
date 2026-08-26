import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import { Customer } from "../../types";
import {
  Users,
  Plus,
  Phone,
  Mail,
  Award,
  X,
  Search,
} from "lucide-react";

export const PartnersView: React.FC = () => {
  const { customers, suppliers, currency, language, addAuditLog } = useApp();

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
    addAuditLog("CREATE_CUSTOMER", `Registered customer ${newCust.name} (${newCust.phone})`);
    setShowNewPartnerModal(false);
  };

  return (
    <div id="partners-crm-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {language === "my" ? "ဖောက်သည်များနှင့် ကုန်ပစ္စည်းပေးသွင်းသူများ" : "Customers, Suppliers & Partner Directory"}
            </h1>
            <p className="text-xs text-slate-500">
              VIP Loyalty Management • Vendor Scorecards • Credit Balances
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("CUSTOMERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "CUSTOMERS" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              VIP Customers ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab("SUPPLIERS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "SUPPLIERS" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Global Suppliers ({suppliers.length})
            </button>
          </div>

          <button
            onClick={() => setShowNewPartnerModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
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
          className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
        />
      </div>

      {/* Tab 1: Customers Cards */}
      {activeTab === "CUSTOMERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{cust.name}</h3>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{cust.phone}</span>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    cust.membershipTier === "PLATINUM"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : cust.membershipTier === "GOLD"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : cust.membershipTier === "SILVER"
                      ? "bg-slate-100 text-slate-700 border-slate-300"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}
                >
                  ★ {cust.membershipTier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500">Total Lifetime Spent</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {formatCurrency(cust.totalSpent, currency, language)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Loyalty Points</span>
                  <div className="font-mono font-bold text-emerald-700 mt-0.5">
                    {cust.loyaltyPoints.toLocaleString()} pts
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>Credit Limit: {formatCurrency(cust.creditLimit, currency, language)}</span>
                <span className="text-emerald-700 font-semibold">Active Member</span>
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
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{sup.name}</h3>
                  <p className="text-[11px] text-slate-500">{sup.country} • {sup.paymentTerms}</p>
                </div>
                <div className="flex items-center space-x-1 text-amber-700 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Award className="w-3.5 h-3.5" />
                  <span>{sup.rating} / 5.0</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Contact:</span>
                  <span className="font-medium text-slate-800">{sup.contactPerson}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-500">{sup.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500">Lead Time</span>
                  <div className="font-bold text-slate-800 mt-0.5">{sup.leadTimeDays} Days</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">On-Time Delivery</span>
                  <div className="font-bold text-emerald-700 mt-0.5">{sup.onTimeDeliveryRate}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Partner Modal */}
      {showNewPartnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Register New Customer</h3>
              <button onClick={() => setShowNewPartnerModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daw Khin Khin"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="09790123456"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Membership Tier</label>
                  <select
                    value={newCust.membershipTier}
                    onChange={(e) => setNewCust({ ...newCust, membershipTier: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@gmail.com"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPartnerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs transition-all hover:scale-[1.02]"
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
