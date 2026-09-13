# REMINDLY - Personal Smart Reminder & Women Care

Aplikasi pengingat pintar pribadi plus perawatan kesehatan wanita (siklus menstruasi), dibangun dengan **Laravel 13**, **React**, **Vite**, dan **Tailwind CSS v4**. Menggunakan autentikasi **Sanctum SPA** (cookie) dan basis data **MySQL**.

## Fitur Utama

- **Autentikasi** - Registrasi, login, logout, pemulihan kata sandi (Sanctum SPA, cookie-based).
- **Dashboard** - Sapaan selamat pagi/siang/malam, pengingat hari ini, tugas tertunda, catatan tersemat, dan hitung mundur siklus berikutnya.
- **Pengingat Cerdas** - CRUD, selesai/buka kembali, tunda (snooze), duplikat, pencarian & filter, prioritas, pengulangan, dan proses otomatis tiap menit (`reminders:process`).
- **Pusat Notifikasi** - Notifikasi dalam aplikasi dengan indikator badge yang diperbarui otomatis.
- **Catatan & To-Do** - Catatan dengan warna, penyematan, pencarian; To-Do dengan prioritas, filter, dan bilah progres.
- **Kalender** - Tampilan bulanan yang menggabungkan pengingat, tugas, tagihan, ulang tahun, dan hari siklus.
- **Pelacak Siklus** - Ringkasan hari siklus, perkiraan awal menstruasi, jendela subur, ovulasi, pencatatan siklus, dan log harian gejala.
- **Pengingat Suara** - Perekaman ucapan (Web Speech API, bahasa Indonesia) lalu diterjemahkan menjadi pengingat secara otomatis.
- **Fitur Tambahan** - Kategori, daftar belanja (dengan item & centang), tagihan (dengan status lunas & jatuh tempo), dan ulang tahun.
- **Asisten Cerdas (AI)** - Chat asisten berbasis aturan untuk membantu seputar pengingat, siklus, dan keseharian.
- **Mode Terang/Gelap** - Toggle tema yang tersimpan di perangkat.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Backend | Laravel 13, PHP 8.3, MySQL 8.4 |
| Autentikasi | Sanctum (SPA, cookie) |
| Frontend | React 18, React Router, Vite 8 |
| Styling | Tailwind CSS v4 (palet blush & lavender) |
| Testing | PHPUnit (39 tes, in-memory SQLite) |

## Persyaratan

- PHP 8.3+
- Composer
- Node.js 20+
- MySQL 8

## Instalasi

```bash
# 1. Salin environment dan install dependensi
cp .env.example .env
composer install
npm install

# 2. Konfigurasi database pada file .env (remindly_db, dll.)

# 3. Generate key, migrate, dan seed data demo
php artisan key:generate
php artisan migrate --seed

# 4. Jalankan server backend dan frontend (dua terminal)
php artisan serve
npm run dev
```

Akses aplikasi di `http://localhost:8000`.

### Akun Demo

- **Email:** `demo@remindly.test`
- **Kata sandi:** `password123`

## Konfigurasi Penting (.env)

Untuk autentikasi Sanctum SPA berjalan di domain yang sama (localhost):

```
APP_URL=http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost:8000,localhost:5173
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false
```

## Penjadwalan Proses Pengingat

Proses otomatis pengingat dijalankan setiap menit. Pastikan scheduler aktif:

```bash
php artisan schedule:work
```

## Menjalankan Tes

```bash
php artisan test
```

Tes migrasi menggunakan in-memory SQLite (diatur di `phpunit.xml`).

## Struktur Proyek

```
app/
  Console/Commands/        # Proses pengingat otomatis
  Http/Controllers/Api/V1/ # API controllers
  Http/Requests/Api/       # FormRequest validasi
  Http/Resources/          # API Resources
  Policies/                # Otorisasi per model
  Services/                # Pengingat, parser suara, siklus
database/
  factories/               # Factory model
  migrations/              # Skema basis data
  seeders/                 # Data demo
resources/
  js/
    api/                   # Service panggilan API (axios)
    components/            # Komponen UI dan layout
    context/               # Auth, Theme, Toast
    pages/                 # Halaman aplikasi
routes/
  api.php                  # Endpoint API v1
tests/Feature/             # Tes fitur API
```
