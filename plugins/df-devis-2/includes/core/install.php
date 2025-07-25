<?php

/**
 * Installation script for the plugin.
 */

function dvdb_create_database() {
    global $wpdb;

    $charset_collate = DFDEVIS_COLLATE;

    $options_sql = "CREATE TABLE IF NOT EXISTS " . DFDEVIS_TABLE_OPTIONS . " (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        option_name tinytext NOT NULL,
        activate_id mediumint(9) NOT NULL,
        image_url text DEFAULT NULL,
        data json DEFAULT NULL,
        PRIMARY KEY  (id),
        FOREIGN KEY (activate_id) REFERENCES " . DFDEVIS_TABLE_OPTIONS . "(id) ON DELETE CASCADE
    ) $charset_collate;";

    $product_sql = "CREATE TABLE IF NOT EXISTS " . DFDEVIS_TABLE_PRODUCT . " (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        activate_id mediumint(9) DEFAULT NULL,
        data json DEFAULT NULL,
        PRIMARY KEY  (id),
        FOREIGN KEY (activate_id) REFERENCES " . DFDEVIS_TABLE_OPTIONS . "(id) ON DELETE CASCADE
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    dbDelta($options_sql);
    dbDelta($product_sql);
}