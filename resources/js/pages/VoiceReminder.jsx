import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2, BellRing, Wand2, Clock, CalendarDays } from 'lucide-react';
import { aiApi } from '../api/ai';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';

const repeatOptions = [
    { value: 'none', label: 'Tidak' },
    { value: 'daily', label: 'Harian' },
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
    { value: 'yearly', label: 'Tahunan' },
    { value: 'custom', label: 'Kustom' },
];

export default function VoiceReminder() {
    const toast = useToast();
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [preview, setPreview] = useState(null);
    const [creating, setCreating] = useState(false);
    const [supported, setSupported] = useState(true);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            setSupported(false);
            return;
        }
        const rec = new SR();
        rec.lang = 'id-ID';
        rec.continuous = false;
        rec.interimResults = true;

        rec.onresult = (e) => {
            let text = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                text += e.results[i][0].transcript;
            }
            setTranscript(text);
        };

        rec.onend = () => setListening(false);
        rec.onerror = (e) => {
            setListening(false);
            if (e.error !== 'aborted') toast.error('Tidak dapat mengenali suara. Coba lagi.');
        };

        recognitionRef.current = rec;
        return () => {
            try {
                rec.abort();
            } catch {
                /* ignore */
            }
        };
    }, [toast]);

    const toggleListening = () => {
        const rec = recognitionRef.current;
        if (!rec) return;
        if (listening) {
            rec.stop();
            setListening(false);
        } else {
            setTranscript('');
            setPreview(null);
            setListening(true);
            try {
                rec.start();
            } catch {
                setListening(false);
            }
        }
    };

    const handleParse = async () => {
        if (!transcript.trim()) {
            toast.error('Tulis atau ucapkan sesuatu terlebih dahulu.');
            return;
        }
        try {
            const parsed = await aiApi.parse(transcript);
            setPreview({
                ...parsed,
                date: parsed.date ?? new Date().toISOString().slice(0, 10),
            });
        } catch {
            toast.error('Gagal memproses ucapan.');
        }
    };

    const updatePreview = (key) => (e) => setPreview((p) => ({ ...p, [key]: e.target.value }));

    const handleCreate = async () => {
        if (!preview) return;
        setCreating(true);
        try {
            await aiApi.createFromVoice(transcript);
            toast.success('Pengingat dari suara berhasil dibuat!');
            setPreview(null);
            setTranscript('');
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal membuat pengingat.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
            <header className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Pengingat Suara</h1>
                <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                    Ucapkan atau ketik pengingat, dan saya buatkan otomatis.
                </p>
            </header>

            {!supported ? (
                <EmptyState
                    title="Browser tidak mendukung pengenalan suara"
                    description="Gunakan Chrome, Edge, atau Safari. Anda tetap bisa mengetik teks di bawah ini."
                    icon={MicOff}
                />
            ) : (
                <div className="mb-8 flex flex-col items-center gap-4">
                    <button
                        onClick={toggleListening}
                        className={`flex h-20 w-20 items-center justify-center rounded-full transition ${
                            listening
                                ? 'animate-pulse bg-rose-500 text-white'
                                : 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-lg shadow-blush-500/30 hover:scale-105'
                        }`}
                    >
                        {listening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </button>
                    <p className="text-sm text-neutral-500">
                        {listening ? 'Mendengarkan... bicaralah sekarang' : 'Tekan mikrofon untuk mulai berbicara'}
                    </p>
                </div>
            )}

            <Card className="mb-6 p-4">
                <CardHeader title="Teks ucapan / ketik manual" />
                <CardContent className="flex flex-col gap-3">
                    <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows={3}
                        placeholder='Contoh: "ingatkan saya minum obat besok jam 8 pagi"'
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleParse}>
                            <Wand2 className="h-4 w-4" /> Analisis
                        </Button>
                        <Button variant="outline" onClick={() => { setTranscript(''); setPreview(null); }}>
                            Bersihkan
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {preview && (
                <Card>
                    <CardHeader
                        title="Tinjauan Pengingat"
                        subtitle="Periksa hasil analisis, lalu simpan."
                    />
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid gap-3">
                            <Input label="Judul *" value={preview.title} onChange={updatePreview('title')} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input type="date" label="Tanggal" value={preview.date} onChange={updatePreview('date')} />
                                <Input type="time" label="Waktu" value={preview.time ?? ''} onChange={updatePreview('time')} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Select label="Prioritas" value={preview.priority} onChange={updatePreview('priority')}>
                                    <option value="low">Rendah</option>
                                    <option value="medium">Sedang</option>
                                    <option value="high">Tinggi</option>
                                </Select>
                                <Select label="Ulangi" value={preview.repeat} onChange={updatePreview('repeat')}>
                                    {repeatOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {preview.title && (
                        <div className="flex items-center gap-2 rounded-xl bg-lavender-50 px-3 py-2 text-sm text-lavender-700 dark:bg-lavender-950/40 dark:text-lavender-300">
                            <BellRing className="h-4 w-4" />
                            <span className="font-medium">{preview.title}</span>
                            {preview.time && (
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" /> {preview.time}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" /> {preview.date}
                            </span>
                        </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setPreview(null)}>Batal</Button>
                            <Button onClick={handleCreate} loading={creating} disabled={creating}>
                                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                                Buat Pengingat
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}