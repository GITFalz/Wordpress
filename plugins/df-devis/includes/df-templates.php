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
            <label>Step Name:      
                <button type="button" class="devis-step-view">View</button>
                <input class="set-step-name" type="text" value="<?=$step_name?>">                
            </label>
        <?php endif; ?>
        <?php if (!$is_customizable): ?>
            <p class="step-name"><?=$step_name?></p>
        <?php endif; ?>
        <?php if ($step_index !== 0 && $is_customizable): ?>
            <label>Type:
                <select class="devis-step-selection" id="step-select">
                    <option value="" <?=selected($step_type, '')?>>Select a type</option>
                    <option value="options" <?=selected($step_type, 'options')?>>Options</option>
                    <option value="historique" <?=selected($step_type, 'historique')?>>Historique</option>
                    <option value="formulaire" <?=selected($step_type, 'formulaire')?>>Formulaire</option>
                </select>
            </label>
            <button data-stepindex="<?=$step_index?>" type="button" class="remove-step">Delete</button>
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
function df_get_option_html_base($type_id, $group_name, $option_name, $option_id, $hidden, $elements, $is_customizable = true) {
    ob_start(); ?>
    <div data-id="<?=$option_id?>" class="option group_<?=$group_name?> <?=$hidden?'hidden':''?>" data-typeid="<?=$type_id?>" data-group="<?=$group_name?>" <?php if (!$is_customizable): ?>onclick="view_option(event, this)"<?php endif; ?>>
        <?php if ($is_customizable): ?>
            <label>Option Name: 
                <input class="set-name" type="text" value="<?=$option_name?>">
            </label>    
            <?php foreach ($elements as $index => $element): ?>
                <?=df_get_option_element_html($element['type'], $element['value'], $index, $is_customizable)?>
            <?php endforeach; ?>
            <button type="button" class="devis-add-option-element">Add Element</button>
        <?php else: ?>
            <?php foreach ($elements as $index => $element): ?>
                <?=df_get_option_element_html($element['type'], $element['value'], $index, $is_customizable)?>
            <?php endforeach; ?>
        <?php endif; ?>
        
        <?php if ($is_customizable): ?>      
            <div class="devis-option-elements">
                <button type="button" data-activate="gp_<?=$option_id?>" class="remove-option">Remove Option</button>
                <button type="button" data-group="Root" data-activate="gp_<?=$option_id?>" class="add-step">Add Step</button>
            </div>
        <?php endif; ?>
    </div>	<?php
    return ob_get_clean();
}

function df_get_option_element_html($type, $value, $index, $is_customizable) {
    ob_start(); ?>
    <div class="option-element" data-index="<?=$index?>">
        <?php if ($is_customizable): ?>
            <div class="option-element-type">
                <p class="option-element-type-text">
                    <?=($type === 'text' ? 'Text' : 'Image')?>
                </p>
                <select class="option-element-type-select" onchange="change_option_element_type(this)">
                    <option value="text" <?=selected($type, 'text')?>>Text</option>
                    <option value="image" <?=selected($type, 'image')?>>Image</option>
                </select>
            </div>
        <?php endif; ?>
        <?php if ($is_customizable): ?>
            <input class="option-element-input <?=($type === 'text' ? '' : 'hidden')?>" type="text" placeholder="Enter value..." value="<?=$type=== 'text' ? esc_attr($value) : 'Option1'?>" oninput="on_text_input(event)">
            <div class="option-element-image <?=($type === 'image' ? '' : 'hidden')?>">    
                <button type="button" class="option-element-select-image" onclick="select_image(event, this)">Select Image</button>
                <img class="option-element-image-preview" src="<?=$type === 'image' ? esc_url($value) : 'https://ui-avatars.com/api/?name=i+g&size=250'?>" alt="Option Element Image">
            </div>
            <button type="button" class="remove-option-element" data-index="<?=$index?>" onclick="remove_option_element(event)">Remove Element</button>
        <?php else: ?>
            <?php if ($type === 'text'): ?>
                <p class="option-element-type-text"><?=$value?></p>
            <?php elseif ($type === 'image'): ?>
                <img class="option-element-image-preview" src="<?=esc_url($value)?>" alt="Option Element Image">
            <?php endif; ?>
        <?php endif; ?>
    </div> <?php
    return ob_get_clean();
}

