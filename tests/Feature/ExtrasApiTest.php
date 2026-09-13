<?php

namespace Tests\Feature;

use App\Models\Bill;
use App\Models\Birthday;
use App\Models\Category;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExtrasApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    private function acting(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    public function test_category_crud(): void
    {
        $this->acting();
        $this->postJson('/api/v1/categories', ['name' => 'Pribadi', 'type' => 'reminder'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Pribadi');

        $cat = Category::first();
        $this->getJson('/api/v1/categories')->assertOk()->assertJsonCount(1, 'data');
        $this->putJson("/api/v1/categories/{$cat->id}", ['name' => 'Keluarga', 'type' => 'reminder'])
            ->assertOk()->assertJsonPath('data.name', 'Keluarga');
        $this->deleteJson("/api/v1/categories/{$cat->id}")->assertOk();
        $this->assertDatabaseMissing('categories', ['id' => $cat->id]);
    }

    public function test_shopping_list_with_items(): void
    {
        $user = $this->acting();
        $this->postJson('/api/v1/shopping', ['name' => 'Belanja mingguan'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Belanja mingguan');

        $list = ShoppingList::first();

        $this->postJson("/api/v1/shopping/{$list->id}/items", ['name' => 'Susu', 'quantity' => '2 botol'])
            ->assertOk()
            ->assertJsonPath('data.total_items', 1);

        $item = $list->items()->first();
        $this->postJson("/api/v1/shopping/items/{$item->id}/toggle")
            ->assertOk()
            ->assertJsonPath('data.checked', true);
    }

    public function test_bill_crud_and_toggle_paid(): void
    {
        $user = $this->acting();
        Bill::factory()->create(['user_id' => $user->id, 'paid' => false]);

        $this->getJson('/api/v1/bills')->assertOk()->assertJsonCount(1, 'data');

        $bill = Bill::first();
        $this->postJson("/api/v1/bills/{$bill->id}/toggle-paid")
            ->assertOk()->assertJsonPath('data.paid', true);
    }

    public function test_birthday_crud(): void
    {
        $user = $this->acting();
        $this->postJson('/api/v1/birthdays', [
            'name' => 'Ibu',
            'birth_date' => '1990-05-10',
        ])->assertCreated()->assertJsonPath('data.name', 'Ibu');

        $this->assertDatabaseHas('birthdays', ['name' => 'Ibu']);
    }

    public function test_phase9_scoped_to_user(): void
    {
        $this->acting();
        $other = Category::factory()->create();
        $this->getJson("/api/v1/categories/{$other->id}")->assertForbidden();

        $otherBill = Bill::factory()->create();
        $this->putJson("/api/v1/bills/{$otherBill->id}", [
            'name' => 'hack', 'amount' => 1, 'due_date' => today()->format('Y-m-d'),
        ])->assertForbidden();

        $otherBirthday = Birthday::factory()->create();
        $this->deleteJson("/api/v1/birthdays/{$otherBirthday->id}")->assertForbidden();
    }
}
