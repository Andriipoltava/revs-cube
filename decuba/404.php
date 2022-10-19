<?php 

$context = Timber::get_context();


// Cache paths
ini_get("allow_url_fopen");
$upload_dir = wp_upload_dir();
$cacheFile = $upload_dir['basedir'] . '/404.txt';

// Create directory if not exists
if(!file_exists(dirname($cacheFile))) {
	mkdir(dirname($cacheFile), 0777, true);
}

// Generate a new cache file and open for appending
$protocol = $_SERVER['HTTPS'] == 'on' ? 'https' : 'http';
$path = $protocol.'://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'] . PHP_EOL;
$file = fopen($cacheFile, 'a');

// Save the contents to the file.
fwrite($file, $path);
fclose($file);




Timber::render( array( 'page-templates/page-404.twig', 'page-templates/page.twig' ), $context );
