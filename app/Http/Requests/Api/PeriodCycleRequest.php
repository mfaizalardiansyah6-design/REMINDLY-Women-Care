<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class PeriodCycleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'cycle_length' => ['nullable', 'integer', 'min:15', 'max:60'],
            'period_duration' => ['nullable', 'integer', 'min:1', 'max:15'],
        ];
    }
}
