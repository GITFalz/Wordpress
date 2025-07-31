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
                    <div class="formulaire-creation-default-fields-view" onclick="toggle_default_fields(this)">Voir</div>
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
                        <div class="formulaire-creation-custom-field-view" onclick="toggle_custom_fields(this)">Voir</div>
                        <div class="formulaire-creation-custom-fields-create-content hidden">
                            <button data-type="default_input" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Champ de saisie</button>
                            <button data-type="default_textarea" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Zone de texte</button>
                            <button data-type="default_file" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Fichier joint</button>
                            <button data-type="region_checkbox" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Case à cocher</button>
                            <button data-type="region_select" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Sélection</button>
                            <button data-type="region_radio" class="formulaire-create-custom-field" type="button" onclick="create_custom_field(this)">Boutons radio</button>
                        </div>
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
                                            <div class="formulaire-creation-save-info">
                                                <div class="formulaire-creation-spinner formulaire-creation-custom-field-<?php echo esc_attr($field['time']); ?>-spinner hidden"></div>
                                                <div class="formulaire-creation-save formulaire-creation-custom-field-<?php echo esc_attr($field['time']); ?>-save hidden">Enregistré</div>
                                                <div class="formulaire-creation-fail formulaire-creation-custom-field-<?php echo esc_attr($field['time']); ?>-fail hidden">&#10005;</div>
                                            </div>
                                        </div>
                                        <div class="formulaire-creation-custom-field-actions">
                                            <button type="button" class="formulaire-creation-custom-field-remove" onclick="remove_custom_field(this)">X</button>
                                        </div>
                                    </div>
                                    <?php if ($field['type'] === 'region_checkbox' || $field['type'] === 'region_select' || $field['type'] === 'region_radio'): ?>
                                    <div class="formulaire-creation-custom-field-option-input">
                                        <p>Chaque ligne correspond à une option</p>
                                        <textarea class="formulaire-creation-custom-field-input" name="custom_input_<?php echo esc_attr($field['time']); ?>" oninput="update_region(this)"><?php echo isset($field['region']) ? esc_textarea($field['region']) : ''; ?></textarea>
                                    </div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    <?php endif; ?>
                        
                </div>
            </div>
        </div>
    </div>
    <?php
}

function renderEmailBanner($post_id) {
    $logoUrl = get_post_meta($post_id, '_custom_email_logo', true);
    $title = get_post_meta($post_id, '_custom_email_title', true);
    $titleAlign = get_post_meta($post_id, '_custom_email_title_position', true);
    $logoPosition = get_post_meta($post_id, '_custom_email_logo_position', true);
    $titleColor = get_post_meta($post_id, '_custom_email_title_color', true);
    $bannerColor = get_post_meta($post_id, '_custom_email_banner_color', true);
    $useLogo = get_post_meta($post_id, '_use_custom_email_logo', true) === 'yes';

    // Helper to create image cell with correct padding
    $createImgCell = function($url, $isLeft, $isRight, $useLogo) {
        $paddingLeft = $isLeft ? '10px' : '0';
        $paddingRight = $isRight ? '10px' : '0';

        $img = $url
            ? '<img class="_use_custom_email_logo ' . ($useLogo ? '' : 'hidden') . '" src="' . htmlspecialchars($url) . '" alt="Logo" width="50" height="50" style="display:block; border:none; outline:none; max-width:100%; height:auto;" />'
            : '<div style="width:50px; height:50px;"></div>';

        return '<td width="50" valign="middle" style="width:50px; max-width:50px; padding-left:' . $paddingLeft . '; padding-right:' . $paddingRight . '; overflow:hidden;">' . $img . '</td>';
    };

    $titleCell = '<td style="vertical-align:middle; padding:10px; text-align:' . htmlspecialchars($titleAlign) . ';">
        <h1 class="_custom_email_title _custom_email_title_color" style="margin:0; font-size:28px; color:' . htmlspecialchars($titleColor) . '; font-weight: bold; line-height:1.1;">' . htmlspecialchars($title) . '</h1>
    </td>';

    $tableStart = '<table class="custom-email-banner _custom_email_banner_color" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:' . htmlspecialchars($bannerColor) . '; border-collapse:collapse; height: 100px">';
    $tableEnd = '</table>';

    $output = $tableStart . '<tr>';

    if ($logoPosition === 'left') {
        $output .= $createImgCell($logoUrl, true, false, $useLogo);
        $output .= $titleCell;
        if ($titleAlign === 'center') {
            $output .= $createImgCell('', false, true, $useLogo);
        }
    } elseif ($logoPosition === 'right') {
        if ($titleAlign === 'center') {
            $output .= $createImgCell('', true, false, $useLogo);
        }
        $output .= $titleCell;
        $output .= $createImgCell($logoUrl, false, true, $useLogo);
    } elseif ($logoPosition === 'center') {
        $img = '<img class="_use_custom_email_logo ' . ($useLogo ? '' : 'hidden') . '" src="' . htmlspecialchars($logoUrl) . '" alt="Logo" width="50" height="50" style="display:block; margin:0 auto 10px; border:none; outline:none; max-width:100%; height:auto;" />';
        $output .= '<td colspan="3" style="text-align:' . htmlspecialchars($titleAlign) . '; padding:10px;">' . $img . '
            <h1 class="_custom_email_title _custom_email_title_color" style="margin:0; color:' . htmlspecialchars($titleColor) . '; font-size:28px; font-weight: bold; line-height:1.1;">' . htmlspecialchars($title) . '</h1>
        </td>';
    }

    $output .= '</tr>' . $tableEnd;

    return $output;
}

