let container;
let steps_container;
let debounceMap;
let currentStepIndex = 0;
let currentGroup = "Root";

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
})();

function next_step() { return currentStepIndex + 1; }

/* GET HTML FUNCTIONS */



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

		console.log("Option with ID " + id + " and activate group " + activate + " has been deleted successfully.");
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
				console.log("Setting type element visibility for step " + stepindex + " in group " + group);
				set_step_select(stepindex, type.dataset.typename);
			} else {
				type.classList.add('hidden');
			}
		});
	}

	currentStepIndex = stepindex;
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
	console.log("Setting type element visibility for type: " + type_name);
	let optionsContainer = type.querySelector('.options-container');
	let historiqueContainer = type.querySelector('.historique-container');
	let formulaireContainer = type.querySelector('.formulaire-container');

	if (!optionsContainer || !historiqueContainer || !formulaireContainer) {
		console.error("One or more containers do not exist in the type element.");
		return false;
	}

	console.log("Type name: " + type_name);

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

function change_step_select(step_info_container, select, group, stepindex) {
	if (stepindex === 0) {
		step_info_container.classList.remove('hidden');
		return;
	}

	// if select is empty just return
	if (!select || select.trim() === '') {
		return;
	}

	if (!is_valid_type(select)) {
		console.error("Invalid step type: " + select);
		return;
	}

	stepDiv = document.getElementById("step_"+currentStepIndex);
	if (!stepDiv) {
		console.error("Step with index " + currentStepIndex + " does not exist.");
		return;
	}

	let id = parseInt(stepDiv.dataset.id);

	fetch(stepData.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({ 
			action: "dfdb_set_type_as_selected_for_step_and_group",
			step_id: id,
			type_name: select,
			group_name: group
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return false;
		}	

		let stepBefore = document.getElementById("step_" + (currentStepIndex - 1));
		if (!stepBefore) {
			console.error("Step with index " + (currentStepIndex - 1) + " does not exist.");
			return;
		}

		let type = step_info_container.querySelector('.step-type.group_' + stepBefore.dataset.group);
		console.log('.step-type .group_' + stepBefore.dataset.group);
		if (type) {
			type.dataset.typename = select;
		}

		step_info_container.classList.remove('hidden');
		let optionContainer = step_info_container.querySelector('.options-container');
		let historiqueContainer = step_info_container.querySelector('.historique-container');
		let formulaireContainer = step_info_container.querySelector('.formulaire-container');

		if (select === "historique") {
			optionContainer.classList.add('hidden');
			historiqueContainer.classList.remove('hidden');
			formulaireContainer.classList.add('hidden');

			let historiqueContent = historiqueContainer.querySelectorAll('historique');
			historiqueContent.forEach(item => {
				if (item.classList.contains('.group_' + group)) {
					item.classList.remove('hidden');
				}
				else {
					item.classList.add('hidden');
				}
			});
		}
		else if (select === "formulaire") {
			optionContainer.classList.add('hidden');
			historiqueContainer.classList.add('hidden');
			formulaireContainer.classList.remove('hidden');

			let formulaireContent = formulaireContainer.querySelectorAll('formulaire');
			formulaireContent.forEach(item => {
				if (item.classList.contains('.group_' + group)) {
					item.classList.remove('hidden');
				}
				else {
					item.classList.add('hidden');
				}
			});
		}
		else {
			optionContainer.classList.remove('hidden');
			historiqueContainer.classList.add('hidden');
			formulaireContainer.classList.add('hidden');

			if (optionContainer.children.length === 0) {
				optionContainer.innerHTML = '<button type="button" class="add-option">Add Option</button>';
			}

			let optionsContent = optionContainer.querySelectorAll('.option');
			optionsContent.forEach(item => {
				if (item.classList.contains('group_' + group)) {
					item.classList.remove('hidden');
				}
				else {
					item.classList.add('hidden');
				}
			});
		}
	});
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
		console.log("Type for step " + stepindex + " in group " + group_name + " does not exist.");
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