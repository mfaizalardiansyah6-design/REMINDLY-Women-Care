import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    BellRing,
    Plus,
    Search,
    Clock,
    Check,
    Copy,
    AlarmClockOff,
    Trash2,
    Pencil,
    CalendarDays,
    Repeat,
    Tag,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import { reminderApi } from '../api/reminders';
import { categoryApi } from '../api/categories';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const emptyForm = {
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium',
    repeat: 'none',
    notify_before_minutes: '',
    category_id: '',
};

function formatDate(dateStr) {
    if (!dateStr) return 'Sepanjang hari';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 260, damping: 26, delay: i * 0.03 },
    }),
};

export default function Reminders() {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ priority: '', status: '', category_id: '' });
    const [sort, setSort] = useState('date');
    const [categories, setCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        categoryApi.index('reminder').then(setCategories).catch(() => setCategories([]));
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await reminderApi.index({
                search: search || undefined,
                priority: filters.priority || undefined,
                status: filters.status || undefined,
                category_id: filters.category_id || undefined,
                sort,
            });
            setItems(res.data ?? []);
            setMeta(res.meta ?? null);
        } catch (e) {
            toast.error('Gagal memuat pengingat.');
        } finally {
            setLoading(false);
        }
    }, [search, filters.priority, filters.status, filters.category_id, sort, toast]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
        setModalOpen(true);
    };

    const openEdit = (r) => {
        setEditing(r);
        setForm({
            title: r.title,
            description: r.description ?? '',
            date: r.date,
            time: r.time ?? '',
            priority: r.priority,
            repeat: r.repeat,
            notify_before_minutes: r.notify_before_minutes ?? '',
            category_id: r.category_id ?? '',
        });
        setModalOpen(true);
    };

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                notify_before_minutes: form.notify_before_minutes ? Number(form.notify_before_minutes) : null,
            };
            if (editing) {
                await reminderApi.update(editing.id, payload);
                toast.success('Pengingat diperbarui.');
            } else {
                await reminderApi.store(payload);
                toast.success('Pengingat dibuat.');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            const msg = err?.response?.data?.message ?? 'Gagal menyimpan pengingat.';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const toggleComplete = async (r) => {
        try {
            if (r.completed) {
                await reminderApi.reopen(r.id);
                toast.info('Pengingat dibuka kembali.');
            } else {
                await reminderApi.complete(r.id);
                toast.success('Pengingat selesai!');
            }
            load();
        } catch {
            toast.error('Gagal mengubah status.');
        }
    };

    const snooze = async (r, minutes) => {
        try {
            await reminderApi.snooze(r.id, minutes);
            toast.success(`Ditunda ${minutes} menit.`);
            load();
        } catch {
            toast.error('Gagal menunda.');
        }
    };

    const duplicate = async (r) => {
        try {
            await reminderApi.duplicate(r.id);
            toast.success('Pengingat diduplikasi.');
            load();
        } catch {
            toast.error('Gagal menduplikasi.');
        }
    };

    const remove = async (r) => {
        if (!window.confirm(`Hapus pengingat "${r.title}"?`)) return;
        try {
            await reminderApi.destroy(r.id);
            toast.success('Pengingat dihapus.');
            load();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    const gotoPage = (url) => {
        if (!url) return;
        const u = new URL(url);
        reminderApi.index(Object.fromEntries(u.searchParams)).then((res) => {
            setItems(res.data ?? []);
            setMeta(res.meta ?? null);
        });
    };

    const actionBtn =
        'pressable flex items-center gap-1 rounded-xl p-2 text-neutral-400 transition-all duration-200 hover:bg-neutral-100/80 hover:scale-110 dark:hover:bg-neutral-800/60';

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6"
            >
                <div className="glass-strong hairline flex items-center justify-between gap-4 rounded-3xl px-5 py-4 shadow-soft sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-[0_4px_16px_-2px_rgba(230,75,125,0.45)]">
                            <BellRing className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-3xl">Pengingat</h1>
                            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">Kelola pengingat cerdas Anda.</p>
                        </div>
                    </div>
                    <Button onClick={openCreate} className="hidden sm:inline-flex">
                        <Plus className="h-4 w-4" /> Buat Pengingat
                    </Button>
                </div>
            </motion.header>

            {/* Filter card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.08 }}
            >
                <Card className="mb-6 p-4 glass-strong hairline sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari pengingat..."
                                className="w-full rounded-2xl border border-neutral-200/80 bg-white/70 py-2.5 pl-11 pr-3 text-sm text-neutral-900 placeholder-neutral-400/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur transition-all duration-200 focus:border-blush-400 focus:outline-none focus:ring-4 focus:ring-blush-100/60 dark:border-neutral-700/70 dark:bg-neutral-800/60 dark:text-neutral-100 dark:focus:border-blush-500 dark:focus:ring-blush-900/30"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))} className="w-36">
                                <option value="">Semua Prioritas</option>
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                            </Select>
                            <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="w-36">
                                <option value="">Semua Status</option>
                                <option value="pending">Aktif</option>
                                <option value="upcoming">Akan Datang</option>
                                <option value="today">Hari Ini</option>
                                <option value="completed">Selesai</option>
                            </Select>
                            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-36">
                                <option value="date">Tanggal</option>
                                <option value="priority">Prioritas</option>
                                <option value="title">Judul</option>
                                <option value="created_at">Terbaru</option>
                            </Select>
                        </div>
                    </div>
                    {categories.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-200/50 pt-3 dark:border-neutral-800/50">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                <SlidersHorizontal className="h-3.5 w-3.5" /> Kategori:
                            </span>
                            <Select value={filters.category_id} onChange={(e) => setFilters((f) => ({ ...f, category_id: e.target.value }))} className="w-44">
                                <option value="">Semua</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Select>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : items.length === 0 ? (
                <EmptyState
                    title="Belum ada pengingat"
                    description="Buat pengingat pertama Anda untuk mulai mengatur hari."
                    icon={BellRing}
                />
            ) : (
                <motion.div
                    variants={{ hidden: {}, show: {} }}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-3"
                >
                    <AnimatePresence>
                        {items.map((r, i) => (
                            <motion.div
                                key={r.id}
                                variants={itemVariants}
                                custom={i}
                                layout
                                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            >
                                <Card hover className={`p-4 transition-opacity sm:p-5 ${r.completed ? 'opacity-55' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <motion.button
                                            whileTap={{ scale: 0.8 }}
                                            onClick={() => toggleComplete(r)}
                                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                                                r.completed
                                                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_2px_8px_-2px_rgba(16,185,129,0.5)]'
                                                    : 'border-neutral-300 text-transparent hover:border-blush-400 dark:border-neutral-600'
                                            }`}
                                        >
                                            <Check className="h-4 w-4" />
                                        </motion.button>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className={`text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 ${r.completed ? 'line-through text-neutral-400' : ''}`}>{r.title}</p>
                                                <Badge priority={r.priority} />
                                                {r.repeat !== 'none' && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-lavender-50/80 px-2 py-0.5 text-xs font-medium capitalize text-lavender-700 ring-1 ring-inset ring-lavender-500/10 backdrop-blur-sm dark:bg-lavender-950/40 dark:text-lavender-300">
                                                        <Repeat className="h-3 w-3" /> {r.repeat}
                                                    </span>
                                                )}
                                                {r.category && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100/80 px-2 py-0.5 text-xs font-medium text-neutral-600 ring-1 ring-inset ring-neutral-200/60 dark:bg-neutral-800/80 dark:text-neutral-300">
                                                        <Tag className="h-3 w-3" /> {r.category.name}
                                                    </span>
                                                )}
                                            </div>
                                            {r.description && (
                                                <p className="mt-1 leading-relaxed text-sm text-neutral-500 dark:text-neutral-400">{r.description}</p>
                                            )}
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CalendarDays className="h-3.5 w-3.5 text-neutral-400" /> {formatDate(r.date)}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-neutral-400" /> {r.time ?? 'Sepanjang hari'}
                                                </span>
                                                {r.notify_before_minutes != null && (
                                                    <span className="rounded-md bg-neutral-100/70 px-1.5 py-0.5 dark:bg-neutral-800/60">
                                                        Notifikasi {r.notify_before_minutes} mnt sebelumnya
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-0.5">
                                            <button onClick={() => snooze(r, 5)} title="Tunda 5 menit" className={`${actionBtn} hover:text-lavender-600 dark:hover:text-lavender-300`}>
                                                <AlarmClockOff className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => duplicate(r)} title="Duplikat" className={`${actionBtn} hover:text-lavender-600 dark:hover:text-lavender-300`}>
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => openEdit(r)} title="Edit" className={`${actionBtn} hover:text-blush-600 dark:hover:text-blush-400`}>
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => remove(r)} title="Hapus" className={`${actionBtn} hover:text-rose-600 dark:hover:text-rose-400`}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 flex items-center justify-center gap-4"
                >
                    <Button variant="outline" size="sm" disabled={!meta.prev_page_url} onClick={() => gotoPage(meta.prev_page_url)}>
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                    </Button>
                    <span className="glass-strong hairline rounded-full px-4 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                        {meta.current_page} / {meta.last_page}
                    </span>
                    <Button variant="outline" size="sm" disabled={!meta.next_page_url} onClick={() => gotoPage(meta.next_page_url)}>
                        Berikutnya
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </motion.div>
            )}

            {/* Mobile FAB */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.3 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={openCreate}
                className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-[0_8px_24px_-4px_rgba(230,75,125,0.5)] sm:hidden"
            >
                <Plus className="h-6 w-6" />
            </motion.button>

            {/* Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Pengingat' : 'Buat Pengingat'}>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <Input label="Judul *" value={form.title} onChange={set('title')} placeholder="cth. Minum air putih" required />
                    <Textarea label="Deskripsi" value={form.description} onChange={set('description')} rows={2} placeholder="Detail tambahan (opsional)" />
                    <div className="grid grid-cols-2 gap-3">
                        <Input type="date" label="Tanggal *" value={form.date} onChange={set('date')} required />
                        <Input type="time" label="Waktu" value={form.time} onChange={set('time')} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Select label="Prioritas" value={form.priority} onChange={set('priority')}>
                            <option value="low">Rendah</option>
                            <option value="medium">Sedang</option>
                            <option value="high">Tinggi</option>
                        </Select>
                        <Select label="Ulangi" value={form.repeat} onChange={set('repeat')}>
                            <option value="none">Tidak</option>
                            <option value="daily">Harian</option>
                            <option value="weekly">Mingguan</option>
                            <option value="monthly">Bulanan</option>
                            <option value="yearly">Tahunan</option>
                            <option value="custom">Kustom</option>
                        </Select>
                    </div>
                    <Input type="number" label="Notifikasi sebelum (menit)" value={form.notify_before_minutes} onChange={set('notify_before_minutes')} min={0} placeholder="cth. 15" />
                    <Select label="Kategori" value={form.category_id} onChange={set('category_id')}>
                        <option value="">Tidak ada</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                    <div className="mt-2 flex justify-end gap-2 border-t border-neutral-200/50 pt-4 dark:border-neutral-800/50">
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button type="submit" loading={saving} disabled={saving}>
                            {editing ? 'Simpan Perubahan' : 'Buat Pengingat'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
