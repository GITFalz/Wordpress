let container;
let steps_container;
let debounceMap;
let currentStepIndex = 0;
let currentGroup = "Root";

// media
let fileFrame = null;

(function(){
	container = document.querySelector('.devis-container');
	steps_container = document.querySelector('.steps-container');
	debounceMap = new Map();

	// Remove Step
	container.addEventListener('click', function(e) {
		if(e.target.classList.contains('remove-step')) {
			dfdb_remove_step(e.target);
		}
		if(e.target.classList.contains('remove-option')) {
			dfdb_delete_option(e.target);
		}
		if(e.target.classList.contains('add-option')) {
			let stepDiv = document.getElementById("step_" + currentStepIndex);
			if (!stepDiv) {
				console.error("Step with index " + currentStepIndex + " does not exist.");
				return;
			}
			let group = stepDiv.dataset.group;
			dfdb_create_option(e.target, currentStepIndex, group);
		}
		if(e.target.classList.contains('add-step')) {
			dfdb_create_step(e.target.dataset.activate, next_step());
		}
		if(e.target.classList.contains('add-history-step')) {
			dfdb_create_step(e.target.dataset.activate, next_step());
		}
		if (e.target.classList.contains('devis-step-view')) {
			display_step_content(e.target.parentElement.parentElement.dataset.stepindex, false);
		}
		if (e.target.classList.contains('devis-add-option-element')) {
			// number of elements before adding a new one
			let option_elements = e.target.parentElement.querySelectorAll('.option-element');
			let count = option_elements.length;

			fetch(stepData.ajaxUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: new URLSearchParams({
					action: "dfdb_option_add_data_value",
					option_id: parseInt(e.target.closest('.option').dataset.id),
					type: "text",
					value: "Option"+(count+1)
				})
			})
			.then(res => res.json())
			.then(data => {
				if (!data.success) {
					console.error(data.data.message);
					return;
				}

				let div = document.createElement('div');
				div.classList.add('option-element');
				div.dataset.index = count;

				let typeDiv = document.createElement('div');
				typeDiv.classList.add('option-element-type');

				let text = document.createElement('p');
				text.classList.add('option-element-type-text');
				text.textContent = "Text";
				typeDiv.appendChild(text);

				let select = document.createElement('select');
				select.classList.add('option-element-type-select');
				select.innerHTML = `
					<option value="text">Text</option>
					<option value="image">Image</option>`;
				select.addEventListener('change', function(e) {
						change_option_element_type(e.target);
					});
				typeDiv.appendChild(select);

				div.appendChild(typeDiv);

				let input = document.createElement('input');
				input.classList.add('option-element-input');
				input.type = 'text';
				input.placeholder = 'Enter value...';
				input.value = "Option" + (count + 1);
				input.addEventListener('input', on_text_input);
				div.appendChild(input);

				let imageDiv = document.createElement('div');
				imageDiv.classList.add('option-element-image');
				imageDiv.classList.add('hidden'); // Initially hidden, shown when type is image

				let button_select_image = document.createElement('button');
				button_select_image.classList.add('option-element-select-image');
				button_select_image.textContent = 'Select Image';
				button_select_image.type = 'button';
				imageDiv.appendChild(button_select_image);

				let image = document.createElement('img');
				image.classList.add('option-element-image-preview');
				image.src = 'https://ui-avatars.com/api/?name=i+g&size=250'; // Default image
				imageDiv.appendChild(image);
				div.appendChild(imageDiv);

				let remove_button = document.createElement('button');
				remove_button.classList.add('remove-option-element');
				remove_button.dataset.index = count;
				remove_button.textContent = 'Remove Element';
				remove_button.type = 'button';
				remove_button.addEventListener('click', remove_option_element);
				div.appendChild(remove_button);

				button_select_image.onclick = function(e) {
					select_image(e);
				}

				let element = e.target;
				let option = e.target.parentElement;

				option.insertBefore(div, element);
			});
		}
	});

	container.addEventListener('change', function(e) {
		if(e.target.classList.contains('devis-step-selection')) {
			let stepDiv = e.target.closest('.devis-step');
			if (!stepDiv) {
				console.error("Step div does not exist.");
				return;
			}

			let step_info_container = document.querySelector('.step-info-' + stepDiv.dataset.stepindex);
			if (!step_info_container) {
				console.error("Step info container for step " + currentStepIndex + " does not exist.");
				return;
			}

			let select = e.target.value;
			let group = stepDiv.dataset.group;

			let type_element = step_info_container.querySelector('.step-type.group_' + group);
			if (!type_element) {
				console.error("Type element for step " + currentStepIndex + " in group " + group + " does not exist.");
				return;
			}

			fetch(stepData.ajaxUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: new URLSearchParams({ 
					action: "dfdb_set_type_name",
					type_id: parseInt(type_element.dataset.typeid),
					type_name: select
				})
			})
			.then(res => res.json())
			.then(data => {
				if (!data.success) {
					console.error(data.data.message);
					return;
				}
				
				type_element.dataset.typename = select;
				set_type_element_visibility(type_element, select);
			});
		}
	});

	container.addEventListener('input', function(e) {
		if (e.target.classList.contains('set-name')) {
			let option = e.target.parentElement.parentElement;
			let id = option.dataset.id + "name";
			clearTimeout(debounceMap.get(id));
			timeout = setTimeout(() => {
				fetch(stepData.ajaxUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					body: new URLSearchParams({ 
						action: "dfdb_set_option_name",
						option_id: parseInt(option.dataset.id),
						option_name: e.target.value
					})
				})
				.then(res => res.json())
				.then(data => {
					if (!data.success) {
						console.error(data.data.message);
					}

					debounceMap.delete(id);
				});
			}, 2000);
			debounceMap.set(id, timeout);
		}
		if (e.target.classList.contains('set-step-name')) {
			let step = e.target.parentElement.parentElement;
			let id = step.dataset.id + "step-name";
			clearTimeout(debounceMap.get(id));
			timeout = setTimeout(() => {
				fetch(stepData.ajaxUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					body: new URLSearchParams({ 
						action: "dfdb_set_step_name",
						step_id: parseInt(step.dataset.id),
						step_name: e.target.value
					})
				})
				.then(res => res.json())
				.then(data => {
					if (!data.success) {
						console.error(data.data.message);
					}

					debounceMap.delete(id);
				});
			}, 2000);
			debounceMap.set(id, timeout);
		}
	});

	/* This part is to ensure that when leaving the editing page, you remove the excess data from the database that isn't going to be used anyways */
	window.addEventListener("beforeunload", function () {
		// Navigator is used to ensure that the request is sent even if the page is closed
		navigator.sendBeacon(stepData.ajaxUrl, new URLSearchParams({
			action: "dfdb_remove_unused_data",
			post_id: stepData.postId
		}));
	});

	set_selected_step(0);
	check_option_add_step_button_name(0);
	set_max_step_visibility(0);
})();


