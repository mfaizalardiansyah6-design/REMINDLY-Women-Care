<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PeriodLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'period_cycle_id' => $this->period_cycle_id,
            'log_date' => $this->log_date?->format('Y-m-d'),
            'flow_intensity' => $this->flow_intensity,
            'mood' => $this->mood,
            'symptoms' => $this->symptoms ?? [],
            'private_note' => $this->private_note,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
