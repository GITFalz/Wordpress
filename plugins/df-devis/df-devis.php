<?php
/**
 * Plugin Name: Defacto - Devis
 * Description: Mise en place d'un system de devis pour les sites créés par DEFACTO.
 * Version: 2.3.1
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
			        'Etapes & Options',
			        [$this, 'render_devis_meta_box'],
			        'devis',
			        'normal',
			        'default'
			    );

				add_meta_box(
			        'devis_steps_formulaire',
			        'Creation du formulaire',
			        [$this, 'render_custom_formulaire_meta_box'],
			        'devis',
			        'normal',
			        'low'
			    );

				add_meta_box(
			        'devis_custom_fields',
			        'Informations Personnelles',
			        [$this, 'render_info_perso_meta_box'],
			        'devis',
			        'side',
			        'default'
			    );

				add_meta_box(
			        'devis_steps_email',
			        'Personnalisation de l\'email',
			        [$this, 'render_custom_email_meta_box'],
			        'devis',
			        'normal',
			        'low'
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
			add_action('wp_ajax_df_save_post_data', [$this, 'handle_df_save_post_data']);

			add_action('wp_ajax_df_add_formulaire_custom_field', [$this, 'handle_df_add_formulaire_custom_field']);
			add_action('wp_ajax_df_remove_formulaire_custom_field', [$this, 'handle_df_remove_formulaire_custom_field']);
			add_action('wp_ajax_df_update_formulaire_custom_field', [$this, 'handle_df_update_formulaire_custom_field']);

			add_action('wp_ajax_df_devis_send_email', [$this, 'handle_df_devis_send_email']);

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
			// Only act on autosave/new post
			wp_enqueue_media();

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
	            ['jquery', 'wp-data'],
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

			try {
				dfdb_generate_types_not_in_use($post->ID);
			} catch (DfDevisException $e) {
				error_log($e->getMessage());
			}
			
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
					'data' => json_decode($option->data, true) ?: [],
					'image' => $option->image ?? null,
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

			?>
			<link href="<?=DF_DEVIS_URL."styles/default/devis-creation.css"?>" rel="stylesheet" />
			<div class="devis-container" data-postid="<?=$post->ID?>">
				<div class="devis-steps-container">
					<div class="steps-container">
					<?php foreach ($steps as $step_index => $step): ?>
						<?=df_get_step_html($step->id, $step_index, esc_html($step->step_name), '')?>
					<?php endforeach; ?>
					</div>
					<?php foreach ($steps as $step_index => $step): ?>
						<div class="step-info step-info-<?=$step_index?> <?=$step_index===0?'':'hidden'?>" data-stepindex="<?=$step_index?>">
							<?php foreach ($container_data[$step_index]['types'] as $type_index => $type): ?>
								<div class="step-type step-type-<?=$type['id']?> group_<?=$type['group_name']?> <?=$step_index===0?'':'hidden'?>" data-typeid="<?=$type['id']?>" data-typename="<?=$type['type_name']?>">
									<div class="option-container option-step-<?=$step_index?>">
										<div class="options-container options-step-<?=$step_index?>">
											<?php if (isset($type['options'])): ?>
												<?php foreach ($type['options'] as $index => $option): ?>
													<?=df_get_option_html_array($option, $step_index !== 0)?>
												<?php endforeach; ?>
											<?php endif; ?>
											<div class="option-add">
												<span class="option-add-text">+</span>
											</div>
										</div>
									</div>
									<div class="historique-container historique-step-<?=$step_index?> hidden">				
										<?php if (isset($type['history'])): ?>									
											<?php foreach ($type['history'] as $index => $history): ?>
												<?=df_get_history_html_array($history, true)?>
											<?php endforeach; ?>	
										<?php endif; ?>
									</div>
									<div class="formulaire-container formulaire-step-<?=$step_index?> hidden">
										<?php if (isset($type['emails'])): ?>
											<?php foreach ($type['emails'] as $index => $email): ?>
												<?=df_get_email_html_array($post->ID, $email, true)?>
											<?php endforeach; ?>								
										<?php endif; ?>
									</div>
								</div>
							<?php endforeach; ?>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
			<?php
		}

		function render_custom_formulaire_meta_box($post) {
			wp_enqueue_script(
	            'formulaire-creation-handle',
	            DF_DEVIS_URL . 'js/devis-formulaireCreation.js',
	            ['jquery', 'wp-data'],
	            '1.0',
	            true
	        );

	        wp_localize_script(
	            'formulaire-creation-handle', 
	            'stepData', [
	                'ajaxUrl' => admin_url('admin-ajax.php'),
					'postId' => $post->ID,
	            ]
	        );	

			$custom_fields = get_post_meta($post->ID, '_devis_custom_fields', true);
			if (empty($custom_fields) || !is_array($custom_fields)) {
				$custom_fields = [];
				update_post_meta($post->ID, '_devis_custom_fields', $custom_fields);
			}

			$price = get_post_meta($post->ID, 'formulaire_price', true);
			if (empty($price)) {
				$price = false;
				update_post_meta($post->ID, 'formulaire_price', $price);
			}

			?>
			<link href="<?=DF_DEVIS_URL."styles/default/formulaire-creation.css"?>" rel="stylesheet" />
			<div class="formulaire-creation-container" style="width: 100%">
				<div class="formulaire-creation-fields">
					<div class="formulaire-creation-default-fields">
						<div class="formulaire-creation-default-fields-header">
							<h3>Champs par défaut</h3>
							<div class="formulaire-creation-default-fields-view" onclick="toggle_default_fields()">Voir</div>
						</div>
						<div class="formulaire-creation-default-fields-content hidden">
							<p>Nom complet</p>
							<p>Adresse e-mail</p>
							<p>Numéro de téléphone</p>
							<p>Adresse du projet</p>
							<p>Code postal</p>
							<p>Ville</p>
						</div>
					</div>
					<div class="formulaire-creation-custom-fields">
						<div class="formulaire-creation-custom-fields-header">
							<h3>Champs personnalisés</h3>
							<div class="formulaire-creation-custom-fields-toggle">
								<div class="formulaire-creation-custom-field-create" onclick="toggle_create_custom_fields()">Ajouter un nouveau champ</div>
								<div class="formulaire-creation-custom-field-view" onclick="toggle_custom_fields()">Voir</div>
							</div>
						</div>
						<div class="formulaire-creation-custom-fields-content hidden">
							<?php if (!empty($custom_fields)): ?>
								<?php foreach ($custom_fields as $index => $field): ?>
									<?php if (isset($field['type']) && isset($field['time']) && isset($field['name'])): ?>
										<div class="formulaire-creation-custom-field" data-type="<?php echo esc_attr($field['type']); ?>" data-index="<?php echo esc_attr($index); ?>" data-time="<?php echo esc_attr($field['time']); ?>">
											<div class="formulaire-creation-custom-field-row">
												<div class="formulaire-creation-custom-field-name">
													<p><?php echo $this->get_type_name($field['type']); ?></p>
													<input type="text" class="formulaire-creation-custom-field-input" name="custom_input_<?php echo esc_attr($field['time']); ?>" oninput="update_name(this)" value="<?php echo esc_attr($field['name']); ?>" />
												</div>
												<div class="formulaire-creation-custom-field-status">
													<p>Statut de sauvegarde</p>
													<div class="formulaire-creation-save-info">
														<div class="formulaire-creation-spinner formulaire-creation-custom-field-<?php echo esc_attr($field['time']); ?>-spinner hidden"></div>
														<div class="formulaire-creation-save formulaire-creation-custom-field-<?php echo esc_attr($field['time']); ?>-save hidden">&#10003;</div>
														<div class="formulaire-creation-fail formulaire-creation-custom-field-<?php echo esc_attr($field['time']); ?>-fail hidden">&#10005;</div>
													</div>
												</div>
												<div class="formulaire-creation-custom-field-actions">
													<button type="button" class="formulaire-creation-custom-field-remove" onclick="remove_custom_field(this)">X</button>
												</div>
											</div>
											<?php if ($field['type'] === 'region_checkbox' || $field['type'] === 'region_select' || $field['type'] === 'region_radio'): ?>
												<textarea class="formulaire-creation-custom-field-input" name="custom_input_<?php echo esc_attr($field['time']); ?>" oninput="update_region(this)"><?php echo isset($field['region']) ? esc_textarea($field['region']) : ''; ?></textarea>
											<?php endif; ?>
										</div>
									<?php endif; ?>
								<?php endforeach; ?>
							<?php endif; ?>
								
						</div>
					</div>
					<div class="formulaire-creation-optional-fields">
						<div class="formulaire-creation-optional-fields-header">
							<h3>Champs optionnels</h3>
							<div class="formulaire-creation-optional-fields-view" onclick="toggle_optional_fields()">Voir</div>
						</div>
						<div class="formulaire-creation-optional-fields-content hidden">
							<div class="formulaire-creation-optional-item">
								<div class="formulaire-creation-optional-name">
									<p>Prix inclus dans le mail</p>
									<input type="checkbox" class="formulaire-creation-price-checkbox" name="formulaire_price" <?php echo $price ? 'checked' : ''; ?> onclick="update_optional_field(this)"/>
								</div>
								<div class="formulaire-creation-optional-save-info">
									<div class="formulaire-creation-spinner formulaire-creation-price-spinner hidden"></div>
									<div class="formulaire-creation-save formulaire-creation-price-save hidden">&#10003;</div>
									<div class="formulaire-creation-fail formulaire-creation-price-fail hidden">&#10005;</div>
								</div>
							</div>
							
						</div>
					</div>
				</div>
				<div class="formulaire-creation-custom-fields-create-content hidden">
					<button data-type="default_input" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Champ de saisie</button>
					<button data-type="default_textarea" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Zone de texte</button>
					<button data-type="default_file" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Fichier joint</button>
					<button data-type="region_checkbox" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Case à cocher</button>
					<button data-type="region_select" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Sélection</button>
					<button data-type="region_radio" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Boutons radio</button>
				</div>
			</div>
			<?php

			/* base HTML for a saving input
			<input type="text" name="[input_name]" class="formulaire-champ"/>
			<div class="formulaire-save-info">
				<div class="formulaire-spinner formulaire-[input_name]-spinner hidden"></div>
				<div class="formulaire-save formulaire-[input_name]-save hidden">&#10003;</div>
			</div>
			*/
		}

		function render_custom_email_meta_box($post) {

			wp_enqueue_script(
	            'email-creation-handle',
	            DF_DEVIS_URL . 'js/devis-emailCreation.js',
	            ['jquery', 'wp-data'],
	            '1.0',
	            true
	        );

	        wp_localize_script(
	            'email-creation-handle', 
	            'stepData', [
	                'ajaxUrl' => admin_url('admin-ajax.php'),
					'postId' => $post->ID,
	            ]
	        );

			$custom_email_title = get_post_meta($post->ID, '_custom_email_title', true);
			if (empty($custom_email_title)) {
				$custom_email_title = 'Nom du devis';
				update_post_meta($post->ID, '_custom_email_title', $custom_email_title);
			}

			$custom_email_banner_text = get_post_meta($post->ID, '_custom_email_banner_text', true);
			if (empty($custom_email_banner_text)) {
				$custom_email_banner_text = 'Information du client';
				update_post_meta($post->ID, '_custom_email_banner_text', $custom_email_banner_text);
			}

			$custom_email_info_color = get_post_meta($post->ID, '_custom_email_info_color', true);
			if (empty($custom_email_info_color)) {
				$custom_email_info_color = '#ea5223';
				update_post_meta($post->ID, '_custom_email_info_color', $custom_email_info_color);
			}

			$custom_email_footer_color = get_post_meta($post->ID, '_custom_email_footer_color', true);
			if (empty($custom_email_footer_color)) {
				$custom_email_footer_color = '#eeeeee';
				update_post_meta($post->ID, '_custom_email_footer_color', $custom_email_footer_color);
			}

			$custom_email_price_color = get_post_meta($post->ID, '_custom_email_price_color', true);
			if (empty($custom_email_price_color)) {
				$custom_email_price_color = '#ea5223';
				update_post_meta($post->ID, '_custom_email_price_color', $custom_email_price_color);
			}

			$custom_email_footer = get_post_meta($post->ID, '_custom_email_footer', true);
			if (empty($custom_email_footer)) {
				$custom_email_footer = 'mini info au cas ou ;)';
				update_post_meta($post->ID, '_custom_email_footer', $custom_email_footer);
			}

			?>
			<link href="<?=DF_DEVIS_URL."styles/default/email-creation.css"?>" rel="stylesheet" />
			<div class="custom-email-container">
				<div class="custom-email-page">
					<table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:20px;">
					<tr>
						<td class="_custom_email_title" align="center" style="font-size:30px;font-weight:bold;padding-bottom:20px;">
						<?=esc_html($custom_email_title)?>
						</td>
					</tr>
					<tr>
						<td class="_custom_email_footer_color" style="background-color:<?=esc_attr($custom_email_footer_color)?>;padding:10px;">
						<p class="_custom_email_banner_text _custom_email_info_color" style="font-size:25px;color:#fff;background-color:<?=esc_attr($custom_email_info_color)?>;padding:10px 0;margin:0;text-align:center;">
							<?=esc_html($custom_email_banner_text)?>
						</p>
						<p style="margin:10px 0;color:#555;">
							<strong>Champ : </strong> Valeur
						</p>
						</td>
					</tr>
					<tr>
						<td style="padding:20px 0;">
						<p style="font-size:21px;font-weight:bold;text-align:center;margin-bottom:10px;">Choix du produit</p>
						<div style="text-align:center;">
							<img src="https://picsum.photos/200/300" width="200" height="300" alt="Produit" style="display:block;margin:auto;">
						</div>
						<p style="font-weight:bold;text-align:center;margin:10px 0 0;">Nom du produit</p>
						<p style="text-align:center;margin:0;color:#555;">Autre chose</p>
						<p style="margin:10px 0;color:#555;">Poids: <strong>200kg</strong></p>
						<p style="margin:10px 0;color:#555;">Hauteur: <strong>1m</strong></p>
						</td>
					</tr>
					<tr>
						<td style="padding:10px 0;">
						<p style="color:#555;">Ce produit est incroyable!</p>
						</td>
					</tr>
					<tr>
						<td class="_custom_email_price_color" style="background-color:<?=esc_attr($custom_email_price_color)?>;color:#fff;font-size:24px;text-align:center;padding:15px;">
						TTC: 50000000 euro
						</td>
					</tr>
					<tr>
						<td style="padding-top:20px;text-align:center;color:#999;">
						<p class="_custom_email_footer"><?=esc_html($custom_email_footer)?></p>
						</td>
					</tr>
					</table>
				</div> 
				<div class="custom-email-actions">
					<h2>Modifier le contenu</h2>

					<div class="custom-email-field">
						<label for="title">Nom du devis</label>
						<input class="custom-email-input email-input" data-name="_custom_email_title" type="text" id="title" value="<?=esc_attr($custom_email_title)?>">
						<div class="formulaire-creation-optional-save-info">
							<div class="custom-email-spinner hidden"></div>
							<div class="custom-email-save hidden">&#10003;</div>
							<div class="custom-email-fail hidden">&#10005;</div>
						</div>
					</div>

					<div class="custom-email-field">
						<label for="bannerText">Texte bannière</label>
						<input class="custom-email-input email-input" data-name="_custom_email_banner_text" type="text" id="bannerText" value="<?=esc_attr($custom_email_banner_text)?>">
						<div class="formulaire-creation-optional-save-info">
							<div class="custom-email-spinner hidden"></div>
							<div class="custom-email-save hidden">&#10003;</div>
							<div class="custom-email-fail hidden">&#10005;</div>
						</div>
					</div>

					<div class="custom-email-field">
						<label for="infoColor">Couleur fond "Information du client"</label>
						<input class="custom-email-input email-bg-color" data-name="_custom_email_info_color" type="color" id="infoColor" value="<?=esc_attr($custom_email_info_color)?>">
						<div class="formulaire-creation-optional-save-info">
							<div class="custom-email-spinner hidden"></div>
							<div class="custom-email-save hidden">&#10003;</div>
							<div class="custom-email-fail hidden">&#10005;</div>
						</div>
					</div>
			
					<div class="custom-email-field">
						<label for="footerColor">Couleur Informations</label>
						<input class="custom-email-input email-bg-color" data-name="_custom_email_footer_color" type="color" id="footerColor" value="<?=esc_attr($custom_email_footer_color)?>">
						<div class="formulaire-creation-optional-save-info">
							<div class="custom-email-spinner hidden"></div>
							<div class="custom-email-save hidden">&#10003;</div>
							<div class="custom-email-fail hidden">&#10005;</div>
						</div>
					</div>

					<div class="custom-email-field">
						<label for="priceColor">Couleur fond TTC</label>
						<input class="custom-email-input email-bg-color" data-name="_custom_email_price_color" type="color" id="priceColor" value="<?=esc_attr($custom_email_price_color)?>">
						<div class="formulaire-creation-optional-save-info">
							<div class="custom-email-spinner hidden"></div>
							<div class="custom-email-save hidden">&#10003;</div>
							<div class="custom-email-fail hidden">&#10005;</div>
						</div>
					</div>

					<div class="custom-email-field">
						<label for="footer">Texte bas de page</label>
						<textarea class="custom-email-input email-textarea" data-name="_custom_email_footer" type="text" id="footer" ><?=esc_attr($custom_email_footer)?></textarea>
						<div class="formulaire-creation-optional-save-info">
							<div class="custom-email-spinner hidden"></div>
							<div class="custom-email-save hidden">&#10003;</div>
							<div class="custom-email-fail hidden">&#10005;</div>
						</div>
					</div>
				</div>
			</div> <?php
		}

		function handle_df_devis_send_email() {
			if ( ! isset($_POST['post_id']) || ! isset($_POST['email']) || ! isset($_POST['data']) || empty($_POST['email']) ) {
				wp_send_json_error(['message' => 'Missing or invalid data']);
				wp_die();
			}

			$post_id = intval($_POST['post_id']);
			$email = sanitize_email($_POST['email']);
			$data = isset($_POST['data']) ? json_decode(stripslashes($_POST['data']), true) : [];

			$post = get_post($post_id);
			if ( ! $post ) {
				wp_send_json_error(['message' => 'Post not found']);
				wp_die();
			}

			$owner_email = get_post_meta($post_id, '_devis_owner_email', true);

			error_log("Sending email to: $email, Owner email: $owner_email");

			if ( ! is_email($email) ) {
				wp_send_json_error(['message' => 'Invalid email address']);
				wp_die();
			}

			$subject = 'Devis de ' . get_the_title($post_id);
			$body = $this->get_email($data);
			$attachments = [];

			/*
			foreach ($data as $field) {
				if (!empty($field['label']) && isset($field['value'])) {
					$body .= '<strong>' . esc_html($field['label']) . ':</strong> ' . nl2br(esc_html($field['value'])) . '<br>';
				}
			}
				*/

			// Handle file uploads
			if (!empty($_FILES['files'])) {
				foreach ($_FILES['files']['tmp_name'] as $index => $tmp_name) {
					if (is_uploaded_file($tmp_name)) {
						$name = sanitize_file_name($_FILES['files']['name'][$index]);
						$upload = wp_upload_bits($name, null, file_get_contents($tmp_name));

						if (!$upload['error']) {
							$attachments[] = $upload['file']; // add to email
						}
					}
				}
			}

			// error log attachments
			if (!empty($attachments)) {
				error_log("Attachments: " . implode(', ', $attachments));
			} else {
				error_log("No attachments found.");
			}

			$result1 = wp_mail($email, $subject, $body, ['Content-Type: text/html; charset=UTF-8'], $attachments);
			$result2 = wp_mail($owner_email, $subject, $body, ['Content-Type: text/html; charset=UTF-8'], $attachments);

			if (!$result1 || !$result2) {
				wp_send_json_error(['message' => 'Email sending failed. Please check your email configuration.']);
				wp_die();
			} else {
				wp_send_json_success(['message' => 'Email sent successfully']);
				wp_die();
			}

			wp_send_json_success(['message' => 'Email sent successfully']);
			wp_die();
		}

		function get_email($data) {
			ob_start(); ?>
			<!DOCTYPE html>
			<html>
			<body style="margin:0;padding:0;font-family:sans-serif;background-color:#f4f4f4;">
				<table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:20px;">
				<tr>
					<td align="center" style="font-size:30px;font-weight:bold;padding-bottom:20px;">
					Nom du devis
					</td>
				</tr>
				<tr>
					<td style="background-color:#eeeeee;padding:10px;">
					<p style="font-size:25px;color:#fff;background-color:#ea5223;padding:10px 0;margin:0;text-align:center;">
						Information du client
					</p>
					<?php foreach ($data as $field): ?>
						<?php if (!empty($field['label']) && isset($field['value'])): ?>
							<p style="margin:10px 0;color:#555;">
								<strong><?php echo esc_html($field['label']); ?> : </strong> <?php echo nl2br(esc_html($field['value'])); ?>
							</p>
						<?php endif; ?>
					<?php endforeach; ?>
					</td>
				</tr>
				<tr>
					<td style="padding:20px 0;">
					<p style="font-size:21px;font-weight:bold;text-align:center;margin-bottom:10px;">Choix du produit</p>
					<div style="text-align:center;">
						<img src="https://picsum.photos/200/300" width="200" height="300" alt="Produit" style="display:block;margin:auto;">
					</div>
					<p style="font-weight:bold;text-align:center;margin:10px 0 0;">Nom du produit</p>
					<p style="text-align:center;margin:0;color:#555;">Autre chose</p>
					<p style="margin:10px 0;color:#555;">Poids: <strong>200kg</strong></p>
					<p style="margin:10px 0;color:#555;">Hauteur: <strong>1m</strong></p>
					</td>
				</tr>
				<tr>
					<td style="padding:10px 0;">
					<p style="color:#555;">Ce produit est incroyable!</p>
					</td>
				</tr>
				<tr>
					<td style="background-color:#ea5223;color:#fff;font-size:24px;text-align:center;padding:15px;">
					TTC: 50000000 euro
					</td>
				</tr>
				<tr>
					<td style="padding-top:20px;text-align:center;color:#999;">
					<p>mini info au cas ou ;)</p>
					</td>
				</tr>
				</table>
			</body>
			</html> <?php
			return ob_get_clean();
		}

		function render_info_perso_meta_box($post) {
			wp_enqueue_script(
	            'info-perso-handle',
	            DF_DEVIS_URL . 'js/devis-infoPerso.js',
	            ['jquery'],
	            '1.0',
	            true
	        );

	        wp_localize_script(
	            'info-perso-handle', 
	            'stepData', [
	                'ajaxUrl' => admin_url('admin-ajax.php'),
					'postId' => $post->ID,
	            ]
	        );	

			$custom_fields = get_post_meta($post->ID, '_devis_custom_fields', true);
			if (empty($custom_fields) || !is_array($custom_fields)) {
				$custom_fields = [];
				update_post_meta($post->ID, '_devis_custom_fields', $custom_fields);
			}

			?>
			<link href="<?=DF_DEVIS_URL."styles/default/devis-creation.css"?>" rel="stylesheet" />
			<div class="info-perso-container">
				<div class="devis-header">
					<div class="devis-owner">
						<p>Email du propriétaire du devis:</p>
						<div class="devis-save-info">
							<div class="devis-spinner devis-owner-email-spinner hidden"></div>
							<div class="devis-save devis-owner-email-save hidden">&#10003;</div>
						</div>
					</div>
					<div class="devis-owner-email-container">
						<input type="email" class="devis_owner_email" value="<?=esc_attr(get_post_meta($post->ID, '_devis_owner_email', true))?>" />
					</div>
				</div>
			</div>
			<?php

		}

		function get_type_name($type) {
			switch ($type) {
				case 'default_input':
					return 'Nom du champ texte';
				case 'default_textarea':
					return 'Nom de la zone de texte';
				case 'default_file':
					return 'Nom du champ de fichier jointé';
				case 'region_checkbox':
					return 'Nom de la case à cocher';
				case 'region_select':
					return 'Nom du champ de sélection';
				case 'region_radio':
					return 'Nom du champ radio';
				default:
					return 'Nom du champ personnalisé';
			}
		}

		function handle_df_add_formulaire_custom_field() {
			if ( ! isset($_POST['post_id']) || ! isset($_POST['type']) || ! isset($_POST['name']) || empty($_POST['time'])  ) {
				wp_send_json_error(['message' => 'Missing or invalid data']);
				wp_die();
			}
			$post_id = intval($_POST['post_id']);
			$type = sanitize_text_field($_POST['type']);
			$name = sanitize_text_field($_POST['name']);
			$time = intval($_POST['time']);
			$index = intval($_POST['index'] ?? -1);
			$region = isset($_POST['region']) ? sanitize_textarea_field($_POST['region']) : '';

			$is_region = in_array($type, ['region_checkbox', 'region_select', 'region_radio'], true);

			if ( ! get_post($post_id) ) {
				wp_send_json_error(['message' => 'Post not found']);
				wp_die();
			}

			if ( ! $this->is_valid_custom_field_type($type) ) {
				wp_send_json_error(['message' => 'Invalid custom field type']);
				wp_die();
			}

			$custom_fields = get_post_meta($post_id, '_devis_custom_fields', true);
			if ( ! is_array($custom_fields) ) { 
				$custom_fields = []; 
			}
			
			$new_field = [
				'type' => $type,
				'name' => $name,
				'time' => $time,
			];
			if ($is_region ) {
				$new_field['region'] = $region;
			}

			if ($index >= 0 && $index <= count($custom_fields)) {
				array_splice($custom_fields, $index, 0, [$new_field]);
			} else {
				$custom_fields[] = $new_field;
			}

			$custom_fields = array_values($custom_fields);
			update_post_meta($post_id, '_devis_custom_fields', $custom_fields);

			wp_send_json_success([
				'message' => 'Custom field added successfully',
				'custom_field' => $new_field,
				'index' => $index
			]);
			wp_die();
		}

		function handle_df_remove_formulaire_custom_field() {
			if ( ! isset($_POST['post_id']) || ! isset($_POST['index']) ) {
				wp_send_json_error(['message' => 'Missing or invalid data']);
				wp_die();
			}
			$post_id = intval($_POST['post_id']);
			$index = intval($_POST['index']);

			if ( ! get_post($post_id) ) {
				wp_send_json_error(['message' => 'Post not found']);
				wp_die();
			}

			$custom_fields = get_post_meta($post_id, '_devis_custom_fields', true);
			if ( ! is_array($custom_fields) || ! isset($custom_fields[$index]) ) {
				wp_send_json_error(['message' => 'Invalid custom field index']);
				wp_die();
			}

			unset($custom_fields[$index]);

			$custom_fields = array_values($custom_fields);
			update_post_meta($post_id, '_devis_custom_fields', $custom_fields);
			wp_send_json_success(['message' => 'Custom field removed successfully']);
			wp_die();
		}

		function handle_df_update_formulaire_custom_field() {
			if ( ! isset($_POST['post_id']) || ! isset($_POST['index']) || ! isset($_POST['name']) || ! isset($_POST['type']) ) {
				wp_send_json_error(['message' => 'Missing or invalid data']);
				wp_die();
			}
			$post_id = intval($_POST['post_id']);
			$index = intval($_POST['index']);
			$name = sanitize_text_field($_POST['name']);
			$type = sanitize_text_field($_POST['type']);
			$region = isset($_POST['region']) ? sanitize_textarea_field($_POST['region']) : '';

			$is_region = in_array($type, ['region_checkbox', 'region_select', 'region_radio'], true);

			if ( ! get_post($post_id) ) {
				wp_send_json_error(['message' => 'Post not found']);
				wp_die();
			}

			if ( ! $this->is_valid_custom_field_type($type) ) {
				wp_send_json_error(['message' => 'Invalid custom field type']);
				wp_die();
			}

			$custom_fields = get_post_meta($post_id, '_devis_custom_fields', true);
			if ( ! is_array($custom_fields) || ! isset($custom_fields[$index]) ) {
				wp_send_json_error(['message' => 'Invalid custom field index']);
				wp_die();
			}

			$custom_fields[$index]['name'] = $name;
			$custom_fields[$index]['type'] = $type;
			if ($is_region) {
				$custom_fields[$index]['region'] = $region;
			} else {
				unset($custom_fields[$index]['region']);
			}

			update_post_meta($post_id, '_devis_custom_fields', $custom_fields);
			wp_send_json_success([
				'message' => 'Custom field updated successfully',
				'custom_field' => $custom_fields[$index],
				'index' => $index
			]);
			wp_die();
		}

		function is_valid_custom_field_type($type) {
			$valid_types = ['default_input', 'default_textarea', 'default_file', 'region_checkbox', 'region_select', 'region_radio'];
			return in_array($type, $valid_types, true);
		}	

		function save_post_data($post_id) {
			// Save the email of the owner		
		}

		function handle_df_save_post_data() {
			if ( ! isset($_POST['post_id']) || ! isset($_POST['post_line']) || ! isset($_POST['post_value']) ) {
				wp_send_json_error(['message' => 'Missing or invalid data']);
				wp_die();
			}
			$post_id = intval($_POST['post_id']);
			$post_line = sanitize_text_field($_POST['post_line']);
			$post_value = sanitize_text_field($_POST['post_value']);
			// Check if the post exists
			if ( ! get_post($post_id) ) {
				wp_send_json_error(['message' => 'Post not found']);
				wp_die();
			}
			// Save the data
			update_post_meta($post_id, $post_line, $post_value);
			wp_send_json_success(['message' => 'Data saved successfully']);
			wp_die();
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