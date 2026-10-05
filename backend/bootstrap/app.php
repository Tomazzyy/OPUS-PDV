<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(fn (AuthenticationException $e) => response()->json([
            'message' => 'Sessão expirada. Faça login novamente.',
        ], 401));

        $exceptions->render(fn (AccessDeniedHttpException $e) => response()->json([
            'message' => 'Acesso permitido apenas para administradores.',
        ], 403));

        $exceptions->render(fn (ThrottleRequestsException $e) => response()->json([
            'message' => 'Muitas tentativas. Aguarde um minuto e tente novamente.',
        ], 429, $e->getHeaders()));
    })->create();
