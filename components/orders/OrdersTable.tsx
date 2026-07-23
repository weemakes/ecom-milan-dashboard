'use client';

import React, { useState } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Calendar, 
  CheckCircle2, 
  Download, 
  RefreshCcw,
  Clock,
  Eye,
  Edit2,
  DollarSign,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  User,
  ExternalLink
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variant: any;
  qty: number;
  selling_price: string;
  vendor_payout_amount: string;
  platform_earning: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  vendor_id: string | null;
  subtotal: string;
  total_discount: string;
  shipping_charge: string;
  grand_total: string;
  shipping_address: any;
  payment_method: string;
  payment_status: string;
  order_status: string;
  order_date: string;
  customer_username?: string;
  customer_email?: string;
  customer_phone?: string;
  order_items?: OrderItem[];
}

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export default function OrdersTable({
  orders,
  loading,
  onRefresh,
  onUpdateStatus,
}: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    
    // Parse address for search matching
    let addressStr = '';
    try {
      if (order.shipping_address) {
        const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
        addressStr = `${addr.fullName} ${addr.address} ${addr.city} ${addr.state} ${addr.email} ${addr.phone}`.toLowerCase();
      }
    } catch (e) {}

    const matchesSearch =
      !query ||
      order.order_number.toLowerCase().includes(query) ||
      (order.customer_username && order.customer_username.toLowerCase().includes(query)) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(query)) ||
      (order.customer_phone && order.customer_phone.includes(query)) ||
      addressStr.includes(query);

    const matchesStatus =
      statusFilter === 'all' || order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Quick Stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.order_status !== 'CANCELLED') {
      return sum + parseFloat(o.grand_total || '0');
    }
    return sum;
  }, 0);
  const pendingOrders = orders.filter(o => o.order_status === 'PLACED').length;

  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900';
      case 'CONFIRMED':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900';
      case 'PROCESSING':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900';
      default:
        return 'bg-zinc-50 text-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400 border-zinc-200 dark:border-zinc-900';
    }
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Items count', 'Subtotal', 'Discount', 'Total Paid', 'Status', 'Payment Method'];
    const csvRows = [
      headers.join(','),
      ...filteredOrders.map((o) => {
        let fullName = o.customer_username || 'Guest';
        let email = o.customer_email || '';
        let phone = o.customer_phone || '';
        try {
          if (o.shipping_address) {
            const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address;
            if (addr.fullName) fullName = addr.fullName;
            if (addr.email) email = addr.email;
            if (addr.phone) phone = addr.phone;
          }
        } catch (e) {}
        
        return [
          `"${o.order_number}"`,
          `"${new Date(o.order_date).toLocaleString()}"`,
          `"${fullName}"`,
          `"${email}"`,
          `"${phone}"`,
          `"${o.order_items?.length || 0}"`,
          `"${o.subtotal}"`,
          `"${o.total_discount}"`,
          `"${o.grand_total}"`,
          `"${o.order_status}"`,
          `"${o.payment_method}"`
        ].join(',');
      }),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Orders</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{totalOrders}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Net Revenue</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">New Orders (Placed)</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{pendingOrders}</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, client, state..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-100/70 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-5 py-3.5">Order ID</th>
              <th className="px-5 py-3.5">Date & Time</th>
              <th className="px-5 py-3.5">Customer & Contact</th>
              <th className="px-5 py-3.5">Total Paid</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-background">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCcw className="w-5 h-5 animate-spin text-indigo-500" />
                    <span>Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                  <div className="flex flex-col items-center gap-2">
                    <ShoppingBag className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                    <p className="font-semibold text-zinc-500">No orders found.</p>
                    <p className="text-xs text-zinc-400">When users make purchases on the website, they will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                // Parse shipping address
                let parsedAddr: any = {};
                try {
                  if (order.shipping_address) {
                    parsedAddr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
                  }
                } catch (e) {}

                const customerName = parsedAddr.fullName || order.customer_username || 'Guest';
                const customerPhone = parsedAddr.phone || order.customer_phone || '';
                const customerEmail = parsedAddr.email || order.customer_email || '';

                const formattedDate = new Date(order.order_date).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="px-5 py-4 font-semibold text-foreground font-mono">
                      {order.order_number}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{customerName}</span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          {customerPhone} {customerEmail && `• ${customerEmail}`}
                        </span>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">₹{parseFloat(order.grand_total).toLocaleString('en-IN')}</span>
                        {parseFloat(order.total_discount) > 0 && (
                          <span className="text-[10px] text-red-500 font-medium">
                            Discount: -₹{parseFloat(order.total_discount).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Select */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                        <select
                          value={order.order_status}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                          className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="PLACED">Placed</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors cursor-pointer"
                        title="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedOrder && (() => {
        let parsedAddr: any = {};
        try {
          if (selectedOrder.shipping_address) {
            parsedAddr = typeof selectedOrder.shipping_address === 'string' ? JSON.parse(selectedOrder.shipping_address) : selectedOrder.shipping_address;
          }
        } catch (e) {}

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-background border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/10">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Order Details</h3>
                  <span className="text-xs font-semibold font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
                    ID: {selectedOrder.order_number}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-foreground text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 text-sm">
                
                {/* Status bar */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-medium">Order Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(selectedOrder.order_status)}`}>
                      {selectedOrder.order_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-medium">Payment Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      selectedOrder.payment_status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                    }`}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-3.5">
                    <h4 className="font-bold text-foreground border-b border-zinc-200 dark:border-zinc-800 pb-1 flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <User className="w-4 h-4" />
                      Customer details
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-zinc-500">Name:</span>
                        <span className="font-semibold text-foreground">{parsedAddr.fullName || selectedOrder.customer_username || 'Guest'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-zinc-500">Phone:</span>
                        <span className="font-medium text-foreground">{parsedAddr.phone || selectedOrder.customer_phone || 'None'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-zinc-500">Email:</span>
                        <span className="font-medium text-foreground">{parsedAddr.email || selectedOrder.customer_email || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="space-y-3.5">
                    <h4 className="font-bold text-foreground border-b border-zinc-200 dark:border-zinc-800 pb-1 flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                      <p className="font-medium text-foreground">{parsedAddr.fullName}</p>
                      <p>{parsedAddr.address}</p>
                      <p>{parsedAddr.city}, {parsedAddr.state} - {parsedAddr.zipCode}</p>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    Products ordered ({selectedOrder.order_items?.length || 0})
                  </h4>
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {selectedOrder.order_items?.map((item) => (
                        <div key={item.id} className="p-3.5 flex justify-between items-start gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                          <div>
                            <span className="font-semibold text-foreground block leading-tight">{item.product_name}</span>
                            {item.variant && Object.keys(item.variant).length > 0 && (
                              <span className="text-[10px] text-zinc-400 block mt-1 font-mono uppercase">
                                {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-medium block text-foreground">₹{parseFloat(item.selling_price).toLocaleString('en-IN')}</span>
                            <span className="text-xs text-zinc-400 block mt-0.5">Qty: {item.qty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex flex-col items-end gap-1.5">
                  <div className="flex justify-between w-64 text-zinc-500">
                    <span>Subtotal:</span>
                    <span className="font-medium text-foreground">₹{parseFloat(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  {parseFloat(selectedOrder.total_discount) > 0 && (
                    <div className="flex justify-between w-64 text-red-500">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{parseFloat(selectedOrder.total_discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-64 text-zinc-500">
                    <span>Shipping charge:</span>
                    <span className="font-medium text-foreground">FREE</span>
                  </div>
                  <div className="flex justify-between w-64 text-base font-bold text-foreground border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-1">
                    <span>Grand Total:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{parseFloat(selectedOrder.grand_total).toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