function on_text_input(e) {
	let input = e.target;
	let option = input.closest('.option');
	let option_element = input.closest('.option-element');
	if (!option) {
		console.error("Option element does not exist.");
		return;
	}
	let count = parseInt(option_element.dataset.index);
	let id = parseInt(option.dataset.id);

	let debounceId = id + "_text_input_" + count;
	clearTimeout(debounceMap.get(debounceId));
	let timeout = setTimeout(() => {
		fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				action: "dfdb_option_update_data_value",
				option_id: id,
				index: count,
				type: "text",
				value: input.value
			})
		})
		.then(res => res.json())
		.then(data => {
			if (!data.success) {
				console.error(data.data.message);
			}
			debounceMap.delete(debounceId);
		});
	}, 2000);
	// Store the timeout in the debounceMap
	debounceMap.set(debounceId, timeout);
}

function remove_option_element(e) {
	let option_element = e.target.closest('.option-element');
	if (!option_element) {
		console.error("Option element does not exist.");
		return;
	}
	let option = option_element.closest('.option');
	if (!option) {
		console.error("Option element does not exist.");
		return;
	}
	let count = parseInt(option_element.dataset.index);
	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_option_remove_data_value",
			option_id: parseInt(option.dataset.id),
			index: count
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}
		option_element.remove();
		let option_elements = option.querySelectorAll('.option-element');
		option_elements.forEach((el, index) => {
			el.dataset.index = index; // Update the index of each element
		});
	});
}


