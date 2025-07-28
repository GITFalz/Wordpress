<?php

/**
 * Installation script for the plugin.
 */

function dvdb_create_database() {
    global $wpdb;

    $charset_collate = DFDEVIS_COLLATE;

    /**
     * Steps table:
     * - id: unique id
     * - step_name: name of the step
     * - step_index: index of the step in the process
     * - post_id: the post id this step belongs to
     * - type: type of step (options or product) ENUM
     */

    $steps_sql = "CREATE TABLE IF NOT EXISTS " . DFDEVIS_TABLE_STEPS . " (
        id MEDIUMINT(9) NOT NULL AUTO_INCREMENT,
        step_name TINYTEXT NOT NULL,
        step_index MEDIUMINT(9) NOT NULL,
        post_id BIGINT(20) UNSIGNED NOT NULL,
        type ENUM('options', 'product') DEFAULT 'options',
        PRIMARY KEY (id)
    ) $charset_collate;";

    /**
     * Options table:
     * - id: unique id
     * - option_name: name of the option
     * - step_id: the step this option belongs to
     * - activate_id : the id of the step that is activated by this option
     * - image_url: URL of the image associated with the option
     * - data: JSON data for additional option details
     */

    $options_sql = "CREATE TABLE IF NOT EXISTS " . DFDEVIS_TABLE_OPTIONS . " (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        option_name tinytext NOT NULL,
        step_id mediumint(9) NOT NULL,
        activate_id mediumint(9) DEFAULT NULL,
        image_url text DEFAULT NULL,
        data json DEFAULT NULL,
        PRIMARY KEY  (id),
        FOREIGN KEY (step_id) REFERENCES " . DFDEVIS_TABLE_STEPS . "(id) ON DELETE CASCADE
    ) $charset_collate;";

    /**
     * Product table:
     * - id: unique id
     * - step_id: the step this product belongs to
     * - data: JSON data for product details
     */

    $product_sql = "CREATE TABLE IF NOT EXISTS " . DFDEVIS_TABLE_PRODUCT . " (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        step_id mediumint(9) NOT NULL,
        data json DEFAULT NULL,
        PRIMARY KEY  (id),
        FOREIGN KEY (step_id) REFERENCES " . DFDEVIS_TABLE_STEPS . "(id) ON DELETE CASCADE
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    dbDelta($steps_sql);
    dbDelta($options_sql);
    dbDelta($product_sql);
}