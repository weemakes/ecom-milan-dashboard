'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderTree, 
  Package, 
  LogOut, 
  Sun, 
  Moon,
  ShoppingBag,
  Sparkles,
  Ticket
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  vendorName: string;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  onLogout,
  isDarkMode,
  setIsDarkMode,
  vendorName,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'extra', label: 'Campaigns', icon: Sparkles },
    { id: 'customers', label: 'Coupon Leads', icon: Ticket },
  ];

  const toggleTheme = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <aside className="w-64 h-screen sticky top-0 border-r border-zinc-200 dark:border-zinc-800 bg-background flex flex-col justify-between p-4 z-40 transition-all duration-300">
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-foreground">Milan Ecom</h1>
            <span className="text-xs font-semibold text-indigo-500">Dashboard Panel</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        {/* Active Session Info */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Logged in as</span>
          <span className="text-sm font-semibold truncate text-foreground">{vendorName}</span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors flex-1 flex items-center justify-center gap-2 text-xs font-medium"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex-1 flex items-center justify-center gap-2 text-xs font-medium"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
