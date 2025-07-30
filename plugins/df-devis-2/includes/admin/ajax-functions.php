<?php
function handle_df_get_woocommerce_products() {
    try {
        if (!isset($_POST['name']) || !isset($_POST['p_per_page']) || !isset($_POST['page_number'])) {
            throw new Exception('Missing required parameters');
        }

        $name = sanitize_text_field($_POST['name']);
        $p_per_page = intval($_POST['p_per_page']);
        $page_number = intval($_POST['page_number']);

        if (empty($name)) {
            throw new Exception('Product name cannot be empty.');
        }

        if (!class_exists('WooCommerce')) {
            throw new Exception('WooCommerce is not active.');
        }

        $data = df_get_woocommerce_products($name, $p_per_page, $page_number);
        wp_send_json_success(['type' => 'real', 'data' => $data]);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_woocommerce_products', 'handle_df_get_woocommerce_products');

function handle_dv_save_post_data() {
    try {
        if (!isset($_POST['post_id']) || !isset($_POST['post_line']) || !isset($_POST['post_value'])) {
            throw new Exception('Missing required parameters');
        }

        $post_id = intval($_POST['post_id']);
        $post_line = sanitize_text_field($_POST['post_line']);
        $post_value = sanitize_text_field($_POST['post_value']);

        if (empty($post_id) || empty($post_line) || empty($post_value)) {
            throw new Exception('Invalid data provided.');
        }

        // Update post meta or perform other actions as needed
        update_post_meta($post_id, $post_line, $post_value);

        wp_send_json_success(['message' => 'Post data saved successfully.']);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_save_post_data', 'handle_dv_save_post_data');

function handle_dv_generate_history_checkbox() {
    try {
        if (!isset($_POST['post_id'])) {
            throw new Exception('Missing post ID');
        }

        $post_id = intval($_POST['post_id']);
        if (empty($post_id)) {
            throw new Exception('Invalid post ID');
        }

        // if post meta data not exists, create it
        if (!get_post_meta($post_id, '_devis_history_step_name', true)) {
            update_post_meta($post_id, '_devis_history_step_name', 'Étape' . (isset($_POST['step_index']) ? (' ' . intval($_POST['step_index'])) : ''));
        }

        $html = dv_get_extra_step_html($post_id);

        wp_send_json_success(['message' => 'Success', 'html' => $html]);
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
    }
    wp_die();
}
add_action('wp_ajax_dv_generate_history_checkbox', 'handle_dv_generate_history_checkbox');

function handle_dv_add_formulaire_custom_field() {
    if ( ! isset($_POST['post_id']) || ! isset($_POST['type']) || ! isset($_POST['name']) || empty($_POST['time'])  ) {
        wp_send_json_error(['message' => 'Missing or invalid data']);
        wp_die();
    }
    $post_id = intval($_POST['post_id']);
    $type = sanitize_text_field($_POST['type']);
    $name = sanitize_text_field($_POST['name']);
    $time = intval($_POST['time']);
    $index = intval($_POST['index'] ?? -1);
    $region = isset($_POST['region']) ? sanitize_textarea_field($_POST['region']) : '';

    $is_region = in_array($type, ['region_checkbox', 'region_select', 'region_radio'], true);

    if ( ! get_post($post_id) ) {
        wp_send_json_error(['message' => 'Post not found']);
        wp_die();
    }

    if ( ! is_valid_custom_field_type($type) ) {
        wp_send_json_error(['message' => 'Invalid custom field type']);
        wp_die();
    }

    $custom_fields = get_post_meta($post_id, '_devis_custom_fields', true);
    if ( ! is_array($custom_fields) ) { 
        $custom_fields = []; 
    }

    $new_field = [
        'type' => $type,
        'name' => $name,
        'time' => $time,
    ];
    if ($is_region ) {
        $new_field['region'] = $region;
    }

    if ($index >= 0 && $index <= count($custom_fields)) {
        array_splice($custom_fields, $index, 0, [$new_field]);
    } else {
        $custom_fields[] = $new_field;
    }

    $custom_fields = array_values($custom_fields);
    update_post_meta($post_id, '_devis_custom_fields', $custom_fields);

    wp_send_json_success([
        'message' => 'Custom field added successfully',
        'custom_field' => $new_field,
        'index' => $index
    ]);
    wp_die();
}
add_action('wp_ajax_dv_add_formulaire_custom_field', 'handle_dv_add_formulaire_custom_field');

function handle_dv_remove_formulaire_custom_field() {
    if ( ! isset($_POST['post_id']) || ! isset($_POST['index']) ) {
        wp_send_json_error(['message' => 'Missing or invalid data']);
        wp_die();
    }
    $post_id = intval($_POST['post_id']);
    $index = intval($_POST['index']);

    if ( ! get_post($post_id) ) {
        wp_send_json_error(['message' => 'Post not found']);
        wp_die();
    }

    $custom_fields = get_post_meta($post_id, '_devis_custom_fields', true);
    if ( ! is_array($custom_fields) || ! isset($custom_fields[$index]) ) {
        wp_send_json_error(['message' => 'Invalid custom field index']);
        wp_die();
    }

    unset($custom_fields[$index]);

    $custom_fields = array_values($custom_fields);
    update_post_meta($post_id, '_devis_custom_fields', $custom_fields);
    wp_send_json_success(['message' => 'Custom field removed successfully']);
    wp_die();
}
add_action('wp_ajax_dv_remove_formulaire_custom_field', 'handle_dv_remove_formulaire_custom_field');

function handle_dv_update_formulaire_custom_field() {
    if ( ! isset($_POST['post_id']) || ! isset($_POST['index']) || ! isset($_POST['name']) || ! isset($_POST['type']) ) {
        wp_send_json_error(['message' => 'Missing or invalid data']);
        wp_die();
    }
    $post_id = intval($_POST['post_id']);
    $index = intval($_POST['index']);
    $name = sanitize_text_field($_POST['name']);
    $type = sanitize_text_field($_POST['type']);
    $region = isset($_POST['region']) ? sanitize_textarea_field($_POST['region']) : '';

    $is_region = in_array($type, ['region_checkbox', 'region_select', 'region_radio'], true);

    if ( ! get_post($post_id) ) {
        wp_send_json_error(['message' => 'Post not found']);
        wp_die();
    }

    if ( ! is_valid_custom_field_type($type) ) {
        wp_send_json_error(['message' => 'Invalid custom field type']);
        wp_die();
    }

    $custom_fields = get_post_meta($post_id, '_devis_custom_fields', true);
    if ( ! is_array($custom_fields) || ! isset($custom_fields[$index]) ) {
        wp_send_json_error(['message' => 'Invalid custom field index']);
        wp_die();
    }

    $custom_fields[$index]['name'] = $name;
    $custom_fields[$index]['type'] = $type;
    if ($is_region) {
        $custom_fields[$index]['region'] = $region;
    } else {
        unset($custom_fields[$index]['region']);
    }

    update_post_meta($post_id, '_devis_custom_fields', $custom_fields);
    wp_send_json_success([
        'message' => 'Custom field updated successfully',
        'custom_field' => $custom_fields[$index],
        'index' => $index
    ]);
    wp_die();
}
add_action('wp_ajax_dv_update_formulaire_custom_field', 'handle_dv_update_formulaire_custom_field');


function handle_df_devis_send_email() {
    if ( ! isset($_POST['post_id']) || ! isset($_POST['step_id']) || ! isset($_POST['email']) || ! isset($_POST['data']) || empty($_POST['email']) ) {
        wp_send_json_error(['message' => 'Missing or invalid data', 'alert' => 'Il manque des données pour envoyer l\'email.']);
        wp_die();
    }

    $settings = dfdv()->settings;

    $post_id = intval($_POST['post_id']);
    $step_id = intval($_POST['step_id']);
    $email = sanitize_email($_POST['email']);
    $data = isset($_POST['data']) ? json_decode(stripslashes($_POST['data']), true) : [];

    $post = get_post($post_id);
    if ( ! $post ) {
        wp_send_json_error(['message' => 'Post not found']);
        wp_die();
    }

    $product = dvdb_get_product_by_step($step_id);
    if ( ! $product ) {
        wp_send_json_error(['message' => 'Product not found for the given step ID']);
        wp_die();
    }

    $product_data = json_decode($product->data, true);
    $history = dvdb_get_history_by_step($step_id);

    $final_cost = floatval($product_data['price'] ?? 0);
    foreach ($history as $step_index => $item) {
        if (isset($item['data']['cost']['additional']) && is_numeric($item['data']['cost']['additional'])) {
            $final_cost += floatval($item['data']['cost']['additional']);
        }
    }

    $owner_email = '';

    if (isset($settings['utiliser_email_personnalisé']) && $settings['utiliser_email_personnalisé']) {
        $owner_email = get_post_meta($post_id, '_devis_owner_email', true);
    } else if (isset($settings['email_du_propriétaire']) && !empty($settings['email_du_propriétaire'])) {
        $owner_email = $settings['email_du_propriétaire'];
    } else {    
        /**
         * If no email is set, you will suffer the consequences >:)
         * traduction (pour ceux qui ne comprennent pas l'anglais -_-): Si aucun e-mail n'est défini, vous devrez en subir les conséquences >:)
         */
        wp_send_json_error(['message' => 'Owner email not set', 'alert' => 'L\'email du propriétaire n\'est pas défini. Veuillez contacter l\'administrateur du site.']);
        wp_die();
    }

    if ( ! is_email($email) ) {
        wp_send_json_error(['message' => 'Invalid email address', 'alert' => 'L\'adresse e-mail fournie est invalide.']);
        wp_die();
    }

    $subject = 'Devis de ' . get_the_title($post_id);
    $body = get_devis_email_html($data, $product_data, $post_id, $final_cost);
    $attachments = [];

    // Handle file uploads
    if (!empty($_FILES['files'])) {
        foreach ($_FILES['files']['tmp_name'] as $index => $tmp_name) {
            if (is_uploaded_file($tmp_name)) {
                $name = sanitize_file_name($_FILES['files']['name'][$index]);
                $upload = wp_upload_bits($name, null, file_get_contents($tmp_name));

                if (!$upload['error']) {
                    $attachments[] = $upload['file']; // add to email
                }
            }
        }
    }

    $result1 = wp_mail($email, $subject, $body, ['Content-Type: text/html; charset=UTF-8'], $attachments);
    $result2 = wp_mail($owner_email, $subject, $body, ['Content-Type: text/html; charset=UTF-8'], $attachments);


    if (!$result2) { // Not sending email to owner is more critical
        wp_send_json_error(['message' => 'Owner email sending failed', 'alert' => 'Échec de l\'envoi de l\'email au propriétaire. Veuillez contacter l\'administrateur du site.']);
        wp_die();
    } elseif (!$result1) {
        wp_send_json_error(['message' => 'Personal email sending failed', 'alert' => 'Échec de l\'envoi de l\'email personnel. Veuillez vérifier l\'adresse e-mail.']);
        wp_die();
    } else {
        wp_send_json_success(['message' => 'Email sent successfully', 'body' => $body]);
        wp_die();
    }
}
add_action('wp_ajax_df_devis_send_email', 'handle_df_devis_send_email');