function select_image(e) {
	e.preventDefault();

	let button = e.target;
	let image = button.parentElement.querySelector('.option-element-image-preview');
	const count = parseInt(button.closest('.option-element').dataset.index);
	const id = parseInt(button.closest('.option').dataset.id);

	console.log("Selecting image for option ID:", id, "and count:", count);

	select_image_from_media_library(e, count, id, function(imageUrl, option_id, index) {
		console.log("Selected image URL:", imageUrl, "Updating database with ID:", option_id, "and count:", index);
		fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				action: "dfdb_option_update_data_value",
				option_id: option_id,
				index: index,
				type: "image",
				value: imageUrl
			})
		})
		.then(res => res.json())
		.then(data => {
			if (!data.success) {
				console.error(data.data.message);
				return;
			}
			image.src = imageUrl; // Update the image preview
		});
	});
}


function change_option_element_type(element) {

	let type = element.value;
	let value;
	if (type === "text") {
		value = element.closest('.option-element').querySelector('.option-element-input').value;``
		element.closest('.option-element').querySelector('.option-element-type-text').textContent = "Text";
	}
	else if (type === "image") {
		value = element.closest('.option-element').querySelector('.option-element-image-preview').src;
		element.closest('.option-element').querySelector('.option-element-type-text').textContent = "Image";
	} else {
		console.error("Invalid type selected: " + type);
		return;
	}

	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_option_update_data_value",
			option_id: parseInt(element.closest('.option').dataset.id),
			index: parseInt(element.closest('.option-element').dataset.index),
			type: type,
			value: value
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}

		let optionElement = element.closest('.option-element');
		if (!optionElement) {
			console.error("Option element does not exist.");
			return;
		}

		let imageDiv = optionElement.querySelector('.option-element-image');
		let textInput = optionElement.querySelector('.option-element-input');

		let type = element.value;
		if (type === "text") {
			imageDiv.classList.add('hidden');
			textInput.classList.remove('hidden');
		} 
		else if (type === "image") {
			imageDiv.classList.remove('hidden');
			textInput.classList.add('hidden');
		}
		else {
			console.error("Invalid type selected: " + type);
			return;
		}
	});
}
		

function next_step() { return currentStepIndex + 1; }

function set_selected_step(step_index) {
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


function select_image_from_media_library(e, count, id, callback) {
	e.preventDefault();

	if (fileFrame) {
		fileFrame.open();
		return;
	}

	fileFrame = wp.media({
		title: 'Select or Upload an Image',
		button: {
			text: 'Use this image'
		},
		multiple: false
	});

	fileFrame.on('select', function () {
		const attachment = fileFrame.state().get('selection').first().toJSON();
		if (typeof callback === 'function') {
			callback(attachment.url, id, count);
		}
	});

	fileFrame.open();
}


/* DATABASE FUNCTIONS */
async function dfdb_create_step(group_name, next_step_index) {
	let step = await create_step_element_if_not_exist(next_step_index, steps_container, stepData);
	if (!step.success) {
		console.error("Failed to create step for index " + next_step_index);
		return false;
	}

	let type = await create_step_type_if_not_exist(next_step_index, group_name, step.step_id, stepData);
	if (!type.success) {
		console.error("Failed to create step type for index " + next_step_index);
		return false;
	}

	set_step_group(next_step_index, group_name);
	display_step_content(next_step_index);
}

async function create_step_element_if_not_exist(next_step_index, steps_container, stepData) {
	let step = step_exists(next_step_index);
	if (step.exists) {
		return { success: true, step_id: step.step_id };
	}

	try {
		const response = await fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({ 
				action: "dfdb_create_step_html",
				step_name: "Étape " + (next_step_index+1),
				step_index: next_step_index,
				post_id: stepData.postId,
			})
		});

		const step_data = await response.json();

		if (!step_data.success) {
			console.error(step_data.data.message);
			return { success: false, step_id: null };
		}

		let content = step_data.data.content;
		steps_container.insertAdjacentHTML('beforeend', content);

		let step_info = create_step_info(next_step_index);
		container.appendChild(step_info);

		return { success: true, step_id: parseInt(step_data.data.step_id) };
	} catch (err) {
		console.error("Error creating step:", err);
		return { success: false, step_id: null };
	}
}

