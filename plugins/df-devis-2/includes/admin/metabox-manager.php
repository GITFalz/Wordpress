<?php 

/**
 * This class handles the initialization of the metaboxes for the Devis post type.
 */

function dv_register_post_type() {
    register_post_type('devis', [
        'labels' => [
            'name' => 'Defacto Devis',
            'singular_name' => 'Defacto Devis',
            'menu_name' => 'Defacto Devis',
        ],
        'public' => true,
        'show_ui' => true,
        'supports' => ['title'],
    ]);
}

function dv_create_metaboxes() {
    add_meta_box(
        'devis_steps_options',
        'Etapes & Options',
        'dv_render_devis_customization_meta_box',
        'devis',
        'normal',
        'default'
    );

    add_meta_box(
        'devis_form_customization',
        'Personnalisation du Formulaire',
        'dv_render_form_customization_meta_box',
        'devis',
        'normal',
        'default'
    );

    add_meta_box(
        'devis_email_customization',
        'Personnalisation de l\'Email',
        'dv_render_email_customization_meta_box',
        'devis',
        'normal',
        'default'
    );

    add_meta_box(
        'devis_settings',
        'Paramètres du Devis',
        'dv_render_devis_settings_meta_box',
        'devis',
        'side',
        'default'
    );
}

function dv_render_devis_customization_meta_box($post) {
    $post_id = $post->ID;
    $steps = dvdb_get_steps($post_id);
    $options = dvdb_get_options($post_id);
    $product = dvdb_get_products($post_id);

    if (empty($steps)) {
        // Generate default steps if none exist
        $step_id = dvdb_create_step($post_id, 1, 'Étape 1');
        $steps = dvdb_get_steps($post_id);

        // Generate default options if none exist
        dvdb_create_option($step_id, 'Option 1', null);
        $options = dvdb_get_options($post_id);
    }

    // convert to arrays
    $steps = json_decode(json_encode($steps), true);
    $options = json_decode(json_encode($options), true);
    $product = json_decode(json_encode($product), true);

    $data = [];

    foreach ($steps as $step) {
        $data[$step['step_index']] = [
            'id' => $step['id'],
            'step_name' => $step['step_name'],
            'step_index' => $step['step_index'],
            'options' => [],
            'product' => null
        ];
    }

    foreach ($options as $option) {
        $data[$option['step_index']]['options'][] = [
            'id' => $option['id'],
            'option_name' => $option['option_name'],
            'activate_id' => $option['activate_id'],
            'image_url' => $option['image_url'],
            'data' => json_decode($option['data'] ?? '', true),
            'step_id' => $option['step_id']
        ];
    }

    foreach ($product as $prod) {
        $data[$prod['step_index']]['product'] = [
            'id' => $prod['id'],
            'name' => $prod['product_name'],
            'price' => $prod['product_price'],
            'image_url' => $prod['image_url'],
            'data' => json_decode($prod['data'], true),
            'step_id' => $prod['step_id'],
        ];
    }

    // Enqueue the script for handling the steps and options
    wp_enqueue_script(
        'devis-steps-options',
        DF_DEVIS_URL . 'assets/js/post-steps.js',
        ['jquery'],
        DF_DEVIS_VERSION,
        true
    );

    // Localize the script with the post ID and nonce for security
    wp_localize_script('devis-steps-options', 'devisStepsOptions', [
        'postId' => $post_id,
        'nonce' => wp_create_nonce('devis_steps_options_nonce'),
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'data' => $data,
    ]);

    echo dv_get_steps_html($post_id, $data);
}

function dv_render_form_customization_meta_box($post) {
    // Render the content of the form customization metabox here
    echo '<p>Customize your Devis form fields here.</p>';
    // You can add form fields, checkboxes, etc. as needed
}

function dv_render_email_customization_meta_box($post) {
    // Render the content of the email customization metabox here
    echo '<p>Customize your Devis email settings here.</p>';
    // You can add form fields, checkboxes, etc. as needed
}

function dv_render_devis_settings_meta_box($post) {
    // Render the content of the settings metabox here
    echo '<p>Configure your Devis settings here.</p>';
    // You can add form fields, checkboxes, etc. as needed
}



/**
 * Prints the results in a formatted way
 *
 * @param array $results The results to print
 */
function print_result($results) {
    echo "<pre>";
    print_recursive($results);
    echo "</pre>";
}

function print_recursive($data, $indent = 0) {
    $prefix = str_repeat('  ', $indent);

    if (is_array($data)) {
        foreach ($data as $key => $value) {
            echo $prefix . "$key => ";
            if (is_array($value) || is_object($value)) {
                echo "\n";
                print_recursive($value, $indent + 1);
            } else {
                echo var_export($value, true) . "\n";
            }
        }
    } elseif (is_object($data)) {
        foreach (get_object_vars($data) as $key => $value) {
            echo $prefix . "$key => ";
            if (is_array($value) || is_object($value)) {
                echo "\n";
                print_recursive($value, $indent + 1);
            } else {
                echo var_export($value, true) . "\n";
            }
        }
    } else {
        echo $prefix . var_export($data, true) . "\n";
    }
}