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

/**
 * Steps table:
 * - id: unique id
 * - step_name: name of the step
 * - step_index: index of the step in the process
 * - post_id: the post id this step belongs to
 * - type: type of step (options or product) ENUM
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

/**
 * Options table:
 * - id: unique id
 * - option_name: name of the option
 * - step_id: the step this option belongs to
 * - activate_id : the id of the step that is activated by this option
 * - image_url: URL of the image associated with the option
 * - data: JSON data for additional option details
 */
function dvdb_create_option($step_id, $option_name, $activate_id) {
    global $wpdb;
    $wpdb->insert(DFDEVIS_TABLE_OPTIONS, [
        'option_name' => $option_name, 
        'activate_id' => $activate_id, 
        'step_id' => $step_id
    ]);
    return $wpdb->insert_id;
}

/**
 * Product table:
 * - id: unique id
 * - step_id: the step this product belongs to
 * - data: JSON data for product details
 */
function dvdb_create_product($step_id) {
    global $wpdb;
    $wpdb->insert(DFDEVIS_TABLE_PRODUCT, [
        'step_id' => $step_id,
        'data' => json_encode([])
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

function dvdb_get_steps_by_index($post_id, $step_index) {
    global $wpdb;
    return $wpdb->get_results($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d AND step_index = %d", $post_id, $step_index));
}

function dvdb_get_options_by_step($step_id) {
    global $wpdb;
    return $wpdb->get_results($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE step_id = %d", $step_id));
}

function dvdb_get_product_by_step($step_id) {
    global $wpdb;
    return $wpdb->get_row($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_PRODUCT . " WHERE step_id = %d", $step_id));
}

function dvdb_get_option_activate_id($option_id) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare("SELECT activate_id FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE id = %d", $option_id));
}

function dvdb_get_option_by_activate_id($activate_id) {
    global $wpdb;
    return $wpdb->get_row($wpdb->prepare("SELECT * FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE activate_id = %d", $activate_id));
}

function dvdb_get_step_index_count($post_id) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare("SELECT COUNT(DISTINCT step_index) FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d", $post_id));
}

function dfdb_get_email_product_data($email_id) {
    global $wpdb;
    $email = $wpdb->get_row( $wpdb->prepare("SELECT data FROM " . DFDEVIS_TABLE_PRODUCT . " WHERE id = %d", $email_id) );
    if ($email) {
        return json_decode($email->data, true);
    }
    return null;
}

function dvdb_get_option_data($option_id) {
    global $wpdb;
    $option = $wpdb->get_row($wpdb->prepare("SELECT data FROM " . DFDEVIS_TABLE_OPTIONS . " WHERE id = %d", $option_id));
    if ($option) {
        return json_decode($option->data, true);
    }
    return null;
}

function dvdb_does_option_have_future_product($option_id) {
    $option = dvdb_get_option($option_id);
    if (!$option) {
        return ['status' => 'option manquantes', 'state' => false];
    }
    
    $activated_step = dvdb_get_step($option->activate_id);
    if (!$activated_step) {
        return ['status' => 'étape manquante', 'state' => false];
    }

    $product = dvdb_get_product_by_step($activated_step->id);
    if ($product) {
        $product_data = json_decode($product->data, true);
        if (!isset($product_data['name']) || empty($product_data['name'])) {
            return ['status' => 'produit manquant', 'state' => false];
        }
    } else {
        $options = dvdb_get_options_by_step($activated_step->id);
        if (empty($options)) {
            return ['status' => 'aucune option', 'state' => false];
        }

        foreach ($options as $opt) {
            $result = dvdb_does_option_have_future_product($opt->id);
            if ($result['state'] === false) {
                return $result;
            }
        }
    }
    
    return ['status' => 'success', 'state' => true];
}

/**
 * Update functions
 */
function dvdb_set_step_name($post_id, $step_index, $step_name) {
    global $wpdb;
    $updated = $wpdb->update(DFDEVIS_TABLE_STEPS, ['step_name' => $step_name], ['post_id' => $post_id, 'step_index' => $step_index]);
    return $updated !== false;
}

