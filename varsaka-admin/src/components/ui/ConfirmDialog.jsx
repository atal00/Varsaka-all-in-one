import React, { useEffect, useRef } from 'react';
import './ConfirmDialog.css';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel
}) {
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus cancel button by default for safety on destructive actions
    const timer = setTimeout(() => {
      if (isDestructive && cancelBtnRef.current) {
        cancelBtnRef.current.focus();
      } else if (confirmBtnRef.current) {
        confirmBtnRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDestructive, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        className="confirm-dialog-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon ${isDestructive ? 'destructive' : 'info'}`}>
            {isDestructive ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            )}
          </div>
          <div className="confirm-dialog-text">
            <h3 id="confirm-dialog-title">{title}</h3>
            <p id="confirm-dialog-desc">{description}</p>
          </div>
        </div>

        <div className="confirm-dialog-actions">
          <button
            type="button"
            ref={cancelBtnRef}
            className="confirm-dialog-btn cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            className={`confirm-dialog-btn ${isDestructive ? 'confirm-destructive' : 'confirm-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
