<?php 

$context = Timber::get_context();
$context['post'] = $post;
$context['posts'] = Timber::get_posts();

if ($post->post_type === 'page') {
	$post_template = 'page-menu-global.twig';

	if (isset($_COOKIE['savedLocation']))
	{
		$cookieLocationStrip = stripslashes($_COOKIE['savedLocation']);
		$cookieLocation = json_decode($cookieLocationStrip, true);

		header('Location: ' . SITE_URL . $cookieLocation['link'] . $_SERVER['REQUEST_URI']);
	}

} else {
	$post_template = 'page-menu.twig';
}
Timber::render( array( 'page-templates/' . $post_template ), $context );
