<?php

declare(strict_types=1);

namespace Sprasa\NepaliUnicode;

use InvalidArgumentException;

/**
 * Nepali text converter: Preeti <-> Unicode, Romanized -> Unicode, Unicode -> Roman/slug,
 * Nepali digits and lakh/crore number formatting.
 *
 * Server-side port of src/nepali-converter.js. Both implementations are tested against
 * tests/fixtures.json so they produce identical output.
 *
 * Requires PHP 8.1+ with mbstring. ext-intl is used for Unicode normalisation when present.
 *
 * @author Pradip Subedi (@sprasapradip) <https://github.com/sprasapradip/unicode-nepali>
 */
final class NepaliConverter
{
    public const VERSION = '2.0.0';

    public const MODES = ['roman-to-unicode', 'preeti-to-unicode', 'unicode-to-preeti', 'unicode-to-roman', 'slug'];

    private const DEV_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

    private const CONS = '\x{0915}-\x{0939}\x{0958}-\x{095F}';
    private const MATRA = '\x{093E}-\x{094C}\x{0962}\x{0963}';

    private const PREETI_MAP = [
        'k|m' => 'फ्र', 'em' => 'झ', 'km' => 'फ', 'Qm' => 'क्त', 'qm' => 'क्र', 'N˜' => 'ल',
        '6«' => 'ट्र', '7«' => 'ठ्र', '8«' => 'ड्र', '9«' => 'ढ्र', '8Þ' => 'ड़', '9Þ' => 'ढ़',
        'cf‘' => 'ऑ', 'c‘f' => 'ऑ', 'cf}' => 'औ', 'cf]' => 'ओ', 'cf' => 'आ', 'O{' => 'ई', 'pm' => 'ऊ', 'P]' => 'ऐ', 'f‘' => 'ॉ',
        'ç' => 'ॐ', '˜' => 'ऽ', '.' => '।', ')' => '०', '!' => '१', '@' => '२', '#' => '३', '$' => '४',
        '%' => '५', '^' => '६', '&' => '७', '*' => '८', '(' => '९',
        '¡' => 'ज्ञ्', '¢' => 'द्घ', '1' => 'ज्ञ', '2' => 'द्द', '4' => 'द्ध', '>' => 'श्र', '?' => 'रु', '§' => 'ट्ट',
        '°' => 'ड्ढ', '¶' => 'ठ्ठ', '¿' => 'रू', 'Å' => 'हृ', 'Ë' => 'ङ्ग', 'Ì' => 'न्न', 'Í' => 'ङ्क', 'Î' => 'ङ्ख',
        'Ý' => 'ट्ठ', 'å' => 'द्व', 'Ø' => '्य', '|' => '्र', 'q' => 'त्र', 'Q' => 'त्त', 'Œ' => 'त्त्', 'I' => 'क्ष्', 'B' => 'द्य',
        'S' => 'क्', 's' => 'क', 'V' => 'ख्', 'v' => 'ख', 'U' => 'ग्', 'u' => 'ग', '3' => 'घ', 'ª' => 'ङ',
        'R' => 'च्', 'r' => 'च', '5' => 'छ', 'H' => 'ज्', 'h' => 'ज', '‰' => 'झ्', '´' => 'झ', '~' => 'ञ्', '`' => 'ञ',
        '6' => 'ट', '7' => 'ठ', '8' => 'ड', '9' => 'ढ', '0' => 'ण्', 'T' => 'त्', 't' => 'त', 'Y' => 'थ्', 'y' => 'थ',
        'b' => 'द', 'W' => 'ध्', 'w' => 'ध', 'G' => 'न्', 'g' => 'न', 'K' => 'प्', 'k' => 'प', 'ˆ' => 'फ्', 'A' => 'ब्',
        'a' => 'ब', 'E' => 'भ्', 'e' => 'भ', 'D' => 'म्', 'd' => 'म', 'o' => 'य', '/' => 'र', 'N' => 'ल्', 'n' => 'ल',
        'J' => 'व्', 'j' => 'व', 'Z' => 'श्', 'z' => 'श', 'i' => 'ष्', ':' => 'स्', ';' => 'स', 'X' => 'ह्', 'x' => 'ह',
        'c' => 'अ', 'O' => 'इ', 'p' => 'उ', 'C' => 'ऋ', 'P' => 'ए',
        'f' => 'ा', 'l' => 'ि', 'L' => 'ी', "'" => 'ु', '"' => 'ू', '[' => 'ृ', ']' => 'े', '}' => 'ै',
        '+' => 'ं', 'F' => 'ँ', 'M' => 'ः', '\\' => '्', '{' => 'र्', 'Þ' => '़',
        '=' => '.', '_' => ')', '-' => '(', 'Ö' => '=', 'Ù' => ';', '<' => '?', '÷' => '/', 'Ú' => '’', 'Û' => '!', 'Ü' => '%',
    ];

