<?php
	/*
	Template Name: Builder
	Template Post Type: page, bar
	*/

	if (!class_exists('Timber')){
		echo 'Timber not activated. Make sure you activate the plugin in <a href="/wp-admin/plugins.php#timber">/wp-admin/plugins.php</a>';
		return;
	}

	$context = Timber::get_context();
	$post = new TimberPost();

	$context['post'] = $post;
	$related_posts_args = array(
	    'post_type' => 'post',
	    'ignore_sticky_posts' => false,
	    'posts_per_page' =>  10,
	    'category__not_in' => array( 25 )
	);
	$context['latest_feed'] = new Timber\PostQuery($related_posts_args);

	$templates = array('page-templates/page-builder.twig');
	Timber::render($templates, $context);
