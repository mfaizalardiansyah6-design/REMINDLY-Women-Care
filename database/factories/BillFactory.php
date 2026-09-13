<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bill>
 */
class BillFactory extends Factory
{
    protected $model = Bill::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Listrik', 'Air', 'Internet', 'BPJS', 'Cicilan', 'Telepon']),
            'amount' => fake()->randomFloat(2, 10000, 2000000),
            'due_date' => fake()->dateTimeBetween('-3 days', '+30 days')->format('Y-m-d'),
            'paid' => fake()->boolean(40),
            'remind_days_before' => fake()->numberBetween(1, 7),
        ];
    }
}
