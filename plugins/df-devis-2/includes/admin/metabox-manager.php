<?php 

/**
 * This class handles the initialization of the metaboxes for the Devis post type.
 */

function dv_register_post_type() {
    register_post_type('devis', [
        'labels' => [
            'name' => 'Defacto Devis',
            'singular_name' => 'Defacto Devis',
            'menu_name' => 'Defacto Devis',
        ],
        'public' => true,
        'show_ui' => true,
        'supports' => ['title'],
    ]);
}

function dv_create_metaboxes() {
    add_meta_box(
        'devis_steps_options',
        'Etapes & Options',
        'dv_render_devis_customization_meta_box',
        'devis',
        'normal',
        'default'
    );

    add_meta_box(
        'devis_form_customization',
        'Personnalisation du Formulaire',
        'dv_render_form_customization_meta_box',
        'devis',
        'normal',
        'default'
    );

    add_meta_box(
        'devis_email_customization',
        'Personnalisation de l\'Email',
        'dv_render_email_customization_meta_box',
        'devis',
        'normal',
        'default'
    );

    add_meta_box(
        'devis_settings',
        'Paramètres du Devis',
        'dv_render_devis_settings_meta_box',
        'devis',
        'side',
        'default'
    );
}

function dv_render_devis_customization_meta_box($post) {
    $post_id = $post->ID;
    $steps = dvdb_get_steps($post_id);
    $options = dvdb_get_options($post_id);
    $product = dvdb_get_products($post_id);

    if (empty($steps)) {
        // Generate default steps if none exist
        $step_id = dvdb_create_step($post_id, 1, 'Étape 1');
        $steps = dvdb_get_steps($post_id);

        // Generate default options if none exist
        dvdb_create_option($step_id, 'Option 1', null);
        $options = dvdb_get_options($post_id);
    }

    // convert to arrays
    $steps = json_decode(json_encode($steps), true);
    $options = json_decode(json_encode($options), true);
    $product = json_decode(json_encode($product), true);

    $firstStep = dvdb_get_steps_by_index($post_id, 1)[0];
    $firstOptions = json_decode(json_encode(dvdb_get_options_by_step($firstStep->id)), true);

    $stepData = [];
    foreach ($steps as $step) {
        if (!isset($stepData[$step['step_index']])) {
            $stepData[$step['step_index']] = [
                'step_index' => $step['step_index'],
                'step_name' => $step['step_name'],
            ];

            if (intval($step['step_index']) === 1) {
                $stepData[$step['step_index']]['id'] = $step['id'];
            }
        }
    }

    $stepIndex = count($stepData);
    $products = dvdb_get_products_by_index($post_id, $stepIndex);
    if (!empty($products)) {
        $stepData[$stepIndex]['disable_name'] = true;
    }

    // Import media library images
    wp_enqueue_media();

    // Enqueue the script for handling the steps and options
    wp_enqueue_script(
        'devis-steps-options',
        DF_DEVIS_URL . 'assets/js/post-steps.js',
        ['jquery'],
        DF_DEVIS_VERSION,
        true
    );

    // Localize the script with the post ID and nonce for security
    wp_localize_script('devis-steps-options', 'devisStepsOptions', [
        'postId' => $post_id,
        'nonce' => wp_create_nonce('devis_steps_options_nonce'),
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'currentStepId' => $firstStep->id,
    ]);

    echo dv_get_steps_html($post_id, $stepData, $firstOptions);
}

