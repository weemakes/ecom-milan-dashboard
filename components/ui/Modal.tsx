'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'right';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full h-full',
  };

  if (position === 'right') {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-md transition-opacity duration-300">
        {/* Backdrop click */}
        <div className="absolute inset-0 -z-10" onClick={onClose} />
        
        <div className={`w-full ${sizeClasses[size] || 'max-w-lg'} h-full flex flex-col bg-background border-l border-zinc-200 dark:border-zinc-800 shadow-2xl animate-slide-in-right`}>
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-all duration-200 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      {/* Backdrop click */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
      
      <div className={`w-full ${sizeClasses[size]} rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden animate-fade-in`}>
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-all duration-200 cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
