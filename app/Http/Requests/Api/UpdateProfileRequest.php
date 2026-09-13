<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'gender' => ['sometimes', 'nullable', 'string', 'in:female,male,other'],
            'birthdate' => ['sometimes', 'nullable', 'date', 'before:today'],
            'period_notifications' => ['sometimes', 'boolean'],
        ];
    }
}
