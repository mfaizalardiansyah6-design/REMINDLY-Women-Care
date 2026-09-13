<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShoppingListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items ?? collect();
        $total = $items->count();
        $checked = $items->filter(fn ($i) => $i->checked)->count();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color,
            'items' => ShoppingItemResource::collection($this->whenLoaded('items')),
            'total_items' => $total,
            'checked_items' => $checked,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
