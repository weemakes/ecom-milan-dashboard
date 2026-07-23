const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Handle API Response errors
 */
async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

// Authentication APIs
export async function loginMerchant(email: string, password_hash: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: password_hash }),
  });
  return handleResponse(res);
}

// Vendors CRUD APIs
export async function getVendorsList(search = '', active = '') {
  const res = await fetch(
    `${API_BASE_URL}/api/vendors?search=${encodeURIComponent(search)}&active=${active}`
  );
  return handleResponse(res);
}

export async function getVendorById(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/vendors/${id}`);
  return handleResponse(res);
}

export async function createVendor(vendorData: any) {
  const res = await fetch(`${API_BASE_URL}/api/vendors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendorData),
  });
  return handleResponse(res);
}

export async function updateVendor(id: string, vendorData: any) {
  const res = await fetch(`${API_BASE_URL}/api/vendors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendorData),
  });
  return handleResponse(res);
}

export async function deleteVendor(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/vendors/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Categories CRUD APIs
export async function getCategoriesList(search = '', active = '') {
  const res = await fetch(
    `${API_BASE_URL}/api/categories?search=${encodeURIComponent(search)}&active=${active}`
  );
  return handleResponse(res);
}

export async function getCategoryById(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`);
  return handleResponse(res);
}

export async function createCategory(categoryData: any) {
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });
  return handleResponse(res);
}

export async function updateCategory(id: string, categoryData: any) {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });
  return handleResponse(res);
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Products CRUD APIs
export async function getProductsList(search = '', categoryId = '', vendorId = '', active = '') {
  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (categoryId) queryParams.set('categoryId', categoryId);
  if (vendorId) queryParams.set('vendorId', vendorId);
  if (active) queryParams.set('active', active);

  const res = await fetch(`${API_BASE_URL}/api/products?${queryParams.toString()}`);
  return handleResponse(res);
}

export async function getProductById(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
  return handleResponse(res);
}

export async function createProduct(productData: any) {
  const res = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return handleResponse(res);
}

export async function updateProduct(id: string, productData: any) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return handleResponse(res);
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// ─── Campaign/Extra Page APIs ──────────────────────────────────────────────────

export async function getAllProductsAdmin() {
  const res = await fetch(`${API_BASE_URL}/api/products/admin/all`);
  return handleResponse(res);
}

export async function getOccasionsList() {
  const res = await fetch(`${API_BASE_URL}/api/products/admin/occasions`);
  return handleResponse(res);
}

export async function createOrUpdateOccasion(name: string, image: string) {
  const res = await fetch(`${API_BASE_URL}/api/products/admin/occasions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, image }),
  });
  return handleResponse(res);
}

export async function updateOccasion(oldName: string, name: string, image: string) {
  const res = await fetch(`${API_BASE_URL}/api/products/admin/occasions/${encodeURIComponent(oldName)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, image }),
  });
  return handleResponse(res);
}

export async function deleteOccasion(name: string) {
  const res = await fetch(`${API_BASE_URL}/api/products/admin/occasions/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export async function getProductsBySection(section: string) {
  const res = await fetch(`${API_BASE_URL}/api/products/admin/section/${encodeURIComponent(section)}`);
  return handleResponse(res);
}

export async function getProductsByOccasionName(name: string) {
  const res = await fetch(`${API_BASE_URL}/api/products/admin/occasion/${encodeURIComponent(name)}`);
  return handleResponse(res);
}

export async function getProductsOnSale() {
  const res = await fetch(`${API_BASE_URL}/api/products/admin/on-sale`);
  return handleResponse(res);
}

// Patch a product's campaign fields only (section/occasion/sale)
export async function patchProductCampaign(id: string, patch: {
  featured_type?: string | null;
  landing_section?: string | null;
  occasion?: string | null;
  discounted_price?: number | null;
}) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse(res);
}

// ─── Customer / Coupon Leads APIs ──────────────────────────────────────────────

export async function getCustomersList() {
  const res = await fetch(`${API_BASE_URL}/api/customers`);
  return handleResponse(res);
}

export async function deleteCustomerLead(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}
