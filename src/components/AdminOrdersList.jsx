import { useState, useEffect } from 'react';
import { fetchFilteredOrders } from '../services/api';

export default function AdminOrdersList({ onSelectOrderToReprint }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Filter states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedServiceType, setSelectedServiceType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchFilteredOrders({
        date: selectedDate || undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        serviceType: selectedServiceType !== 'All' ? selectedServiceType : undefined,
        search: searchQuery.trim() || undefined,
        limit: 150,
      });
      setOrders(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedDate, selectedStatus, selectedServiceType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleResetFilters = () => {
    setSelectedDate('');
    setSelectedStatus('All');
    setSelectedServiceType('All');
    setSearchQuery('');
  };

  const handleSetToday = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setSelectedDate(todayStr);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const totalFilteredSales = orders.reduce(
    (sum, ord) => sum + (Number(ord.total) || 0),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">All Orders &amp; Audit Log</h2>
          <p className="text-xs font-medium text-slate-500">
            View customer orders, filter by date and status, and reprint Kitchen Order Tickets (KOT)
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={isLoading}
          className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-50 w-full sm:w-auto"
        >
          <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:min-w-[260px] sm:flex-1">
            <span className="absolute left-3.5 top-2.5 text-xs text-slate-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order # (e.g. LBN-1001) or Token..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-16 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 cursor-pointer rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {/* Date Picker & Presets */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600"
            />
            <button
              type="button"
              onClick={handleSetToday}
              className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedDate === new Date().toISOString().slice(0, 10)
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleSetYesterday}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Yesterday
            </button>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-slate-500 text-[11px] sm:text-xs">Status:</span>
              <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5">
                {['All', 'CONFIRMED', 'PAID'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`cursor-pointer rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all ${
                      selectedStatus === st
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Type Filter */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-slate-500 text-[11px] sm:text-xs">Mode:</span>
              <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5">
                {['All', 'Takeaway', 'Dine in'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedServiceType(st)}
                    className={`cursor-pointer rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all ${
                      selectedServiceType === st
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'All' ? 'All' : st === 'Takeaway' ? '🛍️ Takeaway' : '🍽️ Dine In'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Filters & Summary */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4">
            <div className="text-[11px] font-medium text-slate-500">
              Found <strong className="text-slate-900">{orders.length}</strong> orders | Rev:{' '}
              <strong className="text-emerald-700 font-bold">₹{totalFilteredSales.toLocaleString('en-IN')}</strong>
            </div>

            {(selectedDate || selectedStatus !== 'All' || selectedServiceType !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="cursor-pointer font-bold text-red-600 hover:underline text-[11px]"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-500">Loading orders...</p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center text-xs text-red-600 font-bold">
            ⚠️ {errorMessage}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl">🧾</span>
            <p className="mt-2 text-sm font-bold text-slate-800">No orders match the selected filters</p>
            <p className="text-xs text-slate-400">
              Try picking another date or clearing your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Order # &amp; Token</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Dining Mode</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4 text-right">Total Bill</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id || ord._id} className="transition-colors hover:bg-slate-50/80">
                    {/* Order # and Token */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-blue-700">{ord.orderNumber}</div>
                      <div className="text-[11px] font-bold text-slate-700">{ord.pickupToken}</div>
                    </td>

                    {/* Date and Time */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {new Date(ord.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Dining Mode */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${
                          ord.serviceType === 'Dine in'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.serviceType === 'Dine in'
                          ? `🍽️ Dine In (${ord.tableNumber || 'Table'})`
                          : '🛍️ Takeaway'}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{ord.paymentMethod}</span>
                      {ord.paymentMethod === 'Cash' && ord.changeDue > 0 && (
                        <div className="text-[10px] text-slate-400">Change: ₹{ord.changeDue}</div>
                      )}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="max-w-[220px] truncate font-semibold text-slate-700">
                        {(ord.items || [])
                          .map((i) => `${i.quantity}x ${i.name}`)
                          .join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {(ord.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)} items total
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="text-sm font-black text-slate-900">₹{ord.total}</div>
                      {ord.discount > 0 && (
                        <div className="text-[10px] font-bold text-emerald-600">
                          -₹{ord.discount} off
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {ord.orderStatus || ord.paymentStatus || 'PAID'}
                      </span>
                    </td>

                    {/* Action: View Ticket / Reprint */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectOrderToReprint(ord)}
                        className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                        title="View and reprint KOT receipt"
                      >
                        <span>🧾</span>
                        <span>View / KOT</span>
                      </button>
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
