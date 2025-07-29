<?php
function get_devis_page_html($stepData, $firstOptions) {
    ob_start();
    ?>
    <link rel="stylesheet" href="<?php echo esc_url(DF_DEVIS_URL . 'assets/css/custom/devis.css'); ?>">
    <div class="df-devis-container">
        <div class="df-devis-steps">
            <?php foreach ($stepData as $step): ?>
                <div class="df-devis-step <?= intval($step['step_index']) == 1 ? "step-current" : "step-next" ?>" data-index="<?php echo esc_attr($step['step_index']); ?>" onclick="selectStep(this)">
                    <h2><?php echo esc_html($step['step_name']); ?></h2>
                </div>
            <?php endforeach; ?>
        </div>
        <dic class="df-devis-step-content">
            <div class="df-devis-options">
                <?php if (!empty($firstOptions)): ?>
                    <?= get_devis_options_html($firstOptions); ?>
                <?php endif; ?>
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
    $custom_email_title = get_post_meta($post_id, '_custom_email_title', true);
    $custom_email_banner_text = get_post_meta($post_id, '_custom_email_banner_text', true);
    $custom_email_info_color = get_post_meta($post_id, '_custom_email_info_color', true);
    $custom_email_footer_color = get_post_meta($post_id, '_custom_email_footer_color', true);
    $custom_email_price_color = get_post_meta($post_id, '_custom_email_price_color', true);
    $custom_email_footer = get_post_meta($post_id, '_custom_email_footer', true);

    ob_start(); ?>
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:sans-serif;background-color:#f4f4f4;">
        <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:20px;">
        <tr>
            <td align="center" style="font-size:30px;font-weight:bold;padding-bottom:20px;">
            <?php echo esc_html($custom_email_title); ?>
            </td>
        </tr>
        <tr>
            <td style="background-color:<?php echo esc_attr($custom_email_footer_color); ?>;padding:10px;">
            <p style="font-size:25px;color:#fff;background-color:<?php echo esc_attr($custom_email_info_color); ?>;padding:10px 0;margin:0;text-align:center;">
            <?php echo esc_html($custom_email_banner_text); ?>
            </p>
            <?php foreach ($data as $field): ?>
                <?php if (!empty($field['label']) && isset($field['value'])): ?>
                    <p style="margin:10px 0;color:#555;">
                        <strong><?php echo esc_html($field['label']); ?> : </strong> <?php echo nl2br(esc_html($field['value'])); ?>
                    </p>
                <?php endif; ?>
            <?php endforeach; ?>
            </td>
        </tr>
        <tr>
            <td style="padding:20px 0;">
            <p style="font-size:21px;font-weight:bold;text-align:center;margin-bottom:10px;">Choix du produit</p>
            <div style="text-align:center;">
                <?php if ($product_data && isset($product_data['image'])): ?>
                    <img src="<?php echo esc_url($product_data['image']); ?>" width="200" height="300" alt="Produit" style="display:block;margin:auto;">
                <?php endif; ?>
            </div>
            <?php if ($product_data && isset($product_data['name'])): ?>	
                <p style="font-weight:bold;text-align:center;margin:10px 0 0;"><?php echo esc_html($product_data['name']); ?></p>
            <?php endif; ?>
            <?php if ($product_data && isset($product_data['description'])): ?>
                <p style="text-align:center;margin:0;color:#555;"><?php echo nl2br(esc_html($product_data['description'])); ?></p>
            <?php endif; ?>
            <?php if ($product_data && isset($product_data['extras'])): ?>
                <?php foreach ($product_data['extras'] as $extra): ?>
                    <p style="margin:10px 0;color:#555;">
                        <strong><?php echo esc_html($extra['name']); ?> : </strong> <?php echo nl2br(esc_html($extra['value'])); ?>
                    </p>
                <?php endforeach; ?>
            <?php endif; ?>
            </td>
        </tr>
        <tr>
            <td style="padding:10px 0;">
            <p style="color:#555;">Ce produit est incroyable!</p>
            </td>
        </tr>
        <tr>
            <td style="background-color:<?php echo esc_attr($custom_email_price_color); ?>;color:#fff;font-size:24px;text-align:center;padding:15px;">
            TTC: <?php echo esc_html($final_cost); ?> euro
            </td>
        </tr>
        <tr>
            <td style="padding-top:20px;text-align:center;color:#999;">
            <p><?php echo esc_html($custom_email_footer); ?></p>
            </td>
        </tr>
        </table>
    </body>
    </html> <?php
    return ob_get_clean();
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

        wp_send_json_success(['html' => $html, 'type' => $type]);
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