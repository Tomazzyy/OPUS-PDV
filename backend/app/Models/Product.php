<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable(['name', 'code', 'image_path', 'price_cents', 'stock_quantity', 'active'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price_cents' => 'integer',
            'stock_quantity' => 'integer',
            'active' => 'boolean',
        ];
    }

    /**
     * Guarda junto com o nome uma versão sem acentos e em minúsculas, usada na
     * busca. Assim "agua" encontra "Água" em qualquer banco, inclusive no SQLite.
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => ['name' => $value, 'search_name' => self::normalize($value)],
        );
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn () => match (true) {
            ! $this->image_path => null,
            Str::startsWith($this->image_path, ['http://', 'https://']) => $this->image_path,
            default => asset($this->image_path),
        });
    }

    #[Scope]
    protected function search(Builder $query, string $term): void
    {
        $query->where(function (Builder $query) use ($term) {
            $query->where('search_name', 'like', '%'.self::normalize($term).'%')
                ->orWhere('code', 'like', "{$term}%");
        });
    }

    private static function normalize(string $value): string
    {
        return Str::lower(Str::ascii($value));
    }
}
