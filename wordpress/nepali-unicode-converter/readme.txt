=== Nepali Unicode Converter ===
Contributors: sprasapradip
Tags: nepali, preeti, unicode, converter, devanagari
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 8.1
Stable tag: 2.0.0
License: All rights reserved

Preeti ↔ Unicode and Romanized Nepali converter shortcode, plus optional English URL slugs for Nepali post titles.

== Description ==

* `[nepali_converter]` adds a converter to any post, page or widget.
* Modes: roman-to-unicode, preeti-to-unicode, unicode-to-preeti, unicode-to-roman, slug.
* Everything runs in the visitor's browser. No text is sent to any server.
* Optional: Settings → Writing → "Nepali slugs" turns "नेपाल समाचार" into /nepal-samachar/.
* Template helper: `nuc_convert( $text, 'preeti-to-unicode' )`.

== Shortcode examples ==

`[nepali_converter mode="preeti-to-unicode"]`
`[nepali_converter modes="preeti-to-unicode,unicode-to-preeti" lang="ne"]`
`[nepali_converter mode="roman-to-unicode" theme="dark"]`

== Changelog ==

= 2.0.0 =
* First release: shortcode, web component, Nepali slug option, template helper.
