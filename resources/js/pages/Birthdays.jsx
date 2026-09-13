import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cake, Plus, Pencil, Trash2, Gift, CalendarDays } from 'lucide-react';
import { birthdayApi } from '../api/birthdays';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const emptyForm = { name: '', birth_date: '', notify_before_days: 3 };

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

function daysUntil(dateStr) {
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
}

export default function Birthdays() {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems((await birthdayApi.index()) ?? []);
        } catch {
            toast.error('Gagal memuat ulang tahun.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (b) => {
        setEditing(b);
        setForm({
            name: b.name,
            birth_date: b.birth_date,
            notify_before_days: b.notify_before_days ?? 3,
        });
        setModalOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await birthdayApi.update(editing.id, form);
                toast.success('Ulang tahun diperbarui.');
            } else {
                await birthdayApi.store(form);
                toast.success('Ulang tahun ditambahkan.');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal menyimpan ulang tahun.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (b) => {
        if (!window.confirm(`Hapus ulang tahun "${b.name}"?`)) return;
        try {
            await birthdayApi.destroy(b.id);
            toast.success('Ulang tahun dihapus.');
            load();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    const sorted = [...items].sort((a, b) => (a.next_occurrence || '').localeCompare(b.next_occurrence || ''));

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6 flex flex-wrap items-center justify-between gap-3"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">Ulang Tahun</h1>
                    <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">Jangan lupa ucapkan selamat untuk orang-orang tersayang.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Tambah
                </Button>
            </motion.header>

            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : sorted.length === 0 ? (
                <EmptyState title="Belum ada ulang tahun" description="Tambahkan tanggal ulang tahun orang terdekat." icon={Cake} />
            ) : (
                <motion.div initial="hidden" animate="show" className="flex flex-col gap-2.5">
                    {sorted.map((b, i) => {
                        const days = daysUntil(b.next_occurrence);
                        return (
                            <motion.div
                                key={b.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 26, delay: i * 0.03 }}
                            >
                            <Card className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush-100 text-blush-500 dark:bg-blush-950/40">
                                        <Cake className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-base font-medium text-neutral-900 dark:text-white">{b.name}</p>
                                            {days === 0 && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blush-100 px-2 py-0.5 text-xs font-semibold text-blush-700 dark:bg-blush-950/40 dark:text-blush-300">
                                                    <Gift className="h-3 w-3" /> Hari ini!
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Lahir {formatDate(b.birth_date)} · Berikutnya {formatDate(b.next_occurrence)}
                                        </p>
                                        <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">
                                            {days === 0 ? 'Selamat ulang tahun hari ini!' : `Tinggal ${days} hari lagi`}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button onClick={() => openEdit(b)} title="Edit" className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-blush-600 dark:hover:bg-neutral-800">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => remove(b)} title="Hapus" className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Ulang Tahun' : 'Tambah Ulang Tahun'}>
                <form onSubmit={save} className="flex flex-col gap-4">
                    <Input label="Nama *" value={form.name} onChange={set('name')} required />
                    <Input label="Tanggal lahir *" type="date" value={form.birth_date} onChange={set('birth_date')} required />
                    <Input label="Ingatkan (hari sebelum)" type="number" min="0" max="30" value={form.notify_before_days} onChange={set('notify_before_days')} />
                    <div className="mt-2 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button type="submit" loading={saving} disabled={saving}>
                            {editing ? 'Simpan' : 'Tambah'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