function dv_render_email_customization_meta_box($post) {
    $custom_email_logo = get_post_meta($post->ID, '_custom_email_logo', true);
    if (empty($custom_email_logo)) {
        $custom_email_logo = 'https://picsum.photos/200/300'; // Default logo URL
        update_post_meta($post->ID, '_custom_email_logo', $custom_email_logo);
    }

    $custom_email_title = get_post_meta($post->ID, '_custom_email_title', true);
    if (empty($custom_email_title)) {
        $custom_email_title = 'Titre du devis';
        update_post_meta($post->ID, '_custom_email_title', $custom_email_title);
    }

    $custom_email_title_position = get_post_meta($post->ID, '_custom_email_title_position', true);
    if (empty($custom_email_title_position)) {
        $custom_email_title_position = 'center';
        update_post_meta($post->ID, '_custom_email_title_position', $custom_email_title_position);
    }

    $custom_email_logo_position = get_post_meta($post->ID, '_custom_email_logo_position', true);
    if (empty($custom_email_logo_position)) {
        $custom_email_logo_position = 'left';
        update_post_meta($post->ID, '_custom_email_logo_position', $custom_email_logo_position);
    }

    $custom_email_title_color = get_post_meta($post->ID, '_custom_email_title_color', true);
    if (empty($custom_email_title_color)) {
        $custom_email_title_color = '#000000';
        update_post_meta($post->ID, '_custom_email_title_color', $custom_email_title_color);
    }

    $custom_email_banner_color = get_post_meta($post->ID, '_custom_email_banner_color', true);
    if (empty($custom_email_banner_color)) {
        $custom_email_banner_color = '#004085';
        update_post_meta($post->ID, '_custom_email_banner_color', $custom_email_banner_color);
    }

    $custom_email_additional_message = get_post_meta($post->ID, '_custom_email_additional_message', true);
    if (empty($custom_email_additional_message)) {
        $custom_email_additional_message = 'Message additionnel par défaut';
        update_post_meta($post->ID, '_custom_email_additional_message', $custom_email_additional_message);
    }

    $custom_email_footer_color = get_post_meta($post->ID, '_custom_email_footer_color', true);
    if (empty($custom_email_footer_color)) {
        $custom_email_footer_color = '#004085';
        update_post_meta($post->ID, '_custom_email_footer_color', $custom_email_footer_color);
    }

    $custom_email_price_color = get_post_meta($post->ID, '_custom_email_price_color', true);    
    if (empty($custom_email_price_color)) {
        $custom_email_price_color = '#ffffff';
        update_post_meta($post->ID, '_custom_email_price_color', $custom_email_price_color);
    }

    $custom_email_footer = get_post_meta($post->ID, '_custom_email_footer', true);
    if (empty($custom_email_footer)) {
        $custom_email_footer = 'Pied de page par défaut';
        update_post_meta($post->ID, '_custom_email_footer', $custom_email_footer);
    }


    $use_custom_email_logo = get_post_meta($post->ID, '_use_custom_email_logo', true);
    if (empty($use_custom_email_logo)) {
        $use_custom_email_logo = 'yes';
        update_post_meta($post->ID, '_use_custom_email_logo', $use_custom_email_logo);
    }

    $use_custom_email_additional_message = get_post_meta($post->ID, '_use_custom_email_additional_message', true);
    if (empty($use_custom_email_additional_message)) {
        $use_custom_email_additional_message = 'yes';
        update_post_meta($post->ID, '_use_custom_email_additional_message', $use_custom_email_additional_message);
    }

    $use_custom_email_price = get_post_meta($post->ID, '_use_custom_email_price', true);
    if (empty($use_custom_email_price)) {
        $use_custom_email_price = 'yes';
        update_post_meta($post->ID, '_use_custom_email_price', $use_custom_email_price);
    }

    $use_custom_email_footer = get_post_meta($post->ID, '_use_custom_email_footer', true);
    if (empty($use_custom_email_footer)) {
        $use_custom_email_footer = 'yes';
        update_post_meta($post->ID, '_use_custom_email_footer', $use_custom_email_footer);
    }


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
            'useCustomEmailLogo' => $use_custom_email_logo,
        ]
    );

    ?>
    <link href="<?=DF_DEVIS_URL."assets/css/default/post-email.css"?>" rel="stylesheet" />
    <div class="custom-email-container"style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f4;">

        <!-- Outer wrapper table to center content -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4" style="padding: 20px 0;">
            <tr>
            <td align="center">

                <!-- Main container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header: Logo + Title -->
                <?php echo renderEmailBanner($post->ID); ?>

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

                    <p class="_custom_email_additional_message _use_custom_email_additional_message <?= $use_custom_email_additional_message === 'yes' ? '' : 'hidden' ?>" style="color: #555; font-style: italic; margin-top: 20px;"><?= esc_html($custom_email_additional_message) ?></p>
                    </td>
                </tr>

                <!-- Price section -->
                <tr class="_use_custom_email_price <?= $use_custom_email_price === 'yes' ? '' : 'hidden' ?>">
                    <td class="_custom_email_footer_color" style="background-color: <?= esc_attr($custom_email_footer_color) ?>; color: #fff; font-size: 24px; font-weight: bold; text-align: center; padding: 20px;">
                    <span class="_custom_email_price_color" style="color: <?= esc_attr($custom_email_price_color) ?>;">TTC: 100.00€</span>
                    </td>
                </tr>

                <!-- Footer -->
                <tr class="_use_custom_email_footer <?= $use_custom_email_footer === 'yes' ? '' : 'hidden' ?>">
                    <td class="_custom_email_footer" style="padding: 15px; text-align: center; font-size: 14px; color: #999; background-color: #f1f1f1;">
                    <?= esc_html($custom_email_footer) ?>
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        <div class="custom-email-actions">
            <h2>Modifier le contenu</h2>

            <div class="custom-email-section">
                <div class="custom-email-field custom-email-parts">
                    <div class="custom-email-side-left">
                        <div class="custom-email-field-header">
                            <input type="checkbox" id="use_custom_email_logo" class="custom-email-input-checkbox" data-name="_use_custom_email_logo" <?= $use_custom_email_logo === 'yes' ? 'checked' : '' ?> />
                            <label for="custom_email_logo">Logo du devis</label>
                        </div>
                        <div class="custom-email-left-controls">
                            <button type="button" class="button button-secondary" id="upload_logo_button" onclick="selectNewImage()">Selectionner</button>
                            <img id="custom_email_logo" src="<?= esc_url($custom_email_logo) ?>" alt="Logo" />
                        <div class="custom-email-save-info">
                            <div class="custom-email-spinner hidden"></div>
                            <div class="custom-email-save hidden">&#10003;</div>
                            <div class="custom-email-fail hidden">&#10005;</div>
                        </div>
                        </div>
                    </div>
                    <div class="custom-email-side-right">
                        <div class="custom-email-field-header">
                            <label for="custom_email_logo">Emplacement du logo</label>
                        </div>
                        <div class="custom-email-position-buttons">
                            <button type="button" class="button button-positioning button-logo-left <?= $custom_email_logo_position === 'left' ? 'active' : '' ?>" data-name="_custom_email_logo_position" value="left"><</button>
                            <button type="button" class="button button-positioning button-logo-center <?= $custom_email_logo_position === 'center' ? 'active' : '' ?>" data-name="_custom_email_logo_position" value="center">|</button>
                            <button type="button" class="button button-positioning button-logo-right <?= $custom_email_logo_position === 'right' ? 'active' : '' ?>" data-name="_custom_email_logo_position" value="right">></button>
                        </div>
                    </div>
                </div>

                <div class="custom-email-field custom-email-parts">
                    <div class="custom-email-side-left">
                        <div class="custom-email-field-header">
                            <label for="custom_email_title">Titre du devis</label>                        
                        </div>
                        <input class="custom-email-input" data-name="_custom_email_title" type="text" id="custom_email_title" value="To be added" />
                        <div class="custom-email-save-info">
                            <div class="custom-email-spinner hidden"></div>
                            <div class="custom-email-save hidden">&#10003;</div>
                            <div class="custom-email-fail hidden">&#10005;</div>
                        </div>
                    </div>
                    <div class="custom-email-side-right">
                        <div class="custom-email-field-header">
                            <label for="custom_email_title">Emplacement du titre</label>
                        </div>
                        <div class="custom-email-position-buttons">
                            <button type="button" class="button button-positioning button-title-left <?= $custom_email_title_position === 'left' ? 'active' : '' ?>" data-name="_custom_email_title_position" value="left" <?= $custom_email_logo_position === 'center' ? 'disabled' : '' ?>> <</button>
                            <button type="button" class="button button-positioning button-title-center <?= $custom_email_title_position === 'center' ? 'active' : '' ?>" data-name="_custom_email_title_position" value="center">|</button>
                            <button type="button" class="button button-positioning button-title-right <?= $custom_email_title_position === 'right' ? 'active' : '' ?>" data-name="_custom_email_title_position" value="right" <?= $custom_email_logo_position === 'center' ? 'disabled' : '' ?>>></button>
                        </div>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <label for="custom_email_title_color">Couleur du titre</label>
                    </div>
                    <input class="custom-email-input email-color" data-name="_custom_email_title_color" type="color" id="custom_email_title_color" value="<?= esc_attr($custom_email_title_color) ?>" />
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <label for="custom_email_banner_color">Couleur de la bannière</label>
                    </div>
                    <input class="custom-email-input email-bg-color" data-name="_custom_email_banner_color" type="color" id="custom_email_banner_color" value="<?= esc_attr($custom_email_banner_color) ?>" />
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
                        <input class="custom-email-input-checkbox" data-name="_use_custom_email_additional_message" type="checkbox" id="use_custom_email_additional_message" <?= $use_custom_email_additional_message === 'yes' ? 'checked' : '' ?> />
                        <label for="custom_email_additional_message">Message additionnel</label>                        
                    </div>
                    <textarea class="custom-email-input" data-name="_custom_email_additional_message" id="custom_email_additional_message"><?= esc_html($custom_email_additional_message) ?></textarea>
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>

                <div class="custom-email-tiny-field">
                    <div class="custom-email-field-header">
                        <input class="custom-email-input-checkbox" data-name="_use_custom_email_price" type="checkbox" id="use_custom_email_price" <?= $use_custom_email_price === 'yes' ? 'checked' : '' ?> />
                        <label for="custom_email_price">Inclure le prix dans l'email</label>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <label for="custom_email_footer_color">Couleur de la bannière de prix</label>                      
                    </div>
                    <input class="custom-email-input email-bg-color" data-name="_custom_email_footer_color" type="color" id="custom_email_footer_color" value="<?= esc_attr($custom_email_footer_color) ?>" />
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <label for="custom_email_price_color">Couleur du prix</label>
                    </div>
                    <input class="custom-email-input email-color" data-name="_custom_email_price_color" type="color" id="custom_email_price_color" value="<?= esc_attr($custom_email_price_color) ?>" />
                    <div class="custom-email-save-info">
                        <div class="custom-email-spinner hidden"></div>
                        <div class="custom-email-save hidden">&#10003;</div>
                        <div class="custom-email-fail hidden">&#10005;</div>
                    </div>
                </div>

                <div class="custom-email-field">
                    <div class="custom-email-field-header">
                        <input class="custom-email-input-checkbox" data-name="_use_custom_email_footer" type="checkbox" id="use_custom_email_footer" <?= $use_custom_email_footer === 'yes' ? 'checked' : '' ?> />
                        <label for="custom_email_footer">Texte du pied de page</label>
                    </div>  
                    <textarea class="custom-email-input" data-name="_custom_email_footer" id="custom_email_footer"><?= esc_html($custom_email_footer) ?></textarea>  
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

        <div class="devis-add-redirection-page">
            <input type="checkbox" class="devis_add_redirection_page" 
                <?= checked(get_post_meta($post->ID, '_devis_add_redirection_page', true), 'true', false) ?> />
            <p>Ajouter une page de redirection après le formulaire de devis</p>
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