<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductImageRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'image' => ['required_without:image_url', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'image_url' => ['required_without:image', 'url:http,https', 'max:2048'],
        ];
    }
}
