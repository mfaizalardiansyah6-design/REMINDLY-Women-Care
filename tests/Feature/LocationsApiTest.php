<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationsApiTest extends TestCase
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

    public function test_location_crud(): void
    {
        $this->acting();

        $this->postJson('/api/v1/locations', [
            'name' => 'Rumah',
            'address' => 'Jl. Merdeka 1',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'radius' => 200,
        ])->assertCreated()->assertJsonPath('data.name', 'Rumah');

        $location = Location::first();
        $this->getJson('/api/v1/locations')->assertOk()->assertJsonCount(1, 'data');
        $this->putJson("/api/v1/locations/{$location->id}", ['name' => 'Kantor', 'latitude' => -6.2, 'longitude' => 106.8])
            ->assertOk()->assertJsonPath('data.name', 'Kantor');
        $this->deleteJson("/api/v1/locations/{$location->id}")->assertOk();
        $this->assertDatabaseMissing('locations', ['id' => $location->id]);
    }

    public function test_location_near_filter_uses_radius(): void
    {
        $user = $this->acting();
        Location::factory()->create(['user_id' => $user->id, 'latitude' => -6.2088, 'longitude' => 106.8456, 'radius' => 100]);

        $this->getJson('/api/v1/locations?latitude=-6.2088&longitude=106.8456')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/locations?latitude=-7.0&longitude=110.0')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_location_scoped_to_user(): void
    {
        $this->acting();
        $other = Location::factory()->create();
        $this->getJson("/api/v1/locations/{$other->id}")->assertForbidden();
        $this->deleteJson("/api/v1/locations/{$other->id}")->assertForbidden();
    }
}
