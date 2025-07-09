<?php

class DfDevisException extends Exception {
    private $context;

    public function __construct($message, $context = [], $code = 0, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
        $this->context = $context;
    }

    public function getContext() {
        return $this->context;
    }
}