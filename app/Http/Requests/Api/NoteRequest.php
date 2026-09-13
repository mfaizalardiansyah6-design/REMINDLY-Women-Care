<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'pinned' => ['sometimes', 'boolean'],
            'color' => ['nullable', 'string', 'max:32'],
            'category_id' => [
                'nullable', 'integer',
                Rule::exists('categories', 'id')->where('user_id', $this->user()->id),
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('pinned')) {
            $this->merge(['pinned' => $this->boolean('pinned')]);
        }
    }
}
