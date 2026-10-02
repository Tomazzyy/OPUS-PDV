<?php

return [
    'array' => 'O campo :attribute deve ser uma lista.',
    'distinct' => 'O campo :attribute está repetido.',
    'email' => 'O campo :attribute deve ser um e-mail válido.',
    'enum' => 'O campo :attribute é inválido.',
    'integer' => 'O campo :attribute deve ser um número inteiro.',
    'max' => [
        'array' => 'O campo :attribute deve ter no máximo :max itens.',
        'numeric' => 'O campo :attribute deve ser no máximo :max.',
        'string' => 'O campo :attribute deve ter no máximo :max caracteres.',
    ],
    'min' => [
        'array' => 'O campo :attribute deve ter pelo menos :min item.',
        'numeric' => 'O campo :attribute deve ser pelo menos :min.',
    ],
    'required' => 'O campo :attribute é obrigatório.',
    'string' => 'O campo :attribute deve ser um texto.',

    'attributes' => [
        'email' => 'e-mail',
        'password' => 'senha',
        'search' => 'busca',
        'items' => 'itens',
        'items.*.product_id' => 'produto',
        'items.*.quantity' => 'quantidade',
        'payment_method' => 'forma de pagamento',
        'amount_received_cents' => 'valor recebido',
    ],
];
