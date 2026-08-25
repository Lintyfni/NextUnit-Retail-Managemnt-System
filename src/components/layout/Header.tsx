import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { DICTIONARY } from "../../utils/helpers";
import {
  Globe,
  RotateCcw,
  Clock,
} from "lucide-react";

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    currentUser,
    setCurrentUser,
    allUsers,
    resetToDefaultData,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>("");
  const t = DICTIONARY[language];

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="main-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between shadow-md">
      {/* Left: Brand */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-teal-400 flex items-center justify-center font-bold text-white shadow-inner">
            OC
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-white text-base">OmniChain</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                Enterprise POS & ERP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Retail, Inventory & SCM System</p>
          </div>
        </div>
      </div>

      {/* Right Controls: Live Time, Currency, Language, User Switch */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-slate-300">{currentTime}</span>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs font-medium">
          <button
            id="currency-mmk-btn"
            onClick={() => setCurrency("MMK")}
            className={`px-2 py-1 rounded transition-all ${
              currency === "MMK" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            MMK
          </button>
          <button
            id="currency-usd-btn"
            onClick={() => setCurrency("USD")}
            className={`px-2 py-1 rounded transition-all ${
              currency === "USD" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            USD
          </button>
        </div>

        {/* Language Toggle (EN / မြန်မာ) */}
        <button
          id="lang-toggle-btn"
          onClick={() => setLanguage(language === "en" ? "my" : "en")}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors"
          title="Toggle Language / ဘာသာစကားပြောင်းပါ"
        >
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span>{language === "en" ? "မြန်မာ" : "EN"}</span>
        </button>

        {/* Demo User Switcher Dropdown */}
        <div className="relative flex items-center space-x-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-6 h-6 rounded-full object-cover border border-indigo-400"
          />
          <div className="hidden md:block text-left">
            <select
              id="user-role-switcher"
              value={currentUser.id}
              onChange={(e) => {
                const found = allUsers.find((u) => u.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                  {u.name} ({u.role.replace("_", " ")})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Demo Data Button */}
        <button
          id="reset-demo-data-btn"
          onClick={() => {
            if (window.confirm("Reset all store data back to initial sample state?")) {
              resetToDefaultData();
            }
          }}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          title="Reset Demo Data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
