'use client';

import React, { useState } from 'react';
import { ShoppingBag, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (vendor: { id: string; name: string; email: string }) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('milan@fashion.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Read vendors from localStorage to find matching email
      const localVendorsStr = localStorage.getItem('vendors');
      let vendors = [];
      if (localVendorsStr) {
        vendors = JSON.parse(localVendorsStr);
      } else {
        // Fallback to import default if localStorage not seeded yet
        const { SEED_VENDORS } = require('@/lib/seedData');
        vendors = SEED_VENDORS;
      }

      const vendor = vendors.find((v: any) => v.email.toLowerCase() === email.toLowerCase());

      // Simulate network request delay (for nice UX spinner)
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!vendor || password !== 'password') {
        setError('Invalid credentials. (Hint: Use milan@fashion.com and password "password")');
      } else {
        onLoginSuccess({
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-pink-500/10 blur-[120px]" />

      <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl relative z-10 animate-fade-in flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">Milan E-Commerce</h1>
          <p className="text-sm text-zinc-400">Enter credentials to open your merchant console</p>
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vendor@milan.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/50 text-white placeholder-zinc-600 text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/50 text-white placeholder-zinc-600 text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Demo Mode Notice */}
        <div className="border-t border-zinc-800/80 pt-4 flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest text-center">Static Demo Access Credentials</span>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
            <div className="p-2 rounded bg-zinc-950/30 border border-zinc-800">
              <span className="block font-bold text-zinc-300">Email:</span>
              <span>milan@fashion.com</span>
            </div>
            <div className="p-2 rounded bg-zinc-950/30 border border-zinc-800">
              <span className="block font-bold text-zinc-300">Password:</span>
              <span>password</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
