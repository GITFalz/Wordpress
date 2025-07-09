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