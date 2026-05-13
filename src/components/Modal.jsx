import { useEffect } from 'react';
import './Modal.css';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal modal-${size}`} role="dialog" aria-modal="true">

        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* Convenience sub-components */
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmVariant = 'btn-primary', loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={`btn ${confirmVariant}`} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.7 }}>{message}</p>
    </Modal>
  );
}