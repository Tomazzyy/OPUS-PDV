<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:30', 'unique:products,code'],
            'price_cents' => ['required', 'integer', 'min:1', 'max:10000000'],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:100000'],
            'active' => ['boolean'],
        ];
    }
}
