<?php 

$context = Timber::get_context();
$context['posts'] = Timber::get_posts();
$templates = array( 'index.twig' );
if ( is_page() ) {
	array_unshift( $templates, 'page-templates/page.twig' );
}
Timber::render( $templates, $context );
