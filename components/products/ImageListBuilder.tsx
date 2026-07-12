'use client';

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Upload, 
  Loader2
} from 'lucide-react';

interface ImageListBuilderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageListBuilder({ images, onChange }: ImageListBuilderProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link Addition logic
  const handleAddLinks = () => {
    if (!urlInput.trim()) return;

    const parsedUrls = urlInput
      .split(/[,\n\s]+/)
      .map(u => u.trim())
      .filter(u => u !== '' && /^https?:\/\/.+/i.test(u));

    if (parsedUrls.length === 0) {
      const fallbackUrl = urlInput.trim();
      if (fallbackUrl && !images.includes(fallbackUrl)) {
        onChange([...images, fallbackUrl]);
      }
    } else {
      const uniqueNewUrls = parsedUrls.filter(u => !images.includes(u));
      if (uniqueNewUrls.length > 0) {
        onChange([...images, ...uniqueNewUrls]);
      }
    }
    
    setUrlInput('');
  };

  // Local File Upload logic (Base64 conversion)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    // Helper to read file as DataURL (Base64)
    const readFile = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      // Process all files in parallel using Promise.all
      const base64Results = await Promise.all(
        Array.from(files).map(file => readFile(file))
      );

      // Filter out duplicate base64 strings
      const uniqueNewUrls = base64Results.filter(base64 => !images.includes(base64));

      if (uniqueNewUrls.length > 0) {
        onChange([...images, ...uniqueNewUrls]);
      }
    } catch (err) {
      console.error('Error loading image files:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 select-none">
      
      {/* Title */}
      <div className="flex items-center gap-2 pb-1 border-b border-zinc-200 dark:border-zinc-800/80">
        <ImageIcon className="w-4 h-4 text-indigo-500" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Images catalog</h4>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800/80 p-0.5 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('link')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'link'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-zinc-500 hover:text-foreground'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Paste Link(s)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-zinc-500 hover:text-foreground'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Product Upload Image</span>
        </button>
      </div>

      {/* TAB CONTENT: LINKS */}
      {activeTab === 'link' && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <textarea
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="Paste product image URL(s). Separate multiple links with commas (,) or newlines..."
            rows={2}
            className="form-input text-foreground bg-background border border-zinc-200 dark:border-zinc-800 text-xs py-2 resize-none font-medium"
          />
          <button
            type="button"
            onClick={handleAddLinks}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow shadow-indigo-600/10 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Pasted URL(s)
          </button>
        </div>
      )}

      {/* TAB CONTENT: UPLOAD LOCAL FILES */}
      {activeTab === 'upload' && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple={true}
            accept="image/*"
            className="hidden"
          />
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-28 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-background/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                <span className="text-xs text-zinc-500 font-semibold">Reading image files...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-semibold text-foreground">Click to browse your device files</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Supports PNG, JPG, WebP. Select multiple items.</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* RENDER CURRENT SELECTED IMAGES DIRECTORY */}
      {images.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800/80 pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Selected / Cataloged Images ({images.length})</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className="group relative h-20 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background overflow-hidden flex items-center justify-center shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Selected Preview ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594736797933-d0501ba21155?w=200';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1 right-1 p-1 rounded bg-black/75 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center">
                  <span className="text-[8px] font-bold text-white tracking-wider uppercase">Photo {idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
