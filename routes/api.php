<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AiController;
use App\Http\Controllers\Api\V1\BillController;
use App\Http\Controllers\Api\V1\BirthdayController;
use App\Http\Controllers\Api\V1\CalendarController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\NoteController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PeriodTrackerController;
use App\Http\Controllers\Api\V1\ReminderController;
use App\Http\Controllers\Api\V1\ShoppingListController;
use App\Http\Controllers\Api\V1\TaskController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('web')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);

        Route::middleware('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::put('/profile', [AuthController::class, 'updateProfile']);
            Route::put('/password', [AuthController::class, 'changePassword']);
        });
    });

    Route::middleware('auth')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/calendar', [CalendarController::class, 'index']);

        Route::apiResource('/reminders', ReminderController::class);
        Route::post('/reminders/{reminder}/complete', [ReminderController::class, 'complete']);
        Route::post('/reminders/{reminder}/reopen', [ReminderController::class, 'reopen']);
        Route::post('/reminders/{reminder}/snooze', [ReminderController::class, 'snooze']);
        Route::post('/reminders/{reminder}/duplicate', [ReminderController::class, 'duplicate']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

        Route::apiResource('/notes', NoteController::class);
        Route::post('/notes/{note}/pin', [NoteController::class, 'togglePin']);

        Route::apiResource('/tasks', TaskController::class);
        Route::post('/tasks/{task}/complete', [TaskController::class, 'complete']);
        Route::post('/tasks/{task}/reopen', [TaskController::class, 'reopen']);

        Route::get('/period/summary', [PeriodTrackerController::class, 'summary']);
        Route::get('/period/cycles', [PeriodTrackerController::class, 'cycles']);
        Route::post('/period/cycles', [PeriodTrackerController::class, 'storeCycle']);
        Route::delete('/period/cycles/{cycle}', [PeriodTrackerController::class, 'destroyCycle']);
        Route::get('/period/logs', [PeriodTrackerController::class, 'logs']);
        Route::post('/period/logs', [PeriodTrackerController::class, 'storeLog']);
        Route::put('/period/logs/{log}', [PeriodTrackerController::class, 'updateLog']);
        Route::delete('/period/logs/{log}', [PeriodTrackerController::class, 'destroyLog']);

        Route::post('/ai/parse', [AiController::class, 'parse']);
        Route::post('/ai/create-from-voice', [AiController::class, 'createFromVoice']);
        Route::post('/assistant', [AiController::class, 'assistant']);

        Route::apiResource('/categories', CategoryController::class);
        Route::apiResource('/locations', LocationController::class);

        Route::get('/shopping', [ShoppingListController::class, 'index']);
        Route::post('/shopping', [ShoppingListController::class, 'store']);
        Route::get('/shopping/{list}', [ShoppingListController::class, 'show']);
        Route::put('/shopping/{list}', [ShoppingListController::class, 'update']);
        Route::delete('/shopping/{list}', [ShoppingListController::class, 'destroy']);
        Route::post('/shopping/{list}/items', [ShoppingListController::class, 'addItem']);
        Route::post('/shopping/items/{item}/toggle', [ShoppingListController::class, 'toggleItem']);
        Route::put('/shopping/items/{item}', [ShoppingListController::class, 'updateItem']);
        Route::delete('/shopping/items/{item}', [ShoppingListController::class, 'destroyItem']);

        Route::get('/bills', [BillController::class, 'index']);
        Route::post('/bills', [BillController::class, 'store']);
        Route::get('/bills/{bill}', [BillController::class, 'show']);
        Route::put('/bills/{bill}', [BillController::class, 'update']);
        Route::delete('/bills/{bill}', [BillController::class, 'destroy']);
        Route::post('/bills/{bill}/toggle-paid', [BillController::class, 'togglePaid']);

        Route::apiResource('/birthdays', BirthdayController::class);
    });
});
