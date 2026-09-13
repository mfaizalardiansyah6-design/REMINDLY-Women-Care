<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'start_date', 'end_date', 'cycle_length', 'period_duration'])]
class PeriodCycle extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'cycle_length' => 'integer',
            'period_duration' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function logs()
    {
        return $this->hasMany(PeriodLog::class);
    }

    public function nextExpectedStart(?int $cycleLength = null): \Illuminate\Support\Carbon
    {
        $len = $cycleLength ?? $this->cycle_length;
        return $this->start_date->copy()->addDays($len);
    }
}
