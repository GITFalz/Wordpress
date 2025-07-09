<?php
/**
 * This class holds all the functions for the database of the Devis plugin
 */

if (!defined('DFDEVIS_TABLE_STEPS')) {
    global $wpdb;
    define('DFDEVIS_COLLATE', $wpdb->get_charset_collate());
    define('DFDEVIS_TABLE_STEPS', $wpdb->prefix . 'df_devis_steps');
    define('DFDEVIS_TABLE_STEP_TYPES', $wpdb->prefix . 'df_devis_step_types');
    define('DFDEVIS_TABLE_TYPES', $wpdb->prefix . 'df_devis_types');
    define('DFDEVIS_TABLE_OPTIONS', $wpdb->prefix . 'df_devis_options');
    define('DFDEVIS_TABLE_HISTORY', $wpdb->prefix . 'df_devis_history');
    define('DFDEVIS_TABLE_EMAIL', $wpdb->prefix . 'df_devis_email');
}


require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
require_once 'DfDevisException.php';

function dfdb_create_database() {
    /* STEP TABLE */
    $steps_sql = "CREATE TABLE " . DFDEVIS_TABLE_STEPS . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    step_name VARCHAR(255) NOT NULL,
        step_index mediumint(9) NOT NULL,
	    post_id int NOT NULL,
	    PRIMARY KEY (id)
	) " . DFDEVIS_COLLATE . ";";

	/* TYPES TABLE */
	$types_sql = "CREATE TABLE " . DFDEVIS_TABLE_TYPES . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    step_id mediumint(9) NOT NULL,
	    type_name VARCHAR(255) NOT NULL,
        group_name VARCHAR(255) NOT NULL,
	    PRIMARY KEY (id),
	    KEY step_id (step_id),
	    FOREIGN KEY  (step_id) REFERENCES " . DFDEVIS_TABLE_STEPS . " (id) ON DELETE CASCADE
	) " . DFDEVIS_COLLATE . ";";

	/* OPTIONS TABLE */
	$options_sql = "CREATE TABLE " . DFDEVIS_TABLE_OPTIONS . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    type_id mediumint(9) NOT NULL,
	    option_name VARCHAR(255) NOT NULL,
        activate_group VARCHAR(255) DEFAULT NULL,
	    PRIMARY KEY (id),
	    KEY type_id (type_id),
	    FOREIGN KEY (type_id) REFERENCES " . DFDEVIS_TABLE_TYPES . " (id) ON DELETE CASCADE
	) " . DFDEVIS_COLLATE . ";";

	/* HISTORY TABLE */
	$history_sql = "CREATE TABLE " . DFDEVIS_TABLE_HISTORY . " (
	    id mediumint(9) NOT NULL AUTO_INCREMENT,
	    type_id mediumint(9) NOT NULL,
	    info TEXT NOT NULL,
        activate_group VARCHAR(255) DEFAULT NULL,
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
	dbDelta($types_sql);
	dbDelta($options_sql);
	dbDelta($history_sql);
	dbDelta($email_sql);
}

/* BASE INSERT FUNCTIONS */
function dfdb_create_step($step_name, $step_index, $post_id) {
    global $wpdb;
	return $wpdb->insert(DFDEVIS_TABLE_STEPS, ["step_name" => $step_name, "step_index" => $step_index, "post_id" => $post_id]);
}

function dfdb_create_type($step_id, $type_name, $group_name) {
    global $wpdb;
    return $wpdb->insert(DFDEVIS_TABLE_TYPES, ["step_id" => $step_id, "type_name" => $type_name, "group_name" => $group_name]);
}

function dfdb_create_option($type_id, $option_name) {
    global $wpdb;
    return $wpdb->insert(DFDEVIS_TABLE_OPTIONS, ["type_id" => $type_id, "option_name" => $option_name]);
}

function dfdb_create_history($type_id, $info) {
    global $wpdb;
    return $wpdb->insert(DFDEVIS_TABLE_HISTORY, ["type_id" => $type_id, "info" => $info]);
}

function dfdb_create_email($type_id, $info) {
    global $wpdb;
    return $wpdb->insert(DFDEVIS_TABLE_EMAIL, ["type_id" => $type_id, "info" => $info]);
}

/* BASE GET FUNCTIONS */
function dfdb_get_steps($post_id) { // Returns all steps for a given post ordered by step index
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d ORDER BY step_index ASC", $post_id) );
}

