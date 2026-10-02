<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Services\SaleService;

class SaleController extends Controller
{
    public function store(StoreSaleRequest $request, SaleService $saleService)
    {
        $sale = $saleService->create($request->validated());

        return new SaleResource($sale);
    }

    public function show(Sale $sale)
    {
        return new SaleResource($sale->load('items'));
    }
}
