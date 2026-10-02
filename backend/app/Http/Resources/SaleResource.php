<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_method' => $this->payment_method,
            'subtotal_cents' => $this->subtotal_cents,
            'total_cents' => $this->total_cents,
            'amount_received_cents' => $this->amount_received_cents,
            'change_cents' => $this->change_cents,
            'operator_name' => $this->whenLoaded('operator', fn () => $this->operator->name),
            'created_at' => $this->created_at,
            'items' => SaleItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
