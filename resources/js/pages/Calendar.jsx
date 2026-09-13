import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { calendarApi } from '../api/calendar';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const typeStyle = {
    reminder: 'bg-blush-500',
    task: 'bg-lavender-500',
    birthday: 'bg-amber-500',
    bill: 'bg-emerald-500',
    period: 'bg-rose-500',
};

const typeDot = {
    reminder: 'bg-blush-500',
    task: 'bg-lavender-500',
    birthday: 'bg-amber-400',
    bill: 'bg-emerald-400',
    period: 'bg-rose-400',
};

const legend = [
    { label: 'Pengingat', color: 'bg-blush-400' },
    { label: 'Tugas', color: 'bg-lavender-400' },
    { label: 'Ulang tahun', color: 'bg-amber-400' },
    { label: 'Tagihan', color: 'bg-emerald-400' },
    { label: 'Menstruasi', color: 'bg-rose-400' },
];

export default function Calendar() {
    const toast = useToast();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(
        async (y, m) => {
            setLoading(true);
            try {
                const res = await calendarApi.index(y, m);
                setEvents(res.events ?? []);
            } catch {
                toast.error('Gagal memuat kalender.');
            } finally {
                setLoading(false);
            }
        },
        [toast],
    );

    useEffect(() => {
        load(year, month);
    }, [year, month, load]);

    const byDate = useMemo(() => {
        const map = {};
        for (const ev of events) {
            map[ev.date] = map[ev.date] || [];
            map[ev.date].push(ev);
        }
        return map;
    }, [events]);

    const cellDate = (d) => `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const todayStr = now.toISOString().slice(0, 10);

    const shiftMonth = (delta) => {
        let m = month + delta;
        let y = year;
        if (m < 1) {
            m = 12;
            y -= 1;
        } else if (m > 12) {
            m = 1;
            y += 1;
        }
        setMonth(m);
        setYear(y);
    };

    const daysInMonth = () => new Date(year, month, 0).getDate();
    const firstWeekday = () => new Date(year, month - 1, 1).getDay(); // Sun=0
    const leadingBlanks = (firstWeekday + 6) % 7; // shift to Monday start

    const grid = [];
    for (let i = 0; i < leadingBlanks; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth(); d++) grid.push(d);
    while (grid.length % 7 !== 0) grid.push(null);

    const monthName = new Date(year, month - 1, 1).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6"
            >
                <div className="glass-strong hairline flex flex-wrap items-center justify-between gap-4 rounded-3xl px-5 py-4 shadow-soft sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-glow">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold capitalize tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-3xl">{monthName}</h1>
                            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">Semua aktivitas Anda dalam satu tampilan.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)}>
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="sm" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); }}>
                                Hari ini
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="icon" onClick={() => shiftMonth(1)}>
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </motion.header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.08 }}
                className="glass-strong hairline mb-4 flex flex-wrap gap-x-4 gap-y-2 rounded-2xl px-4 py-3 shadow-soft"
            >
                {legend.map((l) => (
                    <span key={l.label} className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                        <span className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
                        {l.label}
                    </span>
                ))}
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                    className="glass-strong overflow-hidden rounded-3xl hairline shadow-soft"
                >
                    <div className="grid grid-cols-7 border-b border-neutral-200/60 bg-white/50 px-1 dark:border-neutral-800 dark:bg-neutral-900/40">
                        {dayNames.map((d, i) => (
                            <div key={d} className={`px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-neutral-400 ${i === 0 || i === 6 ? 'text-rose-400' : ''}`}>
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 px-1 pb-1">
                        {grid.map((d, idx) => {
                            const isNull = d === null;
                            const dateStr = isNull ? null : cellDate(d);
                            const dayEvents = dateStr ? byDate[dateStr] ?? [] : [];
                            const isToday = dateStr === todayStr;
                            const isWeekend = idx % 7 === 0 || idx % 7 === 6;
                            const hasPeriod = dayEvents.some((e) => e.type === 'period');
                            return (
                                <motion.div
                                    key={idx}
                                    whileHover={isNull ? undefined : { scale: 0.98, zIndex: 1 }}
                                    className={`min-h-24 rounded-xl p-1.5 transition-colors ${
                                        isNull
                                            ? ''
                                            : 'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/40 sm:m-0.5'
                                    }`}
                                >
                                    {!isNull && (
                                        <>
                                            <div className="mb-1 flex items-center justify-between pr-1 pt-0.5">
                                                <span
                                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                                                        isToday
                                                            ? 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-glow'
                                                            : isWeekend
                                                              ? 'text-rose-400 dark:text-rose-300'
                                                              : 'text-neutral-600 dark:text-neutral-300'
                                                    }`}
                                                >
                                                    {d}
                                                </span>
                                                {hasPeriod && <span className="h-1.5 w-4 rounded-full bg-rose-500" />}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {dayEvents.slice(0, 3).map((ev, i) => (
                                                    <div
                                                        key={ev.type + '-' + ev.id + '-' + i}
                                                        className="flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 text-[11px] leading-tight text-white shadow-sm"
                                                        style={{ backgroundColor: typeStyle[ev.type] ?? '#a855f7' }}
                                                        title={`${ev.title}${ev.time ? ' • ' + ev.time : ''}`}
                                                    >
                                                        {ev.time && <span className="shrink-0 opacity-80">{ev.time.slice(0, 5)}</span>}
                                                        <span className="truncate">{ev.title}</span>
                                                    </div>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <span className="px-1.5 text-[10px] font-medium text-neutral-400">+{dayEvents.length - 3} lainnya</span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}