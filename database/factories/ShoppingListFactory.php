<?php

namespace Database\Factories;

use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShoppingList>
 */
class ShoppingListFactory extends Factory
{
    protected $model = ShoppingList::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Belanja Bulanan', 'Kebutuhan Dapur', 'Kosmetik', 'Bahan Masakan']),
            'color' => fake()->randomElement(['#e64b7d', '#9273dc', '#10b981', '#f59e0b']),
        ];
    }
}
