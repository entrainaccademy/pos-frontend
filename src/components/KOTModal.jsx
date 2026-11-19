import { useEffect } from 'react';

export default function KOTModal({
  order,
  isReprint = false,
  autoPrint = false,
  onClose,
  onNewOrder,
}) {
  if (!order) return null;

  // Auto-open print dialog when order is freshly confirmed by backend
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.log('Print dialog triggered:', e);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handleManualPrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );

  const formattedTime = new Date(order.createdAt || Date.now()).toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }
  );

  const totalItemCount = (order.items || []).reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-sm max-h-[92vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Controls (Hidden in actual print) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 no-print">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs">
              ✓
            </span>
            <span>
              {isReprint ? 'Saved Order Ticket' : 'Order Confirmed & Saved'}
            </span>
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

        {/* Printable Kitchen Order Ticket (KOT) */}
        <div
          id="printable-kot"
          className="flex-1 overflow-y-auto bg-white p-5 font-mono text-xs text-black leading-tight"
        >
          {/* Reprint Banner */}
          {isReprint && (
            <div className="mb-3 border border-dashed border-red-500 bg-red-50 p-1.5 text-center text-[11px] font-bold text-red-700">
              *** DUPLICATE / REPRINT KOT ***
            </div>
          )}

          <div className="text-center">
            <h2 className="text-base font-black tracking-wider">THE LABAN WALA</h2>
            <div className="text-xs font-bold tracking-widest text-slate-700">
              KITCHEN ORDER TICKET
            </div>
            <div className="my-2 border-b border-dashed border-black" />
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between font-bold">
              <span>Order No:</span>
              <span className="text-xs font-black">{order.orderNumber}</span>
            </div>

            {/* Pickup token box */}
            <div className="my-1.5 rounded bg-black p-1 text-center text-white">
              <span className="block text-[9px] font-bold tracking-widest uppercase">
                PICKUP TOKEN
              </span>
              <span className="text-lg font-black tracking-wider">
                {order.pickupToken}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">Type:</span>
              <span className="font-black underline">
                {order.serviceType === 'Dine in'
                  ? `DINE IN (${order.tableNumber || 'Table 1'})`
                  : 'TAKEAWAY'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Date:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Time:</span>
              <span>{formattedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Payment:</span>
              <span>
                {order.paymentMethod} (₹{order.total}) - PAID
              </span>
            </div>
          </div>

          <div className="my-2 border-b border-black" />

          {/* Items Table */}
          <div>
            <div className="flex justify-between font-black text-[11px]">
              <span className="w-10">QTY</span>
              <span className="flex-1">ITEM DESCRIPTION</span>
            </div>
            <div className="my-1.5 border-b border-dashed border-black" />
            <div className="flex flex-col gap-1.5">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-start text-xs">
                  <span className="w-10 font-black">{item.quantity} x</span>
                  <div className="flex-1">
                    <span className="font-black text-black">{item.name}</span>
                    {item.category && (
                      <span className="ml-1 text-[10px] text-slate-500">
                        [{item.category}]
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.kitchenNotes && (
            <div className="mt-2.5 rounded border border-dashed border-black p-1.5 text-[11px]">
              <span className="block font-bold">Kitchen Notes:</span>
              <p>&ldquo;{order.kitchenNotes}&rdquo;</p>
            </div>
          )}

          <div className="my-2.5 border-b border-dashed border-black" />

          <div className="text-center text-[11px]">
            <div className="flex justify-between font-black">
              <span>TOTAL ITEMS:</span>
              <span>{totalItemCount}</span>
            </div>
            <p className="mt-2 text-[10px] tracking-wider text-slate-600">
              --- END OF TICKET ---
            </p>
          </div>
        </div>

        {/* Modal Actions (Hidden when printing) */}
        <div className="flex gap-2 border-t border-slate-200 bg-slate-50 p-3 no-print">
          <button
            type="button"
            className="flex-1 cursor-pointer rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-xs"
            onClick={handleManualPrint}
          >
            🖨️ Print Ticket
          </button>
          <button
            type="button"
            className="flex-1 cursor-pointer rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-700 active:scale-95 shadow-xs"
            onClick={onNewOrder || onClose}
          >
            ✨ Done / Next
          </button>
        </div>
      </div>
    </div>
  );
}
