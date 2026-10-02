<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['code' => '1001', 'name' => 'Coca-Cola 350ml', 'price_cents' => 600, 'stock_quantity' => 50],
            ['code' => '1002', 'name' => 'Coca-Cola 2L', 'price_cents' => 1200, 'stock_quantity' => 20],
            ['code' => '1003', 'name' => 'Refrigerante Guaraná 350ml', 'price_cents' => 550, 'stock_quantity' => 40],
            ['code' => '1004', 'name' => 'Água Mineral 500ml', 'price_cents' => 350, 'stock_quantity' => 60],
            ['code' => '1005', 'name' => 'Água com Gás 500ml', 'price_cents' => 400, 'stock_quantity' => 30],
            ['code' => '1006', 'name' => 'Suco de Laranja 300ml', 'price_cents' => 800, 'stock_quantity' => 25],
            ['code' => '2001', 'name' => 'X-Salada', 'price_cents' => 1990, 'stock_quantity' => 30],
            ['code' => '2002', 'name' => 'X-Bacon', 'price_cents' => 2390, 'stock_quantity' => 30],
            ['code' => '2003', 'name' => 'X-Tudo', 'price_cents' => 2890, 'stock_quantity' => 20],
            ['code' => '2004', 'name' => 'Misto Quente', 'price_cents' => 1200, 'stock_quantity' => 25],
            ['code' => '2005', 'name' => 'Batata Frita Média', 'price_cents' => 1490, 'stock_quantity' => 40],
            ['code' => '2006', 'name' => 'Batata Frita Grande', 'price_cents' => 1890, 'stock_quantity' => 3],
            ['code' => '3001', 'name' => 'Pão de Queijo', 'price_cents' => 450, 'stock_quantity' => 50],
            ['code' => '3002', 'name' => 'Coxinha', 'price_cents' => 750, 'stock_quantity' => 35],
            ['code' => '3003', 'name' => 'Brownie', 'price_cents' => 900, 'stock_quantity' => 15],
            ['code' => '3004', 'name' => 'Sorvete de Casquinha', 'price_cents' => 500, 'stock_quantity' => 0],
            ['code' => '3005', 'name' => 'Milk-shake 400ml', 'price_cents' => 1600, 'stock_quantity' => 10, 'active' => false],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['code' => $product['code']], $product);
        }
    }
}
