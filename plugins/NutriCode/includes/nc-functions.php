<?php

require_once 'DfNutricodeException.php';
require_once 'dfnc-utils.php';

function df_check_woocommerce() {
    return class_exists('WooCommerce');
}

function df_get_fake_products($id = -1) {
    $data = [];

    if ($id < 1 || $id > 2) {
        $id = -1;
    }

    $data['products'] = [
        [
            'ID' => 1,
            'Image' => 'https://picsum.photos/id/237/200/300',
            'Name' => 'Fake Product 1',
            'Description' => 'This is a fake product description for testing purposes.',
            'Price' => '19.99'
        ],
        [
            'ID' => 2,
            'Image' => 'https://picsum.photos/seed/picsum/200/300',
            'Name' => 'Fake Product 2',
            'Description' => 'This is another fake product description for testing purposes.',
            'Price' => '29.99'
        ]
    ];

    if ($id !== -1) {
        $data['products'] = array_filter($data['products'], function($product) use ($id) {
            return $product['ID'] == $id;
        });
    }

    return $data;
}

function df_get_fake_product($id) {
    $products = df_get_fake_products($id);
    if (empty($products['products'])) {
        return null;
    }
    return $products['products'][0];
}

function df_get_product($id) {
    if (!df_check_woocommerce()) {
        return df_get_fake_product($id);
    }

    $product = wc_get_product($id);
    if (!$product) {
        return null;
    }

    return [
        'ID' => $product->get_id(),
        'Image' => wp_get_attachment_url($product->get_image_id()),
        'Name' => $product->get_name(),
        'Description' => $product->get_description(),
        'Price' => $product->get_price(),
    ];
}

function df_get_products($name) {
    $data = [];

    $products = wc_get_products(['limit' => -1, 'search' => $name]);
    $data['products'] = array_map(function($product) {
        return [
            'ID' => $product->get_id(),
            'Image' => wp_get_attachment_url($product->get_image_id()),
            'Name' => $product->get_name(),
            'Description' => $product->get_description(),
            'Price' => $product->get_price(),
        ];
    }, $products);

    return $data;
}

function handle_df_get_products() {
    try {
        dfnc_check_post('name');
        $name = sanitize_text_field($_POST['name']);
        if (empty($name)) {
            throw new DfNutricodeException('Product name cannot be empty.', ['action' => 'get_products']);
        }

        if (!df_check_woocommerce()) {
            //throw new DfDevisException('WooCommerce is not active.', ['action' => 'get_products']);
            $data = df_get_fake_products();
            wp_send_json_success(['type' => 'fake', 'data' => $data]);
            wp_die();
        }

        $data = df_get_products($name);
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