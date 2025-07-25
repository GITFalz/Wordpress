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

function dvdb_create_option($post_id, $step_index, $option_name, $activate_id) {
    global $wpdb;
    $wpdb->insert(DFDEVIS_TABLE_OPTIONS, [
        'option_name' => $option_name,
        'activate_id' => $activate_id,
        'post_id' => $post_id,
        'step_index' => $step_index
    ]);
    return $wpdb->insert_id;
}

function dvdb_create_product($post_id, $step_index, $activate_id) {
    global $wpdb;
    $wpdb->insert(DFDEVIS_TABLE_PRODUCT, [
        'activate_id' => $activate_id,
        'post_id' => $post_id,
        'step_index' => $step_index
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

function dvdb_get_options($post_id, $step_index) {
    global $wpdb;
    return $wpdb->get_results($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE post_id = %d AND step_index = %d", $post_id, $step_index));
}

function dvdb_get_products($post_id, $step_index) {
    global $wpdb;
    return $wpdb->get_results($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_PRODUCT . " WHERE post_id = %d AND step_index = %d", $post_id, $step_index));
}
    