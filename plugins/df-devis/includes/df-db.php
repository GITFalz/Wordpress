<?php
/**
 * This class holds all the functions for the database of the Devis plugin
 */

if (!defined('DFDEVIS_TABLE_STEPS')) {
    global $wpdb;
    define('DFDEVIS_COLLATE', 			 $wpdb->get_charset_collate());
    define('DFDEVIS_TABLE_STEPS',        $wpdb->prefix . 'df_devis_steps');
    define('DFDEVIS_TABLE_STEP_TYPES',   $wpdb->prefix . 'df_devis_step_types');
    define('DFDEVIS_TABLE_TYPES',        $wpdb->prefix . 'df_devis_types');
    define('DFDEVIS_TABLE_OPTIONS',      $wpdb->prefix . 'df_devis_options');
    define('DFDEVIS_TABLE_HISTORY',      $wpdb->prefix . 'df_devis_history');
    define('DFDEVIS_TABLE_EMAIL',        $wpdb->prefix . 'df_devis_email');
}

require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
require_once 'DfDevisException.php';

function df_create_database() {
    /* STEP TABLE */
    $steps_sql = "CREATE TABLE " . DFDEVIS_TABLE_STEPS . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    step_name VARCHAR(255) NOT NULL,
	    post_id int NOT NULL,
	    PRIMARY KEY (id)
	) " . DFDEVIS_COLLATE . ";";

	$step_types_sql = "CREATE TABLE " . DFDEVIS_TABLE_STEP_TYPES . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    step_id mediumint(9) NOT NULL,
	    group_name VARCHAR(255) NOT NULL,
	    PRIMARY KEY  (id),
	    KEY step_id (step_id),
	    FOREIGN KEY  (step_id) REFERENCES " . DFDEVIS_TABLE_STEPS . " (id) ON DELETE CASCADE
	) " . DFDEVIS_COLLATE . ";";

	/* TYPES TABLE */
	$types_sql = "CREATE TABLE " . DFDEVIS_TABLE_TYPES . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    step_type_id mediumint(9) NOT NULL,
	    type_name VARCHAR(255) NOT NULL,
	    PRIMARY KEY (id),
	    KEY step_type_id (step_type_id),
	    FOREIGN KEY  (step_type_id) REFERENCES " . DFDEVIS_TABLE_STEP_TYPES . " (id) ON DELETE CASCADE
	) " . DFDEVIS_COLLATE . ";";

	/* OPTIONS TABLE */
	$options_sql = "CREATE TABLE " . DFDEVIS_TABLE_OPTIONS . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    type_id mediumint(9) NOT NULL,
	    option_name VARCHAR(255) NOT NULL,
	    PRIMARY KEY (id),
	    KEY type_id (type_id),
	    FOREIGN KEY (type_id) REFERENCES " . DFDEVIS_TABLE_TYPES . " (id) ON DELETE CASCADE
	) " . DFDEVIS_COLLATE . ";";

	/* HISTORY TABLE */
	$history_sql = "CREATE TABLE " . DFDEVIS_TABLE_HISTORY . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    type_id mediumint(9) NOT NULL,
	    info TEXT NOT NULL,
	    PRIMARY KEY (id),
	    KEY type_id (type_id),
	    FOREIGN KEY (type_id) REFERENCES " . DFDEVIS_TABLE_TYPES . " (id) ON DELETE CASCADE
	) " . DFDEVIS_COLLATE . ";";

	/* EMAIL TABLE */
	$email_sql = "CREATE TABLE " . DFDEVIS_TABLE_EMAIL . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    type_id mediumint(9) NOT NULL,
	    info TEXT NOT NULL,
	    PRIMARY KEY (id),
	    KEY type_id (type_id),
	    FOREIGN KEY (type_id) REFERENCES " . DFDEVIS_TABLE_TYPES . " (id) ON DELETE CASCADE
	) " . DFDEVIS_COLLATE . ";";

	dbDelta($steps_sql);
	dbDelta($step_types_sql);
	dbDelta($types_sql);
	dbDelta($options_sql);
	dbDelta($history_sql);
	dbDelta($email_sql);
}

/* BASE INSERT FUNCTIONS */
function df_create_step($step_name, $post_id) {
	return $wpdb->insert(DFDEVIS_TABLE_STEPS, ["step_name" => $step_name, "post_id" => $post_id]);
}

function df_create_step_type($step_id, $group_name) {
	return $wpdb->insert(DFDEVIS_TABLE_STEP_TYPES, ["step_id" => $step_id, "group_name" => $group_name]);
}

function df_create_type($step_type_id, $type_name) {
	return $wpdb->insert(DFDEVIS_TABLE_TYPES, ["step_type_id" => $step_type_id, "type_name" => $type_name]);
}

function df_create_option($option_name) {
	return $wpdb->insert(DFDEVIS_TABLE_OPTIONS, ["option_name" => $option_name]);
}

function df_create_history($info) {
	return $wpdb->insert(DFDEVIS_TABLE_HISTORY, ["info" => $info]);
}

function df_create_email($info) {
	return $wpdb->insert(DFDEVIS_TABLE_EMAIL, ["info" => $info]);
}