function dv_render_form_customization_meta_box($post) {
    wp_enqueue_script(
        'form-customization-handle',
        DF_DEVIS_URL . 'assets/js/post-form.js',
        ['jquery', 'wp-data'],
        '1.0',
        true
    );

    wp_localize_script(
        'form-customization-handle',
        'devisFormOptions', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'postId' => $post->ID,
        ]
    );	

    $custom_fields = get_post_meta($post->ID, '_devis_custom_fields', true);
    if (empty($custom_fields) || !is_array($custom_fields)) {
        $custom_fields = [];
        update_post_meta($post->ID, '_devis_custom_fields', $custom_fields);
    }

    $price = get_post_meta($post->ID, 'formulaire_price', true);
    if (empty($price)) {
        $price = true;
        update_post_meta($post->ID, 'formulaire_price', $price);
    }

    ?>
    <link href="<?=DF_DEVIS_URL."assets/css/default/post-form.css"?>" rel="stylesheet" />
    <div class="formulaire-creation-container" style="width: 100%">
        <div class="formulaire-creation-fields">
            <div class="formulaire-creation-default-fields">
                <div class="formulaire-creation-default-fields-header">
                    <h3>Champs par défaut</h3>
                    <div class="formulaire-creation-default-fields-view" onclick="toggle_default_fields()">Voir</div>
                </div>
                <div class="formulaire-creation-default-fields-content hidden">
                    <p>Nom complet</p>
                    <p>Adresse e-mail</p>
                    <p>Numéro de téléphone</p>
                    <p>Adresse du projet</p>
                    <p>Code postal</p>
                    <p>Ville</p>
                </div>
            </div>
            <div class="formulaire-creation-custom-fields">
                <div class="formulaire-creation-custom-fields-header">
                    <h3>Champs personnalisés</h3>
                    <div class="formulaire-creation-custom-fields-toggle">
                        <div class="formulaire-creation-custom-field-create" onclick="toggle_create_custom_fields()">Ajouter un nouveau champ</div>
                        <div class="formulaire-creation-custom-field-view" onclick="toggle_custom_fields()">Voir</div>
                    </div>
                </div>
                <div class="formulaire-creation-custom-fields-content hidden">
                    <?php if (!empty($custom_fields)): ?>
                        <?php foreach ($custom_fields as $index => $field): ?>
                            <?php if (isset($field['type']) && isset($field['time']) && isset($field['name'])): ?>
                                <div class="formulaire-creation-custom-field" data-type="<?php echo esc_attr($field['type']); ?>" data-index="<?php echo esc_attr($index); ?>" data-time="<?php echo esc_attr($field['time']); ?>">
                                    <div class="formulaire-creation-custom-field-row">
                                        <div class="formulaire-creation-custom-field-name">
                                            <p><?php echo get_type_name($field['type']); ?></p>
                                            <input type="text" class="formulaire-creation-custom-field-input" name="custom_input_<?php echo esc_attr($field['time']); ?>" oninput="update_name(this)" value="<?php echo esc_attr($field['name']); ?>" />
                                        </div>
                                        <div class="formulaire-creation-custom-field-status">
                                            <p>Statut de sauvegarde</p>
                                            <div class="formulaire-creation-save-info">
                                                <div class="formulaire-creation-spinner formulaire-creation-custom-field-<?php echo esc_attr($field['time']); ?>-spinner hidden"></div>
                                                <div class="formulaire-creation-save formulaire-creation-custom-field-<?php echo esc_attr($field['time']); ?>-save hidden">&#10003;</div>
                                                <div class="formulaire-creation-fail formulaire-creation-custom-field-<?php echo esc_attr($field['time']); ?>-fail hidden">&#10005;</div>
                                            </div>
                                        </div>
                                        <div class="formulaire-creation-custom-field-actions">
                                            <button type="button" class="formulaire-creation-custom-field-remove" onclick="remove_custom_field(this)">X</button>
                                        </div>
                                    </div>
                                    <?php if ($field['type'] === 'region_checkbox' || $field['type'] === 'region_select' || $field['type'] === 'region_radio'): ?>
                                        <textarea class="formulaire-creation-custom-field-input" name="custom_input_<?php echo esc_attr($field['time']); ?>" oninput="update_region(this)"><?php echo isset($field['region']) ? esc_textarea($field['region']) : ''; ?></textarea>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    <?php endif; ?>
                        
                </div>
            </div>
            <div class="formulaire-creation-optional-fields">
                <div class="formulaire-creation-optional-fields-header">
                    <h3>Champs optionnels</h3>
                    <div class="formulaire-creation-optional-fields-view" onclick="toggle_optional_fields()">Voir</div>
                </div>
                <div class="formulaire-creation-optional-fields-content hidden">
                    <div class="formulaire-creation-optional-item">
                        <div class="formulaire-creation-optional-name">
                            <p>Prix inclus dans le mail</p>
                            <input type="checkbox" class="formulaire-creation-price-checkbox" name="formulaire_price" <?php echo $price ? 'checked' : ''; ?> onclick="update_optional_field(this)"/>
                        </div>
                        <div class="formulaire-creation-optional-save-info">
                            <div class="formulaire-creation-spinner formulaire-creation-price-spinner hidden"></div>
                            <div class="formulaire-creation-save formulaire-creation-price-save hidden">&#10003;</div>
                            <div class="formulaire-creation-fail formulaire-creation-price-fail hidden">&#10005;</div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
        <div class="formulaire-creation-custom-fields-create-content hidden">
            <button data-type="default_input" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Champ de saisie</button>
            <button data-type="default_textarea" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Zone de texte</button>
            <button data-type="default_file" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Fichier joint</button>
            <button data-type="region_checkbox" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Case à cocher</button>
            <button data-type="region_select" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Sélection</button>
            <button data-type="region_radio" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Boutons radio</button>
        </div>
    </div>
    <?php
}

