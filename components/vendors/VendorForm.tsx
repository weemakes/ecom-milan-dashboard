'use client';

import React, { useState, useEffect } from 'react';
import { Vendor } from '@/lib/seedData';

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
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Business / Vendor Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Milan Apparels"
          className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
          required
        />
      </div>

      {/* Grid Contact fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@business.com"
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
            required
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+91 9999999999"
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800"
            required
          />
        </div>
      </div>

      {/* Grid GST and Password fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GST Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">GST Number (Optional)</label>
          <input
            type="text"
            value={gstNumber}
            onChange={e => setGstNumber(e.target.value)}
            placeholder="e.g. 07AAAAA1111A1Z1"
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800 font-mono"
          />
        </div>

        {/* Password (Only for new) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            {vendor ? 'Access Credentials' : 'Access Password *'}
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={!!vendor}
            placeholder={vendor ? '•••••••• (read-only)' : 'Enter password'}
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            required={!vendor}
          />
        </div>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Merchant Current Address *</label>
        <textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter complete building, street, state details..."
          rows={3}
          className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800 py-2 resize-none"
          required
        />
      </div>

      {/* Status Active Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 select-none">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Activate Merchant Account</span>
          <span className="text-xs text-zinc-400">Merchant will be visible and products active on site</span>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isActive ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
        >
          {vendor ? 'Update Merchant' : 'Create Vendor'}
        </button>
      </div>
    </form>
  );
}
