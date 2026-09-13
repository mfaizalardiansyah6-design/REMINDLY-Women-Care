<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id', 'category_id', 'title', 'description', 'date', 'time',
    'priority', 'repeat', 'notify_before_minutes', 'completed',
    'completed_at', 'snoozed_until', 'source', 'status',
])]
class Reminder extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'completed' => 'boolean',
            'completed_at' => 'datetime',
            'snoozed_until' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeDueToday(Builder $query): Builder
    {
        return $query->where('date', today())->where('completed', false);
    }

    public function scopeUpcoming(Builder $query, int $limit = 5): Builder
    {
        return $query
            ->where('completed', false)
            ->where(function (Builder $q) {
                $q->where('date', '>', today())
                    ->orWhere(function (Builder $q2) {
                        $q2->where('date', '=', today())
                            ->whereNotNull('time');
                    });
            })
            ->orderBy('date')
            ->orderBy('time')
            ->limit($limit);
    }
}
