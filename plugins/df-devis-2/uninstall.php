<?php

/**
 * Uninstallation script for the plugin.
 */

function dvdb_delete_database() {
    global $wpdb;

    $wpdb->query("DROP TABLE IF EXISTS " . DFDEVIS_TABLE_STEPS);
    $wpdb->query("DROP TABLE IF EXISTS " . DFDEVIS_TABLE_OPTIONS);
    $wpdb->query("DROP TABLE IF EXISTS " . DFDEVIS_TABLE_PRODUCT);
}