<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Birthday;
use App\Models\PeriodCycle;
use App\Models\Reminder;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class CalendarController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth('web')->user();

        $year = (int) request('year', now()->year);
        $month = (int) request('month', now()->month);

        $start = now()->setDate($year, $month, 1)->startOfDay();
        $end = $start->copy()->endOfMonth();

        $events = collect()
            ->concat($this->reminderEvents($user->id, $start, $end))
            ->concat($this->taskEvents($user->id, $start, $end))
            ->concat($this->birthdayEvents($user->id, $start, $end))
            ->concat($this->billEvents($user->id, $start, $end))
            ->concat($this->periodEvents($user->id, $start, $end))
            ->sortBy('date')
            ->values();

        return response()->json([
            'month' => $month,
            'year' => $year,
            'events' => $events,
        ]);
    }

    protected function reminderEvents(int $userId, $start, $end): \Illuminate\Support\Collection
    {
        return Reminder::where('user_id', $userId)
            ->whereBetween('date', [$start, $end])
            ->get()
            ->map(fn (Reminder $r) => [
                'date' => $r->date->format('Y-m-d'),
                'type' => 'reminder',
                'id' => $r->id,
                'title' => $r->title,
                'time' => $r->time,
            ]);
    }

    protected function taskEvents(int $userId, $start, $end): \Illuminate\Support\Collection
    {
        return Task::where('user_id', $userId)
            ->whereNotNull('due_at')
            ->whereBetween('due_at', [$start, $end])
            ->get()
            ->map(fn (Task $t) => [
                'date' => $t->due_at->format('Y-m-d'),
                'type' => 'task',
                'id' => $t->id,
                'title' => $t->title,
                'time' => null,
                'completed' => (bool) $t->completed,
            ]);
    }

    protected function birthdayEvents(int $userId, $start, $end): \Illuminate\Support\Collection
    {
        return Birthday::where('user_id', $userId)
            ->get()
            ->filter(fn (Birthday $b) => $b->birth_date->month === $start->month)
            ->map(function (Birthday $b) use ($start) {
                $day = min($b->birth_date->day, $start->copy()->endOfMonth()->day);
                $occurrence = $b->birth_date->copy()->setDate($start->year, $start->month, $day);
                return [
                    'date' => $occurrence->format('Y-m-d'),
                    'type' => 'birthday',
                    'id' => $b->id,
                    'title' => $b->name.' (ulang tahun)',
                    'time' => null,
                ];
            });
    }

    protected function billEvents(int $userId, $start, $end): \Illuminate\Support\Collection
    {
        return Bill::where('user_id', $userId)
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [$start, $end])
            ->get()
            ->map(fn (Bill $b) => [
                'date' => $b->due_date->format('Y-m-d'),
                'type' => 'bill',
                'id' => $b->id,
                'title' => 'Tagihan: '.$b->name,
                'time' => null,
                'paid' => (bool) $b->paid,
            ]);
    }

    protected function periodEvents(int $userId, $start, $end): \Illuminate\Support\Collection
    {
        $lastCycle = PeriodCycle::where('user_id', $userId)
            ->latest('start_date')
            ->first();

        if (! $lastCycle) {
            return collect();
        }

        $periodDuration = $lastCycle->period_duration ?: 5;
        $cycleLength = $lastCycle->cycle_length ?: 28;
        $events = collect();

        $cursor = $lastCycle->start_date->copy();
        $iterations = 0;
        while ($cursor->lte($end) && $iterations < 24) {
            if ($cursor->month === $start->month || $cursor->month === $end->month) {
                for ($i = 0; $i < $periodDuration; $i++) {
                    $day = $cursor->copy()->addDays($i);
                    if ($day->between($start, $end)) {
                        $events->push([
                            'date' => $day->format('Y-m-d'),
                            'type' => 'period',
                            'id' => 'period-'.$cursor->format('Ymd'),
                            'title' => 'Menstruasi',
                            'time' => null,
                        ]);
                    }
                }
            }
            $cursor = $cursor->addDays($cycleLength);
            $iterations++;
        }

        return $events->unique('date');
    }
}
