import { useState, useEffect, useCallback } from 'react';
import { fetchHealth, HealthResponse } from './api/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProductCard } from './components/products/ProductCard';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { AddProductModal } from './components/admin/AddProductModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderHistoryModal } from './components/orders/OrderHistoryModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { AiChatDrawer } from './components/ai/AiChatDrawer';
import { fetchAiSemanticSearch } from './api/ai';
import { Category, Product } from './types/product';
import { Order } from './types/order';
import { 
  fetchCategories, 
  fetchProducts, 
  updateAdminStock, 
  deleteAdminProduct, 
  ProductQueryParams 
} from './api/products';
import { 
  Server, 
  RefreshCw, 
  ShoppingBag, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  Search, 
  Plus, 
  SlidersHorizontal,
  PackageOpen,
  Filter,
  ReceiptText,
  CheckCircle2,
  LayoutDashboard
} from 'lucide-react';

function DashboardContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, addItem } = useCart();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  // System Health state
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [showHealthCard, setShowHealthCard] = useState<boolean>(false);

  // Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Product Catalog state
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Admin Add Product Modal
  const [addProductModalOpen, setAddProductModalOpen] = useState<boolean>(false);

  // Cart & Checkout & Order Modals
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState<boolean>(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState<boolean>(false);
  const [aiChatDrawerOpen, setAiChatDrawerOpen] = useState<boolean>(false);
  const [aiSearchEnabled, setAiSearchEnabled] = useState<boolean>(false);
  const [semanticMatches, setSemanticMatches] = useState<Record<number, string>>({});
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Check backend health
  const checkStatus = async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  // Load Categories
  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  // Load Products
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      if (aiSearchEnabled && searchQuery.trim()) {
        const aiRes = await fetchAiSemanticSearch(searchQuery.trim(), 24);
        const productsList = aiRes.results.map((r) => r.product);
        const matchMap: Record<number, string> = {};
        aiRes.results.forEach((r) => {
          matchMap[r.product.id] = `${Math.round(r.relevanceScore * 100)}% match • ${r.matchReason}`;
        });
        setSemanticMatches(matchMap);
        setProducts(productsList);
      } else {
        setSemanticMatches({});
        const params: ProductQueryParams = {
          page: 0,
          size: 24,
          sortBy,
          sortDir,
        };
        if (selectedCategory) params.categoryId = selectedCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (inStockOnly) params.inStockOnly = true;

        const data = await fetchProducts(params);
        setProducts(data.content);
      }
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedCategory, searchQuery, inStockOnly, sortBy, sortDir, aiSearchEnabled]);

  useEffect(() => {
    checkStatus();
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleUpdateStock = async (productId: number, newStock: number) => {
    try {
      await updateAdminStock(productId, newStock);
      loadProducts();
    } catch (e) {
      alert('Failed to update stock: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteAdminProduct(productId);
      loadProducts();
    } catch (e) {
      alert('Failed to delete product: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    try {
      await addItem(product.id, 1);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to add item to cart');
    }
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCheckoutModalOpen(false);
    setLastPlacedOrder(order);
    loadProducts(); // refresh remaining stock
  };

  const cartCount = cart?.totalItems || 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                ShopSphere
              </span>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center space-x-3">
            {/* Admin Diagnostics Toggle */}
            {isAdmin && (
              <button
                onClick={() => setShowHealthCard(!showHealthCard)}
                title="System Diagnostics"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700 hidden sm:flex items-center space-x-1.5 text-xs font-mono"
              >
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Diagnostics</span>
              </button>
            )}

            {/* My Orders Button */}
            {isAuthenticated && (
              <button
                onClick={() => setOrdersModalOpen(true)}
                title="Order History"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center space-x-1 text-xs cursor-pointer"
              >
                <ReceiptText className="w-4 h-4 text-indigo-400" />
                <span className="hidden md:inline">Orders</span>
              </button>
            )}

            {/* Admin Console Button */}
            {isAdmin && (
              <button
                onClick={() => setAdminDashboardOpen(true)}
                title="Admin Control Center"
                className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center space-x-1.5 text-xs font-semibold cursor-pointer shadow-md transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Admin Console</span>
              </button>
            )}

            {/* Cart Button */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuth('login');
                  } else {
                    setCartDrawerOpen(true);
                  }
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center cursor-pointer"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-[11px] font-bold text-white flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Auth Controls */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                    {user.firstName.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-white leading-tight">
                      {user.firstName}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center">
                      {isAdmin ? (
                        <span className="text-purple-400 font-semibold flex items-center">
                          <Shield className="w-2.5 h-2.5 mr-0.5" /> ADMIN
                        </span>
                      ) : (
                        <span className="text-sky-400 flex items-center">
                          <UserIcon className="w-2.5 h-2.5 mr-0.5" /> CUSTOMER
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuth('login')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Diagnostics Flyout */}
      {showHealthCard && (
        <div className="border-b border-slate-800 bg-slate-800/60 p-4 transition-all">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center space-x-3">
              <span className={`w-2.5 h-2.5 rounded-full ${health?.status === 'UP' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-semibold text-slate-300">Backend Status: {health?.status || 'DOWN'}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Database: {health?.details?.dbProductName || 'PostgreSQL 18'}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Status: {health?.status || 'N/A'}</span>
            </div>
            <button
              onClick={checkStatus}
              disabled={loadingHealth}
              className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${loadingHealth ? 'animate-spin' : ''}`} />
              <span>Refresh Probe</span>
            </button>
          </div>
        </div>
      )}

      {/* Order Confirmation Banner */}
      {lastPlacedOrder && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Order <strong>{lastPlacedOrder.orderNumber}</strong> placed successfully! Total: ${lastPlacedOrder.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setLastPlacedOrder(null);
                  setOrdersModalOpen(true);
                }}
                className="text-emerald-300 hover:text-white underline font-semibold cursor-pointer"
              >
                View Tracking
              </button>
              <button
                onClick={() => setLastPlacedOrder(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-800/40 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI-Assisted Catalog Discovery & Concierge</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
            Premium Workstation & Acoustics
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Engineered audio, ergonomic peripherals, and smart accessories curated for developers, creators, and professionals.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Search, Filter, Sort and Admin Action Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={aiSearchEnabled ? "Describe what you need in natural language (e.g., 'ergonomic typing gear under $100')..." : "Search products by title, SKU, or keyword..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-slate-900/80 border rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                aiSearchEnabled
                  ? 'border-purple-500/80 focus:ring-purple-500 shadow-sm shadow-purple-500/20'
                  : 'border-slate-700 focus:ring-indigo-500'
              }`}
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* AI Semantic Search Toggle */}
            <button
              onClick={() => setAiSearchEnabled(!aiSearchEnabled)}
              title="Toggle AI Semantic Search"
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                aiSearchEnabled
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-purple-400/50 shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-900'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiSearchEnabled ? 'text-amber-300 animate-spin' : 'text-purple-400'}`} style={{ animationDuration: '4s' }} />
              <span>{aiSearchEnabled ? 'AI Vector Search ON' : 'AI Semantic Search'}</span>
            </button>

            {/* In-Stock Toggle */}
            <label className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>In Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1 bg-slate-900/60 px-2 py-1.5 rounded-xl border border-slate-700 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [b, d] = e.target.value.split('-');
                  setSortBy(b);
                  setSortDir(d as 'asc' | 'desc');
                }}
                aria-label="Sort products"
                className="bg-transparent text-slate-300 border-none focus:outline-none text-xs cursor-pointer py-1"
              >
                <option value="createdAt-desc" className="bg-slate-800 text-slate-200">Newest First</option>
                <option value="price-asc" className="bg-slate-800 text-slate-200">Price: Low to High</option>
                <option value="price-desc" className="bg-slate-800 text-slate-200">Price: High to Low</option>
                <option value="name-asc" className="bg-slate-800 text-slate-200">Name: A to Z</option>
              </select>
            </div>

            {/* Admin Add Product Button */}
            {isAdmin && (
              <button
                onClick={() => setAddProductModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/20 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="overflow-x-auto pb-1">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === null
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loadingProducts ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Loading catalog from PostgreSQL 18...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-slate-800/30 border border-dashed border-slate-700 rounded-3xl p-8 space-y-3">
            <PackageOpen className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-semibold text-white">No products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query, clearing filters, or unchecking "In-Stock Only".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setInStockOnly(false);
              }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col space-y-1.5">
                {semanticMatches[product.id] && (
                  <div className="bg-purple-950/80 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center space-x-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-300 flex-shrink-0" />
                    <span className="truncate">{semanticMatches[product.id]}</span>
                  </div>
                )}
                <ProductCard
                  product={product}
                  onSelect={(p) => setSelectedProduct(p)}
                  onUpdateStock={handleUpdateStock}
                  onDelete={handleDeleteProduct}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Admin Add Product Modal */}
      <AddProductModal
        isOpen={addProductModalOpen}
        categories={categories}
        onClose={() => setAddProductModalOpen(false)}
        onSuccess={() => {
          loadProducts();
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onProceedToCheckout={() => setCheckoutModalOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={ordersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
      />

      {/* Admin Dashboard Operations Console */}
      {isAdmin && (
        <AdminDashboardModal
          isOpen={adminDashboardOpen}
          onClose={() => setAdminDashboardOpen(false)}
          products={products}
          onUpdateStock={handleUpdateStock}
          onOpenAddProduct={() => {
            setAdminDashboardOpen(false);
            setAddProductModalOpen(true);
          }}
        />
      )}

      {/* Floating Ask SphereAI Button */}
      <button
        onClick={() => setAiChatDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold px-4 py-3 rounded-full shadow-2xl shadow-purple-600/40 flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer border border-white/20"
        title="Open AI Shopping Assistant"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="text-xs tracking-wide">Ask SphereAI</span>
      </button>

      {/* SphereAI RAG Shopping Assistant Drawer */}
      <AiChatDrawer
        isOpen={aiChatDrawerOpen}
        onClose={() => setAiChatDrawerOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={handleAddToCart}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        ShopSphere &copy; {new Date().getFullYear()} &mdash; Portfolio-Quality Engineering Project
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <DashboardContent />
      </CartProvider>
    </AuthProvider>
  );
}
