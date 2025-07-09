<?php
/**
 * Plugin Name: Defacto - Devis
 * Description: Mise en place d'un system de devis pour les sites créés par DEFACTO.
 * Version: 1.0.0
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
 
	/* Include the includes folder */
	require_once DF_DEVIS_PATH . 'includes/df-utils.php';
	require_once DF_DEVIS_PATH . 'includes/DfDevisException.php';
	require_once DF_DEVIS_PATH . 'includes/df-db.php';
	require_once DF_DEVIS_PATH . 'includes/df-templates.php';

	class DFDevis 
	{
		public static $instance = null; 

		public $settings = array();
		public function __construct() {
			// Do nothing.
		}

		public static function getInstance() {
	        if (self::$instance === null) {
	            self::$instance = new DFDevis();
	            self::$instance->initialize();
	        }
	        return self::$instance;
	    }

		public function initialize() {
			add_action('admin_menu', [$this, 'add_devis_page']);
			add_action('init', function() {
			    register_post_type('devis', [
			        'labels' => [
			            'name' => 'Defacto Devis',
			            'singular_name' => 'Defacto Devis',
			            'menu_name' => 'Defacto Devis',
			        ],
			        'public' => true,
			        'show_ui' => true,
			        'supports' => ['title'],
			    ]);
			});

			add_action('add_meta_boxes', function() {
			    add_meta_box(
			        'devis_steps_options',
			        'Steps & Options',
			        [$this, 'render_devis_meta_box'],
			        'devis',
			        'normal',
			        'default'
			    );
			});
			add_action('save_post_devis', [$this, 'save_post_data']);
			add_action('wp_trash_post', [$this, 'my_custom_on_trash_action']);

			// This function handles the creation of the database
			//register_activation_hook(__FILE__, [$this, 'handle_dfdb_create_database']);  /* OLD DATABASE */
			register_activation_hook(__FILE__, 'dfdb_create_database'); /* NEW DATABASE */

			// This function handles the deletion of the database
			//register_deactivation_hook(__FILE__, [$this, 'handle_dfdb_delete_database']); /* OLD DATABASE */
			register_deactivation_hook(__FILE__, 'dfdb_delete_database'); /* NEW DATABASE */

			add_action('wp_ajax_dfdb_create_database', [$this, 'handle_dfdb_create_database']);
			add_action('wp_ajax_dfdb_delete_database', [$this, 'handle_dfdb_delete_database']);
			add_action('wp_ajax_df_insert_option', [$this, 'handle_df_insert_option']);
			add_action('wp_ajax_dfdb_get_step_options', [$this, 'handle_dfdb_get_step_options']);
			add_action('wp_ajax_dfdb_get_options', [$this, 'handle_dfdb_get_options']);
			add_action('wp_ajax_df_update_option_name', [$this, 'handle_df_update_option_name']);
			add_action('wp_ajax_df_update_option_activate_group', [$this, 'handle_df_update_option_activate_group']);
			add_action('wp_ajax_df_update_option_group', [$this, 'handle_df_update_option_group']);
			add_action('wp_ajax_dfdb_delete_option', [$this, 'handle_dfdb_delete_option']);
			add_action('wp_ajax_dfdb_delete_step_options', [$this, 'handle_dfdb_delete_step_options']);

			add_action('wp_ajax_render_devis_data', [$this, 'handle_render_devis_data']);
			add_action('wp_ajax_dfdb_get_step_options_by_group', [$this, 'handle_dfdb_get_step_options_by_group']);
			add_action('wp_ajax_dfdb_get_step_JSON_options_by_group', [$this, 'handle_dfdb_get_step_JSON_options_by_group']);
			add_action('wp_ajax_dfdb_get_JSON_options', [$this, 'handle_dfdb_get_JSON_options']);
		}

		function add_devis_page() {
	        add_menu_page(
	            'Defacto Devis',
	            'Defacto Devis',
	            'manage_options',
	            'df-devis',
	            [$this, 'render_devis_page'],
	            '',
	            3
	        );
	    }

	    function render_devis_page() {

			/* Enqueue scripts and styles */
	    	wp_enqueue_script(
	            'step-history-handle',
	            DF_DEVIS_URL . 'js/devis-stephistory.js',
	            ['jquery'],
	            '1.0',
	            true
	        );

	        wp_localize_script(
	            'step-history-handle', 
	            'stepData', []
	        );

	        wp_enqueue_script(
	            'step-selection-handle',
	            DF_DEVIS_URL . 'js/devis-stepselection.js',
	            ['jquery'],
	            '1.0',
	            true
	        );

	        wp_localize_script(
	            'step-selection-handle', 
	            'stepData', [
	                'ajaxUrl' => admin_url('admin-ajax.php'),
	                'stepUrl' => DF_DEVIS_URL . 'admin/step-content.php',
	            ]
		        );

	    	$externalCSS_Path = DF_DEVIS_PATH."styles/custom/devis-content.css";
	    	$externalCSS_Url = DF_DEVIS_URL."styles/custom/devis-content.css";

	    	$args = [
		        'post_type'      => 'devis',
		        'posts_per_page' => -1,
		        'post_status'    => 'publish', // You can also include 'draft' etc. if needed
		        'orderby'        => 'date',
		        'order'          => 'DESC',
		    ];

		    $devis_query = new WP_Query($args);

			/* Devis Page HTML */
		    ?><?php if (file_exists($externalCSS_Path)): ?>
				<link href="<?=esc_url($externalCSS_Url)?>" rel="stylesheet" />
			<?php endif; ?>
	    	<div class="devis-container" data-postid="-1">		 
		    <?php if($devis_query->have_posts()): ?>
		        <ul class="df-devis-list">
		        <?php while ($devis_query->have_posts()): $devis_query->the_post(); ?>
		            <li>
			            <strong><?=esc_html(get_the_title())?></strong><br>
			            <button data-postid="<?=get_the_ID()?>" class="view-devis" type="button">View</button>
		            </li>
		        <?php endwhile; ?>
		        </ul>
		        <?php wp_reset_postdata(); ?>
		    <?php else: ?>
		        <p>No devis found.</p>  
		    <?php endif; ?>
		    </div>
		    <?php 
	    }

		function handle_render_devis_data() {
		    if (empty($_POST['post_id'])) {
		        wp_send_json_error(['message' => 'Missing or invalid post ID']);
		        wp_die();
		    }

		    $post_id = intval($_POST['post_id']);
		    $data = get_post_meta($post_id, '_devis_steps_options', true);

		    if (empty($data) || !is_array($data)) {
		        wp_send_json_success(['message' => 'No steps defined.', 'page' => '<p>No steps defined.</p>']);
		        wp_die();
		    }

		    $content = '<div class="steps-container">';

		    foreach ($data as $stepIndex => $step) {
		        $step_type = esc_attr($step['step_settings']['step_type']);
		        $step_name = esc_html($step['step_settings']['step_name']);

		        $content .= sprintf(
		            '<div data-stepindex="%d" data-steptype="%s" class="step-box step-box-%d">%s</div>',
		            $stepIndex,
		            $step_type,
		            $stepIndex,
		            $step_name
		        );
		    }

		    $content .= '</div>
		                 <div class="step-info" data-stepid="0"></div>';

		    wp_send_json_success([
		        'message' => 'Page rendered successfully',
		        'page'    => $content
		    ]);

		    wp_die();
		}


	    function render_devis_meta_box($post) {
	    	wp_enqueue_script(
	            'step-content-handle',
	            DF_DEVIS_URL . 'js/devis-stepcontent.js',
	            ['jquery'],
	            '1.0',
	            true
	        );

	        wp_localize_script(
	            'step-content-handle', 
	            'stepData', []
	        );

	    	wp_enqueue_script(
	            'step-creation-handle',
	            DF_DEVIS_URL . 'js/devis-stepcreation.js',
	            ['jquery'],
	            '1.0',
	            true
	        );

	        wp_localize_script(
	            'step-creation-handle', 
	            'stepData', [
	                'ajaxUrl' => admin_url('admin-ajax.php'),
	            ]
	        );

		    wp_nonce_field('devis_steps_options_save', 'devis_steps_options_nonce');

			$step_types = dfdb_get_post_types($post->ID);
			if (empty($step_types)) {
				dfdb_create_step('Étape 1', 0, $post->ID);
				dfdb_create_type(dfdb_get_last_id(), 'options', 'Root');
				$id = dfdb_get_last_id();
				dfdb_create_option($id, 'Option 1');
				dfdb_create_history($id, 'Historique 1');
				dfdb_create_email($id, 'Email 1');
				$step_types = dfdb_get_post_types($post->ID);
			}
			$steps = dfdb_get_steps($post->ID);

			$container_data = [];

			$options = dfdb_get_options($post->ID);
			$historique = dfdb_get_history($post->ID);
			$formulaire = dfdb_get_email($post->ID);

			foreach ($options as $option) {
				$container_data[$option->step_index]['options'][] = [
					'id' => $option->id,
					'option_name' => $option->option_name,
					'group_name' => $option->group_name,
					'activate_group' => $option->activate_group,
				];
			}

			foreach ($historique as $history) {
				$container_data[$history->step_index]['history'][] = [
					'id' => $history->id,
					'info' => $history->info,
					'group_name' => $history->group_name,
					'activate_group' => $history->activate_group,
				];
			}

			foreach ($formulaire as $email) {
				$container_data[$email->step_index]['email'][] = [
					'id' => $email->id,
					'info' => $email->info,
					'group_name' => $email->group_name,
				];
			}

			?>
			<link href="<?=DF_DEVIS_URL."styles/default/devis-creation.css"?>" rel="stylesheet" />
			<div class="devis-container" data-postid="<?=$post->ID?>">
				<div class="steps-container">
				<?php foreach ($steps as $step_index => $step): ?>
					<?=df_get_step_html($step->id, $step_index, esc_html($step->step_name))?>
				<?php endforeach; ?>
				</div>
			<?php foreach ($steps as $step_index => $step): ?>
				<div class="step-info" data-stepindex="<?=$step_index?>">
					<div class="options-container step-<?=$step_index?>">
						<?php if (!empty($container_data[$step_index]['options'])): ?>
							<?php foreach ($container_data[$step_index]['options'] as $option): ?>
								<?=df_get_option_html($option['group_name'], $option['option_name'], $option['id'], $step_index !== 0)?>
							<?php endforeach; ?>
						<?php endif; ?>
						<button type="button" class="add-option">Add Option</button>
					</div>
					<div class="historique-container step-<?=$step_index?> hidden">
						<?php if (!empty($container_data[$step_index]['history'])): ?>
							<?php foreach ($container_data[$step_index]['history'] as $history): ?>
								<?=df_get_history_html($history['group_name'], true)?>
							<?php endforeach; ?>
						<?php endif; ?>
						<button type="button" class="add-history-step">Add History Step</button>
					</div>
					<div class="formulaire-container step-<?=$step_index?> hidden">
						<?php if (!empty($container_data[$step_index]['email'])): ?>
							<?php foreach ($container_data[$step_index]['email'] as $email): ?>
								<?=df_get_email_html($email['group_name'], true)?>
							<?php endforeach; ?>
						<?php endif; ?>
					</div>
				</div>
			<?php endforeach; ?>
			</div>
			<?php
			

			
			/*
		    ?>
		    <div data-postid="<?=$post->ID?>" id="devis-container">
		    	<button type="button" onclick="show_all_options()">All options</button>
			    <div data-postid="<?=$post->ID?>" id="devis-steps-container">
					<?php if (!empty($steps)): ?>

					<?php else: ?>
					<?php endif; ?>
			    </div>
			    <div class="options-container hidden">
                    <?php
                    if (!empty($step_options[0])) {
                    	foreach ($step_options[0] as $step_index => $option) {
                            ?>
                            <div data-id="<?=$option['id']?>" class="option" onclick="view_option(event, this)">
                            	<label>Option Name: 
						            <input class="set-name" type="text" name="<?=$option['option_name']?>" value="<?=$option['option_name']?>">
						        </label>              
                                <button type="button" class="remove-option">Remove Option</button>
                                <button type="button" data-stepindex="0" data-group="Root" data-activate="gp_<?=$option['id']?>" class="add-step">Add Step</button>
                            </div>			                            
                            <?php
                        }
                    }		                   
                    ?>
                    <button data-stepindex="0" type="button" class="add-option">Add Option</button>
                </div>

                <div class="historique-container hidden">
	                <h2 class="history-title">Selection History</h2>
	                
	                <div class="history-entries">
	                    <div class="history-entry">
	                        <div class="history-date">2024-01-15 14:30</div>
	                        <div class="history-action">Selected: Sol Option</div>
	                        <div class="history-details">User chose "Carrelage Premium" from the flooring options. This selection affects the overall pricing and installation timeline.</div>
	                    </div>
	                    
	                    <div class="history-entry">
	                        <div class="history-date">2024-01-15 14:32</div>
	                        <div class="history-action">Selected: Toit Option</div>
	                        <div class="history-details">User selected "Tuiles Rouges Traditionnelles" for the roofing material. Compatible with the chosen flooring option.</div>
	                    </div>
	                    
	                    <div class="history-entry">
	                        <div class="history-date">2024-01-15 14:35</div>
	                        <div class="history-action">Modified: Custom Option</div>
	                        <div class="history-details">User customized the "Fenêtres" option with double-glazing and wooden frames. Added +15% to base price.</div>
	                    </div>
	                    
	                    <div class="history-entry">
	                        <div class="history-date">2024-01-15 14:38</div>
	                        <div class="history-action">Removed: Previous Selection</div>
	                        <div class="history-details">User removed the "Isolation Standard" option and upgraded to "Isolation Premium" for better energy efficiency.</div>
	                    </div>
	                </div>
	                <button type="button" data-stepindex="0" data-activate="Next" class="add-history-step">Add Step</button>
	            </div>

				<div class="formulaire-container hidden">
	                <h2 class="form-title">Contact & Quote Request</h2>
	                
	                <div class="email-form">
	                    <label class="email-label" for="client-name">Full Name</label>
	                    <input class="email-input" type="text" id="client-name" name="client_name" placeholder="Enter your full name">
	                    
	                    <label class="email-label" for="client-email">Email Address</label>
	                    <input class="email-input" type="email" id="client-email" name="client_email" placeholder="your.email@example.com">
	                    
	                    <label class="email-label" for="client-phone">Phone Number</label>
	                    <input class="email-input" type="tel" id="client-phone" name="client_phone" placeholder="+33 1 23 45 67 89">
	                    
	                    <label class="email-label" for="project-address">Project Address</label>
	                    <input class="email-input" type="text" id="project-address" name="project_address" placeholder="Street address, City, Postal Code">
	                    
	                    <label class="email-label" for="additional-notes">Additional Notes</label>
	                    <textarea class="email-textarea" id="additional-notes" name="additional_notes" placeholder="Please describe any specific requirements, timeline preferences, or questions you may have..."></textarea>
	                    
	                    <button type="button" class="email-submit">Send Quote Request</button>
	                </div>
	            </div>
			</div>
		    <link href="<?=DF_DEVIS_URL."styles/default/devis-creation.css"?>" rel="stylesheet" />
		    <?php*/
		}

		function save_post_data($post_id) {
			if (!isset($_POST['devis_steps_options_nonce']) || !wp_verify_nonce($_POST['devis_steps_options_nonce'], 'devis_steps_options_save')) {
		        return;
		    }
		    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
		        return;
		    }
		    if (!current_user_can('edit_post', $post_id)) {
		        return;
		    }

	        global $wpdb;
	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $indices = $wpdb->get_col(
	            $wpdb->prepare(
	                "SELECT DISTINCT step_index FROM $devis_options WHERE devis_id = %d",
	                intval($post_id)
	            )
	        );

		    if (!empty($_POST['devis_steps_options']) && is_array($_POST['devis_steps_options'])) {
		        $clean = [];
		        $index = 0;
		        foreach ($_POST['devis_steps_options'] as $step) {
		            $step_name = sanitize_text_field($step['step_settings']['step_name'] ?? '');
		            $step_type = sanitize_text_field($step['step_settings']['step_type'] ?? '');
		            $clean[] = [
		                'step_settings' => [
		                	'step_name' => $step_name,
		                	'step_type' => $step_type,
		                ]
		            ];

					if ($step_type == "options")
						$indices = array_diff($indices, [$index]);
		            $index++;
		        }

		        foreach ($indices as $index) {
		        	$this->dfdb_delete_step_options($post_id, $index);
		        }
		        update_post_meta($post_id, '_devis_steps_options', $clean);
		    } else {
		        delete_post_meta($post_id, '_devis_steps_options');
		    }
		}

		function my_custom_on_trash_action($post_id) {
			$this->dfdb_delete_options(intval($post_id));
			delete_post_meta($post_id, '_devis_steps_options');
		}

		/* INSTALL */
		function handle_dfdb_create_database() {
			global $wpdb;

	        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
	        $charset_collate = $wpdb->get_charset_collate();

	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $options_sql = "CREATE TABLE $devis_options (
	            id mediumint(9) NOT NULL AUTO_INCREMENT,
	            devis_id mediumint(9) NOT NULL,
	            step_index mediumint(9) NOT NULL,
	            option_name TEXT NOT NULL,
	            activate_group VARCHAR(255) NOT NULL,
	            option_group VARCHAR(255) NOT NULL,
	            PRIMARY KEY  (id)
	        ) $charset_collate;";

	        dbDelta($options_sql);
		}

		function handle_df_insert_option() {
			if (!isset($_POST['devis_id'])) {
				wp_send_json_error(['message' => 'Missing or invalid devis id']);
			    wp_die();
			    return;
			}

			if (!isset($_POST['step_index'])) {
				wp_send_json_error(['message' => 'Missing or invalid step index']);
			    wp_die();
			    return;
			}

			$devis_id = intval($_POST['devis_id']);
			$step_index = intval($_POST['step_index']);
			$option_name = $_POST['option_name'] ?? 'option';
			$activate_group = $_POST['activate_group'] ?? '';
			$option_group = $_POST['option_group'] ?? ($step_index === 0 ? 'Root' : '');
			error_log($option_group);

			global $wpdb;
			require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
	        $charset_collate = $wpdb->get_charset_collate();

	        $data = [
			    "devis_id" => $devis_id,
			    "step_index" => $step_index,
			    "option_name" => $option_name,
			    "activate_group" => $activate_group,
			    "option_group" => $option_group,
			];

	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $inserted = $wpdb->insert($devis_options, $data);
	        if ($inserted === false) {
	        	wp_send_json_error(['message' => 'Failed to insert option: ' . $wpdb->last_error]);
	            wp_die();
	            return;
	        }

	        wp_send_json_success(['message' => 'Option inserted successfully', 'id' => $wpdb->insert_id]);
        	wp_die();
		}

		function handle_df_update_option_name() {
			if (!isset($_POST['option_id'])) {
				wp_send_json_error(['message' => 'Missing or invalid option id']);
			    wp_die();
			    return;
			}

			if (!isset($_POST['option_name'])) {
				wp_send_json_error(['message' => 'Missing or invalid option name']);
			    wp_die();
			    return;
			}

			global $wpdb;

	        $option_id = intval($_POST['option_id']);
	        $option_name = $_POST['option_name'];

	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $updated = $wpdb->update(
	            $devis_options, 
	            ['option_name' => $option_name], 
	            ['id' => $option_id]
	        );

	        if ($updated !== false) {
	            wp_send_json_success(['message' => 'Option updated successfully']);
	        } else {
	            wp_send_json_error(['message' => 'Failed to update option']);
	        }
	        wp_die();
		}

		function handle_df_update_option_activate_group() {
			if (!isset($_POST['option_id'])) {
				wp_send_json_error(['message' => 'Missing or invalid option id']);
			    wp_die();
			    return;
			}

			if (!isset($_POST['activate_group'])) {
				wp_send_json_error(['message' => 'Missing or invalid activate group']);
			    wp_die();
			    return;
			}

			global $wpdb;

	        $option_id = intval($_POST['option_id']);
	        $activate_group = $_POST['activate_group'];

	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $updated = $wpdb->update(
	            $devis_options, 
	            ['activate_group' => $activate_group], 
	            ['id' => $option_id]
	        );

	        if ($updated !== false) {
	            wp_send_json_success(['message' => 'activate_group: Option updated successfully']);
	        } else {
	            wp_send_json_error(['message' => 'Failed to update option']);
	        }
	        wp_die();
		}

		function handle_df_update_option_group() {
			if (!isset($_POST['option_id'])) {
				wp_send_json_error(['message' => 'Missing or invalid option id']);
			    wp_die();
			    return;
			}

			if (!isset($_POST['option_group'])) {
				wp_send_json_error(['message' => 'Missing or invalid option group']);
			    wp_die();
			    return;
			}

			global $wpdb;

	        $option_id = intval($_POST['option_id']);
	        $option_group = $_POST['option_group'];

	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $updated = $wpdb->update(
	            $devis_options, 
	            ['option_group' => $option_group], 
	            ['id' => $option_id]
	        );

	        if ($updated !== false) {
	            wp_send_json_success(['message' => 'Option updated successfully']);
	        } else {
	            wp_send_json_error(['message' => 'Failed to update option']);
	        }
	        wp_die();
		}
		function handle_dfdb_get_options() {
			if (!isset($_POST['devis_id'])) {
				wp_send_json_error(['message' => 'Missing or invalid devis id']);
			    wp_die();
			    return;
			}

			$devis_id = intval($_POST['devis_id']);

			return dfdb_get_options($devis_id);
		}

		function dfdb_get_options($devis_id) {
			global $wpdb;
	        
	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $options = $wpdb->get_results(
	            $wpdb->prepare(
	                "SELECT * FROM $devis_options WHERE devis_id = %d ORDER BY id ASC",
	                $devis_id
	            )
	        );
	        return $options;
		}

		function handle_dfdb_get_step_options() {
			if (!isset($_POST['devis_id'])) {
				wp_send_json_error(['message' => 'Missing or invalid devis id']);
			    wp_die();
			    return;
			}

			if (!isset($_POST['step_index'])) {
				wp_send_json_error(['message' => 'Missing or invalid step index']);
			    wp_die();
			    return;
			}

			$devis_id = intval($_POST['devis_id']);
			$step_index = intval($_POST['step_index']);

			return $this->get_step_options($devis_id, $step_index);
		}

		function get_step_options($devis_id, $step_index) {
			global $wpdb;
	        
	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $options = $wpdb->get_results(
	            $wpdb->prepare(
	                "SELECT * FROM $devis_options WHERE devis_id = %d AND step_index = %d ORDER BY id ASC",
	                $devis_id,
	                $step_index
	            )
	        );
	        return $options;
		}

		function handle_dfdb_get_step_JSON_options_by_group() {
		    $options = $this->get_step_options_by_group(intval($_POST['devis_id']), intval($_POST['step_index']), $_POST['option_group']);
		    $options_JSON = [];
		    foreach ($options as $option) {
		    	$options_JSON[] = json_encode($option);
		    }
			wp_send_json_success(['options' => $options_JSON]);
			wp_die();
		}

		function handle_dfdb_get_JSON_options() {
		    $options = $this->dfdb_get_options(intval($_POST['devis_id']));
		    $options_JSON = [];
		    foreach ($options as $option) {
		    	$options_JSON[] = json_encode($option);
		    }
			wp_send_json_success(['options' => $options_JSON]);
			wp_die();
		}

		function handle_dfdb_get_step_options_by_group() {
			$content = '<section class="page-content page-options">
		                <h2 class="page-title">Options Page</h2>';
		    $content .= $this->get_step_option_list(intval($_POST['devis_id']), intval($_POST['step_index']), $_POST['option_group']);
		    $content .= '</section>';

			wp_send_json_success(['content' => $content]);
			wp_die();
		}

		function get_step_option_list($post_id, $step_index, $option_group) {

			$options = $this->get_step_options_by_group(intval($post_id), intval($step_index), $option_group);
			$content = '<div class="options-list">';
			foreach ($options as $option) {
				$content .= '<div data-activate="'.$option->activate_group.'" class="option-box group-element" onclick="option_select(this, \''.$option->option_name.'\', \''.$option->id.'\')">';
				$content .= '<div class="option-name">'.$option->option_name.'</div>';
				$content .= '<div class="option-image-placeholder">[Image Here]</div>';
				$content .= '</div>';
			}
		    $content .= '</div>';
		    return $content;
		}

		function get_step_options_by_group($devis_id, $step_index, $group) {
			global $wpdb;
	        
	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $options = $wpdb->get_results(
	            $wpdb->prepare(
	                "SELECT * FROM $devis_options WHERE devis_id = %d AND step_index = %d AND option_group = %s ORDER BY id ASC",
	                $devis_id,
	                $step_index,
	                $group
	            )
	        );
	        return $options;
		}

		function handle_dfdb_delete_step_options()
	    {
	    	if (!isset($_POST['devis_id'])) {
				wp_send_json_error(['message' => 'Missing or invalid devis id']);
			    wp_die();
			    return;
			}

			if (!isset($_POST['step_index'])) {
				wp_send_json_error(['message' => 'Missing or invalid step index']);
			    wp_die();
			    return;
			}

			$devis_id = intval($_POST['devis_id']);
	        $step_index = intval($_POST['step_index']);

	        $deleted = $this->dfdb_delete_step_options($devis_id, $step_index);

	        if ($deleted !== false) {
	            wp_send_json_success(['message' => 'Option deleted successfully']);
	        } else {
	            wp_send_json_error(['message' => 'Failed to delete option']);
	        }
	        wp_die();
	    }

	    function dfdb_delete_step_options($devis_id, $step_index)
	    {
			global $wpdb;

	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        return $wpdb->delete($devis_options, ['step_index' => $step_index, 'devis_id' => $devis_id]);
	    }

	    function dfdb_delete_options($devis_id)
	    {
			global $wpdb;

	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $wpdb->delete($devis_options, ['devis_id' => $devis_id]);
	    }

		function handle_dfdb_delete_option()
	    {
	        if (!isset($_POST['option_id'])) {
				wp_send_json_error(['message' => 'Missing or invalid option id']);
			    wp_die();
			    return;
			}

			global $wpdb;

	        $option_id = intval($_POST['option_id']);

	        $devis_options = $wpdb->prefix . 'df_devis_options';
	        $deleted = $wpdb->delete($devis_options, ['id' => $option_id]);

	        if ($deleted !== false) {
	            wp_send_json_success(['message' => 'Option deleted successfully']);
	        } else {
	            wp_send_json_error(['message' => 'Failed to delete option']);
	        }
	        wp_die();
	    }

		function handle_dfdb_delete_database() {
			global $wpdb;

	        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
	        $charset_collate = $wpdb->get_charset_collate();

	        $devis_options = $wpdb->prefix . 'df_devis_options';

	        $drop_result = $wpdb->query("DROP TABLE IF EXISTS $devis_options");

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