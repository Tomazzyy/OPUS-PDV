<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Exceptions\SaleException;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SaleService
{
    public function create(array $data, User $operator): Sale
    {
        return DB::transaction(function () use ($data, $operator) {
            $products = $this->lockProducts($data['items']);
            $items = $this->buildItems($data['items'], $products);
            $total = $items->sum('subtotal_cents');

            $paymentMethod = PaymentMethod::from($data['payment_method']);
            [$amountReceived, $change] = $this->calculatePayment($paymentMethod, $total, $data['amount_received_cents'] ?? null);

            $sale = Sale::create([
                'user_id' => $operator->id,
                'payment_method' => $paymentMethod,
                'subtotal_cents' => $total,
                'total_cents' => $total,
                'amount_received_cents' => $amountReceived,
                'change_cents' => $change,
            ]);

            $sale->items()->createMany($items->all());

            foreach ($items as $item) {
                $products[$item['product_id']]->decrement('stock_quantity', $item['quantity']);
            }

            return $sale->load('items', 'operator');
        });
    }

    /**
     * Bloqueia as linhas dos produtos até o fim da transação, para que duas
     * vendas simultâneas não vendam o mesmo estoque.
     */
    private function lockProducts(array $items): Collection
    {
        return Product::query()
            ->whereIn('id', array_column($items, 'product_id'))
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');
    }

    private function buildItems(array $items, Collection $products): Collection
    {
        return collect($items)->map(function (array $item) use ($products) {
            $product = $products->get($item['product_id']);

            if (! $product) {
                throw new SaleException("Produto {$item['product_id']} não encontrado.");
            }

            if (! $product->active) {
                throw new SaleException("O produto {$product->name} não está disponível para venda.");
            }

            if ($product->stock_quantity < $item['quantity']) {
                throw new SaleException("Estoque insuficiente para {$product->name}. Disponível: {$product->stock_quantity}.");
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

    private function calculatePayment(PaymentMethod $paymentMethod, int $total, ?int $amountReceived): array
    {
        if ($paymentMethod !== PaymentMethod::Cash) {
            return [null, null];
        }

        if ($amountReceived < $total) {
            throw new SaleException('Valor recebido insuficiente.');
        }

        return [$amountReceived, $amountReceived - $total];
    }
}
