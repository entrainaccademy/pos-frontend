import { useState, useMemo } from 'react';

export default function MergeBillsModal({
  isOpen,
  onClose,
  openBills,
  activeBillId,
  onConfirmMerge,
}) {
  if (!isOpen || openBills.length < 2) return null;

  // Defaults: active bill is target, first different bill is source
  const [targetId, setTargetId] = useState(
    openBills[0].id === activeBillId && openBills.length > 1
      ? openBills[0].id
      : openBills[1]?.id || openBills[0].id
  );

  const [sourceId, setSourceId] = useState(() => {
    const other = openBills.find((b) => b.id !== targetId);
    return other ? other.id : openBills[1]?.id;
  });

  const targetBill = openBills.find((b) => b.id === targetId) || openBills[0];
  const sourceBill = openBills.find((b) => b.id === sourceId) || openBills[1];

  const [resultingServiceType, setResultingServiceType] = useState(
    targetBill?.serviceType || 'Takeaway'
  );
  const [resultingTableNumber, setResultingTableNumber] = useState(
    targetBill?.tableNumber || 'T-1'
  );

  // Compute merged items preview by summing matching products
  const mergedPreview = useMemo(() => {
    if (!targetBill || !sourceBill || targetBill.id === sourceBill.id) return [];

    const map = new Map();

    (targetBill.cartItems || []).forEach((item) => {
      map.set(item.name, { ...item });
    });

    (sourceBill.cartItems || []).forEach((item) => {
      if (map.has(item.name)) {
        const existing = map.get(item.name);
        existing.quantity += item.quantity;
        existing.total = existing.price * existing.quantity;
      } else {
        map.set(item.name, { ...item });
      }
    });

    return Array.from(map.values());
  }, [targetBill, sourceBill]);

  const mergedSubtotal = mergedPreview.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
  const mergedTax = Math.round(mergedSubtotal * 0.05 * 100) / 100;
  const mergedTotal = Math.round(mergedSubtotal + mergedTax);

  const handleMergeSubmit = () => {
    if (sourceId === targetId) {
      alert('Please select two different open bills to merge.');
      return;
    }

    onConfirmMerge({
      sourceBillId: sourceId,
      targetBillId: targetId,
      resultingServiceType,
      resultingTableNumber:
        resultingServiceType === 'Dine in' ? resultingTableNumber : null,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔀</span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Merge Open Bills</h2>
              <p className="text-[11px] font-medium text-slate-500">Combine two unpaid tables or takeaway orders</p>
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

        {/* Modal Body */}
        <div className="flex flex-col gap-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Target */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="target-bill-select" className="text-xs font-bold text-slate-700">
                Destination Bill (Keep):
              </label>
              <select
                id="target-bill-select"
                value={targetId}
                onChange={(e) => {
                  const newTarget = e.target.value;
                  setTargetId(newTarget);
                  if (newTarget === sourceId) {
                    const other = openBills.find((b) => b.id !== newTarget);
                    if (other) setSourceId(other.id);
                  }
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
              >
                {openBills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({(b.cartItems || []).length} items)
                  </option>
                ))}
              </select>
            </div>

            {/* Source */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="source-bill-select" className="text-xs font-bold text-slate-700">
                Source Bill (To Absorb):
              </label>
              <select
                id="source-bill-select"
                value={sourceId}
                onChange={(e) => {
                  const newSource = e.target.value;
                  setSourceId(newSource);
                  if (newSource === targetId) {
                    const other = openBills.find((b) => b.id !== newSource);
                    if (other) setTargetId(other.id);
                  }
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
              >
                {openBills
                  .filter((b) => b.id !== targetId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({(b.cartItems || []).length} items)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Resulting Order Type Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-xs font-bold text-slate-700">
              Resulting Dining Mode:
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  resultingServiceType === 'Takeaway'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                onClick={() => setResultingServiceType('Takeaway')}
              >
                🛍️ Takeaway
              </button>
              <button
                type="button"
                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  resultingServiceType === 'Dine in'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                onClick={() => setResultingServiceType('Dine in')}
              >
                🍽️ Dine In
              </button>

              {resultingServiceType === 'Dine in' && (
                <div className="ml-1 flex items-center gap-1 border-l border-slate-300 pl-2 text-xs font-bold text-slate-700">
                  <span>Table:</span>
                  <select
                    id="merge-table-select"
                    value={resultingTableNumber}
                    onChange={(e) => setResultingTableNumber(e.target.value)}
                    className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold outline-none"
                  >
                    {[...Array(12).keys()].map((i) => (
                      <option key={i + 1} value={`T-${i + 1}`}>
                        Table {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Merged Items Preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Preview Combined Items ({mergedPreview.length} unique items):
            </h4>
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto border-b border-dashed border-slate-200 pb-3 mb-3">
              {mergedPreview.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">
                    {item.icon || '🍰'} {item.name}
                  </span>
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                    x {item.quantity}
                  </span>
                  <span className="font-black text-slate-900">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Estimated Merged Total (incl. 5% GST):</span>
              <strong className="text-lg font-black text-blue-700">₹{mergedTotal}</strong>
            </div>
          </div>

          {/* Warning confirmation note */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <span>
              ⚠️ <strong>Note:</strong> Merging combines matching item quantities into &ldquo;{targetBill?.title}&rdquo; and closes &ldquo;{sourceBill?.title}&rdquo;.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95"
            onClick={handleMergeSubmit}
          >
            🔀 Confirm &amp; Merge
          </button>
        </div>
      </div>
    </div>
  );
}
