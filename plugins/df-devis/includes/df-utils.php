<?php
/**
 * This class holds all the useful functions
 */

require_once 'DfDevisException.php';

function df_check_post(...$args) {
	foreach ($args as $arg) {
        if (!isset($_POST[$arg])) {
            throw new DfDevisException("Missing POST parameter: $arg");
        }
    }
}

// Check if the type is valid
function df_check_type($type) {
    $validTypes = ['historique', 'formulaire', 'options'];
    if (!in_array($type, $validTypes)) {
        throw new DfDevisException("Invalid step type: $type");
    }
}