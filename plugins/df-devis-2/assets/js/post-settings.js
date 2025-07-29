let info_perso_container = document.querySelector('.info-perso-container');
let info_perso_debounce_map = new Map();

(function() {
    info_perso_container.addEventListener('input', function(e) {
        if (e.target.classList.contains('devis_owner_email')) {
            let email = e.target.value;	
            settings_loading();
            change_post_data_value('_devis_owner_email', email, "email");
        }
    });
    info_perso_container.addEventListener('input', function(e) {
        if (e.target.classList.contains('devis_generate_history')) {
            let checked = e.target.checked;	
            settings_loading();
            change_post_data_value('_devis_generate_history', checked, "history", (data) => {
                if (checked) {
                    generate_history_checkbox();
                } else {
                    settings_save();
                    let infoSupplementaireContent= document.querySelector('.info-supplementaire-content');
                    let extraStep = infoSupplementaireContent.querySelector('.extra-step');
                    if (extraStep) {
                        extraStep.remove();
                    }
                }
            });
        }
    });
}());


function change_post_data_value(line, value, specialKey, callback = null) {
	clearTimeout(info_perso_debounce_map.get(specialKey));
	let timeout = setTimeout(() => {
		fetch(devisSettingsOptions.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				action: "dv_save_post_data",
				post_id: devisSettingsOptions.postId,
				post_line: line,
				post_value: value
			})
		})
		.then(res => res.json())
		.then(data => {
			if (!data.success) {
				console.error(data.data.message);
			}
			info_perso_debounce_map.delete(specialKey);
			settings_save();
            if (callback)
                callback(data);
		});
	}, 2000);
	info_perso_debounce_map.set(specialKey, timeout);
}

function generate_history_checkbox() {
    let steps_content = document.querySelector('.steps-content');
    let stepsCount = steps_content.querySelectorAll('.step').length;
    fetch(devisSettingsOptions.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: "dv_generate_history_checkbox",
            post_id: devisSettingsOptions.postId,
            step_index: stepsCount + 1
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error(data.data.message);
            return;
        } 

        let html = data.data.html;
        
        let infoSupplementaireContent= document.querySelector('.info-supplementaire-content');
        let extraStep = infoSupplementaireContent.querySelector('.extra-step');
        if (extraStep) {
            extraStep.remove();
        }
        settings_save();
        let temp = document.createElement('div');
        temp.innerHTML = html;
        let newExtraStep = temp.querySelector('.extra-step');
        let firstChild = infoSupplementaireContent.firstChild;
        if (firstChild) {
            infoSupplementaireContent.insertBefore(newExtraStep, firstChild);
        } else {
            infoSupplementaireContent.appendChild(newExtraStep);
        }
    });
}

function settings_loading() {
    let spinner = info_perso_container.querySelector('.devis-spinner');
    let save = info_perso_container.querySelector('.devis-save');
    spinner.classList.remove('hidden');
    save.classList.add('hidden');
    save.classList.remove('show-and-fade');
}

function settings_save() {
    let spinner = info_perso_container.querySelector('.devis-spinner');
    let save = info_perso_container.querySelector('.devis-save');
    spinner.classList.add('hidden');
    save.classList.remove('hidden');
    save.classList.add('show-and-fade');
}