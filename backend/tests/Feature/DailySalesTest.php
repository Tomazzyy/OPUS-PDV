<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DailySalesTest extends TestCase
{
    use RefreshDatabase;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create(['name' => 'Ana Souza']));
        $this->product = Product::factory()->create(['price_cents' => 1000, 'stock_quantity' => 100]);
    }

    public function test_lista_apenas_as_vendas_do_dia_mais_recentes_primeiro(): void
    {
        $this->travelTo('2026-10-01 15:00:00');
        $yesterday = $this->sell(1);

        $this->travelTo('2026-10-02 09:00:00');
        $first = $this->sell(1);
        $second = $this->sell(2);

        $this->getJson('/api/sales')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $second)
            ->assertJsonPath('data.1.id', $first)
            ->assertJsonPath('data.0.operator_name', 'Ana Souza')
            ->assertJsonMissingPath('data.0.items');

        $this->getJson('/api/sales?date=2026-10-01')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $yesterday);
    }

    public function test_venda_no_fim_da_noite_conta_no_dia_local(): void
    {
        $this->travelTo(Carbon::parse('2026-10-03 02:30:00', 'UTC'));
        $saleId = $this->sell(1);

        $this->getJson('/api/sales?date=2026-10-02')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $saleId);
    }

    public function test_resume_as_vendas_do_dia_por_forma_de_pagamento(): void
    {
        $this->travelTo('2026-10-01 15:00:00');
        $this->sell(5, 'cash', 5000);

        $this->travelTo('2026-10-02 10:00:00');
        $this->sell(1, 'cash', 2000);
        $this->sell(2, 'cash', 2000);
        $this->sell(3, 'credit');

        $this->getJson('/api/sales/summary')
            ->assertOk()
            ->assertExactJson(['data' => [
                'date' => '2026-10-02',
                'sales_count' => 3,
                'total_cents' => 6000,
                'payment_methods' => [
                    'cash' => ['sales_count' => 2, 'total_cents' => 3000],
                    'credit' => ['sales_count' => 1, 'total_cents' => 3000],
                    'debit' => ['sales_count' => 0, 'total_cents' => 0],
                ],
            ]]);
    }

    public function test_rejeita_data_em_formato_invalido(): void
    {
        $this->getJson('/api/sales?date=02/10/2026')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['date' => 'O campo data deve estar no formato Y-m-d.']);
    }

    private function sell(int $quantity, string $paymentMethod = 'debit', ?int $amountReceived = null): int
    {
        return $this->postJson('/api/sales', array_filter([
            'items' => [['product_id' => $this->product->id, 'quantity' => $quantity]],
            'payment_method' => $paymentMethod,
            'amount_received_cents' => $amountReceived,
        ]))->assertCreated()->json('data.id');
    }
}
