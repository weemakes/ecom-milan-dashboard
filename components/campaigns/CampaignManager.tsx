'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Layers, 
  Calendar, 
  Plus, 
  Trash2, 
  X, 
  Search, 
  Tag, 
  Check,
  ShoppingBag,
  PlusCircle,
  AlertCircle,
  ArrowLeft,
  Settings,
  FolderTree,
  ChevronDown
} from 'lucide-react';

interface CampaignManagerProps {
  products: any[];
  onUpdateProducts: (updatedProducts: any[]) => void;
  customSections: string[];
  onUpdateSections: (updatedSections: string[]) => void;
  customOccasions: string[];
  onUpdateOccasions: (updatedOccasions: string[]) => void;
  categoriesList?: any[];
}

export default function CampaignManager({
  products,
  onUpdateProducts,
  customSections,
  onUpdateSections,
  customOccasions,
  onUpdateOccasions,
  categoriesList = [],
}: CampaignManagerProps) {
  // Navigation Tabs: 'sections' | 'occasions'
  const [activeTab, setActiveTab] = useState<'sections' | 'occasions'>('sections');
  
  // Mounted state for SSR portal safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dedicated Workspaces state
  const [viewingSectionKey, setViewingSectionKey] = useState<string | null>(null);
  const [viewingOccasionName, setViewingOccasionName] = useState<string | null>(null);

  // Dynamic creation overlays
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [newOccasionName, setNewOccasionName] = useState('');

  // Selector Modal state inside detail workspace
  const [showAddSelector, setShowAddSelector] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');
  const [selectorCategory, setSelectorCategory] = useState('all');

  // Helper: Format DB keys (e.g. "SUMMER_DEALS" -> "Summer Deals")
  const formatName = (key: string) => {
    return key
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper: Convert to DB keys (e.g. "Summer Deals" -> "SUMMER_DEALS")
  const generateKey = (name: string) => {
    return name
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');
  };

  // Create new Custom Section
  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const key = generateKey(newSectionName);
    if (!key) return;

    if (customSections.includes(key)) {
      alert('This section already exists!');
      return;
    }

    const updated = [...customSections, key];
    onUpdateSections(updated);
    setNewSectionName('');
    setShowSectionModal(false);
  };

  // Delete Custom Section (Removes placement key from landing_sections lists)
  const handleDeleteSection = (key: string) => {
    if (!confirm(`Are you sure you want to delete "${formatName(key)}"? Placement will be removed from all products.`)) return;

    const updatedSections = customSections.filter(s => s !== key);
    onUpdateSections(updatedSections);

    const updatedProducts = products.map(p => {
      const currentSections: string[] = Array.isArray(p.landing_sections)
        ? p.landing_sections
        : p.landing_section && p.landing_section !== 'NONE'
          ? [p.landing_section]
          : [];
      const nextSections = currentSections.filter((s: string) => s !== key);
      return { 
        ...p, 
        landing_sections: nextSections,
        landing_section: nextSections[0] || 'NONE'
      };
    });
    onUpdateProducts(updatedProducts);
    if (viewingSectionKey === key) setViewingSectionKey(null);
  };

  // Create new Target Occasion
  const handleCreateOccasion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccasionName.trim()) return;

    const name = newOccasionName.trim();
    if (customOccasions.includes(name)) {
      alert('This occasion already exists!');
      return;
    }

    const updated = [...customOccasions, name];
    onUpdateOccasions(updated);
    setNewOccasionName('');
    setShowOccasionModal(false);
  };

  // Delete Occasion (Removes occasion tag from all mapped products)
  const handleDeleteOccasion = (name: string) => {
    if (!confirm(`Are you sure you want to delete occasion "${name}"? Occasion placement will be removed from all products.`)) return;

    const updatedOccasions = customOccasions.filter(o => o !== name);
    onUpdateOccasions(updatedOccasions);

    const updatedProducts = products.map(p => {
      const currentOccasions: string[] = Array.isArray(p.occasions)
        ? p.occasions
        : p.occasion
          ? [p.occasion]
          : [];
      const nextOccasions = currentOccasions.filter((o: string) => o !== name);
      return { 
        ...p, 
        occasions: nextOccasions,
        occasion: nextOccasions[0] || null
      };
    });
    onUpdateProducts(updatedProducts);
    if (viewingOccasionName === name) setViewingOccasionName(null);
  };

  // Assign product to Section (Appends to array of sections)
  const handleAddProductToSection = (productId: string, sectionKey: string) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const currentSections: string[] = Array.isArray(p.landing_sections)
          ? p.landing_sections
          : p.landing_section && p.landing_section !== 'NONE'
            ? [p.landing_section]
            : [];
        const nextSections = currentSections.includes(sectionKey)
          ? currentSections
          : [...currentSections, sectionKey];
        return { 
          ...p, 
          landing_sections: nextSections,
          landing_section: nextSections[0] || 'NONE'
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // Remove product from Section (Removes from array of sections)
  const handleRemoveProductFromSection = (productId: string, sectionKey: string) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const currentSections: string[] = Array.isArray(p.landing_sections)
          ? p.landing_sections
          : p.landing_section && p.landing_section !== 'NONE'
            ? [p.landing_section]
            : [];
        const nextSections = currentSections.filter((s: string) => s !== sectionKey);
        return { 
          ...p, 
          landing_sections: nextSections,
          landing_section: nextSections[0] || 'NONE'
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // Assign product to Occasion (Appends to array of occasions)
  const handleAddProductToOccasion = (productId: string, occasionName: string) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const currentOccasions: string[] = Array.isArray(p.occasions)
          ? p.occasions
          : p.occasion
            ? [p.occasion]
            : [];
        const nextOccasions = currentOccasions.includes(occasionName)
          ? currentOccasions
          : [...currentOccasions, occasionName];
        return { 
          ...p, 
          occasions: nextOccasions,
          occasion: nextOccasions[0] || null
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // Remove product from Occasion (Removes from array of occasions)
  const handleRemoveProductFromOccasion = (productId: string, occasionName: string) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const currentOccasions: string[] = Array.isArray(p.occasions)
          ? p.occasions
          : p.occasion
            ? [p.occasion]
            : [];
        const nextOccasions = currentOccasions.filter((o: string) => o !== occasionName);
        return { 
          ...p, 
          occasions: nextOccasions,
          occasion: nextOccasions[0] || null
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // ----------------------------------------------------
  // PORTAL OVERLAY: PRODUCT SELECTOR MODAL
  // ----------------------------------------------------
  const renderProductSelectorModal = (contextType: 'section' | 'occasion', targetName: string) => {
    if (!mounted) return null;

    let list = products;
    
    // Search query filter
    if (selectorSearch.trim()) {
      const query = selectorSearch.toLowerCase();
      list = list.filter(p => 
        p.product_name.toLowerCase().includes(query) || 
        (p.sku && p.sku.toLowerCase().includes(query))
      );
    }

    // Category filter matching
    if (selectorCategory !== 'all') {
      list = list.filter(p => p.category_id === selectorCategory);
    }

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[12px] animate-fade-in">
        <div className="absolute inset-0 -z-10" onClick={() => setShowAddSelector(false)} />
        
        <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[80vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/50 flex-shrink-0">
            <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100 tracking-tight uppercase">
              Add Products to: {targetName}
            </h3>
            <button onClick={() => setShowAddSelector(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-slate-700 cursor-pointer">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Filter Bar Panel */}
          <div className="p-4 border-b border-slate-100 dark:border-zinc-900/60 bg-slate-50/20 dark:bg-zinc-950/20 flex-shrink-0 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-450 dark:text-zinc-550" />
              <input
                type="text"
                value={selectorSearch}
                onChange={e => setSelectorSearch(e.target.value)}
                placeholder="Search product name or SKU..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-foreground focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            {/* Category Select Filter with custom arrow Chevron */}
            <div className="relative min-w-[160px]">
              <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-450 pointer-events-none" />
              <select
                value={selectorCategory}
                onChange={e => setSelectorCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl border border-slate-200/60 dark:border-zinc-855 bg-white dark:bg-zinc-950 text-foreground focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
              >
                <option value="all">All Categories</option>
                {categoriesList.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Scroll List container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 font-medium">
            {list.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center text-zinc-400 gap-2">
                <AlertCircle className="w-8 h-8 text-zinc-300" />
                <span className="text-xs">No products match your search filters.</span>
              </div>
            ) : (
              list.map(p => {
                const isAssigned = contextType === 'section'
                  ? (() => {
                      const secs: string[] = Array.isArray(p.landing_sections)
                        ? p.landing_sections
                        : p.landing_section && p.landing_section !== 'NONE'
                          ? [p.landing_section]
                          : [];
                      return secs.includes(viewingSectionKey || '');
                    })()
                  : (() => {
                      const occs: string[] = Array.isArray(p.occasions)
                        ? p.occasions
                        : p.occasion
                          ? [p.occasion]
                          : [];
                      return occs.includes(viewingOccasionName || '');
                    })();
                
                const categoryObj = categoriesList.find(c => c.id === p.category_id);

                return (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-zinc-900/40 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">{p.product_name}</span>
                        <span className="text-[10px] text-zinc-400">
                          {categoryObj ? categoryObj.name : 'Unknown Category'}
                        </span>
                      </div>
                    </div>

                    {isAssigned ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (contextType === 'section' && viewingSectionKey) {
                            handleAddProductToSection(p.id, viewingSectionKey);
                          } else if (contextType === 'occasion' && viewingOccasionName) {
                            handleAddProductToOccasion(p.id, viewingOccasionName);
                          }
                        }}
                        className="px-3.5 py-1.5 text-[10px] font-bold border border-indigo-500/20 text-indigo-600 hover:bg-indigo-650 hover:text-white dark:text-indigo-400 dark:border-indigo-400/20 hover:dark:bg-indigo-500 rounded-xl transition-all cursor-pointer"
                      >
                        Add to {contextType === 'section' ? 'Section' : 'Occasion'}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/30 dark:bg-zinc-950/30 flex justify-end flex-shrink-0">
            <button
              onClick={() => setShowAddSelector(false)}
              className="px-5 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // ----------------------------------------------------
  // WORKSPACE VIEW: LANDING SECTION MANAGEMENT
  // ----------------------------------------------------
  if (viewingSectionKey) {
    const assignedProducts = products.filter(p => {
      const currentSections: string[] = Array.isArray(p.landing_sections)
        ? p.landing_sections
        : p.landing_section && p.landing_section !== 'NONE'
          ? [p.landing_section]
          : [];
      return currentSections.includes(viewingSectionKey);
    });

    return (
      <div className="flex flex-col gap-6 animate-fade-in text-foreground select-none">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-5 gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => { setViewingSectionKey(null); setShowAddSelector(false); }}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center cursor-pointer bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-foreground">{formatName(viewingSectionKey)} Products</h1>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-md uppercase">
                  {assignedProducts.length} Items
                </span>
              </div>
              <p className="text-xs text-zinc-500">Configure catalog products mapped under this dynamic landing placement.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 font-bold">
            {/* Add Product trigger */}
            <button
              onClick={() => { setShowAddSelector(true); setSelectorSearch(''); setSelectorCategory('all'); }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs rounded-xl shadow-md shadow-indigo-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
            
            {!['HERO', 'TRENDING', 'NEW_ARRIVALS', 'DISCOUNTS'].includes(viewingSectionKey) && (
              <button
                onClick={() => handleDeleteSection(viewingSectionKey)}
                className="px-4 py-2.5 text-xs text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Layout
              </button>
            )}
          </div>
        </div>

        {/* Spacious Table View of Assigned Products */}
        <div className="flex flex-col gap-4 font-medium">
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
            {assignedProducts.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-2.5 text-zinc-400 bg-slate-50/10 dark:bg-zinc-950/20">
                <ShoppingBag className="w-12 h-12 text-zinc-300 dark:text-zinc-850" />
                <span className="text-xs">No products are currently assigned to this section.</span>
                <button
                  onClick={() => { setShowAddSelector(true); setSelectorSearch(''); setSelectorCategory('all'); }}
                  className="mt-1.5 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Add Items Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-zinc-950/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-zinc-900">
                      <th className="px-6 py-4">Product Details</th>
                      <th className="px-6 py-4">SKU Code</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Pricing</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs">
                    {assignedProducts.map(p => {
                      const categoryObj = categoriesList.find(c => c.id === p.category_id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/20 dark:hover:bg-zinc-900/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {p.images && p.images[0] ? (
                                  <img src={p.images[0]} alt={p.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <Tag className="w-5 h-5 text-zinc-400" />
                                )}
                              </div>
                              <span className="font-bold text-foreground line-clamp-1">{p.product_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-505 font-mono">{p.sku || '—'}</td>
                          <td className="px-6 py-4">
                            <span className="text-zinc-505 font-bold bg-slate-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg">
                              {categoryObj ? categoryObj.name : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">₹{p.discounted_price || p.price}</span>
                              {p.discounted_price && (
                                <span className="text-[10px] text-zinc-400 line-through">₹{p.price}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRemoveProductFromSection(p.id, viewingSectionKey)}
                              className="px-3.5 py-2 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl text-[11px] font-bold transition-all cursor-pointer animate-fade-in"
                            >
                              Remove Item
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal invocation */}
        {showAddSelector && renderProductSelectorModal('section', formatName(viewingSectionKey))}
      </div>
    );
  }

  // ----------------------------------------------------
  // WORKSPACE VIEW: TARGET OCCASION MANAGEMENT
  // ----------------------------------------------------
  if (viewingOccasionName) {
    const assignedProducts = products.filter(p => {
      const currentOccasions: string[] = Array.isArray(p.occasions)
        ? p.occasions
        : p.occasion
          ? [p.occasion]
          : [];
      return currentOccasions.includes(viewingOccasionName);
    });

    return (
      <div className="flex flex-col gap-6 animate-fade-in text-foreground select-none">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-5 gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => { setViewingOccasionName(null); setShowAddSelector(false); }}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center cursor-pointer bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-foreground">Occasion: {viewingOccasionName}</h1>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-md uppercase">
                  {assignedProducts.length} Items
                </span>
              </div>
              <p className="text-xs text-zinc-500">Configure catalog products mapped under this dynamic occasion event.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 font-bold">
            {/* Add Product trigger */}
            <button
              onClick={() => { setShowAddSelector(true); setSelectorSearch(''); setSelectorCategory('all'); }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs rounded-xl shadow-md shadow-indigo-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>

            <button
              onClick={() => handleDeleteOccasion(viewingOccasionName)}
              className="px-4 py-2.5 text-xs text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Delete Occasion
            </button>
          </div>
        </div>

        {/* Spacious Table View of Assigned Products */}
        <div className="flex flex-col gap-4 font-medium">
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
            {assignedProducts.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-2.5 text-zinc-400 bg-slate-50/10 dark:bg-zinc-950/20">
                <Tag className="w-12 h-12 text-zinc-300 dark:text-zinc-850" />
                <span className="text-xs">No products are currently assigned to this occasion.</span>
                <button
                  onClick={() => { setShowAddSelector(true); setSelectorSearch(''); setSelectorCategory('all'); }}
                  className="mt-1.5 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Add Items Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-zinc-950/50 text-[10px] font-bold uppercase tracking-wider text-slate-550 border-b border-slate-100 dark:border-zinc-900">
                      <th className="px-6 py-4">Product Details</th>
                      <th className="px-6 py-4">SKU Code</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Pricing</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs">
                    {assignedProducts.map(p => {
                      const categoryObj = categoriesList.find(c => c.id === p.category_id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/20 dark:hover:bg-zinc-900/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {p.images && p.images[0] ? (
                                  <img src={p.images[0]} alt={p.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <Tag className="w-5 h-5 text-zinc-400" />
                                )}
                              </div>
                              <span className="font-bold text-foreground line-clamp-1">{p.product_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-505 font-mono">{p.sku || '—'}</td>
                          <td className="px-6 py-4">
                            <span className="text-zinc-505 font-bold bg-slate-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg">
                              {categoryObj ? categoryObj.name : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">₹{p.discounted_price || p.price}</span>
                              {p.discounted_price && (
                                <span className="text-[10px] text-zinc-400 line-through">₹{p.price}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRemoveProductFromOccasion(p.id, viewingOccasionName)}
                              className="px-3.5 py-2 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl text-[11px] font-bold transition-all cursor-pointer animate-fade-in"
                            >
                              Remove Item
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal invocation */}
        {showAddSelector && renderProductSelectorModal('occasion', viewingOccasionName)}
      </div>
    );
  }

  // ----------------------------------------------------
  // CORE DASHBOARD VIEW: OVERVIEW PLACEMENTS & OCCASIONS
  // ----------------------------------------------------
  return (
    <div className="flex flex-col gap-6 animate-fade-in text-foreground select-none">
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-505" />
            Campaign & Layout Builder
          </h1>
          <p className="text-xs text-zinc-500">Dynamically build landing sections and target catalog occasions.</p>
        </div>

        {/* Tab Selector Segment slider */}
        <div className="flex border border-zinc-200/50 dark:border-zinc-800/50 p-1 bg-zinc-100/80 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl w-full md:w-auto font-bold">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-white dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/40 dark:border-zinc-850'
                : 'text-zinc-500 hover:text-foreground'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Landing Sections</span>
          </button>
          <button
            onClick={() => setActiveTab('occasions')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === 'occasions'
                ? 'bg-white dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/40 dark:border-zinc-855'
                : 'text-zinc-500 hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Occasions Group</span>
          </button>
        </div>
      </div>

      {/* Landing page sections placements list */}
      {activeTab === 'sections' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Active Landing Page Placements</h2>
            <button
              onClick={() => setShowSectionModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Custom Section
            </button>
          </div>

          {/* Clean table list view (No Product Previews inside cards) */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
            {customSections.map(key => {
              const assigned = products.filter(p => {
                const currentSections: string[] = Array.isArray(p.landing_sections)
                  ? p.landing_sections
                  : p.landing_section && p.landing_section !== 'NONE'
                    ? [p.landing_section]
                    : [];
                return currentSections.includes(key);
              });
              
              return (
                <div key={key} className="flex items-center justify-between p-4.5 hover:bg-slate-50/20 dark:hover:bg-zinc-900/10 transition-all hover:border-indigo-500/20">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-500/25">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-zinc-150">{formatName(key)}</span>
                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5">DB placement key: {key}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 font-bold">
                    <span className="text-xs text-indigo-600 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-full">
                      {assigned.length} items
                    </span>

                    <button
                      onClick={() => setViewingSectionKey(key)}
                      className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs rounded-xl shadow-md shadow-indigo-500/10 transition-all cursor-pointer"
                    >
                      View All
                    </button>

                    {/* Delete for custom ones */}
                    {!['HERO', 'TRENDING', 'NEW_ARRIVALS', 'DISCOUNTS'].includes(key) ? (
                      <button
                        onClick={() => handleDeleteSection(key)}
                        className="p-2.5 rounded-xl hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 border border-transparent hover:border-rose-500/10 transition-all cursor-pointer"
                        title="Delete Layout"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    ) : (
                      <div className="w-10 h-10" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Occasions categories list */}
      {activeTab === 'occasions' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Active Target Occasions</h2>
            <button
              onClick={() => setShowOccasionModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Custom Occasion
            </button>
          </div>

          {/* Clean table list view (No Product Previews inside cards) */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
            {customOccasions.map(name => {
              const assigned = products.filter(p => {
                const currentOccasions: string[] = Array.isArray(p.occasions)
                  ? p.occasions
                  : p.occasion
                    ? [p.occasion]
                    : [];
                return currentOccasions.includes(name);
              });
              
              return (
                <div key={name} className="flex items-center justify-between p-4.5 hover:bg-slate-50/20 dark:hover:bg-zinc-900/10 transition-all hover:border-indigo-500/20">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-500/25">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-150">{name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 font-bold">
                    <span className="text-xs text-indigo-600 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-full">
                      {assigned.length} items
                    </span>

                    <button
                      onClick={() => setViewingOccasionName(name)}
                      className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs rounded-xl shadow-md shadow-indigo-500/10 transition-all cursor-pointer"
                    >
                      View All
                    </button>

                    <button
                      onClick={() => handleDeleteOccasion(name)}
                      className="p-2.5 rounded-xl hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 border border-transparent hover:border-rose-500/10 transition-all cursor-pointer"
                      title="Delete Occasion"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM LANDING SECTION */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-[8px] animate-fade-in">
          <div className="absolute inset-0 -z-10" onClick={() => setShowSectionModal(false)} />
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/50">
              <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100 tracking-tight uppercase">Add Custom Layout Section</h3>
              <button onClick={() => setShowSectionModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSection} className="p-6 flex flex-col gap-4 font-semibold text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Section Display Name *</label>
                <div className="relative">
                  <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={e => setNewSectionName(e.target.value)}
                    placeholder="e.g. Festival Specials, Winter Deals"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="px-4 py-2 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TARGET OCCASION */}
      {showOccasionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-[8px] animate-fade-in">
          <div className="absolute inset-0 -z-10" onClick={() => setShowOccasionModal(false)} />
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/50">
              <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100 tracking-tight uppercase">Add Custom Occasion Group</h3>
              <button onClick={() => setShowOccasionModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOccasion} className="p-6 flex flex-col gap-4 font-semibold text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Occasion Name *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={newOccasionName}
                    onChange={e => setNewOccasionName(e.target.value)}
                    placeholder="e.g. Diwali Specials, Summer Party"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowOccasionModal(false)}
                  className="px-4 py-2 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-zinc-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
