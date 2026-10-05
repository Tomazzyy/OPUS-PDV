<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductImageRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    private const UPLOADS_PATH = 'images/products/uploads/';

    public function update(ProductImageRequest $request, Product $product)
    {
        $imagePath = $request->hasFile('image')
            ? self::UPLOADS_PATH.$request->file('image')->store('', 'product_images')
            : $request->validated('image_url');

        $this->deleteUploadedImage($product);
        $product->update(['image_path' => $imagePath]);

        return new ProductResource($product);
    }

    public function destroy(Product $product)
    {
        $this->deleteUploadedImage($product);
        $product->update(['image_path' => null]);

        return new ProductResource($product);
    }

    private function deleteUploadedImage(Product $product): void
    {
        if (str_starts_with((string) $product->image_path, self::UPLOADS_PATH)) {
            Storage::disk('product_images')->delete(basename($product->image_path));
        }
    }
}
