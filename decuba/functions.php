<?php

// PHP ====================================


/**
 * Create bespoke gform submit buttons
 */
/*
function gform_submit_button( $button, $form ) {
    return '<button class="button button--regular button--regular--pink">
				<span data-text="Submit">Submit</span>
			</button>';
}
add_filter( 'gform_submit_button_1', 'gform_submit_button', 10, 2 );
*/

// function gform_newsletter_submit_button( $button, $form ) {
//     return '<button class="button"></button>';
// }
// add_filter( 'gform_submit_button_3', 'gform_newsletter_submit_button', 10, 2 );


// Relationship fields with the name 'applies_to_posts'
// @return: Top-level posts only
function applies_to_posts_relationship_query( $args, $field, $post )
{
	if(in_array('bar', $field['post_type']))
	{
		$args['post_parent'] = 0;
	}

	$args['post_status'] = 'publish';
	$args['orderby'] = 'title';
	$args['order'] = 'ASC';

	return $args;
}
add_filter('acf/fields/relationship/query/name=applies_to_posts', 'applies_to_posts_relationship_query', 10, 3);


ini_get("allow_url_fopen");

function timeSince($time) {

    $since = time() - strtotime($time);

    $string     = '';

    $chunks = array(
        array(60 * 60 * 24 * 365 , 'y'),
        array(60 * 60 * 24 * 30 , 'mo'),
        array(60 * 60 * 24 * 7, 'w'),
        array(60 * 60 * 24 , 'd'),
        array(60 * 60 , 'h'),
        array(60 , 'm'),
        array(1 , 's')
    );

    for ($i = 0, $j = count($chunks); $i < $j; $i++) {
        $seconds = $chunks[$i][0];
        $name = $chunks[$i][1];
        if (($count = floor($since / $seconds)) != 0) {
            break;
        }
    }

    $string = $count . $name;

    return $string;

}

require_once dirname( __FILE__ ) . '/inc/get-tweets.php';

function register_venues_tax() {
    $labels = array(
        'name'                       => _x( 'Venues', 'Taxonomy General Name', 'text_domain' ),
        'singular_name'              => _x( 'Venue', 'Taxonomy Singular Name', 'text_domain' ),
        'menu_name'                  => __( 'Venues', 'text_domain' ),
        'all_items'                  => __( 'All Items', 'text_domain' ),
        'parent_item'                => __( 'Parent Item', 'text_domain' ),
        'parent_item_colon'          => __( 'Parent Item:', 'text_domain' ),
        'new_item_name'              => __( 'New Item Name', 'text_domain' ),
        'add_new_item'               => __( 'Add New Item', 'text_domain' ),
        'edit_item'                  => __( 'Edit Item', 'text_domain' ),
        'update_item'                => __( 'Update Item', 'text_domain' ),
        'view_item'                  => __( 'View Item', 'text_domain' ),
        'separate_items_with_commas' => __( 'Separate items with commas', 'text_domain' ),
        'add_or_remove_items'        => __( 'Add or remove items', 'text_domain' ),
        'choose_from_most_used'      => __( 'Choose from the most used', 'text_domain' ),
        'popular_items'              => __( 'Popular Items', 'text_domain' ),
        'search_items'               => __( 'Search Items', 'text_domain' ),
        'not_found'                  => __( 'Not Found', 'text_domain' ),
        'no_terms'                   => __( 'No items', 'text_domain' ),
        'items_list'                 => __( 'Items list', 'text_domain' ),
        'items_list_navigation'      => __( 'Items list navigation', 'text_domain' ),
    );
    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => true,
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => true,
        'show_tagcloud'              => true,
    );

    register_taxonomy( 'venue', array( 'post' ), $args );
}
add_action( 'init', 'register_venues_tax', 0 );

function populate_venues_tax() {
    $parent_term = term_exists( 'bar' ); // array is returned if taxonomy is given
    $parent_term_id = $parent_term['term_id']; // get numeric term id

    $places = array(
        'post_type' => 'bar',
        'posts_per_page' => -1,
    );

    wp_insert_term(
        'All Bars & Restaurants', // the term
        'venue', // the taxonomy
        array(
            'slug' => 'all',
            'parent'=> null
        )
    );

    $venues = Timber::get_posts($places);

    foreach ($venues as $place) {
        wp_insert_term(
            $place->name, // the term
            'venue', // the taxonomy
            array(
                'slug' => $place->slug,
                'parent'=> $parent_term_id
            )
        );
    }
}
add_action( 'init', 'populate_venues_tax', 0 );



// Timber / WP ============================

if ( ! class_exists( 'Timber' ) ) {
	add_action( 'admin_notices', function() {
		echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php') ) . '</a></p></div>';
	});
	
	add_filter('template_include', function($template) {
		return get_stylesheet_directory() . '/no-timber.html';
	});
	
	return;
}

Timber::$dirname = array('templates', 'views');

class DeCubaSite extends TimberSite {

	function __construct() {
		register_nav_menus( array(
			'primary' => esc_html__( 'Primary', 'main-overlay-menu' ),
			'footer' => esc_html__( 'Footer', 'footer-list-menu' ),
		) );

		add_theme_support('post-formats');
		add_theme_support('post-thumbnails');
		add_theme_support('menus');

		add_filter( 'timber_context', array( $this, 'add_to_context' ) );
		add_filter( 'get_twig', array( $this, 'add_to_twig' ) );
		
		// WP
		add_filter( 'init', array( $this, 'define_helpers' ) );
		add_filter( 'init', array( $this, 'store_tracking' ) );
		add_action( 'init', array( $this, 'register_post_types' ) );
		add_action( 'init', array( $this, 'register_taxonomies' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'decuba_enqueue_scripts' ) );
		add_filter( 'body_class', array( $this, 'add_slug_body_class' ) );

		// WPAdmin
		// add_filter('wp_handle_upload_prefilter', 'theme_uploads_filter' );
		add_filter('post_thumbnail_html', 'remove_width_attribute', 10 );
		// add_filter('image_send_to_editor', 'remove_width_attribute', 10 );


		parent::__construct();
	}

	// Auto add data to the context
	function add_to_context( $context ) {
		global $post;
		global $tracking;

		$places = array(
		    'post_type'      => 'bar',
		    'post_parent'    => 0,
		    'orderby'        => 'title',
		    'order'          => 'ASC',
		    'posts_per_page' => -1,
		);

		$context['menu'] = new TimberMenu();
		$context['primary_nav'] = new TimberMenu('primary');
		$context['footer_nav'] = new TimberMenu('footer');
		$context['site'] = $this;
		$blogNav = get_field('blog_nav_items', 'options');
		$context['blogCategories'] = Timber::get_terms('category', array('include' => $blogNav,'hide_empty' => true, 'exclude' => 25));
		$context['usersSetVenue'] = new TimberPost('21');
		$context['venues'] = Timber::get_posts($places);
		$context['currentVenue'] = new stdClass();
		$context['currentURL'] = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

		if(isset($post)) {
			$context['slug'] = $post->slug;
			$context['open_times'] = new TimberPost($post->ID);
		}

		// Are we forcing a new bar location
		if(isset($_GET['bar_id'])) 
		{
			$bar = get_posts(array(
				'numberposts' => 1,
				'post_type' => 'bar',
				'meta_key' => 'api_id',
				'meta_value' => $_GET['bar_id']
			));

			if(isset($bar[0]))
			{
				$bar = post_to_array($bar[0]);
				$data = json_encode(array(
					'cms_id' => $bar['ID'],
					'api_id' => $bar['api_id'],
					'name' => $bar['title'],
					'link' => rtrim(str_replace(home_url(), '', $bar['url']), '/'),
					'version' => COOKIE_VERSION
				));

				$_COOKIE['savedLocation'] = $data;
				setcookie("savedLocation", $data, time()+(60*60*24*150), '/');
			}
		}
		
		if (isset($post) && $post->post_parent !== 0) {
			// Sets Slugs for navigation based on child page.
			$parents = get_post_ancestors( $post->ID );
			$root = count($parents)-1;
			$parent = $parents[$root];

			$currentVenue = get_post($parent);

		} else if (isset($post) && $post->api_id) {
			// Sets Slugs for navigation based on Local bar page.
			$currentVenue = $post;
		}

		if(isset($currentVenue))
		{
			$args = array(
				'post_parent' => $currentVenue->ID,
				'post_type'   => 'bar',
				'posts_per_page' => -1,
				'post_status' => 'publish'
			);
			$subpages = wp_list_pluck( get_children($args), 'post_name');


			$context['currentVenue']->cms_id = $currentVenue->ID;
			$context['currentVenue']->api_id = get_field('api_id', $currentVenue->ID);
			$context['currentVenue']->name = $currentVenue->post_title;
			$context['currentVenue']->slug = '/bar/' . $currentVenue->post_name;
			$context['currentVenue']->subpages = $subpages;
		}

		$context['tracking'] = array(
			'utm_medium' => $tracking['utm_medium'],
			'utm_source' => $tracking['utm_source'],
			'utm_campaign' => $tracking['utm_campaign'],
			'utm_content' => $tracking['utm_content'],
			'offer_code' => $tracking['o'],
		);
		if($tracking['pid'] !== "emptypid") { $context["tracking"]['airship_contact_id'] = $tracking['pid']; }
		if($tracking['pe'] !== "emptype") { $context["tracking"]['email'] = $tracking['pe']; }


		return $context;
	}

