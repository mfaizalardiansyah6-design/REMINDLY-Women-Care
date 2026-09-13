<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'name', 'address', 'latitude', 'longitude', 'radius'])]
class Location extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isInRadius(float $lat, float $lng): bool
    {
        $dist = $this->haversine($lat, $lng);
        return $dist <= $this->radius;
    }

    protected function haversine(float $lat, float $lng): float
    {
        $earth = 6371000;
        $dLat = deg2rad($lat - (float) $this->latitude);
        $dLng = deg2rad($lng - (float) $this->longitude);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad((float) $this->latitude)) * cos(deg2rad($lat)) * sin($dLng / 2) ** 2;
        return $earth * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
