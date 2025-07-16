<?php

require_once 'DfNutricodeException.php';

function dfnc_check_post(...$args) {
	foreach ($args as $arg) {
        if (!isset($_POST[$arg])) {
            throw new DfNutricodeException("Missing POST parameter: $arg");
        }
    }
}