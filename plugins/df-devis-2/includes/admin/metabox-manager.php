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
    echo dv_get_steps_html();
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