<?php

namespace App\Services;

use App\Models\Reminder;
use App\Models\UserNotification;
use Carbon\CarbonInterface;

class ReminderService
{
    /**
     * Compute the next occurrence date for a repeating reminder.
     */
    public function nextOccurrence(Reminder $reminder, ?CarbonInterface $from = null): ?CarbonInterface
    {
        $from ??= now();
        $date = $reminder->date->copy();

        if ($reminder->repeat === 'none') {
            return null;
        }

        if ($reminder->repeat === 'daily') {
            while ($date->lte($from)) {
                $date = $date->addDay();
            }
        } elseif ($reminder->repeat === 'weekly') {
            while ($date->lte($from)) {
                $date = $date->addWeek();
            }
        } elseif ($reminder->repeat === 'monthly') {
            while ($date->lte($from)) {
                $date = $date->addMonth();
            }
        } elseif ($reminder->repeat === 'yearly') {
            while ($date->lte($from)) {
                $date = $date->addYear();
            }
        } elseif ($reminder->repeat === 'custom') {
            while ($date->lte($from)) {
                $date = $date->addWeek();
            }
        }

        return $date;
    }

    public function duplicate(Reminder $reminder, ?CarbonInterface $date = null): Reminder
    {
        $copy = $reminder->replicate();
        $copy->date = $date ?? $reminder->date->copy();
        $copy->completed = false;
        $copy->completed_at = null;
        $copy->snoozed_until = null;
        $copy->status = 'pending';
        $copy->save();

        return $copy;
    }

    /**
     * Compute the datetime at which an in-app notification should fire.
     */
    public function notifyAt(Reminder $reminder): ?CarbonInterface
    {
        if ($reminder->completed) {
            return null;
        }

        $start = $reminder->date->copy();
        if ($reminder->time) {
            [$h, $m] = explode(':', $reminder->time);
            $start->setTime((int) $h, (int) $m);
        } else {
            $start->setTime(9, 0);
        }

        if ($reminder->notify_before_minutes) {
            $start = $start->subMinutes($reminder->notify_before_minutes);
        }

        return $start;
    }

    public function dueForNotification(Reminder $reminder): bool
    {
        $notifyAt = $this->notifyAt($reminder);
        if (! $notifyAt) {
            return false;
        }

        return now()->greaterThanOrEqualTo($notifyAt);
    }

    public function fireNotification(Reminder $reminder): UserNotification
    {
        return UserNotification::query()->create([
            'user_id' => $reminder->user_id,
            'type' => 'reminder',
            'title' => $reminder->title,
            'body' => $reminder->description
                ?: 'Pengingat Anda pada '.$reminder->date->format('d M Y')
                    .($reminder->time ? ' pukul '.$reminder->time : ''),
            'data' => ['reminder_id' => $reminder->id],
        ]);
    }
}
