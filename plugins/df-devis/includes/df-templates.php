<?php
/**
 * This class holds all the functions to render html elements
 */

require_once 'DfDevisException.php';

/* STEP HTML GENERATION */
function df_get_step_html($step_id, $step_index, $step_name, $step_type = '') {
    ob_start(); ?>
    <div onclick="display_step_content(<?=$step_index?>)" data-id="<?=$step_id?>" data-group="Root" class="devis-step" id="step_<?=$step_index?>">
        <label>Step Name:
            <input class="set-step-name" type="text" value="<?=$step_name?>">
        </label>
        <?php if ($step_index !== 0): ?>
        <label>Type:
            <select class="devis-step-selection" id="step-select">
                <option value="" <?=selected($step_type, '')?>>Select a type</option>
                <option value="options" <?=selected($step_type, 'options')?>>Options</option>
                <option value="historique" <?=selected($step_type, 'historique')?>>Historique</option>
                <option value="formulaire" <?=selected($step_type, 'formulaire')?>>Formulaire</option>
            </select>
        </label>
        <button data-stepindex="<?=$step_index?>" type="button" class="remove-step"></button>
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

/* OPTION HTML GENERATION */
function df_get_option_html_base($type_id, $group_name, $option_name, $option_id, $hidden = true) {
    ob_start(); ?>
    <div data-id="<?=$option_id?>" class="option group_<?=$group_name?> <?=$hidden?'hidden':''?>" onclick="view_option(event, this)" data-typeid="<?=$type_id?>" data-group="<?=$group_name?>">
        <label>Option Name: 
            <input class="set-name" type="text" value="<?=$option_name?>">
        </label>              
        <button type="button" class="remove-option">Remove Option</button>
        <button type="button" data-group="Root" data-activate="gp_<?=$option_id?>" class="add-step">Add Step</button>
    </div>	<?php
    return ob_get_clean();
}

function df_get_option_html_array($option, $hidden = true) {
    $type_id = $option['type_id'] ?? throw new DfDevisException("Missing type id in option data");
    $group_name = $option['group_name'] ?? throw new DfDevisException("Missing group name in option data");
    $option_name = $option['option_name'] ?? throw new DfDevisException("Missing option name in option data");
    $option_id = $option['id'] ?? throw new DfDevisException("Missing option ID in option data");
    return df_get_option_html_base($type_id, $group_name, $option_name, $option_id, $hidden);
}

function handle_df_get_option_html() {
    try {
        df_check_post('type_id', 'group_name', 'option_name', 'option_id', 'hidden');
        $type_id = intval($_POST['type_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $option_name = sanitize_text_field($_POST['option_name']);
        $option_id = intval($_POST['option_id']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_option_html_base($type_id, $group_name, $option_name, $option_id, $hidden);
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
            $content .= df_get_option_html_base($type_id, $group_name, $option->name, $option->id, false);
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
        $content = df_get_option_html_base($type_id, $group_name, $option_name, $option_id, false);
        wp_send_json_success(['message' => 'Step option created successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_create_step_option_get_html', 'handle_df_create_step_option_get_html');

/* HISTORY HTML GENERATION */
function df_get_history_html_base($type_id, $group_name, $hidden = true) {
    ob_start(); ?>
    <div class="historique group_<?=$group_name?> <?=$hidden?'hidden':''?>" data-typeid="<?=$type_id?>" data-group="<?=$group_name?>" onclick="view_history(event, this)">
        <h2 class="history-title">Selection History</h2>			
        <div class="history-entries">
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
        </div>
        <button type="button" data-activate="Next" class="add-history-step">Add Step</button>
    </div><?php
    return ob_get_clean();
}

function df_get_history_html($history, $hidden = true) {
    $type_id = $history['type_id'] ?? throw new DfDevisException("Missing type id in history data");
    $group_name = $history['group_name'] ?? throw new DfDevisException("Missing group name in history data");
    return df_get_history_html_base($type_id, $group_name, $hidden);
}

function handle_df_get_history_html() {
    try {
        df_check_post('type_id', 'group_name', 'hidden');
        $type_id = intval($_POST['type_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_history_html_base($type_id, $group_name, $hidden);
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
            $content = df_get_history_html_base($type_id, $group_name, false);
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
function df_get_email_html_base($type_id, $group_name, $hidden = true) {
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

function df_get_email_html($email, $hidden = true) {
    $type_id = $email['type_id'] ?? throw new DfDevisException("Missing type id in email data");
    $group_name = $email['group_name'] ?? throw new DfDevisException("Missing group name in email data");
    return df_get_email_html_base($type_id, $group_name, $hidden);
}

function handle_df_get_email_html() {
    try {
        df_check_post('type_id', 'group_name', 'hidden');
        $type_id = intval($_POST['type_id']);
        $group_name = sanitize_text_field($_POST['group_name']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_email_html_base($type_id, $group_name, $hidden);
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
            $content = df_get_email_html_base($type_id, $group_name, false);
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
    <div class="step-type step-type-<?=$type_id?>" data-typeid="<?=$type_id?>">
        <div class="options-container options-step-<?=$step_index?>">
            <?php if ($option_id): ?>
                <?=df_get_option_html_base($type_id, $group_name, 'Option', $option_id, false)?>
            <?php endif; ?>
            <button type="button" class="add-option">Add Option</button>
        </div>
        <div class="historique-container historique-step-<?=$step_index?> hidden">
            <?php if ($history_id): ?>
                <?=df_get_history_html_base($type_id, $group_name, false)?>
            <?php endif; ?>
        </div>
        <div class="formulaire-container formulaire-step-<?=$step_index?> hidden">
            <?php if ($email_id): ?>
                <?=df_get_email_html_base($type_id, $group_name, false)?>
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