<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Note>
 */
class NoteFactory extends Factory
{
    protected $model = Note::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => null,
            'title' => fake()->sentence(3),
            'content' => fake()->paragraphs(2, true),
            'pinned' => fake()->boolean(20),
            'color' => fake()->randomElement(['bg-blush-100', 'bg-lavender-100', 'bg-amber-100', 'bg-emerald-100']),
        ];
    }

    public function forCategory(?Category $category = null): static
    {
        return $this->state(fn () => ['category_id' => $category?->id]);
    }
}
