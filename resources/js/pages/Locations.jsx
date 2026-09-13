import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Plus, Pencil, Trash2, Home, Compass, Radius } from 'lucide-react';
import { locationApi } from '../api/locations';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const emptyForm = { name: '', address: '', latitude: '', longitude: '', radius: '100' };

export default function Locations() {
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
            setItems((await locationApi.index()) ?? []);
        } catch {
            toast.error('Gagal memuat lokasi.');
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

    const openEdit = (l) => {
        setEditing(l);
        setForm({
            name: l.name,
            address: l.address ?? '',
            latitude: String(l.latitude),
            longitude: String(l.longitude),
            radius: String(l.radius ?? 100),
        });
        setModalOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            name: form.name,
            address: form.address || null,
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
            radius: form.radius ? Number(form.radius) : 100,
        };
        try {
            if (editing) {
                await locationApi.update(editing.id, payload);
                toast.success('Lokasi diperbarui.');
            } else {
                await locationApi.store(payload);
                toast.success('Lokasi ditambahkan.');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal menyimpan lokasi.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (l) => {
        if (!window.confirm(`Hapus lokasi "${l.name}"?`)) return;
        try {
            await locationApi.destroy(l.id);
            toast.success('Lokasi dihapus.');
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
                    <h1 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">Lokasi</h1>
                    <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">
                        Simpan lokasi penting beserta radius untuk pengingat berbasis lokasi.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Tambah Lokasi
                </Button>
            </motion.header>

            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : items.length === 0 ? (
                <EmptyState title="Belum ada lokasi" description="Tambahkan lokasi agar bisa dipakai untuk pengingat berbasis lokasi." icon={MapPin} />
            ) : (
                <motion.div initial="hidden" animate="show" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((l, i) => (
                        <motion.div
                            key={l.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 26, delay: i * 0.04 }}
                        >
                            <Card className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender-100 text-lavender-600 dark:bg-lavender-950/40 dark:text-lavender-300">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-neutral-900 dark:text-white">{l.name}</p>
                                    {l.address && (
                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                            <Home className="h-3 w-3" /> {l.address}
                                        </p>
                                    )}
                                    <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                                        <Compass className="h-3 w-3" /> {l.latitude.toFixed(5)}, {l.longitude.toFixed(5)}
                                    </p>
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                                        <Radius className="h-3 w-3" /> Radius {l.radius} m
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <button onClick={() => openEdit(l)} title="Edit" className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-blush-600 dark:hover:bg-neutral-800">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => remove(l)} title="Hapus" className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Lokasi' : 'Tambah Lokasi'}>
                <form onSubmit={save} className="flex flex-col gap-4">
                    <Input label="Nama *" value={form.name} onChange={set('name')} placeholder="cth. Rumah" required />
                    <Input label="Alamat" value={form.address} onChange={set('address')} placeholder="Detail alamat (opsional)" />
                    <div className="grid grid-cols-2 gap-3">
                        <Input type="number" step="any" label="Latitude *" value={form.latitude} onChange={set('latitude')} placeholder="-6.2088" required />
                        <Input type="number" step="any" label="Longitude *" value={form.longitude} onChange={set('longitude')} placeholder="106.8456" required />
                    </div>
                    <Input type="number" label="Radius (meter)" value={form.radius} onChange={set('radius')} min={0} placeholder="100" />
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
