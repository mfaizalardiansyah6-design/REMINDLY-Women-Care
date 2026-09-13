<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class PeriodLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'log_date' => ['required', 'date'],
            'flow_intensity' => ['nullable', 'in:light,medium,heavy'],
            'mood' => ['nullable', 'string', 'max:100'],
            'symptoms' => ['nullable', 'array'],
            'symptoms.*' => ['string', 'max:60'],
            'private_note' => ['nullable', 'string', 'max:1000'],
            'period_cycle_id' => ['nullable', 'integer', 'exists:period_cycles,id'],
        ];
    }
}
