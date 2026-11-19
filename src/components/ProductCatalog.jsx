import { useState, useMemo } from 'react';

export default function ProductCatalog({
  products,
  cartItems,
  onAddToCart,
  isLoading = false,
  loadError = null,
  onRetryLoad,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Count how many of each item is currently in the cart
  const itemCountsInCart = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      map[item.id] = (map[item.id] || 0) + item.quantity;
    }
    return map;
  }, [cartItems]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <section className="flex flex-col gap-4">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs">
        {/* Category Filter Pills (Smooth scrollable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'All', label: 'All Items', icon: '✨' },
            { id: 'Dessert', label: 'Desserts', icon: '🍰' },
            { id: 'Drink', label: 'Beverages', icon: '🥤' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex w-full sm:w-auto sm:min-w-[220px] sm:max-w-xs items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-600">
          <span className="text-xs text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search food or beverage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              className="cursor-pointer text-xs text-slate-400 hover:text-slate-700"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Catalog status / errors */}
      {loadError && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          <span>⚠️ {loadError}</span>
          {onRetryLoad && (
            <button
              type="button"
              onClick={onRetryLoad}
              className="cursor-pointer font-bold text-amber-900 underline hover:text-amber-700"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Loading catalog items...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-xs text-slate-500">
              <span className="text-3xl">🔍</span>
              <p className="mt-2 text-sm font-bold text-slate-800">
                No items matching &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                className="mt-3 cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const qtyInCart = itemCountsInCart[product.id] || 0;
              const isUnavailable = product.isAvailable === false;

              return (
                <div
                  key={product.id || product._id}
                  onClick={() => {
                    if (!isUnavailable) onAddToCart(product);
                  }}
                  role="button"
                  tabIndex={isUnavailable ? -1 : 0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isUnavailable) {
                      e.preventDefault();
                      onAddToCart(product);
                    }
                  }}
                  className={`group relative flex select-none flex-col justify-between rounded-2xl border bg-white p-4 shadow-xs transition-all ${
                    isUnavailable
                      ? 'cursor-not-allowed opacity-60 border-slate-200 bg-slate-50'
                      : qtyInCart > 0
                      ? 'cursor-pointer border-blue-500 bg-blue-50/20 shadow-sm ring-1 ring-blue-500'
                      : 'cursor-pointer border-slate-200 hover:border-blue-400 hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  {/* Badges: Popular / In-cart / Out-of-stock */}
                  <div className="flex items-center justify-between gap-1">
                    {product.popular && (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-800">
                        Popular
                      </span>
                    )}
                    {isUnavailable && (
                      <span className="rounded-md bg-red-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-700">
                        Out of Stock
                      </span>
                    )}
                    {qtyInCart > 0 && (
                      <span className="ml-auto rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-2xs">
                        {qtyInCart} in order
                      </span>
                    )}
                  </div>

                  {/* Icon representation */}
                  <div className="my-3 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl shadow-2xs transition-transform group-hover:scale-105">
                      {product.icon || (product.category === 'Drink' ? '🥤' : '🍰')}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      {product.category}
                    </span>
                    <h3 className="line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                      {product.description || 'Artisanal recipe handcrafted fresh daily.'}
                    </p>
                  </div>

                  {/* Card Footer: Price & Add button */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-base font-black text-slate-900">
                      ₹{product.price}
                    </span>
                    <button
                      type="button"
                      disabled={isUnavailable}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        isUnavailable
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : qtyInCart > 0
                          ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                          : 'border border-slate-200 bg-slate-50 text-slate-800 hover:bg-blue-600 hover:border-blue-600 hover:text-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUnavailable) onAddToCart(product);
                      }}
                    >
                      <span>+</span>
                      <span>{qtyInCart > 0 ? 'Add More' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
