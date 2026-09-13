<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->words(2, true),
            'type' => fake()->randomElement(['reminder', 'note', 'task']),
            'color' => fake()->randomElement(['#e64b7d', '#9273dc', '#f59e0b', '#10b981', '#3b82f6']),
        ];
    }
}
