import React from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';

const SIZES = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
};

export default function Modal({ title, isOpen, open, onClose, children, size = 'md' }) {
    const isOpenVal = open !== undefined ? Boolean(open) : Boolean(isOpen);
    return (
        <Dialog open={isOpenVal} onClose={onClose} className="relative z-50">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
            />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className={`w-full ${SIZES[size]} overflow-hidden rounded-2xl bg-white shadow-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95`}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                {title}
                            </DialogTitle>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="size-6" />
                            </button>
                        </div>
                        <div className="max-h-[85vh] overflow-y-auto px-6 py-6">
                            {children}
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
