<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'image_url' => $this->image_path ? asset($this->image_path) : null,
            'price_cents' => $this->price_cents,
            'stock_quantity' => $this->stock_quantity,
            'active' => $this->active,
        ];
    }
}
