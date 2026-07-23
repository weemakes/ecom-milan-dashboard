'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import ExtraPage from '@/components/extra/ExtraPage';
import CustomerLeadsTable, { CustomerLead } from '@/components/customers/CustomerLeadsTable';
import OrdersTable from '@/components/orders/OrdersTable';
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
import {
  getCategoriesList,
  createCategory,
  updateCategory,
  deleteCategory,
  getVendorsList,
  createVendor,
  updateVendor,
  deleteVendor,
  getProductsList,
  createProduct,
  updateProduct,
  deleteProduct,
  getCustomersList,
  deleteCustomerLead,
  getOrdersList,
  updateOrderStatus
} from '@/services/api';

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
  const [customerLeads, setCustomerLeads] = useState<CustomerLead[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Loading States (Simulate local query latency)
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

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

  // Confirm Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'product' | 'category' | 'vendor' | null;
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: null,
    id: '',
    name: '',
  });

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

    // 2. Clear local storage seeds to ensure clean dynamic database queries
    localStorage.removeItem('vendors');
    localStorage.removeItem('categories');
    localStorage.removeItem('products');

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
  const queryVendors = async () => {
    setLoadingVendors(true);
    try {
      const res = await getVendorsList(vendorSearch, vendorStatusFilter);
      setVendors(res.data || []);
    } catch (e) {
      showToast('Error reading vendor list.', 'error');
    } finally {
      setLoadingVendors(false);
    }
  };

  const queryCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getCategoriesList(categorySearch, categoryStatusFilter);
      const list: ProductCategory[] = res.data || [];
      const storedVend = localStorage.getItem('vendors');
      const vendorList: Vendor[] = storedVend ? JSON.parse(storedVend) : [];

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

  const queryProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await getProductsList(
        productSearch,
        productCatFilter !== 'all' ? productCatFilter : '',
        productVendFilter !== 'all' ? productVendFilter : '',
        productActiveFilter !== 'all' ? productActiveFilter : ''
      );
      setProducts(res.data || []);
    } catch (e) {
      showToast('Error reading product catalog.', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const queryCustomerLeads = async () => {
    setLoadingCustomers(true);
    try {
      const res = await getCustomersList();
      setCustomerLeads(res.data || []);
    } catch (e) {
      showToast('Error loading customer coupon leads.', 'error');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const queryOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await getOrdersList();
      setOrders(res.data || []);
    } catch (e) {
      showToast('Error loading orders.', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status);
      showToast('Order status updated successfully.', 'success');
      queryOrders();
    } catch (e: any) {
      showToast(e.message || 'Error updating order status.', 'error');
    }
  };

  const handleCustomerLeadDelete = async (id: string) => {
    try {
      await deleteCustomerLead(id);
      setCustomerLeads((prev) => prev.filter((lead) => lead.id !== id));
      showToast('Customer lead deleted successfully.', 'success');
    } catch (e) {
      showToast('Failed to delete customer lead.', 'error');
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

  useEffect(() => {
    if (user) {
      if (currentTab === 'customers') {
        queryCustomerLeads();
      } else if (currentTab === 'orders') {
        queryOrders();
      }
    }
  }, [user, currentTab]);

  // Toast Helper
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  }, []);

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
  const handleVendorSubmit = async (formData: any) => {
    try {
      if (editingVendor) {
        // Edit mode
        await updateVendor(editingVendor.id, formData);
        showToast('Merchant details updated successfully.', 'success');
      } else {
        // Create mode
        await createVendor(formData);
        showToast('New vendor merchant registered!', 'success');
      }

      setVendorModalOpen(false);
      setEditingVendor(null);
      queryVendors();
    } catch (e: any) {
      showToast(e.message || 'Failed to save vendor details.', 'error');
    }
  };

  const handleToggleVendorStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateVendor(id, { is_active: !currentStatus });
      showToast('Vendor active status toggled.', 'success');
      queryVendors();
    } catch (e: any) {
      showToast(e.message || 'Error changing vendor status.', 'error');
    }
  };

  const handleVendorDelete = (id: string) => {
    const v = vendors.find(x => x.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'vendor',
      id,
      name: v ? v.name : 'this merchant account',
    });
  };

  const executeDeleteConfirm = async () => {
    const { type, id } = deleteConfirm;
    setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
    if (!type || !id) return;

    try {
      if (type === 'vendor') {
        await deleteVendor(id);
        showToast('Vendor account deleted.', 'success');
        queryVendors();
      } else if (type === 'category') {
        await deleteCategory(id);
        showToast('Category deleted successfully.', 'success');
        queryCategories();
        queryProducts();
      } else if (type === 'product') {
        await deleteProduct(id);
        showToast('Product deleted successfully.', 'success');
        queryProducts();
      }
    } catch (e: any) {
      showToast(e.message || `Failed to delete ${type}.`, 'error');
    }
  };

  // Local CRUD operations - CATEGORIES
  const handleCategorySubmit = async (formData: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        showToast('Category catalog updated successfully.', 'success');
      } else {
        await createCategory(formData);
        showToast('Category created successfully!', 'success');
      }

      setCategoryModalOpen(false);
      setEditingCategory(null);
      queryCategories();
    } catch (e: any) {
      showToast(e.message || 'Failed to save category details.', 'error');
    }
  };

  const handleCategoryDelete = (id: string) => {
    const c = categories.find(x => x.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'category',
      id,
      name: c ? c.category_name : 'this category',
    });
  };

  // Local CRUD operations - PRODUCTS
  const handleProductSubmit = async (formData: any) => {
    try {
      const slug = slugify(formData.product_name);
      const submissionData = {
        ...formData,
        product_slug: slug,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, submissionData);
        showToast('Product updated successfully.', 'success');
      } else {
        await createProduct(submissionData);
        showToast('Product added to merchant catalog!', 'success');
      }

      setProductModalOpen(false);
      setEditingProduct(null);
      queryProducts();
    } catch (e: any) {
      showToast(e.message || 'Failed to save product details.', 'error');
    }
  };

  const handleToggleProductActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateProduct(id, { is_active: !currentStatus });
      showToast('Product active status changed.', 'success');
      queryProducts();
    } catch (e: any) {
      showToast(e.message || 'Failed to change product status.', 'error');
    }
  };

  const handleToggleProductFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await updateProduct(id, { is_featured: !currentStatus });
      showToast(!currentStatus ? 'Product spotlight active.' : 'Product spotlight disabled.', 'success');
      queryProducts();
    } catch (e: any) {
      showToast(e.message || 'Failed to change featured status.', 'error');
    }
  };

  const handleProductDelete = (id: string) => {
    const p = products.find(x => x.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'product',
      id,
      name: p ? p.product_name : 'this product',
    });
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
                  onSelect={(catId) => {
                    setProductCatFilter(catId);
                    setCurrentTab('products');
                  }}
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

            {/* TAB: ORDERS */}
            {currentTab === 'orders' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-bold text-foreground">Customer Orders</h1>
                    <p className="text-xs text-zinc-500">Track shipping, payment, and order fulfillment status.</p>
                  </div>
                </div>

                <OrdersTable
                  orders={orders}
                  loading={loadingOrders}
                  onRefresh={queryOrders}
                  onUpdateStatus={handleUpdateOrderStatus}
                />
              </div>
            )}

            {/* TAB: CAMPAIGNS (EXTRA) */}
            {currentTab === 'extra' && (
              <ExtraPage onToast={showToast} />
            )}

            {/* TAB: CUSTOMER COUPON LEADS */}
            {currentTab === 'customers' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Coupon Leads & Customer Subscriptions</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      View all users who claimed the 10% OFF discount coupon on the store website.
                    </p>
                  </div>
                </div>

                <CustomerLeadsTable
                  leads={customerLeads}
                  loading={loadingCustomers}
                  onRefresh={queryCustomerLeads}
                  onDelete={handleCustomerLeadDelete}
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

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        title="Confirm Deletion"
        size="sm"
        position="center"
      >
        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-650 dark:text-red-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-foreground">Are you sure?</h4>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-zinc-800 dark:text-zinc-200">"{deleteConfirm.name}"</strong>? This action cannot be undone and will delete related listings.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
              className="flex-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-background text-zinc-600 dark:text-zinc-400 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={executeDeleteConfirm}
              className="flex-1 py-2 rounded-lg bg-red-650 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer shadow shadow-red-600/10 active:scale-98"
            >
              Yes, Delete
            </button>
          </div>
        </div>
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