    private const FULL_KEY = [
        'क' => 's', 'ख' => 'v', 'ग' => 'u', 'घ' => '3', 'ङ' => 'ª', 'च' => 'r', 'छ' => '5', 'ज' => 'h', 'झ' => 'em', 'ञ' => '`',
        'ट' => '6', 'ठ' => '7', 'ड' => '8', 'ढ' => '9', 'ण' => '0f', 'त' => 't', 'थ' => 'y', 'द' => 'b', 'ध' => 'w', 'न' => 'g',
        'प' => 'k', 'फ' => 'km', 'ब' => 'a', 'भ' => 'e', 'म' => 'd', 'य' => 'o', 'र' => '/', 'ल' => 'n', 'व' => 'j', 'श' => 'z',
        'ष' => 'if', 'स' => ';', 'ह' => 'x',
    ];

    private const HALF_KEY = [
        'क' => 'S', 'ख' => 'V', 'ग' => 'U', 'च' => 'R', 'ज' => 'H', 'झ' => '‰', 'ञ' => '~', 'ण' => '0', 'त' => 'T', 'थ' => 'Y',
        'ध' => 'W', 'न' => 'G', 'प' => 'K', 'फ' => 'ˆ', 'ब' => 'A', 'भ' => 'E', 'म' => 'D', 'ल' => 'N', 'व' => 'J', 'श' => 'Z',
        'ष' => 'i', 'स' => ':', 'ह' => 'X',
    ];

    private const UNICODE_BASE = [
        'क्ष्' => 'I', 'क्ष' => 'If', 'त्र' => 'q', 'त्त्' => 'Œ', 'त्त' => 'Q', 'ज्ञ्' => '¡', 'ज्ञ' => '1', 'द्द' => '2',
        'द्ध' => '4', 'श्र' => '>', 'द्य' => 'B', 'रु' => '?', 'रू' => '¿', 'हृ' => 'Å', 'ट्ट' => '§', 'ड्ढ' => '°',
        'ठ्ठ' => '¶', 'ङ्ग' => 'Ë', 'न्न' => 'Ì', 'ङ्क' => 'Í', 'ङ्ख' => 'Î', 'ट्ठ' => 'Ý', 'द्व' => 'å', 'द्घ' => '¢',
        'क्र' => 'qm', 'क्त' => 'Qm', 'फ्र' => 'k|m', 'ट्र' => '6«', 'ठ्र' => '7«', 'ड्र' => '8«', 'ढ्र' => '9«',
        'ॐ' => 'ç', 'ऽ' => '˜', '।' => '.', '॥' => '..',
        'अ' => 'c', 'आ' => 'cf', 'इ' => 'O', 'ई' => 'O{', 'उ' => 'p', 'ऊ' => 'pm', 'ऋ' => 'C', 'ए' => 'P', 'ऐ' => 'P]',
        'ओ' => 'cf]', 'औ' => 'cf}', 'ऑ' => 'cf‘',
        'ा' => 'f', 'ि' => 'l', 'ी' => 'L', 'ु' => "'", 'ू' => '"', 'ृ' => '[', 'े' => ']', 'ै' => '}', 'ो' => 'f]', 'ौ' => 'f}',
        'ॉ' => 'f‘', 'ं' => '+', 'ँ' => 'F', 'ः' => 'M', '्' => '\\', '़' => 'Þ', '्य' => 'Ø', '्र' => '|',
        '.' => '=', '(' => '-', ')' => '_', '=' => 'Ö', ';' => 'Ù', '?' => '<', '/' => '÷', '’' => 'Ú', "'" => 'Ú', '!' => 'Û', '%' => 'Ü',
        '{' => '{',
    ];

