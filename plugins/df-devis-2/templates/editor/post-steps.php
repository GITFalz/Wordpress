<?php

/**
 * Template for the steps and options meta box in the Devis editor.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function dv_get_customizable_step_html($step, $current_step_index = 1) {
    $stepIndex = intval($step['step_index']);
    $stepName = $step['step_name'];
    $type = "options"; // Default type, can be changed later
    if ($stepIndex > 1) {
        $type = $step['type'] ?? "options"; // Use the type from the step if available
    }
    $disableName = isset($step['disable_name']) ? $step['disable_name'] : false;

    $third_class = '';
    if ($stepIndex === $current_step_index) {
        $third_class = 'step_current';
    } elseif ($stepIndex < $current_step_index) {
        $third_class = 'step_previous';
    } elseif ($stepIndex > $current_step_index) {
        $third_class = 'step_next';
    }

    ob_start(); ?>
    <div <?= isset($step['id']) ? 'data-id="' . esc_attr($step['id']) . '"' : '' ?> data-index="<?= esc_attr($stepIndex) ?>" class="step step_<?= esc_attr($stepIndex) ?> <?= esc_attr($third_class) ?>">
        <div class="step-header">
            <input class="step-index-name" type="text" placeholder="Nom de l'étape" value="<?= esc_attr($stepName) ?>" <?= $disableName ? 'disabled' : '' ?>>
            <div class="post-steps-save-info hidden">
                <span class="post-steps-spinner hidden"></span>
                <span class="post-steps-success hidden">✔</span>
                <span class="post-steps-error hidden">✖</span>
            </div>
        </div>
        <div class="step-actions">
            <?php if ($stepIndex > 1): ?>
                <select <?= $stepIndex != $current_step_index ? 'disabled' : '' ?> class="step-type-select">
                    <option value="options" <?= $type === "options" ? "selected" : "" ?>>Options</option>
                    <option value="product" <?= $type === "product" ? "selected" : "" ?>>Produit</option>
                </select>
                <button type="button" class="remove-step-button" onclick="dv_remove_step(this)">X</button>
            <?php endif; ?>
            <button type="button" class="view-step-button" onclick="dv_view_step(this)">
                <span class="dashicons dashicons-visibility"></span>
            </button>
        </div>
    </div>
    <?php return ob_get_clean();
}

function dv_get_customizable_option_html($option) {

    $data = json_decode($option['data'], true);
    $show_cost_history = isset($data['cost']['history_visible']) ? $data['cost']['history_visible'] : 0;
    $additionalCost = isset($data['cost']['additional']) ? $data['cost']['additional'] : 0;

    ob_start(); ?>
    <div data-id="<?= esc_attr($option['id']) ?>" class="option">
        <div class="option-header">
            <input class="option-name" type="text" placeholder="Nom de l'option" value="<?= esc_attr($option['option_name']) ?>">
            <div class="post-steps-save-info hidden">
                <span class="post-steps-spinner hidden"></span>
                <span class="post-steps-success hidden">✔</span>
                <span class="post-steps-error hidden">✖</span>
            </div>
        </div>
        <div class="option-image-container">
            <div class="option-image-actions">
                <button type="button" onclick="select_image(event)">Sélectionner une image</button>
                <button type="button" onclick="remove_image(event)">X</button>
            </div>
            <img src="<?= esc_url($option['image_url']) ?>" alt="Option image"/>
        </div>
        <div class="option-settings">
            <div class="option-checkbox">
                <input type="checkbox" value="1" <?= checked($show_cost_history, 1) ?> onclick="toggle_history_visibility(event)"/>
                <p>Afficher le coût dans l'historique</p>
            </div>
            <div class="option-number">
                <input class="option-additional-cost" type="number" value="<?= esc_attr($additionalCost) ?>"/>
                <p>Coût additionnel</p>
            </div>
        </div>
        <div class="option-actions">
            <button type="button" onclick="dv_remove_option_from_step(this)">X</button>
            <p class="option-warning"></p>
            <button class="add-step-button" type="button" onclick="dv_option_add_step(this)"><?=  "Voir l'étape" ?></button>
        </div>
    </div>
    <?php return ob_get_clean();
}

function dv_get_product_html($product) {
    $product_data = json_decode($product['data'], true);;
    ob_start(); ?>
    <div class="formulaire" data-id="<?= esc_attr($product['id']) ?>">
        <h2 class="formulaire-title">Formulaire</h2>		
        <div class="formulaire-product-info">
            <div class="formulaire-produit">
                <div class="formulaire-product-details">
                    <p class="formulaire-produit-label">Produit:</p>
                    <div class="formulaire-selected-product">
                        <?php if (!empty($product_data['name'])): ?>
                            <div class="formulaire-product-item">
                                <img class="formulaire-product-image" src="<?=esc_url($product_data['image'])?>" alt="Product Image">
                                <div class="formulaire-product-text">
                                    <input class="formulaire-product-name" value="<?=esc_html($product_data['name'])?>"/>
                                    <input class="formulaire-product-description" value="<?=esc_html($product_data['description'])?>"/>
                                </div>
                                <div class="formulaire-actions-droite">
                                    <div class="formulaire-product-price">
                                        <input type="number" class="formulaire-product-price-value" value="<?=esc_attr($product_data['price'])?>" placeholder="Prix du produit"/>
                                        <span class="formulaire-product-price-text">€</span>
                                    </div>
                                    <div class="formulaire-product-actions">
                                        <button type="button" class="formulaire-product-save" onclick="update_woocommerce_product(this)">Changer l'image</button>
                                        <button type="button" class="formulaire-product-remove" onclick="remove_product_formulaire(this)">X</button>
                                    </div>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="formulaire-product-extras">
                    <div class="formulaire-product-extra-actions">
                        <button type="button" class="formulaire-product-add-extra" onclick="add_field_formulaire(this)">Ajouter un champ</button>
                    </div>
                    <div class="formulaire-product-extra-list">
                        <?php if (!empty($product_data['extras'])): ?>
                            <?php foreach ($product_data['extras'] as $key => $extra): ?>
                                <div class="formulaire-product-extra-item" data-key="<?=$key?>">
                                    <input type="text" class="formulaire-product-extra-name" placeholder="Nom de l'extra" value="<?=esc_attr($extra['name'])?>">
                                    <input type="text" class="formulaire-product-extra-value" placeholder="Valeur de l'extra" value="<?=esc_attr($extra['value'])?>">
                                    <button type="button" class="formulaire-product-extra-remove" onclick="remove_product_formulaire_extra(this)">X</button>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            <div class="formulaire-product-selection">
                <input type="text" class="formulaire-product-input" placeholder="Rechercher un produit" id="product-search-input">
                <div class="formulaire-product-list" id="product-list">
                    <!-- Products will be dynamically added here -->
                </div>
            </div>
        </div>
    </div>
    <?php return ob_get_clean();
}

function dv_get_extra_step_html($post_id) {
    ob_start(); ?>
    <div class="extra-step">
        <span class="info-icon"></span>
        <div class="extra-step-header">
            <h2>Étape additionnelle</h2>
            <span class="tooltip" data-tooltip='Suite à l’activation de l’option "Afficher un historique", une étape additionnelle sera automatiquement générée à la fin du devis. Veuillez saisir le nom de cette étape.'>❓</span>
        </div>
        
        <div class="extra-step-input">
            <p for="devis_history_step_name">Nom de l'étape additionnelle</p>
            <div class="extra-step-name">
                <input type="text" class="devis_history_step_name" id="devis_history_step_name"
                    value="<?= esc_attr(get_post_meta($post_id, '_devis_history_step_name', true)) ?>" />
                <div class="post-steps-save-info hidden">
                    <span class="post-steps-spinner hidden"></span>
                    <span class="post-steps-success hidden">✔</span>
                    <span class="post-steps-error hidden">✖</span>
                </div>
            </div>
        </div>
    </div>
    <?php return ob_get_clean();
}
/**
 * This function generates the base HTML page for the steps and options in the Devis editor.
 */
