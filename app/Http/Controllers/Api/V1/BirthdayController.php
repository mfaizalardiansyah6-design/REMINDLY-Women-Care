<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BirthdayRequest;
use App\Http\Resources\BirthdayResource;
use App\Models\Birthday;
use Illuminate\Http\JsonResponse;

class BirthdayController extends Controller
{
    public function index()
    {
        $birthdays = Birthday::where('user_id', auth('web')->id())
            ->orderBy('birth_date')
            ->get();

        return BirthdayResource::collection($birthdays);
    }

    public function store(BirthdayRequest $request): BirthdayResource
    {
        $birthday = Birthday::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return new BirthdayResource($birthday);
    }

    public function show(Birthday $birthday): BirthdayResource
    {
        $this->authorize('view', $birthday);
        return new BirthdayResource($birthday);
    }

    public function update(BirthdayRequest $request, Birthday $birthday): BirthdayResource
    {
        $this->authorize('update', $birthday);
        $birthday->update($request->validated());
        return new BirthdayResource($birthday->fresh());
    }

    public function destroy(Birthday $birthday): JsonResponse
    {
        $this->authorize('delete', $birthday);
        $birthday->delete();
        return response()->json(['message' => 'Ulang tahun dihapus.']);
    }
}
