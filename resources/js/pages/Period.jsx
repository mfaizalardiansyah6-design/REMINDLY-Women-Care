import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
    Droplets,
    Plus,
    CalendarDays,
    Flower2,
    Sparkles,
    Trash2,
    HeartPulse,
    StickyNote,
} from 'lucide-react';
import { periodApi } from '../api/period';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const flows = [
    { value: 'light', label: 'Ringan', tone: 'bg-emerald-100 text-emerald-700' },
    { value: 'medium', label: 'Sedang', tone: 'bg-amber-100 text-amber-700' },
    { value: 'heavy', label: 'Berat', tone: 'bg-rose-100 text-rose-700' },
];

const symptomOptions = ['kram', 'sakit_kepala', 'mood', 'lelah', 'mual', 'kembung', 'nyeri_punggung', 'jerawat', 'ngidam'];

function fmt(iso) {
    if (!iso) return '-';
    return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Period() {
    const toast = useToast();
    const [summary, setSummary] = useState(null);
    const [hasCycle, setHasCycle] = useState(false);
    const [cycles, setCycles] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cycleModal, setCycleModal] = useState(false);
    const [logModal, setLogModal] = useState(false);
    const [cycleForm, setCycleForm] = useState({ start_date: new Date().toISOString().slice(0, 10) });
    const [logForm, setLogForm] = useState({
        log_date: new Date().toISOString().slice(0, 10),
        flow_intensity: 'medium',
        mood: '',
        symptoms: [],
        private_note: '',
    });
    const [saving, setSaving] = useState(false);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [sum, cyc, logs] = await Promise.all([
                periodApi.summary(),
                periodApi.cycles(),
                periodApi.logs(),
            ]);
            setSummary(sum.summary);
            setHasCycle(sum.has_cycle);
            setCycles(cyc.data ?? []);
            setRecentLogs(logs ?? []);
        } catch {
            toast.error('Gagal memuat data siklus.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const toggleSymptom = (s) =>
        setLogForm((f) => ({
            ...f,
            symptoms: f.symptoms.includes(s) ? f.symptoms.filter((x) => x !== s) : [...f.symptoms, s],
        }));

    const startCycle = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await periodApi.storeCycle(cycleForm);
            toast.success('Siklus baru dicatat.');
            setCycleModal(false);
            loadAll();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal mencatat siklus.');
        } finally {
            setSaving(false);
        }
    };

    const saveLog = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await periodApi.storeLog(logForm);
            toast.success('Catatan harian disimpan.');
            setLogModal(false);
            loadAll();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal menyimpan catatan.');
        } finally {
            setSaving(false);
        }
    };

    const removeCycle = async (c) => {
        if (!window.confirm('Hapus siklus ini?')) return;
        try {
            await periodApi.destroyCycle(c.id);
            toast.success('Siklus dihapus.');
            loadAll();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    const cards = [
        {
            icon: Droplets,
            label: 'Periode berikutnya',
            value: summary?.days_until != null ? `${summary.days_until} hari lagi` : '—',
            sub: summary?.next_expected_start ? fmt(summary.next_expected_start) : '',
            color: 'bg-rose-100 text-rose-500',
            highlight: summary?.is_bleeding,
        },
        {
            icon: HeartPulse,
            label: 'Hari siklus',
            value: summary ? `Hari ke-${summary.current_cycle_day}` : '—',
            sub: 'Panjang siklus '.concat(summary?.cycle_length ?? '—', ' hari'),
            color: 'bg-blush-100 text-blush-600',
        },
        {
            icon: Flower2,
            label: 'Jendela subur',
            value: summary ? `${fmt(summary.fertile_start)} - ${fmt(summary.fertile_end)}` : '—',
            sub: summary?.is_fertile ? 'Anda sedang dalam masa subur' : 'Perkiraan ovulasi',
            color: 'bg-lavender-100 text-lavender-600',
        },
        {
            icon: Sparkles,
            label: 'Perkiraan ovulasi',
            value: summary?.ovulation_date ? fmt(summary.ovulation_date) : '—',
            sub: '',
            color: 'bg-amber-100 text-amber-600',
        },
    ];

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6"
            >
                <div className="glass-strong hairline flex flex-wrap items-center justify-between gap-4 rounded-3xl px-5 py-4 shadow-soft sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-blush-500 text-white shadow-[0_4px_16px_-2px_rgba(244,63,94,0.45)]">
                            <Droplets className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-3xl">Pelacak Siklus</h1>
                            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">Pantau siklus menstruasi dan masa subur Anda.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setCycleModal(true)}>
                            <Plus className="h-4 w-4" /> Siklus Baru
                        </Button>
                        <Button onClick={() => setLogModal(true)}>
                            <StickyNote className="h-4 w-4" /> Catat Harian
                        </Button>
                    </div>
                </div>
            </motion.header>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : !hasCycle ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blush-100 text-blush-500 dark:bg-blush-950/40">
                            <Droplets className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold">Mulai lacak siklus Anda</p>
                            <p className="mt-1 text-sm text-neutral-500">Catat tanggal mulai menstruasi untuk mendapatkan prediksi.</p>
                        </div>
                        <Button onClick={() => setCycleModal(true)}>
                            <Plus className="h-4 w-4" /> Catat Siklus Pertama
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-6">
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {cards.map(({ icon: Icon, label, value, sub, color, highlight }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 26, delay: i * 0.06 }}
                                whileHover={{ y: -3 }}
                            >
                                <Card className={highlight ? 'border-rose-300 hover:shadow-lifted dark:border-rose-700' : 'hover:shadow-lifted'}>
                                    <CardContent>
                                        <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
                                        <p className="mt-1 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">{value}</p>
                                        {sub && <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </section>

                    <section className="grid gap-4 md:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.15 }}
                        >
                        <Card className="hover:shadow-lifted">
                            <CardHeader title="Riwayat Siklus" />
                            <CardContent className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                                {cycles.length === 0 && <p className="text-sm text-neutral-500">Belum ada siklus.</p>}
                                {cycles.slice(0, 8).map((c) => (
                                    <div key={c.id} className="flex items-center gap-3 py-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                                            <Droplets className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">
                                                {fmt(c.start_date)}
                                                {c.end_date ? ` – ${fmt(c.end_date)}` : ''}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                siklus {c.cycle_length ?? '—'} hari · {c.period_duration ?? '—'} hari periode
                                            </p>
                                        </div>
                                        <button onClick={() => removeCycle(c)} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.22 }}
                        >
                        <Card className="hover:shadow-lifted">
                            <CardHeader title="Catatan Harian Terbaru" />
                            <CardContent className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                                {recentLogs.length === 0 && (
                                    <EmptyState title="Belum ada catatan" description="Catat gejala harian Anda." icon={StickyNote} />
                                )}
                                {recentLogs.slice(0, 8).map((l) => (
                                    <div key={l.id} className="flex items-center gap-3 py-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender-100 text-lavender-600">
                                            <CalendarDays className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">{fmt(l.log_date)}</p>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                                {l.flow_intensity && (
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        flows.find((f) => f.value === l.flow_intensity)?.tone
                                                    }`}>
                                                        {flows.find((f) => f.value === l.flow_intensity)?.label}
                                                    </span>
                                                )}
                                                {(l.symptoms ?? []).slice(0, 3).map((s) => (
                                                    <span key={s} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {l.mood && <p className="text-sm text-neutral-500">{l.mood}</p>}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        </motion.div>
                    </section>
                </div>
            )}

            <Modal open={cycleModal} onClose={() => setCycleModal(false)} title="Catat Siklus Baru">
                <form onSubmit={startCycle} className="flex flex-col gap-4">
                    <Input type="date" label="Tanggal mulai *" value={cycleForm.start_date} onChange={(e) => setCycleForm((f) => ({ ...f, start_date: e.target.value }))} required />
                    <div className="grid grid-cols-2 gap-3">
                        <Input type="number" label="Panjang siklus (hari)" value={cycleForm.cycle_length} onChange={(e) => setCycleForm((f) => ({ ...f, cycle_length: e.target.value }))} placeholder="cth. 28" min={15} max={60} />
                        <Input type="number" label="Durasi periode (hari)" value={cycleForm.period_duration} onChange={(e) => setCycleForm((f) => ({ ...f, period_duration: e.target.value }))} placeholder="cth. 5" min={1} max={15} />
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setCycleModal(false)}>Batal</Button>
                        <Button type="submit" loading={saving}>Simpan</Button>
                    </div>
                </form>
            </Modal>

            <Modal open={logModal} onClose={() => setLogModal(false)} title="Catat Harian Siklus">
                <form onSubmit={saveLog} className="flex flex-col gap-4">
                    <Input type="date" label="Tanggal *" value={logForm.log_date} onChange={(e) => setLogForm((f) => ({ ...f, log_date: e.target.value }))} required />
                    <Select label="Intensitas aliran" value={logForm.flow_intensity} onChange={(e) => setLogForm((f) => ({ ...f, flow_intensity: e.target.value }))}>
                        {flows.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </Select>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Gejala</label>
                        <div className="flex flex-wrap gap-2">
                            {symptomOptions.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => toggleSymptom(s)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                        logForm.symptoms.includes(s)
                                            ? 'bg-blush-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                                    }`}
                                >
                                    {s.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Input label="Suasana hati" value={logForm.mood} onChange={(e) => setLogForm((f) => ({ ...f, mood: e.target.value }))} />
                    <Textarea label="Catatan pribadi" value={logForm.private_note} onChange={(e) => setLogForm((f) => ({ ...f, private_note: e.target.value }))} rows={2} />
                    <div className="mt-2 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setLogModal(false)}>Batal</Button>
                        <Button type="submit" loading={saving}>Simpan</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}