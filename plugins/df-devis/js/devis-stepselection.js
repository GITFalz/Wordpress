let container;
let current_step;
let history = {};

let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
	container = document.querySelector(".devis-container");
	current_step = 0;

	container.addEventListener('click', function(e) {
		if (e.target.classList.contains('view-devis')) {
			container.dataset.postid = e.target.dataset.postid;
			render_devis(container.dataset.postid);
			set_slected_step(0);
		}
	});
});

function render_devis(postid) {
	container.innerHTML = '<div class="steps-container"></div>';
	get_step_by_group(postid, 0, 'Root');	
}

async function view_option(e, element) {
	let type_name = await get_step_by_group(container.dataset.postid, current_step+1, "gp_"+element.dataset.id);
	if (!type_name) {
		return; // If the step could not be fetched, exit
	}

	let step_infos = document.querySelectorAll('.step-info');
	step_infos.forEach(info => {
		if (info.classList.contains('step-info-'+(current_step+1))) {
			info.classList.remove('hidden');
			let types = info.querySelectorAll('.step-type');
			types.forEach(type => {
				if (type.classList.contains('group_gp_' + element.dataset.id)) {
					type.classList.remove('hidden');
				} else {
					type.classList.add('hidden');
				}
			});
		}
		else {
			info.classList.add('hidden');
		}
	});

	let cost = element.dataset.cost;
	let history_visible = element.dataset.history === '1';
	let option_visible = element.dataset.option === '1';

	history[current_step] = {
		group: "gp_" + element.dataset.id,
		name: element.querySelector('.option-name').textContent.trim(),
		step_index: current_step + 1
	};

	if (cost) {
		history[current_step].cost = cost;
		if (history_visible) {
			history[current_step].history_visible = history_visible;
		}
		if (option_visible) {
			history[current_step].option_visible = option_visible;
		}
	}

	current_step++;

	if (type_name === "historique") {
		let type_element = document.querySelector(`.step-type.group_${"gp_"+element.dataset.id}`);
		let history_entries = type_element.querySelector('.history-entries');
		history_entries.innerHTML = ''; // Clear existing history entries
		// loop over history and create buttons
		let length = Object.keys(history).length;
		for (let i = 0; i < length; i++) {
			let entry = history[i];
			let content = `
			<div class="history-entry">
				<div class="history-action">Vous avez cliqué sur ${entry.name}${(entry['cost'] && entry['history_visible']) ? ' pour un coût de ' + entry.cost + "€" : ''}</div>
			</div>`;
			history_entries.insertAdjacentHTML('beforeend', content);
		}
	}
}

async function view_history(e, element) {
	let type_name = await get_step_by_group(container.dataset.postid, current_step+1, element.dataset.activate);
	if (!type_name) {
		return; // If the step could not be fetched, exit
	}
	
	let step_infos = document.querySelectorAll('.step-info');
	step_infos.forEach(info => {
		if (info.classList.contains('step-info-'+(current_step+1))) {
			info.classList.remove('hidden');
			let types = info.querySelectorAll('.step-type');
			types.forEach(type => {
				if (type.classList.contains('group_' + element.dataset.activate)) {
					type.classList.remove('hidden');
				} else {
					type.classList.add('hidden');
				}
			});
		}
		else {
			info.classList.add('hidden');
		}
	});
	history[current_step] = {
		group: element.dataset.activate,
		name: "history view",
		step_index: current_step + 1
	};
	current_step++;

	if (type_name === "historique") {
		let type_element = document.querySelector(`.step-type.group_${element.dataset.activate}`);
		let history_entries = type_element.querySelector('.history-entries');
		history_entries.innerHTML = ''; // Clear existing history entries
		// loop over history and create buttons
		let length = Object.keys(history).length;
		for (let i = 0; i < length; i++) {
			let entry = history[i];
			console.log(entry);
			let content = `
			<div class="history-entry">
				<div class="history-action">Vous avez cliqué sur ${entry.name}</div>
			</div>`;
			history_entries.insertAdjacentHTML('beforeend', content);
		}
	}
}

async function view_step(e, element) {
	let step_index = parseInt(element.dataset.stepindex);
	if (step_index >= current_step) {
		return; // Cannot view a step that hasn't been loaded yet or is the current step
	}

	let step_infos = document.querySelectorAll('.step-info');
	step_infos.forEach(info => {
		if (info.classList.contains('step-info-'+step_index)) {
			info.classList.remove('hidden');
			let types = info.querySelectorAll('.step-type');
			types.forEach(type => { 
				if (type.classList.contains('group_' + element.dataset.group)) {
					type.classList.remove('hidden');
				} else {
					type.classList.add('hidden');
				}
			});
		}
		else {
			info.classList.add('hidden');
		}
	});

	current_step = step_index;
	history = Object.fromEntries(Object.entries(history).filter(([key]) => parseInt(key)+1 <= current_step));

	let step_divs = document.querySelectorAll('.devis-step');
	step_divs.forEach(step => {
		let stepIndex = parseInt(step.dataset.stepindex);
		if (stepIndex > current_step) {
			step.remove();
		}
	});

	set_slected_step(step_index);
}

function set_slected_step(step_index) {
	let step_divs = document.querySelectorAll('.devis-step');
	step_divs.forEach(step => {
		let stepIndex = parseInt(step.dataset.stepindex);
		if (stepIndex === step_index) {
			step.classList.add('current-step');
		} else {
			step.classList.remove('current-step');
		}
	});
}

