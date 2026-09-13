<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    public function test_register_and_me(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Dewi',
            'email' => 'dewi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.email', 'dewi@example.com');
        $this->assertDatabaseHas('users', ['email' => 'dewi@example.com']);
        $this->assertNotSame('password123', User::first()->password);
    }

    public function test_authenticated_user_can_access_me(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.id', $user->id);
    }

    public function test_login_logout(): void
    {
        User::factory()->create(['email' => 'login@example.com', 'password' => 'password123']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonPath('data.email', 'login@example.com');

        $this->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.email', 'login@example.com');

        $this->postJson('/api/v1/auth/logout')->assertOk();

        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    public function test_login_with_wrong_password_fails(): void
    {
        User::factory()->create(['email' => 'wrong@example.com', 'password' => 'password123']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'wrong@example.com',
            'password' => 'bad-password',
        ])->assertStatus(422);
    }

    public function test_guest_cannot_access_me(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }
}
