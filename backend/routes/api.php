<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::apiResource('products', ProductController::class)
    ->only(['index', 'show'])
    ->missing(fn () => response()->json(['message' => 'Produto não encontrado.'], 404));
