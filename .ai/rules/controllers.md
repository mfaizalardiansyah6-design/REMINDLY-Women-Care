---
paths:
  - 'app/Http/Controllers/**'
---

# Controllers

## API resource serialization style
All API controllers return resources via `response()->json(new XResource($model))` (flat, NOT auto-wrapped in `data`) and `response()->json(XResource::collection($collection))`. The React API layer is tolerant to both (`data.data ?? data` for single). Keep this flat style consistent; do not mix implicit wrapping.

## API resource serialization: wrap in data
API resources are returned DIRECTLY from controllers: single -> `new XResource($model)`, collection -> `XResource::collection($models)`, composite -> a new `XResource` wrapping nested resources. This makes Laravel wrap the top-level in `data` and auto-201 on recently-created single resources. Frontend API services unwrap with `r.data.data ?? r.data`.
