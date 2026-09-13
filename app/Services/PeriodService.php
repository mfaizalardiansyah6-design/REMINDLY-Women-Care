<?php

namespace App\Services;

use App\Models\PeriodCycle;
use Carbon\CarbonInterface;

class PeriodService
{
    public const DEFAULT_CYCLE = 28;
    public const DEFAULT_DURATION = 5;

    public function summary(?PeriodCycle $lastCycle): ?array
    {
        if (! $lastCycle) {
            return null;
        }

        $today = today();
        $cycleLength = $lastCycle->cycle_length ?: self::DEFAULT_CYCLE;
        $periodDuration = $lastCycle->period_duration ?: self::DEFAULT_DURATION;

        $nextStart = $lastCycle->nextExpectedStart($cycleLength);
        $daysUntil = $today->diffInDays($nextStart, false);
        $currentCycleDay = $today->diffInDays($lastCycle->start_date, false);
        $isBleeding = $currentCycleDay >= 0 && $currentCycleDay < $periodDuration;

        $ovulationDay = (int) round($cycleLength / 2);
        $ovulationDate = $nextStart->copy()->subDays($cycleLength - $ovulationDay);
        $fertileStart = $ovulationDate->copy()->subDays(5);
        $fertileEnd = $ovulationDate->copy()->addDay();

        return [
            'current_cycle_day' => max(1, (int) $currentCycleDay),
            'next_expected_start' => $nextStart->format('Y-m-d'),
            'days_until' => max(0, (int) $daysUntil),
            'is_bleeding' => $isBleeding,
            'is_fertile' => $today->between($fertileStart, $fertileEnd),
            'ovulation_date' => $ovulationDate->format('Y-m-d'),
            'fertile_start' => $fertileStart->format('Y-m-d'),
            'fertile_end' => $fertileEnd->format('Y-m-d'),
            'cycle_length' => $cycleLength,
            'period_duration' => $periodDuration,
            'last_start' => $lastCycle->start_date->format('Y-m-d'),
            'last_end' => $lastCycle->end_date?->format('Y-m-d'),
        ];
    }

    public function lastCycle(int $userId): ?PeriodCycle
    {
        return PeriodCycle::query()
            ->where('user_id', $userId)
            ->with('logs')
            ->latest('start_date')
            ->first();
    }
}
