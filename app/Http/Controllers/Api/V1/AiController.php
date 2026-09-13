<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReminderResource;
use App\Models\Reminder;
use App\Services\ReminderParserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AiController extends Controller
{
    public function __construct(private readonly ReminderParserService $parser)
    {
    }

    public function parse(Request $request): JsonResponse
    {
        $request->validate(['text' => ['required', 'string', 'max:1000']]);

        $parsed = $this->parser->parse($request->input('text'));

        return response()->json(['parsed' => $parsed]);
    }

    public function createFromVoice(Request $request): ReminderResource
    {
        $request->validate(['text' => ['required', 'string', 'max:1000']]);

        $parsed = $this->parser->parse($request->input('text'));

        try {
            $validated = validator($parsed, [
                'title' => ['required', 'string', 'max:255'],
                'date' => ['required', 'date'],
                'time' => ['nullable', 'date_format:H:i'],
                'priority' => ['required', 'in:low,medium,high'],
                'repeat' => ['required', 'in:none,daily,weekly,monthly,yearly,custom'],
                'notify_before_minutes' => ['nullable', 'integer', 'min:0'],
            ])->validate();
        } catch (ValidationException $e) {
            throw ValidationException::withMessages(['text' => 'Tidak dapat memahami pengingat tersebut.']);
        }

        $reminder = Reminder::query()->create([
            ...$validated,
            'user_id' => $request->user()->id,
            'description' => $request->input('text'),
            'source' => 'voice',
            'status' => 'pending',
        ]);

        return new ReminderResource($reminder->load('category'));
    }

    public function assistant(Request $request): JsonResponse
    {
        $request->validate(['message' => ['required', 'string', 'max:2000']]);

        $message = mb_strtolower(trim($request->input('message')));
        $user = $request->user();

        $reply = $this->ruleReply($message, $user);

        return response()->json(['reply' => $reply]);
    }

    protected function ruleReply(string $message, $user): string
    {
        if (str_contains($message, 'hai') || str_contains($message, 'halo') || str_contains($message, 'hi')) {
            $name = $user?->name ? explode(' ', $user->name)[0] : 'Sahabat';
            return "Halo {$name}! Ada yang bisa saya bantu? Saya bisa mengingatkan, mencatat, atau membantu hal-hal seputar keseharian dan kesehatan Anda.";
        }

        if (str_contains($message, 'siklus') || str_contains($message, 'menstruasi') || str_contains($message, 'haid')) {
            return 'Untuk info seputar siklus, buka menu "Siklus" pada aplikasi. Di sana Anda bisa mencatat periode, melihat hari siklus, jendela subur, dan perkiraan ovulasi.';
        }

        if (str_contains($message, 'pengingat') || str_contains($message, 'reminder') || str_contains($message, 'ingatkan')) {
            return 'Cara membuat pengingat: buka menu "Pengingat" lalu tekan "Buat Pengingat", atau gunakan fitur suara di menu "Suara" agar saya buatkan otomatis dari ucapan Anda.';
        }

        if (str_contains($message, 'terima kasih') || str_contains($message, 'makasih') || str_contains($message, 'thanks')) {
            return 'Sama-sama! Senang bisa membantu. Jika butuh apa-apa, tinggal hubungi saya.';
        }

        if (str_contains($message, 'siapa kamu') || str_contains($message, 'kamu siapa') || str_contains($message, 'apa kamu')) {
            return 'Saya adalah asisten cerdas di aplikasi REMINDLY. Saya membantu membuat pengingat, mencatat, dan memantau keseharian serta kesehatan Anda.';
        }

        $common = [
            'kesehatan' => 'Jaga kesehatan Anda: cukup tidur 7-8 jam, minum air, dan olahraga ringan. Pergunakan fitur pelacak siklus untuk memantau kesehatan Anda.',
            'minum obat' => 'Jangan lupa minum obat sesuai jadwal. Saya sarankan buat pengingat harian agar tidak terlewat.',
            'stres' => 'Merasakan stres itu wajar. Coba tarik napas dalam, istirahat cukup, dan luangkan waktu untuk diri sendiri.',
        ];

        foreach ($common as $key => $reply) {
            if (str_contains($message, $key)) {
                return $reply;
            }
        }

        return 'Terima kasih atas pesan Anda. Untuk hal yang lebih spesifik, silakan buat pengingat atau catatan melalui fitur yang tersedia, atau tanyakan tentang siklus dan kesehatan.';
    }
}
