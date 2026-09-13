<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'category_id', 'title', 'description', 'due_at', 'priority', 'completed', 'completed_at', 'position', 'progress'])]
class Task extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
            'completed' => 'boolean',
            'completed_at' => 'datetime',
            'progress' => 'integer',
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

    public function scopeIncomplete(Builder $query): Builder
    {
        return $query->where('completed', false)->orderBy('position');
    }
}
