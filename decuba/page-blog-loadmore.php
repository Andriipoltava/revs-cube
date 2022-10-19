<?php 

$context = Timber::get_context();
$context['posts'] = Timber::get_posts();

 $offset = htmlspecialchars(trim($_GET['offset']));

if (!empty($_GET["offset"]) ) {
	$offset = $_GET["offset"];
} else {
	$offset = 0;
}

if (!empty($_GET["exclude"]) ) {
	$exclude = array($_GET["exclude"]);
} else {
	$exclude = array();
}

$loadmorepostsArgs = array(
    'post_type' => 'post',
    'ignore_sticky_posts' => false,
    'posts_per_page' =>  6,
    'category__not_in' => array( 25 ),
    'post__not_in' => $exclude,
    'offset' => $offset
);


$context['loadmorePosts'] = new Timber\PostQuery($loadmorepostsArgs);

Timber::render( array( 'page-templates/page-blog-loadmore.twig' ), $context );
