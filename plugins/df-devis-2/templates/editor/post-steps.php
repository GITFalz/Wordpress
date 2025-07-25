<?php

/**
 * Template for the steps and options meta box in the Devis editor.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function dv_get_steps_html() {
    ob_start(); ?>
    
    
    <div class="dv-steps-container">
        <div class="steps-container">
        </div>
    </div>
    
    
    <?php return ob_get_clean();
}