<?php

namespace Tests\Feature;

use App\Models\PeriodCycle;
use App\Models\Reminder;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_requires_auth(): void
    {
        $this->getJson('/api/v1/dashboard')->assertStatus(401);
    }

    public function test_dashboard_returns_summary(): void
    {
        $user = User::factory()->create();
        Reminder::factory()->count(3)->create(['user_id' => $user->id, 'date' => today()->format('Y-m-d')]);
        Task::factory()->count(2)->create(['user_id' => $user->id, 'completed' => false]);
        PeriodCycle::factory()->create([
            'user_id' => $user->id,
            'start_date' => now()->subDays(28)->format('Y-m-d'),
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.stats.todays_reminders_count', 3)
            ->assertJsonPath('data.stats.pending_tasks_count', 2)
            ->assertJsonCount(3, 'data.todays_reminders')
            ->assertJsonCount(2, 'data.pending_tasks')
            ->assertJsonStructure(['data' => ['period_countdown' => ['days_until']]]);
    }
}
