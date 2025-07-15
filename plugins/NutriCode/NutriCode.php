<?php
/**
 * Plugin Name: Defacto - NutriCode
 * Description: System de génération de qr codes pour en savoir plus sur la nutrition des produits.
 * Version: 1.0.0
 * Author: DEFACTO
 * Author URI: https://www.studiodefacto.com
 */



if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! class_exists( 'NutriCode' ) ) 
{
	define('DF_NUTRICODE_PATH', plugin_dir_path(__FILE__));
	define('DF_NUTRICODE_URL', plugin_dir_url(__FILE__)); 

    class NutriCode
    {
        public static $instance = null; 

		public $settings = array();
		public function __construct() {
			// Remove the singleton logic from constructor
		}

		public static function getInstance() {
			if (self::$instance === null) {
				self::$instance = new NutriCode();
				self::$instance->initialize();
			}
			return self::$instance;
		}

		public function initialize() {
			add_action('init', function() {
			    register_post_type('nutricode', [
			        'labels' => [
			            'name' => 'Defacto NutriCode',
			            'singular_name' => 'Defacto NutriCode',
			            'menu_name' => 'NutriCode',
			        ],
					'has_archive' => true,
    				'rewrite' => ['slug' => 'nutricode'],
			        'public' => true,
			        'show_ui' => true,
			        'supports' => ['title'],
			    ]);
			});

			flush_rewrite_rules();

			add_action('add_meta_boxes', function() {
			    add_meta_box(
			        'nutricode_options',
			        'NutriCode Options',
			        [$this, 'render_nutricode_meta_box'],
			        'nutricode',
			        'normal',
			        'default'
			    );
			});

			add_action('save_post_nutricode', [$this, 'save_post_data']); 
			add_action('wp_trash_post', [$this, 'my_custom_on_trash_action']);
            add_filter( 'single_template', [$this, 'override_single_template']);
                
		}

        function override_single_template( $single_template ){
            global $post;

            $file = DF_NUTRICODE_PATH . 'templates/single-nutricode.php';

            if( file_exists( $file ) ) $single_template = $file;

            return $single_template;
        }

		function render_nutricode_meta_box($post) {
			
			wp_enqueue_script(
				'qr-code-library',
				'https://unpkg.com/qrious@4.0.2/dist/qrious.min.js',
				['jquery'],
				'1.0',
				true
			);
			
			wp_enqueue_script(
	            'qr-script-handle',
	            DF_NUTRICODE_URL . 'js/qr-script.js',
	            ['jquery'],
	            '1.0',
	            true
	        );

			wp_localize_script(
	            'qr-script-handle', 
	            'stepData', [
					'permalink' => get_permalink($post->ID),
					'post_id' => $post->ID
				]
	        );

			wp_nonce_field('nutricode_meta_box', 'nutricode_meta_box_nonce');
			
			$origin = get_post_meta($post->ID, '_nutricode_origin', true);
			$grape = get_post_meta($post->ID, '_nutricode_grape', true);
			$year = get_post_meta($post->ID, '_nutricode_year', true);

			?>
			<div class="nutricode-meta-box">
				<p>
					<label for="nutricode_origin">Origine</label>
					<input type="text" name="nutricode_origin" id="nutricode_origin" value="<?php echo esc_attr($origin); ?>" />
				</p>
				<p>
					<label for="nutricode_grape">Cépage</label>
					<input type="text" name="nutricode_grape" id="nutricode_grape" value="<?php echo esc_attr($grape); ?>" />
				</p>
				<p>
					<label for="nutricode_year">Millésime</label>
					<input type="number" name="nutricode_year" id="nutricode_year" value="<?php echo esc_attr($year); ?>" />
				</p>
			</div>
			<?php
		}

		

		public function save_post_data($post_id) {
			if (!isset($_POST['nutricode_meta_box_nonce']) || !wp_verify_nonce($_POST['nutricode_meta_box_nonce'], 'nutricode_meta_box')) {
				return;
			}

			if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
			if (!current_user_can('edit_post', $post_id)) return;

			if (isset($_POST['nutricode_origin'])) {
				update_post_meta($post_id, '_nutricode_origin', sanitize_text_field($_POST['nutricode_origin']));
			}
			if (isset($_POST['nutricode_grape'])) {
				update_post_meta($post_id, '_nutricode_grape', sanitize_text_field($_POST['nutricode_grape']));
			}
			if (isset($_POST['nutricode_year'])) {
				update_post_meta($post_id, '_nutricode_year', intval($_POST['nutricode_year']));
			}
		}
    }

	function dfnc() {
		return NutriCode::getInstance();
	}

	dfnc();
}

register_activation_hook(__FILE__, function() {
	dfnc(); // Initialize the plugin
	flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function() {
	flush_rewrite_rules();
});