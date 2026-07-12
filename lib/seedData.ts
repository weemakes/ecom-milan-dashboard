export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  gst_number?: string;
  current_address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  category_name: string;
  category_slug: string;
  category_description?: string;
  category_img: string;
  parent_category_id?: string | null;
  vendor_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail {
  id: string;
  product_name: string;
  product_slug: string;
  category_id: string;
  vendor_id: string;
  description?: string;
  price: number;
  discounted_price?: number | null;
  quantity_in_stock: number;
  sku?: string;
  occasion?: string;
  landing_section: 'HERO' | 'TRENDING' | 'NEW_ARRIVALS' | 'DISCOUNTS' | 'NONE';
  featured_type: 'TOP_PICKS' | 'BEST_SELLERS' | 'SPECIAL_DEALS';
  images: string[];
  variants: any[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// Default Seed datasets
export const SEED_VENDORS: Vendor[] = [
  {
    id: 'v1-milan-fashion',
    name: 'Milan Fashion House',
    email: 'milan@fashion.com',
    phone: '+91 9876543210',
    password_hash: 'password',
    gst_number: '07AAAAA1111A1Z1',
    current_address: 'Chandni Chowk, New Delhi, 110006',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v2-rajput-ethnic',
    name: 'Rajput Ethnic & Crafts',
    email: 'rajput@crafts.com',
    phone: '+91 8765432109',
    password_hash: 'password',
    gst_number: '08BBBBB2222B2Z2',
    current_address: 'Johari Bazaar, Jaipur, Rajasthan, 302003',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v3-technomart',
    name: 'TechnoMart Electronics',
    email: 'techno@mart.com',
    phone: '+91 7654321098',
    password_hash: 'password',
    gst_number: '27CCCCC3333C3Z3',
    current_address: 'Lamington Road, Mumbai, Maharashtra, 400007',
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_CATEGORIES: ProductCategory[] = [
  {
    id: 'c1-clothing-fashion',
    category_name: 'Clothing & Fashion',
    category_slug: 'clothing-fashion',
    category_description: 'Trendy clothing, footwear, and accessories.',
    category_img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=60',
    parent_category_id: null,
    vendor_id: 'v1-milan-fashion',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2-ethnic-wear',
    category_name: 'Ethnic Wear',
    category_slug: 'ethnic-wear',
    category_description: 'Traditional wear including sarees, kurtas, and sherwanis.',
    category_img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=60',
    parent_category_id: 'c1-clothing-fashion',
    vendor_id: 'v2-rajput-ethnic',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3-electronics',
    category_name: 'Electronics',
    category_slug: 'electronics',
    category_description: 'Gadgets, devices, smart appliances and more.',
    category_img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=60',
    parent_category_id: null,
    vendor_id: 'v3-technomart',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c4-smartphones',
    category_name: 'Smartphones',
    category_slug: 'smartphones',
    category_description: 'Mobile phones and tablets from premium brands.',
    category_img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=60',
    parent_category_id: 'c3-electronics',
    vendor_id: 'v3-technomart',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_PRODUCTS: ProductDetail[] = [
  {
    id: 'p1-silk-saree',
    product_name: 'Designer Silk Saree',
    product_slug: 'designer-silk-saree',
    category_id: 'c2-ethnic-wear',
    vendor_id: 'v2-rajput-ethnic',
    description: 'Authentic Banarasi silk saree with gold brocade work.',
    price: 5499.00,
    discounted_price: 3999.00,
    quantity_in_stock: 25,
    sku: 'MFL-SAREE-BANARASI-01',
    occasion: 'Wedding & Festive',
    landing_section: 'TRENDING',
    featured_type: 'TOP_PICKS',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80'
    ],
    variants: [
      { color: 'Royal Blue', size: 'Free Size', stock: 15, price: 3999 },
      { color: 'Crimson Red', size: 'Free Size', stock: 10, price: 4299 }
    ],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p2-kurta-set',
    product_name: "Premium Men's Kurta Pajama Set",
    product_slug: 'premium-mens-kurta-pajama-set',
    category_id: 'c2-ethnic-wear',
    vendor_id: 'v1-milan-fashion',
    description: 'Cotton silk blend pathani kurta set for formal events.',
    price: 2499.00,
    discounted_price: 1899.00,
    quantity_in_stock: 40,
    sku: 'MILAN-KURTA-M-01',
    occasion: 'Festive & Ceremonial',
    landing_section: 'NEW_ARRIVALS',
    featured_type: 'BEST_SELLERS',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80'
    ],
    variants: [
      { color: 'Off White', size: 'M', stock: 15, price: 1899 },
      { color: 'Off White', size: 'L', stock: 15, price: 1899 },
      { color: 'Navy Blue', size: 'XL', stock: 10, price: 1999 }
    ],
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p3-quantum-x1',
    product_name: 'Quantum X1 Smartphone',
    product_slug: 'quantum-x1-smartphone',
    category_id: 'c4-smartphones',
    vendor_id: 'v3-technomart',
    description: '5G smartphone with 108MP camera, 12GB RAM, 256GB storage.',
    price: 32999.00,
    discounted_price: 29999.00,
    quantity_in_stock: 8,
    sku: 'TECHNO-Q-X1-BLK',
    occasion: 'Casual & Professional',
    landing_section: 'HERO',
    featured_type: 'SPECIAL_DEALS',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
    ],
    variants: [
      { color: 'Matte Black', size: '256GB', stock: 5, price: 29999 },
      { color: 'Starlight Silver', size: '256GB', stock: 3, price: 30999 }
    ],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
