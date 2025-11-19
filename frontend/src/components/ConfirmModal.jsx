import React from "react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  busy = false,
  error = "",
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={busy ? undefined : onCancel}
      />
      <div className="relative mx-4 w-full max-w-md sm:max-w-lg rounded-xl bg-surface-900 p-8 shadow-lg border border-white/10">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3">{title}</h3>
        {message ? (
          <p className="text-[var(--color-muted)] text-base mb-6 leading-relaxed">
            {message}
          </p>
        ) : null}
        {error ? (
          <div className="mb-4 text-sm text-red-300">{error}</div>
        ) : null}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
