<?php
	/*
	Template Name: UI Kit
	Template Post Type: page, bar
	*/

	if (!class_exists('Timber')){
		echo 'Timber not activated. Make sure you activate the plugin in <a href="/wp-admin/plugins.php#timber">/wp-admin/plugins.php</a>';
		return;
	}

	$context = Timber::get_context();
	$post = new TimberPost();

	$context['post'] = $post;

	$templates = array('page-templates/ui-kit.twig');
	Timber::render($templates, $context);