	// Add your own functions to twig
	function add_to_twig( $twig ) {
		$twig->addExtension( new Twig_Extension_StringLoader() );
		return $twig;
	}
	
	function define_helpers( )
	{
		define("SITE_URL", get_bloginfo('url'));
		define("SITE_PROTOCOL", is_ssl() ? 'https://': 'http://');
		define("CURRENT_URL", SITE_URL.$_SERVER['REQUEST_URI']);
		define("COOKIE_VERSION", 2);

		// RIPPLE_API_URL NEEDS CHANGING BACK ONCE WE HAVE UAT / STAGING ENVIRONMENTS
		define("RIPPLE_API_URL", "https://api.revolutionbarsgroup.com/api/website.php");
//		define("RIPPLE_API_URL", strtolower(WP_ENV) === "production" ? "https://api.revolutionbarsgroup.com/api/website.php" : "http://staging-api.revolution-bars.co.uk/api/website.php");
		define("RIPPLE_API_KEY", "cb9301827291f946e8a8e3170991ee60");
		define("RIPPLE_BOOKING_API_URL", strtolower(WP_ENV) === "production" ? "https://api.revolutionbarsgroup.com/api/bookings.php" : "http://staging-api.revolution-bars.co.uk/api/bookings.php");
		define("RIPPLE_BOOKING_API_KEY", "gilrd7f23gdcf2cv8i24ofc723c823g9dc7g23cv8pw");

		define("RCLOUD_REST_API_URL", strtolower(WP_ENV) === "production" ? "https://api.revolutionbarsgroup.com/rest/" : "http://uat.api.revolution-bars.co.uk/rest/");
		define("RCLOUD_REST_API_KEY", "ZDY0MjYxNWY0NGZiMTVjNTcxMzRmYWNkNTE1OTJlNGUwMTAxNDY5NzBmM2QxNTAxYzlkNDdhNjZiZGMwYWFiZg==");

		define("GALLERY_API_URL", "https://revsgallery.teamcube.co.uk/api/gallery/");

		define("AIRSHIP_SOURCE_ID", "9787");
		define("AIRSHIP_USERNAME", "SOAP5afd91d4d7c37");
		define("AIRSHIP_PASSWORD", "5afd91d4d7c3c9.24931842");


		// Global Variables
		global $GLOB_THEME_STYLES;
		$GLOB_THEME_STYLES = array("script"=>array(), "no-script"=>array());


		// Ensure user cookie meets minimum required level
		if(isset($_COOKIE['savedLocation']))
		{
			$cookie = stripslashes($_COOKIE['savedLocation']);
			$cookie = json_decode($cookie, true);
			if(!array_key_exists('version', $cookie) || $cookie['version'] < COOKIE_VERSION)
			{
				unset($_COOKIE['savedLocation']);
				$res = setcookie('savedLocation', '', time() - 3600, '/');
			}
		}
	}

	// UTM tracking 
	function store_tracking()
	{
	  global $tracking;
	  $tracking = array(
	    'utm_medium' => 'emptymedium',
	    'utm_source' => 'emptysource',
	    'utm_campaign' => 'emptycampaign',
	    'utm_content' => 'emptycontent',
	    'pid' => 'emptypid',
	    'pe' => 'emptype',
	    'o' => 'emptyo',
	    'occid' => ''			// This should stay blank otherwise we'll try and init the form with an unregistered occasion
	  );


	  // Restore stored tracking but only for reference
	  $storedTracking = isset($_COOKIE['sourceTracking']) ? (array)json_decode(urldecode($_COOKIE['sourceTracking'])) : $tracking;


	  // If there's an offer mismatch, reset everything
	  if(isset($_GET['o']) && $_GET['o'] !== $storedTracking['o'])
	  {
	  	$storedTracking = $tracking;
	  }


	  // Should we store new tracking data
	  if(
	  		// Override unless this is an internal medium overriding an external medium...
	  		(isset($_GET['utm_medium']) &&
	  			( $_GET['utm_medium'] !== 'websitedirect' || empty($storedTracking['utm_medium']) || $storedTracking['utm_medium'] === 'websitedirect' || $storedTracking['utm_medium'] === 'emptymedium' ) )
	  		||  // ... or medium isn't set but any other data is (except occid)
	  		(!isset($_GET['utm_medium']) &&
	  		 	( isset($_GET['utm_source']) || isset($_GET['utm_campaign']) ||  isset($_GET['utm_content']) ||
	  		 		isset($_GET['pid']) || isset($_GET['pe']) || isset($_GET['o']) ) )
	  	)
	  {
	    if(isset($_GET['utm_medium'])) { $tracking['utm_medium'] = st_sanitize($_GET['utm_medium']); }
	    if(isset($_GET['utm_source'])) { $tracking['utm_source'] = st_sanitize($_GET['utm_source']); }
	    if(isset($_GET['utm_campaign'])) { $tracking['utm_campaign'] = st_sanitize($_GET['utm_campaign']); }
	    if(isset($_GET['utm_content'])) { $tracking['utm_content'] = st_sanitize($_GET['utm_content']); }
	    if(isset($_GET['pid'])) { $tracking['pid'] = st_sanitize($_GET['pid']); }
	    if(isset($_GET['pe'])) { $tracking['pe'] = st_sanitize($_GET['pe']); }
	    if(isset($_GET['o'])) { $tracking['o'] = st_sanitize($_GET['o']); }
	    if(isset($_GET['occid'])) { $tracking['occid'] = st_sanitize($_GET['occid']); }

	    setcookie("sourceTracking", urlencode(json_encode($tracking)), time()+(3600*24*7), '/'); // 7 days
	  }
	  // Otherwise, if existing data exists, restore it and fill in any missing keys
	  elseif(isset($_COOKIE['sourceTracking']))
	  {
	    $tracking = array_merge($tracking, $storedTracking );
	  }

	  // Store another cookie that contains the results of the above tests
	  // (note - don't put it back into "sourceTracking" or it might never expire)
	  // (pretty much used just for JS injections)
	   setcookie("liveSourceTracking", urlencode(json_encode($tracking)), 0, '/');

	   // Add to the context for booking form prepop
	   $context['tracking'] = $tracking;
	   if($tracking['pe'] !== "emptype"){ $context['tracking']['email'] = $tracking['pe']; }
	}


