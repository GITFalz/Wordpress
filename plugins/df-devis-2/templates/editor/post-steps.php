<?php

/**
 * Template for the steps and options meta box in the Devis editor.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function dv_get_customizable_step_html($step, $current_step_index = 1) {
    $third_class = '';
    if ($step['step_index'] === $current_step_index) {
        $third_class = 'step_current';
    } elseif ($step['step_index'] < $current_step_index) {
        $third_class = 'step_previous';
    } elseif ($step['step_index'] > $current_step_index) {
        $third_class = 'step_next';
    }
    ob_start(); ?>
    <div data-id="<?= esc_attr($step['id']) ?>" data-index="<?= esc_attr($step['step_index']) ?>" class="step step_<?= esc_attr($step['step_index']) ?> <?= esc_attr($third_class) ?>">
        <div class="step-header">
            <input type="text" placeholder="Nom de l'étape" value="<?= esc_attr($step['step_name']) ?>">
        </div>
        <div class="step-actions">
            <?php if ($step['step_index'] > 1): ?>
                <select>
                    <option value="options" <?= selected($step['type'], 'options') ?>>Options</option>
                    <option value="product" <?= selected($step['type'], 'product') ?>>Produit</option>
                </select>
            <?php endif; ?>
            <button type="button" class="remove-step-button" onclick="dv_remove_step(this)">X</button>
            <button type="button" class="view-step-button">
                <span class="dashicons dashicons-visibility"></span>
            </button>
        </div>
    </div>
    <?php return ob_get_clean();
}

function dv_get_customizable_option_html($option) {

    $show_cost_history = isset($option['data']['show_cost_history']) ? $option['data']['show_cost_history'] : 0;
    $show_cost_menu = isset($option['data']['show_cost_menu']) ? $option['data']['show_cost_menu'] : 0;

    ob_start(); ?>
    <div data-id="<?= esc_attr($option['id']) ?>" class="option">
        <div class="option-header">
            <input type="text" placeholder="Nom de l'option" value="<?= esc_attr($option['option_name']) ?>">
        </div>
        <div class="option-image-container">
            <button type="button">Sélectionner une image</button>
            <img src="<?= esc_url($option['image_url']) ?>" alt="Option image"/>
        </div>
        <div class="option-settings">
            <div class="option-checkbox">
                <input type="checkbox" value="1" <?= checked($show_cost_history, 1) ?>/>
                <p>Afficher le coût dans l'historique</p>
            </div>
            <div class="option-checkbox">
                <input type="checkbox" value="1" <?= checked($show_cost_menu, 1) ?>/>
                <p>Afficher le coût dans le menu</p>
            </div>
        </div>
        <div class="option-actions">
            <button type="button" onclick="dv_remove_option_from_step(this)">X</button>
            <button type="button" onclick="dv_option_add_step(this)">Add step</button>
        </div>
    </div>
    <?php return ob_get_clean();
}

/**
 * This function generates the base HTML page for the steps and options in the Devis editor.
 */
function dv_get_steps_html($post_id, $data) {
    ob_start(); ?>
    
    <link rel="stylesheet" href="<?=DF_DEVIS_URL?>assets/css/default/post-steps.css">
    <div class="dv-steps-container">
        <div class="steps-container">
            <div class="steps-container-header">
                <h3>Étapes</h3>
            </div>
            <div class="steps-content">
                <?php foreach ($data as $step_index => $step): ?>
                    <?= dv_get_customizable_step_html($step) ?>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="options-container">
            <div class="options-container-header">
                <h3>Options</h3>
            </div>
            <div class="options-content">
                <?php foreach ($data['1']['options'] as $option): ?>
                    <?= dv_get_customizable_option_html($option) ?>
                <?php endforeach; ?>
                <div class="option-add" onclick="dv_add_option_to_step()">
                    <p>+</p>
                </div>
            </div>
        </div>
    </div>
    
    
    <?php return ob_get_clean();
}


/**
 * Ajax handles
 */
