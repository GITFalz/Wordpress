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
    wp_enqueue_media();

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
    <div class="custom-email-container"style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f4;">

        <!-- Outer wrapper table to center content -->
        <table width="50    %" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4" style="padding: 20px 0;">
            <tr>
            <td align="center">

                <!-- Main container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header: Logo + Title -->
                <tr>
                    <td style="background-color: #004085; padding: 20px; text-align: center; color: #ffffff;">
                    <!-- Logo placeholder -->
                    <!-- Replace with actual logo image src or remove if none -->
                    <img classsrc="<!-- LOGO_URL_HERE -->" alt="Logo" width="120" style="display: block; margin: 0 auto 10px;" />
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
                        <!-- Dynamic title -->
                        Titre du devis
                    </h1>
                    </td>
                </tr>
                
                <!-- Banner/info message -->
                <tr>
                    <td style="background-color: #f1f1f1; padding: 15px; text-align: center; color: #ffffff; font-size: 18px; font-weight: 600;">
                    Texte bannière
                    </td>
                </tr>

                <!-- Customer Info section -->
                <tr>
                    <td style="padding: 20px;">
                    <h2 style="font-size: 20px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 0; margin-bottom: 15px;">Informations client</h2>

                    <!-- Loop through $data fields -->
                    <p style="margin: 8px 0; color: #333;">
                        <strong>Champs :</strong> personnalisés
                    </p>
                    </td>
                </tr>

                <!-- Product Details -->
                <tr>
                    <td style="padding: 20px; background-color: #f9f9f9;">
                    <h2 style="font-size: 20px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 0; margin-bottom: 15px;">Détails du produit</h2>
                    
                    <div style="text-align: center; margin-bottom: 15px;">
                        <img src="https://picsum.photos/200/300" alt="Produit" width="200" height="300" style="border-radius: 6px; display: inline-block;" />
                    </div>

                    <p style="font-weight: bold; font-size: 16px; margin: 5px 0 10px;">Nom du produit</p>

                    <p style="color: #555; margin: 0 0 10px; white-space: pre-wrap;">Description du produit</p>

                    <p style="margin: 5px 0; color: #555;">
                        <strong>Champs :</strong> Additionnels
                    </p>
                    <p style="margin: 5px 0; color: #555;">
                        <strong>Du :</strong> Produit
                    </p>

                    <p style="color: #555; font-style: italic; margin-top: 20px;">Message additionnel</p>
                    </td>
                </tr>

                <!-- Price section -->
                <tr>
                    <td style="background-color: #f1f1f1; color: #fff; font-size: 24px; font-weight: bold; text-align: center; padding: 20px;">
                    Prix
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding: 15px; text-align: center; font-size: 14px; color: #999; background-color: #f1f1f1;">
                    Texte bas de page
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        <div class="custom-email-actions">
            <h2>Modifier le contenu</h2>

            <div class="custom-email-section">
                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <input type="checkbox" id="use_custom_email_logo" class="custom-email-input-checkbox" data-name="_use_custom_email_logo" />
                        <label for="custom_email_logo">Logo du devis</label>
                        
                    </div>
                    <button class="button button-secondary" id="upload_logo_button">Selectionner</button>
                    <img id="custom_email_logo" src="To be added" alt="Logo" style="max-width: 100px; margin-top: 10px;" />
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>
            </div>

            <div class="custom-email-section">
                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <input type="checkbox" id="use_custom_email_title" class="custom-email-input-checkbox" data-name="_use_custom_email_title" />
                        <label for="custom_email_title">Titre du devis</label>
                        
                    </div>
                    <input class="custom-email-input" data-name="_custom_email_title" type="text" id="custom_email_title" value="To be added" />
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <input class="custom-email-input-checkbox" data-name="_use_custom_email_banner_text" type="checkbox" id="use_custom_email_banner_text" />
                        <label for="custom_email_banner_text">Texte de la bannière</label>
                        
                    </div>
                    <input class="custom-email-input" data-name="_custom_email_banner_text" type="text" id="custom_email_banner_text" value="To be added" />
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <input class="custom-email-input-checkbox" data-name="_use_custom_email_banner_color" type="checkbox" id="use_custom_email_banner_color" />
                        <label for="custom_email_banner_color">Couleur de la bannière</label>
                        
                    </div>
                    <input class="custom-email-input" data-name="_custom_email_banner_color" type="color" id="custom_email_banner_color" value="To be added" />
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>
            </div>

            <div class="custom-email-section">
                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <input class="custom-email-input-checkbox" data-name="_use_custom_email_additional_message" type="checkbox" id="use_custom_email_additional_message" />
                        <label for="custom_email_info_color">Couleur des informations</label>
                        
                    </div>
                    <textarea class="custom-email-input" data-name="_custom_email_additional_message" id="custom_email_additional_message">To be added</textarea>
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <input class="custom-email-input-checkbox" data-name="_use_custom_email_footer_color" type="checkbox" id="use_custom_email_footer_color" />
                        <label for="custom_email_info_color">Couleur du bas de page</label>
                        
                    </div>
                    <input class="custom-email-input" data-name="_custom_email_footer_color" type="color" id="custom_email_footer_color" value="To be added" />
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <input class="custom-email-input-checkbox" data-name="_use_custom_email_price_color" type="checkbox" id="use_custom_email_price_color" />
                        <label for="custom_email_price_color">Couleur du prix</label>
                        
                    </div>
                    <input class="custom-email-input" data-name="_custom_email_price_color" type="color" id="custom_email_price_color" value="To be added" />
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <input class="custom-email-input-checkbox" data-name="_use_custom_email_footer" type="checkbox" id="use_custom_email_footer" />
                        <label for="custom_email_footer">Texte du pied de page</label>
                        
                    </div>  
                    <textarea class="custom-email-input" data-name="_custom_email_footer" id="custom_email_footer">To be added</textarea>  
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <?php
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