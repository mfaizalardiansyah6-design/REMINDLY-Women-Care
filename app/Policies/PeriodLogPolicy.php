<?php

namespace App\Policies;

use App\Models\PeriodLog;
use App\Models\User;

class PeriodLogPolicy
{
    public function view(User $user, PeriodLog $log): bool
    {
        return $user->id === $log->user_id;
    }

    public function update(User $user, PeriodLog $log): bool
    {
        return $user->id === $log->user_id;
    }

    public function delete(User $user, PeriodLog $log): bool
    {
        return $user->id === $log->user_id;
    }
}
