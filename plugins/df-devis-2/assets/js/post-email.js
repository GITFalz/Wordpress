let email_container;

(function(){
    email_container = document.querySelector('.custom-email-container');    

    // Test if color input has changed
    email_container.addEventListener('input', function(e) {
        if (e.target.classList.contains('custom-email-input')) {
            update_post_data_value(e.target);
        }
    });
}());

function update_post_data_value(element) {
    let field = element.closest('.custom-email-field');
    ce_wait(field);

    let line = element.dataset.name;
    let value = element.value;

    let custom_element = email_container.querySelector('.' + line);
    if (element.classList.contains('email-bg-color')) {
        custom_element.style.backgroundColor = value;
    } else if (element.classList.contains('email-color')) {
        custom_element.style.color = value;
    } else if (element.classList.contains('email-textarea')) {
        custom_element.innerHTML = value;
    } else {
        custom_element.innerHTML = value;
    }

    fetch(devisEmailOptions.ajaxUrl, {
        method: 'POST',
        headers: {  
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'dv_save_post_data',
            post_id: devisEmailOptions.postId,
            post_line: line,
            post_value: value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.data.message);
        }

        ce_success(field);
    })
    .catch(error => {
        console.error('Error:', error);
        ce_fail(field);
    });
}

function ce_wait(element) {
    let spinner = element.querySelector('.custom-email-spinner');
    let save_icon = element.querySelector('.custom-email-save');
    let fail_icon = element.querySelector('.custom-email-fail');
    if (spinner && save_icon && fail_icon) {
        spinner.classList.remove('hidden');
        save_icon.classList.add('hidden');
        save_icon.classList.remove('show-and-fade');
        fail_icon.classList.add('hidden');
        fail_icon.classList.remove('show-and-fade');
    }
}

function ce_success(element) {
    let spinner = element.querySelector('.custom-email-spinner');
    let save_icon = element.querySelector('.custom-email-save');
    let fail_icon = element.querySelector('.custom-email-fail');
    if (spinner && save_icon && fail_icon) {
        spinner.classList.add('hidden');
        save_icon.classList.remove('hidden');
        save_icon.classList.add('show-and-fade');
        fail_icon.classList.add('hidden');
    }
}

function ce_fail(element) {
    let spinner = element.querySelector('.custom-email-spinner');
    let save_icon = element.querySelector('.custom-email-save');
    let fail_icon = element.querySelector('.custom-email-fail');
    if (spinner && save_icon && fail_icon) {
        spinner.classList.add('hidden');
        save_icon.classList.add('hidden');
        fail_icon.classList.remove('hidden');
        fail_icon.classList.add('show-and-fade');
    }
}
