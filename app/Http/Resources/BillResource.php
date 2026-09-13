<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'amount' => $this->amount,
            'due_date' => $this->due_date?->format('Y-m-d'),
            'paid' => (bool) $this->paid,
            'remind_days_before' => $this->remind_days_before,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
