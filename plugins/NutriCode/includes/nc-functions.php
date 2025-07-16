<?php

require_once 'DfNutricodeException.php';
require_once 'dfnc-utils.php';

function df_check_woocommerce() {
    return class_exists('WooCommerce');
}

function df_get_fake_products($id = -1, $p_per_page = 10, $page_number = 1) {
    $all_products = [
        [
            'ID' => 1,
            'Image' => 'https://picsum.photos/id/237/200/300',
            'Name' => 'Fake Product 1',
            'Description' => 'This is a fake product description for testing purposes.'
        ],
        [
            'ID' => 2,
            'Image' => 'https://picsum.photos/seed/picsum/200/300',
            'Name' => 'Fake Product 2',
            'Description' => 'This is another fake product description for testing purposes.'
        ],
        [
            'ID' => 3,
            'Image' => 'https://picsum.photos/id/238/200/300',
            'Name' => 'Fake Product 3',
            'Description' => 'This is a third fake product description for testing purposes.'
        ],
        [
            'ID' => 4,
            'Image' => 'https://picsum.photos/id/239/200/300',
            'Name' => 'Fake Product 4',
            'Description' => 'This is a fourth fake product description for testing purposes.'
        ],
        [   'ID' => 5,
            'Image' => 'https://picsum.photos/id/240/200/300',
            'Name' => 'Fake Product 5',
            'Description' => 'This is a fifth fake product description for testing purposes.'
        ],
        [   'ID' => 6,
            'Image' => 'https://picsum.photos/id/241/200/300',
            'Name' => 'Fake Product 6',
            'Description' => 'This is a sixth fake product description for testing purposes.'
        ],
        [   'ID' => 7,
            'Image' => 'https://picsum.photos/id/242/200/300',
            'Name' => 'Fake Product 7',
            'Description' => 'This is a seventh fake product description for testing purposes.'
        ],
        [   'ID' => 8,
            'Image' => 'https://picsum.photos/id/243/200/300',
            'Name' => 'Fake Product 8',
            'Description' => 'This is an eighth fake product description for testing purposes.'
        ],
        [   'ID' => 9,
            'Image' => 'https://picsum.photos/id/244/200/300',
            'Name' => 'Fake Product 9',
            'Description' => 'This is a ninth fake product description for testing purposes.'
        ],
        [   'ID' => 10,
            'Image' => 'https://picsum.photos/id/245/200/300',
            'Name' => 'Fake Product 10',
            'Description' => 'This is a tenth fake product description for testing purposes.'
        ]
    ];

    if ($id < 1 || $id > count($all_products)) {
        $id = -1;
    }

    if ($id !== -1) {
        $all_products = array_values(array_filter($all_products, function($product) use ($id) {
            return $product['ID'] == $id;
        }));
    }

    $total_products = count($all_products);
    $max_pages = $p_per_page > 0 ? ceil($total_products / $p_per_page) : 1;

    // Simulate pagination
    if ($p_per_page > 0) {
        $start = ($page_number - 1) * $p_per_page;
        $paged_products = array_slice($all_products, $start, $p_per_page);
    } else {
        $paged_products = $all_products;
    }

    return [
        'products'      => $paged_products,
        'max_pages'     => $max_pages,
        'current_page'  => $page_number
    ];
}

function df_get_fake_product($id) {
    $products = df_get_fake_products($id);
    if (empty($products['products'])) {
        return null;
    }
    return $products['products'][0];
}

function handle_df_get_fake_product() {
    try {
        dfnc_check_post('id');
        $id = intval($_POST['id']);
        if ($id < 1 || $id > 2) {
            throw new DfNutricodeException('Invalid product ID.', ['action' => 'get_fake_product']);
        }

        $data = df_get_fake_product($id);
        if (!$data) {
            throw new DfNutricodeException('Fake product not found.', ['action' => 'get_fake_product']);
        }

        wp_send_json_success(['type' => 'fake', 'data' => $data]);
        wp_die();
    } catch (DfNutricodeException $e) {
        wp_send_json_error([
            'message' => $e->getMessage(),
            'context' => $e->getContext()
        ]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_fake_product', 'handle_df_get_fake_product');

function df_get_product_by_id($id) {
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
        'Description' => $product->get_description()
    ];
}

function df_get_products($name, $p_per_page = 10, $page_number = 1) {
    $data = [];

    $args = [
        'limit'      => $p_per_page,
        'page'       => $page_number,
        'status'     => 'publish',
        'paginate'   => true,
        'search'     => $name
    ];

    $query = new WC_Product_Query($args);
    $results = $query->get_products();

    $data['products'] = array_map(function($product) {
        return [
            'ID' => $product->get_id(),
            'Image' => wp_get_attachment_url($product->get_image_id()),
            'Name' => $product->get_name(),
            'Description' => $product->get_description()
        ];
    }, $results);

    $data['max_pages']    = $query->get_pages();
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
            //throw new DfDevisException('WooCommerce is not active.', ['action' => 'get_products']);
            $data = df_get_fake_products(-1, $p_per_page, $page_number);
            wp_send_json_success(['type' => 'fake', 'data' => $data]);
            wp_die();
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