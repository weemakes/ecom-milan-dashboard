'use client';

import React, { useState, useEffect } from 'react';
import { ProductCategory, Vendor } from '@/lib/seedData';
import { Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

interface CategoryFormProps {
  category?: ProductCategory | null;
  categoriesList: ProductCategory[];
  vendorsList: Vendor[];
  onSubmit: (formData: any) => Promise<void> | void;
  onCancel: () => void;
}

export default function CategoryForm({
  category,
  categoriesList,
  vendorsList,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [parentId, setParentId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.category_name);
      setDescription(category.category_description || '');
      setImgUrl(category.category_img);
      setParentId(category.parent_category_id || '');
      setVendorId(category.vendor_id || '');
      setIsActive(category.is_active);
    } else {
      setName('');
      setDescription('');
      setImgUrl('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=60'); // default realistic image placeholder
      setParentId('');
      setVendorId('');
      setIsActive(true);
    }
    setError('');
  }, [category]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 400 * 1024) {
        setError(`Image file size must not exceed 400 KB. Selected file is ${(file.size / 1024).toFixed(1)} KB.`);
        if (e.target) e.target.value = '';
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter out the category itself and its descendants to prevent circular routing
  const eligibleParents = categoriesList.filter(c => {
    if (!category) return true;
    return c.id !== category.id;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Category name is required.');
    if (!imgUrl.trim()) return setError('Category image URL is required.');

    setSubmitting(true);
    try {
      await onSubmit({
        category_name: name.trim(),
        category_description: description.trim() || null,
        category_img: imgUrl.trim(),
        parent_category_id: parentId === '' ? null : parentId,
        vendor_id: vendorId === '' ? null : vendorId,
        is_active: isActive,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to submit category form.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 select-none text-foreground">
      {error && (
        <div className="p-3 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Grid for Inputs and Image Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Forms Inputs */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Category Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ethnic Wear, Smartphones..."
              className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
              required
            />
          </div>

          {/* Category Image URL or File Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category Image *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imgUrl.startsWith('data:') ? 'Image uploaded (Base64 file)' : imgUrl}
                onChange={e => setImgUrl(e.target.value)}
                placeholder="Paste URL or upload file..."
                className="form-input flex-1 text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
                required
              />
              <label className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-500 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer bg-background transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-3.5 h-3.5" />
                Upload
              </label>
            </div>
          </div>
        </div>

        {/* Image Preview Box */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 text-center md:text-left">Thumbnail Preview</label>
          <div className="flex-1 h-32 md:h-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 overflow-hidden flex items-center justify-center relative">
            {imgUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imgUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImgUrl('')}
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                <ImageIcon className="w-8 h-8" />
                <span className="text-[10px]">No image URL</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Grid Category Dropdown links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Parent Category (Optional)</label>
          <select
            value={parentId}
            onChange={e => setParentId(e.target.value)}
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            <option value="">None (Top-Level Category)</option>
            {eligibleParents.map(c => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor/Merchant Owner */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Merchant Association (Optional)</label>
          <select
            value={vendorId}
            onChange={e => setVendorId(e.target.value)}
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            <option value="">None (System-Wide)</option>
            {vendorsList.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Brief description about the products matching this category..."
          rows={3}
          className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800 py-2 resize-none"
        />
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 select-none">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Make Category Active</span>
          <span className="text-xs text-zinc-400">Products under active categories will display on catalog pages</span>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/70 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md shadow-indigo-600/10 transition-colors flex items-center gap-2 cursor-pointer"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>
            {submitting
              ? (category ? 'Saving Changes...' : 'Creating Category...')
              : (category ? 'Save Changes' : 'Create Category')}
          </span>
        </button>
      </div>
    </form>
  );
}