/* AJAX INSERT FUNCTIONS */
function handle_df_create_step() {
    try {
        df_check_post('step_name', 'post_id');
        $step_name = sanitize_text_field($_POST['step_name']);
        $post_id = intval($_POST['post_id']);

        if (empty($step_name) || $post_id <= 0) {
            throw new DfDevisException("Invalid step name or post ID");
        }

        $result = df_create_step($step_name, $post_id);
        if ($result === false) {
            throw new DfDevisException("Failed to create step: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Step created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}

function handle_df_create_step_type() {
    try {
        df_check_post('step_id', 'group_name');
        $step_id = intval($_POST['step_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if ($step_id <= 0 || empty($group_name)) {
            throw new DfDevisException("Invalid step ID or group name");
        }

        $result = df_create_step_type($step_id, $group_name);
        if ($result === false) {
            throw new DfDevisException("Failed to create step type: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Step type created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}

function handle_df_create_type() {
    try {
        df_check_post('step_type_id', 'type_name');
        $step_type_id = intval($_POST['step_type_id']);
        $type_name = sanitize_text_field($_POST['type_name']);

        if ($step_type_id <= 0 || empty($type_name)) {
            throw new DfDevisException("Invalid step type ID or type name");
        }

        $result = df_create_type($step_type_id, $type_name);
        if ($result === false) {
            throw new DfDevisException("Failed to create type: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Type created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}

function handle_df_create_option() {
    try {
        df_check_post('option_name');
        $option_name = sanitize_text_field($_POST['option_name']);

        if (empty($option_name)) {
            throw new DfDevisException("Invalid option name");
        }

        $result = df_create_option($option_name);
        if ($result === false) {
            throw new DfDevisException("Failed to create option: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Option created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}

function handle_df_create_history() {
    try {
        df_check_post('info');
        $info = sanitize_textarea_field($_POST['info']);

        if (empty($info)) {
            throw new DfDevisException("Invalid info");
        }

        $result = df_create_history($info);
        if ($result === false) {
            throw new DfDevisException("Failed to create history: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'History created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}

function handle_df_create_email() {
    try {
        df_check_post('info');
        $info = sanitize_textarea_field($_POST['info']);

        if (empty($info)) {
            throw new DfDevisException("Invalid info");
        }

        $result = df_create_email($info);
        if ($result === false) {
            throw new DfDevisException("Failed to create email: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Email created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}

/* GET FUNCTIONS */

// none because i don't have the implementation yet



/* UNINSTALL FUNCTIONS */
function df_uninstall_database() {
    global $wpdb;
    $tables = [
        DFDEVIS_TABLE_STEPS,
        DFDEVIS_TABLE_STEP_TYPES,
        DFDEVIS_TABLE_TYPES,
        DFDEVIS_TABLE_OPTIONS,
        DFDEVIS_TABLE_HISTORY,
        DFDEVIS_TABLE_EMAIL
    ];
    foreach ($tables as $table) {
        $wpdb->query("DROP TABLE IF EXISTS $table");
    }
}

/* 

--- Insert example ---
function handle_df_insert_option() {
	if (!isset($_POST['devis_id'])) {
		wp_send_json_error(['message' => 'Missing or invalid devis id']);
	    wp_die();
	    return;
	}

	if (!isset($_POST['step_index'])) {
		wp_send_json_error(['message' => 'Missing or invalid step index']);
	    wp_die();
	    return;
	}

	$devis_id = intval($_POST['devis_id']);
	$step_index = intval($_POST['step_index']);
	$option_name = $_POST['option_name'] ?? 'option';
	$activate_group = $_POST['activate_group'] ?? '';
	$option_group = $_POST['option_group'] ?? ($step_index === 0 ? 'Root' : '');
	error_log($option_group);

	global $wpdb;
	require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
	$charset_collate = $wpdb->get_charset_collate();

	$data = [
	    "devis_id" => $devis_id,
	    "step_index" => $step_index,
	    "option_name" => $option_name,
	    "activate_group" => $activate_group,
	    "option_group" => $option_group,
	];

	$devis_options = $wpdb->prefix . 'df_devis_options';
	$inserted = $wpdb->insert($devis_options, $data);
	if ($inserted === false) {
		wp_send_json_error(['message' => 'Failed to insert option: ' . $wpdb->last_error]);
	    wp_die();
	    return;
	}

	wp_send_json_success(['message' => 'Option inserted successfully', 'id' => $wpdb->insert_id]);
	wp_die();
}

--- Get example ---
function df_get_options($devis_id) {
	global $wpdb;
    
    $devis_options = $wpdb->prefix . 'df_devis_options';
    $options = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT * FROM $devis_options WHERE devis_id = %d ORDER BY id ASC",
            $devis_id
        )
    );
    return $options;
}

--- Update example ---
function handle_df_update_option_name() {
	if (!isset($_POST['option_id'])) {
		wp_send_json_error(['message' => 'Missing or invalid option id']);
	    wp_die();
	    return;
	}

	if (!isset($_POST['option_name'])) {
		wp_send_json_error(['message' => 'Missing or invalid option name']);
	    wp_die();
	    return;
	}

	global $wpdb;

    $option_id = intval($_POST['option_id']);
    $option_name = $_POST['option_name'];

    $devis_options = $wpdb->prefix . 'df_devis_options';
    $updated = $wpdb->update(
        $devis_options, 
        ['option_name' => $option_name], 
        ['id' => $option_id]
    );

    if ($updated !== false) {
        wp_send_json_success(['message' => 'Option updated successfully']);
    } else {
        wp_send_json_error(['message' => 'Failed to update option']);
    }
    wp_die();
}

--- Delete example
function df_delete_step_options($devis_id, $step_index)
{
	global $wpdb;

    $devis_options = $wpdb->prefix . 'df_devis_options';
    return $wpdb->delete($devis_options, ['step_index' => $step_index, 'devis_id' => $devis_id]);
}


*/