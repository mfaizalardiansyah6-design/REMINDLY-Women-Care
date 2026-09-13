<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
        $this->actingAs(User::factory()->create());
    }

    public function test_parse_voice_text(): void
    {
        $this->postJson('/api/v1/ai/parse', ['text' => 'ingatkan saya minum obat besok jam 8 pagi'])
            ->assertOk()
            ->assertJsonStructure(['parsed' => ['title', 'date', 'time', 'priority', 'repeat']])
            ->assertJsonPath('parsed.time', '08:00')
            ->assertJsonPath('parsed.repeat', 'none');
    }

    public function test_parse_high_priority_and_monthly(): void
    {
        $this->postJson('/api/v1/ai/parse', ['text' => 'penting bayar tagihan setiap bulan'])
            ->assertOk()
            ->assertJsonPath('parsed.priority', 'high')
            ->assertJsonPath('parsed.repeat', 'monthly');
    }

    public function test_create_from_voice(): void
    {
        $this->postJson('/api/v1/ai/create-from-voice', ['text' => 'ingatkan saya rapat besok siang'])
            ->assertCreated()
            ->assertJsonPath('data.source', 'voice');

        $this->assertDatabaseHas('reminders', ['source' => 'voice', 'title' => 'rapat']);
    }

    public function test_assistant_responds_to_greeting(): void
    {
        $this->postJson('/api/v1/assistant', ['message' => 'hai'])
            ->assertOk()
            ->assertJsonPath('reply', fn ($r) => str_contains($r, 'Halo'));
    }
}