async function create_step_type_if_not_exist(next_step_index, group_name, step_id, stepData) {
	let type = type_exists(next_step_index, group_name);
	if (type.exists) {
		return { success: true, type_id: type.type_id };
	}

	try {
		//dfdb_create_default_types
		const response = await fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({ 
				action: "dfdb_create_default_types",
				step_id: step_id,
				group_name: group_name
			})
		});

		const type_data = await response.json();
		if (!type_data.success) {
			console.error(type_data.data.message);
			return { success: false, type_id: null };
		}	

		let type_id = type_data.data.type_id;
		let option_id = type_data.data.option_id;
		let history_id = type_data.data.history_id;
		let email_id = type_data.data.email_id;

		const type_html_response = await fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({ 
				action: "df_get_default_type_html",
				type_id: type_id,
				step_index: next_step_index,
				group_name: group_name,
				option_id: option_id,
				history_id: history_id,
				email_id: email_id
			})
		});

		const type_html_data = await type_html_response.json();
		if (!type_html_data.success) {
			console.error(type_html_data.data.message);
			return { success: false, type_id: null };
		}

		let step_info_container = document.querySelector('.step-info-' + next_step_index);
		if (!step_info_container) {
			console.error("Step info container for step " + next_step_index + " does not exist.");
			return { success: false, type_id: null };
		}

		step_info_container.insertAdjacentHTML('beforeend', type_html_data.data.content);
		return { success: true, type_id: type_id };
	} catch (err) {
		console.error("Error creating step type:", err);
		return { success: false, type_id: null };
	}
}

function dfdb_create_option(element, stepindex, group_name) {
	let stepDiv = document.getElementById("step_"+stepindex);
	if (!stepDiv) {
		console.error("Step with index " + stepindex + " does not exist.");
		return;
	}

	let step_type = element.closest('.step-type');
	if (!step_type) {
		console.error("Step type element does not exist.");
		return;
	}
	
	let id = parseInt(stepDiv.dataset.id);
	let type_id = parseInt(step_type.dataset.typeid);

	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({ 
			action: "df_create_step_option_get_html",
			selected: 'true',
			step_id: id,
			type_id: type_id,
			group_name: group_name,
			option_name: 'Option'
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return false;
		}

		let content = data.data.content;
		let optionsContainer = step_type.querySelector('.options-container');
		if (!optionsContainer) {
			console.error("Options container for step " + stepindex + " does not exist.");
			return;
		}

		if (optionsContainer.children.length === 0) {
			optionsContainer.innerHTML = '<button type="button" class="add-option">Add Option</button>';
		}

		const lastChild = optionsContainer.lastElementChild;
		optionsContainer.insertBefore(
			document.createRange().createContextualFragment(content),
			lastChild
		);
	});
}

