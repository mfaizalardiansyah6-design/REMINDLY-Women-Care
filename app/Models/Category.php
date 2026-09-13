<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable(['user_id', 'name', 'type', 'color', 'icon'])]
class Category extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [];
    }

    protected static function booted(): void
    {
        static::saving(fn ($model) => $model->color = $model->color ?: match (Str::lower($model->type)) {
            'reminder' => '#e64b7d',
            'note' => '#9273dc',
            'task' => '#f59e0b',
            default => '#e64b7d',
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
