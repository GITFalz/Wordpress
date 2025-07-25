<?php


/**
 * All the database functions for the plugin.
 */
if (!defined('DFDEVIS_TABLE_STEPS')) {
    global $wpdb;
    define('DFDEVIS_COLLATE', $wpdb->get_charset_collate());
    define('DFDEVIS_TABLE_STEPS', $wpdb->prefix . 'df_devis_steps');
    define('DFDEVIS_TABLE_OPTIONS', $wpdb->prefix . 'df_devis_options');
    define('DFDEVIS_TABLE_PRODUCT', $wpdb->prefix . 'df_devis_product');
}


/**
 * Creation functions
 */
function dvdb_create_step($post_id, $step_index, $step_name) {
    global $wpdb;
    $wpdb->insert(DFDEVIS_TABLE_STEPS, [
        'step_name' => $step_name, 
        'step_index' => $step_index, 
        'post_id' => $post_id
    ]);
    return $wpdb->insert_id;
}

function dvdb_create_option($step_id, $option_name, $activate_id) {
    global $wpdb;
    $wpdb->insert(DFDEVIS_TABLE_OPTIONS, [
        'option_name' => $option_name, 
        'activate_id' => $activate_id, 
        'step_id' => $step_id
    ]);
    return $wpdb->insert_id;
}

function dvdb_create_product($step_id, $activate_id) {
    global $wpdb;
    $wpdb->insert(DFDEVIS_TABLE_PRODUCT, [
        'activate_id' => $activate_id,
        'step_id' => $step_id
    ]);
    return $wpdb->insert_id;
}


/**
 * Getter functions
 */
function dvdb_get_steps($post_id) {
    global $wpdb;
    return $wpdb->get_results($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d ORDER BY step_index ASC", $post_id));
}

function dvdb_get_options($post_id) {
    global $wpdb;
    return $wpdb->get_results($wpdb->prepare("SELECT o.*, s.step_index FROM " . DFDEVIS_TABLE_OPTIONS . " o JOIN " . DFDEVIS_TABLE_STEPS . " s ON o.step_id = s.id WHERE s.post_id = %d ORDER BY s.step_index ASC", $post_id));
}

function dvdb_get_products($post_id) {
    global $wpdb;
    return $wpdb->get_results($wpdb->prepare("SELECT p.*, s.step_index FROM " . DFDEVIS_TABLE_PRODUCT . " p JOIN " . DFDEVIS_TABLE_STEPS . " s ON p.step_id = s.id WHERE s.post_id = %d ORDER BY s.step_index ASC", $post_id));
}

function dvdb_get_step($step_id) {
    global $wpdb;
    return $wpdb->get_row($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_STEPS . " WHERE id = %d", $step_id));
}

function dvdb_get_option($option_id) {
    global $wpdb;
    return $wpdb->get_row($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE id = %d", $option_id));
}

function dvdb_get_product($product_id) {
    global $wpdb;
    return $wpdb->get_row($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_PRODUCT . " WHERE id = %d", $product_id));
}


/**
 * Deletion functions
 */
function dvdb_delete_step($step_id) {
    global $wpdb;
    $wpdb->delete(DFDEVIS_TABLE_STEPS, ['id' => $step_id]);
}

function dvdb_delete_option($option_id) {
    global $wpdb;
    $wpdb->delete(DFDEVIS_TABLE_OPTIONS, ['id' => $option_id]);
}

function dvdb_delete_product($product_id) {
    global $wpdb;
    $wpdb->delete(DFDEVIS_TABLE_PRODUCT, ['id' => $product_id]);
}

// Delete all steps from the post where the step index is greater or equal to the step index of the deleted step
function dvdb_delete_steps_from_post($post_id, $step_index) {
    global $wpdb;
    $wpdb->query($wpdb->prepare("DELETE FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d AND step_index >= %d", $post_id, $step_index));
}



/**
 * Ajax functions
 */
function handle_dvdb_delete_step_after_index() {
    if (!isset($_POST['step_index']) || !isset($_POST['post_id'])) {
        wp_send_json_error(['message' => 'Step ID and Post ID are required']);
        wp_die();
    }

    $step_index = intval($_POST['step_index']);
    $post_id = intval($_POST['post_id']);

    dvdb_delete_steps_from_post($post_id, $step_index);
    wp_send_json_success(['message' => 'Steps deleted successfully']);
    wp_die();
}
add_action('wp_ajax_dvdb_delete_step_after_index', 'handle_dvdb_delete_step_after_index');

function handle_dvdb_delete_option() {
    if (!isset($_POST['option_id'])) {
        wp_send_json_error(['message' => 'Option ID is required']);
        wp_die();
    }

    $option_id = intval($_POST['option_id']);
    dvdb_delete_option($option_id);
    wp_send_json_success(['message' => 'Option deleted successfully']);
    wp_die();
}
add_action('wp_ajax_dvdb_delete_option', 'handle_dvdb_delete_option');