	// Register custom post types
	function register_post_types() {
	}

	// Register custom taxonomies
	function register_taxonomies() {
	}

	// Enqueue scripts
	function decuba_enqueue_scripts() {
		global $post;

		if (!is_admin()) {
		    wp_deregister_script('jquery');                 // De-Register jQuery
		    wp_register_script('jquery', '', '', '', true); // Register as 'empty', because we manually insert our script in html-header.twig
		    wp_enqueue_script('js-map', 'https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyAHC5P25Y-GcQO_cPX2usVmRmIK2tKcLIM');
	    	wp_enqueue_script('js-app', get_template_directory_uri() . '/build/js/main.min.js', array(), NULL);
	    	wp_enqueue_script('js-wistia', '//fast.wistia.net/assets/external/E-v1.js');
	    	wp_enqueue_script('js-wistia-plugin', '//fast.wistia.com/labs/crop-fill/plugin.js');
	    	wp_enqueue_script( 'revs-booking-widget', strtolower(WP_ENV) !== "production" ? 'https://book-uat.revoluciondecuba.com/js/bookings.js' : 'https://book.revoluciondecuba.com/js/bookings.js', array(), NULL );
			wp_localize_script('js-app', 'MyAjax', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ), 'resturl' => get_bloginfo('wpurl').'/api/' ) );
	    	wp_localize_script('js-app', 'Directory', array( 'url' => get_bloginfo('template_directory'), 'site' => get_bloginfo('wpurl'), 'home' => get_bloginfo('url')) );
			wp_localize_script('js-app', 'Environment', array( 'server' => WP_ENV));
			wp_localize_script('js-app', 'Bars', get_bar_meta());

			if ( isset($post) && $post->api_id ) {
				wp_localize_script('js-app', 'BarPageCMSID', '' . $post->api_id);
				wp_localize_script('js-app', 'BarPageAPIID', '' . $post->api_id);
			} else if (isset($post) && $post->post_parent)	{
				$ancestors=get_post_ancestors($post->ID);

				wp_localize_script('js-app', 'BarPageCMSID', '' . end($ancestors));
				if ($parent_api_id = get_field('api_id', end($ancestors))) {
					wp_localize_script('js-app', 'BarPageAPIID', '' . $parent_api_id);
				}
			}
			wp_localize_script('js-app', 'CookieVersion', '' . COOKIE_VERSION);
		}
	}


	// Page Slug Body Class
	function add_slug_body_class( $classes )
	{
		global $post;
		if ( isset($post) )
		{
			$classes[] = $post->post_type . '-' . $post->post_name;

			if($post->post_type === 'bar')
			{
				if($post->post_parent === 0)
				{
					$classes[] = $post->post_type . '-about';
				}
				else
				{
					$parents = array_reverse(get_post_ancestors($post->ID));
					$topParent = is_array($parents) && count($parents) > 0 ? $parents[0] : null;
					if(!is_null($topParent))
					{
						$topParentPost = get_post($topParent);
						$classes[] = $post->post_type . '-' . $topParentPost->post_name;
					}
				}
			}
		}

		return $classes;
	}


	// Limit asset upload sizes in WP Admin
	function theme_uploads_filter( $file )
	{
		switch ($file['type'])
		{
			case 'image/jpeg':
				$limit = 300*1024;			// 300KB
				break;
			case 'image/png':
				$limit = 450*1024;			// 450KB
				break;
			case 'image/gif':
				$limit = 1*1024*1024;		// 1MB
				break;
			default:
				$limit = 10*1024*1024;		// 10MB
				break;
		}

		if($file['size'] > $limit)
		{
			$file['error'] = 'The uploaded file is too big. The limit is ' . ($limit/1024) .  'KB so this file needs reducing by at least ' . ceil(100 * (1 - ($limit/$file['size']))) . '%.';
		}

		return $file;
	}

	// Don't output width / height attributes on images
	function remove_width_attribute( $html ) {
		 $html = preg_replace( '/(width|height)="\d*"\s/', "", $html );
		 return $html;
	}

}

new DeCubaSite();


// Permalinks ------------------

// Add page variables
function decuba_add_custom_page_variables( $public_query_vars ) 
{
	$public_query_vars[] = 'decuba_menu_type';
	$public_query_vars[] = 'decuba_menu_subtype';
	return $public_query_vars;
}
add_filter( 'query_vars', 'decuba_add_custom_page_variables' );

	// Add new tags, rules & permalinks
function decuba_add_rewrite_rules()
{
	// Register custom rewrite rules
	add_rewrite_rule(
		'(menus)/?([^/]+)?/?([^/]+)?/?',
		'index.php?pagename=$matches[1]&decuba_menu_type=$matches[2]&decuba_menu_subtype=$matches[3]',
		'top'
	);
	add_rewrite_rule(
		'bar/(.+?)/(menus)/?([^/]+)?/?([^/]+)?/?',
		'index.php?bar=$matches[1]%2F$matches[2]&decuba_menu_type=$matches[3]&decuba_menu_subtype=$matches[4]',
		'top'
	);
}
add_action('init', 'decuba_add_rewrite_rules');



// ACF Option Pages -----------------

if( function_exists('acf_add_options_page') ) {

	acf_add_options_page(array(
		'page_title' 	=> 'Theme Settings',
		'menu_title'	=> 'Theme Settings',
		'menu_slug' 	=> 'theme-options',
		'capability'	=> 'edit_posts',
		'redirect'		=> false
	));

	acf_add_options_sub_page(array(
		'page_title' => 'Blog Options',
		'menu_title' => 'Blog Options',
		'parent_slug' => 'theme-options'
	));

	acf_add_options_sub_page(array(
		'page_title' => 'Offers',
		'menu_title' => 'Offers',
		'parent_slug' => 'theme-options'
	));

	acf_add_options_sub_page(array(
		'page_title' => 'Party Offerings',
		'menu_title' => 'Party Offerings',
		'parent_slug' => 'theme-options'
	));

	acf_add_options_sub_page(array(
		'page_title' => 'Downloads',
		'menu_title' => 'Downloads',
		'parent_slug' => 'theme-options'
	));

	acf_add_options_sub_page(array(
		'page_title' => 'Site Footer',
		'menu_title' => 'Site Footer',
		'parent_slug' => 'theme-options'
	));

}

// ACF Option Global variable

add_filter( 'timber_context', 'acf_timber_options_context'  );

function acf_timber_options_context( $context ) {
    $context['options'] = get_fields('option');
    return $context;
}

// Blog read time function

function reading_time( $id ) {
    $content = get_post_field( 'post_content', $id );
    $word_count = str_word_count( strip_tags( $content ) );
    $readingtime = ceil($word_count / 200);

    if ($readingtime == 1) {
      $timer = " min";
    } else {
      $timer = " mins";
    }
    $totalreadingtime = $readingtime . $timer;

    return $totalreadingtime;
}

// Gravity Forms ==============================

// Remove tab index
add_filter( 'gform_tabindex', '__return_false' );


// Remove scripts on unnecessary pages
function remove_gravity_form_styles()
{
	wp_dequeue_style('gforms_reset_css');
	wp_dequeue_style('gforms_formsmain_css');
	wp_dequeue_style('gforms_ready_class_css');
	wp_dequeue_style('gforms_browsers_css');
}
add_action( 'wp_enqueue_scripts', 'remove_gravity_form_styles', 9999 );
add_action( 'gform_enqueue_scripts', 'remove_gravity_form_styles', 9999 );

// Get thr title of a grav form
function get_grav_form_title($form_id) 
{
  $forminfo = RGFormsModel::get_form($form_id);
  $form_title = $forminfo->title;
  return $form_title;
}

