'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, LayoutGrid, Calendar, Tag, ChevronRight, X,
  Plus, Loader2, Search, RefreshCcw, Zap, Edit, Trash2
} from 'lucide-react';
import {
  getAllProductsAdmin,
  getOccasionsList,
  getProductsBySection,
  getProductsByOccasionName,
  getProductsOnSale,
  patchProductCampaign,
  createOrUpdateOccasion,
  updateOccasion,
  deleteOccasion
} from '@/services/api';

// ─── Constants ──────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'top-picks', label: 'Top Picks', featuredType: 'TOP_PICKS', color: 'indigo' },
  { id: 'today-deals', label: "Today's Deals", featuredType: 'TODAY_DEALS', color: 'amber' },
  { id: 'deals-on-sarees', label: 'Deals on Sarees', featuredType: 'DEALS_ON_SAREES', color: 'rose' },
  { id: 'best-value', label: 'Best Value', featuredType: 'BEST_VALUES', color: 'emerald' },
  { id: 'new-arrivals', label: 'New Arrivals', featuredType: 'NEW_ARRIVALS', color: 'sky' },
  { id: 'trending-now', label: 'Trending Now', featuredType: 'TRENDING_NOW', color: 'purple' },
];

const COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface CampaignProduct {
  id: string;
  product_name: string;
  product_slug: string;
  price: number;
  discounted_price: number | null;
  images: unknown;
  category_name: string;
  featured_type: string | null;
  landing_section: string | null;
  occasion: string | null;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getFirstImage(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) return images[0] as string;
  if (typeof images === 'string') {
    try {
      const p = JSON.parse(images);
      if (Array.isArray(p) && p.length > 0) return p[0] as string;
    } catch {
      const raw = images.replace(/^{|}$/g, '').split(',');
      if (raw.length > 0) return raw[0].trim().replace(/^['"]+|['"]+$/g, '');
    }
  }
  return 'https://via.placeholder.com/80x80?text=No+Image';
}

// ─── Product Row ─────────────────────────────────────────────────────────────

function ProductRow({
  product, action, onAction, loading,
}: {
  product: CampaignProduct;
  action: 'remove' | 'add';
  onAction: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background hover:border-indigo-400/40 transition-colors">
      <img
        src={getFirstImage(product.images)}
        alt={product.product_name}
        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80?text=N/A'; }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{product.product_name}</p>
        <p className="text-[11px] text-zinc-500">{product.category_name || 'Uncategorized'}</p>
      </div>
      <div className="text-right flex-shrink-0 mr-1">
        <p className="text-sm font-bold">₹{Number(product.discounted_price || product.price).toLocaleString('en-IN')}</p>
        {product.discounted_price && (
          <p className="text-[10px] text-zinc-400 line-through">₹{Number(product.price).toLocaleString('en-IN')}</p>
        )}
      </div>
      <button
        onClick={() => onAction(product.id)}
        disabled={loading}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 ${action === 'remove'
          ? 'bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800 hover:bg-red-100'
          : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
          }`}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : action === 'remove' ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        {action === 'remove' ? 'Remove' : 'Add'}
      </button>
    </div>
  );
}

// ─── Sections Tab ────────────────────────────────────────────────────────────

function SectionsTab({ onToast }: { onToast: (msg: string, type: 'success' | 'error') => void }) {
  const [selectedSection, setSelectedSection] = useState<typeof SECTIONS[0] | null>(null);
  const [sectionProducts, setSectionProducts] = useState<CampaignProduct[]>([]);
  const [allProducts, setAllProducts] = useState<CampaignProduct[]>([]);
  const [loadingSection, setLoadingSection] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchAll, setSearchAll] = useState('');

  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    try { const r = await getAllProductsAdmin(); setAllProducts(r.data || []); }
    catch { onToast('Failed to load products', 'error'); }
    finally { setLoadingAll(false); }
  }, [onToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const pickSection = async (sec: typeof SECTIONS[0]) => {
    setSelectedSection(sec);
    setLoadingSection(true);
    try { const r = await getProductsBySection(sec.id); setSectionProducts(r.data || []); }
    catch { onToast('Failed to load section products', 'error'); }
    finally { setLoadingSection(false); }
  };

  const handleRemove = async (id: string) => {
    setActionLoading(id);
    try {
      const prod = allProducts.find(x => x.id === id) || sectionProducts.find(x => x.id === id);
      const isLanding = selectedSection?.featuredType.startsWith('DEALS_ON_');
      const patchData: any = {};

      if (isLanding) {
        const currentVal = prod?.landing_section || '';
        const parts = currentVal.split(',').map(s => s.trim()).filter(Boolean);
        const filtered = parts.filter(x => x !== selectedSection?.featuredType);
        patchData.landing_section = filtered.length > 0 ? filtered.join(', ') : null;
      } else {
        const currentVal = prod?.featured_type || '';
        const parts = currentVal.split(',').map(s => s.trim()).filter(Boolean);
        const filtered = parts.filter(x => x !== selectedSection?.featuredType);
        patchData.featured_type = filtered.length > 0 ? filtered.join(', ') : null;
      }

      await patchProductCampaign(id, patchData);
      setSectionProducts(p => p.filter(x => x.id !== id));
      setAllProducts(prev => prev.map(p => p.id === id ? { ...p, ...patchData } : p));
      onToast('Removed from section', 'success');
    } catch { onToast('Failed', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleAdd = async (product: CampaignProduct) => {
    if (!selectedSection) { onToast('Select a section first', 'error'); return; }
    setActionLoading(product.id);
    try {
      const isLanding = selectedSection.featuredType.startsWith('DEALS_ON_');
      const patchData: any = {};

      if (isLanding) {
        const currentVal = product.landing_section || '';
        const parts = currentVal.split(',').map(s => s.trim()).filter(Boolean);
        if (!parts.includes(selectedSection.featuredType)) {
          parts.push(selectedSection.featuredType);
        }
        patchData.landing_section = parts.join(', ');
      } else {
        const currentVal = product.featured_type || '';
        const parts = currentVal.split(',').map(s => s.trim()).filter(Boolean);
        if (!parts.includes(selectedSection.featuredType)) {
          parts.push(selectedSection.featuredType);
        }
        patchData.featured_type = parts.join(', ');
      }

      await patchProductCampaign(product.id, patchData);
      const updatedProduct = { ...product, ...patchData };
      setSectionProducts(p => [...p, updatedProduct]);
      setAllProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
      onToast(`Added to "${selectedSection.label}"`, 'success');
    } catch { onToast('Failed', 'error'); }
    finally { setActionLoading(null); }
  };

  const inSection = new Set(sectionProducts.map(p => p.id));
  const filteredAll = allProducts.filter(p => !inSection.has(p.id) && p.product_name.toLowerCase().includes(searchAll.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Select Section</p>
        {SECTIONS.map(sec => (
          <button key={sec.id} onClick={() => pickSection(sec)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-all cursor-pointer ${selectedSection?.id === sec.id ? COLOR_MAP[sec.color] + ' ring-2 ring-offset-1 ring-current' : 'border-zinc-200 dark:border-zinc-800 bg-background text-foreground hover:border-indigo-300'
              }`}>
            <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />{sec.label}
            <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {selectedSection ? `In "${selectedSection.label}"` : 'Section Products'}
        </p>
        {!selectedSection ? (
          <div className="py-16 text-center text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">← Select a section</div>
        ) : loadingSection ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : sectionProducts.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">No products in this section</div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
            {sectionProducts.map(p => <ProductRow key={p.id} product={p} action="remove" onAction={handleRemove} loading={actionLoading === p.id} />)}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Add Products</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={searchAll} onChange={e => setSearchAll(e.target.value)} placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        {loadingAll ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[440px] overflow-y-auto pr-1">
            {filteredAll.length === 0 ? <div className="py-8 text-center text-zinc-400 text-sm">No products to add</div>
              : filteredAll.map(p => <ProductRow key={p.id} product={p} action="add" onAction={() => handleAdd(p)} loading={actionLoading === p.id} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Occasions Tab ───────────────────────────────────────────────────────────

function OccasionsTab({ onToast }: { onToast: (msg: string, type: 'success' | 'error') => void }) {
  const [occasions, setOccasions] = useState<{ name: string; image: string }[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [occasionProducts, setOccasionProducts] = useState<CampaignProduct[]>([]);
  const [allProducts, setAllProducts] = useState<CampaignProduct[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newOccasion, setNewOccasion] = useState('');
  const [newImage, setNewImage] = useState('');
  const [searchAll, setSearchAll] = useState('');
  const [editingOccasion, setEditingOccasion] = useState<{ oldName: string } | null>(null);

  const init = useCallback(async () => {
    setLoadingList(true);
    try {
      const [occRes, allRes] = await Promise.all([getOccasionsList(), getAllProductsAdmin()]);
      setOccasions(occRes.data || []);
      setAllProducts(allRes.data || []);
    } catch { onToast('Failed to load data', 'error'); }
    finally { setLoadingList(false); }
  }, [onToast]);

  useEffect(() => { init(); }, [init]);

  const pickOccasion = async (name: string) => {
    setSelectedOccasion(name);
    setLoadingProducts(true);
    try { const r = await getProductsByOccasionName(name); setOccasionProducts(r.data || []); }
    catch { onToast('Failed to load products', 'error'); }
    finally { setLoadingProducts(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 250 * 1024) {
        onToast(`Image size must not exceed 250 KB (${(file.size / 1024).toFixed(1)} KB)`, 'error');
        if (e.target) e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    const t = newOccasion.trim();
    if (!t) { onToast('Enter occasion name', 'error'); return; }
    try {
      const img = newImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop';
      if (editingOccasion) {
        // UPDATE OCCASION
        const res = await updateOccasion(editingOccasion.oldName, t, img);
        if (res && res.status === 'success') {
          setOccasions(prev => {
            const filtered = prev.filter(o => o.name !== editingOccasion.oldName);
            return [...filtered, { name: t, image: img }].sort((a, b) => a.name.localeCompare(b.name));
          });

          if (selectedOccasion === editingOccasion.oldName) {
            setSelectedOccasion(t);
          }

          setEditingOccasion(null);
          setNewOccasion('');
          setNewImage('');
          onToast('Occasion updated successfully', 'success');
        }
      } else {
        // CREATE OCCASION
        const res = await createOrUpdateOccasion(t, img);
        if (res && res.status === 'success') {
          setOccasions(prev => {
            const filtered = prev.filter(o => o.name !== t);
            return [...filtered, { name: t, image: img }].sort((a, b) => a.name.localeCompare(b.name));
          });
          setNewOccasion('');
          setNewImage('');
          pickOccasion(t);
          onToast('Occasion registered successfully', 'success');
        }
      }
    } catch {
      onToast('Operation failed', 'error');
    }
  };

  const handleDeleteOccasion = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent picking deleted occasion
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will clear its placement for all products.`)) return;
    try {
      const res = await deleteOccasion(name);
      if (res && res.status === 'success') {
        setOccasions(prev => prev.filter(o => o.name !== name));
        if (selectedOccasion === name) {
          setSelectedOccasion(null);
          setOccasionProducts([]);
        }
        onToast('Occasion deleted successfully', 'success');
      }
    } catch {
      onToast('Failed to delete occasion', 'error');
    }
  };

  const handleEditClick = (occ: { name: string; image: string }, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent picking editing occasion immediately
    setEditingOccasion({ oldName: occ.name });
    setNewOccasion(occ.name);
    setNewImage(occ.image);
  };

  const handleCancelEdit = () => {
    setEditingOccasion(null);
    setNewOccasion('');
    setNewImage('');
  };

  const handleRemove = async (id: string) => {
    setActionLoading(id);
    try {
      const prod = allProducts.find(x => x.id === id) || occasionProducts.find(x => x.id === id);
      const currentVal = prod?.occasion || '';
      const parts = currentVal.split(',').map(s => s.trim()).filter(Boolean);
      const filtered = parts.filter(x => x !== selectedOccasion);
      const newValue = filtered.length > 0 ? filtered.join(', ') : '';

      await patchProductCampaign(id, { occasion: newValue });
      setOccasionProducts(p => p.filter(x => x.id !== id));
      setAllProducts(prev => prev.map(p => p.id === id ? { ...p, occasion: newValue } : p));
      onToast('Removed from occasion', 'success');
    } catch { onToast('Failed', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleAdd = async (product: CampaignProduct) => {
    if (!selectedOccasion) { onToast('Select an occasion first', 'error'); return; }
    setActionLoading(product.id);
    try {
      const currentVal = product.occasion || '';
      const parts = currentVal.split(',').map(s => s.trim()).filter(Boolean);
      if (!parts.includes(selectedOccasion)) {
        parts.push(selectedOccasion);
      }
      const newValue = parts.join(', ');

      await patchProductCampaign(product.id, { occasion: newValue });
      const updatedProduct = { ...product, occasion: newValue };
      setOccasionProducts(p => [...p, updatedProduct]);
      setAllProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));

      if (!occasions.some(o => o.name === selectedOccasion)) {
        setOccasions(prev => [...prev, { name: selectedOccasion, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop' }].sort((a, b) => a.name.localeCompare(b.name)));
      }

      onToast(`Added to "${selectedOccasion}"`, 'success');
    } catch { onToast('Failed', 'error'); }
    finally { setActionLoading(null); }
  };

  const inOccasion = new Set(occasionProducts.map(p => p.id));
  const filteredAll = allProducts.filter(p => !inOccasion.has(p.id) && p.product_name.toLowerCase().includes(searchAll.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {editingOccasion ? 'Edit Occasion' : 'Occasions'}
        </p>
        <div className="flex flex-col gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <input value={newOccasion} onChange={e => setNewOccasion(e.target.value)}
            placeholder="Occasion name..." className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-sm focus:outline-none focus:border-indigo-500" />

          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-500 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer bg-background transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {newImage ? 'Change Image' : 'Upload Image'}
            </label>
            {newImage && (
              <img src={newImage} alt="" className="w-8 h-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0" />
            )}
          </div>

          <div className="flex gap-2">
            {editingOccasion && (
              <button onClick={handleCancelEdit} className="flex-1 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-bold text-xs cursor-pointer transition-all active:scale-[0.99]">
                Cancel
              </button>
            )}
            <button onClick={handleCreate} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]">
              {editingOccasion ? <RefreshCcw className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {editingOccasion ? 'Update Occasion' : 'Create Occasion'}
            </button>
          </div>
        </div>

        {loadingList ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
          : occasions.length === 0 ? <div className="py-6 text-center text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">No occasions yet</div>
            : (
              <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto pr-1">
                {occasions.map(occ => (
                  <div key={occ.name} className="group relative flex items-center w-full">
                    <button onClick={() => pickOccasion(occ.name)}
                      className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-semibold text-left transition-all cursor-pointer ${selectedOccasion === occ.name ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700' : 'border-zinc-200 dark:border-zinc-800 bg-background text-foreground hover:border-purple-300'
                        }`}>
                      <img src={occ.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop'} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      <span className="truncate pr-16">{occ.name}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-40 group-hover:opacity-0" />
                    </button>

                    {/* Action buttons shown on hover */}
                    <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <button onClick={(e) => handleEditClick(occ, e)} className="p-1 rounded text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer" title="Edit name & image">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => handleDeleteOccasion(occ.name, e)} className="p-1 rounded text-zinc-500 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer" title="Delete occasion">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {selectedOccasion ? `In "${selectedOccasion}"` : 'Occasion Products'}
        </p>
        {!selectedOccasion ? <div className="py-16 text-center text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">← Select an occasion</div>
          : loadingProducts ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
            : occasionProducts.length === 0 ? <div className="py-12 text-center text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">No products yet</div>
              : <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                {occasionProducts.map(p => <ProductRow key={p.id} product={p} action="remove" onAction={handleRemove} loading={actionLoading === p.id} />)}
              </div>}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Add Products</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={searchAll} onChange={e => setSearchAll(e.target.value)} placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex flex-col gap-2 max-h-[440px] overflow-y-auto pr-1">
          {filteredAll.length === 0 ? <div className="py-8 text-center text-zinc-400 text-sm">No products to add</div>
            : filteredAll.map(p => <ProductRow key={p.id} product={p} action="add" onAction={() => handleAdd(p)} loading={actionLoading === p.id} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Flash Sales Tab ─────────────────────────────────────────────────────────

function FlashSalesTab({ onToast }: { onToast: (msg: string, type: 'success' | 'error') => void }) {
  const [saleProducts, setSaleProducts] = useState<CampaignProduct[]>([]);
  const [allProducts, setAllProducts] = useState<CampaignProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchAll, setSearchAll] = useState('');
  const [addingSale, setAddingSale] = useState<CampaignProduct | null>(null);
  const [saleDiscount, setSaleDiscount] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [saleRes, allRes] = await Promise.all([getProductsOnSale(), getAllProductsAdmin()]);
      setSaleProducts(saleRes.data || []);
      setAllProducts(allRes.data || []);
    } catch { onToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, [onToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRemove = async (id: string) => {
    setActionLoading(id);
    try {
      await patchProductCampaign(id, { discounted_price: null });
      setSaleProducts(p => p.filter(x => x.id !== id));
      onToast('Removed from sale', 'success');
    } catch { onToast('Failed', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleApply = async () => {
    if (!addingSale || !saleDiscount) return;
    const pct = parseFloat(saleDiscount);
    if (isNaN(pct) || pct <= 0 || pct >= 100) { onToast('Enter a valid discount (1-99%)', 'error'); return; }
    const finalPrice = Math.round(Number(addingSale.price) * (1 - pct / 100));
    setActionLoading(addingSale.id);
    try {
      await patchProductCampaign(addingSale.id, { discounted_price: finalPrice });
      setSaleProducts(p => [...p, { ...addingSale, discounted_price: finalPrice }]);
      setAddingSale(null);
      setSaleDiscount('');
      onToast(`${addingSale.product_name} on sale at ${pct}% off!`, 'success');
    } catch { onToast('Failed', 'error'); }
    finally { setActionLoading(null); }
  };

  const inSale = new Set(saleProducts.map(p => p.id));
  const filteredAll = allProducts.filter(p => !inSale.has(p.id) && p.product_name.toLowerCase().includes(searchAll.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">On Sale ({saleProducts.length})</p>
          <button onClick={loadData} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"><RefreshCcw className="w-4 h-4" /></button>
        </div>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
          : saleProducts.length === 0 ? <div className="py-12 text-center text-zinc-400 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">No products on sale</div>
            : <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
              {saleProducts.map(p => <ProductRow key={p.id} product={p} action="remove" onAction={handleRemove} loading={actionLoading === p.id} />)}
            </div>}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Add to Flash Sale</p>
        {addingSale && (
          <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={getFirstImage(addingSale.images)} className="w-10 h-10 rounded-lg object-cover" alt="" />
              <div className="flex-1">
                <p className="text-sm font-bold">{addingSale.product_name}</p>
                <p className="text-xs text-zinc-500">Original: ₹{Number(addingSale.price).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setAddingSale(null)} className="p-1 hover:bg-amber-200 rounded-full cursor-pointer"><X className="w-4 h-4 text-amber-700" /></button>
            </div>
            <div className="flex gap-2">
              <input type="number" value={saleDiscount} onChange={e => setSaleDiscount(e.target.value)}
                placeholder="Discount % (e.g. 20)" min="1" max="99"
                className="flex-1 px-3 py-2 rounded-lg border border-amber-300 bg-background text-sm focus:outline-none focus:border-amber-500" />
              <button onClick={handleApply} disabled={!saleDiscount || !!actionLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Apply
              </button>
            </div>
            {saleDiscount && !isNaN(parseFloat(saleDiscount)) && (
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                Final Price: ₹{Math.round(Number(addingSale.price) * (1 - parseFloat(saleDiscount) / 100)).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={searchAll} onChange={e => setSearchAll(e.target.value)} placeholder="Search products to add..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-sm focus:outline-none focus:border-amber-500" />
        </div>
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredAll.length === 0 ? <div className="py-8 text-center text-zinc-400 text-sm">No products available</div>
            : filteredAll.map(p => <ProductRow key={p.id} product={p} action="add" onAction={() => setAddingSale(p)} loading={false} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Main ExtraPage ──────────────────────────────────────────────────────────

type TabType = 'sections' | 'occasions' | 'sales';

interface ExtraPageProps {
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export default function ExtraPage({ onToast }: ExtraPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sections');

  const TABS = [
    { id: 'sections' as TabType, label: 'Homepage Sections', icon: LayoutGrid, desc: 'Top Picks, Deals, New Arrivals, etc.' },
    { id: 'occasions' as TabType, label: 'Occasions', icon: Calendar, desc: 'Festivals, Events & Seasonal groups' },
    { id: 'sales' as TabType, label: 'Flash Sales', icon: Tag, desc: 'Set discounts & flash sale campaigns' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> Campaign Manager
          </h1>
          <p className="text-xs text-zinc-500">Manage homepage sections, occasion groups & flash sale campaigns.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all cursor-pointer ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-background text-foreground border-zinc-200 dark:border-zinc-800 hover:border-indigo-300'
                }`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
              <span className="text-sm font-bold">{tab.label}</span>
              <span className={`text-[11px] leading-relaxed ${isActive ? 'text-indigo-200' : 'text-zinc-500'}`}>{tab.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="premium-card p-6">
        {activeTab === 'sections' && <SectionsTab onToast={onToast} />}
        {activeTab === 'occasions' && <OccasionsTab onToast={onToast} />}
        {activeTab === 'sales' && <FlashSalesTab onToast={onToast} />}
      </div>
    </div>
  );
}
