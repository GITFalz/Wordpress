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
    <article id="post-<?php the_ID(); ?>">
        <header>
            <h1><?php the_title(); ?></h1>
        </header>
        
        <div class="content">
            <?php the_content(); ?>
            
            <div class="nutricode-meta">
                <p><strong>Origine:</strong> <?php echo esc_html(get_post_meta(get_the_ID(), '_nutricode_origin', true)); ?></p>
                <p><strong>Cépage:</strong> <?php echo esc_html(get_post_meta(get_the_ID(), '_nutricode_grape', true)); ?></p>
                <p><strong>Millésime:</strong> <?php echo esc_html(get_post_meta(get_the_ID(), '_nutricode_year', true)); ?></p>
            </div>
        </div>
    </article>
</div>

<?php wp_footer(); ?>
</body>
</html>