function dv_render_email_customization_meta_box($post) {
    wp_enqueue_script(
        'email-customization-handle',
        DF_DEVIS_URL . 'assets/js/post-email.js',
        ['jquery', 'wp-data'],
        '1.0',
        true
    );

    wp_localize_script(
        'email-customization-handle',
        'devisEmailOptions', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'postId' => $post->ID,
        ]
    );

    $custom_email_title = get_post_meta($post->ID, '_custom_email_title', true);
    if (empty($custom_email_title)) {
        $custom_email_title = 'Nom du devis';
        update_post_meta($post->ID, '_custom_email_title', $custom_email_title);
    }

    $custom_email_banner_text = get_post_meta($post->ID, '_custom_email_banner_text', true);
    if (empty($custom_email_banner_text)) {
        $custom_email_banner_text = 'Information du client';
        update_post_meta($post->ID, '_custom_email_banner_text', $custom_email_banner_text);
    }

    $custom_email_info_color = get_post_meta($post->ID, '_custom_email_info_color', true);
    if (empty($custom_email_info_color)) {
        $custom_email_info_color = '#ea5223';
        update_post_meta($post->ID, '_custom_email_info_color', $custom_email_info_color);
    }

    $custom_email_footer_color = get_post_meta($post->ID, '_custom_email_footer_color', true);
    if (empty($custom_email_footer_color)) {
        $custom_email_footer_color = '#eeeeee';
        update_post_meta($post->ID, '_custom_email_footer_color', $custom_email_footer_color);
    }

    $custom_email_price_color = get_post_meta($post->ID, '_custom_email_price_color', true);
    if (empty($custom_email_price_color)) {
        $custom_email_price_color = '#ea5223';
        update_post_meta($post->ID, '_custom_email_price_color', $custom_email_price_color);
    }

    $custom_email_footer = get_post_meta($post->ID, '_custom_email_footer', true);
    if (empty($custom_email_footer)) {
        $custom_email_footer = 'mini info au cas ou ;)';
        update_post_meta($post->ID, '_custom_email_footer', $custom_email_footer);
    }

    ?>
    <link href="<?=DF_DEVIS_URL."assets/css/default/post-email.css"?>" rel="stylesheet" />
    <div class="custom-email-container">
        <div class="custom-email-page">
            <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:20px;">
            <tr>
                <td class="_custom_email_title" align="center" style="font-size:30px;font-weight:bold;padding-bottom:20px;">
                <?=esc_html($custom_email_title)?>
                </td>
            </tr>
            <tr>
                <td class="_custom_email_footer_color" style="background-color:<?=esc_attr($custom_email_footer_color)?>;padding:10px;">
                <p class="_custom_email_banner_text _custom_email_info_color" style="font-size:25px;color:#fff;background-color:<?=esc_attr($custom_email_info_color)?>;padding:10px 0;margin:0;text-align:center;">
                    <?=esc_html($custom_email_banner_text)?>
                </p>
                <p style="margin:10px 0;color:#555;">
                    <strong>Champ : </strong> Valeur
                </p>
                </td>
            </tr>
            <tr>
                <td style="padding:20px 0;">
                <p style="font-size:21px;font-weight:bold;text-align:center;margin-bottom:10px;">Choix du produit</p>
                <div style="text-align:center;">
                    <img src="https://picsum.photos/200/300" width="200" height="300" alt="Produit" style="display:block;margin:auto;">
                </div>
                <p style="font-weight:bold;text-align:center;margin:10px 0 0;">Nom du produit</p>
                <p style="text-align:center;margin:0;color:#555;">Autre chose</p>
                <p style="margin:10px 0;color:#555;">Poids: <strong>200kg</strong></p>
                <p style="margin:10px 0;color:#555;">Hauteur: <strong>1m</strong></p>
                </td>
            </tr>
            <tr>
                <td style="padding:10px 0;">
                <p style="color:#555;">Ce produit est incroyable!</p>
                </td>
            </tr>
            <tr>
                <td class="_custom_email_price_color" style="background-color:<?=esc_attr($custom_email_price_color)?>;color:#fff;font-size:24px;text-align:center;padding:15px;">
                TTC: 50000000 euro
                </td>
            </tr>
            <tr>
                <td style="padding-top:20px;text-align:center;color:#999;">
                <p class="_custom_email_footer"><?=esc_html($custom_email_footer)?></p>
                </td>
            </tr>
            </table>
        </div> 
        <div class="custom-email-actions">
            <h2>Modifier le contenu</h2>

            <div class="custom-email-field">
                <label for="title">Nom du devis</label>
                <input class="custom-email-input email-input" data-name="_custom_email_title" type="text" id="title" value="<?=esc_attr($custom_email_title)?>">
                <div class="formulaire-creation-optional-save-info">
                    <div class="custom-email-spinner hidden"></div>
                    <div class="custom-email-save hidden">&#10003;</div>
                    <div class="custom-email-fail hidden">&#10005;</div>
                </div>
            </div>

            <div class="custom-email-field">
                <label for="bannerText">Texte bannière</label>
                <input class="custom-email-input email-input" data-name="_custom_email_banner_text" type="text" id="bannerText" value="<?=esc_attr($custom_email_banner_text)?>">
                <div class="formulaire-creation-optional-save-info">
                    <div class="custom-email-spinner hidden"></div>
                    <div class="custom-email-save hidden">&#10003;</div>
                    <div class="custom-email-fail hidden">&#10005;</div>
                </div>
            </div>

            <div class="custom-email-field">
                <label for="infoColor">Couleur fond "Information du client"</label>
                <input class="custom-email-input email-bg-color" data-name="_custom_email_info_color" type="color" id="infoColor" value="<?=esc_attr($custom_email_info_color)?>">
                <div class="formulaire-creation-optional-save-info">
                    <div class="custom-email-spinner hidden"></div>
                    <div class="custom-email-save hidden">&#10003;</div>
                    <div class="custom-email-fail hidden">&#10005;</div>
                </div>
            </div>
    
            <div class="custom-email-field">
                <label for="footerColor">Couleur Informations</label>
                <input class="custom-email-input email-bg-color" data-name="_custom_email_footer_color" type="color" id="footerColor" value="<?=esc_attr($custom_email_footer_color)?>">
                <div class="formulaire-creation-optional-save-info">
                    <div class="custom-email-spinner hidden"></div>
                    <div class="custom-email-save hidden">&#10003;</div>
                    <div class="custom-email-fail hidden">&#10005;</div>
                </div>
            </div>

            <div class="custom-email-field">
                <label for="priceColor">Couleur fond TTC</label>
                <input class="custom-email-input email-bg-color" data-name="_custom_email_price_color" type="color" id="priceColor" value="<?=esc_attr($custom_email_price_color)?>">
                <div class="formulaire-creation-optional-save-info">
                    <div class="custom-email-spinner hidden"></div>
                    <div class="custom-email-save hidden">&#10003;</div>
                    <div class="custom-email-fail hidden">&#10005;</div>
                </div>
            </div>

            <div class="custom-email-field">
                <label for="footer">Texte bas de page</label>
                <textarea class="custom-email-input email-textarea" data-name="_custom_email_footer" type="text" id="footer" ><?=esc_attr($custom_email_footer)?></textarea>
                <div class="formulaire-creation-optional-save-info">
                    <div class="custom-email-spinner hidden"></div>
                    <div class="custom-email-save hidden">&#10003;</div>
                    <div class="custom-email-fail hidden">&#10005;</div>
                </div>
            </div>
        </div>
    </div> <?php
}