function dvdb_set_option_name($option_id, $option_name) {
    global $wpdb;
    $updated = $wpdb->update(DFDEVIS_TABLE_OPTIONS, ['option_name' => $option_name], ['id' => $option_id]);
    return $updated !== false;
}

function dvdb_set_option_activate_id($option_id, $activate_id) {
    global $wpdb;
    $updated = $wpdb->update(DFDEVIS_TABLE_OPTIONS, ['activate_id' => $activate_id], ['id' => $option_id]);
    return $updated !== false;
}

function dvdb_set_step_type($step_id, $type) {
    global $wpdb;
    $updated = $wpdb->update(DFDEVIS_TABLE_STEPS, ['type' => $type], ['id' => $step_id]);
    return $updated !== false;
}

function dfdb_set_email_product_data($email_id, $product_data) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_PRODUCT, ["data" => json_encode($product_data)], ["id" => $email_id]);
}

function dvdb_option_set_data($option_id, $data) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_OPTIONS, ["data" => json_encode($data)], ["id" => $option_id]);
}

function dfdb_option_set_image($option_id, $image_url) {
    global $wpdb;
    return $wpdb->update(DFDEVIS_TABLE_OPTIONS, ["image_url" => $image_url], ["id" => $option_id]);
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

function dvdb_delete_products_by_step($step_id) {
    global $wpdb;
    $wpdb->delete(DFDEVIS_TABLE_PRODUCT, ['step_id' => $step_id]);
}

// Delete all steps from the post where the step index is greater or equal to the step index of the deleted step
function dvdb_delete_steps_from_post($post_id, $step_index) {
    global $wpdb;
    $wpdb->query($wpdb->prepare("DELETE FROM " . DFDEVIS_TABLE_STEPS . " WHERE post_id = %d AND step_index >= %d", $post_id, $step_index));
}

/**
 * Recursive deletion of options and products associated with a step
 */
function dvdb_remove_option_recursive($option_id) {
    $option = dvdb_get_option($option_id);
    if ($option) {
        $activated_step = dvdb_get_step($option->activate_id);
        if ($activated_step) {
            foreach (dvdb_get_options_by_step($activated_step->id) as $opt) {
                dvdb_remove_option_recursive($opt->id);
            }
            dvdb_delete_products_by_step($activated_step->id);
            dvdb_delete_step($activated_step->id);
        }
        dvdb_delete_option($option_id);
    }
}



/**
 * Ajax functions
 */
function handle_dv_remove_option() {
    try {
        if (!isset($_POST['option_id']) || !isset($_POST['post_id'])) {
            throw new Exception('Missing required parameters');
        }

        $option_id = intval($_POST['option_id']);
        dvdb_remove_option_recursive($option_id);
        $new_step_index_count = dvdb_get_step_index_count($_POST['post_id']);

        wp_send_json_success(['message' => 'Option removed successfully', 'new_step_index_count' => $new_step_index_count]);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_remove_option', 'handle_dv_remove_option');

function handle_dv_remove_step() {
    try {
        if (!isset($_POST['step_id']) || !isset($_POST['post_id'])) {
            throw new Exception('Missing required parameters');
        }

        $step_id = intval($_POST['step_id']);
        $post_id = intval($_POST['post_id']);

        // Delete all options associated with this step
        foreach (dvdb_get_options_by_step($step_id) as $option) {
            dvdb_remove_option_recursive($option->id);
        }

        $product = dvdb_get_product_by_step($step_id);
        if ($product) {
            dvdb_delete_product($product->id);
        }

        $current_step_index = intval(dvdb_get_step($step_id)->step_index);
        $option = dvdb_get_option_by_activate_id($step_id);
        if ($option) {
            dvdb_set_option_activate_id($option->id, null);
        }
        dvdb_delete_step($step_id);

        // Remove the step from the post
        dvdb_delete_steps_from_post($post_id, $current_step_index + 1);

        $new_step_index_count = dvdb_get_step_index_count($post_id);

        wp_send_json_success(['message' => 'Step removed successfully', 'new_step_index_count' => $new_step_index_count]);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_remove_step', 'handle_dv_remove_step');


function handle_dv_set_step_index_name() {
    try {
        if (!isset($_POST['post_id']) || !isset($_POST['step_index']) || !isset($_POST['step_name'])) {
            throw new Exception('Missing required parameters');
        }

        $post_id = intval($_POST['post_id']);
        $step_index = intval($_POST['step_index']);
        $step_name = sanitize_text_field($_POST['step_name']);

        if (dvdb_set_step_name($post_id, $step_index, $step_name)) {
            wp_send_json_success(['message' => 'Step name updated successfully']);
        } else {
            throw new Exception('Failed to update step name');
        }
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_set_step_index_name', 'handle_dv_set_step_index_name');

function handle_dv_set_option_name() {
    try {
        if (!isset($_POST['option_id']) || !isset($_POST['option_name'])) {
            throw new Exception('Missing required parameters');
        }

        $option_id = intval($_POST['option_id']);
        $option_name = sanitize_text_field($_POST['option_name']);

        if (dvdb_set_option_name($option_id, $option_name)) {
            wp_send_json_success(['message' => 'Option name updated successfully']);
        } else {
            throw new Exception('Failed to update option name');
        }
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_set_option_name', 'handle_dv_set_option_name');

function handle_dvdb_set_step_type() {
    try {
        if (!isset($_POST['step_id']) || !isset($_POST['type']) || !isset($_POST['post_id'])) {
            throw new Exception('Missing required parameters');
        }

        $step_id = intval($_POST['step_id']);
        $type = sanitize_text_field($_POST['type']);
        $post_id = intval($_POST['post_id']);

        // type is options remove all products associated with this step
        if ($type === 'options') {
            dvdb_delete_products_by_step($step_id);
        } elseif ($type === 'product') {
            // delete all options associated with this step
            foreach (dvdb_get_options_by_step($step_id) as $option) {
                dvdb_remove_option_recursive($option->id);
            }
            // if type is product, ensure there is a product associated with this step
            if (!dvdb_get_product_by_step($step_id)) {
                dvdb_create_product($step_id);
            }
        } else {
            throw new Exception('Invalid step type');
        }

        $new_step_index_count = dvdb_get_step_index_count($post_id);

        if (dvdb_set_step_type($step_id, $type)) {
            wp_send_json_success(['message' => 'Step type updated successfully', 'new_step_index_count' => $new_step_index_count]);
        } else {
            throw new Exception('Failed to update step type');
        }
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dvdb_set_step_type', 'handle_dvdb_set_step_type');


function handle_dfdb_set_email_product_data() {
    try {
        if (!isset($_POST['email_id'])) {
            throw new Exception('Missing required parameters');
        }

        $email_id = intval($_POST['email_id']);
        $id = isset($_POST['product_id']) ? intval($_POST['product_id']) : null;
        $name = isset($_POST['product_name']) ? sanitize_text_field($_POST['product_name']) : null;
        $image = isset($_POST['product_image']) ? sanitize_text_field($_POST['product_image']) : null;
        $description = isset($_POST['product_description']) ? sanitize_text_field($_POST['product_description']) : null;
        $price = isset($_POST['product_price']) ? floatval($_POST['product_price']) : null;

        if ($email_id <= 0) {
            throw new Exception("Invalid email ID");
        }

        $current_data = dfdb_get_email_product_data($email_id);
        if ($current_data === null) {
            throw new Exception("Email product data not found");
        }

        $current_data['id'] = $id;
        $current_data['name'] = $name;
        $current_data['image'] = $image;
        $current_data['description'] = $description;
        $current_data['price'] = $price;

        $result = dfdb_set_email_product_data($email_id, $current_data);
        if ($result === false) {
            throw new Exception("Failed to update email product data: " . $wpdb->last_error);
        }
        wp_send_json_success(['message' => 'Email product data updated successfully']);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_set_email_product_data', 'handle_dfdb_set_email_product_data');

function handle_dfdb_option_set_image() {
    global $wpdb;
    try {
        if (!isset($_POST['option_id'])) {
            throw new Exception("Missing required parameters");
        }
        $option_id = intval($_POST['option_id']);
        $image_url = isset($_POST['image_url']) ? sanitize_text_field($_POST['image_url']) : null;

        if ($option_id <= 0) {
            throw new Exception("Invalid option ID or image URL");
        }

        $result = dfdb_option_set_image($option_id, $image_url);
        if ($result === false) {
            throw new Exception("Failed to update option image: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Option image updated successfully']);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_option_set_image', 'handle_dfdb_option_set_image');


function handle_dfdb_add_email_product_data() {
    try {
        if (!isset($_POST['email_id'], $_POST['key'], $_POST['name'], $_POST['value'])) {
            throw new Exception('Missing required parameters');
        }

        $email_id = intval($_POST['email_id']);
        $key = sanitize_text_field($_POST['key']);
        $name = sanitize_text_field($_POST['name']);
        $value = sanitize_text_field($_POST['value']);

        if ($email_id <= 0 || empty($key)) {
            throw new Exception("Invalid parameters for adding email product data");
        }

        $current_data = dfdb_get_email_product_data($email_id);
        if ($current_data === null) {
            throw new Exception("Email product data not found");
        }

        // the structure is key => ['name' => value]
        $current_data['extras'][$key] = [
            'name' => $name,
            'value' => $value
        ];
        $result = dfdb_set_email_product_data($email_id, $current_data);
        if ($result === false) {
            throw new Exception("Failed to add email product data: " . dfdb_error());
        }
        wp_send_json_success(['message' => 'Email product data added successfully']);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_add_email_product_data', 'handle_dfdb_add_email_product_data');

function handle_dfdb_remove_email_product_data() {
    try {
        if (!isset($_POST['email_id'], $_POST['key'])) {
            throw new Exception('Missing required parameters');
        }

        $email_id = intval($_POST['email_id']);
        $key = sanitize_text_field($_POST['key']);

        if ($email_id <= 0 || empty($key)) {
            throw new Exception("Invalid parameters for removing email product data");
        }

        $current_data = dfdb_get_email_product_data($email_id);
        if ($current_data === null) {
            throw new Exception("Email product data not found");
        }

        if (isset($current_data['extras'][$key])) {
            unset($current_data['extras'][$key]);
        }

        $result = dfdb_set_email_product_data($email_id, $current_data);
        if ($result === false) {
            throw new Exception("Failed to remove email product data: " . dfdb_error());
        }
        wp_send_json_success(['message' => 'Email product data removed successfully']);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_remove_email_product_data', 'handle_dfdb_remove_email_product_data');


function handle_dfdb_option_set_cost_history_visible() {
    global $wpdb;
    try {
        if (!isset($_POST['option_id'], $_POST['visible'])) {
            throw new Exception('Missing required parameters');
        }

        $option_id = intval($_POST['option_id']);
        $visible = filter_var($_POST['visible'], FILTER_VALIDATE_BOOLEAN);

        if ($option_id <= 0) {
            throw new Exception("Invalid option ID");
        }

        $data = dvdb_get_option_data($option_id);
        $data['cost']['history_visible'] = $visible;

        $result = dvdb_option_set_data($option_id, $data);
        if ($result === false) {
            throw new Exception("Failed to update option data: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Option cost history visibility updated successfully']);
        wp_die();
    } catch (Exception
     $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_option_set_cost_history_visible', 'handle_dfdb_option_set_cost_history_visible');

function handle_dvdb_option_set_additional_cost() {
    global $wpdb;
    try {
        if (!isset($_POST['option_id'], $_POST['additional_cost'])) {
            throw new Exception('Missing required parameters');
        }

        $option_id = intval($_POST['option_id']);
        $additional_cost = floatval($_POST['additional_cost']);

        if ($option_id <= 0) {
            throw new Exception("Invalid option ID");
        }

        $data = dvdb_get_option_data($option_id);
        $data['cost']['additional'] = $additional_cost;

        $result = dvdb_option_set_data($option_id, $data);
        if ($result === false) {
            throw new Exception("Failed to update option data: " . $wpdb->last_error);
        }

        wp_send_json_success(['message' => 'Option additional cost updated successfully']);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dvdb_option_set_additional_cost', 'handle_dvdb_option_set_additional_cost');