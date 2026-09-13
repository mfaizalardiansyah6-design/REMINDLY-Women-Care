<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserNotificationResource;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index()
    {
        $user = auth('web')->user();
        $query = UserNotification::where('user_id', $user->id);

        $type = request('type');
        if ($type && in_array($type, ['reminder', 'period', 'task', 'system'], true)) {
            $query->where('type', $type);
        }

        $notifications = $query->latest()->paginate((int) request('per_page', 20));
        $notifications->withQueryString();

        return UserNotificationResource::collection($notifications);
    }

    public function unreadCount(): JsonResponse
    {
        $count = UserNotification::where('user_id', auth('web')->id())
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markRead(UserNotification $notification): JsonResponse
    {
        $this->authorize('update', $notification);
        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Terbaca.']);
    }

    public function markAllRead(): JsonResponse
    {
        UserNotification::where('user_id', auth('web')->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Semua terbaca.']);
    }

    public function destroy(UserNotification $notification): JsonResponse
    {
        $this->authorize('delete', $notification);
        $notification->delete();

        return response()->json(['message' => 'Notifikasi dihapus.']);
    }
}
