<?php

namespace Database\Factories;

use App\Models\PeriodCycle;
use App\Models\PeriodLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PeriodLog>
 */
class PeriodLogFactory extends Factory
{
    protected $model = PeriodLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'period_cycle_id' => null,
            'log_date' => fake()->dateTimeBetween('-10 days', 'today')->format('Y-m-d'),
            'flow_intensity' => fake()->randomElement(['light', 'medium', 'heavy']),
            'mood' => fake()->randomElement(['happy', 'sad', 'tired', 'calm', 'irritable']),
            'symptoms' => fake()->randomElements(['cramps', 'headache', 'tired', 'bloating', 'backache'], rand(0, 3)),
            'private_note' => fake()->optional()->sentence(),
        ];
    }

    public function forCycle(?PeriodCycle $cycle = null): static
    {
        return $this->state(fn () => ['period_cycle_id' => $cycle?->id]);
    }
}
