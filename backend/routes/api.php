<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('products', ProductController::class)
        ->only(['index', 'show'])
        ->missing(fn () => response()->json(['message' => 'Produto não encontrado.'], 404));

    Route::apiResource('sales', SaleController::class)
        ->only(['index', 'store', 'show'])
        ->missing(fn () => response()->json(['message' => 'Venda não encontrada.'], 404));
});
