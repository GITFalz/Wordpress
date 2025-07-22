<?php
/**
 * This class holds all the functions to render html elements
 */

require_once 'DfDevisException.php';

/* STEP HTML GENERATION */
function df_get_step_html($step_id, $step_index, $step_name, $step_type, $is_customizable = true) {
    ob_start(); ?>
    <div data-id="<?=$step_id?>" data-group="Root" data-stepindex=<?=$step_index?> class="devis-step" id="step_<?=$step_index?>" <?php if (!$is_customizable): ?>onclick="view_step(event, this)"<?php endif; ?>>
        <?php if ($is_customizable): ?>
            <div class="devis-step-details">
                <div class="devis-step-header">
                    <p class="devis-step-index">Nom de l'étape:</p>
                    <div class="devis-step-actions">
                        <button type="button" class="devis-step-view">Voir</button>
                        <?php if ($step_index !== 0): ?>
                            <button data-stepindex="<?=$step_index?>" type="button" class="remove-step">X</button>         
                        <?php endif; ?>  
                    </div>
                </div>
                <div class="devis-step-name">
                    <input class="set-step-name" type="text" value="<?=$step_name?>">   
                    <div class="devis-save-info">
                        <div class="devis-spinner devis-owner-email-spinner hidden"></div>
                        <div class="devis-save devis-owner-email-save hidden">&#10003;</div>
                    </div>  
                </div>
            </div>
        <?php endif; ?>
        <?php if (!$is_customizable): ?>
            <p class="step-name"><?=$step_name?></p>
        <?php endif; ?>
        <?php if ($step_index !== 0 && $is_customizable): ?>
            <div class="devis-step-types">
                <p class="devis-step-select-type">Type de l'étape:</p>
                <select class="devis-step-selection" id="step-select">
                    <option value="" <?=selected($step_type, '')?>>Select a type</option>
                    <option value="options" <?=selected($step_type, 'options')?>>Options</option>
                    <option value="historique" <?=selected($step_type, 'historique')?>>Historique</option>
                    <option value="formulaire" <?=selected($step_type, 'formulaire')?>>Formulaire</option>
                </select>
            </div>
        <?php endif; ?>
    </div> <?php
    return ob_get_clean();
}

