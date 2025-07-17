<?php

require_once 'DfNutricodeException.php';
require_once 'dfnc-utils.php';

function df_check_woocommerce() {
    return class_exists('WooCommerce');
}

define('FAKE_PRODUCTS', [
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
]);

function df_get_fake_products($id = -1, $p_per_page = 10, $page_number = 1) {
    $all_products = FAKE_PRODUCTS;

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

function df_get_products($name, $p_per_page = 10, $page_number = 1, $add_fake = false) {
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

    if ($add_fake && $page_number == $query->max_num_pages) {
        $current_product_count = count($products);
        if ($current_product_count < $p_per_page) {
            $products = array_merge($products, FAKE_PRODUCTS);
            if (count($products) > $p_per_page) {
                $products = array_slice($products, 0, $p_per_page);
            }
        }
    }

    $data['products'] = $products;
    $data['max_pages'] = $query->max_num_pages;
    $data['current_page'] = $page_number;

    return $data;
}

function handle_df_get_products() {
    try {
        dfnc_check_post('name', 'p_per_page', 'page_number', 'add_fake');

        $name = sanitize_text_field($_POST['name']);
        $p_per_page = intval($_POST['p_per_page']);
        $page_number = intval($_POST['page_number']);
        $add_fake = filter_var($_POST['add_fake'], FILTER_VALIDATE_BOOLEAN);

        if (empty($name)) {
            throw new DfNutricodeException('Product name cannot be empty.', ['action' => 'get_products']);
        }

        if (!df_check_woocommerce()) {
            //throw new DfDevisException('WooCommerce is not active.', ['action' => 'get_products']);
            $data = df_get_fake_products(-1, $p_per_page, $page_number);
            wp_send_json_success(['type' => 'fake', 'data' => $data]);
            wp_die();
        }

        $data = df_get_products($name, $p_per_page, $page_number, $add_fake);
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