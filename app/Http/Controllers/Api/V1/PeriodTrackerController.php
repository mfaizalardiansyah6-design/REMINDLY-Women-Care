<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PeriodCycleRequest;
use App\Http\Requests\Api\PeriodLogRequest;
use App\Http\Resources\PeriodCycleResource;
use App\Http\Resources\PeriodLogResource;
use App\Models\PeriodCycle;
use App\Models\PeriodLog;
use App\Services\PeriodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PeriodTrackerController extends Controller
{
    public function __construct(private readonly PeriodService $service)
    {
    }

    public function summary(): JsonResponse
    {
        $cycle = $this->service->lastCycle(auth('web')->id());
        $summary = $this->service->summary($cycle);

        return response()->json([
            'summary' => $summary,
            'has_cycle' => $cycle !== null,
        ]);
    }

    public function cycles()
    {
        $cycles = PeriodCycle::with('logs')
            ->where('user_id', auth('web')->id())
            ->latest('start_date')
            ->paginate((int) request('per_page', 30));
        $cycles->withQueryString();

        return PeriodCycleResource::collection($cycles);
    }

    public function storeCycle(PeriodCycleRequest $request): PeriodCycleResource
    {
        $cycle = PeriodCycle::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return new PeriodCycleResource($cycle->load('logs'));
    }

    public function destroyCycle(PeriodCycle $cycle): JsonResponse
    {
        $this->authorize('delete', $cycle);
        $cycle->delete();
        return response()->json(['message' => 'Siklus dihapus.']);
    }

    public function logs()
    {
        $query = PeriodLog::where('user_id', auth('web')->id());

        if ($month = request('month')) {
            $query->whereMonth('log_date', $month);
        }
        if ($year = request('year')) {
            $query->whereYear('log_date', $year);
        }

        $logs = $query->latest('log_date')->get();

        return PeriodLogResource::collection($logs);
    }

    public function storeLog(PeriodLogRequest $request): PeriodLogResource
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();

            if (! empty($data['flow_intensity']) && empty($data['period_cycle_id'])) {
                $cycle = $this->service->lastCycle($request->user()->id);
                if ($cycle && $this->dateInCycle($cycle, $data['log_date'])) {
                    $data['period_cycle_id'] = $cycle->id;
                }
            }

            $log = PeriodLog::query()->updateOrCreate(
                ['user_id' => $request->user()->id, 'log_date' => $data['log_date']],
                $data,
            );

            return new PeriodLogResource($log);
        });
    }

    public function updateLog(PeriodLogRequest $request, PeriodLog $log): PeriodLogResource
    {
        $this->authorize('update', $log);
        $log->update($request->validated());
        return new PeriodLogResource($log->fresh());
    }

    public function destroyLog(PeriodLog $log): JsonResponse
    {
        $this->authorize('delete', $log);
        $log->delete();
        return response()->json(['message' => 'Catatan siklus dihapus.']);
    }

    protected function dateInCycle(PeriodCycle $cycle, string $date): bool
    {
        $start = $cycle->start_date;
        $end = $cycle->end_date ?? $start->copy()->addDays(($cycle->period_duration ?: 5) - 1);
        return now()->parse($date)->between($start, $end);
    }
}
