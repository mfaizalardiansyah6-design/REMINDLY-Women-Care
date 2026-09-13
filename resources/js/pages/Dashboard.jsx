import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    BellRing,
    StickyNote,
    ListTodo,
    Droplets,
    CalendarDays,
    Pin,
    Clock,
    ChevronRight,
    Sparkles,
    TrendingUp,
    CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { dashboardApi } from '../api/dashboard';

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
}

const quickActions = [
    { label: 'Pengingat', to: '/reminders', icon: BellRing, tile: 'from-blush-500/15 to-blush-500/5 text-blush-600 dark:text-blush-300', glow: 'shadow-blush-500/20' },
    { label: 'Catatan', to: '/notes', icon: StickyNote, tile: 'from-lavender-500/15 to-lavender-500/5 text-lavender-600 dark:text-lavender-300', glow: 'shadow-lavender-500/20' },
    { label: 'To-Do', to: '/tasks', icon: ListTodo, tile: 'from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-300', glow: 'shadow-amber-500/20' },
    { label: 'Siklus', to: '/period', icon: Droplets, tile: 'from-rose-500/15 to-rose-500/5 text-rose-500 dark:text-rose-300', glow: 'shadow-rose-500/20' },
];

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 240, damping: 26, delay: i * 0.06 },
    }),
};

