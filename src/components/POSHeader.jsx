import { useState, useEffect } from 'react';

export default function POSHeader({
  serviceType,
  setServiceType,
  tableNumber,
  setTableNumber,
  orderHistoryCount,
  onOpenHistory,
  backendStatus,
  isAdminLoggedIn = false,
  adminUser = null,
  onOpenAdminLogin,
  onOpenAdminDashboard,
  onAdminLogout,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const isOnline = backendStatus === 'Connected' || backendStatus.includes('Online');

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-200 bg-white px-3 sm:px-5 py-2 sm:py-2.5 shadow-xs max-w-full">
      {/* Brand & Service Mode Toggle */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-5">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
              The Laban Wala
            </h1>
            <span className="hidden sm:inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700">
              POS
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">
            Artisanal Desserts &amp; Laban Bar
          </p>
        </div>

        {/* Order Mode Switcher (Takeaway vs Dine In) */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 sm:p-1">
          <button
            type="button"
            className={`cursor-pointer inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-bold transition-all active:scale-95 ${
              serviceType === 'Takeaway'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
            onClick={() => setServiceType('Takeaway')}
          >
            <span>🛍️</span>
            <span className="hidden xs:inline sm:inline">Takeaway</span>
          </button>

          <button
            type="button"
            className={`cursor-pointer inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-bold transition-all active:scale-95 ${
              serviceType === 'Dine in'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
            onClick={() => setServiceType('Dine in')}
          >
            <span>🍽️</span>
            <span className="hidden xs:inline sm:inline">Dine In</span>
          </button>

          {serviceType === 'Dine in' && (
            <div className="ml-0.5 sm:ml-1 flex items-center gap-1 border-l border-slate-300 pl-1.5 sm:pl-2 text-xs font-bold text-slate-700">
              <span className="hidden sm:inline">Table:</span>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="cursor-pointer rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
              >
                {[...Array(12).keys()].map((i) => (
                  <option key={i + 1} value={`T-${i + 1}`}>
                    T-{i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Header Actions & Status */}
      <div className="flex items-center gap-2">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <span className="text-[11px] text-slate-400">🕒</span>
          <span>{formattedTime}</span>
        </div>

        {/* Order History / Reprint KOT */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          title="View recent orders and reprint KOT receipts"
        >
          <span>📋</span>
          <span className="hidden sm:inline">Past Orders</span>
          {orderHistoryCount > 0 && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-black text-slate-700">
              {orderHistoryCount}
            </span>
          )}
        </button>

        {/* Admin Login / Session Controls */}
        {isAdminLoggedIn ? (
          <div className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-blue-200 bg-blue-50/60 p-1">
            <span
              className="hidden xl:inline-flex max-w-[120px] items-center gap-1 truncate rounded-lg bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-800"
              title={adminUser?.email || 'Admin'}
            >
              👤 <span className="truncate">{adminUser?.email || 'Admin'}</span>
            </span>
            <button
              type="button"
              className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 sm:px-3 py-1 text-xs font-bold text-white shadow-2xs transition-all hover:bg-blue-700 active:scale-95"
              onClick={onOpenAdminDashboard}
              title="Open Admin Dashboard"
            >
              <span>📊</span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-red-100 px-2 sm:px-2.5 py-1 text-xs font-bold text-red-700 transition-all hover:bg-red-200 active:scale-95"
              onClick={onAdminLogout}
              title="Logout of Admin"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-400 hover:text-slate-900 active:scale-95"
            onClick={onOpenAdminLogin}
            title="Sign in as Administrator"
          >
            <span>🔒</span>
            <span className="hidden sm:inline">Admin Login</span>
            <span className="sm:hidden">Admin</span>
          </button>
        )}

        {/* Backend Connectivity Status Dot */}
        <div
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 pl-0.5"
          title={`Backend: ${backendStatus}`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] hidden lg:inline">{backendStatus}</span>
        </div>
      </div>
    </header>
  );
}
