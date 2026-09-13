<?php

namespace App\Policies;

use App\Models\PeriodCycle;
use App\Models\User;

class PeriodCyclePolicy
{
    public function view(User $user, PeriodCycle $cycle): bool
    {
        return $user->id === $cycle->user_id;
    }

    public function update(User $user, PeriodCycle $cycle): bool
    {
        return $user->id === $cycle->user_id;
    }

    public function delete(User $user, PeriodCycle $cycle): bool
    {
        return $user->id === $cycle->user_id;
    }
}
