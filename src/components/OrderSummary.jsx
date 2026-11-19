import { useState } from 'react';

export default function OrderSummary({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  serviceType,
  tableNumber,
  onConfirmOrder,
  isSubmittingOrder = false,
  orderError = null,
  onClearError,
  onBackToMenu,
}) {
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cashTendered, setCashTendered] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (subtotal * (Number(discountValue) || 0)) / 100;
  } else {
    discountAmount = Number(discountValue) || 0;
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = 0.05;
  const taxAmount = taxableAmount * taxRate;
  const grandTotal = Math.round(taxableAmount + taxAmount);

  // Cash change calculation
  const tenderedNum = Number(cashTendered) || 0;
  const changeDue = tenderedNum >= grandTotal ? tenderedNum - grandTotal : 0;
  const isCashInsufficient =
    paymentMethod === 'Cash' &&
    cartItems.length > 0 &&
    tenderedNum > 0 &&
    tenderedNum < grandTotal;

  const handleApplyPresetDiscount = (percent) => {
    setDiscountType('percent');
    setDiscountValue(percent);
    if (onClearError) onClearError();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0 || isSubmittingOrder) return;
    if (onClearError) onClearError();

    onConfirmOrder({
      serviceType,
      tableNumber: serviceType === 'Dine in' ? tableNumber : null,
      items: cartItems.map((item) => ({
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      subtotal,
      discount: discountAmount,
      discountPercent: discountType === 'percent' ? Number(discountValue) : 0,
      tax: taxAmount,
      taxRate: 5,
      total: grandTotal,
      paymentMethod,
      cashTendered: paymentMethod === 'Cash' ? tenderedNum : null,
      changeDue: paymentMethod === 'Cash' ? changeDue : null,
      kitchenNotes: kitchenNotes.trim(),
    });
  };

  const totalItemCount = cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0);

  return (
    <aside className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs lg:sticky lg:top-[72px] lg:h-[calc(100vh-90px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-2.5">
          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="lg:hidden cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
              title="Return to Menu Catalog"
            >
              ←
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">Current Order</h2>
              {totalItemCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-black text-blue-800">
                  {totalItemCount} items
                </span>
              )}
            </div>
            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 mt-0.5">
              {serviceType === 'Takeaway' ? '🛍️ Takeaway' : `🍽️ Dine In (${tableNumber})`}
            </span>
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            className="cursor-pointer text-xs font-bold text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
            onClick={onClearCart}
            disabled={isSubmittingOrder}
            title="Clear all items in cart"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[420px] lg:max-h-none">
        {cartItems.length === 0 ? (
          <div className="flex h-full min-h-[160px] flex-col items-center justify-center py-12 text-center text-slate-400">
            <span className="text-4xl">🛒</span>
            <p className="mt-2 text-sm font-bold text-slate-700">Order is empty</p>
            <p className="text-xs text-slate-400">
              Tap any item in the menu catalog to add it to this bill.
            </p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:bg-slate-50"
            >
              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-slate-900">
                  {item.name}
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  ₹{item.price} each
                </div>
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-base font-black text-slate-600 hover:bg-slate-100 active:scale-95"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={isSubmittingOrder}
                  title="Decrease quantity"
                >
                  -
                </button>
                <span className="min-w-[24px] text-center text-xs font-black text-slate-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-base font-black text-slate-600 hover:bg-slate-100 active:scale-95"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={isSubmittingOrder}
                  title="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Total & Delete */}
              <div className="flex items-center gap-2">
                <div className="min-w-[48px] text-right text-xs font-black text-slate-900">
                  ₹{item.price * item.quantity}
                </div>
                <button
                  type="button"
                  className="cursor-pointer text-slate-400 hover:text-red-600"
                  onClick={() => onRemoveItem(item.id)}
                  disabled={isSubmittingOrder}
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Calculation & Payment Footer */}
      <div className="border-t border-slate-200 bg-slate-50/60 p-4 space-y-3">
        {/* Kitchen Notes Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Special kitchen notes (e.g. less sugar, extra hot)..."
            value={kitchenNotes}
            onChange={(e) => setKitchenNotes(e.target.value)}
            disabled={isSubmittingOrder}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-600"
          />
        </div>

        {/* Discount Selector */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-600">Discount:</span>
          <div className="flex items-center gap-1">
            {[0, 5, 10, 15].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleApplyPresetDiscount(pct)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  discountType === 'percent' && Number(discountValue) === pct
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pct === 0 ? 'None' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Subtotal, Tax, Total */}
        <div className="space-y-1.5 border-t border-slate-200 pt-2.5 text-xs">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Subtotal:</span>
            <span>₹{subtotal}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount ({discountType === 'percent' ? `${discountValue}%` : 'Flat'}):</span>
              <span>-₹{Math.round(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 font-medium">
            <span>GST (5%):</span>
            <span>₹{taxAmount.toFixed(1)}</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-black text-slate-900">
            <span>Total Payable:</span>
            <span className="text-xl text-blue-700">₹{grandTotal}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Payment Mode:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'UPI', label: 'UPI QR', icon: '📱' },
              { id: 'Cash', label: 'Cash', icon: '💵' },
              { id: 'Card', label: 'Card POS', icon: '💳' },
            ].map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id)}
                className={`cursor-pointer flex flex-col items-center justify-center rounded-xl border p-2 text-xs font-bold transition-all active:scale-95 ${
                  paymentMethod === pm.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{pm.icon}</span>
                <span>{pm.label}</span>
              </button>
            ))}
          </div>

          {/* Cash Details: Tendered & Change */}
          {paymentMethod === 'Cash' && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <label htmlFor="tender-input">Cash Tendered:</label>
                <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1">
                  <span className="text-slate-400 mr-1">₹</span>
                  <input
                    id="tender-input"
                    type="number"
                    min="0"
                    placeholder={String(grandTotal)}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-20 text-right font-black text-slate-900 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Fast presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCashTendered(String(grandTotal))}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                >
                  Exact (₹{grandTotal})
                </button>
                {[200, 500, 1000].map(
                  (amt) =>
                    grandTotal <= amt && (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashTendered(String(amt))}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                      >
                        ₹{amt}
                      </button>
                    )
                )}
              </div>

              {tenderedNum > 0 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold">
                  <span>Change Due:</span>
                  <span className={isCashInsufficient ? 'text-red-600' : 'text-emerald-600 text-sm font-black'}>
                    {isCashInsufficient ? `Short by ₹${grandTotal - tenderedNum}` : `₹${changeDue}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'UPI' && (
            <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs flex items-center justify-between">
              <span className="font-semibold text-slate-700">Counter QR Ready</span>
              <code className="rounded bg-slate-100 px-2 py-0.5 font-bold text-blue-700">
                labanpos@upi
              </code>
            </div>
          )}

          {paymentMethod === 'Card' && (
            <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs flex items-center justify-between">
              <span className="font-semibold text-slate-700">POS Terminal Ready</span>
              <span className="text-[11px] text-slate-500 font-medium">Tap / Chip / Swipe</span>
            </div>
          )}
        </div>

        {/* Error notification */}
        {orderError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
            <span className="font-bold">⚠️ {orderError}</span>
          </div>
        )}

        {/* Big Checkout & Print KOT Button */}
        <button
          type="button"
          disabled={cartItems.length === 0 || isCashInsufficient || isSubmittingOrder}
          onClick={handleCheckout}
          className="w-full cursor-pointer flex flex-col items-center justify-center rounded-xl bg-emerald-600 py-3 text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-98 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          <span className="text-sm font-black tracking-wide">
            {isSubmittingOrder ? 'Recording Order...' : 'Confirm Payment & Print KOT'}
          </span>
          <span className="text-xs opacity-90 font-medium">
            {cartItems.length === 0 ? 'Add items to begin' : `Total: ₹${grandTotal}`}
          </span>
        </button>
      </div>
    </aside>
  );
}
