<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeriodSymptomLog extends Model
{
    use HasFactory;

    protected $table = 'period_symptom_log';

    protected $guarded = [];

    public function periodLog()
    {
        return $this->belongsTo(PeriodLog::class);
    }
}
