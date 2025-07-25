<?php

/**
 * Installation script for the plugin.
 */

function dvdb_create_database() {
    global $wpdb;

    $charset_collate = DFDEVIS_COLLATE;

    $steps_sql = "CREATE TABLE IF NOT EXISTS " . DFDEVIS_TABLE_STEPS . " (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        step_name tinytext NOT NULL,
        step_index mediumint(9) NOT NULL,
        post_id mediumint(9) NOT NULL,
        type varchar(20) NOT NULL DEFAULT 'options',
        PRIMARY KEY  (id)
    ) $charset_collate;";

    $options_sql = "CREATE TABLE IF NOT EXISTS " . DFDEVIS_TABLE_OPTIONS . " (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        option_name tinytext NOT NULL,
        activate_id mediumint(9) DEFAULT NULL,
        image_url text DEFAULT NULL,
        data json DEFAULT NULL,
        post_id mediumint(9) NOT NULL,
        step_index mediumint(9) NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    $product_sql = "CREATE TABLE IF NOT EXISTS " . DFDEVIS_TABLE_PRODUCT . " (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        activate_id mediumint(9) DEFAULT NULL,
        data json DEFAULT NULL,
        post_id mediumint(9) NOT NULL,
        step_index mediumint(9) NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    dbDelta($steps_sql);
    dbDelta($options_sql);
    dbDelta($product_sql);
}