<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => null,
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->sentence(),
            'due_at' => fake()->randomElement([null, now()->addDays(fake()->numberBetween(0, 14))]),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'completed' => fake()->boolean(30),
            'position' => fake()->numberBetween(0, 20),
            'progress' => fake()->numberBetween(0, 100),
        ];
    }
}
