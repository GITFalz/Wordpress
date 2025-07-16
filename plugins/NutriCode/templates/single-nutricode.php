<?php
/**
 * Single NutriCode Template
 */

require_once DF_NUTRICODE_PATH . 'includes/dfnc-utils.php';

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

    
    $origin         = get_post_meta($post->ID, '_nutricode_origin', true);
    $grape          = get_post_meta($post->ID, '_nutricode_grape', true);
    $year           = get_post_meta($post->ID, '_nutricode_year', true);
    $calories       = get_post_meta($post->ID, '_nutricode_calories', true);
    $energy         = get_post_meta($post->ID, '_nutricode_energy', true);
    $alcohol        = get_post_meta($post->ID, '_nutricode_alcohol', true);
    $carbohydrates  = get_post_meta($post->ID, '_nutricode_carbohydrates', true);
    $sugars         = get_post_meta($post->ID, '_nutricode_sugars', true);
    $fat            = get_post_meta($post->ID, '_nutricode_fat', true);
    $saturated_fat  = get_post_meta($post->ID, '_nutricode_saturated_fat', true);
    $protein        = get_post_meta($post->ID, '_nutricode_protein', true);
    $salt           = get_post_meta($post->ID, '_nutricode_salt', true);
    $allergens      = get_post_meta($post->ID, '_nutricode_allergens', true);
    $serving_size   = get_post_meta($post->ID, '_nutricode_serving_size', true);
    $product_id     = get_post_meta($post->ID, '_nutricode_product_id', true);

    $product_data = df_get_product_by_id(intval($product_id));

    ?>
    
    <div class="product-page-container">
        <div class="product-header">
            <img src="/placeholder.svg?height=400&width=400" alt="Image du Produit" class="product-main-image">
            <h1 class="product-title">Château Grand Cru Classé 2018</h1>
            <p class="product-description">
                Un vin rouge élégant et complexe, issu d'un millésime exceptionnel. 
                Ce Bordeaux offre des notes de fruits rouges mûrs, d'épices douces et une finale persistante. 
                Parfait pour accompagner les viandes rouges et les fromages affinés.
            </p>
        </div>

        <div class="product-details-section">
            <h2>Informations Clés</h2>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="detail-label">Origine</span>
                    <span class="detail-value"><?=esc_html($origin)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Cépage</span>
                    <span class="detail-value"><?=esc_html($grape)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Millésime</span>
                    <span class="detail-value"><?=esc_html($year)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Teneur en alcool</span>
                    <span class="detail-value"><?=esc_html($alcohol)?></span>
                </div>
            </div>
        </div>

        <div class="product-details-section">
            <h2>Valeurs Nutritionnelles (pour 100ml)</h2>
            <div class="details-list">
                <div class="detail-item">
                    <span class="detail-label">Calories</span>
                    <span class="detail-value"><?=esc_html($calories)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Énergie</span>
                    <span class="detail-value"><?=esc_html($energy)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Glucides</span>
                    <span class="detail-value"><?=esc_html($carbohydrates)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Dont sucres</span>
                    <span class="detail-value"><?=esc_html($sugars)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Lipides</span>
                    <span class="detail-value"><?=esc_html($fat)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Dont acides gras saturés</span>
                    <span class="detail-value"><?=esc_html($saturated_fat)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Protéines</span>
                    <span class="detail-value"><?=esc_html($protein)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Sel</span>
                    <span class="detail-value"><?=esc_html($salt)?></span>
                </div>
            </div>
        </div>

        <div class="product-details-section">
            <h2>Informations Complémentaires</h2>
            <div class="details-list">
                <div class="detail-item">
                    <span class="detail-label">Allergènes</span>
                    <span class="detail-value"><?=esc_html($allergens)?></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Portion recommandée</span>
                    <span class="detail-value"><?=esc_html($serving_size)?></span>
                </div>
            </div>
        </div>

        <footer class="product-footer">
            <p>&copy; 2023 Votre Marque. Tous droits réservés.</p>
        </footer>
    </div>
</div>

<?php wp_footer(); ?>
</body>
</html>
