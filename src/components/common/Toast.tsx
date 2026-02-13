'use client';

import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useToastStore, type ToastType } from '@/store/useToastStore';

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
};

const BG_MAP: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-white dark:border-emerald-800 dark:bg-gray-800',
  error: 'border-red-200 bg-white dark:border-red-800 dark:bg-gray-800',
  info: 'border-blue-200 bg-white dark:border-blue-800 dark:bg-gray-800',
  warning: 'border-amber-200 bg-white dark:border-amber-800 dark:bg-gray-800',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-toast-in flex items-center gap-2 rounded-lg border px-3 py-2.5 shadow-lg ${BG_MAP[toast.type]}`}
        >
          {ICON_MAP[toast.type]}
          <span className="text-sm text-gray-800 dark:text-gray-200">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="닫기"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
