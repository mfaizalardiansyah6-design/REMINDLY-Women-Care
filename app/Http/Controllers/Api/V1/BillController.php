<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BillRequest;
use App\Http\Resources\BillResource;
use App\Models\Bill;
use Illuminate\Http\JsonResponse;

class BillController extends Controller
{
    public function index()
    {
        $query = Bill::where('user_id', auth('web')->id());

        $status = request('status');
        if ($status === 'paid') {
            $query->where('paid', true);
        } elseif ($status === 'unpaid') {
            $query->where('paid', false);
        }

        if (request('overdue') === '1' || request('overdue') === 'true') {
            $query->where('paid', false)->where('due_date', '<', today());
        }

        $sort = request('sort', 'due_date');
        if ($sort === 'amount') {
            $query->orderByDesc('amount');
        } else {
            $query->orderBy('due_date');
        }

        $bills = $query->get();

        return BillResource::collection($bills);
    }

    public function store(BillRequest $request): BillResource
    {
        $bill = Bill::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return new BillResource($bill);
    }

    public function show(Bill $bill): BillResource
    {
        $this->authorize('view', $bill);
        return new BillResource($bill);
    }

    public function update(BillRequest $request, Bill $bill): BillResource
    {
        $this->authorize('update', $bill);
        $bill->update($request->validated());
        return new BillResource($bill->fresh());
    }

    public function destroy(Bill $bill): JsonResponse
    {
        $this->authorize('delete', $bill);
        $bill->delete();
        return response()->json(['message' => 'Tagihan dihapus.']);
    }

    public function togglePaid(Bill $bill): BillResource
    {
        $this->authorize('update', $bill);
        $bill->update(['paid' => ! $bill->paid]);
        return new BillResource($bill->fresh());
    }
}
