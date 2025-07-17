<?php
/**
 * Plugin Name: Defacto - NutriCode
 * Description: System de génération de qr codes pour en savoir plus sur la nutrition des produits.
 * Version: 1.2.1
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

	require_once DF_NUTRICODE_PATH . 'includes/nc-functions.php';
	require_once DF_NUTRICODE_PATH . 'includes/DfNutricodeException.php';

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
			            'name' => 'NutriCode',
			            'singular_name' => 'NutriCode',
			            'menu_name' => 'NutriCode',
						'all_items' => 'Tous les NutriCodes',
						'add_new' => 'Créer un NutriCode',
						'add_new_item' => 'Créer un NutriCode',
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

				add_meta_box(
					'nutricode_side_box',
					'Qr Code',
					[$this, 'render_nutricode_side_box'],
					'nutricode',
					'side',
					'default'
				);
			});

			add_action('admin_menu', function() {
				add_submenu_page(
					'edit.php?post_type=nutricode',
					'Importer NutriCode Data',
					'Importer', 
					'manage_options',
					'nutricode_import',
					[$this, 'render_nutricode_import_page']
				);
			});


			add_action('save_post_nutricode', [$this, 'save_post_data']); 
            add_filter( 'single_template', [$this, 'override_single_template']);
		}

        function override_single_template( $single_template ){
            global $post;

            $file = DF_NUTRICODE_PATH . 'templates/single-nutricode.php';

            if( file_exists( $file ) ) {
				$single_template = $file;
			}

            return $single_template;
        }

		function render_nutricode_meta_box($post) {

			$origin = get_post_meta($post->ID, '_nutricode_origin', true);
			$grape = get_post_meta($post->ID, '_nutricode_grape', true);
			$year = get_post_meta($post->ID, '_nutricode_year', true);
			$calories = get_post_meta($post->ID, '_nutricode_calories', true);
			$energy = get_post_meta($post->ID, '_nutricode_energy', true);
			$alcohol = get_post_meta($post->ID, '_nutricode_alcohol', true);
			$carbohydrates = get_post_meta($post->ID, '_nutricode_carbohydrates', true);
			$sugars = get_post_meta($post->ID, '_nutricode_sugars', true);
			$fat = get_post_meta($post->ID, '_nutricode_fat', true);
			$saturated_fat = get_post_meta($post->ID, '_nutricode_saturated_fat', true);
			$protein = get_post_meta($post->ID, '_nutricode_protein', true);
			$salt = get_post_meta($post->ID, '_nutricode_salt', true);
			$allergens = get_post_meta($post->ID, '_nutricode_allergens', true);
			$serving_size = get_post_meta($post->ID, '_nutricode_serving_size', true);
			$product_id = get_post_meta($post->ID, '_nutricode_product_id', true);
			$product_image = get_post_meta($post->ID, '_nutricode_product_image', true);
			$product_name = get_post_meta($post->ID, '_nutricode_name', true);
			$product_description = get_post_meta($post->ID, '_nutricode_description', true);

			wp_enqueue_script(
	            'main-script-handle',
	            DF_NUTRICODE_URL . 'js/main.js',
	            ['jquery'],
	            '1.0',
	            true
	        );

			wp_localize_script(
	            'main-script-handle', 
	            'stepData', [
					'permalink' => get_permalink($post->ID),
					'post_id' => $post->ID,
					'ajaxUrl' => admin_url('admin-ajax.php'),
					'image' => $product_image,
					'name' => $product_name,
					'description' => $product_description,
				]
	        );

			wp_enqueue_style(
				'nutricode-creation-style',
				DF_NUTRICODE_URL . 'styles/nutricode-creation.css',
				[],
				'1.0'
			);

			wp_nonce_field('nutricode_meta_box', 'nutricode_meta_box_nonce');

			?>
			<div class="nutricode-meta-box">
				<div id="product-inspector">
					<input type="text" id="product-search" placeholder="Search by name or SKU..."/>
					<div class="product-pagination">
						<label for="product-product-per-page">Produits par page:
							<input type="number" id="product-product-per-page" value="10" min="1" max="100" />
						</label>
						<button type="button" id="product-page-previous"><</button>
						<label for="product-page-number">Page:
							<input type="number" id="product-page-number" value="1" min="1" />
						</label>
						<button type="button" id="product-page-next">></button>
					</div>
					<div id="product-error"></div>
					<div id="product-list"></div>
				</div>
				<div class="nutricode-page-info">
					<div class="nutricode-page-details">

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
							<input type="text" name="nutricode_year" id="nutricode_year" value="<?php echo esc_attr($year); ?>" />
						</p>

						<p>
							<label for="nutricode_calories">Calories (kcal / 100ml)</label>
							<input type="number" step="0.1" name="nutricode_calories" id="nutricode_calories" value="<?php echo esc_attr($calories); ?>" />
						</p>

						<p>
							<label for="nutricode_energy">Énergie (kJ / 100ml)</label>
							<input type="number" step="1" name="nutricode_energy" id="nutricode_energy" value="<?php echo esc_attr($energy); ?>" />
						</p>

						<p>
							<label for="nutricode_alcohol">Teneur en alcool (% vol)</label>
							<input type="number" step="0.1" name="nutricode_alcohol" id="nutricode_alcohol" value="<?php echo esc_attr($alcohol); ?>" />
						</p>

						<p>
							<label for="nutricode_carbohydrates">Glucides (g / 100ml)</label>
							<input type="number" step="0.1" name="nutricode_carbohydrates" id="nutricode_carbohydrates" value="<?php echo esc_attr($carbohydrates); ?>" />
						</p>

						<p>
							<label for="nutricode_sugars">Dont sucres (g / 100ml)</label>
							<input type="number" step="0.1" name="nutricode_sugars" id="nutricode_sugars" value="<?php echo esc_attr($sugars); ?>" />
						</p>

						<p>
							<label for="nutricode_fat">Lipides (g / 100ml)</label>
							<input type="number" step="0.1" name="nutricode_fat" id="nutricode_fat" value="<?php echo esc_attr($fat); ?>" />
						</p>

						<p>
							<label for="nutricode_saturated_fat">Dont acides gras saturés (g / 100ml)</label>
							<input type="number" step="0.1" name="nutricode_saturated_fat" id="nutricode_saturated_fat" value="<?php echo esc_attr($saturated_fat); ?>" />
						</p>

						<p>
							<label for="nutricode_protein">Protéines (g / 100ml)</label>
							<input type="number" step="0.1" name="nutricode_protein" id="nutricode_protein" value="<?php echo esc_attr($protein); ?>" />
						</p>

						<p>
							<label for="nutricode_salt">Sel (g / 100ml)</label>
							<input type="number" step="0.01" name="nutricode_salt" id="nutricode_salt" value="<?php echo esc_attr($salt); ?>" />
						</p>

						<p>
							<label for="nutricode_allergens">Allergènes</label>
							<input type="text" name="nutricode_allergens" id="nutricode_allergens" value="<?php echo esc_attr($allergens); ?>" />
						</p>

						<p>
							<label for="nutricode_serving_size">Portion recommandée</label>
							<input type="text" name="nutricode_serving_size" id="nutricode_serving_size" value="<?php echo esc_attr($serving_size); ?>" />
						</p>

						<p>
							<label for="nutricode_product_id">ID du produit</label>
							<input type="text" name="nutricode_product_id" id="nutricode_product_id" value="<?php echo esc_attr($product_id); ?>" readonly/>
						</p>
					</div>
				</div>
			</div>
			<?php
		}

		public function render_nutricode_side_box($post) {
			wp_enqueue_media();
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

			wp_enqueue_style(
				'nutricode-side-style',
				DF_NUTRICODE_URL . 'styles/nutricode-side.css',
				[],
				'1.0'
			);

			?>
			<div class="nutricode-qr-code">
				<canvas id="qr-code-canvas"></canvas>
				<button id="download-qr-button">Download QR Code</button>
			</div>
			<div class="selected-product-info">
				<img id="selected-product-image" src="" alt="Selected Product Image" />
				<input type="hidden" name="nutricode_product_image" id="nutricode_product_image" value=""/>
				<label for="selected-product-name">Nom:</label>
				<input name="nutricode_name" type="text" id="selected-product-name" value=""/>
				<label for="selected-product-description">Description:</label>
				<textarea name="nutricode_description" id="selected-product-description" rows="4" cols="50"></textarea>
			</div>
			<?php
		}

		public function render_nutricode_import_page() {
			wp_enqueue_style(
				'nutricode-import-style',
				DF_NUTRICODE_URL . 'styles/nutricode-import.css',
				[],
				'1.0'
			);

			wp_enqueue_script(
				'nutricode-import-script',
				DF_NUTRICODE_URL . 'js/import.js',
				['jquery'],
				'1.0',
				true
			);

			wp_localize_script(
				'nutricode-import-script',
				'stepData',
				[
					'ajaxUrl' => admin_url('admin-ajax.php'),
					'nonce' => wp_create_nonce('nutricode_import_nonce')
				]
			);

			?>
			<div class="nutricode-import-container">
				<div id="product-inspector">
					<input type="text" id="product-search" placeholder="Search by name"/>
					<div class="product-pagination">
						<label for="product-product-per-page">Produits par page:
							<input type="number" id="product-product-per-page" value="10" min="1" max="100" />
						</label>
						<button type="button" id="product-page-previous" hidden><</button>
						<label for="product-page-number" hidden>Page:
							<input type="number" id="product-page-number" value="1" min="1" />
						</label>
						<button type="button" id="product-page-next" hidden>></button>
						<button type="button" id="import-products-button">Importer</button>	
					</div>
					<div id="product-error"></div>
					<div id="product-list"></div>
				</div>
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
				update_post_meta($post_id, '_nutricode_year', sanitize_text_field($_POST['nutricode_year']));
			}
			// Nutritional values
			if (isset($_POST['nutricode_calories'])) {
				update_post_meta($post_id, '_nutricode_calories', sanitize_text_field($_POST['nutricode_calories']));
			}
			if (isset($_POST['nutricode_energy'])) {
				update_post_meta($post_id, '_nutricode_energy', sanitize_text_field($_POST['nutricode_energy']));
			}
			if (isset($_POST['nutricode_alcohol'])) {
				update_post_meta($post_id, '_nutricode_alcohol', sanitize_text_field($_POST['nutricode_alcohol']));
			}
			if (isset($_POST['nutricode_carbohydrates'])) {
				update_post_meta($post_id, '_nutricode_carbohydrates', sanitize_text_field($_POST['nutricode_carbohydrates']));
			}
			if (isset($_POST['nutricode_sugars'])) {
				update_post_meta($post_id, '_nutricode_sugars', sanitize_text_field($_POST['nutricode_sugars']));
			}
			if (isset($_POST['nutricode_fat'])) {	
				update_post_meta($post_id, '_nutricode_fat', sanitize_text_field($_POST['nutricode_fat']));
			}		
			if (isset($_POST['nutricode_saturated_fat'])) {
				update_post_meta($post_id, '_nutricode_saturated_fat', sanitize_text_field($_POST['nutricode_saturated_fat']));
			}
			if (isset($_POST['nutricode_protein'])) {
				update_post_meta($post_id, '_nutricode_protein', sanitize_text_field($_POST['nutricode_protein']));
			}
			if (isset($_POST['nutricode_salt'])) {	
				update_post_meta($post_id, '_nutricode_salt', sanitize_text_field($_POST['nutricode_salt']));
			}
			if (isset($_POST['nutricode_allergens'])) {
				update_post_meta($post_id, '_nutricode_allergens', sanitize_text_field($_POST['nutricode_allergens']));
			}
			if (isset($_POST['nutricode_serving_size'])) {
				update_post_meta($post_id, '_nutricode_serving_size', sanitize_text_field($_POST['nutricode_serving_size']));
			}
			if (isset($_POST['nutricode_product_id'])) {
				update_post_meta($post_id, '_nutricode_product_id', sanitize_text_field($_POST['nutricode_product_id']));
			}
			if (isset($_POST['nutricode_product_image'])) {
				update_post_meta($post_id, '_nutricode_product_image', sanitize_text_field($_POST['nutricode_product_image']));
			}
			if (isset($_POST['nutricode_name'])) {
				update_post_meta($post_id, '_nutricode_name', sanitize_text_field($_POST['nutricode_name']));
				error_log('NutriCode name updated: ' . sanitize_text_field($_POST['nutricode_name'])); // Debugging line
			} else {
				error_log('NutriCode name not set'); // Debugging line
			}
			if (isset($_POST['nutricode_description'])) {
				update_post_meta($post_id, '_nutricode_description', sanitize_textarea_field($_POST['nutricode_description']));
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