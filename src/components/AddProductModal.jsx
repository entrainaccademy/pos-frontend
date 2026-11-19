import { useState } from 'react';
import { createProduct } from '../services/api';

const EMOJI_OPTIONS = [
  '🍰', '🧇', '🧁', '🍨', '🍮', '🥮', '🍫', '🍩',
  '🥤', '🧋', '☕', '🍹', '🍵', '🧊', '🥭', '🍑',
];

export default function AddProductModal({ isOpen, onClose, token, onProductCreated }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dessert');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🍰');
  const [isAvailable, setIsAvailable] = useState(true);
  const [popular, setPopular] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const priceNum = parseFloat(price);
    if (!name.trim()) {
      setErrorMessage('Please enter a product name.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage('Please enter a valid non-negative price.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: name.trim(),
        category,
        price: priceNum,
        description: description.trim(),
        icon,
        isAvailable,
        popular,
      };

      const newProduct = await createProduct(payload, token);
      onProductCreated(newProduct);

      // Reset
      setName('');
      setPrice('');
      setDescription('');
      setCategory('Dessert');
      setIcon('🍰');
      setIsAvailable(true);
      setPopular(false);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl">
              {icon}
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Add New Food Item</h2>
              <p className="text-[11px] font-medium text-slate-500">Create a new dessert or beverage for the catalog</p>
            </div>
          </div>
          <button
            type="button"
            className="cursor-pointer text-sm text-slate-400 hover:text-slate-700"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Name & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="add-prod-name" className="text-xs font-bold text-slate-700">
                Item Name *
              </label>
              <input
                id="add-prod-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Belgian Chocolate Waffle"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="add-prod-category" className="text-xs font-bold text-slate-700">
                Category *
              </label>
              <select
                id="add-prod-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value === 'Drink' && icon === '🍰') setIcon('🥤');
                  if (e.target.value === 'Dessert' && icon === '🥤') setIcon('🍰');
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Dessert">🍰 Dessert</option>
                <option value="Drink">🥤 Beverage</option>
              </select>
            </div>
          </div>

          {/* Price & Icon */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="add-prod-price" className="text-xs font-bold text-slate-700">
                Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-400">₹</span>
                <input
                  id="add-prod-price"
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="180"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-700">Icon / Emoji</span>
              <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`h-7 w-7 rounded-lg text-sm transition-transform hover:scale-110 ${
                      icon === emoji
                        ? 'border border-blue-500 bg-blue-100 shadow-2xs'
                        : 'hover:bg-white'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-prod-desc" className="text-xs font-bold text-slate-700">
              Short Description (Optional)
            </label>
            <textarea
              id="add-prod-desc"
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crispy waffle served with warm dark chocolate sauce..."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-bold text-slate-700">
              <div className="flex flex-col">
                <span>In Stock</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {isAvailable ? 'Visible on cashier menu' : 'Hidden from cashier'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-bold text-slate-700">
              <div className="flex flex-col">
                <span>Highlight Bestseller</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {popular ? 'Show "Popular" badge' : 'Standard catalog'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding Item...' : 'Save to Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
