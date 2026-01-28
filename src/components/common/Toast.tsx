import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { Toast as ToastType, ToastType as ToastVariant } from '@/lib/types';

interface ToastContextType {
  toasts: ToastType[];
  addToast: (type: ToastVariant, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastVariant, message: string, duration = 5000) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string) => addToast('success', message), [addToast]);
  const error = useCallback((message: string) => addToast('error', message), [addToast]);
  const warning = useCallback((message: string) => addToast('warning', message), [addToast]);
  const info = useCallback((message: string) => addToast('info', message), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastStyles: Record<ToastVariant, { bg: string; icon: React.ReactNode; iconColor: string }> = {
  success: {
    bg: 'bg-success-50 border-success-200',
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconColor: 'text-success',
  },
  error: {
    bg: 'bg-error-50 border-error-200',
    icon: <XCircle className="h-5 w-5" />,
    iconColor: 'text-error',
  },
  warning: {
    bg: 'bg-warning-50 border-warning-200',
    icon: <AlertTriangle className="h-5 w-5" />,
    iconColor: 'text-warning',
  },
  info: {
    bg: 'bg-primary-50 border-primary-200',
    icon: <Info className="h-5 w-5" />,
    iconColor: 'text-primary',
  },
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastType;
  onDismiss: (id: string) => void;
}) {
  const style = toastStyles[toast.type];

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-slide-in max-w-sm',
        style.bg
      )}
      role="alert"
    >
      <span className={style.iconColor}>{style.icon}</span>
      <p className="flex-1 text-sm text-neutral-900">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
