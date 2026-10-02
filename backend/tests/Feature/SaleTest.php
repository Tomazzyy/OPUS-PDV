<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use LogicException;
use RuntimeException;
use Tests\TestCase;

class SaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_calcula_subtotais_e_total_de_uma_venda_com_varios_itens(): void
    {
        $coca = Product::factory()->create(['price_cents' => 600]);
        $lanche = Product::factory()->create(['price_cents' => 2390]);

        $response = $this->sell([
            ['product_id' => $coca->id, 'quantity' => 3],
            ['product_id' => $lanche->id, 'quantity' => 1],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.items.0.subtotal_cents', 1800)
            ->assertJsonPath('data.items.1.subtotal_cents', 2390)
            ->assertJsonPath('data.subtotal_cents', 4190)
            ->assertJsonPath('data.total_cents', 4190);

        $this->assertDatabaseCount('sale_items', 2);
    }

    public function test_usa_o_preco_do_banco_e_ignora_valores_enviados_pelo_cliente(): void
    {
        $product = Product::factory()->create(['price_cents' => 1000]);

        $response = $this->postJson('/api/sales', [
            'items' => [['product_id' => $product->id, 'quantity' => 2, 'price_cents' => 1]],
            'payment_method' => 'cash',
            'amount_received_cents' => 5000,
            'subtotal_cents' => 1,
            'total_cents' => 1,
            'change_cents' => 4999,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.items.0.unit_price_cents', 1000)
            ->assertJsonPath('data.total_cents', 2000)
            ->assertJsonPath('data.change_cents', 3000);
    }

    public function test_rejeita_produto_inexistente(): void
    {
        $this->sell([['product_id' => 999, 'quantity' => 1]])
            ->assertUnprocessable()
            ->assertJson(['message' => 'Produto 999 não encontrado.']);

        $this->assertDatabaseCount('sales', 0);
    }

    public function test_rejeita_produto_inativo(): void
    {
        $product = Product::factory()->inactive()->create(['name' => 'Milk-shake']);

        $this->sell([['product_id' => $product->id, 'quantity' => 1]])
            ->assertUnprocessable()
            ->assertJson(['message' => 'O produto Milk-shake não está disponível para venda.']);

        $this->assertDatabaseCount('sales', 0);
    }

    public function test_rejeita_venda_com_estoque_insuficiente_sem_alterar_nada(): void
    {
        $coca = Product::factory()->create(['stock_quantity' => 10]);
        $batata = Product::factory()->create(['name' => 'Batata Frita', 'stock_quantity' => 3]);

        $this->sell([
            ['product_id' => $coca->id, 'quantity' => 2],
            ['product_id' => $batata->id, 'quantity' => 4],
        ])
            ->assertUnprocessable()
            ->assertJson(['message' => 'Estoque insuficiente para Batata Frita. Disponível: 3.']);

        $this->assertDatabaseCount('sales', 0);
        $this->assertSame(10, $coca->fresh()->stock_quantity);
        $this->assertSame(3, $batata->fresh()->stock_quantity);
    }

    public function test_baixa_o_estoque_dos_produtos_vendidos(): void
    {
        $product = Product::factory()->create(['stock_quantity' => 5]);

        $this->sell([['product_id' => $product->id, 'quantity' => 2]])->assertCreated();

        $this->assertSame(3, $product->fresh()->stock_quantity);
    }

    public function test_permite_vender_todo_o_estoque(): void
    {
        $product = Product::factory()->create(['stock_quantity' => 2]);

        $this->sell([['product_id' => $product->id, 'quantity' => 2]])->assertCreated();

        $this->assertSame(0, $product->fresh()->stock_quantity);
    }

    public function test_rejeita_pagamento_em_dinheiro_com_valor_insuficiente(): void
    {
        $product = Product::factory()->create(['price_cents' => 3750]);

        $this->sell([['product_id' => $product->id, 'quantity' => 1]], 'cash', 3749)
            ->assertUnprocessable()
            ->assertJson(['message' => 'Valor recebido insuficiente.']);

        $this->assertDatabaseCount('sales', 0);
    }

    public function test_exige_valor_recebido_no_pagamento_em_dinheiro(): void
    {
        $product = Product::factory()->create();

        $this->sell([['product_id' => $product->id, 'quantity' => 1]], 'cash')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['amount_received_cents' => 'O campo valor recebido é obrigatório.']);
    }

    public function test_calcula_o_troco_no_pagamento_em_dinheiro(): void
    {
        $product = Product::factory()->create(['price_cents' => 3750]);

        $this->sell([['product_id' => $product->id, 'quantity' => 1]], 'cash', 5000)
            ->assertCreated()
            ->assertJsonPath('data.amount_received_cents', 5000)
            ->assertJsonPath('data.change_cents', 1250);
    }

    public function test_pagamento_no_cartao_nao_tem_valor_recebido_nem_troco(): void
    {
        $product = Product::factory()->create();

        $this->sell([['product_id' => $product->id, 'quantity' => 1]], 'credit', 99999)
            ->assertCreated()
            ->assertJsonPath('data.payment_method', 'credit')
            ->assertJsonPath('data.amount_received_cents', null)
            ->assertJsonPath('data.change_cents', null);
    }

    public function test_venda_mantem_os_dados_do_produto_no_momento_da_venda(): void
    {
        $product = Product::factory()->create(['name' => 'Coca-Cola', 'price_cents' => 550]);

        $saleId = $this->sell([['product_id' => $product->id, 'quantity' => 1]])->json('data.id');

        $product->update(['name' => 'Coca-Cola Lata', 'price_cents' => 700]);

        $this->getJson("/api/sales/{$saleId}")
            ->assertOk()
            ->assertJsonPath('data.items.0.product_name', 'Coca-Cola')
            ->assertJsonPath('data.items.0.unit_price_cents', 550)
            ->assertJsonPath('data.total_cents', 550);
    }

    public function test_venda_finalizada_nao_pode_ser_alterada(): void
    {
        $product = Product::factory()->create(['price_cents' => 1000]);
        $saleId = $this->sell([['product_id' => $product->id, 'quantity' => 1]])->json('data.id');

        $this->putJson("/api/sales/{$saleId}", ['total_cents' => 1])->assertMethodNotAllowed();
        $this->patchJson("/api/sales/{$saleId}", ['total_cents' => 1])->assertMethodNotAllowed();
        $this->deleteJson("/api/sales/{$saleId}")->assertMethodNotAllowed();

        $sale = Sale::find($saleId);
        $this->assertThrows(fn () => $sale->update(['total_cents' => 1]), LogicException::class);
        $this->assertThrows(fn () => $sale->delete(), LogicException::class);
        $this->assertThrows(fn () => $sale->items()->first()->update(['quantity' => 99]), LogicException::class);

        $this->assertSame(1000, $sale->fresh()->total_cents);
        $this->assertSame(1, $sale->items()->first()->quantity);
    }

    public function test_desfaz_a_venda_se_ocorrer_erro_no_meio_da_operacao(): void
    {
        $product = Product::factory()->create(['stock_quantity' => 5]);

        // Simula uma falha na última etapa (baixa do estoque), depois de a venda e os itens já terem sido gravados.
        Product::updating(fn () => throw new RuntimeException('Falha simulada.'));

        $this->assertThrows(fn () => app(SaleService::class)->create([
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
            'payment_method' => 'debit',
        ]), RuntimeException::class);

        $this->assertDatabaseCount('sales', 0);
        $this->assertDatabaseCount('sale_items', 0);
        $this->assertSame(5, $product->fresh()->stock_quantity);
    }

    public function test_consulta_uma_venda_finalizada(): void
    {
        $product = Product::factory()->create(['name' => 'X-Bacon', 'code' => '2002', 'price_cents' => 2390]);
        $saleId = $this->sell([['product_id' => $product->id, 'quantity' => 2]], 'cash', 5000)->json('data.id');

        $this->getJson("/api/sales/{$saleId}")
            ->assertOk()
            ->assertJson(['data' => [
                'id' => $saleId,
                'payment_method' => 'cash',
                'subtotal_cents' => 4780,
                'total_cents' => 4780,
                'amount_received_cents' => 5000,
                'change_cents' => 220,
                'items' => [[
                    'product_name' => 'X-Bacon',
                    'product_code' => '2002',
                    'unit_price_cents' => 2390,
                    'quantity' => 2,
                    'subtotal_cents' => 4780,
                ]],
            ]])
            ->assertJsonStructure(['data' => ['created_at']]);

        $this->getJson('/api/sales/999')
            ->assertNotFound()
            ->assertJson(['message' => 'Venda não encontrada.']);
    }

    private function sell(array $items, string $paymentMethod = 'debit', ?int $amountReceived = null): TestResponse
    {
        return $this->postJson('/api/sales', array_filter([
            'items' => $items,
            'payment_method' => $paymentMethod,
            'amount_received_cents' => $amountReceived,
        ], fn ($value) => $value !== null));
    }
}
