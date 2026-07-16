'use client';

import React, { useState, useEffect } from 'react';
import { ProductDetail, ProductCategory, Vendor } from '@/lib/seedData';
import VariantBuilder from './VariantBuilder';
import ImageListBuilder from './ImageListBuilder';

interface ProductFormProps {
  product?: ProductDetail | null;
  categoriesList: ProductCategory[];
  vendorsList: Vendor[];
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  categoriesList,
  vendorsList,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [qty, setQty] = useState('0');
  const [sku, setSku] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState('');

  const handlePriceChange = (val: string) => {
    setPrice(val);
    if (val && discount) {
      const p = parseFloat(val);
      const d = parseFloat(discount);
      if (!isNaN(p) && !isNaN(d)) {
        const finalDisc = Math.round(p - (p * d) / 100);
        setDiscountedPrice(finalDisc.toString());
      }
    } else if (val && discountedPrice) {
      const p = parseFloat(val);
      const dp = parseFloat(discountedPrice);
      if (!isNaN(p) && !isNaN(dp) && p > 0) {
        const pct = Math.round(((p - dp) / p) * 100);
        setDiscount(pct.toString());
      }
    }
  };

  const handleDiscountChange = (val: string) => {
    setDiscount(val);
    if (price && val) {
      const p = parseFloat(price);
      const d = parseFloat(val);
      if (!isNaN(p) && !isNaN(d)) {
        const finalDisc = Math.round(p - (p * d) / 100);
        setDiscountedPrice(finalDisc.toString());
      }
    } else if (!val) {
      setDiscountedPrice('');
    }
  };

  const handleDiscountedPriceChange = (val: string) => {
    setDiscountedPrice(val);
    if (price && val) {
      const p = parseFloat(price);
      const dp = parseFloat(val);
      if (!isNaN(p) && !isNaN(dp) && p > 0) {
        const pct = Math.round(((p - dp) / p) * 100);
        setDiscount(pct.toString());
      }
    } else if (!val) {
      setDiscount('');
    }
  };

  useEffect(() => {
    if (product) {
      setName(product.product_name);
      setCategoryId(product.category_id);
      setVendorId(product.vendor_id);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setDiscountedPrice(product.discounted_price ? product.discounted_price.toString() : '');
      if (product.price && product.discounted_price) {
        const pct = Math.round(((product.price - product.discounted_price) / product.price) * 100);
        setDiscount(pct.toString());
      } else {
        setDiscount('');
      }
      setQty(product.quantity_in_stock.toString());
      setSku(product.sku || '');
      setImages(product.images || []);
      let parsedVariants = [];
      if (product.variants) {
        if (Array.isArray(product.variants)) {
          parsedVariants = product.variants;
        } else if (typeof product.variants === 'string') {
          try {
            parsedVariants = JSON.parse(product.variants);
          } catch (e) {
            console.error('Failed parsing variants string', e);
          }
        }
      }
      setVariants(parsedVariants);
      setIsActive(product.is_active);
      setIsFeatured(product.is_featured);
    } else {
      setName('');
      setCategoryId('');
      setVendorId('');
      setDescription('');
      setPrice('');
      setDiscount('');
      setDiscountedPrice('');
      setQty('10');
      setSku('');
      setImages([]);
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
      occasion: null,
      landing_section: null,
      featured_type: null,
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
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Silk Banarasi Saree, Leather Jacket..."
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
            required
          />
        </div>
      </div>

      {/* Category and Vendor */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Category *</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="form-input w-full text-foreground bg-background border border-zinc-200 dark:border-zinc-800 cursor-pointer"
            required
          >
            <option value="">Select a category</option>
            {categoriesList.map(c => (
              <option key={c.id} value={c.id}>{c.category_name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Merchant Ownership *</label>
          <select
            value={vendorId}
            onChange={e => setVendorId(e.target.value)}
            className="form-input w-full text-foreground bg-background border border-zinc-200 dark:border-zinc-800 cursor-pointer"
            required
          >
            <option value="">Select a vendor</option>
            {vendorsList.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price and inventory info */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Original Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Original Price (₹) *</label>
          <input
            type="number"
            value={price}
            onChange={e => handlePriceChange(e.target.value)}
            placeholder="e.g. 2999"
            min="0"
            step="0.01"
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
            required
          />
        </div>

        {/* Discount Percent */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Discount (%)</label>
          <input
            type="number"
            value={discount}
            onChange={e => handleDiscountChange(e.target.value)}
            placeholder="e.g. 10"
            min="0"
            max="100"
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
          />
        </div>

        {/* Discount Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Discounted Price (₹)</label>
          <input
            type="number"
            value={discountedPrice}
            onChange={e => handleDiscountedPriceChange(e.target.value)}
            placeholder="e.g. 2499"
            min="0"
            step="0.01"
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
          />
        </div>

        {/* Stock Qty */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Initial Stock Quantity *</label>
          <input
            type="number"
            value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder="e.g. 50"
            min="0"
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
            required
          />
        </div>
      </div>

      {/* SKU */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">SKU Code (Unique)</label>
        <input
          type="text"
          value={sku}
          onChange={e => setSku(e.target.value)}
          placeholder="e.g. MLN-SAREE-RED-001"
          className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800 font-mono"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter rich details about fabrics, fits, dimensions, and specifications..."
          rows={3}
          className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800 py-2 resize-none"
        />
      </div>

      {/* Image URL collection */}
      <ImageListBuilder images={images} onChange={setImages} />

      {/* Variant Builder JSON schema */}
      <VariantBuilder variants={variants} onChange={setVariants} />

      {/* Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">List Product as Active</span>
            <span className="text-xs text-zinc-400">Available to customers in searches and categories</span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Featured Spot Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Featured Spotlight Badge</span>
            <span className="text-xs text-zinc-400">Highlight in featured groups and sliders</span>
          </div>
          <button
            type="button"
            onClick={() => setIsFeatured(!isFeatured)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isFeatured ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isFeatured ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
        >
          {product ? 'Save Updates' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
