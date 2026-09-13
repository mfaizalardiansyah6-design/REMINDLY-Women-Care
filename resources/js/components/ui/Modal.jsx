import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Modal({ open, onClose, title, children, className }) {
    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Scrim — dims to focus */}
                    <motion.div
                        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sheet / dialog */}
                    <motion.div
                        initial={{ y: 80, scale: 0.96, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 50, scale: 0.97, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                        className={cn(
                            'relative z-10 max-h-[90vh] w-full overflow-y-auto',
                            'rounded-t-[2rem] glass-strong hairline shadow-float',
                            'sm:max-w-lg sm:rounded-[2rem]',
                            className,
                        )}
                    >
                        {/* Sticky header with material blend */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200/50 bg-white/60 px-6 py-4 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60">
                            <h3 className="text-[17px] font-semibold tracking-tight text-neutral-900 dark:text-white">
                                {title}
                            </h3>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100/80 hover:text-neutral-600 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200"
                            >
                                <X className="h-4.5 w-4.5" />
                            </motion.button>
                        </div>
                        <div className="px-6 py-5">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
