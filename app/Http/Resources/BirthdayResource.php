<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BirthdayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'next_occurrence' => $this->nextOccurrence()->format('Y-m-d'),
            'notify_before_days' => $this->notify_before_days,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
