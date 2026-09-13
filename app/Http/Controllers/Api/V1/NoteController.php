<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\NoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\JsonResponse;

class NoteController extends Controller
{
    public function index()
    {
        $user = auth('web')->user();

        $query = Note::with('category')
            ->where('user_id', $user->id);

        if ($search = request('search')) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('content', 'like', "%{$search}%"));
        }

        if (request('pinned') === '1' || request('pinned') === 'true') {
            $query->where('pinned', true);
        }

        if ($categoryId = request('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $query->ordered();

        $notes = $query->paginate((int) request('per_page', 20));
        $notes->withQueryString();

        return NoteResource::collection($notes);
    }

    public function store(NoteRequest $request): NoteResource
    {
        $note = Note::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return new NoteResource($note->load('category'));
    }

    public function show(Note $note): NoteResource
    {
        $this->authorize('view', $note);
        return new NoteResource($note->load('category'));
    }

    public function update(NoteRequest $request, Note $note): NoteResource
    {
        $this->authorize('update', $note);
        $note->update($request->validated());
        return new NoteResource($note->fresh()->load('category'));
    }

    public function destroy(Note $note): JsonResponse
    {
        $this->authorize('delete', $note);
        $note->delete();
        return response()->json(['message' => 'Catatan dihapus.']);
    }

    public function togglePin(Note $note): NoteResource
    {
        $this->authorize('update', $note);
        $note->update(['pinned' => ! $note->pinned]);
        return new NoteResource($note->fresh()->load('category'));
    }
}
