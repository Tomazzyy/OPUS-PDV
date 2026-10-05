<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'code' => ['sometimes', 'required', 'string', 'max:30', Rule::unique('products', 'code')->ignore($this->route('product'))],
            'price_cents' => ['sometimes', 'required', 'integer', 'min:1', 'max:10000000'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
