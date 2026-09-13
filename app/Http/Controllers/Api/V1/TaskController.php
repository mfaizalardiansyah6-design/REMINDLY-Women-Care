<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function index()
    {
        $user = auth('web')->user();

        $query = Task::with('category')
            ->where('user_id', $user->id);

        if ($search = request('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $status = request('status');
        if ($status === 'completed') {
            $query->where('completed', true);
        } elseif ($status === 'active') {
            $query->where('completed', false);
        }

        if ($priority = request('priority')) {
            $query->where('priority', $priority);
        }

        if ($categoryId = request('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $filter = request('filter');
        if ($filter === 'overdue') {
            $query->where('completed', false)->where('due_at', '<', now());
        } elseif ($filter === 'due-today') {
            $query->where('completed', false)->whereDate('due_at', today());
        }

        $query->orderBy('completed')->orderBy('priority')->orderBy('position')->latest('id');

        $tasks = $query->get();

        return TaskResource::collection($tasks);
    }

    public function store(TaskRequest $request): TaskResource
    {
        $task = Task::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'position' => Task::where('user_id', $request->user()->id)->max('position') + 1,
        ]);

        return new TaskResource($task->load('category'));
    }

    public function show(Task $task): TaskResource
    {
        $this->authorize('view', $task);
        return new TaskResource($task->load('category'));
    }

    public function update(TaskRequest $request, Task $task): TaskResource
    {
        $this->authorize('update', $task);
        $task->update($request->validated());
        return new TaskResource($task->fresh()->load('category'));
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);
        $task->delete();
        return response()->json(['message' => 'Tugas dihapus.']);
    }

    public function complete(Task $task): TaskResource
    {
        $this->authorize('complete', $task);
        $task->update([
            'completed' => true,
            'completed_at' => now(),
            'progress' => 100,
        ]);

        UserNotification::query()->create([
            'user_id' => $task->user_id,
            'type' => 'task',
            'title' => 'Tugas selesai',
            'body' => $task->title,
            'data' => ['task_id' => $task->id],
        ]);

        return new TaskResource($task->fresh()->load('category'));
    }

    public function reopen(Task $task): TaskResource
    {
        $this->authorize('complete', $task);
        $task->update(['completed' => false, 'completed_at' => null, 'progress' => 0]);
        return new TaskResource($task->fresh()->load('category'));
    }
}
