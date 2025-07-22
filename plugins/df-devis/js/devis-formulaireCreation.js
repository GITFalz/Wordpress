let formulaire_container;
let formulaire_debounce_map = new Map();

(function(){
    formulaire_container = document.querySelector('.formulaire-creation-container');
})();

function toggle_default_fields() {
    let default_fields = formulaire_container.querySelector('.formulaire-creation-default-fields-content');
    if (default_fields.classList.contains('hidden')) {
        default_fields.classList.remove('hidden');
    } else {
        default_fields.classList.add('hidden');
    }
}

function toggle_custom_fields() {
    let custom_fields = formulaire_container.querySelector('.formulaire-creation-custom-fields-content');
    if (custom_fields.classList.contains('hidden')) {
        custom_fields.classList.remove('hidden');
    } else {
        custom_fields.classList.add('hidden');
    }
    toggle_create_custom_fields(false);
}

function toggle_optional_fields() {
    let optional_fields = formulaire_container.querySelector('.formulaire-creation-optional-fields-content');
    if (optional_fields.classList.contains('hidden')) {
        optional_fields.classList.remove('hidden');
    } else {
        optional_fields.classList.add('hidden');
    }
}

function update_optional_field(element) {
    let field = element.closest('.formulaire-creation-optional-item');
    fc_wait(field); 

    let name = element.name;
    let value = element.checked ? 1 : 0;
    
    fetch(stepData.ajaxUrl, {
        method: 'POST',
        headers: {  
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'df_save_post_data',
            post_id: stepData.postId,
            post_line: name,
            post_value: value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.data.message);
        }

        fc_success(field);
    })
    .catch(error => {
        console.error('Error:', error);
        fc_fail(field);
    });
}

function update_region(element) {
    let field = element.closest('.formulaire-creation-custom-field');
    let input = field.querySelector('input');
    update_name(input);
}

function update_name(element) {
    let name = element.value.trim();
    let field = element.closest('.formulaire-creation-custom-field');
    let textarea = field.querySelector('textarea');
    fc_wait(field);

    let time = field.dataset.time;
    let type = field.dataset.type;
    let index = field.dataset.index;
    let text = textarea ? textarea.value.trim() : '';

    clearTimeout(formulaire_debounce_map.get(time));
    formulaire_debounce_map.set(time, setTimeout(() => {
        fetch(stepData.ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                action: 'df_update_formulaire_custom_field',
                post_id: stepData.postId,
                index: index,
                name: name,
                type: type,
                region: text,
            })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.data.message);
            }

            formulaire_debounce_map.delete(time);
            fc_success(field);
        })
        .catch(error => {
            console.error('Error:', error);
            formulaire_debounce_map.delete(time);
            fc_fail(field);
        });
    }, 2000));
}

function toggle_create_custom_fields(display = null) {
    let custom_fields_create = formulaire_container.querySelector('.formulaire-creation-custom-fields-create-content');
    if (display === null) {
        if (custom_fields_create.classList.contains('hidden')) {
            custom_fields_create.classList.remove('hidden');
        } else {
            custom_fields_create.classList.add('hidden');
        }
    } else if (display) {
        custom_fields_create.classList.remove('hidden');
    } else {
        custom_fields_create.classList.add('hidden');
    }
}

function create_custom_field(element) {
    let type = element.getAttribute('data-type');
    let custom_fields_content = formulaire_container.querySelector('.formulaire-creation-custom-fields-content');
    let name;

    if (type === 'default_input') {
        name = "Nom du champ texte";
    } else if (type === 'default_textarea') {
        name = "Nom de la zone de texte";
    } else if (type === 'default_file') {
        name = "Nom du champ de fichier jointé";
    } else if (type === 'region_checkbox') {
        name = "Nom de la case à cocher";
    } else if (type === 'region_select') {
        name = "Nom du champ de sélection";
    } else if (type === 'region_radio') {
        name = "Nom du champ radio";
    } else {
        console.error('Type de champ personnalisé non reconnu:', type);
        return;
    }

    add_custom_field(name, type, custom_fields_content);
    toggle_create_custom_fields(false);
}

