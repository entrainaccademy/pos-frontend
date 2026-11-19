import { useState } from 'react';
import { toggleProductAvailability } from '../services/api';

export default function MenuManagement({
  products = [],
  token,
  onOpenAddProduct,
  onOpenEditProduct,
  onProductUpdated,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [togglingId, setTogglingId] = useState(null);

  const handleToggleStock = async (product) => {
    setTogglingId(product.id);
    try {
      const updated = await toggleProductAvailability(product.id, token);
      onProductUpdated(updated);
    } catch (err) {
      alert(err.message || 'Failed to toggle availability');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStock =
      stockFilter === 'All' ||
      (stockFilter === 'in_stock' && p.isAvailable) ||
      (stockFilter === 'out_of_stock' && !p.isAvailable);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const dessertCount = products.filter((p) => p.category === 'Dessert').length;
  const drinkCount = products.filter((p) => p.category === 'Drink').length;
  const inStockCount = products.filter((p) => p.isAvailable).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Menu &amp; Catalog Management</h2>
          <p className="text-xs font-medium text-slate-500">
            Add new recipes, modify prices, toggle stock availability, and update descriptions
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddProduct}
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95 w-full sm:w-auto"
        >
          <span>➕</span>
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Catalog Quick Stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Items</span>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{products.length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 sm:p-4 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wider">In Stock</span>
          <div className="mt-1 text-xl sm:text-2xl font-black text-emerald-800">{inStockCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 uppercase tracking-wider">Desserts</span>
          <div className="mt-1 text-xl sm:text-2xl font-black text-purple-700">{dessertCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wider">Beverages</span>
          <div className="mt-1 text-xl sm:text-2xl font-black text-blue-700">{drinkCount}</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:min-w-[240px] sm:flex-1">
          <span className="absolute left-3.5 top-2.5 text-xs text-slate-400">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items by title or description..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Category & Stock Filters Container */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="flex flex-1 sm:flex-none items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 overflow-x-auto">
            {['All', 'Dessert', 'Drink'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`flex-1 sm:flex-none whitespace-nowrap cursor-pointer rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat === 'All' ? 'All' : cat === 'Dessert' ? '🍰 Desserts' : '🥤 Drinks'}
              </button>
            ))}
          </div>

          {/* Stock Status Filter */}
          <div className="flex flex-1 sm:flex-none items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 overflow-x-auto">
            {[
              { id: 'All', label: 'All' },
              { id: 'in_stock', label: '✅ Stock' },
              { id: 'out_of_stock', label: '❌ Out' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStockFilter(item.id)}
                className={`flex-1 sm:flex-none whitespace-nowrap cursor-pointer rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all ${
                  stockFilter === item.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl">🔍</span>
            <p className="mt-2 text-sm font-bold text-slate-800">No items match the filters</p>
            <p className="text-xs text-slate-400">
              Try adjusting your query or category selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Highlight</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id || prod._id} className="transition-colors hover:bg-slate-50/80">
                    {/* Item */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl shadow-2xs">
                          {prod.icon || (prod.category === 'Drink' ? '🥤' : '🍰')}
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900">{prod.name}</div>
                          <div className="line-clamp-1 max-w-[280px] text-[11px] text-slate-400">
                            {prod.description || 'Artisanal store item.'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${
                          prod.category === 'Drink'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {prod.category === 'Drink' ? '🥤 Beverage' : '🍰 Dessert'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₹{prod.price}
                    </td>

                    {/* Stock Status with 1-click toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        disabled={togglingId === prod.id}
                        onClick={() => handleToggleStock(prod)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all active:scale-95 ${
                          prod.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title="Click to toggle availability on the cashier counter"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            prod.isAvailable ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span>{prod.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                      </button>
                    </td>

                    {/* Popular */}
                    <td className="py-3.5 px-4">
                      {prod.popular ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                          ⭐ Bestseller
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Standard</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenEditProduct(prod)}
                        className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                      >
                        <span>✏️</span>
                        <span>Edit Item</span>
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
