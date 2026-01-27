import React from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';

export default function DetailModal({ title, open, onClose, children }) {
  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
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
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
