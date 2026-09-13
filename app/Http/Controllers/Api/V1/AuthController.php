<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ChangePasswordRequest;
use App\Http\Requests\Api\ForgotPasswordRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\ResetPasswordRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function me(): UserResource
    {
        return new UserResource(auth('web')->user());
    }

    public function register(RegisterRequest $request): UserResource
    {
        $user = User::query()->create($request->validated());

        $request->session()->regenerate();
        auth('web')->login($user);

        return new UserResource($user);
    }

    public function login(LoginRequest $request): JsonResponse|UserResource
    {
        $credentials = $request->only('email', 'password');

        if (! auth('web')->attempt($credentials, $request->boolean('remember'))) {
            return response()->json(['message' => 'Email atau kata sandi salah.'], 422);
        }

        $request->session()->regenerate();

        return new UserResource(auth('web')->user());
    }

    public function logout(): JsonResponse
    {
        auth('web')->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Tautan reset telah dikirim ke email Anda.'])
            : response()->json(['message' => __($status)], 422);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Kata sandi berhasil diubah.'])
            : response()->json(['message' => __($status)], 422);
    }

    public function updateProfile(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->update($request->validated());

        return new UserResource($user->fresh());
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Kata sandi saat ini salah.'], 422);
        }

        $user->update(['password' => $request->password]);

        return response()->json(['message' => 'Kata sandi berhasil diubah.']);
    }
}
