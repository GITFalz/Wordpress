<?php
function get_devis_page_html($stepData, $firstOptions) {
    $settings = dfdv()->settings;
    ob_start();
    ?>
    <link rel="stylesheet" href="<?php echo esc_url(DF_DEVIS_URL . 'assets/css/custom/devis.css'); ?>">
    <div class="df-devis-container" data-show-step-index="<?php echo esc_attr($settings['afficher_index_étape'] ? 'true' : 'false'); ?>" data-nb-etape-fixe="<?php echo esc_attr($settings['nombre_etapes_fixes'] ? 'true' : 'false'); ?>">
        <div class="df-devis-steps">
            <?php foreach ($stepData as $step): ?>
                <div class="df-devis-step <?= intval($step['step_index']) == 1 ? "step-current" : "step-next" ?>" data-index="<?php echo esc_attr($step['step_index']); ?>" onclick="selectStep(this)">
                    <h2><?php echo esc_html($step['step_name']); ?></h2>
                </div>
            <?php endforeach; ?>
        </div>
        <div class="df-devis-step-content">
            <div class="df-devis-options">
                <?php if (!empty($firstOptions)): ?>
                    <?= get_devis_options_html($firstOptions); ?>
                <?php endif; ?>
                
            </div>
            <div class="df-devis-loading hidden">
                <div class="df-balls">
                    <div class="df-ball df-ball-1"></div>
                    <div class="df-ball df-ball-2"></div>
                </div>
            </div>
        </div>
        <div class="df-pop-up hidden">
            <div class="df-pop-up-content">
                <button class="df-pop-up-close" onclick="dv_close_popup()">×</button>
                <div class="df-pop-up-body">
                    <h2 class="df-pop-up-title">Attention!</h2>
                    <div class="df-pop-up-options">Alert</div>
                </div>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

function get_devis_options_html($options) {
    ob_start();
    foreach ($options as $option) {
        ?>
        <div class="df-devis-option" data-id="<?php echo esc_attr($option['id']); ?>" onclick="selectOption(this)">
            <h3><?php echo esc_html($option['option_name']); ?></h3>
            <?php if (!empty($option['image_url'])): ?>
                <img src="<?php echo esc_url($option['image_url']); ?>" alt="<?php echo esc_attr($option['option_name']); ?>">
            <?php endif; ?>
        </div>
        <?php
    }
    return ob_get_clean();
}

function get_devis_history_html($step_id) {
    $product = dvdb_get_product_by_step($step_id);
    if (!$product) {
        throw new Exception('Product not found for step ID: ' . $step_id);
    }
    $data = json_decode($product->data, true);
    ob_start(); ?>
    <div class="df-history-list">
        <h2 class="df-title">Historique de l'étape</h2>
        <?php
        $history = dvdb_get_history_by_step($step_id);
        if (!empty($history)) {
            foreach ($history as $step_index => $item) {
                ?>
                <div class="df-history-item">
                    <?php if (!empty($item['image_url'])): ?>
                        <img class="df-history-thumb" src="<?php echo esc_url($item['image_url']) ?>" alt="<?php echo esc_attr($item['option_name']); ?>">
                    <?php else: ?>
                        <img class="df-history-thumb placeholder" src="https://placehold.co/400x400?text=Na" alt="Placeholder">
                    <?php endif; ?>
                    <div class="df-history-content">
                        <p class="df-history-title"><?php echo esc_html($item['option_name']); ?></p>
                        <?php if (isset($item['data']['cost']['history_visible']) && $item['data']['cost']['history_visible']): ?>
                            <p class="df-history-cost">Coût: <?php echo esc_html($item['data']['cost']['additional']); ?></p>
                        <?php endif; ?>
                    </div>
                </div>
                <?php
            }
        }
        ?>
        <h3 class="df-subtitle">Produit associé</h3>
        <div class="df-history-item product">
            <?php if ($data): ?>
                <?php if (!empty($data['image'])): ?>
                    <img class="df-history-thumb" src="<?php echo esc_url($data['image']); ?>" alt="<?php echo esc_attr($data['name']); ?>">
                <?php else: ?>
                    <div class="df-history-thumb placeholder"></div>
                <?php endif; ?>
                <div class="df-history-content">
                    <p class="df-history-title"><?php echo esc_html($data['name']); ?></p>
                    <p class="df-history-cost">Coût: <?php echo esc_html($data['price']); ?></p>
                    <p class="df-history-description"><?php echo esc_html($data['description']); ?></p>
                </div>
            <?php endif; ?>
        </div>

        <div class="df-devis-next-button-wrapper">
            <button class="df-devis-next-button" data-id="<?php echo esc_attr($step_id); ?>" onclick="next_history(this)">Suivant</button>
        </div>
    </div> <?php
    return ob_get_clean();
}

function get_devis_form_html($step_id, $post_id) {
    $post = get_post($post_id);
    if (!$post) {
        throw new Exception('Post not found for ID: ' . $post_id);
    }
    $custom_fields = get_post_meta($post_id, '_devis_custom_fields', true);
    $price = get_post_meta($post_id, 'formulaire_price', true);
    
    ob_start(); ?>
    <div class="formulaire" data-id="<?php echo esc_attr($step_id); ?>">
        <div class="formulaire-left">
            <!-- First 6 base fields -->
            <!-- Nom Complet -->
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="client-name">Nom Complet</label>
                <input class="formulaire-input" type="text" id="client-name" name="client_name" required>
            </div>
            <!-- Adresse Email -->
            <div class="formulaire-field" data-type="default_email">
                <label class="formulaire-label" for="client-email">Adresse Email</label>
                <input class="formulaire-input" type="email" id="client-email" name="client_email" required>
            </div>
            <!-- Téléphone -->
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="client-phone">Numéro de Téléphone</label>
                <input class="formulaire-input" type="tel" id="client-phone" name="client_phone" required>
            </div>
            <!-- Adresse du Projet -->
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="project-address">Adresse du Projet</label>
                <input class="formulaire-input" type="text" id="project-address" name="project_address" required>
            </div>
            <!-- Code Postal -->
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="additional-code-postal">Code Postal</label>
                <input class="formulaire-input" type="text" id="additional-code-postal" name="additional_code_postal" required>
            </div>
            <!-- Ville -->
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="formulaire-ville">Ville</label>
                <input class="formulaire-input" type="text" id="formulaire-ville" name="formulaire-ville" required>
            </div>
        </div>

        <div class="formulaire-right">
            <!-- Custom fields -->
            <?php foreach ($custom_fields as $field): ?>
                <div class="formulaire-field" data-type="<?=$field['type']?>">
                    <label class="formulaire-label" for="custom-field-<?=$field['time']?>"><?=esc_html($field['name'])?></label>
                        <?php if ($field['type'] === 'default_input'): ?>
                            <input class="formulaire-input" type="text" id="custom-field-<?=$field['time']?>" name="custom_field_<?=$field['time']?>" value="">
                        <?php elseif ($field['type'] === 'default_textarea'): ?>
                            <textarea class="formulaire-textarea" id="custom-field-<?=$field['time']?>" name="custom_field_<?=$field['time']?>"></textarea>
                        <?php elseif ($field['type'] === 'default_file'): ?>
                            <input class="formulaire-file" type="file" id="custom-field-<?=$field['time']?>" name="custom_field_<?=$field['time']?>">
                        <?php elseif ($field['type'] === 'region_checkbox'): ?>
                            <div class="formulaire-region-checkbox">
                                <?php foreach (explode("\n", $field['region']) as $option): ?>
                                    <label class="formulaire-label" for="custom-field-<?=$field['time']?>-<?=$option?>">
                                    <input class="formulaire-checkbox" type="checkbox" id="custom-field-<?=$field['time']?>-<?=$option?>" name="custom_field_<?=$field['time']?>[]" value="1">
                                    <?=esc_html($option)?>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        <?php elseif ($field['type'] === 'region_select'): ?>
                            <select class="formulaire-select" id="custom-field-<?=$field['time']?>" name="custom_field_<?=$field['time']?>">
                                <?php foreach (explode("\n", $field['region']) as $option): ?>
                                    <option value="<?=esc_attr($option)?>"><?=esc_html($option)?></option>
                                <?php endforeach; ?>
                            </select>
                        <?php elseif ($field['type'] === 'region_radio'): ?>
                            <div class="formulaire-region-radio">
                                <?php foreach (explode("\n", $field['region']) as $option): ?>
                                    <label class="formulaire-label" for="custom-field-<?=$field['time']?>-<?=$option?>">
                                    <input class="formulaire-radio" type="radio" id="custom-field-<?=$field['time']?>-<?=$option?>" name="custom_field_<?=$field['time']?>" value="<?=esc_attr($option)?>">
                                    <?=esc_html($option)?>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>

            <div class="formulaire-send">
                <button type="button" class="formulaire-send-button" onclick="formulaire_send_email(this)">Envoyer</button>
                <p class="devis-sent-info"></p>
            </div>
        </div>
    <?php return ob_get_clean();
}

function get_devis_email_html($data, $product_data, $post_id, $final_cost) {
    $custom_email_logo = get_post_meta($post->ID, '_custom_email_logo', true);
    $custom_email_title = get_post_meta($post->ID, '_custom_email_title', true);
    $custom_email_title_position = get_post_meta($post->ID, '_custom_email_title_position', true);
    $custom_email_logo_position = get_post_meta($post->ID, '_custom_email_logo_position', true);
    $custom_email_title_color = get_post_meta($post->ID, '_custom_email_title_color', true);
    $custom_email_banner_color = get_post_meta($post->ID, '_custom_email_banner_color', true);
    $custom_email_additional_message = get_post_meta($post->ID, '_custom_email_additional_message', true);
    $custom_email_footer_color = get_post_meta($post->ID, '_custom_email_footer_color', true);
    $custom_email_price_color = get_post_meta($post->ID, '_custom_email_price_color', true);    
    $custom_email_footer = get_post_meta($post->ID, '_custom_email_footer', true);

    $use_custom_email_logo = get_post_meta($post->ID, '_use_custom_email_logo', true);
    $use_custom_email_additional_message = get_post_meta($post->ID, '_use_custom_email_additional_message', true);
    $use_custom_email_price = get_post_meta($post->ID, '_use_custom_email_price', true);
    $use_custom_email_footer = get_post_meta($post->ID, '_use_custom_email_footer', true);

    ob_start(); ?>
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:sans-serif;background-color:#f4f4f4;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4" style="padding: 20px 0;">
            <tr>
                <td align="center">

                    <!-- Main container -->
                    <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                        <!-- Header: Logo + Title -->
                        <?php echo getEmailBanner($post->ID); ?>

                        <!-- Customer Info section -->
                        <tr>
                            <td style="padding: 20px;">
                            <h2 style="font-size: 20px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 0; margin-bottom: 15px;">Informations client</h2>
                            <!-- Loop through $data fields -->
                            <?php foreach ($data as $field): ?>
                                <?php if (!empty($field['label']) && isset($field['value'])): ?>
                                    <p style="margin:8px 0;color:#333;">
                                        <strong><?php echo esc_html($field['label']); ?> : </strong> <?php echo nl2br(esc_html($field['value'])); ?>
                                    </p>
                                <?php endif; ?>
                            <?php endforeach; ?>
                            </td>
                        </tr>

                        <!-- Product Details -->
                        <tr>
                            <td style="padding: 20px; background-color: #f9f9f9;">
                            <h2 style="font-size: 20px; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 0; margin-bottom: 15px;">Détails du produit</h2>
                            
                            <div style="text-align: center; margin-bottom: 15px;">
                                <?php if ($product_data && isset($product_data['image'])): ?>
                                    <img src="<?php echo esc_url($product_data['image']); ?>" alt="Produit" width="200" height="300" style="border-radius: 6px; display: inline-block;">
                                <?php endif; ?>
                            </div>
                                    
                            <?php if ($product_data && isset($product_data['name'])): ?>	
                                <p style="font-weight: bold; font-size: 16px; margin: 5px 0 10px;"><?php echo esc_html($product_data['name']); ?></p>
                            <?php endif; ?>
                            
                            <?php if ($product_data && isset($product_data['description'])): ?>
                                <p style="color: #555; margin: 0 0 10px; white-space: pre-wrap;"><?php echo nl2br(esc_html($product_data['description'])); ?></p>
                            <?php endif; ?>

                            <?php if ($product_data && isset($product_data['extras'])): ?>
                                <?php foreach ($product_data['extras'] as $extra): ?>
                                    <p style="margin:5px 0;color:#555;">
                                        <strong><?php echo esc_html($extra['name']); ?> : </strong> <?php echo nl2br(esc_html($extra['value'])); ?>
                                    </p>
                                <?php endforeach; ?>
                            <?php endif; ?>
                            
                            <?php if ($use_custom_email_additional_message === 'yes' && !empty($custom_email_additional_message)): ?>
                                <p style="color: #555; font-style: italic; margin-top: 20px;"><?php echo esc_html($custom_email_additional_message); ?></p>
                            <?php endif; ?>
                            </td>
                        </tr>

                        <!-- Price section -->
                        <?php if ($use_custom_email_price === 'yes'): ?>
                            <tr class="_use_custom_email_price">
                                <td class="_custom_email_footer_color" style="background-color: <?= esc_attr($custom_email_footer_color) ?>; color: #fff; font-size: 24px; font-weight: bold; text-align: center; padding: 20px;">
                                <span class="_custom_email_price_color" style="color: <?= esc_attr($custom_email_price_color) ?>;">TTC: <?= esc_html($final_cost) ?>€</span>
                                </td>
                            </tr>
                        <?php endif; ?>

                        <!-- Footer -->
                        <?php if ($use_custom_email_footer === 'yes'): ?>
                            <tr class="_use_custom_email_footer">
                                <td class="_custom_email_footer" style="padding: 15px; text-align: center; font-size: 14px; color: #999; background-color: #f1f1f1;">
                                <?= esc_html($custom_email_footer) ?>
                                </td>
                            </tr>
                        <?php endif; ?>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html> <?php
    return ob_get_clean();
}


function getEmailBanner($post_id) {
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

        $img = ($url && $useLogo)
            ? '<img class="_use_custom_email_logo ' . ($useLogo ? '' : 'hidden') . '" src="' . htmlspecialchars($url) . '" alt="Logo" width="50" height="50" style="display:block; border:none; outline:none; max-width:100%; height:auto;" />'
            : '<div style="width:50px; height:50px;"></div>';

        return '<td width="50" valign="middle" style="width:50px; max-width:50px; padding-left:' . $paddingLeft . '; padding-right:' . $paddingRight . '; overflow:hidden;">' . $img . '</td>';
    };

    $titleCell = '<td style="vertical-align:middle; padding:10px; text-align:' . htmlspecialchars($titleAlign) . ';">
        <h1 class="_custom_email_title _custom_email_title_color" style="margin:0; font-size:28px; color:' . htmlspecialchars($titleColor) . '; font-weight: bold; line-height:1.1;">' . htmlspecialchars($title) . '</h1>
    </td>';

    $tableStart = '<table class="custom-email-banner _custom_email_banner_color" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:' . htmlspecialchars($bannerColor) . '; border-collapse:collapse;">';
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

function handle_dv_get_first_step_content_html() {
    try {
        if (!isset($_POST['post_id'])) {
            throw new Exception('Missing post ID');
        }

        $post_id = intval($_POST['post_id']);
        if (empty($post_id)) {
            throw new Exception('Invalid post ID');
        }

        $firstStep = dvdb_get_steps_by_index($post_id, 1)[0] ?? null;
        if (!$firstStep) {
            throw new Exception('First step not found for post ID: ' . $post_id);
        }

        $firstOptions = json_decode(json_encode(dvdb_get_options_by_step($firstStep->id)), true);
        if (empty($firstOptions)) {
            throw new Exception('No options found for first step ID: ' . $firstStep->id);
        }

        $html = get_devis_options_html($firstOptions);
        wp_send_json_success(['html' => $html]);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_get_first_step_content_html', 'handle_dv_get_first_step_content_html');

function handle_dv_get_option_step_content_html() {
    try {
        if (!isset($_POST['option_id']) || !isset($_POST['generate_history'])) {
            throw new Exception('Missing required parameters');
        }

        $option_id = intval($_POST['option_id']);
        $generate_history = $_POST['generate_history'] === 'true';

        if (empty($option_id)) {
            throw new Exception('Invalid option ID');
        }

        $option = dvdb_get_option($option_id);
        if (!$option) {
            throw new Exception('Option not found');
        }

        $warning = $option->warning;
        if (!empty($warning)) {
            wp_send_json_error(['message' => $warning]);
            wp_die();
        }

        $activate_id = $option->activate_id;
        if (empty($activate_id)) {
            throw new Exception('Activate ID not found for option');
        }

        $step = dvdb_get_step($activate_id);
        if (!$step) {
            throw new Exception('Step not found');
        }

        $html = '';
        $type = $step->type;
        $name = $step->step_name;

        if ($type === 'options') {
            $options = json_decode(json_encode(dvdb_get_options_by_step($activate_id)), true);
            $html = get_devis_options_html($options);
        } elseif ($type === 'product') {
            if ($generate_history) {
                $html = get_devis_history_html($activate_id);
            } else {
                $html = get_devis_form_html($activate_id, $step->post_id);
            }
            
        } else {
            throw new Exception('Invalid step type');
        }

        wp_send_json_success(['html' => $html, 'type' => $type, 'name' => $name]);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_get_option_step_content_html', 'handle_dv_get_option_step_content_html');

function handle_dv_get_form_html() {
    try {
        if (!isset($_POST['step_id']) || !isset($_POST['post_id'])) {
            throw new Exception('Missing required parameters');
        }

        $step_id = intval($_POST['step_id']);
        $post_id = intval($_POST['post_id']);

        if (empty($step_id) || empty($post_id)) {
            throw new Exception('Invalid step ID or post ID');
        }

        $html = get_devis_form_html($step_id, $post_id);
        wp_send_json_success(['html' => $html]);
        wp_die();
    } catch (Exception $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dv_get_form_html', 'handle_dv_get_form_html');