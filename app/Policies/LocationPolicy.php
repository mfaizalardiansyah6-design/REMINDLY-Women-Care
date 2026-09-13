<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;

class LocationPolicy
{
    public function view(User $user, Location $m): bool { return $user->id === $m->user_id; }
    public function update(User $user, Location $m): bool { return $user->id === $m->user_id; }
    public function delete(User $user, Location $m): bool { return $user->id === $m->user_id; }
}
