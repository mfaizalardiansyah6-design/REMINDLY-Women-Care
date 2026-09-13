import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Receipt, Plus, Pencil, Trash2, CheckCircle2, Circle, Wallet, Clock, AlertTriangle } from 'lucide-react';
import { billApi } from '../api/bills';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const emptyForm = { name: '', amount: '', due_date: '', remind_days_before: 3 };

const rupiah = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function Bills() {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems((await billApi.index({ status: status || undefined })) ?? []);
        } catch {
            toast.error('Gagal memuat tagihan.');
        } finally {
            setLoading(false);
        }
    }, [status, toast]);

    useEffect(() => { load(); }, [load]);

    const stats = useMemo(() => {
        const total = items.length;
        const paid = items.filter((b) => b.paid).length;
        const unpaid = total - paid;
        const amount = items.filter((b) => !b.paid).reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
        return { total, paid, unpaid, amount };
    }, [items]);

    const isOverdue = (b) => !b.paid && b.due_date && new Date(b.due_date) < new Date(new Date().toDateString());

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
            amount: b.amount,
            due_date: b.due_date,
            remind_days_before: b.remind_days_before ?? 3,
        });
        setModalOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await billApi.update(editing.id, { ...form, paid: editing.paid });
                toast.success('Tagihan diperbarui.');
            } else {
                await billApi.store(form);
                toast.success('Tagihan ditambahkan.');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal menyimpan tagihan.');
        } finally {
            setSaving(false);
        }
    };

    const togglePaid = async (b) => {
        try {
            await billApi.togglePaid(b.id);
            toast.success(b.paid ? 'Tagihan ditandai belum lunas.' : 'Tagihan ditandai lunas.');
            load();
        } catch {
            toast.error('Gagal mengubah status.');
        }
    };

    const remove = async (b) => {
        if (!window.confirm(`Hapus tagihan "${b.name}"?`)) return;
        try {
            await billApi.destroy(b.id);
            toast.success('Tagihan dihapus.');
            load();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6 flex flex-wrap items-center justify-between gap-3"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">Tagihan</h1>
                    <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">Pantau tagihan rutin dan jatuh temponya.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Tambah Tagihan
                </Button>
            </motion.header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 28, delay: 0.05 }}
                className="mb-5 grid grid-cols-3 gap-3"
            >
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-neutral-500"><Wallet className="h-4 w-4" /><span className="text-xs">Belum Lunas</span></div>
                    <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">{stats.unpaid}</p>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-neutral-500"><Clock className="h-4 w-4" /><span className="text-xs">Total Tertunda</span></div>
                    <p className="mt-1 text-lg font-bold text-blush-500">{rupiah(stats.amount)}</p>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-neutral-500"><Receipt className="h-4 w-4" /><span className="text-xs">Lunas</span></div>
                    <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">{stats.paid}</p>
                </Card>
            </motion.div>

            <div className="mb-5 w-full sm:w-44">
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Semua</option>
                    <option value="unpaid">Belum Lunas</option>
                    <option value="paid">Lunas</option>
                </Select>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : items.length === 0 ? (
                <EmptyState title="Tidak ada tagihan" description="Tambahkan tagihan untuk mulai memantau pengeluaran." icon={Receipt} />
            ) : (
                <motion.div initial="hidden" animate="show" className="flex flex-col gap-2.5">
                    {items.map((b, i) => (
                        <motion.div
                            key={b.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 26, delay: i * 0.03 }}
                        >
                        <Card className={`p-4 ${b.paid ? 'opacity-60' : ''}`}>
                            <div className="flex items-start gap-3">
                                <button
                                    onClick={() => togglePaid(b)}
                                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
                                        b.paid ? 'text-emerald-500' : 'text-neutral-300 hover:text-lavender-400'
                                    }`}
                                >
                                    {b.paid ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                </button>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={`text-base font-medium ${b.paid ? 'line-through' : ''}`}>{b.name}</p>
                                        {b.paid ? (
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Lunas</span>
                                        ) : isOverdue(b) ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                                <AlertTriangle className="h-3 w-3" /> Terlambat
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="mt-1 text-sm font-semibold text-blush-500">{rupiah(b.amount)}</p>
                                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                        Jatuh tempo {b.due_date ? new Date(b.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
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
                    ))}
                </motion.div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Tagihan' : 'Tambah Tagihan'}>
                <form onSubmit={save} className="flex flex-col gap-4">
                    <Input label="Nama *" value={form.name} onChange={set('name')} required />
                    <Input label="Nominal (Rp) *" type="number" min="0" value={form.amount} onChange={set('amount')} required />
                    <Input label="Jatuh tempo *" type="date" value={form.due_date} onChange={set('due_date')} required />
                    <Input label="Ingatkan (hari sebelum)" type="number" min="0" max="60" value={form.remind_days_before} onChange={set('remind_days_before')} />
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
