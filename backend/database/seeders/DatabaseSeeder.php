<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'operador@pdv.com'],
            ['name' => 'Ana Souza', 'password' => 'op123', 'role' => UserRole::Operator],
        );

        User::updateOrCreate(
            ['email' => 'adm@admin.com'],
            ['name' => 'Marcos Lima', 'password' => 'admin123', 'role' => UserRole::Admin],
        );

        $this->call(ProductSeeder::class);
    }
}
