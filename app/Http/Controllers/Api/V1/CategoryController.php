<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index()
    {
        $query = Category::where('user_id', auth('web')->id());

        if ($type = request('type')) {
            $query->where('type', $type);
        }

        $categories = $query->orderBy('name')->get();

        return CategoryResource::collection($categories);
    }

    public function store(CategoryRequest $request): CategoryResource
    {
        $category = Category::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return new CategoryResource($category);
    }

    public function show(Category $category): CategoryResource
    {
        $this->authorize('view', $category);
        return new CategoryResource($category);
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $this->authorize('update', $category);
        $category->update($request->validated());
        return new CategoryResource($category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->authorize('delete', $category);
        $category->delete();
        return response()->json(['message' => 'Kategori dihapus.']);
    }
}
