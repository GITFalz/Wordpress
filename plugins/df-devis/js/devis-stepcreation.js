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
			remove_step_options(e.target);
		}
		if(e.target.classList.contains('remove-option')) {
			remove_option(e.target);
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
			add_history_step(e.target);
		}
	});

	container.addEventListener('change', function(e) {
		if(e.target.classList.contains('devis-step-selection')) {
			let stepDiv = e.target.closest('.devis-step');
			if (!stepDiv) {
				console.error("Step div does not exist.");
				return;
			}

			let step_info_container = document.querySelector('.step-info-' + currentStepIndex);
			if (!step_info_container) {
				console.error("Step info container for step " + currentStepIndex + " does not exist.");
				return;
			}

			let select = e.target.value;
			let group = stepDiv.dataset.group;

			change_step_select(step_info_container, select, group);
		}
	});

	container.addEventListener('input', function(e) {
		if (e.target.classList.contains('set-name')) {
			let option = e.target.parentElement.parentElement;
			let id = option.dataset.id + "name";
			clearTimeout(debounceMap.get(id));
			timeout = setTimeout(() => {
				ajax_call(
					new URLSearchParams({ 
						action: "dfdb_set_option_name",
						option_id: parseInt(option.dataset.id),
						option_name: e.target.value
					}), data => 
					{
						if (!data.success)
							console.error(data.data.message);

						debounceMap.delete(id);
					}
				);
			}, 2000);
			debounceMap.set(id, timeout);
		}
		if (e.target.classList.contains('set-step-name')) {
			let step = e.target.parentElement.parentElement;
			let id = step.dataset.id + "step-name";
			clearTimeout(debounceMap.get(id));
			timeout = setTimeout(() => {
				ajax_call(
					new URLSearchParams({ 
						action: "dfdb_set_step_name",
						step_id: parseInt(step.dataset.id),
						step_name: e.target.value
					}), data => 
					{
						if (!data.success)
							console.error(data.data.message);

						debounceMap.delete(id);
					}
				);
			}, 2000);
			debounceMap.set(id, timeout);
		}
	});
})();

function next_step() { return currentStepIndex + 1; }

/* GET HTML FUNCTIONS */



/* DATABASE FUNCTIONS */
function dfdb_create_step(element, group_name, next_step_index) {
	
	let stepDiv = document.getElementById("step_" + next_step_index);
	let step_info = document.querySelector('.step-info-' + next_step_index);
	let typename = 'options';
	let new_step_data;
	if (step_info) {
		
	} else {
		fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({ 
				action: "dfdb_create_step_and_types",
				step_name: "Nom",
				post_id: stepData.postId,
				group_name: group_name
			})
		})
		.then(res => res.json())
		.then(data1 => { 
			if (!data1.success) {
				console.error(data1.data.message);
				return false;
			}

			new_step_data = data1;
		});
	}

	step_info = document.querySelector('.step-info-' + next_step_index);
	if (!step_info) {
		console.error("Step info for step " + next_step_index + " does not exist.");
		return;
	}	

	let type = step_info.querySelector('.step-type.group_' + element.dataset.activate);
	if (!type) {
		console.error("Step type for group " + element.dataset.activate + " does not exist.");
		return;
	}

	typename = type.dataset.typename;

	if (!stepDiv && new_step_data) {
		if (!new_step_data.success) {
			console.error(new_step_data.data.message);
			return false;
		}

		fetch(stepData.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({ 
				action: "df_get_step_html",
				step_id: new_step_data.data.id,
				step_index: next_step_index,
				step_name: "Nom",
				step_type: "options",
			})
		})
		.then(res => res.json())
		.then(data2 => {
			if (!data2.success) {
				console.error(data2.data.message);
				return false;
			}

			fetch(stepData.ajaxUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: new URLSearchParams({
					action: "df_get_default_type_html",
					type_id: new_step_data.data.type_id,
					step_index: next_step_index,
					group_name: group_name,
					option_id: new_step_data.data.option_id,
					history_id: new_step_data.data.history_id,
					email_id: new_step_data.data.email_id
				})
			})
			.then(res => res.json())
			.then(data3 => {
				let content = data2.data.content;
				steps_container.insertAdjacentHTML('beforeend', content);
				let stepDiv = document.getElementById("step_" + next_step_index);
				stepDiv.dataset.group = group_name;

				let step_info = create_step_info(next_step_index);
				container.appendChild(step_info);
				step_info.innerHTML = data3.data.content;

				display_step_content(next_step_index);
			});		
		});
	}

	stepDiv.dataset.group = element.dataset.activate;	
	stepDiv.querySelector("select").value = typename;

	//step_has_content(next_step(), stepDiv);
	display_step_content(next_step());
}

function create_step_info(step_index) {
	let step_info = document.createElement('div');
	step_info.classList.add('step-info');
	step_info.classList.add('step-info-' + step_index);
	step_info.classList.add('hidden');
	step_info.dataset.stepindex = step_index;
	return step_info;
}

// Makes sure that the step info exists
function step_has_content(stepindex, stepDiv) {
	let step_info_container = document.querySelector('.step-info-' + stepindex);
	if (!step_info_container) {
		let step_info = create_step_info(stepindex);
		container.appendChild(step_info);
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

		let step_info_container = document.querySelector('.step-info-' + stepindex);
		if (!step_info_container) {
			console.error("Step info container for step " + stepindex + " does not exist.");
			return;
		}

		let content = data.data.content;
		let optionsContainer = step_info_container.querySelector('.options-container');
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

function display_step_content(stepindex) {
	let stepDiv = document.getElementById("step_"+stepindex);
	if (!stepDiv) {
		console.error("Step with index " + stepindex + " does not exist.");
		return;
	}

	let group = stepDiv.dataset.group;
	let select = stepindex === 0 ? 'options' : stepDiv.querySelector("select").value;

	let step_info_containers = document.querySelectorAll('.step-info');
	step_info_containers.forEach(container => {
		if (parseInt(container.dataset.stepindex) === stepindex) {
			change_step_select(container, select, group, stepindex);
		}
		else {
			container.classList.add('hidden');
		}
	});

	let step_info_container = document.querySelector('.step-info-' + stepindex);
	if (!step_info_container) {
		console.error("Step info container for step " + stepindex + " does not exist.");
		return;
	}

	currentStepIndex = stepindex;
	currentGroup = group;

	change_step_select(step_info_container, select, group, stepindex);
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

function is_valid_type(type) {
	return ['options', 'historique', 'formulaire'].includes(type);
}

function create_step_options(stepindex, content) {
	let stepDiv = document.getElementById("step_"+stepindex);
	if (!stepDiv) {
		console.error("Step with index " + stepindex + " does not exist.");
		return;
	}

	let optionsContainer = stepDiv.querySelector('.options-container');
	if (!optionsContainer) {
		console.error("Options container for step " + stepindex + " does not exist.");
		return;
	}

	optionsContainer.innerHTML = content;

	let addOptionButton = document.createElement('button');
	addOptionButton.className = 'add-option';
	addOptionButton.dataset.stepindex = stepindex;
	addOptionButton.textContent = 'Add Option';
	addOptionButton.addEventListener('click', (e) => add_option(e.target));
	optionsContainer.appendChild(addOptionButton);
}