import { motion } from 'motion/react';
import { BellRing, Heart, CalendarHeart } from 'lucide-react';

const features = [
    { text: 'Pengingat cerdas untuk hari & siklus Anda', icon: BellRing },
    { text: 'Catatan berwarna & daftar tugas', icon: Heart },
    { text: 'Pelacak siklus dan kalender pribadi', icon: CalendarHeart },
];

export default function AuthLayout({ title, subtitle, children, footer, minimal }) {
    return (
        <div className="app-bg relative flex min-h-screen overflow-hidden">
            {/* Ambient blurred blobs */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-blush-300/20 blur-3xl dark:bg-blush-500/10" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-lavender-300/20 blur-3xl dark:bg-lavender-500/10" />
            <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-200/10 blur-3xl dark:bg-amber-500/5" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-10 px-4 py-10 lg:flex-row lg:gap-20">
                {/* Left brand panel (hidden on small) */}
                <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    className="hidden max-w-md flex-col lg:flex"
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0.9, rotate: -6 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                            whileHover={{ scale: 1.05, rotate: 3 }}
                            className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blush-500 to-lavender-500 shadow-[0_8px_32px_-4px_rgba(230,75,125,0.5)]"
                        >
                            <BellRing className="h-7 w-7 text-white" />
                        </motion.div>
                        <div>
                            <span className="block text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">
                                REMINDLY
                            </span>
                            <span className="block text-sm font-medium text-blush-500">
                                Personal Smart Reminder &amp; Women Care
                            </span>
                        </div>
                    </div>

                    <p className="mt-8 max-w-sm text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                        Kelola hari-hari Anda dengan tenang — pengingat, catatan, dan siklus dalam satu aplikasi yang
                        elegan.
                    </p>

                    <div className="mt-8 flex flex-col gap-3">
                        {features.map(({ text, icon: Icon }, i) => (
                            <motion.div
                                key={text}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 200, damping: 24 }}
                                whileHover={{ x: 4 }}
                                className="flex items-center gap-3 rounded-2xl glass px-4 py-3.5 ring-1 ring-inset ring-white/40 dark:ring-white/5"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blush-500/15 to-lavender-500/15 text-blush-500">
                                    <Icon className="h-4.5 w-4.5" />
                                </span>
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                    {text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                    className="w-full max-w-md"
                >
                    <div className="rounded-[2rem] glass-strong hairline p-6 shadow-float sm:p-8">
                        {minimal || (
                            <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                                <motion.div
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-500 to-lavender-500 shadow-[0_4px_16px_-2px_rgba(230,75,125,0.5)]"
                                >
                                    <BellRing className="h-6 w-6 text-white" />
                                </motion.div>
                                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                    REMINDLY
                                </h1>
                            </div>
                        )}
                        <div className={minimal ? '' : 'lg:text-center'}>
                            <h2 className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <div className={title ? 'mt-6' : ''}>{children}</div>
                        {footer && (
                            <div className="mt-6 border-t border-neutral-200/50 pt-5 text-center text-sm text-neutral-500 dark:border-neutral-800/50 dark:text-neutral-400">
                                {footer}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