// Add to the markup
function edit_gravity_form_markup($form)
{
	if(is_array($form['fields']))
	{
		foreach ( $form['fields'] as &$field )
		{
			$class = " gfield--type--" . sanitize_title($field['type']) .
							 " gfield--name--" . sanitize_title($field['label']);

			if($field['type'] === 'date') 
			{ 
				$class .= " gfield--type--" . sanitize_title($field['dateType']);
			}

			if(!empty($field['placeholder']))
			{
				$class .= " gfield--has-placeholder";
			}

			$field['cssClass'] .= $class;
		}
	}

	return $form;
}
add_filter( 'gform_pre_render', 'edit_gravity_form_markup' );


// Prepop field values
function prepop_gravity_form_fields($form)
{
	require_once(locate_template('inc/forms/gravity-form-utilities.php'));
 	Gravity_Form_Utilities::prepopFormFromFieldClasses($form);
 	return $form;
}
add_filter( 'gform_pre_render', 'prepop_gravity_form_fields' );


// Use buttons instead of inputs
function form_submit_button( $button, $form )
{
	return "<button class='gform_submit' id='gform_submit_button_{$form['id']}'>
						<span data-text='{$form['button']['text']}'>{$form['button']['text']}</span>
					</button>";
}
add_filter( 'gform_submit_button', 'form_submit_button', 10, 2 );

// Use Text button for Newsletter
function form_submit_button_3( $button, $form )
{
	return "<button class='button button--text button--text--skyblue' id='gform_submit_button_{$form['id']}'>
						{$form['button']['text']}
					</button>";
}
add_filter( 'gform_submit_button_3', 'form_submit_button_3', 10, 2 );




// Change stored values
function change_save_value($value, $lead, $field, $form)
{
	$result = preg_match_all("|name--(\w+?)|U", $value, $matches);
	if($result && count($matches) >= 2)
	{
		$value = $matches[1][0];
	}
	return $value;
}
add_filter( 'gform_save_field_value', 'change_save_value', 10, 5 );



// Perform extra validation after submit 
function validate_form($validation_result)
{
	// Assume our local checks will all pass
	$isValid = true;


	// Add dependencies
	require_once(locate_template('inc/forms/gravity-form-utilities.php'));

  // Get the form object from the validation result
  $form = $validation_result["form"];



  // Validate the form using each fields class values
  $thisValid = Gravity_Form_Utilities::validateFormFromFieldClasses($form);

  // If the form failed validation, note it
  if (!$thisValid) { $isValid = false; }




	// Extra validation based on full data & form type
  // ===============================================


  // Validate the form using each fields class values
  $thisValid = Gravity_Form_Utilities::validateFormFromTypeAndData($form);

  // If the form failed validation, note it
  if (!$thisValid) { $isValid = false; }



	// Valid form - post to 3rd party systems
  // ======================================

  // If all validation flags are OK, try and post to 3rd party systems
	if($isValid && $validation_result['is_valid'])
	{
		$post_result = Gravity_Form_Utilities::postTo3rdPartySystems($form);
		$validation_result['is_valid'] = ($post_result === true);
	}
	// Otherwise, set main flag as invalid
	else
	{
		$validation_result['is_valid'] = false;
  }



  // Assign our modified $form object back to the validation result
  $validation_result['form'] = $form;

  // Return the validation result
  return $validation_result;
}
add_filter('gform_validation', 'validate_form');


// Change validation error message
function change_message($message, $form)
{
	global $gform_message;
  return !empty($gform_message) ? $gform_message : $message;
}
add_filter("gform_validation_message", "change_message", 10, 2);


// Auto-track submissions
function append_generic_form_tracking( $confirmation, $form, $entry, $ajax )
{
	// BE MINDFUL THAT SPECIAL CHARACTER WILL BE ESCAPED
	// e.g. '&&' will become '&amp;amp&amp;amp'

	$confirmation = <<<HTML
		<div data-gform-confirmation="{$form['id']}">
			{$confirmation}
			<div data-gform-script="">
				(function() {
					if(APP)
					{
						if(APP.hasOwnProperty('Mediator'))
						{
							APP.Mediator.publish("trackEvent", [
								"Form",
								"submitted",
								"gravity-form - {$form['id']} - {$form['title']}",
								0,
								false
							]);
						}
					}

					if(typeof window.fbq != 'undefined')
					{
						window.fbq('track', 'Form',
						{
							id: {$form['id']},
							title: '{$form['title']}',
							type: 'gravity-form',
							action: 'submitted'
						});
					}
				}());
			</div>
		</div>
HTML;
	return $confirmation;
}
add_filter( 'gform_confirmation', 'append_generic_form_tracking', 10, 4 );



// Advanced Custom Fields ==============================

// Stop repeatable fields returning 'false' on empty
function set_acf_empty_to_null( $value, $post_id, $field )
{
	switch($field['type'])
	{
		case 'gallery':
		case 'repeater':
		case 'flexible_content':
			if(!is_array($value) && !is_object($value))
			{
				$value = array();
			}
			break;
	}

	// return
	return $value;
}
// DEFINE FILTERS SEPARATELY OR THEY DON'T WORK
add_filter('acf/format_value/type=gallery', 'set_acf_empty_to_null', 999999, 3);
add_filter('acf/format_value/type=repeater', 'set_acf_empty_to_null', 999999, 3);
add_filter('acf/format_value/type=flexible_content', 'set_acf_empty_to_null', 999999, 3);


// Yoast ======================================

function yoast_change_description( $str )
{
	if(!empty($str)) { return $str; }

	global $post;
	$postArr = post_to_array($post);
	return $postArr['excerpt'];
}
add_filter( 'wpseo_metadesc', 'yoast_change_description', 10, 1 );


// Override the field that acts as the featured image if empty
function override_thumbnail($value, $object_id, $meta_key, $single ) {
	if($meta_key == '_thumbnail_id') {
		if($single) {
			$thisPost = get_post($object_id);
			if($thisPost->post_type === 'post')
			{
				$overviewImage = get_field('overview_image', $object_id);
				if($overviewImage)
				{
					$value = $overviewImage['ID'];
				}
			}
		}

		if(empty($value))
		{
			global $wpdb;
			$hasFeatured = $wpdb->get_var($wpdb->prepare(
				"
					SELECT meta_value
					FROM $wpdb->postmeta
					WHERE meta_key = %s
						AND post_id = %d
				", $meta_key, $object_id
			));

			if(!$hasFeatured)
			{
				$fallbackImage = get_field('default_thumbnail_image', 'options');
				if($fallbackImage)
				{
					$value = $fallbackImage['ID'];
				}
			}
			else
			{
				$value = $hasFeatured;
			}
		}
	}

	return $value;
}
add_filter('get_post_metadata', 'override_thumbnail', 10, 4);




// REVS BOOKING API ===========================

function postToBookingAPI($data, $include=null, $isComplete=false)
{
	if(WP_ENV === 'development')
	{
		header("Access-Control-Allow-Origin: *");
	}

	// Validate
	if($isComplete && empty($data['session_id'])) { return false; }

	// Build url
	$url = RCLOUD_REST_API_URL . "booking/session";
	if(!empty($include))
	{
		$url .= '?include=' . (is_array($include) ? implode(",", $include) : $include);
	}
	elseif($isComplete===TRUE)
	{
		$url .= "/complete";
	}

	// Post data
	$ch = curl_init();
	$postData = http_build_query($data);
	$timeout = 6;

	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

	curl_setopt($ch, CURLOPT_HTTPHEADER, ['ApiKey: ' . RCLOUD_REST_API_KEY]);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$server_output = curl_exec($ch);
	$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

	if($server_output === false)
	{
		report_curl_error($ch, $url, $postData);
	}

	curl_close($ch);


	// Response
	if ($status === 200)
	{
		return $server_output;
	}
	else
	{
		// var_dump($url);
		// var_dump($data);
		// var_dump($status);
		// var_dump($server_output);
		// exit;
		$output_obj = json_decode($server_output);
		if(is_object($output_obj) && property_exists($output_obj, 'errors'))
		{
			throw new \RuntimeException($output_obj->errors->message);
		}
	}

	return false;
}


