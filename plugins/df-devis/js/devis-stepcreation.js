let container;
let devis_steps_container;
let steps_container;
let debounceMap;
let currentStepIndex = 0;
let currentGroup = "Root";

// media
let fileFrame = null;

(function(){
	container = document.querySelector('.devis-container');
	devis_steps_container = document.querySelector('.devis-steps-container');
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
		if(e.target.classList.contains('option-add-text')) {
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
			let stepDiv = e.target.closest('.devis-step');
			let stepIndex = parseInt(stepDiv.dataset.stepindex);
			display_step_content(stepIndex, false);
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
				check_step_validation("Root");
			});
		}
	});

	container.addEventListener('input', function(e) {
		if (e.target.classList.contains('set-name')) {
			let option = e.target.closest('.option');
			let id = option.dataset.id + "name";
			let spinner = option.querySelector('.devis-spinner');
			let save = option.querySelector('.devis-save');
			if (spinner && save) {
				spinner.classList.remove('hidden');
				save.classList.add('hidden');
				save.classList.remove('show-and-fade');
			}
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
					if (spinner && save) {
						spinner.classList.add('hidden');
						save.classList.remove('hidden');
						save.classList.add('show-and-fade');
					}
				});
			}, 2000);
			debounceMap.set(id, timeout);
		}
		if (e.target.classList.contains('set-step-name')) {
			let step = e.target.closest('.devis-step');
			let id = step.dataset.id + "step-name";
			let spinner = step.querySelector('.devis-spinner');
			let save = step.querySelector('.devis-save');
			if (spinner && save) {
				spinner.classList.remove('hidden');
				save.classList.add('hidden');
				save.classList.remove('show-and-fade');
			}
			clearTimeout(debounceMap.get(id));
			timeout = setTimeout(() => {
				console.log("Changing step name for step ID: " + step.dataset.id + " to value: " + e.target.value);
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
					if (spinner && save) {
						spinner.classList.add('hidden');
						save.classList.remove('hidden');
						save.classList.add('show-and-fade');
					}
				});
			}, 2000);
			debounceMap.set(id, timeout);
		}
		if (e.target.classList.contains('devis_owner_email')) {
			// change the name attribute with the text of the input
			let email = e.target.value;	
			let save_info = e.target.parentElement.querySelector('.devis-save-info');
			change_post_data_value('_devis_owner_email', email, save_info);
		}
		if (e.target.classList.contains('formulaire-product-input')) {
			// change the name attribute with the text of the input
			let name = e.target.value;	
			let product_list = e.target.closest('.formulaire-product-selection').querySelector('.formulaire-product-list');
			get_woocommerce_products(name, product_list);
		}
		if (e.target.classList.contains('formulaire-product-extra-name') || e.target.classList.contains('formulaire-product-extra-value')) {
			let extra_item = e.target.closest('.formulaire-product-extra-item');
			let id = parseInt(extra_item.closest('.formulaire').dataset.id);
			clearTimeout(debounceMap.get(id + "_" + extra_item.dataset.key));
			let timeout = setTimeout(() => {
				update_formulaire_product(extra_item);
			}, 2000);
			debounceMap.set(id + "_" + extra_item.dataset.key, timeout);
		}
	});

	/* This part is to ensure that when leaving the editing page, you remove the excess data from the database that isn't going to be used anyways */
	window.addEventListener("unload", function () {
		navigator.sendBeacon(stepData.ajaxUrl, new URLSearchParams({
			action: "dfdb_remove_unused_data",
			post_id: stepData.postId
		}));
	});

	set_selected_step(0);
	check_option_add_step_button_name(0);
	set_max_step_visibility(0);
	check_step_validation("Root");
})();