function dfdb_get_step_by_index($post_id, $step_index) {
    global $wpdb;
    return $wpdb->get_row( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d AND step_index = %d", $post_id, $step_index) );
}

function dfdb_get_types($step_id) {
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_TYPES . " WHERE step_id = %d ORDER BY id ASC", $step_id) );
}

function dfdb_get_options($post_id) { // Returns all the options for a given post ordered by step index and type id
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT s.step_index, t.id AS type_id, t.type_name, t.group_name, o.* FROM " . DFDEVIS_TABLE_OPTIONS . " o INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON o.type_id = t.id INNER JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id WHERE s.post_id = %d ORDER BY s.step_index ASC, t.id ASC, o.id ASC", $post_id) );
}

function dfdb_get_history($post_id) { // Returns all the history for a given post ordered by step index and type id
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT s.step_index, t.id AS type_id, t.type_name, t.group_name, h.* FROM " . DFDEVIS_TABLE_HISTORY . " h INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON h.type_id = t.id INNER JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id WHERE s.post_id = %d ORDER BY s.step_index ASC, t.id ASC, h.id ASC", $post_id) );
}

function dfdb_get_email($post_id) { // Returns all the email for a given post ordered by step index and type id
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT s.step_index, t.id AS type_id, t.type_name, t.group_name, e.* FROM " . DFDEVIS_TABLE_EMAIL . " e INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON e.type_id = t.id INNER JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id WHERE s.post_id = %d ORDER BY s.step_index ASC, t.id ASC, e.id ASC", $post_id) );
}

function dfdb_get_post_types($post_id) {
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare(" SELECT s.step_index, t.* FROM " . DFDEVIS_TABLE_TYPES . " t INNER JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id WHERE s.post_id = %d ORDER BY s.step_index ASC, t.id ASC", $post_id) );
}

function dfdb_get_type_options($type_id) {
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE type_id = %d ORDER BY id ASC", $type_id) );
}

function dfdb_get_type_history($type_id) {
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_HISTORY . " WHERE type_id = %d ORDER BY id ASC", $type_id) );
}

function dfdb_get_type_email($type_id) {
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_EMAIL . " WHERE type_id = %d ORDER BY id ASC", $type_id) );
}

function dfdb_get_last_id() {
    global $wpdb;
    return $wpdb->insert_id;
}

/* BASE UPDATE FUNCTIONS */
function dfdb_set_step_name($step_id, $step_name) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_STEPS, ["step_name" => $step_name], ["id" => $step_id]);
}

function dfdb_set_option_group($option_id, $group_name) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_OPTIONS, ["activate_group" => $group_name], ["id" => $option_id]);
}

function dfdb_set_option_name($option_id, $option_name) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_OPTIONS, ["option_name" => $option_name], ["id" => $option_id]);
}

function dfdb_set_history_group($history_id, $group_name) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_HISTORY, ["activate_group" => $group_name], ["id" => $history_id]);
}


