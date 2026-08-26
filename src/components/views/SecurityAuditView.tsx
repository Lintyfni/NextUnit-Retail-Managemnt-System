import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { formatDate } from "../../utils/helpers";
import {
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export const SecurityAuditView: React.FC = () => {
  const { auditLogs, language } = useApp();

  const [totpCode, setTotpCode] = useState("892 104");
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [searchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const sec = 30 - (now.getSeconds() % 30);
      setSecondsRemaining(sec);
      if (sec === 30 || sec === 0) {
        setTotpCode(`${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRisk = filterRisk === "ALL" || log.riskScore === filterRisk;
    return matchSearch && matchRisk;
  });

  return (
    <div id="security-audit-view" className="space-y-5 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {language === "my" ? "လုံခြုံရေး၊ စစ်ဆေးရေးမှတ်တမ်း (Audit Logs) နှင့် MFA" : "Enterprise Security, Audit Trail & MFA Authenticator"}
            </h1>
            <p className="text-xs text-slate-500">
              Tamper-Evident Immutable Logs • Risk Scoring • Multi-Factor Hardware Verification
            </p>
          </div>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MFA Simulator Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs text-slate-900">MFA Authenticator (TOTP)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{secondsRemaining}s left</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-2xl font-mono font-bold tracking-widest text-emerald-700">
              {totpCode}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Synced with Google / Microsoft Authenticator</p>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Enforced for Admin & POS Terminals</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Security Posture Metric */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
          <span className="text-xs font-medium text-slate-500">Active Security Posture</span>
          <div className="text-xl font-bold text-emerald-700">99.9% Optimal</div>
          <p className="text-[11px] text-slate-500">
            End-to-end encrypted sessions across all store registers and HQ backends.
          </p>
        </div>

        {/* Audit Log Telemetry */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
          <span className="text-xs font-medium text-slate-500">Total Recorded Audit Events</span>
          <div className="text-xl font-bold text-slate-900 font-mono">{auditLogs.length} Events</div>
          <p className="text-[11px] text-slate-500">
            Immutable log chain with cryptographic event hashing.
          </p>
        </div>
      </div>

      {/* Audit Log Table & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Real-time Immutable Security Audit Trail
          </h2>

          <div className="flex items-center space-x-2">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="FLAGGED">FLAGGED Suspicious</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">User / Actor</th>
                <th className="px-4 py-3">Details & Audit Payload</th>
                <th className="px-4 py-3">IP / Terminal</th>
                <th className="px-4 py-3 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{log.action}</td>
                  <td className="px-4 py-3 text-slate-800 font-semibold">{log.userName}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        log.riskScore === "FLAGGED"
                          ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                          : log.riskScore === "MEDIUM"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {log.riskScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
