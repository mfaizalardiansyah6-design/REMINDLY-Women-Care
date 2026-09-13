<?php

namespace App\Policies;

use App\Models\Bill;
use App\Models\User;

class BillPolicy
{
    public function view(User $user, Bill $m): bool { return $user->id === $m->user_id; }
    public function update(User $user, Bill $m): bool { return $user->id === $m->user_id; }
    public function delete(User $user, Bill $m): bool { return $user->id === $m->user_id; }
}
