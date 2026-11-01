import React, { useState } from 'react';
import { Product } from '../../types/product';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Eye, Edit3, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onUpdateStock: (productId: number, newStock: number) => void;
  onDelete: (productId: number) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onUpdateStock,
  onDelete,
  onAddToCart,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [isEditingStock, setIsEditingStock] = useState<boolean>(false);
  const [stockInput, setStockInput] = useState<number>(product.stockQuantity);
  const [added, setAdded] = useState<boolean>(false);

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStock(product.id, stockInput);
    setIsEditingStock(false);
  };

  const handleAdd = () => {
    if (product.stockQuantity <= 0) return;
    setAdded(true);
    if (onAddToCart) onAddToCart(product);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
            {product.categoryName}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {product.stockQuantity > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{product.stockQuantity} in stock</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur-md flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>Out of Stock</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            SKU: {product.sku}
          </div>
          <h3 
            onClick={() => onSelect(product)}
            className="text-base font-semibold text-white group-hover:text-indigo-400 cursor-pointer transition-colors line-clamp-1"
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Price</div>
            <div className="text-lg font-bold text-white">
              ${Number(product.price).toFixed(2)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelect(product)}
              title="Quick view"
              className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={handleAdd}
              disabled={product.stockQuantity <= 0}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                added
                  ? 'bg-emerald-600 text-white'
                  : product.stockQuantity > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{product.stockQuantity > 0 ? 'Add' : 'Sold Out'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Admin Bar (Visible only when user is ROLE_ADMIN) */}
        {isAdmin && (
          <div className="mt-3 pt-3 border-t border-dashed border-purple-500/30 flex items-center justify-between bg-purple-950/20 -mx-5 -mb-5 p-3 rounded-b-2xl">
            <span className="text-[10px] font-mono text-purple-300 font-semibold uppercase">
              Admin Tool
            </span>

            <div className="flex items-center space-x-2">
              {isEditingStock ? (
                <form onSubmit={handleStockSubmit} className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    value={stockInput}
                    onChange={(e) => setStockInput(parseInt(e.target.value) || 0)}
                    className="w-14 px-1.5 py-0.5 text-xs bg-slate-900 border border-purple-500/50 rounded text-white"
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 text-[10px] bg-purple-600 text-white rounded font-medium"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingStock(false)}
                    className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingStock(true)}
                  className="inline-flex items-center space-x-1 text-[11px] text-purple-300 hover:text-purple-200"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Stock ({product.stockQuantity})</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to remove "${product.name}"?`)) {
                    onDelete(product.id);
                  }
                }}
                title="Archive / Remove Product"
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

