'use client';

import React from 'react';
import { Users, FolderTree, Package, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalVendors: number;
    activeVendors: number;
    totalCategories: number;
    totalProducts: number;
    activeProducts: number;
    averagePrice: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const cards = [
    {
      title: 'Total Vendors',
      value: stats.totalVendors,
      subtext: `${stats.activeVendors} active merchants`,
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10',
    },
    {
      title: 'Product Categories',
      value: stats.totalCategories,
      subtext: 'Catalog segments',
      icon: FolderTree,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      subtext: `${stats.activeProducts} active products`,
      icon: Package,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
    },
    {
      title: 'Average Price',
      value: `₹${stats.averagePrice.toFixed(0)}`,
      subtext: 'Average listing value',
      icon: DollarSign,
      color: 'text-pink-600 dark:text-pink-400 bg-pink-500/10',
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="premium-card p-5 flex items-center justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {card.value}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  {card.subtext}
                </span>
              </div>
              <div className={`p-3.5 rounded-xl ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Onboarding Trends Line Chart */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Weekly Activity Trends</h3>
              <p className="text-[11px] text-zinc-500">Merchant registrations vs. catalog uploads</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4% this week
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-60 w-full relative pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-full text-indigo-500" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
              
              {/* Area Under Line (Gradient) */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chartGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area 1 */}
              <path
                d="M 0,200 L 0,160 Q 80,120 160,150 T 320,80 T 480,50 L 500,50 L 500,200 Z"
                fill="url(#chartGrad)"
              />
              {/* Line 1 */}
              <path
                d="M 0,160 Q 80,120 160,150 T 320,80 T 480,50 L 500,50"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Area 2 */}
              <path
                d="M 0,200 L 0,180 Q 80,160 160,170 T 320,130 T 480,100 L 500,90 L 500,200 Z"
                fill="url(#chartGrad2)"
              />
              {/* Line 2 */}
              <path
                d="M 0,180 Q 80,160 160,170 T 320,130 T 480,90 L 500,90"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />
            </svg>

            {/* X Axis Labels */}
            <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 tracking-wider pt-2 uppercase">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex gap-4 text-xs font-semibold select-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-zinc-600 dark:text-zinc-300">Product Uploads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px)' }} />
              <span className="text-zinc-600 dark:text-zinc-300">Vendor Signups</span>
            </div>
          </div>
        </div>

        {/* Catalog Share Category Distribution Ring Chart */}
        <div className="premium-card p-6 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Catalog Category Share</h3>
            <p className="text-[11px] text-zinc-500">Distribution of products across segments</p>
          </div>

          <div className="flex items-center justify-center py-4 relative">
            {/* SVG Ring Pie Chart */}
            <svg width="150" height="150" className="transform -rotate-90 select-none">
              {/* Track */}
              <circle cx="75" cy="75" r="55" fill="none" stroke="#27272a" strokeWidth="16" className="text-zinc-200 dark:text-zinc-800" />
              
              {/* Category 1: Clothing & Fashion (45%) -> Length: 2 * PI * 55 * 0.45 = 155.5 */}
              <circle cx="75" cy="75" r="55" fill="none" stroke="#4f46e5" strokeWidth="16" strokeDasharray="155.5 345.5" strokeDashoffset="0" />

              {/* Category 2: Ethnic Wear (35%) -> Length: 2 * PI * 55 * 0.35 = 120.9. Offset: -155.5 */}
              <circle cx="75" cy="75" r="55" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="120.9 345.5" strokeDashoffset="-155.5" />

              {/* Category 3: Electronics/Smartphones (20%) -> Length: 2 * PI * 55 * 0.20 = 69.1. Offset: -276.4 */}
              <circle cx="75" cy="75" r="55" fill="none" stroke="#0ea5e9" strokeWidth="16" strokeDasharray="69.1 345.5" strokeDashoffset="-276.4" />
            </svg>

            {/* Inner Ring stats overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-foreground">100%</span>
              <span className="text-[9px] uppercase font-bold text-zinc-400">Classified</span>
            </div>
          </div>

          {/* Legends */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Fashion & Apparel</span>
              </div>
              <span className="text-foreground">45%</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Ethnic Wear</span>
              </div>
              <span className="text-foreground">35%</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Electronics</span>
              </div>
              <span className="text-foreground">20%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
