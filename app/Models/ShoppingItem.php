<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'shopping_list_id', 'name', 'quantity', 'checked'])]
class ShoppingItem extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'checked' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function list()
    {
        return $this->belongsTo(ShoppingList::class, 'shopping_list_id');
    }
}
