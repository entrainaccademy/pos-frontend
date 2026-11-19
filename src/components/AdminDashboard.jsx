import { useState, useEffect } from 'react';
import AdminOverview from './AdminOverview';
import MenuManagement from './MenuManagement';
import AdminOrdersList from './AdminOrdersList';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import { fetchAdminStats } from '../services/api';

export default function AdminDashboard({
  adminUser,
  token,
  products = [],
  onProductCreated,
  onProductUpdated,
  onSwitchToPOS,
  onLogout,
  onReprintOrder,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'menu' | 'orders'
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const loadStats = async () => {
    if (!token) return;
    setIsStatsLoading(true);
    try {
      const data = await fetchAdminStats(token);
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [token]);

  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleProductCreatedInternal = (newProd) => {
    onProductCreated(newProd);
    setIsAddModalOpen(false);
    loadStats();
  };

  const handleProductUpdatedInternal = (updatedProd) => {
    onProductUpdated(updatedProd);
    setIsEditModalOpen(false);
    setProductToEdit(null);
    loadStats();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-900">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-3 sm:px-5 py-2.5 sm:py-3 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 sm:gap-4">
          {/* Brand & Badge */}
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
              The Laban Wala
            </h1>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-800">
              Admin Portal
            </span>
          </div>

          {/* Right Controls: Switch to POS, Admin Info, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onSwitchToPOS}
              className="cursor-pointer inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-blue-700 shadow-2xs transition-all hover:bg-blue-100 hover:border-blue-300 active:scale-95"
              title="Return to the cashier customer ordering screen"
            >
              <span>🖥️</span>
              <span className="inline">POS</span>
            </button>

            <span
              className="hidden md:inline-flex max-w-[140px] items-center gap-1 truncate rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700"
              title={adminUser?.email || 'Admin'}
            >
              <span>👤</span>
              <span className="truncate">{adminUser?.email || 'Admin'}</span>
            </span>

            <button
              type="button"
              onClick={onLogout}
              className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-red-700 shadow-2xs transition-all hover:bg-red-100 active:scale-95"
              title="Sign out of Admin Portal"
            >
              <span>🚪</span>
              <span className="inline">Logout</span>
            </button>
          </div>

          {/* Navigation Tabs - Full width row on mobile, centered inline on lg */}
          <nav className="order-last lg:order-none w-full lg:w-auto flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex-1 lg:flex-none cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span>📊</span>
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex-1 lg:flex-none cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                activeTab === 'menu'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span>🍰</span>
              <span>Menu Management</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex-1 lg:flex-none cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span>📦</span>
              <span>All Orders</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Admin Tab Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 p-3.5 sm:p-5 lg:p-6">
        {activeTab === 'overview' && (
          <AdminOverview
            stats={stats}
            isLoading={isStatsLoading}
            onViewAllOrders={() => setActiveTab('orders')}
            onRefresh={loadStats}
          />
        )}

        {activeTab === 'menu' && (
          <MenuManagement
            products={products}
            token={token}
            onOpenAddProduct={() => setIsAddModalOpen(true)}
            onOpenEditProduct={handleOpenEdit}
            onProductUpdated={handleProductUpdatedInternal}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrdersList onSelectOrderToReprint={onReprintOrder} />
        )}
      </main>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        token={token}
        onProductCreated={handleProductCreatedInternal}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProductToEdit(null);
        }}
        product={productToEdit}
        token={token}
        onProductUpdated={handleProductUpdatedInternal}
      />
    </div>
  );
}
