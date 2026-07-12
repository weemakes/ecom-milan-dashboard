'use client';

import React, { useState, useEffect } from 'react';
import { Vendor } from '@/lib/seedData';
import { Building2, Mail, Phone, Lock, FileText, MapPin } from 'lucide-react';

interface VendorFormProps {
  vendor?: Vendor | null;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export default function VendorForm({ vendor, onSubmit, onCancel }: VendorFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vendor) {
      setName(vendor.name);
      setEmail(vendor.email);
      setPhone(vendor.phone);
      setGstNumber(vendor.gst_number || '');
      setAddress(vendor.current_address);
      setIsActive(vendor.is_active);
      setPassword('••••••••'); // placeholder to simulate edit mode password hash bypass
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setGstNumber('');
      setAddress('');
      setIsActive(true);
    }
    setError('');
  }, [vendor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Business name is required.');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email address.');
    if (!phone.trim() || phone.length < 10) return setError('Please enter a valid phone number (at least 10 digits).');
    if (!vendor && !password.trim()) return setError('Merchant access password is required.');
    if (!address.trim()) return setError('Business location address is required.');

    onSubmit({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password_hash: vendor ? undefined : password, // send password only for new vendor
      gst_number: gstNumber.trim().toUpperCase() || null,
      current_address: address.trim(),
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

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Business / Vendor Name *</label>
        <div className="relative">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Milan Apparels"
            className="form-input pl-10"
            required
          />
        </div>
      </div>

      {/* Grid Contact fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@business.com"
              className="form-input pl-10"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 9999999999"
              className="form-input pl-10"
              required
            />
          </div>
        </div>
      </div>

      {/* Grid GST and Password fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GST Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">GST Number (Optional)</label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={gstNumber}
              onChange={e => setGstNumber(e.target.value)}
              placeholder="e.g. 07AAAAA1111A1Z1"
              className="form-input pl-10 font-mono"
            />
          </div>
        </div>

        {/* Password (Only for new) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">
            {vendor ? 'Access Credentials' : 'Access Password *'}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={!!vendor}
              placeholder={vendor ? '•••••••• (read-only)' : 'Enter password'}
              className="form-input pl-10 disabled:opacity-50 disabled:cursor-not-allowed"
              required={!vendor}
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-zinc-400">Merchant Current Address *</label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter complete building, street, state details..."
            rows={3}
            className="form-input pl-10 py-3.5 resize-none"
            required
          />
        </div>
      </div>

      {/* Status Active Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 bg-slate-500/5 dark:bg-zinc-400/5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-500/10 dark:hover:bg-zinc-400/10 select-none">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Activate Merchant Account</span>
          <span className="text-xs text-zinc-400">Merchant will be visible and products active on site</span>
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

      {/* Form Actions */}
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
          {vendor ? 'Update Merchant' : 'Create Vendor'}
        </button>
      </div>
    </form>
  );
}
