<?php

namespace App\Services;

use App\Exceptions\SaleException;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SaleService
{
    public function create(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $items = $this->buildItems($data['items']);
            $subtotal = $items->sum('subtotal_cents');

            $sale = Sale::create([
                'payment_method' => $data['payment_method'],
                'subtotal_cents' => $subtotal,
                'total_cents' => $subtotal,
            ]);

            $sale->items()->createMany($items->all());

            return $sale->load('items');
        });
    }

    private function buildItems(array $items): Collection
    {
        $products = Product::query()
            ->whereIn('id', array_column($items, 'product_id'))
            ->get()
            ->keyBy('id');

        return collect($items)->map(function (array $item) use ($products) {
            $product = $products->get($item['product_id']);

            if (! $product) {
                throw new SaleException("Produto {$item['product_id']} não encontrado.");
            }

            if (! $product->active) {
                throw new SaleException("O produto {$product->name} não está disponível para venda.");
            }

            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_code' => $product->code,
                'unit_price_cents' => $product->price_cents,
                'quantity' => $item['quantity'],
                'subtotal_cents' => $product->price_cents * $item['quantity'],
            ];
        });
    }
}
