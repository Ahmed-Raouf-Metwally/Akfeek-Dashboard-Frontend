import React from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';

export default function DetailModal({ title, open, onClose, children }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition duration-200 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition duration-200 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <DialogTitle id="detail-modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
