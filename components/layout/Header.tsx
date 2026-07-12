'use client';

import React from 'react';
import { Database, User, ShieldCheck, Server } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  vendorName: string;
  dbType: 'postgres' | 'mock';
}

export default function Header({ currentTab, vendorName, dbType }: HeaderProps) {
  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'vendors':
        return 'Vendors Directory';
      case 'categories':
        return 'Product Categories';
      case 'products':
        return 'Product Catalog';
      default:
        return 'Milan Admin';
    }
  };

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-background/95 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-30 transition-all duration-300">
      <div>
        <h2 className="text-lg font-bold text-foreground animate-fade-in">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Database Status Indicator */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none border transition-colors ${
            dbType === 'postgres'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}
          title={
            dbType === 'postgres'
              ? 'Connected to live PostgreSQL Database'
              : 'Running on Mock Fallback database. Define DATABASE_URL in .env.local to activate PostgreSQL.'
          }
        >
          {dbType === 'postgres' ? (
            <>
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>PG SQL Active</span>
            </>
          ) : (
            <>
              <Server className="w-3.5 h-3.5 text-amber-500" />
              <span>Static Mock Active</span>
            </>
          )}
        </div>

        {/* User Status */}
        <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-foreground leading-tight">{vendorName}</span>
            <span className="text-[10px] text-zinc-500 flex items-center justify-end gap-0.5">
              <ShieldCheck className="w-3 h-3 text-indigo-500" /> Admin Access
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/10">
            {vendorName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