function change_post_data_value(line, value, save_info) {
	let id = "line";
	clearTimeout(debounceMap.get(id));
	if (save_info && debounceMap.get(id)) {
		let spinner = save_info.querySelector('.devis-spinner');
		let save = save_info.querySelector('.devis-save');
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
			debounceMap.delete(id);
			if (save_info) {
			let spinner = save_info.querySelector('.devis-spinner');
			let save = save_info.querySelector('.devis-save');
			spinner.classList.add('hidden');
			save.classList.remove('hidden');
			save.classList.add('show-and-fade');
		}
		});
	}
	, 2000);
	debounceMap.set(id, timeout);
}


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
	let imageDiv = button.closest(".option-display").querySelector('.option-image-preview-div');
	let id = parseInt(button.closest('.option').dataset.id);

	select_image_from_media_library(e, id, function(imageUrl, option_id) {
		fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				action: "dfdb_option_set_image",
				option_id: option_id,
				image_url: imageUrl
			})
		})
		.then(res => res.json())
		.then(data => {
			if (!data.success) {
				console.error(data.data.message);
				return;
			}

			let image = imageDiv.querySelector('.option-image-preview');
			if (!image) {
				console.error("Image element does not exist.");
				return;
			}
			image.src = imageUrl;
			imageDiv.classList.remove('hidden');
		});
	});
}

function remove_image(e) {
	e.preventDefault();

	let button = e.target;
	let imageDiv = button.closest(".option-display").querySelector('.option-image-preview-div');
	let option = imageDiv.closest('.option');
	if (!option) {
		console.error("Option element does not exist.");
		return;
	}
	let id = parseInt(option.dataset.id);

	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_option_set_image",
			option_id: id
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}

		let image = imageDiv.querySelector('.option-image-preview');
		if (!image) {
			console.error("Image element does not exist.");
			return;
		}
		image.src = '';
		imageDiv.classList.add('hidden');
	});
}

function toggle_history_visibility(e) {
	let checkbox = e.target;
	let option = checkbox.closest('.option');
	if (!option) {
		console.error("Option element does not exist.");
		return;
	}
	let id = parseInt(option.dataset.id);
	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_option_set_cost_history_visible",
			option_id: id,
			visible: checkbox.checked ? 1 : 0
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}
	});
}

function set_cost(e) {
	let input = e.target;
	let option = input.closest('.option');
	if (!option) {
		console.error("Option element does not exist.");
		return;
	}
	let id = parseInt(option.dataset.id);
	let spinner = option.querySelector('.devis-option-cost-spinner');
	let save = option.querySelector('.devis-option-cost-save');
	if (spinner && save) {
		spinner.classList.remove('hidden');
		save.classList.add('hidden');
		save.classList.remove('show-and-fade');
	}

	let debounceId = id + "_cost";
	clearTimeout(debounceMap.get(debounceId));
	let timeout = setTimeout(() => {
		fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				action: "dfdb_option_set_data_cost",
				option_id: id,
				cost: input.value
			})
		})
		.then(res => res.json())
		.then(data => {
			if (!data.success) {
				console.error(data.data.message);
			}
			debounceMap.delete(debounceId);
			if (spinner && save) {
				spinner.classList.add('hidden');
				save.classList.remove('hidden');
				save.classList.add('show-and-fade');
			}
		});
	}, 2000);
	debounceMap.set(debounceId, timeout);
}	

function toggle_option_visibility(e) {
	let checkbox = e.target;
	let option = checkbox.closest('.option');
	if (!option) {
		console.error("Option element does not exist.");
		return;
	}
	let id = parseInt(option.dataset.id);
	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_option_set_cost_option_visible",
			option_id: id,
			visible: checkbox.checked ? 1 : 0
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}
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