function ajax_booking_request()
{
	$query_data = $_POST;
	$data = !empty($query_data['data']) ? $query_data['data'] : array();
	$include = !empty($query_data['include']) ? $query_data['include'] : '';
	$isComplete = !empty($query_data['isComplete']) && $query_data['isComplete'] === 'true';

	$response = postToBookingAPI($data, $include, $isComplete);


	// Return json ----------------

	if($response !== FALSE)
	{
		$response = json_decode($response);
		$response->request = $data;

		if($isComplete)
		{
			$bar = get_posts(array(
				'numberposts' => 1,
				'post_type' => 'bar',
				'meta_key' => 'api_id',
				'meta_value' => $response->data->bar->data->id
			));
			if(isset($bar[0]))
			{
				$response->CMS = new stdClass();
				$response->CMS->bar = post_to_array($bar[0]);
			}
		}
		$response = json_encode($response);

		header( "Content-Type: application/json" );
		echo $response;
	}

	die();
}
add_action('wp_ajax_booking_request', 'ajax_booking_request');
add_action('wp_ajax_nopriv_booking_request', 'ajax_booking_request');



// AJAX / CURL ================================


// Bar Meta
function get_bar_meta()
{
	$posts = get_posts(array(
		'numberposts' => -1,
		'offset' => 0,
		'orderby' => 'title',
		'order' => 'ASC',
		'post_type' => 'bar',
		'post_parent' => 0,
		'post_status' => 'publish'
	));

	$return = array();

	foreach ($posts as $post)
	{
		$args = array(
			'post_parent' => $post->ID,
			'post_type'   => 'bar',
			'posts_per_page' => -1,
			'post_status' => 'publish'
		);
		$subpages = wp_list_pluck( get_children($args), 'post_name');

		// Only use cache data - we don't want to curl in a loop
		// NOTE - use full data as nothing is generating the non-full version...so there's no cache
//		$partyProData = get_rest_api_data(get_field("api_id", $post->ID), "bar", false, true);
		$partyProData = get_rest_api_data(get_field("api_id", $post->ID), "bar", true, true);
		$partyProData = json_decode($partyProData);
		$partyProData = get_default($partyProData, 'data', array());

		$ray = array();
		$ray['id'] = $post->ID;
		$ray['api_id'] = (int)get_field('api_id', $post->ID);
		$ray['link'] = get_permalink($post->ID);
		$ray['slug'] = $post->post_name;
		$ray['bar_name'] = $post->post_title;
		$ray['address'] = get_default($partyProData, 'address', '');
		$ray['postcode'] = get_default($partyProData, 'postcode', '');
		$ray['phone'] = get_default($partyProData, 'phone', '');
		$ray['lat'] = get_default($partyProData, 'latitude', '');
		$ray['lng'] = get_default($partyProData, 'longitude', '');
		$ray['subpages'] = $subpages;
		$return[] = $ray;
	}

	return $return;
}

// Get bar data from Party Pro caches.
// NOTE - this isn't used on the site. It's a
// utility function used in dev when needed
function get_partypro_bar_data()
{
	$posts = get_posts(array(
		'numberposts' => -1,
		'offset' => 0,
		'orderby' => 'title',
		'order' => 'ASC',
		'post_type' => 'bar',
		'post_parent' => 0,
		'post_status' => 'publish'
	));

	foreach ($posts as $post)
	{
		// Only use cache data - we don't want to curl in a loop
		$data = get_rest_api_data(get_field("api_id", $post->ID), "bar", false, true);
		$data = json_decode($data, true);
		$r = $data['result'];
		// echo $r['barName'] . "|" . trim(preg_replace( "/\r|\n/", "", $r['address'] )) . "|" . $r['postCode'] . "|" . $r['telephone'] . "|" . $r['email'] . "\r\n";
	}

	exit;
}



// Gets the data from a URL
function get_data($url, $postData = false, $headers = false)
{
	$ch = curl_init();
	$timeout = 6;
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

	if($postData)
	{
		curl_setopt($ch,CURLOPT_POST, count($postData));
		curl_setopt($ch,CURLOPT_POSTFIELDS, $postData);
	}

	if($headers)
	{
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	}

	$data = curl_exec($ch);

	if($data === false)
	{
		report_curl_error($ch, $url, $postData);
	}


	curl_close($ch);
	return $data;
}


// Notify curl errors

function report_curl_error($ch, $url, $postData = null)
{
	$error = curl_error($ch);
	$postString = is_array($postData) ? json_encode($postData) : $postData;
	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$errorNumber = curl_errno($ch);

	// Log the error ------
	$message = "Curl error|" . $error . "|Curl error no|" . $errorNumber . "|HTTP code|" . $httpCode . "|Curl Url|" . $url . "|Curl Data|" . $postString . "|Theme|V2.0|Request|" . $_SERVER['REQUEST_URI'];
	error_log($message);

	// Is it a resolve error?
	if($errorNumber == CURLE_OPERATION_TIMEOUTED)
	{
		$urlDomain = parse_url($url, PHP_URL_HOST);
		$ip = gethostbyname($urlDomain);
		error_log("Follow up test to resolve " . $url . " returned: " . ($ip === false ? "FALSE" : $ip));
	}

	// Email the error? ------
	$ignoreErrorCodes = array(
//		CURLE_OPERATION_TIMEOUTED,
	);
	if(defined('SUPPORT_EMAIL') && !empty(SUPPORT_EMAIL) && !in_array($errorNumber, $ignoreErrorCodes))
	{
		wp_mail(SUPPORT_EMAIL, get_bloginfo('name') . " - " . WP_ENV . " - curl error", $message);
	}
}


// Notify SOAP errors

function report_soap_error($sf, $url, $postData = null)
{
	$error = $sf->getMessage();
	$postString = is_array($postData) ? json_encode($postData) : $postData;
	$errorNumber = $sf->getCode();

	// Log the error ------
	$message = "SOAP error|" . $error . "|SOAP error no|" . $errorNumber . "|SOAP URL|" . $url . "|SOAP Data|" . $postString . "|Theme|V2.0|Request|" . $_SERVER['REQUEST_URI'];
	error_log($message);

	// Email the error? ------
	$ignoreErrorCodes = array(

	);
	if(defined('SUPPORT_EMAIL') && !empty(SUPPORT_EMAIL) && !in_array($errorNumber, $ignoreErrorCodes))
	{
		wp_mail(SUPPORT_EMAIL, get_bloginfo('name') . " - " . WP_ENV . " - SOAP error", $message);
	}
}


