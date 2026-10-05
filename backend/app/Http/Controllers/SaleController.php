<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $sales = Sale::with('operator')
            ->whereDate('created_at', $this->requestedDate($request))
            ->latest('id')
            ->get();

        return SaleResource::collection($sales);
    }

    public function summary(Request $request)
    {
        $date = $this->requestedDate($request);

        $totals = Sale::query()
            ->whereDate('created_at', $date)
            ->selectRaw('payment_method, COUNT(*) as sales_count, SUM(total_cents) as total_cents')
            ->groupBy('payment_method')
            ->get()
            ->keyBy(fn (Sale $row) => $row->payment_method->value);

        $paymentMethods = collect(PaymentMethod::cases())->mapWithKeys(fn (PaymentMethod $method) => [
            $method->value => [
                'sales_count' => (int) ($totals[$method->value]->sales_count ?? 0),
                'total_cents' => (int) ($totals[$method->value]->total_cents ?? 0),
            ],
        ]);

        return response()->json([
            'data' => [
                'date' => $date,
                'sales_count' => $paymentMethods->sum('sales_count'),
                'total_cents' => $paymentMethods->sum('total_cents'),
                'payment_methods' => $paymentMethods,
            ],
        ]);
    }

    public function store(StoreSaleRequest $request, SaleService $saleService)
    {
        $sale = $saleService->create($request->validated(), $request->user());

        return new SaleResource($sale);
    }

    public function show(Sale $sale)
    {
        return new SaleResource($sale->load('items', 'operator'));
    }

    private function requestedDate(Request $request): string
    {
        $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        return $request->query('date', today()->toDateString());
    }
}
