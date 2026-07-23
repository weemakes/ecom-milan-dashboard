'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Ticket, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Download, 
  RefreshCcw,
  Sparkles,
  Users
} from 'lucide-react';

export interface CustomerLead {
  id: string;
  email_or_phone: string;
  source: string;
  coupon_code: string;
  status: string;
  created_at: string;
}

interface CustomerLeadsTableProps {
  leads: CustomerLead[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

export default function CustomerLeadsTable({
  leads,
  loading,
  onRefresh,
  onDelete,
}: CustomerLeadsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [couponFilter, setCouponFilter] = useState('all');

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      lead.email_or_phone.toLowerCase().includes(query) ||
      (lead.coupon_code && lead.coupon_code.toLowerCase().includes(query)) ||
      (lead.source && lead.source.toLowerCase().includes(query));

    const matchesCoupon =
      couponFilter === 'all' || lead.coupon_code === couponFilter;

    return matchesSearch && matchesCoupon;
  });

  // Calculate quick stats
  const totalLeads = leads.length;
  const todayCount = leads.filter((l) => {
    const leadDate = new Date(l.created_at).toDateString();
    const todayDate = new Date().toDateString();
    return leadDate === todayDate;
  }).length;

  const uniqueCoupons = Array.from(new Set(leads.map((l) => l.coupon_code || 'WELCOME10')));

  // CSV Export handler
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Email or Phone', 'Coupon Code', 'Source', 'Status', 'Date'];
    const csvRows = [
      headers.join(','),
      ...filteredLeads.map((l) =>
        [
          `"${l.id}"`,
          `"${l.email_or_phone}"`,
          `"${l.coupon_code || ''}"`,
          `"${l.source || ''}"`,
          `"${l.status || ''}"`,
          `"${new Date(l.created_at).toLocaleString()}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coupon_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Leads</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{totalLeads}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Today's Claims</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{todayCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Coupons</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{uniqueCoupons.length}</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
            <Ticket className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Header Controls (Search, Filters, Export, Refresh) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email, mobile, coupon..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Coupon Filter */}
          <select
            value={couponFilter}
            onChange={(e) => setCouponFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Coupon Codes</option>
            {uniqueCoupons.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Refresh list"
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
              <th className="px-5 py-3.5">Customer Lead</th>
              <th className="px-5 py-3.5">Coupon Code</th>
              <th className="px-5 py-3.5">Campaign Source</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Date & Time</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-background">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCcw className="w-5 h-5 animate-spin text-indigo-500" />
                    <span>Loading coupon leads...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                  <div className="flex flex-col items-center gap-2">
                    <Ticket className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                    <p className="font-semibold text-zinc-500">No coupon leads found.</p>
                    <p className="text-xs text-zinc-400">When users claim 10% OFF on the homepage, they will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const isEmail = lead.email_or_phone.includes('@');
                const formattedDate = new Date(lead.created_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    {/* Contact */}
                    <td className="px-5 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                          {isEmail ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-semibold block">{lead.email_or_phone}</span>
                          <span className="text-[11px] text-zinc-400 uppercase font-mono">
                            {isEmail ? 'Email Contact' : 'Phone / WhatsApp'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Coupon */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        <Ticket className="w-3.5 h-3.5 text-amber-600" />
                        {lead.coupon_code || 'WELCOME10'}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-5 py-4 text-xs font-medium">
                      <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                        {lead.source || 'POPUP_10OFF'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {lead.status || 'SUBSCRIBED'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete lead record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
