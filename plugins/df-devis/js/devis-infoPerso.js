let info_perso_container = document.querySelector('.info-perso-container');
let info_perso_debounce_map = new Map();

(function() {
    info_perso_container.addEventListener('input', function(e) {
        if (e.target.classList.contains('devis_owner_email')) {
            let email = e.target.value;	
            let save_info = info_perso_container.querySelector('.devis-save-info');
            change_post_data_value('_devis_owner_email', email, save_info);
        }
    });
}());


function change_post_data_value(line, value, save_info) {
	let id = "line";
	clearTimeout(info_perso_debounce_map.get(id));
	if (save_info && info_perso_debounce_map.get(id)) {
		let spinner = info_perso_container.querySelector('.devis-spinner');
		let save = info_perso_container.querySelector('.devis-save');
		spinner.classList.remove('hidden');
		save.classList.add('hidden');
		save.classList.remove('show-and-fade');
	}

	let timeout = setTimeout(() => {
		console.log("Changing post data value for line: " + line + " to value: " + value);
		fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				action: "df_save_post_data",
				post_id: stepData.postId,
				post_line: line,
				post_value: value
			})
		})
		.then(res => res.json())
		.then(data => {
			if (!data.success) {
				console.error(data.data.message);
			}
			info_perso_debounce_map.delete(id);
			if (save_info) {
			let spinner = info_perso_container.querySelector('.devis-spinner');
			let save = info_perso_container.querySelector('.devis-save');
			spinner.classList.add('hidden');
			save.classList.remove('hidden');
			save.classList.add('show-and-fade');
		}
		});
	}
	, 2000);
	info_perso_debounce_map.set(id, timeout);
}