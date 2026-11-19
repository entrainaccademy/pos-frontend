export default function BillManagerBar({
  openBills,
  activeBillId,
  onSwitchBill,
  onHoldCurrentBill,
  onNewBill,
  onCloseBill,
  onOpenMergeModal,
}) {
  const activeBill = openBills.find((b) => b.id === activeBillId) || openBills[0];
  const canMerge = openBills.length >= 2;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-200 bg-slate-50/90 px-3 sm:px-5 py-2">
      {/* Scrollable Bill Tabs */}
      <div className="flex min-w-0 w-full sm:w-auto sm:flex-1 items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Bills:
        </span>
        <div className="flex items-center gap-2">
          {openBills.map((bill, index) => {
            const isActive = bill.id === activeBillId;
            const itemCount = (bill.cartItems || []).reduce(
              (sum, item) => sum + (item.quantity || 1),
              0
            );
            const billTotal = Math.round(
              (bill.cartItems || []).reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              ) * 1.05
            );

            return (
              <div
                key={bill.id}
                onClick={() => onSwitchBill(bill.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSwitchBill(bill.id);
                  }
                }}
                className={`group flex cursor-pointer select-none items-center gap-2 rounded-xl border px-3 py-1.5 text-xs whitespace-nowrap transition-all active:scale-95 ${
                  isActive
                    ? 'border-blue-600 bg-white font-bold text-slate-900 shadow-xs ring-1 ring-blue-600'
                    : bill.isHeld
                    ? 'border-dashed border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{bill.serviceType === 'Takeaway' ? '🛍️' : '🍽️'}</span>
                  <span>{bill.title || `Bill #${index + 1}`}</span>
                  {bill.isHeld && (
                    <span className="rounded bg-amber-200 px-1 py-0.2 text-[9px] font-black text-amber-800">
                      HELD
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 text-[11px] text-slate-500">
                  <span>{itemCount} items</span>
                  {itemCount > 0 && (
                    <span className="font-bold text-slate-900">₹{billTotal}</span>
                  )}
                </div>

                {openBills.length > 1 && (
                  <button
                    type="button"
                    className="ml-1 rounded p-0.5 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseBill(bill.id);
                    }}
                    title="Close / Discard bill"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bill Controls: Hold, New Bill, Merge */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
        {/* Hold or Resume */}
        <button
          type="button"
          onClick={onHoldCurrentBill}
          className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
            activeBill?.isHeld
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
          title={
            activeBill?.isHeld
              ? 'Resume this held bill for payment'
              : 'Hold this unpaid bill without taking payment'
          }
        >
          <span>{activeBill?.isHeld ? '▶️' : '⏸️'}</span>
          <span>{activeBill?.isHeld ? 'Resume Bill' : 'Hold Bill'}</span>
        </button>

        {/* New Bill */}
        <button
          type="button"
          onClick={onNewBill}
          className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          title="Open another fresh unpaid bill"
        >
          <span>➕</span>
          <span>New Bill</span>
        </button>

        {/* Merge Bills */}
        <button
          type="button"
          disabled={!canMerge}
          onClick={onOpenMergeModal}
          className={`cursor-pointer inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
            canMerge
              ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'border-slate-200 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
          }`}
          title={canMerge ? 'Combine two open unpaid bills into one' : 'Requires at least 2 open bills to merge'}
        >
          <span>🔀</span>
          <span>Merge</span>
        </button>
      </div>
    </div>
  );
}
