<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $search = trim((string) $request->query('search'));

        $products = Product::query()
            ->where('active', true)
            ->when($search !== '', fn ($query) => $query->search($search))
            ->orderBy('name')
            ->get();

        return ProductResource::collection($products);
    }

    public function show(Product $product)
    {
        return new ProductResource($product);
    }
}
