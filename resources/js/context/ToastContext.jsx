import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback((message, type = 'success') => {
        const id = ++idCounter;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => dismiss(id), 4000);
    }, [dismiss]);

    const toast = {
        success: (m) => push(m, 'success'),
        error: (m) => push(m, 'error'),
        info: (m) => push(m, 'info'),
    };

    const styles = {
        success: 'border-emerald-200 bg-white dark:bg-neutral-800 dark:border-emerald-700',
        error: 'border-rose-200 bg-white dark:bg-neutral-800 dark:border-rose-700',
        info: 'border-lavender-200 bg-white dark:bg-neutral-800 dark:border-lavender-700',
    };
    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <AlertTriangle className="h-5 w-5 text-rose-500" />,
        info: <Info className="h-5 w-5 text-lavender-500" />,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-xs flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg ${styles[t.type]}`}
                    >
                        {icons[t.type]}
                        <p className="flex-1 text-sm font-medium">{t.message}</p>
                        <button onClick={() => dismiss(t.id)} className="text-neutral-400 hover:text-neutral-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
