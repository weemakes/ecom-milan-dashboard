'use client';

import React from 'react';
import { Edit2, Trash2, Search, Filter, Mail, Phone, MapPin, BadgePercent, Check, X } from 'lucide-react';
import { Vendor } from '@/lib/seedData';

interface VendorTableProps {
  vendors: Vendor[];
  loading: boolean;
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export default function VendorTable({
  vendors,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: VendorTableProps) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-zinc-50/50 dark:bg-zinc-900/10 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search vendor by name, email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Vendors Table grid */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-100/50 dark:bg-zinc-900/40">
              <th className="py-3 px-5">Vendor Name</th>
              <th className="py-3 px-5">Contact Details</th>
              <th className="py-3 px-5">GST Number</th>
              <th className="py-3 px-5">Business Location</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-zinc-500">
                  Loading vendors data...
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-zinc-500">
                  No vendors found matching parameters.
                </td>
              </tr>
            ) : (
              vendors.map(vendor => (
                <tr 
                  key={vendor.id} 
                  className="hover:bg-zinc-100/30 dark:hover:bg-zinc-900/20 transition-colors"
                >
                  {/* Name */}
                  <td className="py-4 px-5 font-bold text-foreground">
                    {vendor.name}
                  </td>
                  
                  {/* Contacts */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" /> {vendor.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" /> {vendor.phone}
                      </span>
                    </div>
                  </td>

                  {/* GST */}
                  <td className="py-4 px-5 font-mono text-xs">
                    {vendor.gst_number ? (
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 w-fit">
                        <BadgePercent className="w-3.5 h-3.5" /> {vendor.gst_number}
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic">Not Provided</span>
                    )}
                  </td>

                  {/* Address */}
                  <td className="py-4 px-5 max-w-[200px] truncate text-xs text-zinc-500" title={vendor.current_address}>
                    <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{vendor.current_address}</span>
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-4 px-5">
                    <button
                      onClick={() => onToggleStatus(vendor.id, vendor.is_active)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer select-none ${
                        vendor.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {vendor.is_active ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(vendor)}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-500 hover:border-indigo-500/30 transition-all cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(vendor.id)}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all cursor-pointer"
                        title="Remove Vendor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
