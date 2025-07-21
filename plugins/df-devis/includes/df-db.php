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
        image TEXT DEFAULT NULL,
        data JSON,
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
    $result = $wpdb->insert(DFDEVIS_TABLE_OPTIONS, ["type_id" => $type_id, "option_name" => $option_name, "data" => json_encode([])]);
    if ($result === false) {
        return false;
    }
    $last_id = $wpdb->insert_id;
    $group_name = 'gp_' . $last_id;
    return $wpdb->update(DFDEVIS_TABLE_OPTIONS, ["activate_group" => $group_name], ["id" => $last_id]);
}

function dfdb_create_history($type_id, $info) {
    global $wpdb;
    $result = $wpdb->insert(DFDEVIS_TABLE_HISTORY, ["type_id" => $type_id, "info" => $info]);
    if ($result === false) {
        return false;
    }
    $last_id = $wpdb->insert_id;
    $group_name = 'gp_' . $last_id;
    return $wpdb->update(DFDEVIS_TABLE_HISTORY, ["activate_group" => $group_name], ["id" => $last_id]);
}

function dfdb_create_email($type_id, $info) {
    global $wpdb;
    return $wpdb->insert(DFDEVIS_TABLE_EMAIL, ["type_id" => $type_id, "info" => $info]);
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

function dfdb_set_type_name($type_id, $type_name) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_TYPES, ["type_name" => $type_name], ["id" => $type_id]);
}

// Set the type name of the types associated with a step and group
function dfdb_set_type_name_by_step_and_group($step_id, $group_name, $type_name) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_TYPES, ['type_name' => $type_name], ['step_id' => $step_id, 'group_name' => $group_name]);
}


/* AJAX UPDATE FUNCTIONS */
function handle_dfdb_set_step_name() {
    global $wpdb;
    try {
        df_check_post('step_id', 'step_name');
        $step_id = intval($_POST['step_id']);
        $step_name = sanitize_text_field($_POST['step_name']);

        if ($step_id <= 0 || empty($step_name)) {
            throw new DfDevisException
            ("Invalid step ID or step name");
        }

        $result = dfdb_set_step_name($step_id, $step_name);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update step name: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Step name updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
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
            throw new DfDevisException
            ("Invalid option ID or group name");
        }

        $result = dfdb_set_option_group($option_id, $group_name);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update option group: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Option group updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
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
            throw new DfDevisException
            ("Invalid option ID or option name");
        }

        $result = dfdb_set_option_name($option_id, $option_name);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update option name: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Option name updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_set_option_name', 'handle_dfdb_set_option_name');

