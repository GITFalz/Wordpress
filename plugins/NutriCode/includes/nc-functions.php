<?php

require_once 'DfNutricodeException.php';
require_once 'dfnc-utils.php';

function df_check_woocommerce() {
    return class_exists('WooCommerce');
}

function df_get_product_by_id($id) {
    if (!df_check_woocommerce()) {
        return null;
    }

    $product = wc_get_product($id);
    if (!$product) {
        return null;
    }

    return [
        'ID' => $product->get_id(),
        'Image' => wp_get_attachment_url($product->get_image_id()),
        'Name' => $product->get_name(),
        'Description' => $product->get_description()
    ];
}

function handle_df_get_product_by_id() {
    try {
        dfnc_check_post('id');
        $id = intval($_POST['id']);
        if ($id < 1) {
            throw new DfNutricodeException('Invalid product ID.', ['action' => 'get_product_by_id']);
        }

        $data = df_get_product_by_id($id);
        if (!$data) {
            throw new DfNutricodeException('Product not found.', ['action' => 'get_product_by_id']);
        }

        wp_send_json_success(['type' => 'real', 'data' => $data]);
        wp_die();
    } catch (DfNutricodeException $e) {
        wp_send_json_error([
            'message' => $e->getMessage(),
            'context' => $e->getContext()
        ]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_product_by_id', 'handle_df_get_product_by_id');

function df_get_product($id) {
    if (!df_check_woocommerce()) {
        return null;
    }

    $product = wc_get_product($id);
    if (!$product) {
        return null;
    }

    return [
        'ID' => $product->get_id(),
        'Image' => wp_get_attachment_url($product->get_image_id()),
        'Name' => $product->get_name(),
        'Description' => $product->get_description()
    ];
}

function df_get_products($name, $p_per_page = 10, $page_number = 1) {
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

function handle_df_get_products() {
    try {
        dfnc_check_post('name', 'p_per_page', 'page_number');

        $name = sanitize_text_field($_POST['name']);
        $p_per_page = intval($_POST['p_per_page']);
        $page_number = intval($_POST['page_number']);

        if (empty($name)) {
            throw new DfNutricodeException('Product name cannot be empty.', ['action' => 'get_products']);
        }

        if (!df_check_woocommerce()) {
            throw new DfDevisException('WooCommerce is not active.', ['action' => 'get_products']);
        }

        $data = df_get_products($name, $p_per_page, $page_number);
        wp_send_json_success(['type' => 'real', 'data' => $data]);
        wp_die();
    } catch (DfNutricodeException $e) {
        wp_send_json_error([
            'message' => $e->getMessage(),
            'context' => $e->getContext()
        ]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_products', 'handle_df_get_products');


function handle_df_import_products() {
    try {
        dfnc_check_post('products');

        $products = json_decode(stripslashes($_POST['products']), true);
        if (empty($products) || !is_array($products)) {
            throw new DfNutricodeException('Invalid products data.', ['action' => 'import_products']);
        }

        foreach ($products as $product_data) {
            $post_data = [
                'post_title'    => '' . sanitize_text_field($product_data['name']) . '',
                'post_content'  => '' . sanitize_textarea_field($product_data['description']) . '',
                'post_status'   => 'publish',
                'post_type'     => 'nutricode',
            ];

            $post_id = wp_insert_post($post_data);

            if (!is_wp_error($post_id)) {
                update_post_meta($post_id, '_nutricode_product_image', esc_url_raw($product_data['image']));
                update_post_meta($post_id, '_nutricode_name', sanitize_text_field($product_data['name']));
                update_post_meta($post_id, '_nutricode_description', sanitize_textarea_field($product_data['description']));
                update_post_meta($post_id, '_nutricode_product_id', intval($product_data['id']));

                error_log("Post created: ID $post_id");
            } else {
                error_log('Failed to create post: ' . $post_id->get_error_message());
            }
        }

        wp_send_json_success(['message' => 'Products imported successfully.']);    
        wp_die();
    } catch (DfNutricodeException $e) {
        wp_send_json_error([
            'message' => $e->getMessage(),
            'context' => $e->getContext()
        ]);
        wp_die();
    }
}
add_action('wp_ajax_df_import_products', 'handle_df_import_products');