    private const R_CONS = [
        'k' => 'क', 'kh' => 'ख', 'g' => 'ग', 'gh' => 'घ', 'Ng' => 'ङ', 'ch' => 'च', 'chh' => 'छ', 'Ch' => 'छ', 'c' => 'च',
        'j' => 'ज', 'jh' => 'झ', 'Ny' => 'ञ', 'T' => 'ट', 'Th' => 'ठ', 'D' => 'ड', 'Dh' => 'ढ', 'N' => 'ण', 't' => 'त',
        'th' => 'थ', 'd' => 'द', 'dh' => 'ध', 'n' => 'न', 'p' => 'प', 'ph' => 'फ', 'f' => 'फ', 'b' => 'ब', 'bh' => 'भ',
        'm' => 'म', 'y' => 'य', 'r' => 'र', 'l' => 'ल', 'v' => 'व', 'w' => 'व', 'sh' => 'श', 'Sh' => 'ष', 's' => 'स',
        'h' => 'ह', 'x' => 'क्ष', 'ksh' => 'क्ष', 'tr' => 'त्र', 'gy' => 'ज्ञ', 'q' => 'क', 'z' => 'ज',
    ];

    private const R_VOWEL = [
        'a' => ['अ', ''], 'aa' => ['आ', 'ा'], 'A' => ['आ', 'ा'], 'i' => ['इ', 'ि'], 'ii' => ['ई', 'ी'], 'ee' => ['ई', 'ी'],
        'I' => ['ई', 'ी'], 'u' => ['उ', 'ु'], 'uu' => ['ऊ', 'ू'], 'oo' => ['ऊ', 'ू'], 'U' => ['ऊ', 'ू'], 'Ri' => ['ऋ', 'ृ'],
        'e' => ['ए', 'े'], 'ai' => ['ऐ', 'ै'], 'o' => ['ओ', 'ो'], 'au' => ['औ', 'ौ'], 'ou' => ['औ', 'ौ'],
    ];

    private const R_SIGN = ['M' => 'ं', '~' => 'ँ', 'H' => 'ः', 'OM' => 'ॐ', '..' => '..', '.' => '।', '|' => '।'];

    private const ROMAN_CONS = [
        'क' => 'k', 'ख' => 'kh', 'ग' => 'g', 'घ' => 'gh', 'ङ' => 'ng', 'च' => 'ch', 'छ' => 'chh', 'ज' => 'j', 'झ' => 'jh',
        'ञ' => 'ny', 'ट' => 't', 'ठ' => 'th', 'ड' => 'd', 'ढ' => 'dh', 'ण' => 'n', 'त' => 't', 'थ' => 'th', 'द' => 'd',
        'ध' => 'dh', 'न' => 'n', 'प' => 'p', 'फ' => 'ph', 'ब' => 'b', 'भ' => 'bh', 'म' => 'm', 'य' => 'y', 'र' => 'r',
        'ल' => 'l', 'व' => 'v', 'श' => 'sh', 'ष' => 'sh', 'स' => 's', 'ह' => 'h',
        "क\u{093C}" => 'q', "ख\u{093C}" => 'kh', "ग\u{093C}" => 'g', "ज\u{093C}" => 'z', "ड\u{093C}" => 'r',
        "ढ\u{093C}" => 'rh', "फ\u{093C}" => 'f', "य\u{093C}" => 'y',
    ];

    private const ROMAN_VOWEL = [
        'अ' => 'a', 'आ' => 'aa', 'इ' => 'i', 'ई' => 'i', 'उ' => 'u', 'ऊ' => 'u', 'ऋ' => 'ri', 'ए' => 'e', 'ऐ' => 'ai',
        'ओ' => 'o', 'औ' => 'au', 'ऑ' => 'o', 'ा' => 'aa', 'ि' => 'i', 'ी' => 'i', 'ु' => 'u', 'ू' => 'u', 'ृ' => 'ri',
        'े' => 'e', 'ै' => 'ai', 'ो' => 'o', 'ौ' => 'au', 'ॉ' => 'o',
    ];

    /** @var array<string, string>|null */
    private static ?array $unicodeMap = null;

