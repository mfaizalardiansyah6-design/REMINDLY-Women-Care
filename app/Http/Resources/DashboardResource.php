<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'greeting' => $this['greeting'],
            'todays_reminders' => ReminderResource::collection($this['todays_reminders']),
            'pending_tasks_count' => $this['pending_tasks_count'],
            'pending_tasks' => TaskResource::collection($this['pending_tasks']),
            'upcoming_reminders' => ReminderResource::collection($this['upcoming_reminders']),
            'pinned_notes' => NoteResource::collection($this['pinned_notes']),
            'period_countdown' => $this['period_countdown'],
            'stats' => $this['stats'],
        ];
    }
}
