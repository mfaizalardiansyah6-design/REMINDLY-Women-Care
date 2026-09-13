<?php

namespace Database\Factories;

use App\Models\PeriodCycle;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PeriodCycle>
 */
class PeriodCycleFactory extends Factory
{
    protected $model = PeriodCycle::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-120 days', '-20 days')->format('Y-m-d');
        $duration = fake()->numberBetween(4, 7);

        return [
            'user_id' => User::factory(),
            'start_date' => $start,
            'end_date' => now()->parse($start)->addDays($duration)->format('Y-m-d'),
            'cycle_length' => fake()->numberBetween(26, 32),
            'period_duration' => fake()->numberBetween(4, 7),
        ];
    }
}
