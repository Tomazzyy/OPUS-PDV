<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create());
    }

    public function test_lista_apenas_produtos_ativos(): void
    {
        Product::factory()->create(['name' => 'Coca-Cola 350ml', 'image_path' => 'images/products/1001.jpg']);
        Product::factory()->inactive()->create(['name' => 'Milk-shake']);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Coca-Cola 350ml')
            ->assertJsonPath('data.0.image_url', asset('images/products/1001.jpg'));
    }

    public function test_busca_produtos_por_nome_ou_codigo(): void
    {
        Product::factory()->create(['name' => 'Coca-Cola 350ml', 'code' => '1001']);
        Product::factory()->create(['name' => 'X-Bacon', 'code' => '2002']);

        $this->getJson('/api/products?search=coca')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', '1001');

        $this->getJson('/api/products?search=2002')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'X-Bacon');
    }

    public function test_retorna_404_para_produto_inexistente(): void
    {
        $this->getJson('/api/products/999')
            ->assertNotFound()
            ->assertJson(['message' => 'Produto não encontrado.']);
    }
}
