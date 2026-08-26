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
    <header id="main-header" className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 px-4 py-2 flex items-center justify-between shadow-xs">
      {/* Left: Brand */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center font-black text-white shadow-xs tracking-wider text-sm">
            NU
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-slate-900 text-base">NextUnit Tech</span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded">
                Retail POS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Retail POS Management System</p>
          </div>
        </div>
      </div>

      {/* Right Controls: Live Time, Currency, Language, User Switch */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-mono text-slate-700 font-medium">{currentTime}</span>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            id="currency-mmk-btn"
            onClick={() => setCurrency("MMK")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              currency === "MMK" ? "bg-emerald-600 text-white font-semibold shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            MMK
          </button>
          <button
            id="currency-usd-btn"
            onClick={() => setCurrency("USD")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              currency === "USD" ? "bg-emerald-600 text-white font-semibold shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            USD
          </button>
        </div>

        {/* Language Toggle (EN / မြန်မာ) */}
        <button
          id="lang-toggle-btn"
          onClick={() => setLanguage(language === "en" ? "my" : "en")}
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          title="Toggle Language / ဘာသာစကားပြောင်းပါ"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === "en" ? "မြန်မာ" : "EN"}</span>
        </button>

        {/* Demo User Switcher Dropdown */}
        <div className="relative flex items-center space-x-1.5 bg-slate-100/90 px-2 py-1 rounded-lg border border-slate-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-6 h-6 rounded-full object-cover border border-emerald-500"
          />
          <div className="hidden md:block text-left">
            <select
              id="user-role-switcher"
              value={currentUser.id}
              onChange={(e) => {
                const found = allUsers.find((u) => u.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-white text-slate-800">
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
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          title="Reset Demo Data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
