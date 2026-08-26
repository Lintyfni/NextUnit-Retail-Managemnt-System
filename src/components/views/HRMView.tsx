import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatCurrency } from "../../utils/helpers";
import {
  UserCheck,
} from "lucide-react";

export const HRMView: React.FC = () => {
  const { allUsers, currentUser, branches, currency, language, addAuditLog } = useApp();

  const [activeTab, setActiveTab] = useState<"STAFF" | "ATTENDANCE" | "ROLES">("STAFF");
  const [clockedIn, setClockedIn] = useState(true);
  const [clockTime, setClockTime] = useState("08:55 AM");

  const [attendanceRecords] = useState([
    { id: "ATT-1", name: "Daw Ei Ei Phyo", role: "HQ_ADMIN", branch: "HQ Flagship", inTime: "08:45 AM", outTime: "--", status: "ON_DUTY" },
    { id: "ATT-2", name: "Ko Min Thu", role: "BRANCH_MANAGER", branch: "Mandalay", inTime: "08:50 AM", outTime: "--", status: "ON_DUTY" },
    { id: "ATT-3", name: "Ma Hnin Nu", role: "CASHIER", branch: "Yangon Flagship", inTime: "08:55 AM", outTime: "--", status: "ON_DUTY" },
    { id: "ATT-4", name: "Ko Kyaw Zin", role: "WAREHOUSE_STAFF", branch: "Central Warehouse", inTime: "08:30 AM", outTime: "--", status: "ON_DUTY" },
  ]);

  const handleToggleClock = () => {
    if (clockedIn) {
      setClockedIn(false);
      addAuditLog("CLOCK_OUT", `${currentUser.name} clocked out from active shift`);
    } else {
      setClockedIn(true);
      setClockTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      addAuditLog("CLOCK_IN", `${currentUser.name} clocked in for active shift`);
    }
  };

  const roleMatrix = [
    { role: "HQ_ADMIN", label: "HQ Super Admin", permPos: "Full", permStock: "Full", permAccounts: "Full", permUsers: "Full", permPricing: "Full" },
    { role: "BRANCH_MANAGER", label: "Branch Store Manager", permPos: "Full", permStock: "Branch Only", permAccounts: "View Only", permUsers: "Cashiers Only", permPricing: "View Only" },
    { role: "CASHIER", label: "Retail Cashier", permPos: "Billing & Returns", permStock: "Lookup Only", permAccounts: "None", permUsers: "None", permPricing: "None" },
    { role: "WAREHOUSE_STAFF", label: "Warehouse & Logistics", permPos: "None", permStock: "GRN & Transfer", permAccounts: "None", permUsers: "None", permPricing: "None" },
    { role: "ACCOUNTANT", label: "Financial Accountant", permPos: "Audit Only", permStock: "Valuation Only", permAccounts: "Full Vouchers", permUsers: "None", permPricing: "View Only" },
  ];

  return (
    <div id="hrm-users-roles-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {language === "my" ? "လူ့စွမ်းအားအရင်းအမြစ် (HRM) နှင့် အသုံးပြုသူ လုပ်ပိုင်ခွင့်များ" : "Human Resource Management (HRM) & RBAC Roles"}
            </h1>
            <p className="text-xs text-slate-500">
              Shift Attendance Clock • RBAC Permission Matrix • Store Staff Directory
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("STAFF")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "STAFF" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Staff Directory ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("ATTENDANCE")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "ATTENDANCE" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Shift Clock In/Out
          </button>
          <button
            onClick={() => setActiveTab("ROLES")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "ROLES" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            RBAC Permissions Matrix
          </button>
        </div>
      </div>

      {/* Tab 1: Staff Directory Cards */}
      {activeTab === "STAFF" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allUsers.map((u) => {
            const branch = branches.find((b) => b.id === u.branchId);
            return (
              <div
                key={u.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-emerald-300 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{u.name}</h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {u.role.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Branch:</span>
                    <span className="font-medium text-slate-900">{branch?.name || "Consolidated HQ"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Salary:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(u.salary || 1200000, currency, language)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sales Commission (MTD):</span>
                    <span className="font-mono font-bold text-slate-800">+85,000 MMK</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>MFA Authenticator: Enabled</span>
                  <span className="text-emerald-700 font-semibold">Active Status</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Attendance & Shift Tracker */}
      {activeTab === "ATTENDANCE" && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Quick Clock-in Card for Current User */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-800 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Active Cashier & Staff Attendance Terminal
              </span>
              <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
              <p className="text-xs text-slate-500">
                Current Status:{" "}
                <strong className={clockedIn ? "text-emerald-700" : "text-slate-500"}>
                  {clockedIn ? `On Duty (Clocked in at ${clockTime})` : "Off Duty (Clocked Out)"}
                </strong>
              </p>
            </div>

            <button
              onClick={handleToggleClock}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all ${
                clockedIn
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {clockedIn ? "Clock Out Shift" : "Clock In Shift"}
            </button>
          </div>

          {/* Today's Staff Shift Log Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3 border-b border-slate-100 font-bold text-xs text-slate-800">
              Today's Store Staff Attendance Logs
            </div>
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Outlet</th>
                  <th className="px-4 py-3">Clock In</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attendanceRecords.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{att.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{att.role}</td>
                    <td className="px-4 py-3 text-slate-700">{att.branch}</td>
                    <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{att.inTime}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: RBAC Matrix */}
      {activeTab === "ROLES" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-4 py-3">System Role</th>
                  <th className="px-4 py-3">POS Billing</th>
                  <th className="px-4 py-3">Inventory Matrix</th>
                  <th className="px-4 py-3">Accounting & Vouchers</th>
                  <th className="px-4 py-3">User Admin</th>
                  <th className="px-4 py-3">Dynamic Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {roleMatrix.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{r.label}</div>
                      <div className="text-[10px] text-emerald-700 font-mono font-semibold">{r.role}</div>
                    </td>
                    <td className="px-4 py-3">{r.permPos}</td>
                    <td className="px-4 py-3">{r.permStock}</td>
                    <td className="px-4 py-3">{r.permAccounts}</td>
                    <td className="px-4 py-3">{r.permUsers}</td>
                    <td className="px-4 py-3">{r.permPricing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
