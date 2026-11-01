import React from 'react';
import { Product } from '../../types/product';
import { X, ShoppingBag, ShieldCheck, Truck, RefreshCw, AlertCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white transition-colors bg-slate-950/60 p-1.5 rounded-full backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="w-full md:w-1/2 aspect-square bg-slate-950 relative">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur text-indigo-300 border border-indigo-500/30">
              {product.categoryName}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
              {product.stockQuantity > 0 ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{product.stockQuantity} Units in Stock</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-400 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Temporarily Out of Stock</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {product.name}
            </h2>

            <div className="text-2xl font-extrabold text-white">
              ${Number(product.price).toFixed(2)}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-1">
              {product.description}
            </p>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Free 2-Day Delivery</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>2-Year Warranty</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>30-Day Returns</span>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={() => {
              if (onAddToCart) onAddToCart(product);
              onClose();
            }}
            disabled={product.stockQuantity <= 0}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{product.stockQuantity > 0 ? 'Add to Cart' : 'Currently Unavailable'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

