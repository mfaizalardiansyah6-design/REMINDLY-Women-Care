<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'avatar', 'gender', 'birthdate', 'period_notifications'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birthdate' => 'date',
            'period_notifications' => 'boolean',
        ];
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
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

    public function periodCycles()
    {
        return $this->hasMany(PeriodCycle::class);
    }

    public function periodLogs()
    {
        return $this->hasMany(PeriodLog::class);
    }

    public function notificationMarks()
    {
        return $this->hasMany(UserNotification::class);
    }

    public function shoppingLists()
    {
        return $this->hasMany(ShoppingList::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function birthdays()
    {
        return $this->hasMany(Birthday::class);
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }
}
