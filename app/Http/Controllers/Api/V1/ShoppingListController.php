<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ShoppingItemRequest;
use App\Http\Requests\Api\ShoppingListRequest;
use App\Http\Resources\ShoppingItemResource;
use App\Http\Resources\ShoppingListResource;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use Illuminate\Http\JsonResponse;

class ShoppingListController extends Controller
{
    public function index()
    {
        $lists = ShoppingList::with('items')
            ->where('user_id', auth('web')->id())
            ->latest()
            ->get();

        return ShoppingListResource::collection($lists);
    }

    public function store(ShoppingListRequest $request): ShoppingListResource
    {
        $list = ShoppingList::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return new ShoppingListResource($list->load('items'));
    }

    public function show(ShoppingList $list): ShoppingListResource
    {
        $this->authorize('view', $list);
        return new ShoppingListResource($list->load('items'));
    }

    public function update(ShoppingListRequest $request, ShoppingList $list): ShoppingListResource
    {
        $this->authorize('update', $list);
        $list->update($request->validated());
        return new ShoppingListResource($list->fresh()->load('items'));
    }

    public function destroy(ShoppingList $list): JsonResponse
    {
        $this->authorize('delete', $list);
        $list->delete();
        return response()->json(['message' => 'Daftar belanja dihapus.']);
    }

    public function addItem(ShoppingList $list, ShoppingItemRequest $request): ShoppingListResource
    {
        $this->authorize('update', $list);

        ShoppingItem::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'shopping_list_id' => $list->id,
        ]);

        return new ShoppingListResource($list->fresh()->load('items'));
    }

    public function toggleItem(ShoppingItem $item): ShoppingItemResource
    {
        $this->authorize('update', $item);
        $item->update(['checked' => ! $item->checked]);
        return new ShoppingItemResource($item->fresh());
    }

    public function updateItem(ShoppingItemRequest $request, ShoppingItem $item): ShoppingItemResource
    {
        $this->authorize('update', $item);
        $item->update($request->validated());
        return new ShoppingItemResource($item->fresh());
    }

    public function destroyItem(ShoppingItem $item): JsonResponse
    {
        $this->authorize('delete', $item);
        $item->delete();
        return response()->json(['message' => 'Item dihapus.']);
    }
}