function dv_get_steps_html($post_id, $stepData, $firstOptions) {
    ob_start(); ?>
    
    <link rel="stylesheet" href="<?=DF_DEVIS_URL?>assets/css/default/post-steps.css">
    <div class="dv-steps-container">
        <div class="steps-container">
            <div class="steps-container-header">
                <h3>Étapes</h3>
            </div>
            <div class="steps-content">
                <?php foreach ($stepData as $stepIndex => $step): ?>
                    <?= dv_get_customizable_step_html($step) ?>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="options-container">
            <div class="options-container-header">
                <h3>Options</h3>
            </div>
            <div class="options-content">
                <div class="option-add" onclick="dv_add_option_to_step()">
                    <p>+</p>
                </div>
            </div>
        </div>
        <div class="product-container hidden">
            <div class="product-container-header">
                <h3>Produits</h3>
            </div>
            <div class="product-content">
                
            </div>
        </div>
    </div>
    
    
    <?php return ob_get_clean();
}


/**
 * Ajax handles
 */
function handle_dv_add_option_to_step() {
    try {
        if (!isset($_POST['step_id']) || !isset($_POST['option_name'])) {
            throw new Exception('Missing required parameters');
        }

        $step_id = intval($_POST['step_id']);
        $option_name = sanitize_text_field($_POST['option_name']);

        $optionId = dvdb_create_option($step_id, $option_name, null);
        $option = json_decode(json_encode(dvdb_get_option($optionId)), true);

        $data = [
            'message' => 'Option added successfully',
            'id' => $optionId,
            'html' => dv_get_customizable_option_html($option)
        ];

        wp_send_json_success($data);
        wp_die();
    }
    catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_add_option_to_step', 'handle_dv_add_option_to_step');

function handle_dv_add_step_to_option() {
    try {
        if (!isset($_POST['option_id']) || !isset($_POST['step_index']) || !isset($_POST['step_name']) || !isset($_POST['post_id'])) {
            throw new Exception('Missing required parameters');
        }

        $option_id = intval($_POST['option_id']);
        $step_index = intval($_POST['step_index']);
        $step_name = sanitize_text_field($_POST['step_name']);
        $post_id = intval($_POST['post_id']);

        // if option already has a step, we don't add a new one, no error
        $activate_id = dvdb_get_option_activate_id($option_id);
        if ($activate_id) {
            $step = dvdb_get_step($activate_id);
            $type = $step->type ?? "options";
            wp_send_json_success([
                'message' => 'Step already exists for this option',
                'id' => $activate_id,
                'type' => $type
            ]);
            wp_die();
        }

        $stepId = dvdb_create_step($post_id, $step_index, $step_name);
        $step = json_decode(json_encode(dvdb_get_step($stepId)), true);
        $type = $step['type'] ?? "options";

        dvdb_set_option_activate_id($option_id, $stepId);

        $data = [
            'message' => 'Step added successfully',
            'id' => $stepId,
            'html' => dv_get_customizable_step_html($step, $step_index),
            'type' => $type
        ];

        wp_send_json_success($data);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_add_step_to_option', 'handle_dv_add_step_to_option');

function handle_dv_get_step_data_html() {
    try {
        if (!isset($_POST['step_id']) || !isset($_POST['type'])) {
            throw new Exception('Missing required parameters');
        }

        $step_id = intval($_POST['step_id']);
        $type = sanitize_text_field($_POST['type']);

        if ($type !== 'options' && $type !== 'product') {
            throw new Exception('Invalid step type');
        }

        if ($step_id === -1) {
            $step_id = dvdb_get_first_step_id($post_id);
        }

        $html = '';
        $warnings = [];

        if ($type === 'options') {
            $options = dvdb_get_options_by_step($step_id);
            $options = json_decode(json_encode($options), true);
            foreach ($options as $option) {
                $result = dvdb_does_option_have_future_product($option['id']);
                if (!$result['state'])
                {
                    $warnings[$option['id']] = $result['status'];
                }
                $html .= dv_get_customizable_option_html($option);
            }
        } elseif ($type === 'product') {
            $product = dvdb_get_product_by_step($step_id);
            if ($product) {
                $product_data = json_decode(json_encode($product), true);
                $html = dv_get_product_html($product_data);
            } else {
                throw new Exception('No product found for this step');
            }
        } else {
            throw new Exception('Unknown step type');
        }

        wp_send_json_success(['html' => $html, 'warnings' => $warnings, 'step_id' => $step_id]);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_get_step_data_html', 'handle_dv_get_step_data_html');
