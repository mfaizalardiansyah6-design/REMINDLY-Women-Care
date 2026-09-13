import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AuthLayout from '../components/layout/AuthLayout';
import { authApi } from '../api/auth';
import { useToast } from '../context/ToastContext';
import { getApiErrors } from '../lib/errors';

export default function ForgotPassword() {
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [errors, setErrors] = useState({});

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await authApi.forgotPassword({ email });
            setSent(true);
        } catch (err) {
            const api = getApiErrors(err, 'Gagal mengirim tautan reset.');
            setErrors(api.errors ?? {});
            toast.error(api.message);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <AuthLayout
                title="Periksa Email Anda"
                subtitle="Kami telah mengirim tautan untuk mengatur ulang kata sandi."
                footer={
                    <Link to="/login" className="font-semibold text-blush-500 hover:underline">
                        Kembali ke Masuk
                    </Link>
                }
            >
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <MailCheck className="h-7 w-7" />
                    </div>
                    <p className="text-sm text-neutral-500">Cek kotak masuk (atau spam) Anda untuk melanjutkan.</p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Lupa Kata Sandi"
            subtitle="Masukkan email untuk menerima tautan reset."
            footer={
                <Link to="/login" className="font-semibold text-blush-500 hover:underline">
                    Kembali ke Masuk
                </Link>
            }
        >
            <form onSubmit={submit} className="flex flex-col gap-4">
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email?.[0]}
                    placeholder="nama@email.com"
                    required
                />
                <Button type="submit" loading={loading} className="mt-1">
                    Kirim Tautan Reset
                </Button>
            </form>
        </AuthLayout>
    );
}
