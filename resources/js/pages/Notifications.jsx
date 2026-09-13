import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    BellRing,
    Droplets,
    ListTodo,
    Sparkles,
    Trash2,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { notificationApi } from '../api/notifications';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const typeIcon = {
    reminder: { icon: BellRing, color: 'bg-blush-100 text-blush-600 dark:bg-blush-950/40 dark:text-blush-300' },
    period: { icon: Droplets, color: 'bg-rose-100 text-rose-500 dark:bg-rose-950/40 dark:text-rose-300' },
    task: { icon: ListTodo, color: 'bg-lavender-100 text-lavender-600 dark:bg-lavender-950/40 dark:text-lavender-300' },
    system: { icon: Sparkles, color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
};

function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
}

export default function Notifications() {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await notificationApi.index({ type: filter || undefined });
            setItems(res.data ?? []);
            setMeta(res.meta ?? null);
        } catch {
            toast.error('Gagal memuat notifikasi.');
        } finally {
            setLoading(false);
        }
    }, [filter, toast]);

    useEffect(() => {
        load();
    }, [load]);

    const markRead = async (n) => {
        if (n.read) return;
        try {
            await notificationApi.markRead(n.id);
            load();
        } catch {
            toast.error('Gagal menandai terbaca.');
        }
    };

    const markAll = async () => {
        try {
            await notificationApi.markAllRead();
            toast.success('Semua notifikasi terbaca.');
            load();
        } catch {
            toast.error('Gagal.');
        }
    };

    const remove = async (n) => {
        try {
            await notificationApi.destroy(n.id);
            toast.success('Notifikasi dihapus.');
            load();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    const gotoPage = (url) => {
        if (!url) return;
        const u = new URL(url);
        notificationApi.index(Object.fromEntries(u.searchParams)).then((res) => {
            setItems(res.data ?? []);
            setMeta(res.meta ?? null);
        });
    };

    const tabs = [
        { value: '', label: 'Semua' },
        { value: 'reminder', label: 'Pengingat' },
        { value: 'period', label: 'Siklus' },
        { value: 'task', label: 'Tugas' },
        { value: 'system', label: 'Sistem' },
    ];

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6 flex flex-wrap items-center justify-between gap-3"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">Notifikasi</h1>
                    <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">Pusat pemberitahuan Anda.</p>
                </div>
                {items.some((n) => !n.read) && (
                    <Button variant="outline" size="sm" onClick={markAll}>
                        <CheckCheck className="h-4 w-4" /> Tandai semua terbaca
                    </Button>
                )}
            </motion.header>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 28, delay: 0.05 }}
                className="mb-5 flex flex-wrap gap-2"
            >
                {tabs.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setFilter(t.value)}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                            filter === t.value
                                ? 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-[0_2px_10px_-2px_rgba(230,75,125,0.45)]'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700/60'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : items.length === 0 ? (
                <EmptyState title="Tidak ada notifikasi" description="Anda akan melihat pemberitahuan di sini." icon={BellRing} />
            ) : (
                <motion.div initial="hidden" animate="show" className="flex flex-col gap-2.5">
                    <AnimatePresence>
                    {items.map((n, i) => {
                        const conf = typeIcon[n.type] ?? typeIcon.system;
                        const Icon = conf.icon;
                        return (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 26, delay: i * 0.03 }}
                            >
                            <Card
                                className={`cursor-pointer p-4 transition ${n.read ? 'opacity-60' : ''}`}
                                onClick={() => markRead(n)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${conf.color}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{n.title}</p>
                                            <span className="shrink-0 text-xs text-neutral-400">{timeAgo(n.created_at)}</span>
                                        </div>
                                        {n.body && <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{n.body}</p>}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            remove(n);
                                        }}
                                        className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </Card>
                            </motion.div>
                        );
                    })}
                    </AnimatePresence>
                </motion.div>
            )}

            {meta && meta.last_page > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex items-center justify-center gap-3"
                >
                    <Button variant="outline" size="sm" disabled={!meta.prev_page_url} onClick={() => gotoPage(meta.prev_page_url)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-neutral-500">Halaman {meta.current_page} / {meta.last_page}</span>
                    <Button variant="outline" size="sm" disabled={!meta.next_page_url} onClick={() => gotoPage(meta.next_page_url)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
