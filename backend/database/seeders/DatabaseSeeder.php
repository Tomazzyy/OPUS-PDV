<?php

namespace Database\Seeders;

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
            ['name' => 'Ana Souza', 'password' => 'op123'],
        );

        $this->call(ProductSeeder::class);
    }
}
