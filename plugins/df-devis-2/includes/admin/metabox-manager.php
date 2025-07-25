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
    $options = dvdb_get_options($post_id, 1);
    $product = dvdb_get_products($post_id, 1);

    if (empty($steps)) {
        // Generate default steps if none exist
        dvdb_create_step($post_id, 1, 'Étape 1');
        $steps = dvdb_get_steps($post_id);
    }

    if (empty($options)) {
        // Generate default options if none exist
        dvdb_create_option($post_id, 1, 'Option 1', null);
        $options = dvdb_get_options($post_id, 1);
    }

    // convert to arrays
    $steps = json_decode(json_encode($steps), true);
    $options = json_decode(json_encode($options), true);
    $product = json_decode(json_encode($product), true);

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
        'steps' => $steps,
        'options' => $options,
        'product' => $product,
    ]);

    echo dv_get_steps_html($post_id, $steps, $options);
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