<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('search_name')->default('')->after('name');
        });

        DB::table('products')->get(['id', 'name'])->each(function ($product) {
            DB::table('products')
                ->where('id', $product->id)
                ->update(['search_name' => Str::lower(Str::ascii($product->name))]);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('search_name');
        });
    }
};
