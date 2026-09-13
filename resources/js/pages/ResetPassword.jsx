import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AuthLayout from '../components/layout/AuthLayout';
import { authApi } from '../api/auth';
import { useToast } from '../context/ToastContext';
import { getApiErrors } from '../lib/errors';

export default function ResetPassword() {
    const toast = useToast();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = params.get('token') ?? '';
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        email: params.get('email') ?? '',
        password: '',
        password_confirmation: '',
        token,
    });

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await authApi.resetPassword(form);
            toast.success('Kata sandi berhasil diubah. Silakan masuk.');
            navigate('/login');
        } catch (err) {
            const api = getApiErrors(err, 'Gagal mengatur ulang kata sandi.');
            setErrors(api.errors ?? {});
            toast.error(api.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Atur Ulang Kata Sandi"
            subtitle="Buat kata sandi baru untuk akun Anda."
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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    error={errors.email?.[0]}
                    required
                />
                <Input
                    label="Kata Sandi Baru"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    error={errors.password?.[0]}
                    placeholder="Minimal 8 karakter"
                    required
                />
                <Input
                    label="Konfirmasi Kata Sandi"
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                    error={errors.password_confirmation?.[0]}
                    required
                />
                <Button type="submit" loading={loading} className="mt-1">
                    <KeyRound className="h-4 w-4" />
                    Simpan Kata Sandi Baru
                </Button>
            </form>
        </AuthLayout>
    );
}
