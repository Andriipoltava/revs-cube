<?php 

$context = Timber::get_context();
$context['post'] = new TimberPost();
$context['posts'] = Timber::get_posts();

if(!empty($_GET["lat"]) ) {
	$context['locationsSearch'] = true;
}

Timber::render( array( 'page-templates/page-' . $post->post_name . '.twig', 'page-templates/page.twig' ), $context );