const viewAll = (
    <Link
        to="/reminders"
        className="flex items-center gap-0.5 text-xs font-semibold text-blush-500 transition-colors hover:text-blush-600"
    >
        Lihat <ChevronRight className="h-3.5 w-3.5" />
    </Link>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardApi
            .index()
            .then((res) => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    const first = (user?.name ?? '').split(' ')[0] || 'Sahabat';
    const period = data?.period_countdown;
    const stats = data?.stats;

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Hero Header */}
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                className="mb-8"
            >
                <div className="glass-strong hairline flex items-center gap-3 rounded-3xl px-5 py-4 shadow-soft sm:px-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-[0_4px_16px_-2px_rgba(230,75,125,0.45)]">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blush-500">
                            {data?.greeting ?? 'Halo'}
                        </p>
                        <h1 className="mt-0.5 text-2xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-3xl">
                            {first} 👋
                        </h1>
                    </div>
                    <p className="hidden text-right text-sm text-neutral-400 dark:text-neutral-500 sm:block">
                        Semua pengingat, tugas, dan siklus<br />Anda dalam satu tempat.
                    </p>
                </div>
            </motion.header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : (
                <motion.div
                    variants={{ hidden: {}, show: {} }}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-6"
                >
                    {/* Stats Overview */}
                    {stats && (
                        <motion.section variants={itemVariants} custom={0}>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Hari Ini', value: stats.todays_reminders_count, icon: Clock, tile: 'from-blush-500/15 to-blush-500/5 text-blush-600 dark:text-blush-300' },
                                    { label: 'Tugas Aktif', value: stats.pending_tasks_count, icon: ListTodo, tile: 'from-lavender-500/15 to-lavender-500/5 text-lavender-600 dark:text-lavender-300' },
                                    { label: 'Akan Datang', value: stats.upcoming_reminders_count, icon: TrendingUp, tile: 'from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-300' },
                                ].map(({ label, value, icon: Icon, tile }, i) => (
                                    <motion.div
                                        key={label}
                                        variants={itemVariants}
                                        custom={i + 1}
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                                        className="glass-strong hairline group flex items-center gap-3 rounded-2xl px-4 py-3.5 shadow-soft"
                                    >
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-black/[0.03] transition-transform duration-200 group-hover:scale-110 ${tile}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                                {value}
                                            </p>
                                            <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                                                {label}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Period hero card */}
                    {period && (
                        <motion.section
                            variants={itemVariants}
                            custom={3}
                            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush-500 via-blush-600 to-lavender-600 p-6 text-white shadow-float sm:p-8"
                        >
                            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-lavender-300/20 blur-2xl" />
                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                className="pointer-events-none absolute right-6 top-6 hidden h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm sm:flex"
                            >
                                <Droplets className="h-9 w-9 text-white/70" />
                            </motion.div>
                            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                                        className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm"
                                    >
                                        <Droplets className="h-7 w-7" />
                                    </motion.div>
                                    <div>
                                        <p className="text-sm font-medium text-white/80">
                                            Perkiraan menstruasi berikutnya
                                        </p>
                                        <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                                            {period.days_until} hari lagi
                                        </p>
                                        <p className="mt-0.5 text-sm text-white/75">
                                            Hari siklus ke-{period.current_cycle_day} · {formatDate(period.next_expected_start)}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/period"
                                    className="inline-flex items-center gap-1.5 self-start rounded-2xl bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/30 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)] sm:self-auto"
                                >
                                    Kelola
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </motion.section>
                    )}

                    {/* Quick actions */}
                    <motion.section variants={itemVariants} custom={4}>
                        <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
                            Aksi Cepat
                        </h2>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {quickActions.map(({ label, to, icon: Icon, tile, glow }, i) => (
                                <motion.div
                                    key={label}
                                    variants={itemVariants}
                                    custom={i + 5}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                                    className={`group rounded-3xl bg-white/70 p-1.5 backdrop-blur-sm shadow-soft ring-1 ring-inset ring-neutral-200/60 transition-shadow hover:shadow-lifted dark:bg-neutral-900/65 dark:ring-neutral-800/70`}
                                >
                                    <Link to={to} className="block rounded-[1.4rem] p-4">
                                        <div
                                            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-black/[0.03] transition-transform duration-200 group-hover:scale-110 ${tile}`}
                                        >
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">
                                            {label}
                                        </span>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Two-column grid */}
                    <section className="grid gap-4 md:grid-cols-2">
                        <motion.div variants={itemVariants} custom={8}>
                            <Card className="h-full" hover>
                                <CardHeader title="Pengingat Hari Ini" action={viewAll} icon={BellRing} />
                                <CardContent>
                                    {data?.todays_reminders?.length ? (
                                        <div className="flex flex-col divide-y divide-neutral-100/70 dark:divide-neutral-800/60">
                                            {data.todays_reminders.map((r) => (
                                                <div key={r.id} className="flex items-center gap-3 py-2.5">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blush-50 text-blush-600 ring-1 ring-inset ring-blush-500/10 dark:bg-blush-950/30">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">{r.title}</p>
                                                        <p className="text-xs text-neutral-500">{r.time ?? 'Sepanjang hari'}</p>
                                                    </div>
                                                    <Badge priority={r.priority} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState title="Tidak ada pengingat hari ini" description="Anda bebas hari ini. Nikmati waktu Anda!" icon={BellRing} />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants} custom={9}>
                            <Card className="h-full" hover>
                                <CardHeader
                                    title={`To-Do Belum Selesai (${data?.pending_tasks_count ?? 0})`}
                                    icon={ListTodo}
                                    action={
                                        <Link to="/tasks" className="flex items-center gap-0.5 text-xs font-semibold text-blush-500 transition-colors hover:text-blush-600">
                                            Lihat <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    }
                                />
                                <CardContent>
                                    {data?.pending_tasks?.length ? (
                                        <div className="flex flex-col divide-y divide-neutral-100/70 dark:divide-neutral-800/60">
                                            {data.pending_tasks.map((t) => (
                                                <div key={t.id} className="flex items-center gap-3 py-2.5">
                                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-lavender-400/80" />
                                                    <p className="flex-1 truncate text-sm text-neutral-800 dark:text-neutral-100">{t.title}</p>
                                                    <Badge priority={t.priority} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState title="Semua tugas selesai!" description="Kerja bagus. Tidak ada tugas tertunda." icon={CheckCircle2} />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants} custom={10}>
                            <Card className="h-full" hover>
                                <CardHeader
                                    title="Pengingat Terdekat"
                                    icon={CalendarDays}
                                    action={
                                        <Link to="/reminders" className="flex items-center gap-0.5 text-xs font-semibold text-blush-500 transition-colors hover:text-blush-600">
                                            Lihat <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    }
                                />
                                <CardContent>
                                    {data?.upcoming_reminders?.length ? (
                                        <div className="flex flex-col divide-y divide-neutral-100/70 dark:divide-neutral-800/60">
                                            {data.upcoming_reminders.map((r) => (
                                                <div key={r.id} className="flex items-center gap-3 py-2.5">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender-50 text-lavender-600 ring-1 ring-inset ring-lavender-500/10 dark:bg-lavender-950/30">
                                                        <CalendarDays className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">{r.title}</p>
                                                        <p className="text-xs text-neutral-500">{formatDate(r.date)}</p>
                                                    </div>
                                                    <Badge priority={r.priority} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState title="Belum ada pengingat mendatang" icon={CalendarDays} />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants} custom={11}>
                            <Card className="h-full" hover>
                                <CardHeader
                                    title="Catatan Penting"
                                    icon={StickyNote}
                                    action={
                                        <Link to="/notes" className="flex items-center gap-0.5 text-xs font-semibold text-blush-500 transition-colors hover:text-blush-600">
                                            Lihat <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    }
                                />
                                <CardContent>
                                    {data?.pinned_notes?.length ? (
                                        <div className="flex flex-col divide-y divide-neutral-100/70 dark:divide-neutral-800/60">
                                            {data.pinned_notes.map((n) => (
                                                <div key={n.id} className="flex items-start gap-3 py-2.5">
                                                    <Pin className="mt-0.5 h-4 w-4 shrink-0 text-lavender-500" />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">{n.title}</p>
                                                        <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500">{n.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState title="Belum ada catatan penting" description="Sematkan catatan agar tampil di sini." icon={StickyNote} />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </section>
                </motion.div>
            )}
        </div>
    );
}