/*
// Add json value to an option's data
function dfdb_option_add_data_value($option_id, $type, $value) {
    global $wpdb;
    $option = dfdb_get_option($option_id);
    if (!$option) {
        throw new DfDevisException("Option not found");
    }

    $added = ['type' => $type, 'value' => $value];

    $data = json_decode($option->data, true);
    if (!is_array($data)) {
        $data = [];
    }
    $data[] = $added;
    $data_json = json_encode($data);

    $result = $wpdb->update(DFDEVIS_TABLE_OPTIONS, ['data' => $data_json], ['id' => $option_id]);
    if ($result === false) {
        throw new DfDevisException("Failed to update option data: " . $wpdb->last_error);
    }
    return $result;
}

function handle_dfdb_option_add_data_value() {
    try {
        df_check_post('option_id', 'type', 'value');
        $option_id = intval($_POST['option_id']);
        $type = sanitize_text_field($_POST['type']);
        $value = sanitize_text_field($_POST['value']);

        if ($option_id <= 0 || empty($type) || empty($value)) {
            throw new DfDevisException
            ("Invalid option ID, type or value");
        }

        $result = dfdb_option_add_data_value($option_id, $type, $value);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to add data value: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Data value added successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_option_add_data_value', 'handle_dfdb_option_add_data_value');


// Update a specific data value in an option's data
function dfdb_option_update_data_value($option_id, $index, $type, $value) {
    global $wpdb;
    $option = dfdb_get_option($option_id);
    if (!$option) {
        throw new DfDevisException("Option not found");
    }

    $data = json_decode($option->data, true);
    if (!is_array($data) || !isset($data[$index])) {
        throw new DfDevisException("Invalid data index");
    }

    $data[$index] = ['type' => $type, 'value' => $value];
    $data_json = json_encode($data);

    $result = $wpdb->update(DFDEVIS_TABLE_OPTIONS, ['data' => $data_json], ['id' => $option_id]);
    if ($result === false) {
        throw new DfDevisException("Failed to update option data: " . $wpdb->last_error);
    }
    return $result;
}

function handle_dfdb_option_update_data_value() {
    try {
        df_check_post('option_id', 'index', 'type', 'value');
        $option_id = intval($_POST['option_id']);
        $index = intval($_POST['index']);
        $type = sanitize_text_field($_POST['type']);
        $value = sanitize_text_field($_POST['value']);

        if ($option_id <= 0 || $index < 0 || empty($type) || empty($value)) {
            throw new DfDevisException
            ("Invalid option ID, index, type or value");
        }

        error_log("Updating data value for option ID: $option_id, index: $index, type: $type, value: $value");

        $result = dfdb_option_update_data_value($option_id, $index, $type, $value);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update data value: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Data value updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_option_update_data_value', 'handle_dfdb_option_update_data_value');


// Remove a data value from an option's data
function dfdb_option_remove_data_value($option_id, $index) {
    global $wpdb;
    $option = dfdb_get_option($option_id);
    if (!$option) {
        throw new DfDevisException("Option not found");
    }

    $data = json_decode($option->data, true);
    if (!is_array($data) || !isset($data[$index])) {
        throw new DfDevisException("Invalid data index");
    }

    unset($data[$index]);
    $data = array_values($data); // Re-index the array
    $data_json = json_encode($data);

    $result = $wpdb->update(DFDEVIS_TABLE_OPTIONS, ['data' => $data_json], ['id' => $option_id]);
    if ($result === false) {
        throw new DfDevisException("Failed to update option data: " . $wpdb->last_error);
    }
    return $result;
}

function handle_dfdb_option_remove_data_value() {
    try {
        df_check_post('option_id', 'index');
        $option_id = intval($_POST['option_id']);
        $index = intval($_POST['index']);

        if ($option_id <= 0 || $index < 0) {
            throw new DfDevisException
            ("Invalid option ID or index");
        }

        $result = dfdb_option_remove_data_value($option_id, $index);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to remove data value: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Data value removed successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_option_remove_data_value', 'handle_dfdb_option_remove_data_value');
*/


function dfdb_option_set_image($option_id, $image_url) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_OPTIONS, ["image" => $image_url], ["id" => $option_id]);
}   

