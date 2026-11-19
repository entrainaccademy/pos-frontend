export default function AdminOverview({ stats, isLoading, onViewAllOrders, onRefresh }) {
  if (isLoading && !stats) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading business metrics...</p>
        </div>
      </div>
    );
  }

  const {
    totalSales = 0,
    totalOrders = 0,
    todaySales = 0,
    todayOrders = 0,
    averageOrderValue = 0,
    paymentStats = {
      UPI: { count: 0, total: 0 },
      Cash: { count: 0, total: 0 },
      Card: { count: 0, total: 0 },
    },
    serviceTypeStats = {
      Takeaway: { count: 0, total: 0 },
      'Dine in': { count: 0, total: 0 },
    },
    productsCount = 0,
    activeProductsCount = 0,
    recentOrders = [],
  } = stats || {};

  const totalPaymentRevenue =
    (paymentStats.UPI?.total || 0) +
    (paymentStats.Cash?.total || 0) +
    (paymentStats.Card?.total || 0);

  const getPercent = (amount) => {
    if (!totalPaymentRevenue || totalPaymentRevenue === 0) return 0;
    return Math.round((amount / totalPaymentRevenue) * 100);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Sales &amp; Business Overview</h2>
          <p className="text-xs font-medium text-slate-500">
            Real-time counter collections, order volume, and dining format breakdown
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-50 w-full sm:w-auto"
        >
          <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Sales</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
              ₹
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              ₹{Number(totalSales).toLocaleString('en-IN')}
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Lifetime counter revenue
            </p>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Today&apos;s Revenue</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-2xs">
              📅
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              ₹{Number(todaySales).toLocaleString('en-IN')}
            </div>
            <p className="mt-1 text-[11px] font-bold text-emerald-700">
              {todayOrders} orders logged today
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Volume</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-sm font-bold text-purple-700">
              🧾
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              {Number(totalOrders).toLocaleString('en-IN')}
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Confirmed customer bills
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. Order Value</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-sm font-bold text-amber-700">
              📊
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900">
              ₹{Number(averageOrderValue).toLocaleString('en-IN')}
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {activeProductsCount} of {productsCount} items in stock
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payment Channels Breakdown */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Payment Breakdown</h3>
            <span className="text-[11px] font-medium text-slate-400">Recorded at cashier counter</span>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {/* UPI */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-blue-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  UPI QR ({paymentStats.UPI?.count || 0} orders)
                </span>
                <span className="text-slate-900">
                  ₹{Number(paymentStats.UPI?.total || 0).toLocaleString('en-IN')}{' '}
                  <span className="text-slate-400 font-medium">({getPercent(paymentStats.UPI?.total || 0)}%)</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${getPercent(paymentStats.UPI?.total || 0)}%` }}
                />
              </div>
            </div>

            {/* Cash */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-emerald-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  Cash Received ({paymentStats.Cash?.count || 0} orders)
                </span>
                <span className="text-slate-900">
                  ₹{Number(paymentStats.Cash?.total || 0).toLocaleString('en-IN')}{' '}
                  <span className="text-slate-400 font-medium">({getPercent(paymentStats.Cash?.total || 0)}%)</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${getPercent(paymentStats.Cash?.total || 0)}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-purple-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                  Card POS ({paymentStats.Card?.count || 0} orders)
                </span>
                <span className="text-slate-900">
                  ₹{Number(paymentStats.Card?.total || 0).toLocaleString('en-IN')}{' '}
                  <span className="text-slate-400 font-medium">({getPercent(paymentStats.Card?.total || 0)}%)</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${getPercent(paymentStats.Card?.total || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dining Format Breakdown */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Dining Formats</h3>
            <span className="text-[11px] font-medium text-slate-400">Order service type</span>
          </div>

          <div className="mt-4 grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-2xl">🛍️</span>
              <span className="mt-2 text-xs font-extrabold text-slate-700">Takeaway Orders</span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {serviceTypeStats.Takeaway?.count || 0}
              </div>
              <span className="mt-1 text-[11px] font-medium text-slate-500">
                ₹{Number(serviceTypeStats.Takeaway?.total || 0).toLocaleString('en-IN')} revenue
              </span>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-2xl">🍽️</span>
              <span className="mt-2 text-xs font-extrabold text-slate-700">Dine In Orders</span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {serviceTypeStats['Dine in']?.count || 0}
              </div>
              <span className="mt-1 text-[11px] font-medium text-slate-500">
                ₹{Number(serviceTypeStats['Dine in']?.total || 0).toLocaleString('en-IN')} revenue
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Recent Customer Orders</h3>
            <p className="text-[11px] font-medium text-slate-500">Latest completed orders from the counter</p>
          </div>
          <button
            type="button"
            onClick={onViewAllOrders}
            className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            View All Orders &rarr;
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-xs font-medium text-slate-400">
            No customer orders recorded yet. Orders created at the POS counter will appear here.
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord._id || ord.id || ord.orderNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-blue-700">{ord.orderNumber}</td>
                    <td className="py-3 px-3 font-bold text-slate-700">{ord.pickupToken}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          ord.serviceType === 'Dine in'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {(ord.items || []).length} items
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">{ord.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      ₹{ord.total}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
