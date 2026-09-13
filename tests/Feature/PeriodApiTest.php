<?php

namespace Tests\Feature;

use App\Models\PeriodCycle;
use App\Models\PeriodLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PeriodApiTest extends TestCase
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

    public function test_summary_without_cycle_returns_null(): void
    {
        $this->acting();
        $this->getJson('/api/v1/period/summary')
            ->assertOk()
            ->assertJsonPath('has_cycle', false)
            ->assertJsonPath('summary', null);
    }

    public function test_summary_with_cycle_returns_prediction(): void
    {
        $user = $this->acting();
        PeriodCycle::factory()->create(['user_id' => $user->id]);

        $res = $this->getJson('/api/v1/period/summary')->assertOk();
        $this->assertTrue($res->json('has_cycle'));
        $this->assertNotNull($res->json('summary.next_expected_start'));
        $this->assertArrayHasKey('fertile_start', $res->json('summary'));
    }

    public function test_store_cycle(): void
    {
        $this->acting();
        $this->postJson('/api/v1/period/cycles', [
            'start_date' => today()->format('Y-m-d'),
            'cycle_length' => 28,
            'period_duration' => 5,
        ])->assertCreated()->assertJsonPath('data.start_date', today()->format('Y-m-d'));

        $this->assertDatabaseHas('period_cycles', ['cycle_length' => 28]);
    }

    public function test_log_flow_updates_or_creates_for_same_day(): void
    {
        $user = $this->acting();
        PeriodCycle::factory()->create(['user_id' => $user->id]);

        $this->postJson('/api/v1/period/logs', [
            'log_date' => today()->format('Y-m-d'),
            'flow_intensity' => 'medium',
            'mood' => 'lelah',
            'symptoms' => ['kram', 'sakit_kepala'],
        ])->assertCreated()->assertJsonPath('data.flow_intensity', 'medium');

        $this->assertDatabaseCount('period_logs', 1);

        $this->putJson('/api/v1/period/logs/'.PeriodLog::first()->id, [
            'log_date' => today()->format('Y-m-d'),
            'flow_intensity' => 'heavy',
            'mood' => 'lelah',
            'symptoms' => ['kram'],
        ])->assertOk()->assertJsonPath('data.flow_intensity', 'heavy');
    }

    public function test_cycle_and_log_scoped_to_user(): void
    {
        $this->acting();
        $otherCycle = PeriodCycle::factory()->create();

        $this->deleteJson("/api/v1/period/cycles/{$otherCycle->id}")->assertForbidden();

        $otherLog = PeriodLog::factory()->create();
        $this->putJson("/api/v1/period/logs/{$otherLog->id}", [
            'log_date' => today()->format('Y-m-d'),
        ])->assertForbidden();
    }
}
