<?php
require_once 'DfDevisException.php';

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
            'Description' => wp_strip_all_tags($product->get_description())
        ];
    }, $query->posts);

    $data['products'] = $products;
    $data['max_pages'] = $query->max_num_pages;
    $data['current_page'] = $page_number;

    return $data;
}

function handle_df_get_woocommerce_products() {
    try {
        df_check_post('name', 'p_per_page', 'page_number');

        $name = sanitize_text_field($_POST['name']);
        $p_per_page = intval($_POST['p_per_page']);
        $page_number = intval($_POST['page_number']);

        if (empty($name)) {
            throw new DfDevisException('Product name cannot be empty.', ['action' => 'get_products']);
        }

        if (!class_exists('WooCommerce')) {
            throw new DfDevisException('WooCommerce is not active.', ['action' => 'get_products']);
        }

        $data = df_get_woocommerce_products($name, $p_per_page, $page_number);
        wp_send_json_success(['type' => 'real', 'data' => $data]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error([
            'message' => $e->getMessage(),
            'context' => $e->getContext()
        ]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_woocommerce_products', 'handle_df_get_woocommerce_products');