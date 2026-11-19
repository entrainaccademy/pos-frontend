import { useState, useEffect, useCallback, useMemo } from 'react';
import POSHeader from './components/POSHeader';
import BillManagerBar from './components/BillManagerBar';
import ProductCatalog from './components/ProductCatalog';
import OrderSummary from './components/OrderSummary';
import KOTModal from './components/KOTModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import AdminLoginModal from './components/AdminLoginModal';
import AddProductModal from './components/AddProductModal';
import MergeBillsModal from './components/MergeBillsModal';
import AdminDashboard from './components/AdminDashboard';
import { sampleProducts } from './data/sampleProducts';
import {
  checkBackendHealth,
  fetchProducts,
  createOrder,
  fetchSavedOrders,
} from './services/api';
import './App.css';

export default function App() {
  // --- Admin Authentication State ---
  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('laban_admin_token') || null;
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const user = localStorage.getItem('laban_admin_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // View Mode: 'pos' (Cashier Food Ordering & Multi-bill) or 'admin' (Admin Dashboard & Management)
  const [viewMode, setViewMode] = useState('pos');
  // Mobile / Tablet navigation tab: 'catalog' | 'order'
  const [mobileTab, setMobileTab] = useState('catalog');

  // --- Open Bills State (Hold, Switch, Merge) ---
  const [openBills, setOpenBills] = useState(() => {
    return [
      {
        id: 'bill_1',
        title: 'Bill #1',
        serviceType: 'Takeaway',
        tableNumber: 'T-1',
        cartItems: [],
        isHeld: false,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [activeBillId, setActiveBillId] = useState('bill_1');
  const [showMergeModal, setShowMergeModal] = useState(false);

  // Current active bill object
  const activeBill = useMemo(() => {
    return openBills.find((b) => b.id === activeBillId) || openBills[0];
  }, [openBills, activeBillId]);

  // Derived active cart metrics for mobile sticky bar and badge
  const activeCartItems = useMemo(() => activeBill?.cartItems || [], [activeBill]);
  const activeItemCount = useMemo(
    () => activeCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [activeCartItems]
  );
  const activeCartTotal = useMemo(() => {
    const sub = activeCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return Math.round(sub * 1.05);
  }, [activeCartItems]);

  // Catalog Products
  const [products, setProducts] = useState(sampleProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [catalogError, setCatalogError] = useState(null);

  // Order Submission State & Errors
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Modals & History
  const [orderHistory, setOrderHistory] = useState([]);
  const [activeKOTOrder, setActiveKOTOrder] = useState(null);
  const [isReprintMode, setIsReprintMode] = useState(false);
  const [autoPrintTrigger, setAutoPrintTrigger] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Backend Health check status
  const [backendStatus, setBackendStatus] = useState('Checking...');

  // 1. Check Backend Health
  const verifyHealth = useCallback(async () => {
    try {
      const data = await checkBackendHealth();
      if (data.status === 'ok') {
        const dbStatus =
          data.database === 'connected' ? 'Connected' : 'Online (Memory Mode)';
        setBackendStatus(dbStatus);
        return true;
      }
      setBackendStatus('Degraded');
      return false;
    } catch {
      setBackendStatus('Offline (Demo)');
      return false;
    }
  }, []);

  // 2. Load Products from MongoDB
  const loadBackendProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setCatalogError(null);
    try {
      const liveProducts = await fetchProducts();
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      } else {
        setProducts(sampleProducts);
      }
    } catch (err) {
      console.warn('Could not load products from backend API, using local fallback:', err);
      setCatalogError('Using offline sample menu. Backend catalog unreachable.');
      setProducts(sampleProducts);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // 3. Load Saved Orders from Backend
  const loadSavedOrders = useCallback(async () => {
    try {
      const savedOrders = await fetchSavedOrders();
      if (savedOrders) {
        setOrderHistory(savedOrders);
      }
    } catch (err) {
      console.warn('Could not load saved orders from backend:', err);
      try {
        const local = localStorage.getItem('laban_pos_orders');
        if (local) setOrderHistory(JSON.parse(local));
      } catch {
        // ignore
      }
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const initialize = async () => {
      await verifyHealth();
      await loadBackendProducts();
      await loadSavedOrders();
    };
    initialize();
  }, [verifyHealth, loadBackendProducts, loadSavedOrders]);

  // Admin Auth Handlers
  const handleAdminLoginSuccess = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('laban_admin_token', token);
    localStorage.setItem('laban_admin_user', JSON.stringify(user));
    // Immediately open Admin Dashboard after login
    setViewMode('admin');
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('laban_admin_token');
    localStorage.removeItem('laban_admin_user');
    setViewMode('pos');
  };

  const handleProductCreated = (newProduct) => {
    // If product is created, make it appear in the catalog immediately
    setProducts((prev) => {
      const exists = prev.some((p) => p.name.toLowerCase() === newProduct.name.toLowerCase());
      if (exists) {
        return prev.map((p) => (p.name.toLowerCase() === newProduct.name.toLowerCase() ? newProduct : p));
      }
      return [newProduct, ...prev];
    });
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === updatedProduct.id || p._id === updatedProduct.id || p.name.toLowerCase() === updatedProduct.name.toLowerCase()
          ? { ...p, ...updatedProduct, id: updatedProduct.id || updatedProduct._id }
          : p
      )
    );
  };

  // --- Bill Manager Handlers (Hold, Switch, New, Merge) ---
  const updateActiveBill = useCallback((updater) => {
    setOpenBills((prevBills) =>
      prevBills.map((b) => (b.id === activeBillId ? updater(b) : b))
    );
  }, [activeBillId]);

  const handleHoldCurrentBill = () => {
    if (!activeBill) return;

    const willBeHeld = !activeBill.isHeld;
    updateActiveBill((bill) => ({
      ...bill,
      isHeld: willBeHeld,
      title: bill.title.replace(' [HELD]', '') + (willBeHeld ? ' [HELD]' : ''),
    }));

    // If holding the current bill, switch to an unheld open bill or create a new one
    if (willBeHeld) {
      const otherUnheldBill = openBills.find(
        (b) => b.id !== activeBill.id && !b.isHeld
      );
      if (otherUnheldBill) {
        setActiveBillId(otherUnheldBill.id);
      } else {
        handleNewBill();
      }
    }
  };

  const handleNewBill = () => {
    const newId = `bill_${Date.now()}`;
    const seq = openBills.length + 1;
    const newBill = {
      id: newId,
      title: `Bill #${seq}`,
      serviceType: 'Takeaway',
      tableNumber: 'T-1',
      cartItems: [],
      isHeld: false,
      createdAt: new Date().toISOString(),
    };

    setOpenBills((prev) => [...prev, newBill]);
    setActiveBillId(newId);
  };

  const handleSwitchBill = (billId) => {
    setActiveBillId(billId);
    setOrderError(null);
  };

  const handleCloseBill = (billId) => {
    const billToClose = openBills.find((b) => b.id === billId);
    if (!billToClose) return;

    if ((billToClose.cartItems || []).length > 0) {
      if (!window.confirm(`Discard ${billToClose.title} with ${(billToClose.cartItems || []).length} items?`)) {
        return;
      }
    }

    if (openBills.length === 1) {
      // Just clear items if it's the last bill
      updateActiveBill((b) => ({ ...b, cartItems: [], isHeld: false }));
      return;
    }

    const remaining = openBills.filter((b) => b.id !== billId);
    setOpenBills(remaining);
    if (activeBillId === billId) {
      setActiveBillId(remaining[0].id);
    }
  };

  const handleMergeBills = ({
    sourceBillId,
    targetBillId,
    resultingServiceType,
    resultingTableNumber,
  }) => {
    const target = openBills.find((b) => b.id === targetBillId);
    const source = openBills.find((b) => b.id === sourceBillId);

    if (!target || !source) return;

    // Combine matching products by adding their quantities
    const combinedMap = new Map();

    (target.cartItems || []).forEach((item) => {
      combinedMap.set(item.name, { ...item });
    });

    (source.cartItems || []).forEach((item) => {
      if (combinedMap.has(item.name)) {
        const existing = combinedMap.get(item.name);
        existing.quantity += item.quantity;
        existing.total = existing.price * existing.quantity;
      } else {
        combinedMap.set(item.name, { ...item });
      }
    });

    const combinedItems = Array.from(combinedMap.values());

    setOpenBills((prev) => {
      // Update target bill with combined items and resulting order type
      const updatedTarget = {
        ...target,
        serviceType: resultingServiceType,
        tableNumber: resultingServiceType === 'Dine in' ? resultingTableNumber : null,
        cartItems: combinedItems,
        isHeld: false,
        title: `${target.title} (Merged)`,
      };

      // Remove source bill and update target
      return prev
        .filter((b) => b.id !== sourceBillId)
        .map((b) => (b.id === targetBillId ? updatedTarget : b));
    });

    setActiveBillId(targetBillId);
  };

  // Cart operations on Active Bill
  const handleAddToCart = (product) => {
    updateActiveBill((bill) => {
      const existing = (bill.cartItems || []).find((item) => item.id === product.id);
      let updatedCart;
      if (existing) {
        updatedCart = bill.cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: item.price * (item.quantity + 1) }
            : item
        );
      } else {
        updatedCart = [...(bill.cartItems || []), { ...product, quantity: 1, total: product.price }];
      }
      return { ...bill, cartItems: updatedCart };
    });
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    updateActiveBill((bill) => ({
      ...bill,
      cartItems: bill.cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: newQty, total: item.price * newQty }
          : item
      ),
    }));
  };

  const handleRemoveItem = (id) => {
    updateActiveBill((bill) => ({
      ...bill,
      cartItems: bill.cartItems.filter((item) => item.id !== id),
    }));
  };

  const handleClearCart = () => {
    if ((activeBill?.cartItems || []).length === 0) return;
    if (window.confirm('Clear all items from this order?')) {
      updateActiveBill((bill) => ({ ...bill, cartItems: [] }));
      setOrderError(null);
    }
  };

  // 4. Confirm Payment and Send Order to Backend
  const handleConfirmOrder = async (orderPayload) => {
    setIsSubmittingOrder(true);
    setOrderError(null);

    try {
      // Send order to backend API
      const savedOrder = await createOrder(orderPayload);

      // ONLY after backend successfully saves the order:
      // - Update order history
      setOrderHistory((prev) => [savedOrder, ...prev]);

      // - Show order number on KOT modal and trigger browser print dialog
      setActiveKOTOrder(savedOrder);
      setIsReprintMode(false);
      setAutoPrintTrigger(true);

      // - If multiple bills open, close the paid bill; otherwise reset active bill
      if (openBills.length > 1) {
        const remaining = openBills.filter((b) => b.id !== activeBillId);
        setOpenBills(remaining);
        setActiveBillId(remaining[0].id);
      } else {
        updateActiveBill((b) => ({ ...b, cartItems: [], isHeld: false }));
      }
      setMobileTab('catalog');
    } catch (err) {
      console.error('Order creation error:', err);
      // DO NOT mark order as paid if backend saving fails
      setOrderError(
        err.message || 'Could not save order to backend database. Please check connection and retry.'
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // 5. Reprint KOT Action
  const handleSelectOrderToReprint = (order) => {
    setActiveKOTOrder(order);
    setIsReprintMode(true);
    setAutoPrintTrigger(false);
    setShowHistoryModal(false);
  };

  const handleOpenHistoryModal = () => {
    loadSavedOrders();
    setShowHistoryModal(true);
  };

  // Render Admin Dashboard View if active
  if (viewMode === 'admin' && adminToken) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-100">
        <AdminDashboard
          adminUser={adminUser}
          token={adminToken}
          products={products}
          onProductCreated={handleProductCreated}
          onProductUpdated={handleProductUpdated}
          onSwitchToPOS={() => setViewMode('pos')}
          onLogout={handleAdminLogout}
          onReprintOrder={(order) => {
            setActiveKOTOrder(order);
            setIsReprintMode(true);
            setAutoPrintTrigger(false);
          }}
        />

        {/* Printable KOT Modal for orders viewed in Admin Orders */}
        {activeKOTOrder && (
          <KOTModal
            order={activeKOTOrder}
            isReprint={isReprintMode}
            autoPrint={autoPrintTrigger}
            onClose={() => {
              setActiveKOTOrder(null);
              setAutoPrintTrigger(false);
            }}
            onNewOrder={() => {
              setActiveKOTOrder(null);
              setAutoPrintTrigger(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Header with Admin Login link, order type toggle, live clock, recent orders, and backend status */}
      <POSHeader
        serviceType={activeBill?.serviceType || 'Takeaway'}
        setServiceType={(type) => updateActiveBill((b) => ({ ...b, serviceType: type }))}
        tableNumber={activeBill?.tableNumber || 'T-1'}
        setTableNumber={(tbl) => updateActiveBill((b) => ({ ...b, tableNumber: tbl }))}
        orderHistoryCount={orderHistory.length}
        onOpenHistory={handleOpenHistoryModal}
        backendStatus={backendStatus}
        isAdminLoggedIn={!!adminToken}
        adminUser={adminUser}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onOpenAdminDashboard={() => setViewMode('admin')}
        onAdminLogout={handleAdminLogout}
      />

      {/* Bill Manager Bar (Hold, Switch, New, Merge Open Bills) */}
      <BillManagerBar
        openBills={openBills}
        activeBillId={activeBillId}
        onSwitchBill={handleSwitchBill}
        onHoldCurrentBill={handleHoldCurrentBill}
        onNewBill={handleNewBill}
        onCloseBill={handleCloseBill}
        onOpenMergeModal={() => setShowMergeModal(true)}
      />

      {/* Mobile / Tablet Segmented Tab Switcher (Visible only on < lg screens) */}
      <div className="mx-auto w-full max-w-[1600px] px-3 pt-3 lg:hidden">
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-200/60 p-1">
          <button
            type="button"
            onClick={() => setMobileTab('catalog')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              mobileTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🍽️ Menu Catalog
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('order')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
              mobileTab === 'order'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🧾 Current Order</span>
            {activeItemCount > 0 && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-black text-white">
                {activeItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Cashier Workspace */}
      <main className="mx-auto w-full max-w-[1600px] flex-1 p-3 sm:p-5 lg:grid lg:grid-cols-[1fr_420px] lg:gap-5 pb-24 lg:pb-5">
        {/* Left: Product Catalog (Visible on desktop OR if mobileTab is 'catalog') */}
        <div className={mobileTab === 'catalog' ? 'block' : 'hidden lg:block'}>
          <ProductCatalog
            products={products}
            cartItems={activeCartItems}
            onAddToCart={handleAddToCart}
            isLoading={isLoadingProducts}
            loadError={catalogError}
            onRetryLoad={loadBackendProducts}
          />
        </div>

        {/* Right: Order Summary & Checkout (Visible on desktop OR if mobileTab is 'order') */}
        <div className={mobileTab === 'order' ? 'block' : 'hidden lg:block'}>
          <OrderSummary
            cartItems={activeCartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            serviceType={activeBill?.serviceType || 'Takeaway'}
            tableNumber={activeBill?.tableNumber || 'T-1'}
            onConfirmOrder={handleConfirmOrder}
            isSubmittingOrder={isSubmittingOrder}
            orderError={orderError}
            onClearError={() => setOrderError(null)}
            onBackToMenu={() => setMobileTab('catalog')}
          />
        </div>
      </main>

      {/* Floating Bottom Cart Bar on Mobile (when in catalog tab with items in cart) */}
      {mobileTab === 'catalog' && activeItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white p-3 shadow-lg lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab('order')}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-white shadow-md active:scale-98"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-xs font-black">
                {activeItemCount}
              </span>
              <span className="text-xs font-bold">Review Current Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">₹{activeCartTotal}</span>
              <span className="text-xs font-bold">Pay &rarr;</span>
            </div>
          </button>
        </div>
      )}

      {/* Printable KOT Modal */}
      {activeKOTOrder && (
        <KOTModal
          order={activeKOTOrder}
          isReprint={isReprintMode}
          autoPrint={autoPrintTrigger}
          onClose={() => {
            setActiveKOTOrder(null);
            setAutoPrintTrigger(false);
          }}
          onNewOrder={() => {
            setActiveKOTOrder(null);
            setAutoPrintTrigger(false);
            setOrderError(null);
          }}
        />
      )}

      {/* Recent Orders / Reprint History Modal */}
      {showHistoryModal && (
        <OrderHistoryModal
          orders={orderHistory}
          onSelectOrderToReprint={handleSelectOrderToReprint}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Add Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        token={adminToken}
        onProductCreated={handleProductCreated}
      />

      {/* Merge Open Bills Modal */}
      <MergeBillsModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        openBills={openBills}
        activeBillId={activeBillId}
        onConfirmMerge={handleMergeBills}
      />
    </div>
  );
}