// Get API data -----------------
function get_api_data($apiId, $method, $cacheOnly = false)
{

	// Get bar name by API ID ---------------

	$barName = "global";

	if($apiId !== -1)
	{
		$bar = get_posts(array(
			'numberposts' => 1,
			'post_type' => 'bar',
			'meta_key' => 'api_id',
			'meta_value' => $apiId
		));

		if(!isset($bar[0]))
		{
			return json_encode(array(
				"error" => "Bar not found"
			));
		}
		$bar = $bar[0];
		$barName = $bar->post_name;
	}


	// Can we get from the cache? --------

	$upload_dir = wp_upload_dir();
	$cacheFile = $upload_dir['basedir'] . '/theme_caches/bar/' . $barName . '/' . $method . '.txt';


	// Check cache first
	$cacheTime = strtolower(WP_ENV) === "production" ? 10 : 0;	// 10 minutes
	$cacheFileCreated	= ((file_exists($cacheFile))) ? filemtime($cacheFile) : 0;

//	if (!is_user_logged_in() && (time() - (60 * $cacheTime)) < $cacheFileCreated)		// 10 minute cache
	if ((time() - (60 * $cacheTime)) < $cacheFileCreated)		// 10 minute cache
	{
		// Display from the cache.
		$data = unserialize(file_get_contents($cacheFile));
	}



	// Otherwise, retrieve them & cache ---------
	else
	{
		$data = array();

		if(!$cacheOnly)
		{
			$postData = array(
				"jsonrpc" => "2.0",
				"method" => "get" . ucfirst($method),
				"id" => 1,
				"params" => array(
					"apiKey" => RIPPLE_API_KEY,
					"barId" => $apiId
				)
			);

			// Add extra data for getBarInfo request
			if($method === "barInfo")
			{
				$postData["params"] = array_merge(
					array(
						"start_date" => date("Y-m-d"),
						"end_date" => date("Y-m-d", strtotime("+4 weeks"))
					), $postData["params"]
				);
			}


			// Get the data
			$data = get_data(RIPPLE_API_URL, json_encode($postData));
			$data = json_decode($data);
		}


		if(!empty($data) && empty($data->error) && !empty($data->result))
		{
			// Initialise an empty object which can be used to add extra
			// CMS-based data outside of this generic function
			// (mainly for whilst we're still injecting content via JS)
			$data->CMS = new stdClass();
			$data = json_encode($data);


			// Create directory if not exists
			// if(!is_user_logged_in())
			// {
				if(!file_exists(dirname($cacheFile)))
				{
					mkdir(dirname($cacheFile), 0777, true);
				}

				// Generate a new cache file.
				$file = fopen($cacheFile, 'w');

				// Save the contents to the file.
				fwrite($file, serialize($data));
				fclose($file);
			// }
		}


		// Fallback to outdated cache
		elseif(file_exists($cacheFile))
		{
			$data = unserialize(file_get_contents($cacheFile));
		}

		// Fallback to error
		else
		{
			$data = json_encode(array(
				"error" => "No data and no cache"
			));
		}
	}

	return $data;
}



// Get REST API data -----------------
function get_rest_api_data($apiId, $method, $full = false, $cacheOnly = false)
{
	// Param fixes
	if(!is_bool($full)) { $full = false; }
	$suffix = $full ? "full" : "core";
	$includes = $full ? array('flags', 'brand', 'menu_band', 'food_menu', 'drink_menu', 'party_menu', 'events') : array();


	// Get bar name by API ID ---------------

	$barName = "global";

	if($apiId !== -1)
	{
		$bar = get_posts(array(
			'numberposts' => 1,
			'post_type' => 'bar',
			'meta_key' => 'api_id',
			'meta_value' => $apiId
		));

		if(!isset($bar[0]))
		{
			return json_encode(array(
				"error" => "Bar not found"
			));
		}
		$bar = $bar[0];
		$barName = $bar->post_name;
	}


	// Can we get from the cache? --------

	$upload_dir = wp_upload_dir();
	$cacheFile = $upload_dir['basedir'] . '/theme_caches/bar/' . $barName . '/' . $method . '-' . $suffix . '.txt';


	// Check cache first
	$cacheTime = strtolower(WP_ENV) === "production" ? 10 : 0;	// 10 minutes
	$cacheFileCreated	= ((file_exists($cacheFile))) ? filemtime($cacheFile) : 0;

//	if (!is_user_logged_in() && (time() - (60 * $cacheTime)) < $cacheFileCreated)		// 10 minute cache
	if ((time() - (60 * $cacheTime)) < $cacheFileCreated)		// 10 minute cache
	{
		// Display from the cache.
		$data = unserialize(file_get_contents($cacheFile));
	}



	// Otherwise, retrieve them & cache ---------
	else
	{
		$data = array();

		if(!$cacheOnly || !file_exists($cacheFile))
		{
			$getData = array(
				"bar_id" => $apiId,
				"include" => implode(",", $includes)
			);

			// Get the data
			$url = RCLOUD_REST_API_URL . $method . "?" . http_build_query($getData);
			$headers = array('ApiKey: ' . RCLOUD_REST_API_KEY);
			$data = get_data($url, false, $headers);
			$data = json_decode($data);
		}


		if(!empty($data) && empty($data->errors) && !empty($data->data))
		{
			// Initialise an empty object which can be used to add extra
			// CMS-based data outside of this generic function
			// (mainly for whilst we're still injecting content via JS)
			$data->CMS = new stdClass();
			$data = json_encode($data);


			// Create directory if not exists
			// if(!is_user_logged_in())
			// {
				if(!file_exists(dirname($cacheFile)))
				{
					mkdir(dirname($cacheFile), 0777, true);
				}

				// Generate a new cache file.
				$file = fopen($cacheFile, 'w');

				// Save the contents to the file.
				fwrite($file, serialize($data));
				fclose($file);
			// }
		}


		// Fallback to outdated cache
		elseif(file_exists($cacheFile))
		{
			$data = unserialize(file_get_contents($cacheFile));
		}

		// Fallback to error
		else
		{
			$data = json_encode(array(
				"error" => "No data and no cache"
			));
		}
	}

	return $data;
}


function get_local_bar_data($bar)
{
	$r = new stdClass();
	$r->id = $bar->ID;
	$r->bar = $bar;
	$r->apiId = get_CMS_data($bar, "api_id");;
	$r->link = get_permalink($bar->ID);
	$r->slug = $bar->post_name;
	$r->happy_hour_times = get_CMS_data($bar, "happy_hour_times");
	$r->cantina_main_menu_download = get_CMS_data($bar, "cantina_main_menu_downloads");
	$r->cantina_specials_menu_download = get_CMS_data($bar, "cantina_specials_menu_downloads");
	$r->cantina_2_courses_download = get_CMS_data($bar, "cantina_2_courses_downloads");
	$r->cantina_6_lunch_download = get_CMS_data($bar, "cantina_6_lunch_downloads");
	$r->cantina_taco_tuesday_download = get_CMS_data($bar, "cantina_taco_tuesday_downloads");
	$r->cantina_kids_download = get_CMS_data($bar, "cantina_kids_downloads");
	$r->cantina_brunch_menu_download = get_CMS_data($bar, "cantina_brunch_menu_downloads");
	$r->cantina_cuban_icons_menu_download = get_CMS_data($bar, "cuban_icons_menu_downloads");
	$r->cocktails_main_menu_download = get_CMS_data($bar, "cocktails_main_menu_downloads");
	$r->cocktails_specials_menu_download = get_CMS_data($bar, "cocktails_specials_menu_downloads");
	$r->fiesta_cantina_packages_download = get_CMS_data($bar, "fiesta_cantina_packages_downloads");
	$r->fiesta_drinks_packages_download = get_CMS_data($bar, "fiesta_drinks_packages_downloads");
	$r->christmas_menu_download = get_CMS_data($bar, "christmas_menu_downloads");
	$r->openingtimes = get_CMS_data($bar, "open_times");
	$r->listing_image = get_CMS_data($bar, "hero__slides");
	$r->deliveroo_page = get_CMS_data($bar, "deliveroo_bar_url");
    $r->just_eat_page = get_CMS_data($bar, "just_eat_bar_url");

	return $r;
}


