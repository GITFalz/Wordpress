<?php
/**
 * Plugin Name: Defacto - Devis
 * Description: Mise en place d'un system de devis pour les sites créés par DEFACTO.
 * Version: 2.1.0
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
			/* POST FUNCTIONS */ // Keeping these functions for future use.
			add_action('save_post_devis', [$this, 'save_post_data']); 
			add_action('wp_trash_post', [$this, 'my_custom_on_trash_action']);

			// This function handles the creation of the database
			//register_activation_hook(__FILE__, [$this, 'handle_dfdb_create_database']);  /* OLD DATABASE */
			register_activation_hook(__FILE__, 'dfdb_create_database'); /* NEW DATABASE */

			// This function handles the deletion of the database
			//register_deactivation_hook(__FILE__, [$this, 'handle_dfdb_delete_database']); /* OLD DATABASE */
			register_deactivation_hook(__FILE__, 'dfdb_delete_database'); /* NEW DATABASE */

			add_action('wp_ajax_render_devis_data', [$this, 'handle_render_devis_data']);
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
					'postId' => $post->ID,
	            ]
	        );

		    wp_nonce_field('devis_steps_options_save', 'devis_steps_options_nonce');

			$step_types = dfdb_get_post_types($post->ID);
			if (empty($step_types)) {
				dfdb_create_step('Étape 1', 0, $post->ID);
				dfdb_create_type(dfdb_id(), 'options', 'Root');
				dfdb_create_option(dfdb_id(), 'Option 1');
				$step_types = dfdb_get_post_types($post->ID);
			}
			$steps = dfdb_get_steps($post->ID);

			$container_data = [];

			$options = dfdb_get_options($post->ID);
			$historique = dfdb_get_history($post->ID);
			$formulaire = dfdb_get_email($post->ID);

			foreach ($options as $option) {
				if (!isset($container_data[$option->step_index]['types'][$option->type_id])) {
					$container_data[$option->step_index]['types'][$option->type_id] = [
						'id' => $option->type_id,
						'step_index' => $option->step_index,
						'group_name' => $option->group_name,
						'type_name' => $option->type_name,
					];
				}

				$container_data[$option->step_index]['types'][$option->type_id]['options'][] = [
					'id' => $option->id,
					'option_name' => $option->option_name,
					'group_name' => $option->group_name,
					'type_id' => $option->type_id,
				];
			}

			foreach ($historique as $history) {
				if (!isset($container_data[$history->step_index]['types'][$history->type_id])) {
					$container_data[$history->step_index]['types'][$history->type_id] = [
						'id' => $history->type_id,
						'step_index' => $history->step_index,
						'group_name' => $history->group_name,
						'type_name' => $history->type_name,
					];
				}

				$container_data[$history->step_index]['types'][$history->type_id]['history'][] = [
					'id' => $history->id,
					'info' => $history->info,
					'group_name' => $history->group_name,
					'type_id' => $history->type_id,
				];
			}

			foreach ($formulaire as $email) {
				if (!isset($container_data[$email->step_index]['types'][$email->type_id])) {
					$container_data[$email->step_index]['types'][$email->type_id] = [
						'id' => $email->type_id,
						'step_index' => $email->step_index,
						'group_name' => $email->group_name,
						'type_name' => $email->type_name,
					];
				}

				$container_data[$email->step_index]['types'][$email->type_id]['emails'][] = [
					'id' => $email->id,
					'info' => $email->info,
					'group_name' => $email->group_name,
					'type_id' => $email->type_id,
				];
			}

			print_result($container_data);

			?>
			<link href="<?=DF_DEVIS_URL."styles/default/devis-creation.css"?>" rel="stylesheet" />
			<div class="devis-container" data-postid="<?=$post->ID?>">
				<div class="steps-container">
				<?php foreach ($steps as $step_index => $step): ?>
					<?=df_get_step_html($step->id, $step_index, esc_html($step->step_name))?>
				<?php endforeach; ?>
				</div>
				<?php foreach ($steps as $step_index => $step): ?>
					<div class="step-info step-info-<?=$step_index?> <?=$step_index===0?'':'hidden'?>" data-stepindex="<?=$step_index?>">
						<?php foreach ($container_data[$step_index]['types'] as $type_index => $type): ?>
							<div class="step-type step-type-<?=$type['id']?> group_<?=$type['group_name']?>" data-typeid="<?=$type['id']?>" data-typename="<?=$type['type_name']?>">
								<div class="options-container options-step-<?=$step_index?>">
									<?php if (isset($type['options'])): ?>
										<?php foreach ($type['options'] as $index => $option): ?>
											<?=df_get_option_html_array($option, $step_index !== 0)?>
										<?php endforeach; ?>
									<?php endif; ?>
									<button type="button" class="add-option">Add Option</button>
								</div>
								<div class="historique-container historique-step-<?=$step_index?> hidden">				
									<?php if (isset($type['history'])): ?>									
										<?php foreach ($type['history'] as $index => $history): ?>
											<?=df_get_history_html_array($history, true)?>
										<?php endforeach; ?>	
									<?php endif; ?>
									<button type="button" class="add-history-step">Add History Step</button>
								</div>
								<div class="formulaire-container formulaire-step-<?=$step_index?> hidden">
									<?php if (isset($type['email'])): ?>
										<?php foreach ($type['email'] as $index => $email): ?>
											<?=df_get_email_html_array($email, true)?>
										<?php endforeach; ?>									
									<?php endif; ?>
								</div>
							</div>
						<?php endforeach; ?>
					</div>
				<?php endforeach; ?>
			</div>
			<?php

			/*
						<div class="options-container options-step-<?=$step_index?> <?=$step_index===0?'':'hidden'?>">
							<?php if (!empty($container_data[$step_index]['options'])): ?>
								<?php foreach ($container_data[$step_index]['options'] as $option): ?>
									<?=df_get_option_html_base($option, $step_index !== 0)?>
								<?php endforeach; ?>
							<?php endif; ?>
							<button type="button" class="add-option">Add Option</button>
						</div>
						<div class="historique-container historique-step-<?=$step_index?> hidden">
							<?php if (!empty($container_data[$step_index]['history'])): ?>
								<?php foreach ($container_data[$step_index]['history'] as $history): ?>
									<?=df_get_history_html_base($history, true)?>
								<?php endforeach; ?>
							<?php endif; ?>
							<button type="button" class="add-history-step">Add History Step</button>
						</div>
						<div class="formulaire-container formulaire-step-<?=$step_index?> hidden">
							<?php if (!empty($container_data[$step_index]['email'])): ?>
								<?php foreach ($container_data[$step_index]['email'] as $email): ?>
									<?=df_get_email_html_base($email, true)?>
								<?php endforeach; ?>
							<?php endif; ?>
						</div>
			*/
		}

		function save_post_data($post_id) {
			// Nothing for now. All data has been saved in custom database tables.
		}

		function my_custom_on_trash_action($post_id) {
			// Nothing for now. All data has been saved in custom database tables.
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