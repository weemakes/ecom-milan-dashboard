'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Sliders } from 'lucide-react';

interface Variant {
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
}

interface VariantBuilderProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

export default function VariantBuilder({ variants, onChange }: VariantBuilderProps) {
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const handleAdd = () => {
    if (!color.trim() && !size.trim()) return;

    const newVariant: Variant = {
      color: color.trim() || undefined,
      size: size.trim() || undefined,
      price: price ? parseFloat(price) : undefined,
      stock: stock ? parseInt(stock) : undefined,
    };

    onChange([...variants, newVariant]);
    setColor('');
    setSize('');
    setPrice('');
    setStock('');
  };

  const handleRemove = (index: number) => {
    onChange(variants.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 select-none">
      <div className="flex items-center gap-2 pb-1 border-b border-zinc-200 dark:border-zinc-800/80">
        <Sliders className="w-4 h-4 text-indigo-500" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Variants Manager</h4>
      </div>

      {/* Input row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Color</label>
          <input
            type="text"
            value={color}
            onChange={e => setColor(e.target.value)}
            placeholder="e.g. Red, Crimson"
            className="form-input text-xs text-foreground bg-background border border-zinc-200 dark:border-zinc-800 py-1.5"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Size / Option</label>
          <input
            type="text"
            value={size}
            onChange={e => setSize(e.target.value)}
            placeholder="e.g. M, L, XL, 256GB"
            className="form-input text-xs text-foreground bg-background border border-zinc-200 dark:border-zinc-800 py-1.5"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Override price"
            min="0"
            className="form-input text-xs text-foreground bg-background border border-zinc-200 dark:border-zinc-800 py-1.5"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase">Stock Qty</label>
          <input
            type="number"
            value={stock}
            onChange={e => setStock(e.target.value)}
            placeholder="Override stock"
            min="0"
            className="form-input text-xs text-foreground bg-background border border-zinc-200 dark:border-zinc-800 py-1.5"
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="col-span-2 md:col-span-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow shadow-indigo-600/10 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Option
        </button>
      </div>

      {/* Variants List grid/table */}
      {variants.length === 0 ? (
        <span className="text-[11px] text-zinc-400 italic text-center py-2">No variants created. Product defaults will apply.</span>
      ) : (
        <div className="w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background mt-1">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold bg-zinc-100/30 dark:bg-zinc-900/30">
                <th className="py-2 px-3">Color</th>
                <th className="py-2 px-3">Size/Option</th>
                <th className="py-2 px-3">Price override</th>
                <th className="py-2 px-3">Stock override</th>
                <th className="py-2 px-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {variants.map((v, index) => (
                <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/10">
                  <td className="py-2 px-3 font-semibold text-foreground">{v.color || <span className="text-zinc-400">-</span>}</td>
                  <td className="py-2 px-3 font-semibold text-foreground">{v.size || <span className="text-zinc-400">-</span>}</td>
                  <td className="py-2 px-3 text-foreground">{v.price !== undefined ? `₹${v.price}` : <span className="text-zinc-400">Default</span>}</td>
                  <td className="py-2 px-3 text-foreground">{v.stock !== undefined ? `${v.stock} units` : <span className="text-zinc-400">Default</span>}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
