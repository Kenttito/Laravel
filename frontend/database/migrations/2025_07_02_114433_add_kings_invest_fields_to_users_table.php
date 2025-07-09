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
        Schema::table('users', function (Blueprint $table) {
            $table->string('firstName')->nullable();
            $table->string('lastName')->nullable();
            $table->string('country')->nullable();
            $table->string('currency')->nullable();
            $table->string('phone')->nullable();
            $table->string('role')->nullable();
            $table->string('emailConfirmationCode')->nullable();
            $table->timestamp('emailConfirmationExpires')->nullable();
            $table->string('registrationIP')->nullable();
            $table->boolean('isActive')->default(false);
            $table->string('twoFactorSecret')->nullable();
            $table->boolean('twoFactorEnabled')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'firstName',
                'lastName',
                'country',
                'currency',
                'phone',
                'role',
                'emailConfirmationCode',
                'emailConfirmationExpires',
                'registrationIP',
                'isActive',
                'twoFactorSecret',
                'twoFactorEnabled',
            ]);
        });
    }
};
