<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Reminder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reminder>
 */
class ReminderFactory extends Factory
{
    protected $model = Reminder::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => null,
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->sentence(),
            'date' => fake()->dateTimeBetween('today', '+60 days')->format('Y-m-d'),
            'time' => fake()->randomElement(['06:00:00', '09:00:00', '12:00:00', '18:00:00', '20:00:00']),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'repeat' => fake()->randomElement(['none', 'daily', 'weekly', 'monthly', 'yearly']),
            'notify_before_minutes' => fake()->randomElement([null, 5, 10, 15, 30, 60]),
            'completed' => false,
            'source' => 'manual',
            'status' => 'pending',
        ];
    }

    public function forCategory(?Category $category = null): static
    {
        return $this->state(fn () => [
            'category_id' => $category?->id,
        ]);
    }
}
