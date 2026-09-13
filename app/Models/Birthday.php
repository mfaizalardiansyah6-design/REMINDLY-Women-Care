<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'name', 'birth_date', 'notify_before_days'])]
class Birthday extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function nextOccurrence(): \Illuminate\Support\Carbon
    {
        $date = $this->birth_date->copy();
        $next = $date->setDate(now()->year, $date->month, $date->day);
        if ($next->isBefore(today())) {
            $next = $next->addYear();
        }
        return $next;
    }
}
