<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function view(User $user, Category $m): bool { return $user->id === $m->user_id; }
    public function update(User $user, Category $m): bool { return $user->id === $m->user_id; }
    public function delete(User $user, Category $m): bool { return $user->id === $m->user_id; }
}
