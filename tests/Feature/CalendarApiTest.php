<?php

namespace Tests\Feature;

use App\Models\Bill;
use App\Models\Birthday;
use App\Models\PeriodCycle;
use App\Models\Reminder;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    public function test_calendar_aggregates_all_event_types(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $today = today();
        $ref = $today->startOfMonth()->addDays(10);

        Reminder::factory()->create(['user_id' => $user->id, 'date' => $ref]);
        Task::factory()->create(['user_id' => $user->id, 'due_at' => $ref->copy()->addDay()]);
        Bill::factory()->create(['user_id' => $user->id, 'due_date' => $ref->copy()->addDays(3)]);
        Birthday::factory()->create([
            'user_id' => $user->id,
            'name' => 'Ayu',
            'birth_date' => $ref->format('Y-m-d'),
        ]);
        PeriodCycle::factory()->create([
            'user_id' => $user->id,
            'start_date' => $ref->copy()->subDays(2),
            'end_date' => $ref,
            'cycle_length' => 28,
            'period_duration' => 5,
        ]);

        $res = $this->getJson('/api/v1/calendar?year='.$ref->year.'&month='.$ref->month)
            ->assertOk()
            ->assertJsonPath('month', (int) $ref->month);

        $types = collect($res->json('events'))->pluck('type')->unique()->values();

        $this->assertContains('reminder', $types);
        $this->assertContains('task', $types);
        $this->assertContains('bill', $types);
        $this->assertContains('birthday', $types);
        $this->assertContains('period', $types);
    }

    public function test_calendar_scoped_to_user(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Reminder::factory()->create(['user_id' => User::factory()->create()->id, 'date' => today()]);

        $events = $this->getJson('/api/v1/calendar')->assertOk()->json('events');
        $this->assertEmpty($events);
    }
}
