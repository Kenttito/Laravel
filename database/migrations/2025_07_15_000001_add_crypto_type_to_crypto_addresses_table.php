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
        Schema::table('crypto_addresses', function (Blueprint $table) {
            if (!Schema::hasColumn('crypto_addresses', 'crypto_type')) {
                $table->string('crypto_type')->nullable()->after('address');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crypto_addresses', function (Blueprint $table) {
            if (Schema::hasColumn('crypto_addresses', 'crypto_type')) {
                $table->dropColumn('crypto_type');
            }
        });
    }
}; 