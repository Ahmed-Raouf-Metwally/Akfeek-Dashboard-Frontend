import React, { useCallback, useState } from 'react';

export function useConfirm() {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'primary',
    onConfirm: null,
    onCancel: null,
  });

  const openConfirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title ?? 'Confirm',
        message: options.message ?? '',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        variant: options.variant ?? 'primary',
        onConfirm: () => {
          setState((s) => ({ ...s, open: false }));
          resolve(true);
        },
        onCancel: () => {
          setState((s) => ({ ...s, open: false }));
          resolve(false);
        },
      });
    });
  }, []);

  const ConfirmModal = useCallback(
    () =>
      state.open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={(e) => e.target === e.currentTarget && state.onCancel?.()}
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <h3 id="confirm-title" className="text-lg font-semibold text-slate-900">
              {state.title}
            </h3>
            {state.message && (
              <p className="mt-2 text-sm text-slate-500">{state.message}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={state.onCancel}
              >
                {state.cancelLabel}
              </button>
              <button
                type="button"
                className={
                  state.variant === 'danger'
                    ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500'
                    : 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500'
                }
                onClick={state.onConfirm}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null,
    [state]
  );

  return [openConfirm, ConfirmModal];
}

export default useConfirm;
