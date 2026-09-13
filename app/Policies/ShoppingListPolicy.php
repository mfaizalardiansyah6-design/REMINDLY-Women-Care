<?php

namespace App\Policies;

use App\Models\ShoppingList;
use App\Models\User;

class ShoppingListPolicy
{
    public function view(User $user, ShoppingList $m): bool { return $user->id === $m->user_id; }
    public function update(User $user, ShoppingList $m): bool { return $user->id === $m->user_id; }
    public function delete(User $user, ShoppingList $m): bool { return $user->id === $m->user_id; }
}
