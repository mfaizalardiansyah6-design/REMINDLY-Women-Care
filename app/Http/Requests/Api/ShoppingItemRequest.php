<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShoppingItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'quantity' => ['nullable', 'string', 'max:50'],
            'checked' => ['sometimes', 'boolean'],
            'shopping_list_id' => [
                'nullable', 'integer',
                Rule::exists('shopping_lists', 'id')->where('user_id', $this->user()->id),
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('checked')) {
            $this->merge(['checked' => $this->boolean('checked')]);
        }
    }
}