function select_image_from_media_library(e, id, callback) {
	e.preventDefault();

	if (!fileFrame) {
		fileFrame = wp.media({
			title: 'Select or Upload an Image',
			button: { text: 'Use this image' },
			multiple: false
		});
	}

	// Remove previous event handlers to prevent stacking
	fileFrame.off('select');

	fileFrame.on('select', function () {
		const attachment = fileFrame.state().get('selection').first().toJSON();
		if (typeof callback === 'function') {
			callback(attachment.url, id);
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

	currentGroup = group_name;
	check_step_validation("Root");
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
		devis_steps_container.appendChild(step_info);

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
				post_id: stepData.postId,
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

		const lastChild = optionsContainer.lastElementChild;
		optionsContainer.insertBefore(
			document.createRange().createContextualFragment(content),
			lastChild
		);

		let allOptions = optionsContainer.querySelectorAll('.option');
		let newOption = allOptions[allOptions.length - 1];
		let addStepButton = newOption.querySelector('.add-step');
		if (!addStepButton) {
			console.error("Add step button for new option does not exist.");
			return;
		}

		set_element_warning(addStepButton);
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

		check_step_validation("Root");
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
				let currentStepDiv = document.getElementById("step_" + currentStepIndex);
				let group = currentStepDiv.dataset.group;
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

function get_woocommerce_products(name, product_list, page_number = 1) {
	if (name === '' || name === undefined) {
		return;
	}

	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({ 
			action: "df_get_woocommerce_products",
			name: name,
			p_per_page: 10,
			page_number: page_number
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success && data.data.message !== "WooCommerce is not active.") {
			console.error(data.data.message);
			return false;
		}

		let products = data.data.products;
		// if is undefined, create some makeshift products for testing
		if (!products || products.length === 0) {
			products = [
				{ ID: 1, Image: 'https://picsum.photos/id/237/200/300', Name: 'Test Product 1', Description: 'This is a test product 1' },
				{ ID: 2, Image: 'https://picsum.photos/id/238/200/300', Name: 'Test Product 2', Description: 'This is a test product 2' },
				{ ID: 3, Image: 'https://picsum.photos/id/239/200/300', Name: 'Test Product 3', Description: 'This is a test product 3' },
				{ ID: 4, Image: 'https://picsum.photos/id/240/200/300', Name: 'Test Product 4', Description: 'This is a test product 4' },
				{ ID: 5, Image: 'https://picsum.photos/id/241/200/300', Name: 'Test Product 5', Description: 'This is a test product 5' },
				{ ID: 6, Image: 'https://picsum.photos/id/242/200/300', Name: 'Test Product 6', Description: 'This is a test product 6' },
				{ ID: 7, Image: 'https://picsum.photos/id/243/200/300', Name: 'Test Product 7', Description: 'This is a test product 7' },
				{ ID: 8, Image: 'https://picsum.photos/id/244/200/300', Name: 'Test Product 8', Description: 'This is a test product 8' },
				{ ID: 9, Image: 'https://picsum.photos/id/236/200/300', Name: 'Test Product 9', Description: 'This is a test product 9' },
				{ ID: 10, Image: 'https://picsum.photos/id/235/200/300', Name: 'Test Product 10', Description: 'This is a test product 10' }
			];
		}
		product_list.innerHTML = ''; // Clear previous products
		for (let i = 0; i < products.length; i++) {
            let product = products[i];
            let div = get_woocommerce_product_html(product);
            product_list.appendChild(div);
        }
	})
	.catch(err => {
		console.error("Error fetching WooCommerce products:", err);
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

function check_step_validation(groupName) {
	let stepType = document.querySelector('.step-type.group_' + groupName);
	if (!stepType) {
		// normal, this means there is just nothing following this group
		return { status: 'ok', success: false };
	}

	let type = stepType.dataset.typename;
	if (!is_valid_type(type)) {
		console.error("Fix your shit dumbass >:(   typename is invalid: " + type);
		return { status: 'error', success: false };
	}

	if (type === "formulaire") {
		let selected_product = stepType.querySelector('.formulaire-selected-product');
		if (!selected_product) {
			console.error("Selected product not found for formulaire in step type " + type);
			return { status: 'error', success: false };
		}

		let label = selected_product.parentElement.querySelector(".formulaire-produit-label");
		let product_item = selected_product.querySelector('.formulaire-product-item');
		if (!product_item) {
			set_element_warning(label);
			return { status: 'ok', success: false };
		}

		set_element_nothing(label);
		return { status: 'ok', success: true };
	} else if (type === "options") {
		let options = stepType.querySelectorAll('.option');
		let result = { status: 'ok', success: true };
		options.forEach(option => {
			let addStepButton = option.querySelector('.add-step');	
			if (!addStepButton) {
				console.error("Add step button not found for option in step type " + type);
				set_element_error(addStepButton);
				return { status: 'error', success: false };
			}

			let activate = addStepButton.dataset.activate;
			let check = check_step_validation(activate);
			if (check.status === 'error') {
				set_element_error(addStepButton);
				return check;
			} else if (!check.success) {
				set_element_warning(addStepButton);
				result = { status: 'ok', success: false }; // If any are not successful, the global result is unsuccessful
			} else {
				set_element_nothing(addStepButton);
			}
		});
		return result;
	} else if (type === "historique") {
		let addStepButton = stepType.querySelector(".add-history-step");
		if (!addStepButton) {
			console.error("Add step button not found for historique in step type " + type);
			return { status: 'error', success: false };
		}

		let activate = addStepButton.dataset.activate;
		let check = check_step_validation(activate);
		if (check.status === 'error') {
			set_element_error(addStepButton);
		} else if (!check.success) {
			set_element_warning(addStepButton);
		} else {
			set_element_nothing(addStepButton);
		}
		return check;
	}
}

function set_element_nothing(button) {
	button.classList.remove('devis-error');
	button.classList.remove('devis-warning');
}

function set_element_error(button) {
	button.classList.add('devis-error');
	button.classList.remove('devis-warning');
}

function set_element_warning(button) {
	button.classList.add('devis-warning');
	button.classList.remove('devis-error');
}

function set_max_step_visibility(stepindex) {
	let stepDivs = container.querySelectorAll('.devis-step');
	stepDivs.forEach(step => {
		let stepIndex = parseInt(step.dataset.stepindex);
		if (stepIndex <= stepindex) {
			step.classList.remove('devis-step-hidden');
			let viewButton = step.querySelector('.devis-step-view');
			let stepType = step.querySelector('.devis-step-types');
			if (viewButton) {
				viewButton.classList.remove('hidden');
			}
			if (stepType) {
				stepType.classList.remove('hidden');
			}
		}
		else {
			step.classList.add('devis-step-hidden');
			let viewButton = step.querySelector('.devis-step-view');
			let stepType = step.querySelector('.devis-step-types');
			if (viewButton) {
				viewButton.classList.add('hidden');
			}
			if (stepType) {
				stepType.classList.add('hidden');
			}
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
	let optionsContainer = type.querySelector('.option-container');
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

function add_field_formulaire(button) {
	let formulaire_element = button.closest('.formulaire');
	if (!formulaire_element) {
		console.error("Formulaire element does not exist.");
		return;
	}

	let formulaire_product_extra_list = formulaire_element.querySelector('.formulaire-product-extra-list');
	if (!formulaire_product_extra_list) {
		console.error("Formulaire product extra list does not exist.");
		return;
	}

	let id = parseInt(formulaire_element.dataset.id);
	if (!id) {
		console.error("Formulaire element does not have a valid ID.");
		return;
	}

	let extraItems = formulaire_product_extra_list.querySelectorAll('.formulaire-product-extra-item');
	let count = extraItems.length;
	let key = 'extra_' + count;

	let div = document.createElement('div');
	div.className = 'formulaire-product-extra-item';
	div.dataset.key = key;
	
	let nameInput = document.createElement('input');
	nameInput.type = 'text';
	nameInput.placeholder = 'Nom du champ';
	nameInput.className = 'formulaire-product-extra-name';
	
	let valueInput = document.createElement('input');
	valueInput.type = 'text';
	valueInput.placeholder = 'Valeur du champ';
	valueInput.className = 'formulaire-product-extra-value';
	
	let removeButton = document.createElement('button');
	removeButton.type = 'button';
	removeButton.className = 'formulaire-product-extra-remove';
	removeButton.textContent = 'X';

	div.appendChild(nameInput);
	div.appendChild(valueInput);
	div.appendChild(removeButton);
	
	update_formulaire_product_extra(id, key, nameInput.value, valueInput.value, function(data) {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}

		let removeButton = div.querySelector('.formulaire-product-extra-remove');
		if (!removeButton) {
			console.error("Remove button does not exist in the extra item.");
			return;
		}
		removeButton.addEventListener('click', function() {
			remove_product_formulaire_extra(this);
		});

		formulaire_product_extra_list.appendChild(div);
	});
}

function remove_product_formulaire(button) {
	let div = button.closest('.formulaire-product-item');
	remove_woocommerce_product(div);
}

function remove_product_formulaire_extra(button) {
	let div = button.closest('.formulaire-product-extra-item');
	let key = div.dataset.key;
	let formulaire_element = div.closest('.formulaire');
	let id = parseInt(formulaire_element.dataset.id);
	remove_formulaire_product_extra(id, key, function(data) {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}
		div.remove();
	});
}

function update_formulaire_product(extra_item) {
	let nameInput = extra_item.querySelector('.formulaire-product-extra-name');
	let valueInput = extra_item.querySelector('.formulaire-product-extra-value');
	let key = extra_item.dataset.key;
	let id = parseInt(extra_item.closest('.formulaire').dataset.id);
	update_formulaire_product_extra(id, key, nameInput.value, valueInput.value, function(data) {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}
	});
}

function update_formulaire_product_extra(id, key, name, value, callback) {
	fetch(stepData.ajaxUrl, {
		method: "POST",	
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_add_email_product_data",
			email_id: id,
			key: key,
			name: name,
			value: value
		})
	})
	.then(res => res.json())
	.then(data => {
		callback(data); // Call the callback function with the response data
	})
	.catch(err => {
		console.error("Error updating formulaire product extra:", err);
	});
}

function remove_formulaire_product_extra(id, key, callback) {
	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_remove_email_product_data",
			email_id: id,
			key: key
		})
	})
	.then(res => res.json())
	.then(data => {
		callback(data); // Call the callback function with the response data
	})
	.catch(err => {
		console.error("Error removing formulaire product extra:", err);
	});
}

function select_woocommerce_product(product_div) {
	let formulaire_element = product_div.closest('.formulaire');
	let id = parseInt(formulaire_element.dataset.id);
	if (!id) {
		console.error("Formulaire element does not have a valid ID.");
		return;
	}

	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_set_email_product_data",
			email_id: id,
			product_id: product_div.dataset.productId,
			product_name: product_div.querySelector('.formulaire-product-name').textContent,
			product_description: product_div.querySelector('.formulaire-product-description').textContent,
			product_image: product_div.querySelector('.formulaire-product-image').src
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}

		let selected_product_div = formulaire_element.querySelector('.formulaire-selected-product');
		selected_product_div.innerHTML = ''; // Clear previous selection
		selected_product_div.appendChild(product_div.cloneNode(true)); // Clone the selected product div

		let new_product_div = selected_product_div.querySelector('.formulaire-product-item');

		let deleteButton = document.createElement('button');
		deleteButton.type = 'button';
		deleteButton.className = 'formulaire-product-remove';
		deleteButton.textContent = 'X';
		deleteButton.addEventListener('click', function() {
			remove_woocommerce_product(new_product_div);
		});

		let label = formulaire_element.querySelector('.formulaire-produit-label');
		if (!label) {
			console.error("Label for the product does not exist.");
			return;
		}
		set_element_nothing(label); // Set normal state for the label
		new_product_div.appendChild(deleteButton);
		new_product_div.removeEventListener('click', select_woocommerce_product);
		check_step_validation("Root"); // Check validation after selection
	});
}

