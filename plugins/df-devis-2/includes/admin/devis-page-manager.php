<?php

/**
 * This file manages the main devis page the customers will see.
 */

function dv_add_admin_menu() {
    add_menu_page(
        'Defacto Devis',
        'Defacto Devis',
        'manage_options',
        'df-devis',
        'dv_render_devis_page',
        '',
        3
    );
}

function dv_render_devis_page() {
    $args = [
        'post_type'      => 'devis',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
    ];
    $devis_posts = get_posts($args);

    wp_enqueue_script(
        'df-devis-script', 
        DF_DEVIS_URL . 'assets/js/devis.js', 
        ['jquery'], 
        DF_DEVIS_VERSION, 
        true
    );

    wp_localize_script('df-devis-script', 'dfDevisData', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
    ]);

    // make basic HTML structure
    ?>
    <div class="df-devis-main-container wrap">
        <h1><?php esc_html_e('Defacto Devis', 'df-devis'); ?></h1>
        <p><?php esc_html_e('Manage your devis here.', 'df-devis'); ?></p>
        <?php foreach ($devis_posts as $post) : ?>
            <div class="devis-item">
                <p class="devis-title"><?php echo esc_html($post->post_title); ?></p>
                <button class="button button-primary" onclick="dv_afficher_post(<?php echo esc_js($post->ID); ?>)">
                    <?php esc_html_e('View Devis', 'df-devis'); ?>
                </button>
            </div>
        <?php endforeach; ?>
    </div>
    <?php
}

function handle_dv_display_post() {
    if (!isset($_POST['post_id']) || !is_numeric($_POST['post_id'])) {
        wp_send_json_error(['message' => 'Invalid post ID']);
        return;
    }

    $post_id = intval($_POST['post_id']);
    try {
        $post = get_post($post_id);
        if (!$post) {
            return '<p>Devis not found.</p>';
        }

        $result = dvdb_does_post_have_future_products($post_id);
        $steps = json_decode(json_encode(dvdb_get_steps($post_id)), true);
        $firstStep = dvdb_get_steps_by_index($post_id, 1)[0] ?? null;

        if (empty($steps) || !$firstStep) {
            throw new Exception("No steps found for post ID: $post_id");
        }

        $firstOptions = json_decode(json_encode(dvdb_get_options_by_step($firstStep->id)), true);

        // Default steps
        $stepData = [];
        foreach ($steps as $step) {
            if (!isset($stepData[$step['step_index']])) {
                $stepData[$step['step_index']] = [
                    'step_index' => $step['step_index'],
                    'step_name' => $step['step_name'],
                ];

                if (intval($step['step_index']) === 1) {
                    $stepData[$step['step_index']]['id'] = $step['id'];
                }
            }
        }

        $generate_history = get_post_meta($post_id, '_devis_generate_history', true);
        $generate_history = !empty($generate_history) && $generate_history === 'true';

        if ($generate_history) {
            $history_step_name = get_post_meta($post_id, '_devis_history_step_name', true);
            $next_step_index = count($stepData) + 1;
            if (empty($history_step_name)) {
                $history_step_name = 'Étape ' . $next_step_index;
                update_post_meta($post_id, '_devis_history_step_name', $history_step_name);
            }
            $stepData[$next_step_index] = [
                'step_index' => $next_step_index,
                'step_name' => $history_step_name,
            ];
        }

        $html = get_devis_page_html($stepData, $firstOptions);

        wp_send_json_success(['postId' => $post_id, 'html' => $html, 'history' => [['stepId' => $firstStep->id]], 'generateHistory' => $generate_history]);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_display_post', 'handle_dv_display_post');

function dv_afficher_post($post_id) {
    
}