function add_custom_field(name, type, fields_element) {
    let date = new Date();
    let current_time = date.getTime(); 
    div = get_custom_field_element(name, type, current_time, fields_element);
    fields_element.appendChild(div);
    fc_wait(div); 

    fetch(stepData.ajaxUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'df_add_formulaire_custom_field',
            post_id: stepData.postId,
            type: type,
            name: "",
            time: current_time
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.data.message);
        }

        fc_success(div);
    })
    .catch(error => {
        console.error('Error:', error);
        fc_fail(div);
    });
}

function get_custom_field_element(name, type, current_time, fields_element) {
    let div = document.createElement('div');
    div.classList.add('formulaire-creation-custom-field');
    div.dataset.time = current_time;
    div.dataset.type = type;
    div.dataset.index = fields_element.children.length;
    div.innerHTML = `
    <div class="formulaire-creation-custom-field-row">
        <div class="formulaire-creation-custom-field-name">
            <p>${name}</p>
            <input type="text" class="formulaire-creation-custom-field-input" name="custom_input_${current_time}" oninput="update_name(this)" />
            
        </div>
        <div class="formulaire-creation-custom-field-status">
            <p>Statut de sauvegarde</p>
            <div class="formulaire-creation-save-info">
                <div class="formulaire-creation-spinner formulaire-creation-custom-field-${current_time}-spinner hidden"></div>
                <div class="formulaire-creation-save formulaire-creation-custom-field-${current_time}-save hidden">&#10003;</div>
                <div class="formulaire-creation-fail formulaire-creation-custom-field-${current_time}-fail hidden">&#10005;</div>
            </div>
        </div>
        <div class="formulaire-creation-custom-field-actions">
            <button type="button" class="formulaire-creation-custom-field-remove" onclick="remove_custom_field(this)">X</button>
        </div>
    </div>
    ${type === 'region_checkbox' || type === 'region_select' || type === 'region_radio' ? 
            `<textarea class="formulaire-creation-custom-field-input" name="custom_input_${current_time}" oninput="update_region(this)"></textarea>` : ''}`;
    
    return div;
}

function remove_custom_field(element) {
    let field = element.closest('.formulaire-creation-custom-field');
    let index = field.dataset.index;
    fc_wait(field);

    fetch(stepData.ajaxUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'df_remove_formulaire_custom_field',
            post_id: stepData.postId,
            index: index
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.data.message);
        }

        field.remove();
        update_custom_field_indices();
    })
    .catch(error => {
        console.error('Error:', error);
        fc_fail(field);
    });
}

function fc_wait(element) {
    let spinner = element.querySelector('.formulaire-creation-spinner');
    let save_icon = element.querySelector('.formulaire-creation-save');
    let fail_icon = element.querySelector('.formulaire-creation-fail');
    if (spinner && save_icon && fail_icon) {
        spinner.classList.remove('hidden');
        save_icon.classList.add('hidden');
        save_icon.classList.remove('show-and-fade');
        fail_icon.classList.add('hidden');
        fail_icon.classList.remove('show-and-fade');
    }
}

function fc_success(element) {
    let spinner = element.querySelector('.formulaire-creation-spinner');
    let save_icon = element.querySelector('.formulaire-creation-save');
    let fail_icon = element.querySelector('.formulaire-creation-fail');
    if (spinner && save_icon && fail_icon) {
        spinner.classList.add('hidden');
        save_icon.classList.remove('hidden');
        save_icon.classList.add('show-and-fade');
        fail_icon.classList.add('hidden');
    }
}

function fc_fail(element) {
    let spinner = element.querySelector('.formulaire-creation-spinner');
    let save_icon = element.querySelector('.formulaire-creation-save');
    let fail_icon = element.querySelector('.formulaire-creation-fail');
    if (spinner && save_icon && fail_icon) {
        spinner.classList.add('hidden');
        save_icon.classList.add('hidden');
        fail_icon.classList.remove('hidden');
        fail_icon.classList.add('show-and-fade');
    }
}

function update_custom_field_indices() {
    let custom_fields_content = formulaire_container.querySelector('.formulaire-creation-custom-fields-content');
    let fields = custom_fields_content.querySelectorAll('.formulaire-creation-custom-field');

    fields.forEach((field, index) => {
        field.dataset.index = index;
    });
}