// Get CMS data
function get_CMS_data($post, $field = null, $hasFallback = false, $fromChildSlug = false)
{
	$data = null;

	if(is_numeric($post)) { $postID = $post; $post = get_post($postID); }
	elseif(is_array($post)) { $postID = $post['ID']; $post = get_post($postID); }
	elseif(is_object($post)) { $postID = $post->ID; }
	else { return false; }


	// Get data from the CMS
	switch ($field)
	{
		// If these are bar-level menu downloads...
		case "cantina_main_menu_downloads":
		case "cantina_specials_menu_downloads":
		case "cantina_2_courses_downloads":
		case "cantina_6_lunch_downloads":
		case "cantina_taco_tuesday_downloads":
		case "cantina_kids_downloads":
		case "cantina_brunch_menu_downloads":
		case "cuban_icons_menu_downloads":
		case "cocktails_main_menu_downloads":
		case "cocktails_specials_menu_downloads":
		case "fiesta_cantina_packages_downloads":
		case "fiesta_drinks_packages_downloads":
		case "christmas_menu_downloads":
			$data = get_post_option_data($field, $post);
			break;

		case "happy_hour_times":
			$data = get_field($field, $postID);
			if(empty($data))
			{
				$data = get_post_option_data('happy_hour_groups', $post, $field);
			}
			break;

		// Otherwise...
		default:

			// Does the data exist in a subpage (e.g food-menu, whats-on, etc..)
			if(is_string($fromChildSlug))
			{
				$args = array(
					'name'				=> $fromChildSlug,
					'post_type'		=> $post->post_type,
					'post_status' => 'publish',
					'numberposts' => 1,
					'post_parent' => $postID
				);
				$postChild = get_posts($args);

				if(is_array($postChild) && !empty($postChild))
				{
					$postChild = $postChild[0];
					$postID = $postChild->ID;
				}
			}

			// Get bar's field value
			if(!is_null($field))
			{
				$data = get_field($field, $postID);
			}

			// If nothing found, use the fallback if exists
			if(empty($data) && $hasFallback === true)
			{
				$data = get_field($field, 'options');
			}

			break;
	}

	return $data;
}


// Get bar menu data -------------------
function get_post_option_data($field, $post, $key = 'download', $returnFull = false)
{
	$rawData = get_field($field, 'options');
	if(!$rawData) return null;

	$return = null;
	foreach ($rawData as $data)
	{
		if(empty($data['applies_to_posts'])) { continue; }

		foreach($data['applies_to_posts'] as $bar)
		{
			$barID = is_numeric($bar) ? $bar : $bar->ID;
			if($barID === $post->ID)
			{
				if($key === 'download' && is_numeric($data[$key]))
				{
					$data[$key] = array(
						'url' => wp_get_attachment_url( $data[$key] )
					);
				}
				if($returnFull === true)
				{
					$return = $data;
					unset($return['applies_to_posts']);
				}
				else
				{
					$return = $data[$key];
				}

				break;
			}
		}
	}

	return $return;
}


// Get Gallery data -----------------
function get_gallery_data($apiId, $method, $galleryId = null)
{

	// Get bar name by API ID ---------------

	$barName = "global";

	if($apiId !== -1)
	{
		$bar = get_posts(array(
			'numberposts' => 1,
			'post_type' => 'bar',
			'meta_key' => 'api_id',
			'meta_value' => $apiId
		));

		if(!isset($bar[0]))
		{
			return json_encode(array(
				"error" => "Bar not found"
			));
		}
		$bar = $bar[0];
		$barName = $bar->post_name;
	}


	// Can we get from the cache? --------

	$upload_dir = wp_upload_dir();
	$cacheFile = $upload_dir['basedir'] . '/theme_caches/bar/' . $barName . '/' . $method	. (is_null($galleryId) ? '' : '-' . $galleryId) . '.txt';

	// Check cache first
	$cacheTime = strtolower(WP_ENV) === "production" ? 10 : 0;	// 10 minutes
	$cacheFileCreated	= ((file_exists($cacheFile))) ? filemtime($cacheFile) : 0;

	if ((time() - (60 * $cacheTime)) < $cacheFileCreated)		// 10 minute cache
	{
		// Display from the cache.
		$data = unserialize(file_get_contents($cacheFile));
	}



	// Otherwise, retrieve them & cache ---------
	else
	{
		$getData = array(
		);

		// Add request data
		switch ($method)
		{
			case "bar_galleries" :
				$getData["bar"] = $barName;
				break;

			case "gallery_images" :
				$getData["gallery_id"] = $galleryId;
				break;
		}


		// Get the data
		$data = get_data(GALLERY_API_URL . $method . "/?" . http_build_query($getData));
		$data = json_decode($data);

		if(!empty($data) && $data->status === "ok")
		{
			// Initialise an empty object which can be used to add extra
			// CMS-based data outside of this generic function
			// (mainly for whilst we're still injecting content via JS)
			$data->CMS = new stdClass();
			$data = json_encode($data);


			// Create directory if not exists
			if(!file_exists(dirname($cacheFile)))
				mkdir(dirname($cacheFile), 0777, true);

			// Generate a new cache file.
			$file = fopen($cacheFile, 'w');

			// Save the contents to the file.
			fwrite($file, serialize($data));
			fclose($file);
		}


		// Fallback to outdated cache
		elseif(file_exists($cacheFile))
		{
			$data = unserialize(file_get_contents($cacheFile));
		}

		// Fallback to error
		else
		{
			$data = json_encode(array(
				"error" => "No data and no cache"
			));
		}
	}

	return $data;
}


add_action('wp_ajax_get_bar_data', 'ajax_get_bar_data');
add_action('wp_ajax_nopriv_get_bar_data', 'ajax_get_bar_data');
function ajax_get_bar_data()
{
	$query_data = $_GET;
	$apiId = $_GET['api_id'];
	$dataType = !empty($_GET['data_type']) ? $_GET['data_type'] : null;
	$cacheOnly = !empty($_GET['cache_only']) ? $_GET['cache_only'] : false;
	$bar = null;
	$method = null;

	// If we have a bar ID, find the bar
	$bar = get_posts(array(
		'numberposts' => 1,
		'post_type' => 'bar',
		'meta_key' => 'api_id',
		'meta_value' => $apiId
	));

	if(isset($bar[0]))
	{
		$bar = $bar[0];
	}
	else
	{
		header( "Content-Type: application/json" );
		echo json_encode(array( "error" => "Bar not found" ));
		die();
	}


	switch ($dataType)
	{
		case "galleries" :
			$method = "bar_galleries";
			$data = get_gallery_data($apiId, $method);
			break;

		case "gallery" :
			$method = "gallery_images";
			$galleryId = $_GET['gallery_id'];
			$data = get_gallery_data($apiId, $method, $galleryId);
			break;

		default :
			$method = "bar";
			$data = get_rest_api_data($apiId, $method, true, $cacheOnly);
			break;
	}

	// Get the data -------------

	$data = json_decode($data);

	if(!empty($data) && empty($data->error))
	{

		// Push any bespoke data in
		// (shouldn't this be cached too!!)
		switch ($method)
		{
			case "galleries" :
			case "gallery" :
				break;

		default :
				$data->CMS = get_local_bar_data($bar);
				break;
		}
	}

	$data=json_encode($data);


	// Return json ----------------

	header( "Content-Type: application/json" );
	echo $data;

	die();
}


/*
// DEPRECATED - use the "Bars" global instead
// ==========================================
add_action('wp_ajax_get_all_bar_data', 'ajax_get_all_bar_data');
add_action('wp_ajax_nopriv_get_all_bar_data', 'ajax_get_all_bar_data');
function ajax_get_all_bar_data()
{
	$posts = get_posts(array(
		'numberposts' => -1,
		'offset' => 0,
		'orderby' => 'title',
		'order' => 'ASC',
		'post_type' => 'bar',
		'post_parent' => 0,
		'post_status' => 'publish'
	));
	$r = array();

	foreach ($posts as $post)
	{
		// Only use cache data - we don't want to curl in a loop
		$data = get_rest_api_data(get_field("api_id", $post->ID), "bar", false, true);
		$data = json_decode($data);
		$data->CMS = get_local_bar_data($post);
		$r[] = $data;
	}

	$data = json_encode($r);


	// Return json ----------------

	header( "Content-Type: application/json" );
	echo $data;

	die();
}
*/


/**
 * Get Posts (AJAX)
 */
