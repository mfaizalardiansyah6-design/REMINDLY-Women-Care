<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('period_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('period_cycle_id')->nullable()->constrained()->nullOnDelete();
            $table->date('log_date');
            $table->enum('flow_intensity', ['light', 'medium', 'heavy'])->nullable();
            $table->string('mood')->nullable();
            $table->json('symptoms')->nullable();
            $table->text('private_note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'log_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('period_logs');
    }
};
