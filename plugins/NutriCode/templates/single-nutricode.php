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
</div>

<?php wp_footer(); ?>
</body>
</html>
