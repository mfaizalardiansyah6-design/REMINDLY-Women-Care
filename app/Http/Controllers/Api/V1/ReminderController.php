<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ReminderRequest;
use App\Http\Resources\ReminderResource;
use App\Models\Reminder;
use App\Services\ReminderService;
use Illuminate\Http\JsonResponse;

class ReminderController extends Controller
{
    public function __construct(private readonly ReminderService $service)
    {
    }

    public function index()
    {
        $user = auth('web')->user();

        $query = Reminder::with('category')
            ->where('user_id', $user->id);

        if ($search = request('search')) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        if ($priority = request('priority')) {
            $query->where('priority', $priority);
        }

        if ($status = request('status')) {
            if ($status === 'completed') {
                $query->where('completed', true);
            } elseif ($status === 'pending') {
                $query->where('completed', false);
            } elseif ($status === 'upcoming') {
                $query->where('completed', false)->where('date', '>=', today());
            } elseif ($status === 'today') {
                $query->where('completed', false)->where('date', today());
            }
        }

        if ($categoryId = request('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $sort = request('sort', 'date');
        $order = request('order', 'asc');
        $sortable = ['date', 'title', 'priority', 'created_at'];
        if (in_array($sort, $sortable, true)) {
            $query->orderBy($sort, $order === 'desc' ? 'desc' : 'asc');
        }

        $reminders = $query->latest('id')->paginate((int) (request('per_page', 20)));
        $reminders->withQueryString();

        return ReminderResource::collection($reminders);
    }

    public function store(ReminderRequest $request): ReminderResource
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['source'] = 'manual';
        $data['status'] = 'pending';

        $reminder = Reminder::query()->create($data);

        $this->maybeNotify($reminder);

        return new ReminderResource($reminder->load('category'));
    }

    public function show(Reminder $reminder): ReminderResource
    {
        $this->authorize('view', $reminder);
        return new ReminderResource($reminder->load('category'));
    }

    public function update(ReminderRequest $request, Reminder $reminder): ReminderResource
    {
        $this->authorize('update', $reminder);
        $reminder->update($request->validated());
        $this->maybeNotify($reminder->fresh());

        return new ReminderResource($reminder->fresh()->load('category'));
    }

    public function destroy(Reminder $reminder): JsonResponse
    {
        $this->authorize('delete', $reminder);
        $reminder->delete();

        return response()->json(['message' => 'Pengingat dihapus.']);
    }

    public function complete(Reminder $reminder): ReminderResource
    {
        $this->authorize('complete', $reminder);
        $reminder->update([
            'completed' => true,
            'completed_at' => now(),
            'status' => 'completed',
        ]);

        return new ReminderResource($reminder->fresh()->load('category'));
    }

    public function reopen(Reminder $reminder): ReminderResource
    {
        $this->authorize('complete', $reminder);
        $reminder->update([
            'completed' => false,
            'completed_at' => null,
            'status' => 'pending',
        ]);

        return new ReminderResource($reminder->fresh()->load('category'));
    }

    public function snooze(Reminder $reminder): ReminderResource
    {
        $this->authorize('complete', $reminder);
        $amount = (int) request('minutes', 5);
        $reminder->update([
            'snoozed_until' => now()->addMinutes($amount),
            'status' => 'snoozed',
        ]);

        return new ReminderResource($reminder->fresh()->load('category'));
    }

    public function duplicate(Reminder $reminder): ReminderResource
    {
        $this->authorize('complete', $reminder);
        $copy = $this->service->duplicate($reminder);

        return new ReminderResource($copy->load('category'));
    }

    protected function maybeNotify(Reminder $reminder): void
    {
        if ($reminder->date->isToday() && $this->service->dueForNotification($reminder)) {
            $this->service->fireNotification($reminder);
        }
    }
}
