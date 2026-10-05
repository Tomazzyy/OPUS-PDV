<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'not_in:0', 'min:-100000', 'max:100000'],
        ];
    }
}
