<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class BillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'due_date' => ['required', 'date'],
            'paid' => ['sometimes', 'boolean'],
            'remind_days_before' => ['nullable', 'integer', 'min:0', 'max:60'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('paid')) {
            $this->merge(['paid' => $this->boolean('paid')]);
        }
    }
}