function dfdb_remove_step(element) {
	let stepDiv = element.closest('.devis-step');
	if (!stepDiv) {	
		console.error("Step div does not exist.");
		return;
	}

	let step_id = parseInt(stepDiv.dataset.id);
	let stepindex = parseInt(stepDiv.dataset.stepindex);

	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({ 
			action: "dfdb_delete_step",
			step_id: step_id,
			step_index: stepindex,
			post_id: stepData.postId
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return false;
		}

		let stepDivs = document.querySelectorAll('.devis-step');
		stepDivs.forEach(step => {
			if (parseInt(step.dataset.stepindex) >= stepindex) {
				step.remove();
				document.querySelector('.step-info-' + step.dataset.stepindex)?.remove();
			}
		});

		if (currentStepIndex === stepindex) {
			currentStepIndex = 0;
			display_step_content(currentStepIndex);
		}
		else {
			if (currentStepIndex > stepindex) {
				currentStepIndex = 0;
				display_step_content(currentStepIndex);
			}
			else {
				let group = stepDiv.dataset.group;
				let step_info_container = document.querySelector('.step-info-' + currentStepIndex);
				if (!step_info_container) {
					console.error("Step info container for step " + currentStepIndex + " does not exist.");
					return;
				}
				let type = step_info_container.querySelector('.step-type.group_' + group);
				if (!type) {
					console.error("Type element for step " + currentStepIndex + " in group " + group + " does not exist.");
					return;
				}
				check_option_add_step_button_name(currentStepIndex, type);
			}
		}
	})
	.catch(err => {
		console.error("Error deleting step:", err);
	});
}

function dfdb_delete_option(element) {
	let option = element.closest('.option');
	if (!option) {
		console.error("Option element does not exist.");
		return;
	}

	if (option.parentElement.children.length <= 2) {
		alert("On ne peut pas supprimer toutes les options d'une étape. Ne vous en faites pas, les données non utilisées seront supprimées automatiquement à l'enregistrement.");
		option.querySelector('input').value = 'Option';
		return;
	}

	let id = parseInt(option.dataset.id);
	let activate = element.dataset.activate;

	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({ 
			action: "dfdb_delete_option",
			option_id: id
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return false;
		}

		let types = document.querySelectorAll('.step-type.group_'+activate);
		types.forEach(type => {
			type.remove();
		});
		option.remove();
	});
}


/* DISPLAY FUNCTIONS */
function display_step_content(stepindex, switch_type = true) {
	stepindex = parseInt(stepindex);
	if (!step_exists(stepindex).exists) {
		console.error("Step with index " + stepindex + " does not exist.");
		return;
	}
	
	if (!set_step_info_visibility(stepindex)) {
		console.error("Failed to set step info visibility for step " + stepindex);
		return;
	}

	if (switch_type) {
		// Don't have to check existence here, it's already checked in set_step_info_visibility for both
		let stepDiv = document.getElementById("step_" + stepindex);
		let step_info_container = document.querySelector('.step-info-' + stepindex); 
		let group = stepDiv.dataset.group;
		let types = step_info_container.querySelectorAll('.step-type');
		
		types.forEach(type => {
			if (type.classList.contains('group_' + group)) {			
				type.classList.remove('hidden');
				set_type_element_visibility(type, type.dataset.typename);
				set_step_select(stepindex, type.dataset.typename);
				if (type.dataset.typename === "options") {
					check_option_add_step_button_name(stepindex, type);
				}
			} else {
				type.classList.add('hidden');
			}
		});

		
	}

	currentStepIndex = stepindex;
	set_selected_step(stepindex);
	check_option_add_step_button_name(currentStepIndex);
	set_max_step_visibility(currentStepIndex);
}

function check_option_add_step_button_name(stepindex, type = null) {
	let step_info_container = document.querySelector('.step-info-' + stepindex);
	if (!step_info_container) {
		console.error("Step info container for step " + stepindex + " does not exist.");
		return;
	}

	if (!type) {
		type = step_info_container.querySelector('.step-type');
		if (!type) {
			console.error("Type element for step " + stepindex + " does not exist.");
			return;
		}
	}

	let add_step_buttons = type.querySelectorAll('.add-step');
	add_step_buttons.forEach(button => {
		if (container.querySelector('.step-type.group_'+button.dataset.activate)) {
			button.textContent = "View Step";
		} else {
			button.textContent = "Add Step";
		}
	});
}

function set_max_step_visibility(stepindex) {
	let stepDivs = container.querySelectorAll('.devis-step');
	stepDivs.forEach(step => {
		let stepIndex = parseInt(step.dataset.stepindex);
		if (stepIndex <= stepindex) {
			step.classList.remove('hidden');
		}
		else {
			step.classList.add('hidden');
		}
	});
}	

