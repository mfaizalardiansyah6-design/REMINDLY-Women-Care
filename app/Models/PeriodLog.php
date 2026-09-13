<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'period_cycle_id', 'log_date', 'flow_intensity', 'mood', 'symptoms', 'private_note'])]
class PeriodLog extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'log_date' => 'date',
            'symptoms' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cycle()
    {
        return $this->belongsTo(PeriodCycle::class, 'period_cycle_id');
    }
}
