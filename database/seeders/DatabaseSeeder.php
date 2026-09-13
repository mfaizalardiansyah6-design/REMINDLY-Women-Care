<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Birthday;
use App\Models\Category;
use App\Models\Location;
use App\Models\Note;
use App\Models\PeriodCycle;
use App\Models\PeriodLog;
use App\Models\PeriodSymptomLog;
use App\Models\Reminder;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\Task;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $demo = User::updateOrCreate(
            ['email' => 'demo@remindly.test'],
            [
                'name' => 'Dewi Ayu',
                'password' => 'password123',
                'gender' => 'female',
                'birthdate' => '1998-05-20',
                'period_notifications' => true,
            ],
        );

        $this->seedCategories($demo);
        $this->seedReminders($demo);
        $this->seedNotes($demo);
        $this->seedTasks($demo);
        $this->seedPeriod($demo);
        $this->seedShopping($demo);
        $this->seedBills($demo);
        $this->seedBirthdays($demo);
        $this->seedLocations($demo);
        $this->seedNotifications($demo);

        User::factory()->count(2)->create()->each(function (User $user): void {
            Reminder::factory()->count(5)->create(['user_id' => $user->id]);
            Note::factory()->count(3)->create(['user_id' => $user->id]);
            Task::factory()->count(4)->create(['user_id' => $user->id]);
        });
    }

    private function seedCategories(User $user): void
    {
        $defaults = [
            ['name' => 'Pekerjaan', 'type' => 'reminder', 'color' => '#e64b7d', 'icon' => 'briefcase'],
            ['name' => 'Pribadi', 'type' => 'reminder', 'color' => '#9273dc', 'icon' => 'heart'],
            ['name' => 'Kesehatan', 'type' => 'reminder', 'color' => '#10b981', 'icon' => 'activity'],
            ['name' => 'Kuliah', 'type' => 'task', 'color' => '#f59e0b', 'icon' => 'book'],
            ['name' => 'Ide', 'type' => 'note', 'color' => '#3b82f6', 'icon' => 'lightbulb'],
        ];

        foreach ($defaults as $cat) {
            Category::updateOrCreate(
                ['user_id' => $user->id, 'name' => $cat['name'], 'type' => $cat['type']],
                $cat,
            );
        }
    }

    private function seedReminders(User $user): void
    {
        $work = Category::where('user_id', $user->id)->where('name', 'Pekerjaan')->first();
        $pribadi = Category::where('user_id', $user->id)->where('name', 'Pribadi')->first();
        $health = Category::where('user_id', $user->id)->where('name', 'Kesehatan')->first();

        $today = now();
        $data = [
            [
                'category_id' => $work?->id,
                'title' => 'Rapat mingguan dengan tim',
                'date' => $today->toDateString(),
                'time' => '09:30:00',
                'priority' => 'high',
                'repeat' => 'weekly',
                'notify_before_minutes' => 30,
            ],
            [
                'category_id' => $health?->id,
                'title' => 'Minum vitamin pagi',
                'date' => $today->toDateString(),
                'time' => '09:00:00',
                'priority' => 'low',
                'repeat' => 'daily',
                'notify_before_minutes' => 5,
            ],
            [
                'category_id' => $work?->id,
                'title' => 'Deadline laporan bulanan',
                'date' => $today->copy()->addDays(2)->toDateString(),
                'time' => '17:00:00',
                'priority' => 'high',
                'notify_before_minutes' => 60,
            ],
            [
                'category_id' => $work?->id,
                'title' => 'Introduksi rekan kerja baru',
                'date' => $today->copy()->addDays(4)->toDateString(),
                'time' => '10:00:00',
                'priority' => 'low',
            ],
            [
                'category_id' => $pribadi?->id,
                'title' => 'Bayar BPJS Kesehatan',
                'date' => $today->copy()->addDays(5)->toDateString(),
                'time' => '08:00:00',
                'priority' => 'medium',
                'notify_before_minutes' => 120,
            ],
            [
                'category_id' => $health?->id,
                'title' => 'Check-up dokter gigi',
                'date' => $today->copy()->addDays(10)->toDateString(),
                'time' => '13:00:00',
                'priority' => 'medium',
                'notify_before_minutes' => 180,
            ],
            [
                'category_id' => $pribadi?->id,
                'title' => 'Ganti kartu ATM yang sudah kedaluwarsa',
                'date' => $today->toDateString(),
                'time' => '20:00:00',
                'priority' => 'medium',
                'snoozed_until' => $today->copy()->addDay(),
            ],
            [
                'category_id' => $work?->id,
                'title' => 'Presentasi proyek akhir',
                'date' => $today->copy()->subDays(2)->toDateString(),
                'time' => '11:00:00',
                'priority' => 'high',
                'completed' => true,
            ],
            [
                'category_id' => $health?->id,
                'title' => 'Donor darah',
                'date' => $today->copy()->subDays(7)->toDateString(),
                'priority' => 'medium',
                'completed' => true,
            ],
        ];

        foreach ($data as $item) {
            Reminder::create(array_merge([
                'user_id' => $user->id,
                'description' => '',
                'repeat' => 'none',
                'notify_before_minutes' => null,
                'completed' => false,
                'source' => 'manual',
                'status' => 'pending',
            ], $item));
        }
    }

    private function seedNotes(User $user): void
    {
        $idea = Category::where('user_id', $user->id)->where('name', 'Ide')->first();
        $health = Category::where('user_id', $user->id)->where('name', 'Kesehatan')->first();
        $pribadi = Category::where('user_id', $user->id)->where('name', 'Pribadi')->first();
        $study = Category::where('user_id', $user->id)->where('name', 'Kuliah')->first();

        $data = [
            [
                'category_id' => $idea?->id,
                'title' => 'Ide aplikasi pengingat obat',
                'content' => "Fitur unggulan:\n- Scan resep dokter\n- Integrasi GoFood/ShopeeFood\n- Reminder berdasarkan lokasi apotek terdekat",
                'pinned' => true,
                'color' => 'bg-lavender-100',
            ],
            [
                'category_id' => $health?->id,
                'title' => 'Resep dokter gigi',
                'content' => 'Amoxicillin 500 mg, 3x sehari sesudah makan selama 5 hari. Kontrol kembali dalam 2 minggu.',
                'pinned' => false,
                'color' => 'bg-emerald-100',
            ],
            [
                'category_id' => $pribadi?->id,
                'title' => 'Rencana liburan akhir tahun',
                'content' => "Tujuan: Yogyakarta\nBudget: Rp 3.000.000\nCek: tiket kereta, penginapan dekat Malioboro, itinerary 3 hari 2 malam.",
                'pinned' => false,
                'color' => 'bg-amber-100',
            ],
            [
                'category_id' => $idea?->id,
                'title' => 'Daftar bacaan bulan ini',
                'content' => "1. Atomic Habits - James Clear\n2. Clean Architecture - Robert C. Martin\n3. Designing Data-Intensive Applications",
                'pinned' => false,
                'color' => 'bg-blush-100',
            ],
            [
                'category_id' => $study?->id,
                'title' => 'Ringkasan materi statistika bab 5',
                'content' => 'Uji hipotesis: t-test untuk dua sampel independen dan berpasangan, plus contoh soal latihan di pertemuan terakhir.',
                'pinned' => false,
                'color' => 'bg-lavender-100',
            ],
        ];

        foreach ($data as $item) {
            Note::create(array_merge(['user_id' => $user->id], $item));
        }
    }

    private function seedTasks(User $user): void
    {
        $study = Category::where('user_id', $user->id)->where('name', 'Kuliah')->first();
        $work = Category::where('user_id', $user->id)->where('name', 'Pekerjaan')->first();

        $data = [
            [
                'category_id' => $study?->id,
                'title' => 'Kerjakan latihan statistika bab 5',
                'description' => 'Soal nomor 1-10 dari modul, kumpulkan sebelum hari Jumat.',
                'due_at' => now()->addDays(2),
                'priority' => 'high',
                'completed' => false,
                'position' => 1,
                'progress' => 40,
            ],
            [
                'category_id' => $work?->id,
                'title' => 'Siapkan draft laporan rapat',
                'description' => 'Rangkum poin keputusan dan action item ke template perusahaan.',
                'due_at' => now()->endOfDay(),
                'priority' => 'medium',
                'completed' => false,
                'position' => 2,
                'progress' => 80,
            ],
            [
                'category_id' => $study?->id,
                'title' => 'Beli buku referensi desain sistem',
                'description' => 'Cek ketersediaan di toko buku online atau e-library kampus.',
                'due_at' => null,
                'priority' => 'low',
                'completed' => true,
                'position' => 3,
                'progress' => 100,
            ],
            [
                'category_id' => $study?->id,
                'title' => 'Ikut webinar data science',
                'description' => 'Webinar gratis, catat materi penting untuk tugas akhir.',
                'due_at' => now()->addDays(6),
                'priority' => 'medium',
                'completed' => false,
                'position' => 4,
                'progress' => 0,
            ],
            [
                'category_id' => null,
                'title' => 'Beres-beres workspace',
                'description' => 'Rapikan meja kerja dan arsip dokumen lama.',
                'due_at' => null,
                'priority' => 'low',
                'completed' => false,
                'position' => 5,
                'progress' => 0,
            ],
        ];

        foreach ($data as $item) {
            Task::create(array_merge(['user_id' => $user->id], $item));
        }
    }

    private function seedPeriod(User $user): void
    {
        $today = now();
        $cycles = [
            ['start' => $today->copy()->subDays(84), 'length' => 28],
            ['start' => $today->copy()->subDays(56), 'length' => 28],
            ['start' => $today->copy()->subDays(28), 'length' => 28],
            ['start' => $today->copy()->subDays(0), 'length' => 28],
        ];

        $firstLogs = [];
        foreach ($cycles as $index => $cycle) {
            $start = $cycle['start'];
            $logIndex = $index === count($cycles) - 1 ? 0 : 4;

            $periodCycle = PeriodCycle::create([
                'user_id' => $user->id,
                'start_date' => $start->toDateString(),
                'end_date' => $start->copy()->addDays(5)->toDateString(),
                'cycle_length' => $cycle['length'],
                'period_duration' => 5,
            ]);

            foreach (range($logIndex, $logIndex + 2) as $day) {
                $log = PeriodLog::create([
                    'user_id' => $user->id,
                    'period_cycle_id' => $periodCycle->id,
                    'log_date' => $start->copy()->addDays($day)->toDateString(),
                    'flow_intensity' => ['light', 'medium', 'heavy'][$day % 3],
                    'mood' => ['happy', 'tired', 'calm', 'irritable'][$day % 4],
                    'symptoms' => array_slice(['cramps', 'headache', 'backache', 'bloating', 'tired'], 0, $day % 3),
                    'private_note' => $day === $logIndex ? 'Agak kram di hari pertama.' : null,
                ]);

                if ($day === $logIndex) {
                    $firstLogs[] = $log->id;
                }
            }
        }

        foreach ($firstLogs as $logId) {
            foreach (['cramps', 'fatigue', 'backache'] as $symptom) {
                PeriodSymptomLog::create([
                    'period_log_id' => $logId,
                    'symptom' => $symptom,
                ]);
            }
        }
    }

    private function seedShopping(User $user): void
    {
        $lists = [
            'Belanja Mingguan' => [
                ['name' => 'Beras', 'quantity' => '5 kg', 'checked' => true],
                ['name' => 'Minyak goreng', 'quantity' => '2 L', 'checked' => true],
                ['name' => 'Telur', 'quantity' => '1 kg', 'checked' => true],
                ['name' => 'Gula pasir', 'quantity' => '1 kg', 'checked' => false],
                ['name' => 'Kopi sachet', 'quantity' => '1 renteng', 'checked' => false],
                ['name' => 'Susu UHT', 'quantity' => '1 L', 'checked' => false],
                ['name' => 'Tisu basah', 'quantity' => '1 pcs', 'checked' => false],
                ['name' => 'Sampo', 'quantity' => '250 ml', 'checked' => false],
            ],
            'Kebutuhan Dapur' => [
                ['name' => 'Kecap manis', 'quantity' => '1 botol', 'checked' => false],
                ['name' => 'Garam', 'quantity' => '1 bungkus', 'checked' => false],
                ['name' => 'Mie instan', 'quantity' => '1 dus', 'checked' => true],
                ['name' => 'Detergen', 'quantity' => '800 g', 'checked' => false],
            ],
        ];

        foreach ($lists as $name => $items) {
            $list = ShoppingList::create([
                'user_id' => $user->id,
                'name' => $name,
                'color' => ['#e64b7d', '#10b981'][array_key_first([$name => 0]) === 0 ? 0 : 1],
            ]);

            foreach ($items as $item) {
                ShoppingItem::create(array_merge(['user_id' => $user->id, 'shopping_list_id' => $list->id], $item));
            }
        }
    }

    private function seedBills(User $user): void
    {
        $today = now();
        $data = [
            ['name' => 'Listrik PLN', 'amount' => 356000, 'due_date' => $today->copy()->addDays(3)->toDateString(), 'paid' => false, 'remind_days_before' => 3],
            ['name' => 'Air PDAM', 'amount' => 85000, 'due_date' => $today->copy()->addDays(10)->toDateString(), 'paid' => false, 'remind_days_before' => 3],
            ['name' => 'IndiHome', 'amount' => 350000, 'due_date' => $today->copy()->addDays(1)->toDateString(), 'paid' => false, 'remind_days_before' => 2],
            ['name' => 'BPJS Kesehatan', 'amount' => 66000, 'due_date' => $today->copy()->subDays(2)->toDateString(), 'paid' => true, 'remind_days_before' => 3],
            ['name' => 'Cicilan motor', 'amount' => 780000, 'due_date' => $today->copy()->subDays(5)->toDateString(), 'paid' => false, 'remind_days_before' => 5],
            ['name' => 'Netflix', 'amount' => 49000, 'due_date' => $today->copy()->addDays(20)->toDateString(), 'paid' => true, 'remind_days_before' => 2],
        ];

        foreach ($data as $item) {
            Bill::create(array_merge(['user_id' => $user->id], $item));
        }
    }

    private function seedBirthdays(User $user): void
    {
        $data = [
            ['name' => 'Budi Santoso', 'birth_date' => '1985-03-12', 'notify_before_days' => 3],
            ['name' => 'Siti Rahmawati', 'birth_date' => '1992-11-02', 'notify_before_days' => 5],
            ['name' => 'Andi Wijaya', 'birth_date' => '2000-07-19', 'notify_before_days' => 3],
            ['name' => 'Rina Kartika', 'birth_date' => '1994-01-30', 'notify_before_days' => 7],
        ];

        foreach ($data as $item) {
            Birthday::create(array_merge(['user_id' => $user->id], $item));
        }
    }

    private function seedLocations(User $user): void
    {
        $data = [
            ['name' => 'Rumah', 'address' => 'Jl. Melati No. 10, Jakarta Selatan', 'latitude' => -6.2088, 'longitude' => 106.8456, 'radius' => 150],
            ['name' => 'Kantor', 'address' => 'Gedung Wisma Benhil, Sudirman, Jakarta', 'latitude' => -6.2347, 'longitude' => 106.8284, 'radius' => 300],
            ['name' => 'Gym', 'address' => 'Jl. Kemang Raya No. 25, Jakarta Selatan', 'latitude' => -6.2452, 'longitude' => 106.8167, 'radius' => 200],
            ['name' => 'Klinik Medika', 'address' => 'Jl. Raya Pasar Minggu, Jakarta', 'latitude' => -6.2269, 'longitude' => 106.8294, 'radius' => 250],
        ];

        foreach ($data as $item) {
            Location::create(array_merge(['user_id' => $user->id], $item));
        }
    }

    private function seedNotifications(User $user): void
    {
        $data = [
            [
                'type' => 'system',
                'title' => 'Selamat datang di REMINDLY!',
                'body' => 'Mulai atur pengingat, catatan, dan siklus Anda hari ini.',
                'data' => ['action' => null],
                'read_at' => now()->subDays(5),
            ],
            [
                'type' => 'reminder',
                'title' => 'Rapat mingguan dengan tim',
                'body' => 'Pengingat: rapat dalam 30 menit lagi.',
                'data' => ['reminder_id' => 1],
                'read_at' => null,
            ],
            [
                'type' => 'period',
                'title' => 'Prediksi siklus haid',
                'body' => 'Siklus Anda diperkirakan dimulai dalam 3 hari. Persiapkan diri Anda.',
                'data' => ['predicted_start' => now()->addDays(3)->toDateString()],
                'read_at' => null,
            ],
            [
                'type' => 'bill',
                'title' => 'Tagihan Listrik PLN jatuh tempo',
                'body' => 'Tagihan listrik senilai Rp 356.000 jatuh tempo dalam 3 hari.',
                'data' => ['bill_id' => 1],
                'read_at' => null,
            ],
        ];

        foreach ($data as $item) {
            UserNotification::create(array_merge(['user_id' => $user->id], $item));
        }
    }
}