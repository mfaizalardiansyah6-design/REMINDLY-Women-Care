<?php

namespace App\Policies;

use App\Models\ShoppingItem;
use App\Models\User;

class ShoppingItemPolicy
{
    public function view(User $user, ShoppingItem $m): bool { return $user->id === $m->user_id; }
    public function update(User $user, ShoppingItem $m): bool { return $user->id === $m->user_id; }
    public function delete(User $user, ShoppingItem $m): bool { return $user->id === $m->user_id; }
}
