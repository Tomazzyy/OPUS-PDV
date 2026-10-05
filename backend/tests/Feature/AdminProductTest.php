<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_operador_nao_acessa_a_administracao_de_produtos(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = Product::factory()->create();

        $this->getJson('/api/admin/products')
            ->assertForbidden()
            ->assertJson(['message' => 'Acesso permitido apenas para administradores.']);
        $this->postJson('/api/admin/products', $this->validProduct())->assertForbidden();
        $this->patchJson("/api/admin/products/{$product->id}", ['price_cents' => 1])->assertForbidden();
        $this->postJson("/api/admin/products/{$product->id}/stock", ['quantity' => 10])->assertForbidden();

        $this->assertDatabaseCount('products', 1);
    }

    public function test_admin_lista_todos_os_produtos_inclusive_inativos(): void
    {
        $this->actingAsAdmin();
        Product::factory()->create(['name' => 'Coca-Cola']);
        Product::factory()->inactive()->create(['name' => 'Milk-shake']);

        $this->getJson('/api/admin/products')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.1.name', 'Milk-shake')
            ->assertJsonPath('data.1.active', false);
    }

    public function test_admin_cadastra_produto(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/products', $this->validProduct())
            ->assertCreated()
            ->assertJsonPath('data.name', 'Açaí 500ml')
            ->assertJsonPath('data.price_cents', 1890)
            ->assertJsonPath('data.stock_quantity', 12)
            ->assertJsonPath('data.image_url', null);

        $this->getJson('/api/products?search=açaí')->assertJsonCount(1, 'data');
    }

    public function test_nao_permite_codigo_repetido(): void
    {
        $this->actingAsAdmin();
        Product::factory()->create(['code' => '4001']);

        $this->postJson('/api/admin/products', $this->validProduct())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['code' => 'Já existe um registro com este código.']);
    }

    public function test_admin_edita_produto_sem_alterar_o_estoque(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['price_cents' => 1000, 'stock_quantity' => 7]);

        $this->patchJson("/api/admin/products/{$product->id}", [
            'name' => 'X-Salada Especial',
            'price_cents' => 2190,
            'stock_quantity' => 999,
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'X-Salada Especial')
            ->assertJsonPath('data.price_cents', 2190);

        $this->assertSame(7, $product->fresh()->stock_quantity);
    }

    public function test_produto_desativado_some_do_caixa(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['name' => 'Brownie']);

        $this->patchJson("/api/admin/products/{$product->id}", ['active' => false])
            ->assertOk()
            ->assertJsonPath('data.active', false);

        $this->getJson('/api/products?search=brownie')->assertJsonCount(0, 'data');
    }

    public function test_ajusta_o_estoque_somando_entradas_e_saidas(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['stock_quantity' => 5]);

        $this->postJson("/api/admin/products/{$product->id}/stock", ['quantity' => 10])
            ->assertOk()
            ->assertJsonPath('data.stock_quantity', 15);

        $this->postJson("/api/admin/products/{$product->id}/stock", ['quantity' => -3])
            ->assertJsonPath('data.stock_quantity', 12);
    }

    public function test_ajuste_nao_deixa_o_estoque_negativo(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['stock_quantity' => 2]);

        $this->postJson("/api/admin/products/{$product->id}/stock", ['quantity' => -3])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['quantity' => 'O estoque não pode ficar negativo. Disponível: 2.']);

        $this->assertSame(2, $product->fresh()->stock_quantity);
    }

    public function test_admin_envia_foto_do_produto(): void
    {
        $this->actingAsAdmin();
        Storage::fake('product_images');
        $product = Product::factory()->create();

        $path = $this->post("/api/admin/products/{$product->id}/image", [
            'image' => $this->photo(),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->json('data.image_url');

        $fileName = basename($path);
        Storage::disk('product_images')->assertExists($fileName);
        $this->assertSame("images/products/uploads/{$fileName}", $product->fresh()->image_path);
    }

    public function test_admin_usa_foto_por_link_e_a_foto_enviada_antes_e_apagada(): void
    {
        $this->actingAsAdmin();
        Storage::fake('product_images');
        $product = Product::factory()->create();

        $this->post("/api/admin/products/{$product->id}/image", [
            'image' => $this->photo(),
        ], ['Accept' => 'application/json']);
        $oldFile = basename($product->fresh()->image_path);

        $this->postJson("/api/admin/products/{$product->id}/image", ['image_url' => 'https://exemplo.com/acai.jpg'])
            ->assertOk()
            ->assertJsonPath('data.image_url', 'https://exemplo.com/acai.jpg');

        Storage::disk('product_images')->assertMissing($oldFile);
    }

    public function test_recusa_arquivo_que_nao_e_imagem_e_link_invalido(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create();

        $this->post("/api/admin/products/{$product->id}/image", [
            'image' => UploadedFile::fake()->create('virus.php', 10, 'application/x-php'),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('image');

        $this->postJson("/api/admin/products/{$product->id}/image", ['image_url' => 'javascript:alert(1)'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['image_url' => 'Informe um link válido, começando com http:// ou https://.']);
    }

    public function test_admin_remove_a_foto(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['image_path' => 'images/products/1001.jpg']);

        $this->deleteJson("/api/admin/products/{$product->id}/image")
            ->assertOk()
            ->assertJsonPath('data.image_url', null);

        $this->assertFileExists(public_path('images/products/1001.jpg'));
    }

    private function photo(): UploadedFile
    {
        return new UploadedFile(public_path('images/products/1001.jpg'), 'foto.jpg', 'image/jpeg', null, true);
    }

    private function actingAsAdmin(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
    }

    private function validProduct(): array
    {
        return [
            'name' => 'Açaí 500ml',
            'code' => '4001',
            'price_cents' => 1890,
            'stock_quantity' => 12,
            'active' => true,
        ];
    }
}
