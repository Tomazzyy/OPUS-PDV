<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['payment_method', 'subtotal_cents', 'total_cents', 'amount_received_cents', 'change_cents'])]
class Sale extends Model
{
    protected function casts(): array
    {
        return [
            'payment_method' => PaymentMethod::class,
            'subtotal_cents' => 'integer',
            'total_cents' => 'integer',
            'amount_received_cents' => 'integer',
            'change_cents' => 'integer',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }
}