    /** Convert text typed in the Preeti font into Nepali Unicode. */
    public static function preetiToUnicode(?string $text): string
    {
        $s = strtr((string) $text, ["'m" => "m'", '"m' => 'm"', ']m' => 'm]']);
        $s = self::translate($s, self::PREETI_MAP);
        $s = str_replace("\u{094D}\u{093E}", '', $s);
        $s = (string) preg_replace('/\x{093F}(' . self::cluster() . ')/u', '$1' . "\u{093F}", $s);
        $s = strtr($s, [
            "\u{093E}\u{0947}" => "\u{094B}", "\u{093E}\u{0948}" => "\u{094C}", "\u{0905}\u{093E}" => "\u{0906}",
        ]);
        $s = strtr($s, ["\u{0906}\u{0947}" => "\u{0913}", "\u{0906}\u{0948}" => "\u{0914}", "\u{090F}\u{0947}" => "\u{0910}"]);
        $s = (string) preg_replace(
            '/(' . self::cluster() . '[' . self::MATRA . ']*[\x{0902}\x{0901}]?)\x{0930}\x{094D}/u',
            "\u{0930}\u{094D}" . '$1',
            $s
        );
        $s = (string) preg_replace('/([\x{0902}\x{0901}])([\x{093E}-\x{094C}])/u', '$2$1', $s);

        return self::nfc($s);
    }

    /**
     * Convert Nepali Unicode into Preeti-font text.
     *
     * @param array{digits?: 'devanagari'|'keep'} $options
     */
    public static function unicodeToPreeti(?string $text, array $options = []): string
    {
        $s = self::nfc((string) $text);
        if (($options['digits'] ?? 'devanagari') !== 'keep') {
            $s = self::toNepaliDigits($s);
        }
        $s = (string) preg_replace(
            '/\x{0930}\x{094D}(' . self::cluster() . '[' . self::MATRA . ']*[\x{0902}\x{0901}]?)/u',
            '$1{',
            $s
        );
        $s = (string) preg_replace('/(' . self::cluster() . ')\x{093F}/u', "\u{093F}" . '$1', $s);

        return self::translate($s, self::unicodeMap());
    }

    /**
     * Transliterate Romanized Nepali into Unicode. Text inside {braces} is kept; "\" forces a halant.
     *
     * @param array{digits?: 'devanagari'|'keep'} $options
     */
    public static function romanToUnicode(?string $text, array $options = []): string
    {
        $chars = self::chars((string) $text);
        $count = count($chars);
        $out = '';
        $afterConsonant = false;
        $i = 0;

        while ($i < $count) {
            $ch = $chars[$i];
            if ($ch === '{') {
                $end = $i + 1;
                while ($end < $count && $chars[$end] !== '}') {
                    $end++;
                }
                $out .= implode('', array_slice($chars, $i + 1, $end - $i - 1));
                $i = $end + 1;
                $afterConsonant = false;
                continue;
            }
            if ($ch === '\\') {
                if ($afterConsonant) {
                    $out .= '्';
                }
                $afterConsonant = false;
                $i++;
                continue;
            }

            $match = self::matchRoman($chars, $i, $count);

            if ($match === null) {
                $out .= (ctype_digit($ch) && ($options['digits'] ?? 'devanagari') !== 'keep') ? self::DEV_DIGITS[(int) $ch] : $ch;
                $afterConsonant = false;
                $i++;
                continue;
            }

            [$t, $key, $len] = $match;
            if ($t === 1) {
                $out .= ($afterConsonant ? '्' : '') . self::R_CONS[$key];
                $afterConsonant = true;
            } elseif ($t === 2) {
                $out .= self::R_VOWEL[$key][$afterConsonant ? 1 : 0];
                $afterConsonant = false;
            } else {
                $out .= self::R_SIGN[$key];
                $afterConsonant = false;
            }
            $i += $len;
        }

        return $out;
    }

    /**
     * Longest Romanized token at $i: [table index (0 sign, 1 consonant, 2 vowel), key, length] or null.
     *
     * @param list<string> $chars
     * @return array{0: int, 1: string, 2: int}|null
     */
    private static function matchRoman(array $chars, int $i, int $count): ?array
    {
        $tables = [self::R_SIGN, self::R_CONS, self::R_VOWEL];
        for ($len = min(3, $count - $i); $len > 0; $len--) {
            $chunk = implode('', array_slice($chars, $i, $len));
            foreach ($tables as $t => $table) {
                if (array_key_exists($chunk, $table)) {
                    return [$t, $chunk, $len];
                }
            }
        }
        $lower = strtolower($chars[$i]);
        if ($lower !== $chars[$i]) {
            foreach ([1, 2] as $t) {
                if (array_key_exists($lower, $tables[$t])) {
                    return [$t, $lower, 1];
                }
            }
        }

        return null;
    }

