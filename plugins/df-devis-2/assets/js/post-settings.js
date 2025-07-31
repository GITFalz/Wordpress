let info_perso_container = document.querySelector('.info-perso-container');
let info_perso_debounce_map = new Map();

(function() {
    info_perso_container.addEventListener('input', function(e) {
        if (e.target.classList.contains('devis_owner_email')) {
            let email = e.target.value;	
            settings_loading();
            settings_change_post_data_value('_devis_owner_email', email, "email");
        }
    });
    info_perso_container.addEventListener('input', function(e) {
        if (e.target.classList.contains('devis_generate_history')) {
            let checked = e.target.checked;	
            settings_loading();
            settings_change_post_data_value('_devis_generate_history', checked, "history");
        }
        if (e.target.classList.contains('devis_add_redirection_page')) {
            let checked = e.target.checked;
            settings_loading();
            settings_change_post_data_value('_devis_add_redirection_page', checked, "redirection");
        }
    });
}());


function settings_change_post_data_value(line, value, specialKey) {
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
		});
	}, 2000);
	info_perso_debounce_map.set(specialKey, timeout);
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