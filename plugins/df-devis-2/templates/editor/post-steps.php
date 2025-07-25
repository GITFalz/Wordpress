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
    <div data-id="<?= esc_attr($step['id']) ?>" class="step step_<?= esc_attr($step['step_index']) ?> <?= esc_attr($third_class) ?>">
        <div class="step-header">
            <input type="text" placeholder="Nom de l'étape" value="<?= esc_attr($step['step_name']) ?>">
        </div>
        <div class="step-actions">
            <select>
                <option value="options" <?= selected($step['type'], 'options') ?>>Options</option>
                <option value="product" <?= selected($step['type'], 'product') ?>>Produit</option>
            </select>
            <button type="button">X</button>
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
            <button type="button">X</button>
            <button type="button">Add step</button>
        </div>
    </div>
    <?php return ob_get_clean();
}

/**
 * This function generates the base HTML page for the steps and options in the Devis editor.
 */
function dv_get_steps_html($post_id, $steps, $options) {
    ob_start(); ?>
    
    <link rel="stylesheet" href="<?=DF_DEVIS_URL?>assets/css/default/post-steps.css">
    <div data-id="20" class="dv-steps-container">
        <div class="steps-container">
            <div class="steps-container-header">
                <h3>Étapes</h3>
            </div>
            <div class="steps-content">
                <?php foreach ($steps as $step): ?>
                    <?= dv_get_customizable_step_html($step) ?>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="options-container">
            <div class="options-container-header">
                <h3>Options</h3>
            </div>
            <div class="options-content">
                <?php foreach ($options as $option): ?>
                    <?= dv_get_customizable_option_html($option) ?>
                <?php endforeach; ?>
                <div class="option-add">
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
        wp_send_json_error('Invalid request');
    }

    $step = json_decode(stripslashes($_POST['step']), true);
    $current_step_index = intval($_POST['current_step_index']);

    $html = dv_get_customizable_step_html($step, $current_step_index);
    wp_send_json_success($html);
}
add_action('wp_ajax_dv_get_customizable_step', 'handle_dv_get_customizable_step');

function handle_dv_get_customizable_option() {
    if (!isset($_POST['option'])) {
        wp_send_json_error('Invalid request');
    }

    $option = json_decode(stripslashes($_POST['option']), true);

    $html = dv_get_customizable_option_html($option);
    wp_send_json_success($html);
}
add_action('wp_ajax_dv_get_customizable_option', 'handle_dv_get_customizable_option');