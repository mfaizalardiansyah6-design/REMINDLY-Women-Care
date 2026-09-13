<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
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
            'due_at' => $this->due_at?->toISOString(),
            'priority' => $this->priority,
            'completed' => (bool) $this->completed,
            'completed_at' => $this->completed_at?->toISOString(),
            'position' => $this->position,
            'progress' => $this->progress,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
