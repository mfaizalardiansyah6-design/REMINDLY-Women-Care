<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => [
                'nullable', 'integer',
                Rule::exists('categories', 'id')->where('user_id', $this->user()->id),
            ],
            'date' => ['required', 'date'],
            'time' => ['nullable', 'date_format:H:i'],
            'priority' => ['required', 'in:low,medium,high'],
            'repeat' => ['required', 'in:none,daily,weekly,monthly,yearly,custom'],
            'notify_before_minutes' => ['nullable', 'integer', 'min:0', 'max:10080'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('time') && $this->filled('time')) {
            $this->merge(['time' => $this->input('time')]);
        }
    }
}
