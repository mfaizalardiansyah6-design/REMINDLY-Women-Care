<?php

namespace App\Policies;

use App\Models\Birthday;
use App\Models\User;

class BirthdayPolicy
{
    public function view(User $user, Birthday $m): bool { return $user->id === $m->user_id; }
    public function update(User $user, Birthday $m): bool { return $user->id === $m->user_id; }
    public function delete(User $user, Birthday $m): bool { return $user->id === $m->user_id; }
}