function dv_render_devis_settings_meta_box($post) {
    wp_enqueue_script(
        'devis-settings-handle',
        DF_DEVIS_URL . 'assets/js/post-settings.js',
        ['jquery'],
        '1.0',
        true
    );

    wp_localize_script(
        'devis-settings-handle',
        'devisSettingsOptions', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'postId' => $post->ID,
        ]
    );	

    ?>
    <link href="<?=DF_DEVIS_URL."assets/css/default/post-settings.css"?>" rel="stylesheet" />
    <div class="info-perso-container">
        <div class="devis-header">
            <h3>Paramètres du Devis</h3>
            <div class="devis-save-info">
                <div class="devis-spinner devis-owner-email-spinner hidden"></div>
                <div class="devis-save devis-owner-email-save hidden">&#10003;</div>
            </div>
        </div>
        <div class="devis-seperator"></div>
        <div class="devis-owner-email-container">
            <label for="devis_owner_email">Mail du propriétaire</label>
            <input type="email" id="devis_owner_email" class="devis_owner_email" 
                value="<?= esc_attr(get_post_meta($post->ID, '_devis_owner_email', true)) ?>" />
        </div>

        <div class="devis-generate-history">
            <input type="checkbox" class="devis_generate_history" 
                <?= checked(get_post_meta($post->ID, '_devis_generate_history', true), 'true', false) ?> />
            <p>Afficher un historique avant le formulaire de devis</p>
        </div>
    </div>
    <?php
}



/**
 * Prints the results in a formatted way
 *
 * @param array $results The results to print
 */
function print_result($results, $title = 'Results') {
    echo "<h2>$title</h2>";
    echo "<pre>";
    print_recursive($results);
    echo "</pre>";
}

function print_recursive($data, $indent = 0) {
    $prefix = str_repeat('  ', $indent);

    if (is_array($data)) {
        foreach ($data as $key => $value) {
            echo $prefix . "$key => ";
            if (is_array($value) || is_object($value)) {
                echo "\n";
                print_recursive($value, $indent + 1);
            } else {
                echo var_export($value, true) . "\n";
            }
        }
    } elseif (is_object($data)) {
        foreach (get_object_vars($data) as $key => $value) {
            echo $prefix . "$key => ";
            if (is_array($value) || is_object($value)) {
                echo "\n";
                print_recursive($value, $indent + 1);
            } else {
                echo var_export($value, true) . "\n";
            }
        }
    } else {
        echo $prefix . var_export($data, true) . "\n";
    }
}