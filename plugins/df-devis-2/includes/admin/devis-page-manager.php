<?php

/**
 * This file manages the main devis page the customers will see.
 */

function dv_add_admin_menu() {
    add_menu_page(
        'Defacto Devis',
        'Defacto Devis',
        'manage_options',
        'df-devis',
        'dv_render_devis_page',
        '',
        3
    );
}

function dv_render_devis_page() {
    echo '<div class="wrap">';
    echo '<h1>Defacto Devis</h1>';
    echo '<p>Welcome to the Defacto Devis management page.</p>';
    // Here you can add more content or functionality as needed
    echo '</div>';
}