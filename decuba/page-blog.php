<?php 

$context = Timber::get_context();
$context['posts'] = Timber::get_posts();

$pinpost = get_field('pinned_post', 'options');
$pinnedPost = new TimberPost($pinpost[0]->ID);
$pinnedPostTint = get_field('pinned_post_tint', 'options');
$blogHeroBG = get_field('blog_herobackground', 'options');
$context['pinnedPost'] = $pinnedPost;
$context['blogHeroBG'] = $blogHeroBG;
$context['pinnedPostTint'] = ($pinnedPostTint / 100);

// $context['featuredPosts'] = get_field('featured_posts', 'options');
// $context['trendingPosts'] = get_field('trending_posts', 'options');

$arrayFilters = array();
$search = '';
$filter_active = false;

if(!empty($_GET["filter"]) ) {
	$arrayContentType[] = array( 'taxonomy' => 'category', 'field'    => 'slug', 'terms'    => $_GET["filter"]);
	$arrayFilters = array_merge($arrayFilters, $arrayContentType);
	$context['filter_active'] = true;
	$context['filter_name'] = $_GET["filter"];
	$filter_active = true;
} 

if (!empty($_GET["search"]) ) {
	$search = $_GET["search"];
	$context['filter_active'] = true;
	$context['filter_name'] = $_GET["search"];
	$filter_active = true;
}

$query = null;
if (!empty($arrayFilters)) {

	$query = array(
		'relation' => 'AND',
       	$arrayFilters
	);
}

$allpostsArgs = array(
	's' => $search,
    'post_type' => 'post',
    'ignore_sticky_posts' => false,
    'category__not_in' => array( 25 ),
    'posts_per_page' =>  $filter_active ? -1 : 11,
    'post__not_in' => array($pinnedPost->ID),
    'tax_query' => array(
    	$query
    )
);


$context['allPosts'] = new Timber\PostQuery($allpostsArgs);

Timber::render( array( 'page-templates/page-blog.twig' ), $context );