function set_step_info_visibility(stepindex) {
	if (!step_info_exists(stepindex)) {
		console.error("Step info for step " + stepindex + " does not exist.");
		return false;
	}

	let step_info_containers = document.querySelectorAll('.step-info');
	step_info_containers.forEach(container => {
		if (container.classList.contains('step-info-' + stepindex)) {
			container.classList.remove('hidden');
		} else {
			container.classList.add('hidden');
		}
	});

	return true;
}

function set_type_element_visibility(type, type_name) {
	let optionsContainer = type.querySelector('.options-container');
	let historiqueContainer = type.querySelector('.historique-container');
	let formulaireContainer = type.querySelector('.formulaire-container');

	if (!optionsContainer || !historiqueContainer || !formulaireContainer) {
		console.error("One or more containers do not exist in the type element.");
		return false;
	}

	if (type_name === "historique") {
		optionsContainer.classList.add('hidden');
		historiqueContainer.classList.remove('hidden');
		formulaireContainer.classList.add('hidden');

		let historiqueContent = historiqueContainer.querySelectorAll('.historique');
		historiqueContent.forEach(item => {
			item.classList.remove('hidden');
		});
	}
	else if (type_name === "formulaire") {
		optionsContainer.classList.add('hidden');
		historiqueContainer.classList.add('hidden');
		formulaireContainer.classList.remove('hidden');

		let formulaireContent = formulaireContainer.querySelectorAll('.formulaire');
		formulaireContent.forEach(item => {
			item.classList.remove('hidden');
		});
	}
	else {
		optionsContainer.classList.remove('hidden');
		historiqueContainer.classList.add('hidden');
		formulaireContainer.classList.add('hidden');

		if (optionsContainer.children.length === 0) {
			optionsContainer.innerHTML = '<button type="button" class="add-option">Add Option</button>';
		}

		let optionsContent = optionsContainer.querySelectorAll('.option');
		optionsContent.forEach(item => {
			item.classList.remove('hidden');
		});
	}
	return true;
}

/* HELPER FUNCTIONS */
function is_valid_type(type) {
	return ['options', 'historique', 'formulaire'].includes(type);
}

function set_step_group(stepindex, group_name) {
	let stepDiv = document.getElementById("step_" + stepindex);
	if (!stepDiv) {
		console.error("Step with index " + stepindex + " does not exist.");
		return;
	}
	stepDiv.dataset.group = group_name;
}

function set_step_select(stepindex, select) {
	if (stepindex === 0) {
		return;
	}
	
	let stepDiv = document.getElementById("step_" + stepindex);
	if (!stepDiv) {
		console.error("Step with index " + stepindex + " does not exist.");
		return;
	}
	stepDiv.querySelector('select').value = select;
}

function step_exists(stepindex) {
	let stepDiv = document.getElementById("step_" + stepindex);
	if (!stepDiv) {
		return { exists: false, step_id: null };
	}	

	return { exists: true, step_id: parseInt(stepDiv.dataset.id) };
}

function step_info_exists(stepindex) {
	let step_info_container = document.querySelector('.step-info-' + stepindex);
	if (!step_info_container) {
		return false;
	}	

	return true;
}

function type_exists(stepindex, group_name) {
	let step_info_container = document.querySelector('.step-info-' + stepindex);
	if (!step_info_container) {
		return { exists: false, type_id: null };
	}

	let type = step_info_container.querySelector('.step-type.group_' + group_name);
	if (!type) {
		return { exists: false, type_id: null };
	}

	return { exists: true, type_id: parseInt(type.dataset.typeid) };
}

function create_step_info(step_index) {
	let step_info = document.createElement('div');
	step_info.classList.add('step-info');
	step_info.classList.add('step-info-' + step_index);
	step_info.classList.add('hidden');
	step_info.dataset.stepindex = step_index;
	return step_info;
}