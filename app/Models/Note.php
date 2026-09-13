<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'category_id', 'title', 'content', 'pinned', 'color'])]
class Note extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'pinned' => 'boolean',
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

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderByDesc('pinned')->orderByDesc('updated_at');
    }
}
