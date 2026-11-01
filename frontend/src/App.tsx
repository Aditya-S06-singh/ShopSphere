import { useState, useEffect, useCallback } from 'react';
import { fetchHealth, HealthResponse } from './api/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProductCard } from './components/products/ProductCard';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { AddProductModal } from './components/admin/AddProductModal';
import { Category, Product } from './types/product';
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
  Filter
} from 'lucide-react';

function DashboardContent() {
  const { user, isAuthenticated, logout } = useAuth();
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

  // Temporary local cart counter for preview
  const [cartCount, setCartCount] = useState<number>(0);

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
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedCategory, searchQuery, inStockOnly, sortBy, sortDir]);

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

  const handleAddToCart = (_product: Product) => {
    setCartCount((prev) => prev + 1);
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

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
              <span className="ml-2 text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI Powered
              </span>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center space-x-3">
            {/* System Health Toggle */}
            <button
              onClick={() => setShowHealthCard(!showHealthCard)}
              title="System Diagnostics"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700 hidden sm:flex items-center space-x-1.5 text-xs font-mono"
            >
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>{health?.status === 'UP' ? 'System 200' : 'Diagnostics'}</span>
            </button>

            {/* Cart Preview Button */}
            <div className="relative">
              <button
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center"
                title="Shopping Cart (Milestone 4 Preview)"
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
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors shadow-md shadow-indigo-600/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Collapsible System Health Card */}
        {showHealthCard && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Full-Stack Heartbeat & PostgreSQL 18</h3>
              </div>
              <button
                onClick={checkStatus}
                disabled={loadingHealth}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingHealth ? 'animate-spin' : ''}`} />
                <span>Probe</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-400">Backend API:</span>
                <span className="text-emerald-400 font-semibold">{health?.appName} ({health?.status})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-400">PostgreSQL Pool:</span>
                <span className="text-emerald-400 font-semibold">{health?.details?.dbProductName} {health?.details?.dbProductVersion}</span>
              </div>
            </div>
          </div>
        )}

        {/* Catalog Banner & Milestone 3 Pill */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Milestone 3: Dynamic Catalog & Category Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Featured Product Catalog
            </h1>
            <p className="text-xs text-slate-400">
              Explore premium hardware, wearables, audio and modern accessories with live inventory counts.
            </p>
          </div>

          {/* Admin "Add Product" button */}
          {isAdmin && (
            <button
              onClick={() => setAddProductModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product (Admin)</span>
            </button>
          )}
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search products by title, keywords or specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDir(dir as 'asc' | 'desc');
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="createdAt-desc">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* In-Stock Only Toggle */}
            <label className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded bg-slate-800 border-slate-600 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span>In-Stock Only</span>
            </label>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <span className="text-xs text-slate-400 flex items-center mr-1">
              <Filter className="w-3 h-3 mr-1" />
              <span>Categories:</span>
            </span>

            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              All Products
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
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
              className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
                onUpdateStock={handleUpdateStock}
                onDelete={handleDeleteProduct}
                onAddToCart={handleAddToCart}
              />
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
      <DashboardContent />
    </AuthProvider>
  );
}
