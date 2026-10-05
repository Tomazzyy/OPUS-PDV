<?php

use App\Http\Controllers\Admin;
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

    Route::get('/sales/summary', [SaleController::class, 'summary']);

    Route::apiResource('sales', SaleController::class)
        ->only(['index', 'store', 'show'])
        ->missing(fn () => response()->json(['message' => 'Venda não encontrada.'], 404));

    Route::prefix('admin')->name('admin.')->middleware('can:manage-products')->group(function () {
        Route::apiResource('products', Admin\ProductController::class)
            ->only(['index', 'store', 'update'])
            ->missing(fn () => response()->json(['message' => 'Produto não encontrado.'], 404));

        Route::post('/products/{product}/stock', [Admin\ProductController::class, 'adjustStock'])
            ->name('products.stock')
            ->missing(fn () => response()->json(['message' => 'Produto não encontrado.'], 404));

        Route::post('/products/{product}/image', [Admin\ProductImageController::class, 'update'])
            ->name('products.image.update')
            ->missing(fn () => response()->json(['message' => 'Produto não encontrado.'], 404));

        Route::delete('/products/{product}/image', [Admin\ProductImageController::class, 'destroy'])
            ->name('products.image.destroy')
            ->missing(fn () => response()->json(['message' => 'Produto não encontrado.'], 404));
    });
});
