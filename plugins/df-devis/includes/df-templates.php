<?php
/**
 * This class holds all the functions to render html elements
 */

require_once 'DfDevisException.php';

/* STEP HTML GENERATION */
function df_get_step_html($step_id, $step_index, $step_name, $step_type = '') {
    ob_start(); ?>
    <div onclick="show_step(event, this)" data-id="<?=$step_id?>" class="devis-step" id="step_<?=$step_index?>">
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
        $step_index = intval($_POST['step_index']);
        $step_name = sanitize_text_field($_POST['step_name']);
        $step_type = sanitize_text_field($_POST['step_type']);
        
        $content = df_get_step_html($step_index, $step_name, $step_type);
        wp_send_json_success(['message' => 'Step HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_step_html', 'handle_df_get_step_html');


/* OPTION HTML GENERATION */
function df_get_option_html($group_name, $option_name, $option_id, $hidden = true) {
    ob_start(); ?>
    <div data-id="<?=$option_id?>" class="option group_<?$group_name?> <?=$hidden?'hidden':''?>" onclick="view_option(event, this)">
        <label>Option Name: 
            <input class="set-name" type="text" value="<?=$option_name?>">
        </label>              
        <button type="button" class="remove-option">Remove Option</button>
        <button type="button" data-group="Root" data-activate="gp_<?=$option_id?>" class="add-step">Add Step</button>
    </div>	<?php
    return ob_get_clean();
}

function handle_df_get_option_html() {
    try {
        df_check_post('group_name', 'option_name', 'option_id', 'hidden');
        $group_name = sanitize_text_field($_POST['group_name']);
        $option_name = sanitize_text_field($_POST['option_name']);
        $option_id = intval($_POST['option_id']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_option_html($group_name, $option_name, $option_id, $hidden);
        wp_send_json_success(['message' => 'Option HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_option_html', 'handle_df_get_option_html');


/* HISTORY HTML GENERATION */
function df_get_history_html($group_name, $hidden = true) {
    ob_start(); ?>
    <div class="historique group_<?=$group_name?> <?=$hidden?'hidden':''?>">
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

function handle_df_get_history_html() {
    try {
        df_check_post('group_name', 'hidden');
        $group_name = sanitize_text_field($_POST['group_name']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_history_html($group_name, $hidden);
        wp_send_json_success(['message' => 'History HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_history_html', 'handle_df_get_history_html');


/* EMAIL HTML GENERATION */
function df_get_email_html($group_name, $hidden = true) {
    ob_start(); ?>
    <div class="formulaire group_<?=$group_name?> <?=$hidden?'hidden':''?>">
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

function handle_df_get_email_html() {
    try {
        df_check_post('group_name', 'hidden');
        $group_name = sanitize_text_field($_POST['group_name']);
        $hidden = $_POST['hidden'] === 'true';
        
        $content = df_get_email_html($group_name, $hidden);
        wp_send_json_success(['message' => 'Email HTML generated successfully', 'content' => $content]);
        wp_die();
    } catch (DfDevisException $e) {
        wp_send_json_error(['message' => $e->getMessage()]);
        wp_die();
    }
}
add_action('wp_ajax_df_get_email_html', 'handle_df_get_email_html');


/**
 * Prints the results in a formatted way
 *
 * @param array $results The results to print
 */
function print_result($results) {
    echo "<pre>";
    foreach ($results as $index => $item) {
        echo "Item #" . ($index + 1) . ":\n";
        if (is_object($item)) {
            foreach (get_object_vars($item) as $key => $value) {
                echo "  $key: " . var_export($value, true) . "\n";
            }
        } elseif (is_array($item)) {
            foreach ($item as $key => $value) {
                echo "  $key: " . var_export($value, true) . "\n";
            }
        } else {
            // Scalar or something else
            echo "  " . var_export($item, true) . "\n";
        }
        echo "\n";
    }
    echo "</pre>";
}
