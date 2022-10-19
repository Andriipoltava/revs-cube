<?php 

// Assigning the global $post object here so we can access functions that require the WordPress post object, not the Timber post object
global $post;
$postObject = $post;

$context = Timber::get_context();
$post = Timber::query_post();
$context['post'] = $post;

$context['menu_type'] = get_query_var( 'decuba_menu_type' );
$context['menu_subtype'] = get_query_var( 'decuba_menu_subtype' );


$templates = array( 'single.twig' );

$relatedField = wp_get_post_terms($post->ID, 'category', array("fields" => "all"));

$query = array( 'taxonomy' => 'category', 'field'    => 'term_id' );
if(!empty($relatedField))
{
	$query['terms'] = $relatedField[0]->term_id;
}
$related_posts_args = array(
    'post_type' => $post->post_type,
    'ignore_sticky_posts' => false,
    'posts_per_page' =>  5,
    'category__not_in' => array( 25 ),
    'tax_query' => array(
    	$query
    )
);
$context['related_posts'] = new Timber\PostQuery($related_posts_args);


if ($post->post_type == 'bar') {
	$related_venue_posts_args = array(
		'post_type' => 'post',
		'posts_per_page' => -1,
		'post_status' => 'publish',
		 'category__not_in' => array( 25 ),
		'tax_query' => array(
			'relation' => 'OR',
			array(
				'taxonomy' => 'venue',
				'field' => 'slug',
				'terms' => $context['post'] -> slug,
			),
			array(
				'taxonomy' => 'venue',
				'field' => 'slug',
				'terms' => 'all',
			)
		)
	);
    // $context['tweets'] = get_tweets('DeCubaMCR');
    $context['related_venue_posts'] = Timber::get_posts($related_venue_posts_args);


	$bar = get_post(get_top_parent_id($postObject));
	$context['bar'] = $bar;
	$menu_cantina = get_CMS_data($bar, "cantina_main_menu_downloads");
	$context['menus_local_data'] = get_local_bar_data($bar);
	$context['barMenu_Cantina'] = $menu_cantina;
}


array_unshift( $templates,  'single-'.$post->post_type.'.twig');
if($post->post_parent !== 0 && $post->slug === 'menus') {
	array_unshift( $templates, 'page-templates/page-menu.twig');
} else if($post->post_parent !== 0 && $post->slug === 'christmas')  {
	array_unshift( $templates, 'page-templates/page-christmas.twig');
}

// Bar launches
if($post->post_type === 'bar')
{
	$topParent = post_to_array(get_top_parent_id($postObject) ?: $postObject);
	if(!empty($topParent['bar_template_folder']) && !empty($topParent['bar_template_folder']) && !empty($topParent['bar_launch_phase']))
	{
		$filename = $post->post_parent === 0 ? 'about' : $post->slug; 
		array_unshift( $templates,  'bar-templates/' . $topParent['bar_template_folder'] . '/' . $filename . '-' . $topParent['bar_launch_phase'] . '.twig');
	}
}

Timber::render( $templates, $context );

