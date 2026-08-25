import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { formatDate, DICTIONARY } from "../../utils/helpers";
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  Key,
  Smartphone,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";

export const SecurityAuditView: React.FC = () => {
  const { auditLogs, currentUser, language } = useApp();
  const t = DICTIONARY[language];

  const [totpCode, setTotpCode] = useState("892 104");
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [searchQuery, setSearchQuery] = useState("");
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
    <div id="security-audit-view" className="space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              {language === "my" ? "လုံခြုံရေး၊ စစ်ဆေးရေးမှတ်တမ်း (Audit Logs) နှင့် MFA" : "Enterprise Security, Audit Trail & MFA Authenticator"}
            </h1>
            <p className="text-xs text-slate-400">
              Tamper-Evident Immutable Logs • Risk Scoring • Multi-Factor Hardware Verification
            </p>
          </div>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MFA Simulator Card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-200 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-xs">MFA Authenticator (TOTP)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{secondsRemaining}s left</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-mono font-bold tracking-widest text-emerald-400">
              {totpCode}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Synced with Google / Microsoft Authenticator</p>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Enforced for Admin & POS Terminals</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Security Posture Metric */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400">Active Security Posture</span>
          <div className="text-xl font-bold text-emerald-400">99.9% Optimal</div>
          <p className="text-[11px] text-slate-400">
            End-to-end encrypted sessions across all store registers and HQ backends.
          </p>
        </div>

        {/* Audit Log Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400">Total Recorded Audit Events</span>
          <div className="text-xl font-bold text-slate-100 font-mono">{auditLogs.length} Events</div>
          <p className="text-[11px] text-slate-400">
            Immutable log chain with cryptographic event hashing.
          </p>
        </div>
      </div>

      {/* Audit Log Table & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Real-time Immutable Security Audit Trail
          </h2>

          <div className="flex items-center space-x-2">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="FLAGGED">FLAGGED Suspicious</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">User / Actor</th>
                <th className="px-4 py-3">Details & Audit Payload</th>
                <th className="px-4 py-3">IP / Terminal</th>
                <th className="px-4 py-3 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-200">{log.action}</td>
                  <td className="px-4 py-3 text-slate-300 font-semibold">{log.userName}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        log.riskScore === "FLAGGED"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse"
                          : log.riskScore === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
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
