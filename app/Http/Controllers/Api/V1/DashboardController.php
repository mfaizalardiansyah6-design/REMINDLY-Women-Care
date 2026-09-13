<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Models\PeriodCycle;
use Carbon\CarbonImmutable;

class DashboardController extends Controller
{
    public function index(): DashboardResource
    {
        $user = auth('web')->user();
        $today = today();

        $greeting = $this->greeting();
        $todaysReminders = $this->todaysReminders($user->id)->get();
        $pendingTasks = $this->pendingTasks($user->id)->get();
        $upcomingReminders = $this->upcomingReminders($user->id)->get();
        $pinnedNotes = $this->pinnedNotes($user->id)->get();
        $periodCountdown = $this->periodCountdown($user->id);

        return new DashboardResource([
            'greeting' => $greeting,
            'todays_reminders' => $todaysReminders,
            'pending_tasks_count' => $pendingTasks->count(),
            'pending_tasks' => $pendingTasks->take(5)->values(),
            'upcoming_reminders' => $upcomingReminders,
            'pinned_notes' => $pinnedNotes,
            'period_countdown' => $periodCountdown,
            'stats' => [
                'todays_reminders_count' => $todaysReminders->count(),
                'pending_tasks_count' => $pendingTasks->count(),
                'upcoming_reminders_count' => $upcomingReminders->count(),
            ],
        ]);
    }

    protected function greeting(): string
    {
        $h = now()->hour;
        if ($h < 11) return 'Selamat pagi';
        if ($h < 15) return 'Selamat siang';
        if ($h < 18) return 'Selamat sore';
        return 'Selamat malam';
    }

    protected function todaysReminders(int $userId): \Illuminate\Database\Eloquent\Builder
    {
        return \App\Models\Reminder::where('user_id', $userId)
            ->where('date', today())
            ->where('completed', false);
    }

    protected function pendingTasks(int $userId): \Illuminate\Database\Eloquent\Builder
    {
        return \App\Models\Task::where('user_id', $userId)->incomplete();
    }

    protected function upcomingReminders(int $userId): \Illuminate\Database\Eloquent\Builder
    {
        return \App\Models\Reminder::where('user_id', $userId)->upcoming(5);
    }

    protected function pinnedNotes(int $userId)
    {
        return \App\Models\Note::where('user_id', $userId)
            ->where('pinned', true)
            ->orderByDesc('updated_at')
            ->take(3);
    }

    protected function periodCountdown(?int $userId): ?array
    {
        if (! $userId) return null;

        $lastCycle = PeriodCycle::where('user_id', $userId)
            ->latest('start_date')
            ->first();

        if (! $lastCycle) return null;

        $nextStart = $lastCycle->nextExpectedStart();
        $today = today();
        $daysUntil = $today->diffInDays($nextStart, false);
        $currentCycleDay = $today->diffInDays($lastCycle->start_date, false);

        return [
            'next_expected_start' => $nextStart->format('Y-m-d'),
            'days_until' => max(0, (int) $daysUntil),
            'current_cycle_day' => max(1, (int) $currentCycleDay),
            'cycle_length' => $lastCycle->cycle_length,
            'is_expected' => $daysUntil >= 0,
        ];
    }
}