function handle_dv_get_customizable_step() {
    if (!isset($_POST['step']) || !isset($_POST['current_step_index'])) {
        wp_send_json_error(['message' => 'Invalid request']);
        wp_die();
    }

    $step = json_decode(stripslashes($_POST['step']), true);
    $current_step_index = intval($_POST['current_step_index']);

    $html = dv_get_customizable_step_html($step, $current_step_index);
    wp_send_json_success(['html' => $html, 'message' => 'Step retrieved successfully']);
    wp_die();
}
add_action('wp_ajax_dv_get_customizable_step', 'handle_dv_get_customizable_step');

function handle_dv_get_customizable_option() {
    if (!isset($_POST['option'])) {
        wp_send_json_error(['message' => 'Invalid request']);
        wp_die();
    }

    $option = json_decode(stripslashes($_POST['option']), true);

    $html = dv_get_customizable_option_html($option);
    wp_send_json_success(['html' => $html, 'message' => 'Option retrieved successfully']);
    wp_die();
}
add_action('wp_ajax_dv_get_customizable_option', 'handle_dv_get_customizable_option');

function handle_dv_get_customizable_options() {
    if (!isset($_POST['options']) || !isset($_POST['step_id'])) {
        wp_send_json_error(['message' => 'Invalid request']);
        wp_die();
    }

    $options = json_decode(stripslashes($_POST['options']), true);
    $activate_id = isset($_POST['activate_id']) ? intval($_POST['activate_id']) : null;
    $step_id = intval($_POST['step_id']);
    $html = '';

    $data = ['message' => 'Options retrieved successfully'];
    if (empty($options)) {
        $option_id = dvdb_create_option($step_id, 'Option', $activate_id);
        $option = dvdb_get_option($option_id);
        $options = [json_decode(json_encode($option), true)];
        $data['option'] = $option;
    }

    foreach ($options as $option) {
        $html .= dv_get_customizable_option_html($option);
    }

    $data['html'] = $html;

    wp_send_json_success($data);
    wp_die();
}
add_action('wp_ajax_dv_get_customizable_options', 'handle_dv_get_customizable_options');


function handle_dvdb_create_step() {
    if (!isset($_POST['post_id']) || !isset($_POST['step_index']) || !isset($_POST['step_name'])) {
        wp_send_json_error(['message' => 'Invalid request']);
        wp_die();
    }

    $post_id = intval($_POST['post_id']);
    $step_index = intval($_POST['step_index']);
    $step_name = sanitize_text_field($_POST['step_name']);

    $step_id = dvdb_create_step($post_id, $step_index, $step_name);
    $step = dvdb_get_step($step_id);

    if ($step) {
        $step = json_decode(json_encode($step), true);
        $html = dv_get_customizable_step_html($step);
        wp_send_json_success(['html' => $html, 'step' => $step]);
    } else {
        wp_send_json_error(['message' => 'Failed to create step']);
    }
    wp_die();
}
add_action('wp_ajax_dvdb_create_step', 'handle_dvdb_create_step');

function handle_dvdb_create_option() {
    if (!isset($_POST['step_id']) || !isset($_POST['option_name'])) {
        wp_send_json_error(['message' => 'Invalid request']);
        wp_die();
    }

    $step_id = intval($_POST['step_id']);
    $option_name = sanitize_text_field($_POST['option_name']);
    $activate_id = isset($_POST['activate_id']) ? intval($_POST['activate_id']) : null;

    $option_id = dvdb_create_option($step_id, $option_name, $activate_id);
    $option = dvdb_get_option($option_id);

    if ($option) {
        $option = json_decode(json_encode($option), true);
        $html = dv_get_customizable_option_html($option);
        wp_send_json_success(['html' => $html, 'option' => $option]);
    } else {
        wp_send_json_error(['message' => 'Failed to create option']);
    }
    wp_die();
}
add_action('wp_ajax_dvdb_create_option', 'handle_dvdb_create_option');