    /** Approximate Latin transliteration of Nepali Unicode (URLs, search, filenames). */
    public static function unicodeToRoman(?string $text): string
    {
        $chars = self::chars(self::nfc((string) $text));
        $units = [];
        $out = '';

        $flush = static function () use (&$units, &$out): void {
            $n = count($units);
            for ($k = 0; $k < $n; $k++) {
                $u = $units[$k];
                if (isset($u['raw'])) {
                    $out .= $u['raw'];
                    continue;
                }
                $out .= $u['c'];
                if ($u['halant']) {
                    continue;
                }
                if ($u['v'] !== null) {
                    $out .= $u['v'];
                    continue;
                }
                $next = $units[$k + 1] ?? null;
                $prev = $units[$k - 1] ?? null;
                $isLast = $next === null || isset($next['raw']);
                $drop = $isLast && $k > 0 && $prev !== null && !isset($prev['raw']) && !$prev['halant'] && $u['c'] !== 'y';
                if (!$drop && $prev !== null && !isset($prev['raw']) && $prev['v'] && $next !== null && !isset($next['raw']) && $next['v']) {
                    $drop = true;
                }
                if (!$drop) {
                    $out .= 'a';
                }
            }
            $units = [];
        };

        $count = count($chars);
        for ($i = 0; $i < $count; $i++) {
            $ch = $chars[$i];
            if (($chars[$i + 1] ?? '') === "\u{093C}" && isset(self::ROMAN_CONS[$ch . "\u{093C}"])) {
                $ch .= "\u{093C}";
                $i++;
            }
            $last = count($units) - 1;
            if (isset(self::ROMAN_CONS[$ch])) {
                $units[] = ['c' => self::ROMAN_CONS[$ch], 'v' => null, 'halant' => false];
            } elseif ($ch === '्' && $last >= 0 && isset($units[$last]['c'])) {
                $units[$last]['halant'] = true;
            } elseif (preg_match('/^[\x{093E}-\x{094C}]$/u', $ch) && $last >= 0 && isset($units[$last]['c'])) {
                $units[$last]['v'] = self::ROMAN_VOWEL[$ch] ?? '';
            } elseif (isset(self::ROMAN_VOWEL[$ch])) {
                $units[] = ['c' => '', 'v' => self::ROMAN_VOWEL[$ch], 'halant' => false];
            } elseif ($ch === 'ं' || $ch === 'ँ') {
                $units[] = ['raw' => 'n'];
            } elseif ($ch === 'ः') {
                $units[] = ['raw' => 'h'];
            } elseif ($ch === "\u{093C}") {
                continue;
            } elseif (($d = array_search($ch, self::DEV_DIGITS, true)) !== false) {
                $flush();
                $out .= (string) $d;
            } elseif ($ch === '।' || $ch === '॥') {
                $flush();
                $out .= '.';
            } else {
                $flush();
                $out .= $ch;
            }
        }
        $flush();

        return str_replace('aa', 'a', $out);
    }

