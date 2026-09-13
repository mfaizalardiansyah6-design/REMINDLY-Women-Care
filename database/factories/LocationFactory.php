<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Location>
 */
class LocationFactory extends Factory
{
    protected $model = Location::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Rumah', 'Kantor', 'Gym', 'Klinik', 'Sekolah']),
            'address' => fake()->address(),
            'latitude' => fake()->latitude(-8, -6),
            'longitude' => fake()->longitude(106, 108),
            'radius' => fake()->numberBetween(50, 500),
        ];
    }
}
