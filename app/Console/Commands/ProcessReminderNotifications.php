<?php

namespace App\Console\Commands;

use App\Models\Reminder;
use App\Models\UserNotification;
use App\Services\ReminderService;
use Illuminate\Console\Command;

class ProcessReminderNotifications extends Command
{
    protected $signature = 'reminders:process';

    protected $description = 'Generate in-app notifications for due reminders.';

    public function handle(ReminderService $service): int
    {
        $processed = 0;

        Reminder::query()
            ->where('completed', false)
            ->get()
            ->each(function (Reminder $reminder) use ($service, &$processed) {
                if ($reminder->snoozed_until && now()->lt($reminder->snoozed_until)) {
                    return;
                }

                $candidate = $reminder->date->copy();
                if ($reminder->time) {
                    [$h, $m] = explode(':', $reminder->time);
                    $candidate->setTime((int) $h, (int) $m);
                }

                $notifyAt = $candidate->subMinutes(max(0, (int) $reminder->notify_before_minutes));
                if (! now()->gte($notifyAt)) {
                    return;
                }

                $already = UserNotification::query()
                    ->where('user_id', $reminder->user_id)
                    ->where('type', 'reminder')
                    ->whereDate('created_at', $notifyAt->toDateString())
                    ->get()
                    ->contains(fn (UserNotification $n) => ($n->data['reminder_id'] ?? null) === $reminder->id);

                if (! $already) {
                    $service->fireNotification($reminder);
                    $processed++;
                }
            });

        $this->info("Processed {$processed} reminder notifications.");

        return self::SUCCESS;
    }
}