    /** URL slug from Nepali (or mixed) text: "नेपाल समाचार" -> "nepal-samachar". */
    public static function slugify(?string $text, int $maxLength = 80): string
    {
        $slug = trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower(self::unicodeToRoman($text))), '-');
        if (strlen($slug) > $maxLength) {
            $slug = (string) preg_replace('/-[^-]*$/', '', substr($slug, 0, $maxLength));
        }

        return $slug;
    }

    public static function toNepaliDigits(?string $text): string
    {
        return strtr((string) $text, array_combine(range('0', '9'), self::DEV_DIGITS));
    }

    public static function toEnglishDigits(?string $text): string
    {
        return strtr((string) $text, array_combine(self::DEV_DIGITS, array_map('strval', range(0, 9))));
    }

    /**
     * Format with lakh/crore grouping: 1234567.5 -> "१२,३४,५६७.५".
     *
     * @param array{digits?: 'nepali'|'english', decimals?: int} $options
     */
    public static function formatNumber(int|float|string $value, array $options = []): string
    {
        $raw = trim(str_replace(',', '', self::toEnglishDigits((string) $value)));
        if (!preg_match('/^-?\d+(\.\d+)?$/', $raw)) {
            throw new InvalidArgumentException('formatNumber expects a numeric value');
        }
        $negative = $raw[0] === '-';
        $raw = ltrim($raw, '-');
        [$int, $frac] = array_pad(explode('.', $raw, 2), 2, '');
        $last3 = substr($int, -3);
        $rest = substr($int, 0, -3);
        $grouped = $rest !== '' ? preg_replace('/\B(?=(\d{2})+(?!\d))/', ',', $rest) . ',' . $last3 : $last3;
        if (isset($options['decimals'])) {
            $frac = substr(str_pad($frac, $options['decimals'], '0'), 0, $options['decimals']);
        }
        $result = ($negative ? '-' : '') . $grouped . ($frac !== '' ? '.' . $frac : '');

        return ($options['digits'] ?? 'nepali') === 'english' ? $result : self::toNepaliDigits($result);
    }

    /**
     * Guess the script: unicode, preeti, roman or empty.
     *
     * @return array{type: string, confidence: float}
     */
    public static function detect(?string $text): array
    {
        $s = trim((string) $text);
        if ($s === '') {
            return ['type' => 'empty', 'confidence' => 1.0];
        }
        $dev = preg_match_all('/[\x{0900}-\x{097F}]/u', $s);
        $letters = max(1, preg_match_all('/[A-Za-z\x{0900}-\x{097F}]/u', $s));
        if ($dev / $letters > 0.3) {
            return ['type' => 'unicode', 'confidence' => min(1.0, $dev / $letters)];
        }
        $latin = max(1, preg_match_all('/[A-Za-z]/', $s));
        $bar = substr_count($s, 'f') / $latin;
        $inWord = preg_match_all('/[A-Za-z][\]\[\{\}\'";|\\\\][A-Za-z]/', $s);
        $words = count(preg_split('/\s+/', $s) ?: []);
        $score = min(1, $bar * 6) * 0.6 + min(1, $inWord / max(1, $words) * 2) * 0.4;

        return $score >= 0.35
            ? ['type' => 'preeti', 'confidence' => round($score, 2)]
            : ['type' => 'roman', 'confidence' => round(1 - $score, 2)];
    }

    /** @param array{digits?: 'devanagari'|'keep'} $options */
    public static function convert(?string $text, string $mode, array $options = []): string
    {
        return match ($mode) {
            'preeti-to-unicode' => self::preetiToUnicode($text),
            'unicode-to-preeti' => self::unicodeToPreeti($text, $options),
            'roman-to-unicode' => self::romanToUnicode($text, $options),
            'unicode-to-roman' => self::unicodeToRoman($text),
            'slug' => self::slugify($text),
            default => throw new InvalidArgumentException('Unknown mode: ' . $mode),
        };
    }

    private static function cluster(): string
    {
        return '(?:[' . self::CONS . ']\x{093C}?\x{094D})*[' . self::CONS . ']\x{093C}?(?:\x{094D}[\x{0930}\x{092F}])?';
    }

    /** @return array<string, string> */
    private static function unicodeMap(): array
    {
        if (self::$unicodeMap !== null) {
            return self::$unicodeMap;
        }
        $m = self::UNICODE_BASE;
        foreach (self::FULL_KEY as $c => $key) {
            $m[$c] = $key;
            $m[$c . '्'] ??= self::HALF_KEY[$c] ?? $key . '\\';
            $m[$c . '्र'] ??= $key . '|';
        }
        foreach (self::DEV_DIGITS as $d => $digit) {
            $m[$digit] = ')!@#$%^&*('[$d];
        }

        return self::$unicodeMap = $m;
    }

    /**
     * Greedy longest-match translation over Unicode characters.
     *
     * @param array<string, string> $map
     */
    private static function translate(string $text, array $map): string
    {
        static $maxLens = [];
        $id = md5(implode("\0", array_keys($map)));
        $maxLen = $maxLens[$id] ??= max(array_map(static fn (string $k): int => mb_strlen($k), array_keys($map)));
        $chars = self::chars($text);
        $count = count($chars);
        $out = '';
        $i = 0;
        while ($i < $count) {
            for ($len = min($maxLen, $count - $i); $len > 0; $len--) {
                $chunk = $len === 1 ? $chars[$i] : implode('', array_slice($chars, $i, $len));
                if (isset($map[$chunk])) {
                    $out .= $map[$chunk];
                    $i += $len;
                    continue 2;
                }
            }
            $out .= $chars[$i];
            $i++;
        }

        return $out;
    }

    /** @return list<string> */
    private static function chars(string $text): array
    {
        if ($text === '') {
            return [];
        }

        return preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    }

    private static function nfc(string $text): string
    {
        if (class_exists(\Normalizer::class)) {
            $n = \Normalizer::normalize($text, \Normalizer::FORM_C);

            return $n === false ? $text : $n;
        }

        return $text;
    }
}
