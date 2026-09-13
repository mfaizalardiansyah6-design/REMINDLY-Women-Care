<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PeriodCycleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'cycle_length' => $this->cycle_length,
            'period_duration' => $this->period_duration,
            'logs' => PeriodLogResource::collection($this->whenLoaded('logs')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
