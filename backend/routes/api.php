<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::apiResource('products', ProductController::class)
    ->only(['index', 'show'])
    ->missing(fn () => response()->json(['message' => 'Produto não encontrado.'], 404));

Route::apiResource('sales', SaleController::class)
    ->only(['store', 'show'])
    ->missing(fn () => response()->json(['message' => 'Venda não encontrada.'], 404));
