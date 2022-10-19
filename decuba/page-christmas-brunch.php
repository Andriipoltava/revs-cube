<?php
	/*
	Template Name: Brunch-page
	Template Post Type: page, bar
	*/

	if (!class_exists('Timber')){
		echo 'Timber not activated. Make sure you activate the plugin in <a href="/wp-admin/plugins.php#timber">/wp-admin/plugins.php</a>';
		return;
	}

	$context = Timber::get_context();
	
	// Fetches Xmas Top level for Galleries
	$globalXmasPost = new TimberPost(713);
	$context['globalXmasPost'] = $globalXmasPost;

	$topParent = get_post(get_top_parent_id($post));
	if($post->post_type === "bar")
	{
		$context['bar'] = $topParent;
	}

	$menu_christmas = get_CMS_data($topParent, "christmas_menu_downloads");
	$context['barMenu_Christmas'] = $menu_christmas;

	$post = new TimberPost();
	$context['post'] = $post;
	$related_posts_args = array(
	    'post_type' => 'post',
	    'ignore_sticky_posts' => false,
	    'posts_per_page' =>  10,
	);
	$context['latest_feed'] = new Timber\PostQuery($related_posts_args);

	$templates = array('page-templates/page-christmas-brunch.twig');
	Timber::render($templates, $context);