function ajax_get_posts()
{
	$query_data = $_GET;
	$limit = $query_data['limit'] ?: 20;
	$offset = $query_data['offset'] ?: 0;
	$category = $query_data['category'] ?: null;
	$exclude = explode(',', $query_data['exclude']) ?: array();



	// Get Listings

	$args = array(
	  'post_type' => 'post',
	  'posts_per_page' => $limit,
		'offset'	=> $offset,
	  'post_status' => current_user_can( 'edit_posts' ) ? array('publish', 'pending', 'draft') : 'publish',
	  'exclude' => $exclude
	 );

	if(!empty($category))
	{
		$args['cat'] = $category;
	}


	$thisPosts = post_array_to_array( get_posts( $args ));

	if(empty($thisPosts))
	{
		$thisPosts = array();
	}
	else
	{
		// Clean-up data (we don't want unnecessary user data transmitting!)
	}


	// Return json

	header( "Content-Type: application/json" );
	echo json_encode($thisPosts);

	die();
}
add_action('wp_ajax_get_posts', 'ajax_get_posts');
add_action('wp_ajax_nopriv_get_posts', 'ajax_get_posts');




// HELPERS ====================================

// Creates unique class modifiers
function umod()
{
	return dechex(rand());
}


// Set defaults when array key is empty
function get_default($array, $key, $default)
{
	if(is_object($array)) { $array = (array)$array; }
	return isset($array[$key]) ? $array[$key] : $default;
}


// Make Slug
function make_slug($title)
{
	$slug = strtolower($title);
	$slug = iconv('UTF-8', "us-ascii//TRANSLIT//IGNORE", $slug);	// Remove non-ascii characters
	$slug = preg_replace("/[^a-zA-Z 0-9]+/i", "", $slug);			// Remove non characters
	$slug = preg_replace("/\s/i", "-", $slug);					// Replace spaces
	$slug = preg_replace("/(\-){2,}/i", "-", $slug);		// Replace consecutive hyphens with one
	$slug = preg_replace("/^(\-){1,}/i", "", $slug);		// Trim hyphens
	$slug = preg_replace("/(\-){1,}$/i", "", $slug);		// Trim hyphens

	return $slug;
}


// Get the image size URL from an ACF field
// with an unknown return type.
function image_src($image, $size = 'large')
{
	// Already have a string
	if(is_string($image))
	{
		return $image;
	}


	// Have an ID?
	if(is_numeric($image))
	{
		$imgObj = wp_get_attachment_image_src( $image, $size );
		return $imgObj[0];
	}


	// Have an array?
	if( is_array($image) )
	{
		if(array_key_exists($size, $image))
		{
			return $image[$size];
		}
		elseif($size === 'full' && array_key_exists('url', $image))
		{
			return $image['url'];
		}
		elseif( array_key_exists('sizes', $image))
		{
			return image_src($image['sizes'], $size);
		}
	}


	// Have an object?
	if( is_object($image) && property_exists($image, 'id') )
	{
		if($size === 'full')
		{
			return $image->url;
		}
		else
		{
			return image_src($image->sizes, $size);
		}
	}


	// God knows that we're left with
	return false;
}


/**
 * Use this to filter 'null' values out of ACF fields
 *
 * Note: 'null' in the context of ACF can mean
 * multiple things. e.g. ACF returns false on
 * 'not set' but false may also be a valid value.
 * If this causes excessive filtering, try switching
 * off "strong filtering".
 */
function acf_filter($arr, $strongFilter = true)
{
	return array_filter($arr, function($var) use($strongFilter)
	{
		return !is_null($var) &&
						$var !== "" &&
						(!is_array($var) || (is_array($var) && !empty($var))) &&
						($strongFilter !== true || ($var !== false && $var !== '0'));
	}) ?: array();
}

// Get top parent ID
function get_top_parent_id($post = null)
{
	if(is_null($post)) { global $post; }

	if($post)
	{
		if($post->ancestors){
			$ancestors = $post->ancestors;
			return end($ancestors);
		} else {
			return $post->ID;
		}
	}
	else
	{
		return false;
	}
}

// Convert a post object to an array of data
function post_to_array($post_obj, $full = true)
{
	if(is_numeric($post_obj)) { $post_obj = get_post($post_obj); }
	if(!is_object($post_obj)) { return; }

	$thisPost['ID'] = $post_obj->ID;
	$thisPost['url'] = get_permalink($post_obj->ID);
	$thisPost['title'] = $post_obj->post_title;
	$thisPost['slug'] = $post_obj->post_name;
	$thisPost['excerpt'] = $post_obj->post_excerpt ?: wp_trim_words($post_obj->post_content);
	$thisPost['body_text'] = $post_obj->post_content;
	$thisPost['body_text'] = apply_filters('the_content', $thisPost['body_text']);
	$thisPost['body_text'] = str_replace(']]>', ']]&gt;', $thisPost['body_text']);
	$thisPost['featured_image'] = intval(get_post_thumbnail_id($post_obj->ID));
	$thisPost['author'] = get_user_by('ID', get_post_field ('post_author', $post_obj->ID));
	$thisPost['first_published'] = $post_obj->post_date;
	$thisPost['human_first_published'] = human_time_diff( strtotime($post_obj->post_date) );
	$thisPost['formatted_first_published']= date(get_option( 'date_format' ), strtotime($post_obj->post_date));
	$thisPost['top_parent_id'] = get_top_parent_id($post_obj);

	$cats = get_the_category($post_obj->ID);
	$keys = wp_list_pluck($cats, 'slug');
	$thisPost['categories'] = array_combine($keys, array_values($cats));
	$thisPost['category'] = count($cats) > 0 ? $cats[0] : null;
	if(!empty($thisPost['category'])) { $thisPost['category']->url = esc_url(get_category_link( $thisPost['category']->term_id)); }


	$fields = get_fields($post_obj->ID);
	if($full === true && $fields) { $thisPost = array_merge(acf_filter($fields), $thisPost); }

	return $thisPost;
}


// Convert an array of post objects to an array of arrays
function post_array_to_array($post_obj_arr, $full = true)
{
	if(!is_array($post_obj_arr)) { return; }

	$arr = array();
	foreach($post_obj_arr as $post_obj)
	{
		$arr[] = post_to_array($post_obj, $full);
	}
	return $arr;
}


// Get all data from a post type as a post array
function get_post_type_array($postType, $full = true)
{
	$posts = get_posts(array(
		'post_type' => $postType,
		'post_status' => 'publish',
		'posts_per_page' => -1
	));

	return post_array_to_array($posts, $full);
}




// SANITIZATION ===============================

// Filter missing ("empty") parameters out of key / value arrays
function null_filter($arr)
{
	return !is_array($arr) ? array() : array_filter($arr, function($var)
	{
		return !is_null($var) &&
						$var !== "" &&
						(!is_array($var) || (is_array($var) && !empty($var)));
	}) ?: array();
}

function sanitizeSettings($arr)
{
	if(array_key_exists('occasion_dropdown', $arr))
	{
		foreach($arr['occasion_dropdown'] as &$item)
		{
			$item['value'] = intval($item['value']);
		}
	}
	return $arr;
}

// URL output
function url_sanitize($str)
{
	return filter_var(filter_var($str, FILTER_SANITIZE_URL), FILTER_SANITIZE_SPECIAL_CHARS);
}

// Source Tracking
function st_sanitize($str)
{
	return filter_var($str, FILTER_SANITIZE_SPECIAL_CHARS);
}

// Javascript
function js_sanitize($str)
{
//	return filter_var(json_encode($str), FILTER_SANITIZE_SPECIAL_CHARS);
	return filter_var($str, FILTER_SANITIZE_SPECIAL_CHARS);
}


function truncate($string,$length=100,$append="&hellip;") {
    $string = trim($string);

    if(strlen($string) > $length) {
        $string = wordwrap($string, $length);
        $string = explode("\n", $string, 2);
        $string = $string[0] . $append;
    }

    return $string;
}
