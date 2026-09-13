<?php

namespace Database\Factories;

use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShoppingItem>
 */
class ShoppingItemFactory extends Factory
{
    protected $model = ShoppingItem::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'shopping_list_id' => ShoppingList::factory(),
            'name' => fake()->word(),
            'quantity' => fake()->optional()->randomElement(['1 kg', '2 pcs', '1 bungkus', '500 ml']),
            'checked' => fake()->boolean(30),
        ];
    }
}
