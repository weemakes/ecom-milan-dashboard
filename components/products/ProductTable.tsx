'use client';

import React from 'react';
import { Edit2, Trash2, Search, Filter, Sparkles, Tag, Check, X, Shield, Layers } from 'lucide-react';
import { ProductDetail } from '@/lib/seedData';

interface ProductTableProps {
  products: any[];
  categoriesList: any[];
  vendorsList: any[];
  loading: boolean;
  onEdit: (product: ProductDetail) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onToggleFeatured: (id: string, currentStatus: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (id: string) => void;
  vendorFilter: string;
  setVendorFilter: (id: string) => void;
  activeFilter: string;
  setActiveFilter: (status: string) => void;
}

export default function ProductTable({
  products,
  categoriesList,
  vendorsList,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  vendorFilter,
  setVendorFilter,
  activeFilter,
  setActiveFilter,
}: ProductTableProps) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in text-foreground">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col lg:flex-row items-center gap-3 justify-between bg-zinc-50/50 dark:bg-zinc-900/10 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto font-medium">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 bg-background">
            <Layers className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="py-2 bg-transparent text-foreground text-xs focus:outline-none cursor-pointer w-full"
            >
              <option value="all">All Categories</option>
              {categoriesList.map(c => (
                <option key={c.id} value={c.id}>{c.category_name}</option>
              ))}
            </select>
          </div>

          {/* Vendor Filter */}
          <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 bg-background">
            <Shield className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <select
              value={vendorFilter}
              onChange={e => setVendorFilter(e.target.value)}
              className="py-2 bg-transparent text-foreground text-xs focus:outline-none cursor-pointer w-full"
            >
              <option value="all">All Merchants</option>
              {vendorsList.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Status Active Filter */}
          <div className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 bg-background">
            <Filter className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <select
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value)}
              className="py-2 bg-transparent text-foreground text-xs focus:outline-none cursor-pointer w-full"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-100/50 dark:bg-zinc-900/40 select-none">
              <th className="py-3 px-4">Product Info</th>
              <th className="py-3 px-4">Categories & Vendor</th>
              <th className="py-3 px-4">Price details</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Inventory</th>
              <th className="py-3 px-4">Toggles</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500">
                  Loading catalog products list...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500">
                  No products found matching filters.
                </td>
              </tr>
            ) : (
              products.map(product => {
                const discountPercent = product.discounted_price && product.price > 0
                  ? Math.round(((product.price - product.discounted_price) / product.price) * 100)
                  : 0;

                return (
                  <tr 
                    key={product.id} 
                    className="hover:bg-zinc-100/30 dark:hover:bg-zinc-900/20 transition-colors"
                  >
                    {/* Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                          {product.images && product.images.length > 0 ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={product.images[0]}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Tag className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground leading-tight line-clamp-1">{product.product_name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">SKU: {product.sku || 'No SKU'}</span>
                          {product.occasion && (
                            <span className="text-[9px] text-indigo-500 font-bold tracking-wide uppercase mt-0.5">{product.occasion}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category & Vendor */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-semibold text-foreground">{product.category_name}</span>
                        <span className="text-zinc-500 text-[11px] truncate max-w-[120px]" title={product.vendor_name}>
                          By: {product.vendor_name}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        {product.discounted_price ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground">₹{product.discounted_price}</span>
                            <span className="text-xs text-zinc-500 line-through">₹{product.price}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-foreground">₹{product.price}</span>
                        )}
                        {(() => {
                          const secs = Array.isArray(product.landing_sections)
                            ? product.landing_sections
                            : product.landing_section && product.landing_section !== 'NONE'
                              ? [product.landing_section]
                              : [];
                          if (secs.length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {secs.map((sec: string) => (
                                <span key={sec} className="inline-flex items-center text-[9px] text-zinc-400 font-bold bg-slate-100 dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800/40 px-1.5 py-0.5 rounded uppercase">
                                  {sec}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-4">
                      {discountPercent > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Tag className="w-3.5 h-3.5 text-emerald-500" />
                          {discountPercent}% OFF
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
                          —
                        </span>
                      )}
                    </td>

                    {/* Stock & variants count */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-bold ${
                          product.quantity_in_stock === 0 
                            ? 'text-red-500' 
                            : product.quantity_in_stock < 10 
                            ? 'text-amber-500' 
                            : 'text-foreground'
                        }`}>
                          {product.quantity_in_stock === 0 ? 'Out of Stock' : `${product.quantity_in_stock} units`}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {product.variants && product.variants.length > 0
                            ? `${product.variants.length} variant options`
                            : 'Standard size/fit'}
                        </span>
                      </div>
                    </td>

                    {/* Toggles Status / Featured */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* Active Toggle */}
                        <button
                          onClick={() => onToggleActive(product.id, product.is_active)}
                          className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                            product.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/50'
                          }`}
                          title="Toggle Active Status"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        {/* Featured Toggle */}
                        <button
                          onClick={() => onToggleFeatured(product.id, product.is_featured)}
                          className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                            product.is_featured
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-amber-500/10'
                          }`}
                          title="Toggle Featured Spot"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-500 hover:border-indigo-500/30 transition-all cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all cursor-pointer"
                          title="Remove Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