function df_get_option_html_array($option, $hidden = true) {
    $type_id = $option['type_id'] ?? throw new DfDevisException("Missing type id in option data");
    $group_name = $option['group_name'] ?? throw new DfDevisException("Missing group name in option data");
    $option_name = $option['option_name'] ?? throw new DfDevisException("Missing option name in option data");
    $option_id = $option['id'] ?? throw new DfDevisException("Missing option ID in option data");
    $data = $option['data'] ?? [];
    return df_get_option_html_base($type_id, $group_name, $option_name, $option_id, $hidden, $data);
}

function handle_df_get_option_html() {
    try {
        df_check_post('type_id', 'group_name', 'option_name', 'option_id', 'hidden');
        $type_id = intval($_POST['type_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $option_name = sanitize_text_field($_POST['option_name']);
        $option_id = intval($_POST['option_id']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_option_html_base($type_id, $group_name, $option_name, $option_id, $hidden, []); // for now, no elements are passed
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
            $content .= df_get_option_html_base($type_id, $group_name, $option->name, $option->id, false, json_decode($option->data, true));
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
        $content = df_get_option_html_base($type_id, $group_name, $option_name, $option_id, false, []); // for now, no elements are passed
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
function df_get_email_html_base($email_id, $type_id, $group_name, $hidden = true) {
    ob_start(); ?>
    <div class="formulaire group_<?=$group_name?> <?=$hidden?'hidden':''?>" data-typeid="<?=$type_id?>" data-group="<?=$group_name?>" onclick="view_email(event, this)">
        <h2 class="form-title">Contact & Quote Request</h2>		
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
    </div><?php
    return ob_get_clean();
}    

function df_get_email_html_array($email, $hidden = true) {
    $email_id = $email['id'] ?? throw new DfDevisException("Missing email ID in email data");
    $type_id = $email['type_id'] ?? throw new DfDevisException("Missing type id in email data");
    $group_name = $email['group_name'] ?? throw new DfDevisException("Missing group name in email data");
    return df_get_email_html_base($email_id, $type_id, $group_name, $hidden);
}

function handle_df_get_email_html() {
    try {
        df_check_post('email_id', 'type_id', 'group_name', 'hidden');
        $email_id = intval($_POST['email_id']);
        $type_id = intval($_POST['type_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_email_html_base($email_id, $type_id, $group_name, $hidden);
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



function df_get_default_type_html($type_id, $step_index, $group_name, $option_id, $history_id, $email_id) {
    ob_start(); ?>
    <div class="step-type step-type-<?=$type_id?> group_<?=$group_name?>" data-typeid="<?=$type_id?>" data-typename="options"> 
        <div class="options-container options-step-<?=$step_index?>">
            <?php if ($option_id): ?>
                <?=df_get_option_html_base($type_id, $group_name, 'Option', $option_id, false, [])?>
            <?php endif; ?>
            <button type="button" class="add-option">Add Option</button>
        </div>
        <div class="historique-container historique-step-<?=$step_index?> hidden">
            <?php if ($history_id): ?>
                <?=df_get_history_html_base($history_id, $type_id, $group_name, false)?>
            <?php endif; ?>
        </div>
        <div class="formulaire-container formulaire-step-<?=$step_index?> hidden">
            <?php if ($email_id): ?>
                <?=df_get_email_html_base($email_id, $type_id, $group_name, false)?>
            <?php endif; ?>
        </div>
    </div> <?php
    return ob_get_clean();
}

function handle_df_get_default_type_html() {
    try {
        df_check_post('type_id', 'step_index', 'group_name', 'option_id', 'history_id', 'email_id');
        $type_id = intval($_POST['type_id']);
        $step_index = intval($_POST['step_index']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $option_id = intval($_POST['option_id']);
        $history_id = intval($_POST['history_id']);
        $email_id = intval($_POST['email_id']);

        $content = df_get_default_type_html($type_id, $step_index, $group_name, $option_id, $history_id, $email_id);
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
                    $data['type_content'] .= df_get_option_html_base($type->id, $group_name, $opt->option_name, $opt->id, false, json_decode($opt->data, true), false);
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
                    $data['type_content'] .= df_get_email_html_base($email[0]->id, $type->id, $group_name, false, false);
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