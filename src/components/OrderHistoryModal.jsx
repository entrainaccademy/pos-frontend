export default function OrderHistoryModal({
  orders,
  onSelectOrderToReprint,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Recent Orders &amp; Reprint KOT
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                Audit past counter orders and reprint thermal kitchen tickets
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cursor-pointer text-sm text-slate-400 hover:text-slate-700"
            onClick={onClose}
            title="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <span className="mb-2 block text-4xl">📭</span>
              <p className="text-sm font-bold text-slate-700">No completed orders yet</p>
              <p className="mt-1 text-xs">
                Complete an order on the POS counter to generate and reprint KOT tickets here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-3.5 py-3">Order #</th>
                    <th className="px-3.5 py-3">Pickup Token</th>
                    <th className="px-3.5 py-3">Type</th>
                    <th className="px-3.5 py-3">Time</th>
                    <th className="px-3.5 py-3">Items</th>
                    <th className="px-3.5 py-3 text-right">Total</th>
                    <th className="px-3.5 py-3">Payment</th>
                    <th className="px-3.5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => {
                    const timeStr = new Date(
                      ord.createdAt || Date.now()
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const itemCount = (ord.items || []).reduce(
                      (sum, it) => sum + (it.quantity || 1),
                      0
                    );

                    return (
                      <tr key={ord.id || ord._id} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-3.5 py-3 font-black text-blue-700">
                          {ord.orderNumber}
                        </td>
                        <td className="px-3.5 py-3 font-bold text-slate-700">
                          {ord.pickupToken}
                        </td>
                        <td className="px-3.5 py-3">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
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
                        <td className="px-3.5 py-3 text-slate-500 font-medium">{timeStr}</td>
                        <td className="px-3.5 py-3 text-slate-600 font-medium">
                          {itemCount} items
                        </td>
                        <td className="px-3.5 py-3 text-right font-black text-slate-900">
                          ₹{ord.total}
                        </td>
                        <td className="px-3.5 py-3 font-bold text-slate-700">
                          {ord.paymentMethod}
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <button
                            type="button"
                            className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                            onClick={() => onSelectOrderToReprint(ord)}
                          >
                            <span>🖨️</span>
                            <span>Reprint KOT</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
