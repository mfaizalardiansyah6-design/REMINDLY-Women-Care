<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReminderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category), null),
            'title' => $this->title,
            'description' => $this->description,
            'date' => $this->date?->format('Y-m-d'),
            'time' => $this->time,
            'priority' => $this->priority,
            'repeat' => $this->repeat,
            'notify_before_minutes' => $this->notify_before_minutes,
            'completed' => (bool) $this->completed,
            'completed_at' => $this->completed_at?->toISOString(),
            'snoozed_until' => $this->snoozed_until?->toISOString(),
            'source' => $this->source,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
