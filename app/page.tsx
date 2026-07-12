'use client';

import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatsOverview from '@/components/dashboard/StatsOverview';
import VendorTable from '@/components/vendors/VendorTable';
import VendorForm from '@/components/vendors/VendorForm';
import CategoryGrid from '@/components/categories/CategoryGrid';
import CategoryForm from '@/components/categories/CategoryForm';
import ProductTable from '@/components/products/ProductTable';
import ProductForm from '@/components/products/ProductForm';
import Modal from '@/components/ui/Modal';
import Toast, { ToastType } from '@/components/ui/Toast';
import { Plus, RefreshCcw } from 'lucide-react';
import { 
  Vendor, 
  ProductCategory, 
  ProductDetail,
  SEED_VENDORS,
  SEED_CATEGORIES,
  SEED_PRODUCTS
} from '@/lib/seedData';

// Generate safe UUIDs for new records on client side
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export default function AppMain() {
  // Authentication & Layout State
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Global Data Lists (Client-side state)
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Loading States (Simulate local query latency)
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Search & Filter States
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');

  const [categorySearch, setCategorySearch] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState('all');

  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [productVendFilter, setProductVendFilter] = useState('all');
  const [productActiveFilter, setProductActiveFilter] = useState('all');

  // Modals & Form Edits State
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Note: For backend integration later, you can import and call services/api.ts functions directly.
  // const USE_LIVE_BACKEND = false;

  // Initialize client dataset in localStorage
  useEffect(() => {
    // 1. Theme Configuration
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }

    // 2. Local Dataset Seeding
    if (!localStorage.getItem('vendors')) {
      localStorage.setItem('vendors', JSON.stringify(SEED_VENDORS));
    }
    if (!localStorage.getItem('categories')) {
      localStorage.setItem('categories', JSON.stringify(SEED_CATEGORIES));
    }
    if (!localStorage.getItem('products')) {
      localStorage.setItem('products', JSON.stringify(SEED_PRODUCTS));
    }

    // 3. Authenticate Session
    const savedUser = localStorage.getItem('userSession');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('userSession');
      }
    }
    setAuthChecked(true);
  }, []);

  // Fetch / Query Data Local Routines
  const queryVendors = () => {
    setLoadingVendors(true);
    try {
      const stored = localStorage.getItem('vendors');
      let list: Vendor[] = stored ? JSON.parse(stored) : [];

      if (vendorSearch) {
        const query = vendorSearch.toLowerCase();
        list = list.filter(
          v =>
            v.name.toLowerCase().includes(query) ||
            v.email.toLowerCase().includes(query) ||
            v.phone.toLowerCase().includes(query)
        );
      }

      if (vendorStatusFilter !== 'all') {
        const isActiveVal = vendorStatusFilter === 'active';
        list = list.filter(v => v.is_active === isActiveVal);
      }

      setVendors(list);
    } catch (e) {
      showToast('Error reading vendor list.', 'error');
    } finally {
      setLoadingVendors(false);
    }
  };

  const queryCategories = () => {
    setLoadingCategories(true);
    try {
      const storedCat = localStorage.getItem('categories');
      const storedVend = localStorage.getItem('vendors');
      
      let list: ProductCategory[] = storedCat ? JSON.parse(storedCat) : [];
      const vendorList: Vendor[] = storedVend ? JSON.parse(storedVend) : [];

      if (categorySearch) {
        const query = categorySearch.toLowerCase();
        list = list.filter(
          c =>
            c.category_name.toLowerCase().includes(query) ||
            (c.category_description && c.category_description.toLowerCase().includes(query))
        );
      }

      if (categoryStatusFilter !== 'all') {
        const isActiveVal = categoryStatusFilter === 'active';
        list = list.filter(c => c.is_active === isActiveVal);
      }

      // Join parent and vendor names in Javascript
      const enriched = list.map(c => {
        const parent = list.find(pc => pc.id === c.parent_category_id);
        const vendor = vendorList.find(v => v.id === c.vendor_id);
        return {
          ...c,
          parent_category_name: parent ? parent.category_name : null,
          vendor_name: vendor ? vendor.name : null,
        };
      });

      setCategories(enriched as any);
    } catch (e) {
      showToast('Error reading category list.', 'error');
    } finally {
      setLoadingCategories(false);
    }
  };

  const queryProducts = () => {
    setLoadingProducts(true);
    try {
      const storedProd = localStorage.getItem('products');
      const storedCat = localStorage.getItem('categories');
      const storedVend = localStorage.getItem('vendors');

      let list: ProductDetail[] = storedProd ? JSON.parse(storedProd) : [];
      const catList: ProductCategory[] = storedCat ? JSON.parse(storedCat) : [];
      const vendList: Vendor[] = storedVend ? JSON.parse(storedVend) : [];

      if (productSearch) {
        const query = productSearch.toLowerCase();
        list = list.filter(
          p =>
            p.product_name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.sku && p.sku.toLowerCase().includes(query))
        );
      }

      if (productCatFilter !== 'all') {
        list = list.filter(p => p.category_id === productCatFilter);
      }

      if (productVendFilter !== 'all') {
        list = list.filter(p => p.vendor_id === productVendFilter);
      }

      if (productActiveFilter !== 'all') {
        const isActiveVal = productActiveFilter === 'active';
        list = list.filter(p => p.is_active === isActiveVal);
      }

      // Join Category name and Vendor name
      const enriched = list.map(p => {
        const cat = catList.find(c => c.id === p.category_id);
        const vend = vendList.find(v => v.id === p.vendor_id);
        return {
          ...p,
          category_name: cat ? cat.category_name : 'Unknown Category',
          vendor_name: vend ? vend.name : 'Unknown Vendor',
        };
      });

      setProducts(enriched);
    } catch (e) {
      showToast('Error reading product catalog.', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Triggers updates on local dependencies
  useEffect(() => {
    if (user) queryVendors();
  }, [user, vendorSearch, vendorStatusFilter]);

  useEffect(() => {
    if (user) queryCategories();
  }, [user, categorySearch, categoryStatusFilter]);

  useEffect(() => {
    if (user) queryProducts();
  }, [user, productSearch, productCatFilter, productVendFilter, productActiveFilter]);

  // Toast Helper
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  // Auth Functions
  const handleLoginSuccess = (loggedInVendor: { id: string; name: string; email: string }) => {
    setUser(loggedInVendor);
    localStorage.setItem('userSession', JSON.stringify(loggedInVendor));
    showToast(`Welcome back, ${loggedInVendor.name}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userSession');
    showToast('Signed out successfully.', 'info');
  };

  // Local CRUD operations - VENDORS
  const handleVendorSubmit = (formData: any) => {
    try {
      const stored = localStorage.getItem('vendors');
      const list: Vendor[] = stored ? JSON.parse(stored) : [];

      if (editingVendor) {
        // Edit mode
        const index = list.findIndex(v => v.id === editingVendor.id);
        if (index !== -1) {
          list[index] = {
            ...list[index],
            ...formData,
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem('vendors', JSON.stringify(list));
          showToast('Merchant details updated successfully.', 'success');
        }
      } else {
        // Create mode
        const emailExists = list.some(v => v.email.toLowerCase() === formData.email.toLowerCase());
        const phoneExists = list.some(v => v.phone === formData.phone);
        if (emailExists) return showToast('Email already registered.', 'error');
        if (phoneExists) return showToast('Phone number already registered.', 'error');

        const newVendor: Vendor = {
          ...formData,
          id: 'v-' + generateUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        list.unshift(newVendor);
        localStorage.setItem('vendors', JSON.stringify(list));
        showToast('New vendor merchant registered!', 'success');
      }

      setVendorModalOpen(false);
      setEditingVendor(null);
      queryVendors();
    } catch (e) {
      showToast('Failed to save vendor details.', 'error');
    }
  };

  const handleToggleVendorStatus = (id: string, currentStatus: boolean) => {
    try {
      const stored = localStorage.getItem('vendors');
      const list: Vendor[] = stored ? JSON.parse(stored) : [];
      const index = list.findIndex(v => v.id === id);
      
      if (index !== -1) {
        list[index].is_active = !currentStatus;
        list[index].updated_at = new Date().toISOString();
        localStorage.setItem('vendors', JSON.stringify(list));
        showToast('Vendor active status toggled.', 'success');
        queryVendors();
      }
    } catch (e) {
      showToast('Error changing vendor status.', 'error');
    }
  };

  const handleVendorDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this merchant account?')) return;
    try {
      const stored = localStorage.getItem('vendors');
      let list: Vendor[] = stored ? JSON.parse(stored) : [];
      list = list.filter(v => v.id !== id);
      localStorage.setItem('vendors', JSON.stringify(list));
      showToast('Vendor account deleted.', 'success');
      queryVendors();
    } catch (e) {
      showToast('Failed to delete merchant.', 'error');
    }
  };

  // Local CRUD operations - CATEGORIES
  const handleCategorySubmit = (formData: any) => {
    try {
      const stored = localStorage.getItem('categories');
      const list: ProductCategory[] = stored ? JSON.parse(stored) : [];
      const slug = slugify(formData.category_name);

      if (editingCategory) {
        const index = list.findIndex(c => c.id === editingCategory.id);
        if (index !== -1) {
          list[index] = {
            ...list[index],
            ...formData,
            category_slug: slug,
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem('categories', JSON.stringify(list));
          showToast('Category catalog updated successfully.', 'success');
        }
      } else {
        const exists = list.some(c => c.category_name.toLowerCase() === formData.category_name.toLowerCase());
        if (exists) return showToast('Category name already exists.', 'error');

        const newCategory: ProductCategory = {
          ...formData,
          id: 'c-' + generateUUID(),
          category_slug: slug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        list.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(list));
        showToast('Category created successfully!', 'success');
      }

      setCategoryModalOpen(false);
      setEditingCategory(null);
      queryCategories();
    } catch (e) {
      showToast('Failed to save category details.', 'error');
    }
  };

  const handleCategoryDelete = (id: string) => {
    if (!confirm('Remove this category from the catalog? Child categories will become top-level.')) return;
    try {
      const stored = localStorage.getItem('categories');
      let list: ProductCategory[] = stored ? JSON.parse(stored) : [];

      // Unbind child categories
      list.forEach(c => {
        if (c.parent_category_id === id) {
          c.parent_category_id = null;
        }
      });

      list = list.filter(c => c.id !== id);
      localStorage.setItem('categories', JSON.stringify(list));
      showToast('Category deleted successfully.', 'success');
      queryCategories();
      queryProducts(); // update products in case of restrict bindings
    } catch (e) {
      showToast('Failed to delete category.', 'error');
    }
  };

  // Local CRUD operations - PRODUCTS
  const handleProductSubmit = (formData: any) => {
    try {
      const stored = localStorage.getItem('products');
      const list: ProductDetail[] = stored ? JSON.parse(stored) : [];
      const slug = slugify(formData.product_name);

      if (editingProduct) {
        const index = list.findIndex(p => p.id === editingProduct.id);
        if (index !== -1) {
          list[index] = {
            ...list[index],
            ...formData,
            product_slug: slug,
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem('products', JSON.stringify(list));
          showToast('Product updated successfully.', 'success');
        }
      } else {
        if (formData.sku) {
          const skuExists = list.some(p => p.sku === formData.sku);
          if (skuExists) return showToast('SKU code already exists.', 'error');
        }

        const newProduct: ProductDetail = {
          ...formData,
          id: 'p-' + generateUUID(),
          product_slug: slug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        list.unshift(newProduct);
        localStorage.setItem('products', JSON.stringify(list));
        showToast('Product added to merchant catalog!', 'success');
      }

      setProductModalOpen(false);
      setEditingProduct(null);
      queryProducts();
    } catch (e) {
      showToast('Failed to save product details.', 'error');
    }
  };

  const handleToggleProductActive = (id: string, currentStatus: boolean) => {
    try {
      const stored = localStorage.getItem('products');
      const list: ProductDetail[] = stored ? JSON.parse(stored) : [];
      const index = list.findIndex(p => p.id === id);

      if (index !== -1) {
        list[index].is_active = !currentStatus;
        list[index].updated_at = new Date().toISOString();
        localStorage.setItem('products', JSON.stringify(list));
        showToast('Product active status changed.', 'success');
        queryProducts();
      }
    } catch (e) {
      showToast('Failed to change product status.', 'error');
    }
  };

  const handleToggleProductFeatured = (id: string, currentStatus: boolean) => {
    try {
      const stored = localStorage.getItem('products');
      const list: ProductDetail[] = stored ? JSON.parse(stored) : [];
      const index = list.findIndex(p => p.id === id);

      if (index !== -1) {
        list[index].is_featured = !currentStatus;
        list[index].updated_at = new Date().toISOString();
        localStorage.setItem('products', JSON.stringify(list));
        showToast(!currentStatus ? 'Product spotlight active.' : 'Product spotlight disabled.', 'success');
        queryProducts();
      }
    } catch (e) {
      showToast('Failed to change featured status.', 'error');
    }
  };

  const handleProductDelete = (id: string) => {
    if (!confirm('Remove this product from catalog inventory?')) return;
    try {
      const stored = localStorage.getItem('products');
      let list: ProductDetail[] = stored ? JSON.parse(stored) : [];
      list = list.filter(p => p.id !== id);
      localStorage.setItem('products', JSON.stringify(list));
      showToast('Product deleted successfully.', 'success');
      queryProducts();
    } catch (e) {
      showToast('Failed to delete product.', 'error');
    }
  };

  // Metrics calculators
  const getStats = () => {
    const avgPrice = products.length > 0 
      ? products.reduce((acc, p) => acc + Number(p.price), 0) / products.length 
      : 0;

    return {
      totalVendors: vendors.length,
      activeVendors: vendors.filter(v => v.is_active).length,
      totalCategories: categories.length,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.is_active).length,
      averagePrice: avgPrice,
    };
  };

  // Auth gate
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-all duration-300">
      
      {/* Sidebar Layout */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        vendorName={user.name}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header (dbType forces mock status display for pure frontend) */}
        <Header currentTab={currentTab} vendorName={user.name} dbType="mock" />

        {/* tab page routing switcher */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* TAB: DASHBOARD */}
            {currentTab === 'dashboard' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
                  <div>
                    <h1 className="text-xl font-black text-foreground">Welcome to merchant center, {user.name}</h1>
                    <p className="text-xs text-zinc-500">Overview of e-commerce activities and active connections.</p>
                  </div>
                  <button 
                    onClick={() => {
                      queryVendors(); queryCategories(); queryProducts();
                      showToast('Dashboard metrics refreshed.', 'success');
                    }}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-indigo-500/30 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/10"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" /> Refresh Dashboard
                  </button>
                </div>

                <StatsOverview stats={getStats()} />
              </div>
            )}

            {/* TAB: VENDORS */}
            {currentTab === 'vendors' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-bold text-foreground">Registered Merchants</h1>
                    <p className="text-xs text-zinc-500">Manage and verify partner vendor accounts.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingVendor(null);
                      setVendorModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow shadow-indigo-600/10 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" /> Create Vendor
                  </button>
                </div>

                <VendorTable
                  vendors={vendors}
                  loading={loadingVendors}
                  onEdit={(vendor) => {
                    setEditingVendor(vendor);
                    setVendorModalOpen(true);
                  }}
                  onDelete={handleVendorDelete}
                  onToggleStatus={handleToggleVendorStatus}
                  searchQuery={vendorSearch}
                  setSearchQuery={setVendorSearch}
                  statusFilter={vendorStatusFilter}
                  setStatusFilter={setVendorStatusFilter}
                />
              </div>
            )}

            {/* TAB: CATEGORIES */}
            {currentTab === 'categories' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-bold text-foreground">Catalog Segments</h1>
                    <p className="text-xs text-zinc-500">Organize items into tree category groups.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow shadow-indigo-600/10 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" /> Create Category
                  </button>
                </div>

                <CategoryGrid
                  categories={categories}
                  loading={loadingCategories}
                  onEdit={(cat) => {
                    setEditingCategory(cat);
                    setCategoryModalOpen(true);
                  }}
                  onDelete={handleCategoryDelete}
                  searchQuery={categorySearch}
                  setSearchQuery={setCategorySearch}
                  statusFilter={categoryStatusFilter}
                  setStatusFilter={setCategoryStatusFilter}
                />
              </div>
            )}

            {/* TAB: PRODUCTS */}
            {currentTab === 'products' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-bold text-foreground">Products Catalog</h1>
                    <p className="text-xs text-zinc-500">Edit products, configurations, pricing, and stock.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow shadow-indigo-600/10 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" /> Create Product
                  </button>
                </div>

                <ProductTable
                  products={products}
                  categoriesList={categories}
                  vendorsList={vendors}
                  loading={loadingProducts}
                  onEdit={(prod) => {
                    setEditingProduct(prod);
                    setProductModalOpen(true);
                  }}
                  onDelete={handleProductDelete}
                  onToggleActive={handleToggleProductActive}
                  onToggleFeatured={handleToggleProductFeatured}
                  searchQuery={productSearch}
                  setSearchQuery={setProductSearch}
                  categoryFilter={productCatFilter}
                  setCategoryFilter={setProductCatFilter}
                  vendorFilter={productVendFilter}
                  setVendorFilter={setProductVendFilter}
                  activeFilter={productActiveFilter}
                  setActiveFilter={setProductActiveFilter}
                />
              </div>
            )}

          </div>
        </main>
      </div>

      {/* MODAL: VENDOR CREATE/EDIT */}
      <Modal
        isOpen={vendorModalOpen}
        onClose={() => {
          setVendorModalOpen(false);
          setEditingVendor(null);
        }}
        title={editingVendor ? 'Edit Vendor Credentials' : 'Register New Partner Merchant'}
        position="center"
        size="md"
      >
        <VendorForm
          vendor={editingVendor}
          onSubmit={handleVendorSubmit}
          onCancel={() => {
            setVendorModalOpen(false);
            setEditingVendor(null);
          }}
        />
      </Modal>

      {/* MODAL: CATEGORY CREATE/EDIT */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit Catalog Segment' : 'Create Custom Product Category'}
        position="center"
        size="lg"
      >
        <CategoryForm
          category={editingCategory}
          categoriesList={categories}
          vendorsList={vendors}
          onSubmit={handleCategorySubmit}
          onCancel={() => {
            setCategoryModalOpen(false);
            setEditingCategory(null);
          }}
        />
      </Modal>

      {/* MODAL: PRODUCT CREATE/EDIT */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Update Catalog Product' : 'Add Item to Global E-Commerce Catalog'}
        position="center"
        size="xl"
      >
        <ProductForm
          product={editingProduct}
          categoriesList={categories}
          vendorsList={vendors}
          onSubmit={handleProductSubmit}
          onCancel={() => {
            setProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

      {/* TOAST NOTIFIER */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
