<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'product_code' => $this->product_code,
            'unit_price_cents' => $this->unit_price_cents,
            'quantity' => $this->quantity,
            'subtotal_cents' => $this->subtotal_cents,
        ];
    }
}
