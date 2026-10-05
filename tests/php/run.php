<?php

declare(strict_types=1);

/**
 * PHP test runner (no PHPUnit needed): checks the PHP port against tests/fixtures.json,
 * the same fixtures the JavaScript library is tested with.
 * Usage: php tests/php/run.php        Exit: 0 pass, 1 failures.
 * Author: Pradip Subedi (@sprasapradip) - https://github.com/sprasapradip/unicode-nepali
 */

require __DIR__ . '/../../php/src/NepaliConverter.php';

use Sprasa\NepaliUnicode\NepaliConverter as N;

$fx = json_decode((string) file_get_contents(__DIR__ . '/../fixtures.json'), true, 512, JSON_THROW_ON_ERROR);
$nfc = static fn (string $s): string => Normalizer::normalize($s, Normalizer::FORM_C) ?: $s;
$pass = 0;
$fail = 0;

$check = static function (string $label, string $got, string $want) use (&$pass, &$fail): void {
    if ($got === $want) {
        $pass++;
        return;
    }
    $fail++;
    fwrite(STDERR, "FAIL {$label}\n  got:  {$got}\n  want: {$want}\n");
};

foreach ($fx['preeti_to_unicode'] as $preeti => $unicode) {
    $check("preeti {$preeti}", N::preetiToUnicode((string) $preeti), $nfc($unicode));
    $check("round trip {$unicode}", N::preetiToUnicode(N::unicodeToPreeti($unicode)), $nfc($unicode));
}
foreach ($fx['roman_to_unicode'] as $roman => $unicode) {
    $check("roman {$roman}", N::romanToUnicode((string) $roman), $nfc($unicode));
}
foreach ($fx['unicode_to_roman'] as $unicode => $roman) {
    $check("to roman {$unicode}", N::unicodeToRoman($unicode), $roman);
}
foreach ($fx['slug'] as $text => $slug) {
    $check("slug {$text}", N::slugify($text), $slug);
}
foreach ($fx['format_number'] as $in => $out) {
    $check("number {$in}", N::formatNumber((string) $in), $out);
}
$check('preeti keys', N::unicodeToPreeti('विद्यार्थी'), 'ljBfyL{');
$check('digits keep', N::unicodeToPreeti('2081', ['digits' => 'keep']), '2081');
$check('english digits', N::toEnglishDigits('२०८१'), '2081');
$check('detect preeti', N::detect('g]kfn ;/sf/sf] sfo{qmd')['type'], 'preeti');
$check('detect unicode', N::detect('नेपाल सरकार')['type'], 'unicode');
$check('detect roman', N::detect('mero naam pradip ho')['type'], 'roman');
$check('empty', N::preetiToUnicode(null) . N::romanToUnicode('') . N::unicodeToRoman(''), '');
try {
    N::convert('x', 'nope');
    $check('unknown mode throws', 'no exception', 'exception');
} catch (InvalidArgumentException) {
    $pass++;
}

echo "PHP: {$pass} passed, {$fail} failed\n";
exit($fail === 0 ? 0 : 1);
