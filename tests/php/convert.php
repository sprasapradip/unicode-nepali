<?php
// Reads JSON [{mode, text}] on stdin and prints converted strings as JSON (parity test helper).
// Author: Pradip Subedi (@sprasapradip)
declare(strict_types=1);
require __DIR__ . '/../../php/src/NepaliConverter.php';
$cases = json_decode((string) stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
echo json_encode(array_map(
    static fn (array $c): string => Sprasa\NepaliUnicode\NepaliConverter::convert($c['text'], $c['mode']),
    $cases
), JSON_UNESCAPED_UNICODE);
