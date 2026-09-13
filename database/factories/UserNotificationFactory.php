<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserNotification>
 */
class UserNotificationFactory extends Factory
{
    protected $model = UserNotification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['reminder', 'period', 'task', 'system']),
            'title' => fake()->sentence(3),
            'body' => fake()->sentence(),
            'data' => [],
            'read_at' => null,
            'notify_at' => null,
        ];
    }
}
