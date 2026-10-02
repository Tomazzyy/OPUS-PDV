<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

#[Fillable(['product_id', 'product_name', 'product_code', 'unit_price_cents', 'quantity', 'subtotal_cents'])]
class SaleItem extends Model
{
    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Item de venda finalizada não pode ser alterado.'));
        static::deleting(fn () => throw new LogicException('Item de venda finalizada não pode ser excluído.'));
    }

    protected function casts(): array
    {
        return [
            'unit_price_cents' => 'integer',
            'quantity' => 'integer',
            'subtotal_cents' => 'integer',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
