<?php

$stepType = $_POST['step_type'];
$activate = $_POST['activate'];

$content = '';

if ($stepType === 'historique') {
    $content = '
    <section class="page-content page-history">
        <h2 class="page-title">History Page</h2>
        <div class="history-entries">
        </div>
        <button data-activate="'.$activate.'" onclick="history_select(this, \'options\')" class="history-return-button" type="button">Continuer</button>
    </section>';
}

else if ($stepType === 'formulaire') {
    $content = '
    <section class="page-content page-email">
        <h2 class="page-title">Email Page</h2>
        <form class="email-form">
            <label class="email-label" for="user-name">Your Name:</label>
            <input class="email-input" type="text" id="user-name" name="user-name" placeholder="Enter your name" />

            <label class="email-label" for="user-email">Your Email:</label>
            <input class="email-input" type="email" id="user-email" name="user-email" placeholder="Enter your email" />

            <label class="email-label" for="user-message">Message:</label>
            <textarea class="email-textarea" id="user-message" name="user-message" placeholder="Write your message here"></textarea>

            <button class="email-submit" type="submit">Send</button>
        </form>
    </section>';
}

else {
    $content = '<div class="step-error">Step error</div>';
}

$response = array('content' => $content);
echo json_encode($response);