async function get_step_by_group(postid, step_index, group_name) {
	if (isRunning) {
		return false;
	}
	isRunning = true;

	let step_div = document.getElementById(`step_${step_index}`) ? 'true' : 'false';
	let step_info = document.querySelector(`.step-info-${step_index}`) ? 'true' : 'false';
	let type_div = document.querySelector(`.step-type.group_${group_name}`) ? 'true' : 'false';
	let type_content = type_div === 'true' ? (document.querySelector(`.step-type.group_${group_name}`).children.length > 0 ? 'true' : 'false' ) : 'false';

	let typeName;

	await fetch(stepData.ajaxUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			action: 'df_get_step_html_by_index',
			post_id: postid,
			step_index: step_index,
			group_name: group_name,
			step_div: step_div,
			step_info: step_info,
			type_div: type_div,
			type_content: type_content
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error('Error fetching step:', data.data.message);
			return;
		}

		if (step_div === 'false') {
			let stepsContainer = container.querySelector('.steps-container');
			stepsContainer.insertAdjacentHTML('beforeend', data.data.step_html);
		}

		if (step_info === 'false') {
			container.insertAdjacentHTML('beforeend', data.data.step_info);
		}

		if (type_div === 'false') {
			let step_info_element = document.querySelector(`.step-info-${step_index}`); // Now it should have been added before
			if (step_info_element) {
				step_info_element.insertAdjacentHTML('beforeend', data.data.type_html);
			}
		}

		if (type_content === 'false') {
			let type_element = document.querySelector(`.step-type.group_${group_name}`); // Now it should have been added before
			if (type_element) {
				type_element.insertAdjacentHTML('beforeend', data.data.type_content);
			}
		}

		typeName = data.data.type_name;

		let stepDiv = document.getElementById(`step_${step_index}`);
		stepDiv.dataset.group = group_name;

		set_slected_step(step_index);

		isRunning = false;
	})
	.catch(error => {
		console.error('Fetch error:', error);
	});

	return typeName;
}

function formulaire_send_email(element) {
	let data = [];
	let formulaire = element.closest('.formulaire');	
	let formulaireFields = formulaire.querySelectorAll('.formulaire-field');
	let email = "";

	formulaireFields.forEach((field) => {
		const type = field.dataset.type;
		const labelElement = field.querySelector('.formulaire-label');
		const label = labelElement ? labelElement.textContent.trim() : '';

		console.log("Processing field:", type, label);

		if (!label) return;

		if (type === 'default_email') {
			const emailInput = field.querySelector('.formulaire-input');
			if (emailInput && emailInput.value.trim()) {
				email = emailInput.value.trim();
			}
		}

		else if (type === 'default_type' || type === 'default_input') {
			const input = field.querySelector('.formulaire-input');
			if (input && input.value.trim()) {
				data.push({
					label: label,
					value: input.value.trim()
				});
			}
		}

		else if (type === 'default_textarea') {
			const textarea = field.querySelector('.formulaire-textarea');
			if (textarea && textarea.value.trim()) {
				data.push({
					label: label,
					value: textarea.value.trim()
				});
			}
		}

		else if (type === 'default_file') {
			const fileInput = field.querySelector('.formulaire-file');
			if (fileInput && fileInput.files.length > 0) {
				const fileNames = Array.from(fileInput.files).map(file => file.name).join(', ');
				data.push({
					label: label,
					value: fileNames
				});
			}
		}

		else if (type === 'region_checkbox') {
			const checkboxes = field.querySelectorAll('.formulaire-checkbox');
			const selectedValues = Array.from(checkboxes)
				.filter(cb => cb.checked)
				.map(cb => cb.value);
			if (selectedValues.length > 0) {
				data.push({
					label: label,
					value: selectedValues.join(', ')
				});
			}
		}

		else if (type === 'region_select') {
			const select = field.querySelector('.formulaire-select');
			if (select) {
				const selected = Array.from(select.selectedOptions).map(opt => opt.value);
				if (selected.length > 0) {
					data.push({
						label: label,
						value: selected.join(', ')
					});
				}
			}
		}

		else if (type === 'region_radio') {
			const radios = field.querySelectorAll('.formulaire-radio');
			const checked = Array.from(radios).find(radio => radio.checked);
			if (checked) {
				data.push({
					label: label,
					value: checked.value
				});
			}
		}
	});

	console.log("Collected data:", data);

	const formData = new FormData();
	formData.append('action', 'df_devis_send_email');
	formData.append('post_id', container.dataset.postid);
	formData.append('email_id', formulaire.dataset.id);
	formData.append('email', email);
	formData.append('data', JSON.stringify(data));

	formulaireFields.forEach((field) => {
		const type = field.dataset.type;
		if (type === 'default_file') {
			const fileInput = field.querySelector('.formulaire-file');
			if (fileInput && fileInput.files.length > 0) {
				Array.from(fileInput.files).forEach((file, index) => {
					formData.append('files[]', file);
					console.log(`File ${index + 1}:`, file.name);
				});
			}
		}
	});

	fetch(stepData.ajaxUrl, {
		method: 'POST',
		body: formData
	})	
	.then(res => res.json())
	.then(data => {
		if (data.success) {
			alert('Email sent successfully!');
		} else {
			console.error('Error sending email:', data.data.message);
			alert('Failed to send email: ' + data.data.message);
		}
	})
	.catch(error => {
		console.error('Fetch error:', error);
		alert('An error occurred while sending the email.');
	});
}