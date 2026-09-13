<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Reminder;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReminderApiTest extends TestCase
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

    public function test_user_can_create_reminder(): void
    {
        $this->acting();

        $this->postJson('/api/v1/reminders', [
            'title' => 'Minum air',
            'date' => now()->addDay()->format('Y-m-d'),
            'time' => '09:00',
            'priority' => 'medium',
            'repeat' => 'none',
        ])->assertCreated()->assertJsonPath('data.title', 'Minum air');

        $this->assertDatabaseHas('reminders', ['title' => 'Minum air']);
    }

    public function test_user_can_list_reminders(): void
    {
        $user = $this->acting();
        Reminder::factory()->count(3)->create(['user_id' => $user->id]);

        $this->getJson('/api/v1/reminders')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_update_reminder(): void
    {
        $user = $this->acting();
        $reminder = Reminder::factory()->create(['user_id' => $user->id]);

        $this->putJson("/api/v1/reminders/{$reminder->id}", [
            'title' => 'Diubah',
            'date' => $reminder->date->format('Y-m-d'),
            'priority' => 'high',
            'repeat' => 'weekly',
        ])->assertOk()->assertJsonPath('data.title', 'Diubah');
    }

    public function test_user_can_delete_reminder(): void
    {
        $user = $this->acting();
        $reminder = Reminder::factory()->create(['user_id' => $user->id]);

        $this->deleteJson("/api/v1/reminders/{$reminder->id}")->assertOk();
        $this->assertDatabaseMissing('reminders', ['id' => $reminder->id]);
    }

    public function test_user_can_complete_and_reopen_reminder(): void
    {
        $user = $this->acting();
        $reminder = Reminder::factory()->create(['user_id' => $user->id]);

        $this->postJson("/api/v1/reminders/{$reminder->id}/complete")
            ->assertOk()->assertJsonPath('data.completed', true);

        $this->postJson("/api/v1/reminders/{$reminder->id}/reopen")
            ->assertOk()->assertJsonPath('data.completed', false);
    }

    public function test_user_can_duplicate_reminder(): void
    {
        $user = $this->acting();
        $reminder = Reminder::factory()->create(['user_id' => $user->id]);

        $this->postJson("/api/v1/reminders/{$reminder->id}/duplicate")
            ->assertCreated()
            ->assertJsonPath('data.title', $reminder->title);

        $this->assertDatabaseCount('reminders', 2);
    }

    public function test_user_cannot_access_others_reminder(): void
    {
        $this->acting();
        $other = Reminder::factory()->create();

        $this->getJson("/api/v1/reminders/{$other->id}")->assertForbidden();
        $this->putJson("/api/v1/reminders/{$other->id}", [
            'title' => 'x', 'date' => today()->format('Y-m-d'), 'priority' => 'low', 'repeat' => 'none',
        ])->assertForbidden();
        $this->deleteJson("/api/v1/reminders/{$other->id}")->assertForbidden();
    }

    public function test_reminder_category_store_and_filter(): void
    {
        $user = $this->acting();
        $cat = Category::factory()->create(['user_id' => $user->id, 'type' => 'reminder']);

        $this->postJson('/api/v1/reminders', [
            'title' => 'Dengan kategori',
            'date' => now()->addDay()->format('Y-m-d'),
            'priority' => 'medium',
            'repeat' => 'none',
            'category_id' => $cat->id,
        ])->assertCreated()->assertJsonPath('data.category.name', $cat->name);

        $this->getJson("/api/v1/reminders?category_id={$cat->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_reminder_category_scope_rejects_other_users_category(): void
    {
        $this->acting();
        $other = Category::factory()->create();

        $this->postJson('/api/v1/reminders', [
            'title' => 'Invalid kategori',
            'date' => now()->addDay()->format('Y-m-d'),
            'priority' => 'medium',
            'repeat' => 'none',
            'category_id' => $other->id,
        ])->assertStatus(422);
    }

    public function test_unread_count_and_reading_notification(): void
    {
        $user = $this->acting();
        UserNotification::factory()->create([
            'user_id' => $user->id,
            'type' => 'reminder',
            'read_at' => null,
        ]);

        $this->getJson('/api/v1/notifications/unread-count')->assertOk()->assertJsonPath('count', 1);

        $notification = UserNotification::first();
        $this->postJson("/api/v1/notifications/{$notification->id}/read")->assertOk();
        $this->assertNotNull($notification->fresh()->read_at);
    }
}
