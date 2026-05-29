'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  autoCloseDuration?: number; // in milliseconds
}

export default function SuccessModal({
  open,
  onClose,
  message,
  title = 'Success!',
  autoCloseDuration = 3000,
}: SuccessModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !mounted) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [open, mounted, autoCloseDuration, onClose]);

  if (!mounted || !open) return null;

  const content = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-store-bg border border-store-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex flex-col items-center justify-center px-6 py-8">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-green-100 rounded-full blur opacity-30"></div>
            <div className="relative bg-green-100 rounded-full p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-xl font-bold text-store-text">{title}</h2>
          <p className="mt-3 text-center text-sm text-store-muted">{message}</p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-green-600 hover:bg-green-700 text-white py-2.5 font-semibold transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
