<?php
/**
 * Plugin Name: Defacto - Devis (New)
 * Description: Mise en place d'un system de devis pour les sites créés par DEFACTO.
 * Version: 3.0.0
 * Author: DEFACTO
 * Author URI: https://www.studiodefacto.com
 */



if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! class_exists( 'DFDevis' ) ) 
{
	define('DF_DEVIS_PATH', plugin_dir_path(__FILE__));
	define('DF_DEVIS_URL', plugin_dir_url(__FILE__)); 
	define('DF_DEVIS_VERSION', '3.0.0');

	require_once DF_DEVIS_PATH . 'includes/admin/metabox-manager.php';
	require_once DF_DEVIS_PATH . 'includes/admin/devis-page-manager.php';
	require_once DF_DEVIS_PATH . 'templates/editor/post-steps.php';
	require_once DF_DEVIS_PATH . 'includes/core/database.php';
	require_once DF_DEVIS_PATH . 'includes/core/install.php';
	require_once DF_DEVIS_PATH . 'uninstall.php';

	class DFDevis 
	{
		public static $instance = null; 

		public $settings = array();
		public function __construct() {
			if (self::$instance !== null) {
				return self::$instance;
			}
			self::$instance = $this;
		}

		public static function getInstance() {
	        if (self::$instance === null) {
	            self::$instance = new DFDevis();
	            self::$instance->initialize();
	        }
	        return self::$instance;
	    }

		public function initialize() {
			add_action('admin_menu', 'dv_add_admin_menu');

			// Initialize the post type and metaboxes
			add_action('init', 'dv_register_post_type');
			add_action('add_meta_boxes', 'dv_create_metaboxes');

			register_activation_hook(__FILE__, 'dvdb_create_database');
			register_deactivation_hook(__FILE__, 'dvdb_delete_database');

			add_action('load-post-new.php', function() {
				$post_type = $_GET['post_type'] ?? 'post';

				if ($post_type === 'devis') {
					global $pagenow;

					if ($pagenow === 'post-new.php') {
						$post_id = wp_insert_post([
							'post_type' => $post_type,
							'post_status' => 'draft',
							'post_title' => 'Untitled',
						]);

						if (!is_wp_error($post_id)) {
							wp_safe_redirect(admin_url("post.php?post=$post_id&action=edit"));
							exit;
						}
					}
				}
			});
		}
    }

	function dfdv() {
		global $dfdv;

		if ( ! isset($dfdv)) {
			$dfdv = new DFDevis();
			$dfdv->initialize();
		}
		return $dfdv;
	}

	dfdv();
}