function remove_woocommerce_product(product_div) {
	let formulaire_element = product_div.closest('.formulaire');
	let id = parseInt(formulaire_element.dataset.id);
	if (!id) {
		console.error("Formulaire element does not have a valid ID.");
		return;
	}

	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_set_email_product_data",
			email_id: id,
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}

		let label = formulaire_element.querySelector('.formulaire-produit-label');
		if (!label) {
			console.error("Label for the product does not exist.");
			return;
		}
		set_element_warning(label); // Set warning state for the label
		product_div.remove(); // Remove the product div from the DOM
		check_step_validation("Root"); // Check validation after selection
	});
}

function get_woocommerce_product_html(product, can_be_selected = true) {
    let div = document.createElement('div');
    div.dataset.productId = product.ID;
    if (can_be_selected) {
        div.addEventListener('click', function() {
            select_woocommerce_product(this);
        });
    }
    div.className = 'formulaire-product-item';

    let image_element = document.createElement('img');
    image_element.src = product.Image === false ? "https://ui-avatars.com/api/?name=i+g&size=250" : product.Image;
    image_element.alt = product.Name;
    image_element.className = 'formulaire-product-image';

	let text_div = document.createElement('div');
	text_div.className = 'formulaire-product-text';

    let name_element = document.createElement('p');
    name_element.textContent = product.Name;
    name_element.className = 'formulaire-product-name';

    let description_element = document.createElement('p');
    description_element.innerHTML = product.Description;
    description_element.className = 'formulaire-product-description';

    text_div.appendChild(name_element);
    text_div.appendChild(description_element);
    div.appendChild(image_element);
    div.appendChild(text_div);

	/*
    if (can_be_selected && selected_product_ids[product.ID]) {
        div.classList.add('product-selected');
    } else {
        div.classList.remove('product-selected');
    }
		*/

    return div;
}