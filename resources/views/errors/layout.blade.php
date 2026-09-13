<!DOCTYPE html>
<html lang="id" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title', 'Terjadi Kesalahan') - {{ config('app.name', 'REMINDLY') }}</title>
        <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
        @vite(['resources/js/app.jsx'])
    </head>
    <body class="h-full antialiased bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <div class="flex min-h-screen items-center justify-center px-4">
            <div class="w-full max-w-md text-center">
                <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-500 to-lavender-500 text-2xl font-black text-white shadow-lg shadow-blush-500/30">
                    @yield('code', '!')
                </div>
                <h1 class="text-2xl font-bold tracking-tight">@yield('heading', 'Terjadi Kesalahan')</h1>
                <p class="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    @yield('message', 'Ada yang tidak beres. Silakan coba lagi.')
                </p>
                <div class="mt-8">
                    <a
                        href="{{ url('/') }}"
                        class="inline-flex items-center justify-center rounded-xl bg-blush-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blush-600"
                    >
                        Kembali ke Beranda
                    </a>
                </div>
            </div>
        </div>
    </body>
</html>
