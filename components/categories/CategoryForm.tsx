'use client';

import React, { useState, useEffect } from 'react';
import { ProductCategory, Vendor } from '@/lib/seedData';
import { FolderOpen, Tag, Image as ImageIcon, Link as LinkIcon, FolderTree, Shield, FileText } from 'lucide-react';

interface CategoryFormProps {
  category?: ProductCategory | null;
  categoriesList: ProductCategory[];
  vendorsList: Vendor[];
  onSubmit: (formData: any) => void;
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

  // Filter out the category itself and its descendants to prevent circular routing
  const eligibleParents = categoriesList.filter(c => {
    if (!category) return true;
    return c.id !== category.id;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Category name is required.');
    if (!imgUrl.trim()) return setError('Category image URL is required.');

    onSubmit({
      category_name: name.trim(),
      category_description: description.trim() || null,
      category_img: imgUrl.trim(),
      parent_category_id: parentId === '' ? null : parentId,
      vendor_id: vendorId === '' ? null : vendorId,
      is_active: isActive,
    });
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
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Category Name *</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ethnic Wear, Smartphones..."
                className="form-input pl-10"
                required
              />
            </div>
          </div>

          {/* Category Image URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Category Image URL *</label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="url"
                value={imgUrl}
                onChange={e => setImgUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="form-input pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Image Preview Box */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400 text-center md:text-left">Thumbnail Preview</label>
          <div className="flex-1 h-32 md:h-auto rounded-xl border border-slate-200/60 dark:border-zinc-800/60 bg-slate-500/5 dark:bg-zinc-400/5 backdrop-blur-sm shadow-sm overflow-hidden flex items-center justify-center relative hover:border-indigo-500/30 transition-all duration-300">
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
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Parent Category (Optional)</label>
          <div className="relative">
            <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="form-input pl-10 cursor-pointer"
            >
              <option value="">None (Top-Level Category)</option>
              {eligibleParents.map(c => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vendor/Merchant Owner */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Merchant Association (Optional)</label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <select
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              className="form-input pl-10 cursor-pointer"
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
      </div>

      {/* Category Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Category Description</label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description about the products matching this category..."
            rows={3}
            className="form-input pl-10 py-3.5 resize-none"
          />
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 bg-slate-500/5 dark:bg-zinc-400/5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-500/10 dark:hover:bg-zinc-400/10 select-none">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Make Category Active</span>
          <span className="text-xs text-zinc-400">Products under active categories will display on catalog pages</span>
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

      {/* Actions */}
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
          {category ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