/* AJAX UPDATE FUNCTIONS */
function handle_dfdb_set_step_name() {
    global $wpdb;
    try {
        df_check_post('step_id', 'step_name');
        $step_id = intval($_POST['step_id']);
        $step_name = sanitize_text_field($_POST['step_name']);

        if ($step_id <= 0 || empty($step_name)) {
            throw new DfDevisException("Invalid step ID or step name");
        }

        $result = dfdb_set_step_name($step_id, $step_name);
        if ($result === false) {
            throw new DfDevisException("Failed to update step name: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Step name updated successfully']);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_set_step_name', 'handle_dfdb_set_step_name');

function handle_dfdb_set_option_group() {
    global $wpdb;
    try {
        df_check_post('option_id', 'group_name');
        $option_id = intval($_POST['option_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if ($option_id <= 0 || empty($group_name)) {
            throw new DfDevisException("Invalid option ID or group name");
        }

        $result = dfdb_set_option_group($option_id, $group_name);
        if ($result === false) {
            throw new DfDevisException("Failed to update option group: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Option group updated successfully']);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_set_option_group', 'handle_dfdb_set_option_group');

function handle_dfdb_set_option_name() {
    global $wpdb;
    try {
        df_check_post('option_id', 'option_name');
        $option_id = intval($_POST['option_id']);
        $option_name = sanitize_text_field($_POST['option_name']);

        if ($option_id <= 0 || empty($option_name)) {
            throw new DfDevisException("Invalid option ID or option name");
        }

        $result = dfdb_set_option_name($option_id, $option_name);
        if ($result === false) {
            throw new DfDevisException("Failed to update option name: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Option name updated successfully']);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_set_option_name', 'handle_dfdb_set_option_name');

function handle_dfdb_set_history_group() {
    global $wpdb;
    try {
        df_check_post('history_id', 'group_name');
        $history_id = intval($_POST['history_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if ($history_id <= 0 || empty($group_name)) {
            throw new DfDevisException("Invalid history ID or group name");
        }

        $result = dfdb_set_history_group($history_id, $group_name);
        if ($result === false) {
            throw new DfDevisException("Failed to update history group: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'History group updated successfully']);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_set_history_group', 'handle_dfdb_set_history_group');


/* AJAX INSERT FUNCTIONS */
function handle_dfdb_create_step() {
    global $wpdb;
    try {
        df_check_post('step_name', 'post_id');
        $step_name = sanitize_text_field($_POST['step_name']);
        $post_id = intval($_POST['post_id']);

        if (empty($step_name) || $post_id <= 0) {
            throw new DfDevisException("Invalid step name or post ID");
        }
        $steps = dfdb_get_steps($post_id);
        $step_index = count($steps);
        $result = dfdb_create_step($step_name, $step_index, $post_id);
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
add_action('wp_ajax_dfdb_create_step', 'handle_dfdb_create_step');

function handle_dfdb_create_type() {
    global $wpdb;
    try {
        df_check_post('step_id', 'type_name', 'group_name');
        $step_id = intval($_POST['step_id']);
        $type_name = sanitize_text_field($_POST['type_name']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if ($step_id <= 0 || empty($type_name) || empty($group_name)) {
            throw new DfDevisException("Invalid step ID, type name or group name");
        }

        $result = dfdb_create_type($step_id, $type_name, $group_name);
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
add_action('wp_ajax_dfdb_create_step', 'handle_dfdb_create_step');

function handle_dfdb_create_option() {
    global $wpdb;
    try {
        df_check_post('option_name');
        $option_name = sanitize_text_field($_POST['option_name']);

        if (empty($option_name)) {
            throw new DfDevisException("Invalid option name");
        }

        $result = dfdb_create_option($option_name);
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
add_action('wp_ajax_dfdb_create_option', 'handle_dfdb_create_option');

function handle_dfdb_create_history() {
    global $wpdb;
    try {
        df_check_post('info');
        $info = sanitize_textarea_field($_POST['info']);

        if (empty($info)) {
            throw new DfDevisException("Invalid info");
        }

        $result = dfdb_create_history($info);
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
add_action('wp_ajax_dfdb_create_history', 'handle_dfdb_create_history');

function handle_dfdb_create_email() {
    global $wpdb;
    try {
        df_check_post('info');
        $info = sanitize_textarea_field($_POST['info']);

        if (empty($info)) {
            throw new DfDevisException("Invalid info");
        }

        $result = dfdb_create_email($info);
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
add_action('wp_ajax_dfdb_create_email', 'handle_dfdb_create_email');

/* CUSTOM CREATION FUNCTIONS */
function dfdb_create_specific_type($step_id, $type_name, $group_name) {
    global $wpdb;
    $result = dfdb_create_type($step_id, $type_name, $group_name);
    if ($result === false) {
        throw new DfDevisException("Failed to create type: " . $wpdb->last_error);
    }
    if ($type_name === 'options') {
        $result = dfdb_create_option('Option');
        if ($result === false) {
            throw new DfDevisException("Failed to create default option: " . $wpdb->last_error);
        }
    } elseif ($type_name === 'historique') {
        $result = dfdb_create_history('Historique');
        if ($result === false) {
            throw new DfDevisException("Failed to create default history: " . $wpdb->last_error);
        }
    } elseif ($type_name === 'email') {
        $result = dfdb_create_email('Email');
        if ($result === false) {
            throw new DfDevisException("Failed to create default email: " . $wpdb->last_error);
        }
    } else {
        throw new DfDevisException("Unknown type name: $type_name");
    }
    return $result;
}
add_action('wp_ajax_dfdb_create_specific_type', 'dfdb_create_specific_type');

/* AJAX CUSTOM CREATION FUNCTIONS */
function handle_dfdb_create_step_and_type() {
    global $wpdb;
    try {
        df_check_post('step_name', 'post_id', 'type_name', 'group_name');
        $step_name = sanitize_text_field($_POST['step_name']);
        $post_id = intval($_POST['post_id']);
        $type_name = sanitize_text_field($_POST['type_name']);
        $group_name = sanitize_text_field($_POST['group_name']);
        df_check_type($type_name);

        if (empty($step_name) || $post_id <= 0 || empty($type_name) || empty($group_name)) {
            throw new DfDevisException("Invalid step name, post ID, type name or group name");
        }

        $steps = dfdb_get_steps($post_id);
        $step_index = count($steps);
        $result = dfdb_create_step($step_name, $step_index, $post_id);
        if ($result === false) {
            throw new DfDevisException("Failed to create step: " . $wpdb->last_error);
        }

        $result = dfdb_create_specific_type($wpdb->insert_id, $type_name, $group_name);
        if ($result === false) {
            throw new DfDevisException("Failed to create type: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Step and type created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_create_step_and_type', 'handle_dfdb_create_step_and_type');

function handle_dfdb_create_step_and_types() {
    global $wpdb;
    try {
        df_check_post('step_name', 'post_id', 'group_name');
        $step_name = sanitize_text_field($_POST['step_name']);
        $post_id = intval($_POST['post_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if (empty($step_name) || $post_id <= 0) {
            throw new DfDevisException("Invalid step name or post ID");
        }

        if (empty($group_name)) {
            $group_name = 'Root'; // Default group name
        }

        $steps = dfdb_get_steps($post_id);
        $step_index = count($steps);
        $result = dfdb_create_step($step_name, $step_index, $post_id);
        if ($result === false) {
            throw new DfDevisException("Failed to create step: " . $wpdb->last_error);
        }  

        $types = ['options', 'historique', 'email'];
        foreach ($types as $type_name) {
            $result = dfdb_create_specific_type($wpdb->insert_id, $type_name, $group_name);
            if ($result === false) {
                throw new DfDevisException("Failed to create type $type_name: " . $wpdb->last_error);
            }
        }

        wp_send_json_success(['message' => 'Step and types created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_create_step_and_types', 'handle_dfdb_create_step_and_types');

/* GET FUNCTIONS */
function handle_dfdb_get_steps_and_first_content() {
    global $wpdb;
    try {
        df_check_post('post_id');
        $post_id = intval($_POST['post_id']);

        $step_info = [];

        $steps = dfdb_get_steps($post_id);
        if (empty($steps)) {
            // Fine for now
        } else {
            $types = dfdb_get_types($steps[0]->id);
            if (empty($types)) {
                // Fine for now
            } else {
                foreach ($types as $type) {
                    $type_info = [
                        'id' => $type->id,
                        'name' => $type->type_name,
                        'group' => $type->group_name,
                        'options' => dfdb_get_type_options($type->id),
                        'history' => dfdb_get_type_history($type->id),
                        'email' => dfdb_get_type_email($type->id)
                    ];
                    $step_info[] = $type_info;
                }
            }
        }

        wp_send_json_success(['message' => 'Steps and first content retrieved successfully', 'steps' => $steps, 'step_info' => $step_info]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_get_steps_and_first_content', 'handle_dfdb_get_steps_and_first_content');


// none because i don't have the implementation yet



/* UNINSTALL FUNCTIONS */
function dfdb_delete_database() {
    global $wpdb;
    $tables = [
        DFDEVIS_TABLE_OPTIONS,
        DFDEVIS_TABLE_HISTORY,
        DFDEVIS_TABLE_EMAIL,
        DFDEVIS_TABLE_TYPES,
        DFDEVIS_TABLE_STEP_TYPES,
        DFDEVIS_TABLE_STEPS
    ];
    foreach ($tables as $table) {
        $deleted = $wpdb->query("DROP TABLE IF EXISTS $table");
        if ($deleted === false) {
            error_log("Failed to delete table $table: " . $wpdb->last_error);
        }
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
function dfdb_get_options($devis_id) {
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
function dfdb_delete_step_options($devis_id, $step_index)
{
	global $wpdb;

    $devis_options = $wpdb->prefix . 'df_devis_options';
    return $wpdb->delete($devis_options, ['step_index' => $step_index, 'devis_id' => $devis_id]);
}


*/