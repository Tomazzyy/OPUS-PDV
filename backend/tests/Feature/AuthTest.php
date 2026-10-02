<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_operador_faz_login_e_recebe_um_token(): void
    {
        User::factory()->create(['email' => 'operador@opuspdv.test', 'password' => 'opuspdv123']);

        $token = $this->postJson('/api/login', ['email' => 'operador@opuspdv.test', 'password' => 'opuspdv123'])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'operador@opuspdv.test')
            ->json('data.token');

        $this->withToken($token)->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'operador@opuspdv.test');
    }

    public function test_rejeita_senha_incorreta(): void
    {
        User::factory()->create(['email' => 'operador@opuspdv.test', 'password' => 'opuspdv123']);

        $this->postJson('/api/login', ['email' => 'operador@opuspdv.test', 'password' => 'errada'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'E-mail ou senha inválidos.']);
    }

    public function test_rotas_do_caixa_exigem_login(): void
    {
        $this->getJson('/api/products')
            ->assertUnauthorized()
            ->assertJson(['message' => 'Sessão expirada. Faça login novamente.']);

        $this->getJson('/api/sales/1')->assertUnauthorized();
        $this->postJson('/api/sales', [])->assertUnauthorized();
    }

    public function test_logout_invalida_o_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('pdv')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