function handle_df_get_step_html() {
    try {
        df_check_post('step_index', 'step_name', 'step_type');
        $step_id = intval($_POST['step_id']);
        $step_index = intval($_POST['step_index']);
        $step_name = sanitize_text_field($_POST['step_name']);
        $step_type = sanitize_text_field($_POST['step_type']);
        
        $content = df_get_step_html($step_id, $step_index, $step_name, $step_type);
        wp_send_json_success(['message' => 'Step HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_step_html', 'handle_df_get_step_html');

function handle_dfdb_create_step_html() {
    try {
        df_check_post('step_name', 'step_index', 'post_id');
        $step_name = sanitize_text_field($_POST['step_name']);
        $step_index = intval($_POST['step_index']);
        $post_id = intval($_POST['post_id']);
        
        $result = dfdb_create_step($step_name, $step_index, $post_id);
        if ($result === false) {
            throw new DfDevisException("Failed to create step");
        }
        $step_id = dfdb_id();
        
        $content = df_get_step_html($step_id, $step_index, $step_name, 'options');
        wp_send_json_success(['message' => 'Step created successfully', 'content' => $content, 'step_id' => $step_id]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_dfdb_create_step_html', 'handle_dfdb_create_step_html');

/* OPTION HTML GENERATION */
function df_get_option_html_base($type_id, $group_name, $option_name, $option_id, $hidden, $data, $image, $is_customizable = true) {
    ob_start(); ?>
    <div data-id="<?=$option_id?>" class="option group_<?=$group_name?> <?=$hidden?'hidden':''?>" data-typeid="<?=$type_id?>" data-group="<?=$group_name?>"
        <?php if (!$is_customizable): ?>
            <?php if (isset($data['cost']['money'])): ?>
                data-cost="<?= $data['cost']['money'] ?>"
            <?php endif; ?>
            <?php if (isset($data['cost']['history_visible'])): ?>
                data-history="<?= $data['cost']['history_visible'] ?>"
            <?php endif; ?>
            <?php if (isset($data['cost']['option_visible'])): ?>
                data-option="<?= $data['cost']['option_visible'] ?>"
            <?php endif; ?>
            onclick="view_option(event, this)"
        <?php endif; ?>>

        <?php if ($is_customizable): ?>

            <button type="button" class="remove-option">X</button>
            <div class="option-display">
                <div class="option-base">
                    <div class="option-header">
                        <p>Nom de l'option:</p>
                        <div class="option-name">
                            <input class="set-name" type="text" value="<?= esc_attr($option_name) ?>">
                            <div class="devis-save-info">
                                <div class="devis-spinner devis-option-name-spinner hidden"></div>
                                <div class="devis-save devis-option-name-save hidden">&#10003;</div>
                            </div>  
                        </div>
                    </div>
                    <div class="image-actions">
                        <button type="button" class="devis-set-image" onclick="select_image(event)">Choisir une image</button>
                        <button type="button" class="remove-option-image" onclick="remove_image(event)">X</button>
                    </div>
                </div>
                <div class="option-image">
                    <?php if ($image): ?>
                        <div class="option-image-preview-div">
                            <img class="option-image-preview" src="<?=esc_url($image)?>" alt="Option Image">
                        </div>
                    <?php else: ?>
                        <div class="option-image-preview-div hidden">
                            <img class="option-image-preview" src="" alt="Option Image">
                        </div>
                    <?php endif; ?>
                </div>
            </div>
            <div class="option-cost">
                <input type="number" class="set-cost" value="<?=isset($data['cost']['money']) ? esc_attr($data['cost']['money']) : ''?>" placeholder="Prix" oninput="set_cost(event)">
                <div class="devis-save-info">
                    <div class="devis-spinner devis-option-cost-spinner hidden"></div>
                    <div class="devis-save devis-option-cost-save hidden">&#10003;</div>
                </div>  
            </div>
            <div class="option-cost-visible">
                <input type="checkbox" class="set-cost-history-visible set-cost-history-visible-option" <?=isset($data['cost']['history_visible']) && $data['cost']['history_visible'] ? 'checked' : ''?> onchange="toggle_history_visibility(event)">
                <label>Visible dans l'historique</label>
            </div>
            <div class="option-cost-visible">
                <input type="checkbox" class="set-cost-option-visible set-cost-option-visible-option" <?=isset($data['cost']['option_visible']) && $data['cost']['option_visible'] ? 'checked' : ''?> onchange="toggle_option_visibility(event)">
                <label>Visible dans les options</label>
            </div>
            <button type="button" data-group="Root" data-activate="gp_<?=$option_id?>" class="add-step">Add Step</button>
        <?php else: ?>
            <p class="option-name"><?=$option_name?></p>
            <?php if ($image): ?>
                <img class="option-image-preview" src="<?=esc_url($image)?>" alt="Option Image">
            <?php endif; ?>
            <?php if (isset($data['cost']['money']) && (isset($data['cost']['option_visible']) && !empty($data['cost']['option_visible']))): ?>
                <p class="option-cost">Coût: <?=esc_html($data['cost']['money'])?>€</p>
            <?php endif; ?>
        <?php endif; ?>
    </div>	<?php
    return ob_get_clean();
}

function df_get_option_html_array($option, $hidden = true) {
    $type_id = $option['type_id'] ?? throw new DfDevisException("Missing type id in option data");
    $group_name = $option['group_name'] ?? throw new DfDevisException("Missing group name in option data");
    $option_name = $option['option_name'] ?? throw new DfDevisException("Missing option name in option data");
    $option_id = $option['id'] ?? throw new DfDevisException("Missing option ID in option data");
    $data = $option['data'] ?? [];
    $image = $option['image'] ?? '';
    return df_get_option_html_base($type_id, $group_name, $option_name, $option_id, $hidden, $data, $image);
}

function handle_df_get_option_html() {
    try {
        df_check_post('type_id', 'group_name', 'option_name', 'option_id', 'hidden');
        $type_id = intval($_POST['type_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $option_name = sanitize_text_field($_POST['option_name']);
        $option_id = intval($_POST['option_id']);
        $hidden = $_POST['hidden'] === 'true';

        $content = df_get_option_html_base($type_id, $group_name, $option_name, $option_id, $hidden, [], null);
        wp_send_json_success(['message' => 'Option HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_option_html', 'handle_df_get_option_html');

// some database calls to not have to use ajax all the time
function handle_df_get_options_html_by_step_and_group() {
    try {
        df_check_post('type_id', 'step_id', 'group_name');
        $type_id = intval($_POST['type_id']);
        $step_id = intval($_POST['step_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        
        $options = dfdb_get_options_by_step_and_group($step_id, $group_name);
        
        $content = '';
        foreach ($options as $option) {
            $content .= df_get_option_html_base($type_id, $group_name, $option->name, $option->id, false, json_decode($option->data, true), $option->image ?? null);
        }
        
        wp_send_json_success(['message' => 'Options HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_options_html_by_step_and_group', 'handle_df_get_options_html_by_step_and_group');

function handle_df_create_step_option_get_html() {
    try {
        df_check_post('type_id', 'step_id', 'group_name', 'option_name');
        $type_id = intval($_POST['type_id']);
        $step_id = intval($_POST['step_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $option_name = sanitize_text_field($_POST['option_name']);
        
        $result = dfdb_create_option($type_id, $option_name);
        if ($result === false) {
            throw new DfDevisException("Failed to create step option");
        }
        $option_id = dfdb_id();
        $content = df_get_option_html_base($type_id, $group_name, $option_name, $option_id, false, [], null); // for now, no elements are passed
        wp_send_json_success(['message' => 'Step option created successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_create_step_option_get_html', 'handle_df_create_step_option_get_html');

/* HISTORY HTML GENERATION */
function df_get_history_html_base($history_id, $type_id, $group_name, $hidden, $is_customizable = true) {
    ob_start(); ?>
    <div data-id="<?=$history_id?>" class="historique group_<?=$group_name?> <?=$hidden?'hidden':''?>" data-typeid="<?=$type_id?>" data-group="<?=$group_name?>">
        <h2 class="history-title">Selection History</h2>			
        <div class="history-entries">
            <?php if ($is_customizable): ?>
                <div class="history-entry">
                    <div class="history-date">2024-01-15 14:30</div>
                    <div class="history-action">Selected: Sol Option</div>
                    <div class="history-details">User chose "Carrelage Premium" from the flooring options. This selection affects the overall pricing and installation timeline.</div>
                </div>
                
                <div class="history-entry">
                    <div class="history-date">2024-01-15 14:32</div>
                    <div class="history-action">Selected: Toit Option</div>
                    <div class="history-details">User selected "Tuiles Rouges Traditionnelles" for the roofing material. Compatible with the chosen flooring option.</div>
                </div>
                
                <div class="history-entry">
                    <div class="history-date">2024-01-15 14:35</div>
                    <div class="history-action">Modified: Custom Option</div>
                    <div class="history-details">User customized the "Fenêtres" option with double-glazing and wooden frames. Added +15% to base price.</div>
                </div>
                
                <div class="history-entry">
                    <div class="history-date">2024-01-15 14:38</div>
                    <div class="history-action">Removed: Previous Selection</div>
                    <div class="history-details">User removed the "Isolation Standard" option and upgraded to "Isolation Premium" for better energy efficiency.</div>
                </div>
            <?php else: ?>
                <p class="history-empty">No history entries available.</p>
            <?php endif; ?>
        </div>
        <?php if ($is_customizable): ?>
            <button type="button" class="add-history-step" data-activate="gp_<?=$history_id?>">Add History Step</button>
        <?php else: ?>
            <button type="button" class="add-history-step" data-activate="gp_<?=$history_id?>" onclick="view_history(event, this)">Next</button>
        <?php endif; ?>
    </div><?php
    return ob_get_clean();
}

function df_get_history_html_array($history, $hidden = true) {
    $history_id = $history['id'] ?? throw new DfDevisException("Missing history ID in history data");
    $type_id = $history['type_id'] ?? throw new DfDevisException("Missing type id in history data");
    $group_name = $history['group_name'] ?? throw new DfDevisException("Missing group name in history data");
    return df_get_history_html_base($history_id, $type_id, $group_name, $hidden);
}

function handle_df_get_history_html() {
    try {
        df_check_post('$history_id', 'type_id', 'group_name', 'hidden');
        $history_id = intval($_POST['history_id']);
        $type_id = intval($_POST['type_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_history_html_base($$history_id, $type_id, $group_name, $hidden);
        wp_send_json_success(['message' => 'History HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_history_html', 'handle_df_get_history_html');

// some database calls to not have to use ajax all the time
function handle_df_get_history_html_by_step_and_group() {
    try {
        df_check_post('type_id', 'step_id', 'group_name');
        $type_id = intval($_POST['type_id']);
        $step_id = intval($_POST['step_id']);
        $group_name = sanitize_text_field($_POST['group_name']);        

        $history = dfdb_get_history_by_step_and_group($step_id, $group_name);
        
        $content = '';
        if (!empty($history)) { // There are not multiple histories with the same step and group, so we don't need to loop
            $content = df_get_history_html_base($history[0]->id, $type_id, $group_name, false);
        }

        wp_send_json_success(['message' => 'History HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_history_html_by_step_and_group', 'handle_df_get_history_html_by_step_and_group');

/* EMAIL HTML GENERATION */
function df_get_email_html_base($post_id, $email_id, $type_id, $group_name, $hidden, $is_customizable = true) {
    
    $post = get_post($post_id);
    $custom_fields = get_post_meta($post->ID, '_devis_custom_fields', true);
    $price = get_post_meta($post->ID, 'formulaire_price', true);
    
    ob_start(); ?>
    <?php if ($is_customizable): ?>
        <div class="formulaire group_<?=$group_name?> <?=$hidden?'hidden':''?>" data-typeid="<?=$type_id?>" data-group="<?=$group_name?>" onclick="view_email(event, this)">
            <h2 class="formulaire-title">Contact & Quote Request</h2>		
            <div class="email-form">
                <label class="email-label" for="client-name">Full Name</label>
                <input class="email-input" type="text" id="client-name" name="client_name" placeholder="Enter your full name">
                
                <label class="email-label" for="client-email">Email Address</label>
                <input class="email-input" type="email" id="client-email" name="client_email" placeholder="your.email@example.com">
                
                <label class="email-label" for="client-phone">Phone Number</label>
                <input class="email-input" type="tel" id="client-phone" name="client_phone" placeholder="+33 1 23 45 67 89">
                
                <label class="email-label" for="project-address">Project Address</label>
                <input class="email-input" type="text" id="project-address" name="project_address" placeholder="Street address, City, Postal Code">
                
                <label class="email-label" for="additional-notes">Additional Notes</label>
                <textarea class="email-textarea" id="additional-notes" name="additional_notes" placeholder="Please describe any specific requirements, timeline preferences, or questions you may have..."></textarea>
                
                <button type="button" class="email-submit">Send Quote Request</button>
            </div>
        </div>
    <?php else: ?>
        <div class="formulaire group_<?=$group_name?> <?=$hidden?'hidden':''?>" data-typeid="<?=$type_id?>" data-group="<?=$group_name?>">
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="client-name">Nom Complet</label>
                <input class="formulaire-input" type="text" id="client-name" name="client_name" value="" required>
            </div>
            <div class="formulaire-field" data-type="default_email">
                <label class="formulaire-label" for="client-email">Adresse Email</label>
                <input class="formulaire-input" type="email" id="client-email" name="client_email" value="" required>
            </div>
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="client-phone">Numéro de Téléphone</label>
                <input class="formulaire-input" type="tel" id="client-phone" name="client_phone" value="" required>
            </div>
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="project-address">Adresse du Projet</label>
                <input class="formulaire-input" type="text" id="project-address" name="project_address" value="" required>
            </div>
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="additional-code-postal">Code Postal</label>
                <input class="formulaire-input" type="text" id="additional-code-postal" name="additional_code_postal" value="" required>
            </div>
            <div class="formulaire-field" data-type="default_type">
                <label class="formulaire-label" for="formulaire-ville">Ville</label>
                <input class="formulaire-input" type="text" id="formulaire-ville" name="formulaire-ville" value="" required>
            </div>
            <?php foreach ($custom_fields as $field): ?>
                <div class="formulaire-field" data-type="<?=$field['type']?>">
                    <label class="formulaire-label" for="custom-field-<?=$field['time']?>"><?=esc_html($field['name'])?></label>
                    <?php if ($field['type'] === 'default_input'): ?>
                        <input class="formulaire-input" type="text" id="custom-field-<?=$field['time']?>" name="custom_field_<?=$field['time']?>" value="">
                    <?php elseif ($field['type'] === 'default_textarea'): ?>
                        <textarea class="formulaire-textarea" id="custom-field-<?=$field['time']?>" name="custom_field_<?=$field['time']?>"></textarea>
                    <?php elseif ($field['type'] === 'default_file'): // File selector ?>
                        <input class="formulaire-file" type="file" id="custom-field-<?=$field['time']?>" name="custom_field_<?=$field['time']?>">
                    <?php elseif ($field['type'] === 'region_checkbox'): // There are multiple checkboxes, they are in a textarea sperated by a line break ?>
                        <div class="formulaire-region-checkbox">
                            <?php foreach (explode("\n", $field['region']) as $option): ?>
                                <label class="formulaire-label" for="custom-field-<?=$field['time']?>-<?=$option?>"><?=esc_html($option)?></label>
                                <input class="formulaire-checkbox" type="checkbox" id="custom-field-<?=$field['time']?>-<?=$option?>" name="custom_field_<?=$field['time']?>[]" value="1">
                            <?php endforeach; ?>
                        </div>
                    <?php elseif ($field['type'] === 'region_select'): // There is a select with multiple options, they are in a textarea sperated by a line break ?>
                        <select class="formulaire-select" id="custom-field-<?=$field['time']?>" name="custom_field_<?=$field['time']?>">
                            <?php foreach (explode("\n", $field['region']) as $option): ?>
                                <option value="<?=esc_attr($option)?>"><?=esc_html($option)?></option>
                            <?php endforeach; ?>
                        </select>
                    <?php elseif ($field['type'] === 'region_radio'): // There are multiple radio buttons, they are in a textarea sperated by a line break ?>
                        <div class="formulaire-region-radio">
                            <?php foreach (explode("\n", $field['region']) as $option): ?>
                                <label class="formulaire-label" for="custom-field-<?=$field['time']?>-<?=$option?>"><?=esc_html($option)?></label>
                                <input class="formulaire-radio" type="radio" id="custom-field-<?=$field['time']?>-<?=$option?>" name="custom_field_<?=$field['time']?>" value="<?=esc_attr($option)?>">
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
            <div class="formulaire-send">
                <button type="button" class="formulaire-send-button" onclick="formulaire_send_email(this)">Envoyer</button>
                <p class="devis-sent-info"><p>
            </div>
        </div> 
    <?php endif; ?><?php
    return ob_get_clean();
}    

function df_get_email_html_array($post_id, $email, $hidden = true) {
    $email_id = $email['id'] ?? throw new DfDevisException("Missing email ID in email data");
    $type_id = $email['type_id'] ?? throw new DfDevisException("Missing type id in email data");
    $group_name = $email['group_name'] ?? throw new DfDevisException("Missing group name in email data");
    return df_get_email_html_base($post_id, $email_id, $type_id, $group_name, $hidden);
}

function handle_df_get_email_html() {
    try {
        df_check_post('post_id', 'email_id', 'type_id', 'group_name', 'hidden');
        $post_id = intval($_POST['post_id']);
        $email_id = intval($_POST['email_id']);
        $type_id = intval($_POST['type_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_email_html_base($post_id, $email_id, $type_id, $group_name, $hidden);
        wp_send_json_success(['message' => 'Email HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_email_html', 'handle_df_get_email_html');

// some database calls to not have to use ajax all the time
function handle_df_get_email_html_by_step_and_group() {
    try {
        df_check_post('type_id', 'step_id', 'group_name');
        $type_id = intval($_POST['type_id']);
        $step_id = intval($_POST['step_id']);
        $group_name = sanitize_text_field($_POST['group_name']);

        $email = dfdb_get_email_by_step_and_group($step_id, $group_name);

        $content = '';
        if (!empty($email)) { // There are not multiple emails with the same step and group, so we don't need to loop
            $content = df_get_email_html_base($email[0]->id, $type_id, $group_name, false);
        }   

        wp_send_json_success(['message' => 'Email HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_email_html_by_step_and_group', 'handle_df_get_email_html_by_step_and_group');



function df_get_default_type_html($post_id, $type_id, $step_index, $group_name, $option_id, $history_id, $email_id) {
    ob_start(); ?>
    <div class="step-type step-type-<?=$type_id?> group_<?=$group_name?>" data-typeid="<?=$type_id?>" data-typename="options"> 
        <div class="option-container option-step-<?=$step_index?>">
            <div class="options-container options-step-<?=$step_index?>">
                <?php if ($option_id): ?>
                    <?=df_get_option_html_base($type_id, $group_name, 'Option', $option_id, false, [], null)?>
                <?php endif; ?>
                <div class="option-add">
                    <span class="option-add-text">+</span>
                </div>
            </div>
        </div>
        <div class="historique-container historique-step-<?=$step_index?> hidden">
            <?php if ($history_id): ?>
                <?=df_get_history_html_base($history_id, $type_id, $group_name, false)?>
            <?php endif; ?>
        </div>
        <div class="formulaire-container formulaire-step-<?=$step_index?> hidden">
            <?php if ($email_id): ?>
                <?=df_get_email_html_base($post_id, $email_id, $type_id, $group_name, false)?>
            <?php endif; ?>
        </div>
    </div> <?php
    return ob_get_clean();
}

function handle_df_get_default_type_html() {
    try {
        df_check_post('post_id', 'type_id', 'step_index', 'group_name', 'option_id', 'history_id', 'email_id');
        $post_id = intval($_POST['post_id']);
        $type_id = intval($_POST['type_id']);
        $step_index = intval($_POST['step_index']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $option_id = intval($_POST['option_id']);
        $history_id = intval($_POST['history_id']);
        $email_id = intval($_POST['email_id']);

        $content = df_get_default_type_html($post_id, $type_id, $step_index, $group_name, $option_id, $history_id, $email_id);
        wp_send_json_success(['message' => 'Default type HTML generated successfully', 'content' => $content]);
        wp_die();  
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}   
add_action('wp_ajax_df_get_default_type_html', 'handle_df_get_default_type_html');



/**
 * The functions that give the html that is in the official page (so no customization)
 */
function handle_df_get_step_html_by_index() {
    try {
        df_check_post('step_index', 'post_id', 'group_name', 'step_div', 'step_info', 'type_div', 'type_content');
        $step_index = intval($_POST['step_index']);
        $post_id = intval($_POST['post_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $step_div = sanitize_text_field($_POST['step_div']) === 'true';
        $step_info = sanitize_text_field($_POST['step_info']) === 'true';
        $type_div = sanitize_text_field($_POST['type_div']) === 'true';
        $type_content = sanitize_text_field($_POST['type_content']) === 'true';
        
        $step = dfdb_get_step_by_index($post_id, $step_index);
        if (!$step) {
            throw new DfDevisException("No step found for the given post ID " . $post_id . " and step index " . $step_index);
        }

        $type = dfdb_get_type_by_step_and_group($step->id, $group_name);
        if (!$type) {
            throw new DfDevisException("No type found for the given step ID " . $step->id . " and group name " . $group_name);
        }
        $type_name = $type->type_name;

        $data = [
            'message' => 'Step HTML retrieved successfully',
            'type_name' => $type_name,
            'step_id' => $step->id,
        ];

        if (!$step_div) {
            $data['step_html'] = df_get_step_html($step->id, $step_index, $step->step_name, $type_name, false);
        }

        if (!$step_info) {
            $data['step_info'] = '<div class="step-info step-info-'.$step_index.'" data-stepindex="'.$step_index.'"></div>';
        }

        if (!$type_div) {
            $data['type_html'] = '<div class="step-type step-type-'.$type->id.' group_'.$group_name.'" data-typeid="'.$type->id.'" data-typename="'.$type_name.'"></div>';
        }

        if (!$type_content) {
            $data['type_content'] = '';
            if ($type_name === 'options') {
                $data['type_content'] .= '<div class="options-container options-step-'.$step_index.'">';
                $option = dfdb_get_type_options($type->id);
                foreach ($option as $opt) {
                    $data['type_content'] .= df_get_option_html_base($type->id, $group_name, $opt->option_name, $opt->id, false, json_decode($opt->data, true), $opt->image ?? null, false);
                }
                $data['type_content'] .= '</div>';
            } else if ($type_name === 'historique') {
                $data['type_content'] .= '<div class="historique-container historique-step-'.$step_index.'">';
                $history = dfdb_get_history_by_step_and_group($step->id, $group_name);
                if (!empty($history)) {
                    $data['type_content'] .= df_get_history_html_base($history[0]->id, $type->id, $group_name, false, false);
                }
                $data['type_content'] .= '</div>';
            } else if ($type_name === 'formulaire') {
                $data['type_content'] .= '<div class="formulaire-container formulaire-step-'.$step_index.'">';
                $email = dfdb_get_email_by_step_and_group($step->id, $group_name);
                if (!empty($email)) {
                    $data['type_content'] .= df_get_email_html_base($post_id, $email[0]->id, $type->id, $group_name, false, false);
                }
                $data['type_content'] .= '</div>';
            } else {
                throw new DfDevisException("Invalid type name: $type_name");
            }
        }
        
        wp_send_json_success($data);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_step_html_by_index', 'handle_df_get_step_html_by_index');


/**
 * Prints the results in a formatted way
 *
 * @param array $results The results to print
 */
function print_result($results) {
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