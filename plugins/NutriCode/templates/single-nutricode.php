<?php
/**
 * Single NutriCode Template
 */

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php the_title(); ?> | <?php bloginfo('name'); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<div class="nutricode-container">
    <?php
    // Ensure we get the correct post, even if loop not started yet
    $post = get_queried_object();
    setup_postdata($post); // safely sets global $post

    
    $origin  = get_post_meta($post->ID, '_nutricode_origin', true);
    $grape   = get_post_meta($post->ID, '_nutricode_grape', true);
    $year    = get_post_meta($post->ID, '_nutricode_year', true);
    ?>
    
    <article id="post-<?php echo esc_attr($post->ID); ?>">
        <header>
            <h1><?php echo esc_html(get_the_title($post)); ?></h1>
        </header>
        
        <div class="content">
            <?php echo apply_filters('the_content', $post->post_content); ?>
            
            <div class="nutricode-meta">
                <p><strong>Origine:</strong> <?php echo esc_html($origin); ?></p>
                <p><strong>Cépage:</strong> <?php echo esc_html($grape); ?></p>
                <p><strong>Millésime:</strong> <?php echo esc_html($year); ?></p>
            </div>
        </div>
    </article>
    <div class="product-container">
        <div class="product-image-wrapper">
            <img src="/placeholder.svg?height=400&width=400" alt="Product Image" class="product-image">
        </div>
        <div class="product-details">
            <h1 class="product-name">Organic Apple Cider Vinegar</h1>
            <p class="product-description">
                Our premium organic apple cider vinegar is raw, unfiltered, and contains the "mother" for maximum health benefits. 
                Perfect for dressings, marinades, or a daily health tonic. Sourced from the finest organic apples.
            </p>

            <div class="product-specifications">
                <h2>Nutritional Values</h2>
                <div class="spec-item">
                    <span class="spec-label">Calories</span>
                    <span class="spec-value">3 kcal</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Total Fat</span>
                    <span class="spec-value">0 g</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Sodium</span>
                    <span class="spec-value">5 mg</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Carbohydrates</span>
                    <span class="spec-value">1 g</span>
                </div>
            </div>
        </div>
    </div>
</div>

<?php wp_footer(); ?>
</body>
</html>
