<?php

namespace App\Services;

use Carbon\CarbonInterface;

class ReminderParserService
{
    public function parse(string $raw): array
    {
        $text = mb_strtolower(trim($raw));
        $text = str_replace(',', ' ', $text);
        $text = preg_replace('/\s+/', ' ', $text);

        $date = $this->extractDate($text);
        $time = $this->extractTime($text);
        $priority = $this->extractPriority($text);
        $repeat = $this->extractRepeat($text);
        $title = $this->extractTitle($text);

        $notifyBefore = $this->extractNotifyBefore($text);

        return [
            'title' => $title ?: 'Pengingat baru',
            'description' => $raw,
            'date' => $date->format('Y-m-d'),
            'time' => $time?->format('H:i'),
            'priority' => $priority,
            'repeat' => $repeat,
            'notify_before_minutes' => $notifyBefore,
            'source' => 'voice',
            'matched' => $title !== '',
        ];
    }

    protected function daysFromNow(CarbonInterface $base, int $days): CarbonInterface
    {
        return $base->copy()->addDays($days);
    }

    protected function extractDate(string $text): CarbonInterface
    {
        $today = today();

        if (preg_match('/(hari ini|hari ini juga)\b/', $text)) {
            return $today;
        }

        if (preg_match('/\blusa\b/', $text)) {
            return $today->copy()->addDays(2);
        }

        if (preg_match('/\bbesok\b/', $text)) {
            return $today->copy()->addDay();
        }

        // "tanggal 12" / "tanggal 12 agustus" / "tanggal 12/8"
        if (preg_match('#tanggal\s+(\d{1,2})(?:\s*[-/.]\s*(\d{1,2}))?#', $text, $m)) {
            $day = (int) $m[1];
            if (! empty($m[2])) {
                $month = (int) $m[2];
                return $today->copy()->setDate($today->year, $month, $day)
                    ->lt($today) ? $today->copy()->addYear()->setDate($today->year + 1, $month, $day) : $today->copy()->setDate($today->year, $month, $day);
            }
            $candidate = $today->copy()->setDate($today->year, $today->month, $day);
            return $candidate->lt($today) ? $today->copy()->addMonth() : $candidate;
        }

        $weekdays = [
            'minggu' => 0, 'senin' => 1, 'selasa' => 2, 'rabu' => 3,
            'kamis' => 4, 'jumat' => 5, 'sabtu' => 6,
        ];
        foreach ($weekdays as $name => $day) {
            if (preg_match('/\b'.$name.'( depan)?\b/', $text)) {
                $target = $today->copy()->next((int) $day);
                return $target;
            }
        }

        return $today->copy()->addDay(); // default ke besok
    }

    protected function extractTime(string $text): ?CarbonInterface
    {
        // "jam 14:30" / "14:30" / "pukul 09.00"
        if (preg_match('/(?:jam|pukul|pk)\s*(\d{1,2})[:.](\d{2})/', $text, $m)) {
            return today()->setTime((int) $m[1], (int) $m[2]);
        }
        if (preg_match('/\b(\d{1,2}):(\d{2})\b/', $text, $m)) {
            return today()->setTime((int) $m[1], (int) $m[2]);
        }

        $times = [
            'semalaman' => [1, 0],
            'pagi' => [8, 0],
            'subuh' => [5, 0],
            'siang' => [12, 0],
            'sore' => [16, 0],
            'malam' => [20, 0],
            'tengah malam' => [0, 0],
        ];

        foreach ($times as $keyword => [$h, $m]) {
            if (preg_match('/\b'.$keyword.'\b/', $text)) {
                return today()->setTime($h, $m);
            }
        }

        // "jam 8" (jam tanpa menit) -> 08:00
        if (preg_match('/\bjam\s+(\d{1,2})\b/', $text, $m)) {
            $h = (int) $m[1];
            if ($h > 12) {
                return today()->setTime($h, 0);
            }
        }

        return null;
    }

    protected function extractPriority(string $text): string
    {
        if (preg_match('/(sangat penting|urgent|segera|penting)/', $text)) {
            return 'high';
        }
        if (preg_match('/\b(boleh|low|rendah|santai)\b/', $text)) {
            return 'low';
        }
        return 'medium';
    }

    protected function extractRepeat(string $text): string
    {
        if (preg_match('/(setiap|tiap)\s+tahun/', $text)) {
            return 'yearly';
        }
        if (preg_match('/(setiap|tiap)\s+bulan/', $text)) {
            return 'monthly';
        }
        if (preg_match('/(setiap|tiap)\s+hari/', $text)) {
            return 'daily';
        }
        if (preg_match('/(setiap|tiap)\s+minggu/', $text)) {
            return 'weekly';
        }
        return 'none';
    }

    protected function extractNotifyBefore(string $text): ?int
    {
        if (preg_match('/(?:ingatkan|beri tahu|notifikasi)\s+(\d+)\s+menit/', $text, $m)) {
            return (int) $m[1];
        }
        return null;
    }

    protected function extractTitle(string $text): string
    {
        $tokens = explode(' ', $text);
        $commandWords = [
            'ingatkan', 'ingatkan saya', 'saya', 'untuk', 'agar', 'biar', 'tolong', 'pengingat',
            'reminder', 'buat', 'buatkan', 'jadwalkan', 'jadwal', 'harap', 'mohon', 'jangan lupa',
            'catat', 'catatkan',
        ];

        $dateExpr = 'hari ini|hari ini juga|besok|lusa|tanggal|senin|selasa|rabu|kamis|jumat|sabtu|minggu|depan';
        $timeExpr = 'jam|pukul|pk|\d{1,2}[:.]\d{2}|pagi|siang|sore|malam|subuh|tengah malam|semalaman';
        $otherExpr = 'setiap|tiap|hari|minggu|bulan|tahun|urgent|segera|penting|sangat|rendah|low|santai|\d+';
        $strip = '/\b('.$dateExpr.'|'.$timeExpr.'|'.$otherExpr.')\b/';

        $cleaned = preg_replace($strip, ' ', $text);
        $cleaned = preg_replace('/\b('.implode('|', $commandWords).')\b/', ' ', $cleaned);
        $cleaned = preg_replace('/\s+/', ' ', trim($cleaned));

        // buang kata terakhir jika berupa waktu/angkas
        if (preg_match('/\b(menit|notifikasi)\b/', $cleaned)) {
            $cleaned = preg_replace('/\b(in|sebelum|notifikasi|menit)\s*\d*\s*\d*\b|\b\d+\s*menit\b/', ' ', $cleaned);
            $cleaned = preg_replace('/\s+/', ' ', trim($cleaned));
        }

        return trim($cleaned);
    }
}
