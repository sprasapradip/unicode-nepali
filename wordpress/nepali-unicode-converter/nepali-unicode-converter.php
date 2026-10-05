<?php
/**
 * Plugin Name:       Nepali Unicode Converter
 * Plugin URI:        https://github.com/sprasapradip/unicode-nepali
 * Description:       Preeti ↔ Unicode and Romanized Nepali converter for any page via the [nepali_converter] shortcode, plus optional English URL slugs for Nepali post titles.
 * Version:           2.0.0
 * Requires at least: 6.0
 * Requires PHP:      8.1
 * Author:            Pradip Subedi
 * Author URI:        https://github.com/sprasapradip
 * License:           All rights reserved
 * Text Domain:       nepali-unicode-converter
 *
 * @package NepaliUnicodeConverter
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NUC_VERSION', '2.0.0' );
define( 'NUC_URL', plugin_dir_url( __FILE__ ) );
define( 'NUC_OPTION_SLUGS', 'nuc_romanize_slugs' );

require_once __DIR__ . '/includes/NepaliConverter.php';

use Sprasa\NepaliUnicode\NepaliConverter;

/**
 * Register (not enqueue) front-end assets; they load only on pages that use the shortcode.
 */
function nuc_register_assets(): void {
	wp_register_script( 'nuc-core', NUC_URL . 'assets/nepali-converter.js', array(), NUC_VERSION, array( 'in_footer' => true ) );
	wp_register_script( 'nuc-element', NUC_URL . 'assets/nepali-converter-element.js', array( 'nuc-core' ), NUC_VERSION, array( 'in_footer' => true ) );
}
add_action( 'wp_enqueue_scripts', 'nuc_register_assets' );

/**
 * [nepali_converter mode="preeti-to-unicode" modes="preeti-to-unicode,unicode-to-preeti" lang="ne" theme="auto"]
 *
 * @param array<string, string>|string $atts Shortcode attributes.
 */
function nuc_shortcode( $atts ): string {
	$atts = shortcode_atts(
		array(
			'mode'  => 'roman-to-unicode',
			'modes' => '',
			'lang'  => 'en',
			'theme' => 'auto',
		),
		is_array( $atts ) ? $atts : array(),
		'nepali_converter'
	);

	$mode  = in_array( $atts['mode'], NepaliConverter::MODES, true ) ? $atts['mode'] : 'roman-to-unicode';
	$modes = implode(
		',',
		array_intersect( array_map( 'trim', explode( ',', (string) $atts['modes'] ) ), NepaliConverter::MODES )
	);
	$lang  = 'ne' === $atts['lang'] ? 'ne' : 'en';
	$theme = in_array( $atts['theme'], array( 'auto', 'light', 'dark' ), true ) ? $atts['theme'] : 'auto';

	wp_enqueue_script( 'nuc-element' );

	return sprintf(
		'<nepali-converter mode="%1$s" lang-ui="%2$s" theme="%3$s"%4$s></nepali-converter>',
		esc_attr( $mode ),
		esc_attr( $lang ),
		esc_attr( $theme ),
		'' !== $modes ? ' modes="' . esc_attr( $modes ) . '"' : ''
	);
}
add_shortcode( 'nepali_converter', 'nuc_shortcode' );

/**
 * Optional: give posts with Nepali titles a readable English slug (नेपाल समाचार -> nepal-samachar).
 * Runs only when saving, only when the title contains Devanagari, and never overrides a slug the editor typed.
 *
 * @param string $title     Sanitized title.
 * @param string $raw_title Raw title.
 * @param string $context   Context ('save', 'display', 'query').
 */
function nuc_romanize_slug( string $title, string $raw_title = '', string $context = 'display' ): string {
	if ( 'save' !== $context || ! get_option( NUC_OPTION_SLUGS ) || ! preg_match( '/[\x{0900}-\x{097F}]/u', $raw_title ) ) {
		return $title;
	}
	$slug = NepaliConverter::slugify( $raw_title, 75 );

	return '' !== $slug ? $slug : $title;
}
add_filter( 'sanitize_title', 'nuc_romanize_slug', 9, 3 );

/**
 * Settings → Writing → "Nepali slugs" checkbox.
 */
function nuc_register_settings(): void {
	register_setting(
		'writing',
		NUC_OPTION_SLUGS,
		array(
			'type'              => 'boolean',
			'sanitize_callback' => 'rest_sanitize_boolean',
			'default'           => false,
		)
	);
	add_settings_field(
		NUC_OPTION_SLUGS,
		__( 'Nepali slugs', 'nepali-unicode-converter' ),
		'nuc_render_slug_field',
		'writing',
		'default',
		array( 'label_for' => NUC_OPTION_SLUGS )
	);
}
add_action( 'admin_init', 'nuc_register_settings' );

function nuc_render_slug_field(): void {
	printf(
		'<label><input type="checkbox" id="%1$s" name="%1$s" value="1" %2$s> %3$s</label><p class="description">%4$s</p>',
		esc_attr( NUC_OPTION_SLUGS ),
		checked( (bool) get_option( NUC_OPTION_SLUGS ), true, false ),
		esc_html__( 'Create English URL slugs for posts with Nepali titles', 'nepali-unicode-converter' ),
		esc_html__( 'Example: "नेपाल समाचार" becomes /nepal-samachar/. Existing slugs are not changed.', 'nepali-unicode-converter' )
	);
}

/**
 * Template helper for themes: nuc_convert( 'g]kfn', 'preeti-to-unicode' ).
 */
function nuc_convert( string $text, string $mode ): string {
	return NepaliConverter::convert( $text, $mode );
}
