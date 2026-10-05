<?php
/**
 * Removes plugin options on uninstall.
 *
 * @package NepaliUnicodeConverter
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'nuc_romanize_slugs' );
