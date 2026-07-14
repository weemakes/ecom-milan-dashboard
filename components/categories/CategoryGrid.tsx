'use client';

import React from 'react';
import { Edit2, Trash2, Search, Filter, Layers, Shield, Image as ImageIcon } from 'lucide-react';
import { ProductCategory } from '@/lib/seedData';

interface CategoryGridProps {
  categories: any[];
  loading: boolean;
  onEdit: (category: ProductCategory) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onSelect?: (id: string) => void;
}

export default function CategoryGrid({
  categories,
  loading,
  onEdit,
  onDelete,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onSelect,
}: CategoryGridProps) {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-zinc-50/50 dark:bg-zinc-900/10 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search categories by name..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto font-medium">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Categories Grid layout */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500">Loading catalog categories...</div>
      ) : categories.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => (
            <div 
              key={category.id} 
              onClick={() => onSelect && onSelect(category.id)}
              className={`premium-card overflow-hidden flex flex-col justify-between cursor-pointer hover:border-indigo-500/40 hover:shadow-lg transition-all ${
                category.is_active ? '' : 'border-red-500/20 opacity-75'
              }`}
            >
              {/* Category Image Header */}
              <div className="relative h-44 bg-zinc-100 dark:bg-zinc-800 w-full overflow-hidden flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800">
                {category.category_img ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={category.category_img}
                    alt={category.category_name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-zinc-400" />
                )}
                
                {/* Status Badges on Image */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${
                    category.is_active 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Contents details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-bold text-base text-foreground leading-tight">{category.category_name}</h4>
                  <span className="text-[11px] font-mono text-zinc-400">slug: {category.category_slug}</span>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">
                    {category.category_description || 'No description added for this catalog category.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-400 font-medium">
                  {/* Parent Category */}
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Parent: </span>
                    <span className="font-bold text-foreground">
                      {category.parent_category_name || 'None (Root Category)'}
                    </span>
                  </div>

                  {/* Merchant Vendor */}
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Merchant: </span>
                    <span className="font-bold text-foreground">
                      {category.vendor_name || 'System Wide (None)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/30 dark:bg-zinc-900/30 flex items-center justify-end gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-background"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-red-500/30 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-background"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
