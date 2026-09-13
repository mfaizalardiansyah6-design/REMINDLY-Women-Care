<?php

namespace Tests\Feature;

use App\Models\Note;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteTaskApiTest extends TestCase
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

    public function test_create_and_list_notes(): void
    {
        $this->acting();
        $this->postJson('/api/v1/notes', ['title' => 'Ide app', 'content' => 'Buat fitur baru'])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Ide app');

        $this->getJson('/api/v1/notes')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_toggle_pin_note_and_update(): void
    {
        $user = $this->acting();
        $note = Note::factory()->create(['user_id' => $user->id, 'pinned' => false]);

        $this->postJson("/api/v1/notes/{$note->id}/pin")
            ->assertOk()->assertJsonPath('data.pinned', true);

        $this->putJson("/api/v1/notes/{$note->id}", ['title' => 'Judul baru', 'content' => 'x'])
            ->assertOk()->assertJsonPath('data.title', 'Judul baru');
    }

    public function test_delete_note(): void
    {
        $user = $this->acting();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $this->deleteJson("/api/v1/notes/{$note->id}")->assertOk();
        $this->assertDatabaseMissing('notes', ['id' => $note->id]);
    }

    public function test_create_and_complete_task(): void
    {
        $this->acting();
        $this->postJson('/api/v1/tasks', ['title' => 'Belajar', 'priority' => 'high'])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Belajar');

        $task = Task::first();
        $this->postJson("/api/v1/tasks/{$task->id}/complete")
            ->assertOk()
            ->assertJsonPath('data.completed', true);

        $this->assertDatabaseHas('user_notifications', ['type' => 'task', 'title' => 'Tugas selesai']);
    }

    public function test_list_tasks_and_reopen(): void
    {
        $user = $this->acting();
        Task::factory()->count(3)->create(['user_id' => $user->id]);

        $this->getJson('/api/v1/tasks')->assertOk()->assertJsonCount(3, 'data');

        $task = Task::factory()->create(['user_id' => $user->id, 'completed' => true]);
        $this->postJson("/api/v1/tasks/{$task->id}/reopen")
            ->assertOk()->assertJsonPath('data.completed', false);
    }

    public function test_notes_and_tasks_scoped_to_user(): void
    {
        $this->acting();
        $other = Note::factory()->create();

        $this->getJson("/api/v1/notes/{$other->id}")->assertForbidden();
        $this->putJson("/api/v1/notes/{$other->id}", ['title' => 'hack'])->assertForbidden();
        $this->deleteJson("/api/v1/notes/{$other->id}")->assertForbidden();

        $otherTask = Task::factory()->create();
        $this->putJson("/api/v1/tasks/{$otherTask->id}", ['title' => 'hack', 'priority' => 'low'])->assertForbidden();
        $this->deleteJson("/api/v1/tasks/{$otherTask->id}")->assertForbidden();
    }
}
