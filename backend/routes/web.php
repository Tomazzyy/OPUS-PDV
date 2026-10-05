<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['app' => 'OpusPDV API', 'status' => 'ok']));
