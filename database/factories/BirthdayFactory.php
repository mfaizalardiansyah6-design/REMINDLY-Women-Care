<?php

namespace Database\Factories;

use App\Models\Birthday;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Birthday>
 */
class BirthdayFactory extends Factory
{
    protected $model = Birthday::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->name(),
            'birth_date' => fake()->dateTimeBetween('-70 years', '-10 years')->format('Y-m-d'),
            'notify_before_days' => fake()->numberBetween(1, 7),
        ];
    }
}
