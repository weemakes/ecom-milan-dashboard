'use client';

import React, { useState, useEffect } from 'react';
import { ProductDetail, ProductCategory, Vendor } from '@/lib/seedData';
import VariantBuilder from './VariantBuilder';
import ImageListBuilder from './ImageListBuilder';
import { Package, Layers, Shield, Tag, Box, Barcode, Calendar, LayoutDashboard, Star, FileText } from 'lucide-react';

interface ProductFormProps {
  product?: ProductDetail | null;
  categoriesList: ProductCategory[];
  vendorsList: Vendor[];
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  customSections?: string[];
  customOccasions?: string[];
}

export default function ProductForm({
  product,
  categoriesList,
  vendorsList,
  onSubmit,
  onCancel,
  customSections,
  customOccasions,
}: ProductFormProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [qty, setQty] = useState('0');
  const [sku, setSku] = useState('');
  const [occasions, setOccasions] = useState<string[]>([]);
  const [landingSections, setLandingSections] = useState<string[]>([]);
  const [featuredType, setFeaturedType] = useState('TOP_PICKS');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.product_name);
      setCategoryId(product.category_id);
      setVendorId(product.vendor_id);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setDiscountedPrice(product.discounted_price ? product.discounted_price.toString() : '');
      setQty(product.quantity_in_stock.toString());
      setSku(product.sku || '');
      const initialOccasions = Array.isArray(product.occasions)
        ? product.occasions
        : product.occasion
          ? [product.occasion]
          : [];
      setOccasions(initialOccasions);
      const initialSections = Array.isArray(product.landing_sections)
        ? product.landing_sections
        : product.landing_section && product.landing_section !== 'NONE'
          ? [product.landing_section]
          : [];
      setLandingSections(initialSections);
      setFeaturedType(product.featured_type || 'TOP_PICKS');
      setImages(product.images || []);
      setVariants(product.variants || []);
      setIsActive(product.is_active);
      setIsFeatured(product.is_featured);
    } else {
      setName('');
      setCategoryId(categoriesList[0]?.id || '');
      setVendorId(vendorsList[0]?.id || '');
      setDescription('');
      setPrice('');
      setDiscountedPrice('');
      setQty('10');
      setSku('');
      setOccasions([]);
      setLandingSections([]);
      setFeaturedType('TOP_PICKS');
      setImages(['https://images.unsplash.com/photo-1594736797933-d0501ba21155?w=500&auto=format&fit=crop&q=80']); // prefill a placeholder product image
      setVariants([]);
      setIsActive(true);
      setIsFeatured(false);
    }
    setError('');
  }, [product, categoriesList, vendorsList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Product name is required.');
    if (!categoryId) return setError('Product category is required.');
    if (!vendorId) return setError('Merchant ownership selection is required.');
    if (!price || parseFloat(price) < 0) return setError('Please enter a valid price (greater than or equal to 0).');
    if (discountedPrice && parseFloat(discountedPrice) < 0) return setError('Discounted price cannot be negative.');
    if (discountedPrice && parseFloat(discountedPrice) >= parseFloat(price)) {
      return setError('Discounted price must be strictly less than original price.');
    }
    if (parseInt(qty) < 0) return setError('Stock quantity cannot be negative.');

    onSubmit({
      product_name: name.trim(),
      category_id: categoryId,
      vendor_id: vendorId,
      description: description.trim() || null,
      price: parseFloat(price),
      discounted_price: discountedPrice ? parseFloat(discountedPrice) : null,
      quantity_in_stock: parseInt(qty),
      sku: sku.trim() || null,
      occasions: occasions,
      occasion: occasions[0] || null,
      landing_sections: landingSections,
      landing_section: landingSections[0] || 'NONE',
      featured_type: featuredType,
      images,
      variants,
      is_active: isActive,
      is_featured: isFeatured,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 select-none text-foreground pb-4">
      {error && (
        <div className="p-3 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Grid General Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Product Name *</label>
          <div className="relative">
            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Silk Banarasi Saree, Leather Jacket..."
              className="form-input pl-10"
              required
            />
          </div>
        </div>
      </div>

      {/* Category and Vendor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Product Category *</label>
          <div className="relative">
            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="form-input pl-10 cursor-pointer"
              required
            >
              <option value="" disabled>Select category</option>
              {categoriesList.map(c => (
                <option key={c.id} value={c.id}>{c.category_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Merchant Ownership *</label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <select
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              className="form-input pl-10 cursor-pointer"
              required
            >
              <option value="" disabled>Select merchant</option>
              {vendorsList.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Price and inventory info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Original Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Original Price *</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-zinc-500">₹</span>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 2999"
              min="0"
              step="0.01"
              className="form-input pl-8"
              required
            />
          </div>
        </div>

        {/* Discount Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Discounted Price</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-zinc-500">₹</span>
            <input
              type="number"
              value={discountedPrice}
              onChange={e => setDiscountedPrice(e.target.value)}
              placeholder="e.g. 2499"
              min="0"
              step="0.01"
              className="form-input pl-8"
            />
          </div>
        </div>

        {/* Stock Qty */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Initial Stock *</label>
          <div className="relative">
            <Box className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="e.g. 50"
              min="0"
              className="form-input pl-10"
              required
            />
          </div>
        </div>
      </div>

      {/* SKU and Occasion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">SKU Code (Unique)</label>
          <div className="relative">
            <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={sku}
              onChange={e => setSku(e.target.value)}
              placeholder="e.g. MLN-SAREE-RED-001"
              className="form-input pl-10 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Target Occasions</label>
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950/60 font-semibold max-h-[140px] overflow-y-auto">
            {(customOccasions || ['Bridal Wear', 'Party Wear', 'Office Formal', 'Festive Wear']).map(occ => {
              const isChecked = occasions.includes(occ);
              return (
                <label key={occ} className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => {
                      if (e.target.checked) {
                        setOccasions([...occasions, occ]);
                      } else {
                        setOccasions(occasions.filter(o => o !== occ));
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-850 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>{occ}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Landing Section and Featured Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Landing Section Placements</label>
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950/60 font-semibold max-h-[140px] overflow-y-auto">
            {(customSections || ['HERO', 'TRENDING', 'NEW_ARRIVALS', 'DISCOUNTS']).map(sec => {
              const isChecked = landingSections.includes(sec);
              return (
                <label key={sec} className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => {
                      if (e.target.checked) {
                         setLandingSections([...landingSections, sec]);
                      } else {
                         setLandingSections(landingSections.filter(s => s !== sec));
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-850 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>{sec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Featured Group Category</label>
          <div className="relative">
            <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <select
              value={featuredType}
              onChange={e => setFeaturedType(e.target.value)}
              className="form-input pl-10 cursor-pointer"
            >
              <option value="TOP_PICKS">Top Picks</option>
              <option value="BEST_SELLERS">Best Sellers</option>
              <option value="SPECIAL_DEALS">Special Deals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Product Description</label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter rich details about fabrics, fits, dimensions, and specifications..."
            rows={3}
            className="form-input pl-10 py-3.5 resize-none"
          />
        </div>
      </div>

      {/* Image URL collection */}
      <ImageListBuilder images={images} onChange={setImages} />

      {/* Variant Builder JSON schema */}
      <VariantBuilder variants={variants} onChange={setVariants} />

      {/* Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 bg-slate-500/5 dark:bg-zinc-400/5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-500/10 dark:hover:bg-zinc-400/10 select-none">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">List Product as Active</span>
            <span className="text-xs text-zinc-400">Available to customers in searches and categories</span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6.5 w-11.5 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none hover:shadow-md active:scale-95 ${
              isActive ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : 'bg-slate-200 dark:bg-zinc-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Featured Spot Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 bg-slate-500/5 dark:bg-zinc-400/5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-500/10 dark:hover:bg-zinc-400/10 select-none">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Featured Spotlight Badge</span>
            <span className="text-xs text-zinc-400">Highlight in featured groups and sliders</span>
          </div>
          <button
            type="button"
            onClick={() => setIsFeatured(!isFeatured)}
            className={`relative inline-flex h-6.5 w-11.5 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none hover:shadow-md active:scale-95 ${
              isFeatured ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : 'bg-slate-200 dark:bg-zinc-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                isFeatured ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-900 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-slate-300 text-sm font-medium transition-all duration-200 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 cursor-pointer"
        >
          {product ? 'Save Updates' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
