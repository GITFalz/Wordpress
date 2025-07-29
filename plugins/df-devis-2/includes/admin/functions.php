<?php
function df_get_woocommerce_products($name, $p_per_page = 10, $page_number = 1) {
    $name = trim(sanitize_text_field($name));
    $data = [];

    if (empty($name)) {
        return ['products' => [], 'max_pages' => 1, 'current_page' => 1];
    }

    $args = [
        'post_type'      => 'product',
        'posts_per_page' => $p_per_page,
        'paged'          => $page_number,
        's'              => $name,
        'post_status'    => 'publish'
    ];

    $query = new WP_Query($args);

    $products = array_map(function($post) {
        $product = wc_get_product($post->ID);
        return [
            'ID'          => $product->get_id(),
            'Image'       => wp_get_attachment_url($product->get_image_id()) ?: '',
            'Name'        => $product->get_name(),
            'Description' => wp_strip_all_tags($product->get_description()),
            'Price'       => $product->get_price(),
        ];
    }, $query->posts);

    $data['products'] = $products;
    $data['max_pages'] = $query->max_num_pages;
    $data['current_page'] = $page_number;

    return $data;
}

function dv_should_generate_history($post_id) {
    $generate_history = get_post_meta($post_id, '_devis_generate_history', true);
    return !empty($generate_history) && $generate_history === 'true';
    
}

function is_valid_custom_field_type($type) {
    $valid_types = ['default_input', 'default_textarea', 'default_file', 'region_checkbox', 'region_select', 'region_radio'];
    return in_array($type, $valid_types, true);
}	

function get_type_name($type) {
    switch ($type) {
        case 'default_input':
            return 'Nom du champ texte';
        case 'default_textarea':
            return 'Nom de la zone de texte';
        case 'default_file':
            return 'Nom du champ de fichier jointé';
        case 'region_checkbox':
            return 'Nom de la case à cocher';
        case 'region_select':
            return 'Nom du champ de sélection';
        case 'region_radio':
            return 'Nom du champ radio';
        default:
            return 'Nom du champ personnalisé';
    }
}