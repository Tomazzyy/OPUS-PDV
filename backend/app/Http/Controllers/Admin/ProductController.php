<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdjustStockRequest;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $search = trim((string) $request->query('search'));

        $products = Product::query()
            ->when($search !== '', fn ($query) => $query->search($search))
            ->orderBy('name')
            ->get();

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        return new ProductResource(Product::create($request->validated()));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return new ProductResource($product);
    }

    /**
     * Ajusta o estoque somando a quantidade informada (positiva para entrada,
     * negativa para saída) em vez de sobrescrever o valor, para não apagar
     * baixas feitas por vendas enquanto o formulário estava aberto.
     */
    public function adjustStock(AdjustStockRequest $request, Product $product)
    {
        $quantity = $request->validated('quantity');

        $product = DB::transaction(function () use ($product, $quantity) {
            $product = Product::lockForUpdate()->findOrFail($product->id);

            if ($product->stock_quantity + $quantity < 0) {
                throw ValidationException::withMessages([
                    'quantity' => "O estoque não pode ficar negativo. Disponível: {$product->stock_quantity}.",
                ]);
            }

            $product->increment('stock_quantity', $quantity);

            return $product;
        });

        return new ProductResource($product);
    }
}