function handle_dfdb_option_set_image() {
    global $wpdb;
    try {
        df_check_post('option_id');
        $option_id = intval($_POST['option_id']);
        $image_url = isset($_POST['image_url']) ? sanitize_text_field($_POST['image_url']) : null;

        if ($option_id <= 0) {
            throw new DfDevisException
            ("Invalid option ID or image URL");
        }

        $result = dfdb_option_set_image($option_id, $image_url);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update option image: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Option image updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_option_set_image', 'handle_dfdb_option_set_image');


function dfdb_option_set_data($option_id, $data) {
    global $wpdb;
    $data_json = json_encode($data);
    return $wpdb->update(DFDEVIS_TABLE_OPTIONS, ["data" => $data_json], ["id" => $option_id]);
}

function handle_dfdb_option_set_data_cost() {
    global $wpdb;
    try {
        df_check_post('option_id', 'cost');
        $option_id = intval($_POST['option_id']);
        $cost = floatval($_POST['cost']);
        
        if ($option_id <= 0) {
            throw new DfDevisException("Invalid option ID");
        }

        $data = dfdb_get_option_data($option_id);
        $data['cost']['money'] = $cost;

        $result = dfdb_option_set_data($option_id, $data);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update option data: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Option data updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_option_set_data_cost', 'handle_dfdb_option_set_data_cost');


function handle_dfdb_option_set_cost_history_visible() {
    global $wpdb;
    try {
        df_check_post('option_id', 'visible');
        $option_id = intval($_POST['option_id']);
        $visible = filter_var($_POST['visible'], FILTER_VALIDATE_BOOLEAN);

        if ($option_id <= 0) {
            throw new DfDevisException("Invalid option ID");
        }

        $data = dfdb_get_option_data($option_id);
        $data['cost']['history_visible'] = $visible;

        $result = dfdb_option_set_data($option_id, $data);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update option data: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Option cost history visibility updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_option_set_cost_history_visible', 'handle_dfdb_option_set_cost_history_visible');



function handle_dfdb_option_set_cost_option_visible() {
    global $wpdb;
    try {
        df_check_post('option_id', 'visible');
        $option_id = intval($_POST['option_id']);
        $visible = filter_var($_POST['visible'], FILTER_VALIDATE_BOOLEAN);

        if ($option_id <= 0) {
            throw new DfDevisException("Invalid option ID");
        }

        $data = dfdb_get_option_data($option_id);
        $data['cost']['option_visible'] = $visible;

        $result = dfdb_option_set_data($option_id, $data);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update option data: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Option cost visibility updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_option_set_cost_option_visible', 'handle_dfdb_option_set_cost_option_visible');




function handle_dfdb_set_history_group() {
    global $wpdb;
    try {
        df_check_post('history_id', 'group_name');
        $history_id = intval($_POST['history_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if ($history_id <= 0 || empty($group_name)) {
            throw new DfDevisException
            ("Invalid history ID or group name");
        }

        $result = dfdb_set_history_group($history_id, $group_name);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update history group: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'History group updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_set_history_group', 'handle_dfdb_set_history_group');

function handle_dfdb_set_type_name() {
    global $wpdb;
    try {
        df_check_post('type_id', 'type_name');
        $type_id = intval($_POST['type_id']);
        $type_name = sanitize_text_field($_POST['type_name']);
        df_check_type($type_name);

        if ($type_id <= 0 || empty($type_name)) {
            throw new DfDevisException
            ("Invalid type ID or type name");
        }

        $result = dfdb_set_type_name($type_id, $type_name);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to update type name: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Type name updated successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_set_type_name', 'handle_dfdb_set_type_name');

/* AJAX INSERT FUNCTIONS */
function handle_dfdb_create_step() {
    global $wpdb;
    try {
        df_check_post('step_name', 'post_id');
        $step_name = sanitize_text_field($_POST['step_name']);
        $post_id = intval($_POST['post_id']);

        if (empty($step_name) || $post_id <= 0) {
            throw new DfDevisException
            ("Invalid step name or post ID");
        }
        $steps = dfdb_get_steps($post_id);
        $step_index = count($steps);
        $result = dfdb_create_step($step_name, $step_index, $post_id);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create step: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Step created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException
     $e) {
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
            throw new DfDevisException
            ("Invalid step ID, type name or group name");
        }

        $result = dfdb_create_type($step_id, $type_name, $group_name);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create type: " . dfdb_error());
        }  

        wp_send_json_success(['message' => 'Type created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException
     $e) {
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
            throw new DfDevisException
            ("Invalid option name");
        }

        $result = dfdb_create_option($option_name);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create option: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Option created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException
     $e) {
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
            throw new DfDevisException
            ("Invalid info");
        }

        $result = dfdb_create_history($info);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create history: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'History created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException
     $e) {
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
            throw new DfDevisException
            ("Invalid info");
        }

        $result = dfdb_create_email($info);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create email: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Email created successfully', 'id' => $wpdb->insert_id]);
        wp_die();
    } catch (DfDevisException
     $e) {
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
        throw new DfDevisException
        ("Failed to create type: " . dfdb_error());
    }
    $last_id = $wpdb->insert_id;
    if ($type_name === 'options') {
        $result = dfdb_create_option($last_id, 'Option');
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create default option: " . dfdb_error());
        }
    } elseif ($type_name === 'historique') {
        $result = dfdb_create_history($last_id, 'Historique');
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create default history: " . dfdb_error());
        }
    } elseif ($type_name === 'email') {
        $result = dfdb_create_email($last_id, 'Email');
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create default email: " . dfdb_error());
        }
    } else {
        throw new DfDevisException
        ("Unknown type name: $type_name");
    }
    return $result;
}
add_action('wp_ajax_dfdb_create_specific_type', 'dfdb_create_specific_type');

/* AJAX CUSTOM CREATION FUNCTIONS */
function handle_dfdb_create_default_types() {
    try {
        df_check_post('step_id', 'group_name');
        $step_id = intval($_POST['step_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if ($step_id <= 0 || empty($group_name)) {
            throw new DfDevisException
            ("Invalid step ID or group name");
        }

        $result = dfdb_create_type($step_id, 'options', $group_name);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create options type: " . dfdb_error());
        }
        $type_id = dfdb_id();

        $result = dfdb_create_option($type_id, 'Option');
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create default option: " . dfdb_error());
        }  
        $option_id = dfdb_id();

        $result = dfdb_create_history($type_id, 'Historique');
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create default history: " . dfdb_error());
        }
        $history_id = dfdb_id();

        $result = dfdb_create_email($type_id, 'Email');
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create default email: " . dfdb_error());
        }
        $email_id = dfdb_id();

        wp_send_json_success(['message' => 'Default types created successfully', 'type_id' => $type_id, 'option_id' => $option_id, 'history_id' => $history_id, 'email_id' => $email_id]);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_create_default_types', 'handle_dfdb_create_default_types');


/* GET FUNCTIONS */
function dfdb_get_steps($post_id) { // Returns all steps for a given post ordered by step index
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d ORDER BY step_index ASC", $post_id) );
}

function dfdb_get_step_by_index($post_id, $step_index) {
    global $wpdb;
    return $wpdb->get_row( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d AND step_index = %d", $post_id, $step_index) );
}

// general type
function dfdb_get_type_by_step_and_group($step_id, $group_name) {
    global $wpdb;
    return $wpdb->get_row( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_TYPES . " WHERE step_id = %d AND group_name = %s", $step_id, $group_name) );
}

// options
function dfdb_get_options_by_step_and_group($step_id, $group_name) {
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT o.* FROM " . DFDEVIS_TABLE_OPTIONS . " o INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON o.type_id = t.id WHERE t.step_id = %d AND t.group_name = %s ORDER BY o.id ASC", $step_id, $group_name) );
}

function handle_dfdb_get_options_by_step_and_group() {
    global $wpdb;
    try {
        df_check_post('step_id', 'group_name');
        $step_id = intval($_POST['step_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if ($step_id <= 0 || empty($group_name)) {
            throw new DfDevisException
            ("Invalid step ID or group name");
        }

        $options = dfdb_get_options_by_step_and_group($step_id, $group_name);
        wp_send_json_success(['message' => 'Options retrieved successfully', 'content' => $options]);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_get_options_by_step_and_group', 'handle_dfdb_get_options_by_step_and_group');

// history
function dfdb_get_history_by_step_and_group($step_id, $group_name) {
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT h.* FROM " . DFDEVIS_TABLE_HISTORY . " h INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON h.type_id = t.id WHERE t.step_id = %d AND t.group_name = %s ORDER BY h.id ASC", $step_id, $group_name) );
}

function handle_dfdb_get_history_by_step_and_group() {
    global $wpdb;
    try {
        df_check_post('step_id', 'group_name');
        $step_id = intval($_POST['step_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if ($step_id <= 0 || empty($group_name)) {
            throw new DfDevisException
            ("Invalid step ID or group name");
        }

        $history = dfdb_get_history_by_step_and_group($step_id, $group_name);
        wp_send_json_success(['message' => 'History retrieved successfully', 'content' => $history]);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_get_history_by_step_and_group', 'handle_dfdb_get_history_by_step_and_group');

// email
function dfdb_get_email_by_step_and_group($step_id, $group_name) {
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT e.* FROM " . DFDEVIS_TABLE_EMAIL . " e INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON e.type_id = t.id WHERE t.step_id = %d AND t.group_name = %s ORDER BY e.id ASC", $step_id, $group_name) );
}   

function handle_dfdb_get_email_by_step_and_group() {
    global $wpdb;
    try {
        df_check_post('step_id', 'group_name');
        $step_id = intval($_POST['step_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        if ($step_id <= 0 || empty($group_name)) {
            throw new DfDevisException
            ("Invalid step ID or group name");
        }

        $email = dfdb_get_email_by_step_and_group($step_id, $group_name);
        wp_send_json_success(['message' => 'Email retrieved successfully', 'content' => $email]);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_get_email_by_step_and_group', 'handle_dfdb_get_email_by_step_and_group');

function dfdb_get_all_steps() {
    global $wpdb;
    return $wpdb->get_results("SELECT * FROM " . DFDEVIS_TABLE_STEPS . " ORDER BY post_id ASC, step_index ASC");
}   

function dfdb_get_types($step_id) {
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_TYPES . " WHERE step_id = %d ORDER BY id ASC", $step_id) );
}

function dfdb_get_options($post_id) { // Returns all the options for a given post ordered by step index and type id
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT s.step_index, t.id AS type_id, t.type_name, t.group_name as group_name, o.* FROM " . DFDEVIS_TABLE_OPTIONS . " o INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON o.type_id = t.id INNER JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id WHERE s.post_id = %d ORDER BY s.step_index ASC, t.id ASC, o.id ASC", $post_id) );
}

function dfdb_get_history($post_id) { // Returns all the history for a given post ordered by step index and type id
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT s.step_index, t.id AS type_id, t.type_name, t.group_name as group_name, h.* FROM " . DFDEVIS_TABLE_HISTORY . " h INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON h.type_id = t.id INNER JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id WHERE s.post_id = %d ORDER BY s.step_index ASC, t.id ASC, h.id ASC", $post_id) );
}

function dfdb_get_email($post_id) { // Returns all the email for a given post ordered by step index and type id
    global $wpdb;
    return $wpdb->get_results( $wpdb->prepare("SELECT s.step_index, t.id AS type_id, t.type_name, t.group_name as group_name, e.* FROM " . DFDEVIS_TABLE_EMAIL . " e INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON e.type_id = t.id INNER JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id WHERE s.post_id = %d ORDER BY s.step_index ASC, t.id ASC, e.id ASC", $post_id) );
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

function dfdb_get_options_type_id($option_id) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare("SELECT type_id FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE id = %d", $option_id) );
}

function dfdb_get_option($option_id) {
    global $wpdb;
    return $wpdb->get_row( $wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE id = %d", $option_id) );
}

function dfdb_get_options_activate_group($option_id) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare("SELECT activate_group FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE id = %d", $option_id) );
}

function dfdb_get_history_type_id($history_id) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare("SELECT type_id FROM " . DFDEVIS_TABLE_HISTORY . " WHERE id = %d", $history_id) );
}

function dfdb_get_history_activate_group($history_id) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare("SELECT activate_group FROM " . DFDEVIS_TABLE_HISTORY . " WHERE id = %d", $history_id) );
}

function dfdb_get_email_type_id($email_id) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare("SELECT type_id FROM " . DFDEVIS_TABLE_EMAIL . " WHERE id = %d", $email_id) );
}

function dfdb_get_option_step_index($option_id) {
    global $wpdb;
    $step = $wpdb->get_row( $wpdb->prepare("SELECT s.step_index FROM " . DFDEVIS_TABLE_OPTIONS . " o INNER JOIN " . DFDEVIS_TABLE_TYPES . " t ON o.type_id = t.id INNER JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id WHERE o.id = %d", $option_id) );
    return $step ? $step->step_index : null;
}

function dfdb_get_step_id_by_index($post_id, $step_index) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare("SELECT id FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d AND step_index = %d", $post_id, $step_index) );
}

function dfdb_get_option_data($option_id) {
    global $wpdb;
    $option = dfdb_get_option($option_id);
    if (!$option) {
        throw new DfDevisException("Option not found");
    }
    $data = json_decode($option->data, true);
    if (!is_array($data)) {
        $data = [];
    }
    return $data;
}

function dfdb_id() {
    global $wpdb;
    return $wpdb->insert_id;
}
function dfdb_error() {
    global $wpdb;
    return $wpdb->last_error;
}  



/* UNINSTALL FUNCTIONS */
function dfdb_delete_types_by_group($type_id, $group_name) {
    global $wpdb;
    return $wpdb->delete(DFDEVIS_TABLE_TYPES, ['id' => $type_id, 'group_name' => $group_name]);
}

function dfdb_delete_option($option_id) {
    global $wpdb;
    return $wpdb->delete(DFDEVIS_TABLE_OPTIONS, ['id' => $option_id]);
}

function dfdb_delete_step($step_id) {
    global $wpdb;
    return $wpdb->delete(DFDEVIS_TABLE_STEPS, ['id' => $step_id]);
}

function handle_dfdb_delete_option() {
    global $wpdb;
    try {
        df_check_post('option_id');
        $option_id = intval($_POST['option_id']);

        if ($option_id <= 0) {
            throw new DfDevisException
            ("Invalid option ID");
        }

        // get the type_id of the option to delete
        $type_id = dfdb_get_options_type_id($option_id);
        if ($type_id === null) {
            throw new DfDevisException
            ("Option does not have a type ID >:(");
        }

        $activate_group = dfdb_get_options_activate_group($option_id);
        if ($activate_group === null) {
            throw new DfDevisException
            ("Option does not have an activate group >:(");
        }

        // delete every type that are triggered by the option
        $result = dfdb_delete_types_by_group($type_id, $activate_group);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to delete types by group: " . dfdb_error());
        }

        $result = dfdb_delete_option($option_id);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to delete option: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Option deleted successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_delete_option', 'handle_dfdb_delete_option');

function handle_dfdb_delete_step() {
    global $wpdb;
    try {
        df_check_post('step_id');
        $post_id = intval($_POST['post_id']);
        $step_id = intval($_POST['step_id']);
        $step_index = intval($_POST['step_index']);

        if ($post_id <= 0 || $step_id <= 0 || $step_index < 0) {
            throw new DfDevisException
            ("Invalid post ID, step ID or step index");
        }

        // Delete all steps that come after the step to delete
        $steps = dfdb_get_steps($post_id);
        foreach ($steps as $step) {
            if ($step->step_index > $step_index) {
                $result = dfdb_delete_step($step->id);
                if ($result === false) {
                    throw new DfDevisException
                    ("Failed to delete step: " . dfdb_error());
                }
            }
        }

        // Delete the step itself
        $result = dfdb_delete_step($step_id);
        if ($result === false) {
            throw new DfDevisException
            ("Failed to delete step: " . dfdb_error());
        }

        wp_send_json_success(['message' => 'Step deleted successfully']);
        wp_die();
    } catch (DfDevisException
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_delete_step', 'handle_dfdb_delete_step');

/**
 * Deletes all options, history, and email entries that are not in use for a given post ID.
 */
function dfdb_delete_options_not_in_use($post_id) {
    global $wpdb;
    return $wpdb->query(
        $wpdb->prepare(
            "DELETE o FROM " . DFDEVIS_TABLE_OPTIONS . " o
            LEFT JOIN " . DFDEVIS_TABLE_TYPES . " t ON o.type_id = t.id
            LEFT JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id
            WHERE s.post_id = %d AND t.type_name != 'options'",
            $post_id
        )
    );
}

function dfdb_delete_history_not_in_use($post_id) {
    global $wpdb;
    return $wpdb->query(
        $wpdb->prepare(
            "DELETE h FROM " . DFDEVIS_TABLE_HISTORY . " h
            LEFT JOIN " . DFDEVIS_TABLE_TYPES . " t ON h.type_id = t.id
            LEFT JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id
            WHERE s.post_id = %d AND t.type_name != 'historique'",
            $post_id
        )
    );
}

function dfdb_delete_email_not_in_use($post_id) {
    global $wpdb;
    return $wpdb->query(
        $wpdb->prepare(
            "DELETE e FROM " . DFDEVIS_TABLE_EMAIL . " e
            LEFT JOIN " . DFDEVIS_TABLE_TYPES . " t ON e.type_id = t.id
            LEFT JOIN " . DFDEVIS_TABLE_STEPS . " s ON t.step_id = s.id
            WHERE s.post_id = %d AND t.type_name != 'formulaire'",
            $post_id
        )
    );
}


/**
 * Generates all options, history, and email entries that are not present for a given post ID. (Used when you want to edit a post again)
 */
function dfdb_generate_types_not_in_use($post_id) {
    global $wpdb;
    $steps = dfdb_get_steps($post_id);
    foreach ($steps as $step) {
        $types = dfdb_get_types($step->id);
        $step_index = intval($step->step_index);
        foreach ($types as $type) {
            $type_id = intval($type->id);
            $type_name = sanitize_text_field($type->type_name);
            if ($type_name !== 'options') {
                dfdb_generate_missing_options($type_id);
            }
            if ($type_name !== 'historique' && $step_index > 0) {
                dfdb_generate_missing_history($type_id);
            }
            if ($type_name !== 'email' && $step_index > 0) {
                dfdb_generate_missing_email($type_id);
            }
        }
    }
}

function dfdb_generate_missing_options($type_id) {
    $options = dfdb_get_type_options($type_id);
    if (empty($options)) {
        $result = dfdb_create_option($type_id, 'Option');
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create default option: " . dfdb_error());
        }
    }
}

function dfdb_generate_missing_history($type_id) {
    $history = dfdb_get_type_history($type_id);
    if (empty($history)) {
        $result = dfdb_create_history($type_id, 'Historique');
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create default history: " . dfdb_error());
        }
    }
}

function dfdb_generate_missing_email($type_id) {
    $email = dfdb_get_type_email($type_id);
    if (empty($email)) {
        $result = dfdb_create_email($type_id, 'Email');
        if ($result === false) {
            throw new DfDevisException
            ("Failed to create default email: " . dfdb_error());
        }
    }
}


function handle_dfdb_remove_unused_data() {
    global $wpdb;
    try {
        $post_id = intval($_POST['post_id']);

        if ($post_id <= 0) {
            throw new DfDevisException("Invalid post ID");
        }
        // if the post exists
        $post = get_post($post_id);
        if ($post)
        {
            // If the post exists, we need to delete all options, history, and email entries that are not in use
            $result_options = dfdb_delete_options_not_in_use($post_id);
            if ($result_options === false) {
                throw new DfDevisException("Failed to delete unused options: " . dfdb_error());
            }

            $result_history = dfdb_delete_history_not_in_use($post_id);
            if ($result_history === false) {
                throw new DfDevisException("Failed to delete unused history: " . dfdb_error());
            }

            $result_email = dfdb_delete_email_not_in_use($post_id);
            if ($result_email === false) {
                throw new DfDevisException("Failed to delete unused email: " . dfdb_error());
            }

            // Get every option of the post
            $options = dfdb_get_options($post_id);
            $history = dfdb_get_history($post_id);
            $types = dfdb_get_post_types($post_id);

            // check if there are any types associated with the option's activate_group
            foreach ($options as $option) {
                foreach ($types as $type) {
                    if ($option->activate_group === $type->group_name) {
                        continue 2; // If a type is found with the same activate_group, we can skip this option
                    }
                }

                // If no types are found, we need to create a formulaire type that is a follow-up of the option
                // Get the step index if the option
                $step_index = dfdb_get_option_step_index($option->id);
                if ($step_index === null) {
                    throw new DfDevisException("Option does not have a step index >:(");
                }

                // Check if a step exists with a step index of $step_index + 1
                $next_step = dfdb_get_step_by_index($post_id, $step_index + 1);
                if ($next_step === null) {
                    // If no step exists with a step index of $step_index + 1, we need to create a new step
                    $result = dfdb_create_step('Etape ' . ($step_index + 1), $step_index + 1, $post_id);
                    if ($result === false) {
                        throw new DfDevisException("Failed to create step: " . dfdb_error());
                    }
                    $step_id = dfdb_id(); // Get the newly created step ID
                } else {
                    $step_id = $next_step->id;
                }

                $result = dfdb_create_type($step_id, 'formulaire', $option->activate_group);
                if ($result === false) {
                    throw new DfDevisException("Failed to create type for option: " . dfdb_error());
                }
            }

            // check if there are any types associated with the history's activate_group
            foreach ($history as $hist) {
                foreach ($types as $type) {
                    if ($hist->activate_group === $type->group_name) {
                        continue 2; // If a type is found with the same activate_group, we can skip this history
                    }
                }   
                
                // If no types are found, we need to create a historique type that is a follow-up of the history
                // Get the step index if the history
                $step_index = dfdb_get_option_step_index($hist->id);
                if ($step_index === null) {
                    throw new DfDevisException("History does not have a step index >:(");
                }

                // Check if a step exists with a step index of $step_index + 1
                $next_step = dfdb_get_step_by_index($post_id, $step_index + 1);
                if ($next_step === null) {
                    // If no step exists with a step index of $step_index + 1, we need to create a new step
                    $result = dfdb_create_step('Etape ' . ($step_index + 1), $step_index + 1, $post_id);
                    if ($result === false) {
                        throw new DfDevisException("Failed to create step:  " . dfdb_error());
                    }
                    $step_id = dfdb_id(); // Get the newly created step ID
                } else {
                    $step_id = $next_step->id;
                }

                $result = dfdb_create_type($step_id, 'historique', $hist->activate_group);
                if ($result === false) {
                    throw new DfDevisException("Failed to create type for history: " . dfdb_error());
                }
            }
        }

        // Get all the steps in the db
        $steps = dfdb_get_all_steps();

        // check if the post associated with the step exists
        foreach ($steps as $step) {
            $postid = intval($step->post_id);

            // Get the actual post here
            $post = get_post($postid);
            if (!$post || in_array($post->post_status, ['auto-draft', 'trash'])) {
                // If the post does not exist but it is the one passed in the request, we need to save the post to not lose data
                $result = dfdb_delete_step($step->id);
                if ($result === false) {
                    throw new DfDevisException("Failed to delete step: " . dfdb_error());
                }
            }
        }


        wp_send_json_success(['message' => 'Unused data deleted successfully']);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_remove_unused_data', 'handle_dfdb_remove_unused_data');

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
            error_log("Failed to delete table $table: " . dfdb_error());
        }
    }
}