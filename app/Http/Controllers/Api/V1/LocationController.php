<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function index()
    {
        $query = Location::where('user_id', auth('web')->id());

        $lat = request('latitude');
        $lng = request('longitude');
        if ($lat !== null && $lng !== null) {
            $locations = $query->get()->filter(fn (Location $location) => $location->isInRadius((float) $lat, (float) $lng));
            return LocationResource::collection($locations->values());
        }

        $locations = $query->orderBy('name')->get();

        return LocationResource::collection($locations);
    }

    public function store(LocationRequest $request): LocationResource
    {
        $location = Location::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return new LocationResource($location);
    }

    public function show(Location $location): LocationResource
    {
        $this->authorize('view', $location);
        return new LocationResource($location);
    }

    public function update(LocationRequest $request, Location $location): LocationResource
    {
        $this->authorize('update', $location);
        $location->update($request->validated());
        return new LocationResource($location->fresh());
    }

    public function destroy(Location $location): JsonResponse
    {
        $this->authorize('delete', $location);
        $location->delete();
        return response()->json(['message' => 'Lokasi dihapus.']);
    }
}
