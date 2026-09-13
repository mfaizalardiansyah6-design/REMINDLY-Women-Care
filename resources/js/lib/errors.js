export function getApiErrors(err, fallback) {
    const data = err?.response?.data;
    if (!data) return { message: fallback ?? 'Terjadi kesalahan.' };
    if (data.errors) return { message: data.message, errors: data.errors };
    return { message: data.message ?? fallback ?? 'Terjadi kesalahan.', errors: {} };
}
