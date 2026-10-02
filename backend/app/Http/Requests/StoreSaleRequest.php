<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:9999'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'amount_received_cents' => ['exclude_unless:payment_method,cash', 'required', 'integer', 'min:1', 'max:10000000'],
        ];
    }
}
