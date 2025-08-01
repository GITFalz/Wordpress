let dv_steps_container;

let optionsContainer;
let optionsContent;

let productContainer;
let productContent;

let stepsContent;
let current_step = 1;
let postId;

let debounceMap = new Map();

let fileFrame;

(function(){
    dv_steps_container = document.querySelector('.dv-steps-container');

    optionsContainer = dv_steps_container.querySelector('.options-container');
    optionsContent = optionsContainer.querySelector('.options-content');

    productContainer = dv_steps_container.querySelector('.product-container');
    productContent = productContainer.querySelector('.product-content');

    stepsContent = dv_steps_container.querySelector('.steps-content');
    postId = devisStepsOptions.postId;

    dv_steps_container.addEventListener('input', function(event) {
        if (event.target.classList.contains('step-index-name')) {
            let stepInput = event.target;
            let stepDiv = stepInput.closest('.step');
            let stepIndex = parseInt(stepDiv.dataset.index);
            let specialKey = "step_" + stepIndex;

            if (debounceMap.has(specialKey)) {
                clearTimeout(debounceMap.get(specialKey));
            }

            dv_set_step_status(stepIndex, 'loading');

            debounceMap.set(specialKey, setTimeout(async function() {
                let stepName = stepInput.value.trim();
                if (stepName) {
                    await dv_set_step_index_name(stepIndex, stepName);
                }
                else {
                    dv_set_step_status(stepIndex, 'nothing');
                }
                debounceMap.delete(specialKey);
            }, 500));
        }
        if (event.target.classList.contains('option-name')) {
            let optionInput = event.target;
            let optionDiv = optionInput.closest('.option');
            let optionId = optionDiv.dataset.id;
            let specialKey = "option_" + optionId;

            if (debounceMap.has(specialKey)) {
                clearTimeout(debounceMap.get(specialKey));
            }

            dv_set_option_status(optionDiv, 'loading');

            debounceMap.set(specialKey, setTimeout(async function() {
                let optionName = optionInput.value.trim();
                if (optionName) {
                    await dv_set_option_name(optionDiv, optionId, optionName);
                }
                else {
                    dv_set_option_status(optionDiv, 'nothing');
                }                
                debounceMap.delete(specialKey);
            }, 500));
        }
        if (event.target.classList.contains('formulaire-product-input')) {
			// change the name attribute with the text of the input
			let name = event.target.value;	
			let product_list = event.target.closest('.formulaire-product-selection').querySelector('.formulaire-product-list');
			get_woocommerce_products(name, product_list);
		}
        if (event.target.classList.contains('formulaire-product-extra-name') || event.target.classList.contains('formulaire-product-extra-value')) {
			let extra_item = event.target.closest('.formulaire-product-extra-item');
			let id = parseInt(extra_item.closest('.formulaire').dataset.id);
			clearTimeout(debounceMap.get(id + "_" + extra_item.dataset.key));
			let timeout = setTimeout(() => {
				update_formulaire_product(extra_item);
			}, 2000);
			debounceMap.set(id + "_" + extra_item.dataset.key, timeout);
		}
        if (event.target.classList.contains('option-additional-cost')) {
            let optionInput = event.target;
            let optionDiv = optionInput.closest('.option');
            let optionId = optionDiv.dataset.id;
            let additionalCost = parseFloat(optionInput.value) || 0;
            let specialKey = "option_additional_cost_" + optionId;

            if (debounceMap.has(specialKey)) {
                clearTimeout(debounceMap.get(specialKey));
            }

            debounceMap.set(specialKey, setTimeout(async function() {
                fetch(devisStepsOptions.ajaxUrl, {
                    method: 'POST',
                    headers: {  
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        action: 'dvdb_option_set_additional_cost',
                        option_id: optionId,
                        additional_cost: additionalCost
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (!data.success) {
                        console.error('Error setting additional cost:', data.data.message);
                        return;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });

                debounceMap.delete(specialKey);
            }, 500));
        }

        // handle product item inputs
        if (event.target.classList.contains('formulaire-product-name') || event.target.classList.contains('formulaire-product-price-value') || event.target.classList.contains('formulaire-product-description')) {
            let productItem = event.target.closest('.formulaire-product-item');
            let productId = parseInt(productItem.dataset.id);
            let specialKey = "product_item_" + productId;

            if (debounceMap.has(specialKey)) {
                clearTimeout(debounceMap.get(specialKey));
            }

            debounceMap.set(specialKey, setTimeout(async function() {
                await update_woocommerce_product(productItem);
                debounceMap.delete(specialKey);
            }, 500));
        }


        if (event.target.classList.contains('devis_history_step_name')) {
            let saveInfo = event.target.closest('.extra-step-input').querySelector('.post-steps-save-info');
            let spinner = event.target.closest('.extra-step-name').querySelector('.post-steps-spinner');
            let success = event.target.closest('.extra-step-name').querySelector('.post-steps-success');
            saveInfo.classList.remove('hidden');
            spinner.classList.remove('hidden');
            success.classList.add('hidden');
            success.classList.remove('show-and-fade');
            change_post_data_value('_devis_history_step_name', event.target.value, "history_step_name", (data) => {
                if (!data.success) {
                    console.error(data.data.message);
                    saveInfo.classList.add('hidden');
                    spinner.classList.add('hidden');
                    success.classList.add('hidden');
                    return;
                }
                spinner.classList.add('hidden');
                success.classList.remove('hidden');
                success.classList.add('show-and-fade');
                setTimeout(() => {
                    saveInfo.classList.add('hidden');
                    success.classList.remove('show-and-fade');
                }, 2000);
            });
        }
    });

    dv_steps_container.addEventListener('change', function(event) {
        if (event.target.tagName.toLowerCase() === 'select' && event.target.closest('.step')) {
            let stepSelect = event.target;
            let stepDiv = stepSelect.closest('.step');
            let stepId = stepDiv.dataset.id;
            let type = stepSelect.value;

            fetch(devisStepsOptions.ajaxUrl, {
                method: 'POST',
                headers: {  
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    action: 'dvdb_set_step_type',
                    step_id: stepId,
                    type: type,
                    post_id: postId
                })
            })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    console.error('Error setting step type:', data.data.message);
                    return;
                }

                let newStepIndexCount = data.data.new_step_index_count;
                internal_disable_step_name_input(newStepIndexCount, data.data.hasEndProduct);
                display_step(stepId, parseInt(stepDiv.dataset.index));
                internal_check_step_divs(newStepIndexCount);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });

    let firstStep = stepsContent.querySelector('.step_1');
    if (firstStep) {
        let stepId = firstStep.dataset.id;
        display_step(stepId, 1);
    } else {
        console.error('No first step found.');
    }
})();


function toggle_history_visibility(e) {
	let checkbox = e.target;
	let option = checkbox.closest('.option');
	if (!option) {
		console.error("Option element does not exist.");
		return;
	}
	let id = parseInt(option.dataset.id);
	fetch(devisStepsOptions.ajaxUrl, {
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

function dv_add_option_to_step() {
    const stepId = devisStepsOptions.currentStepId;
    fetch(devisStepsOptions.ajaxUrl, {
        method: 'POST',
        headers: {  
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'dv_add_option_to_step',
            step_id: stepId,
            option_name: "Option"
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error adding option:', data.data.message);
            return;
        }
         
        const html = data.data.html;

        let temp = document.createElement('div');
        temp.innerHTML = html;
        const newOption = temp.firstElementChild;
        const lastDiv = optionsContent.lastElementChild;
        optionsContent.insertBefore(newOption, lastDiv);

        let newOptionAddStepButton = newOption.querySelector('.add-step-button');
        let optionWarning = newOption.querySelector('.option-warning');
        if (newOptionAddStepButton) {
            optionWarning.textContent = 'étape manquante';
            set_element_warning(newOptionAddStepButton);
        }
    });
}

function dv_remove_option_from_step(element) {
    let option = element.closest('.option');
    let optionId = option.dataset.id;

    fetch(devisStepsOptions.ajaxUrl, {
        method: 'POST',
        headers: {  
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'dv_remove_option',
            option_id: optionId,
            post_id: postId
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error removing option:', data.data.message);
            return;
        }

        let newStepIndexCount = data.data.new_step_index_count;
        internal_disable_step_name_input(newStepIndexCount, data.data.hasEndProduct);
        internal_check_step_divs(newStepIndexCount);

        option.remove();
    });
}

function dv_option_add_step(element) {
    let option = element.closest('.option');
    let optionId = option.dataset.id;

    fetch(devisStepsOptions.ajaxUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'dv_add_step_to_option',
            post_id: postId,
            option_id: optionId,
            step_name: "Étape",
            step_index: current_step + 1
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error adding option:', data.data.message);
            return;
        }
        
        let step_index = current_step + 1;
        display_step(data.data.id, step_index, data.data.type);

        if (dv_get_step_count() >= step_index) {
            return;
        }

        const html = data.data.html;
        let temp = document.createElement('div');
        temp.innerHTML = html;
        const newStep = temp.firstElementChild;
        stepsContent.appendChild(newStep);
        internal_disable_step_name_input(step_index - 1, false);
    });
}

function dv_remove_step(element) {
    let step = element.closest('.step');
    let stepIndex = parseInt(step.dataset.index);
    fetch(devisStepsOptions.ajaxUrl, {
        method: 'POST',
        headers: {  
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'dv_remove_step',
            step_index: stepIndex,
            post_id: postId
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error removing step:', data.data.message);
            return;
        }

        let wantedStepIndex = Math.min(current_step, stepIndex - 1);
        let stepDiv = stepsContent.querySelector(`.step_${wantedStepIndex}`);
        let previousStepId = stepDiv ? stepDiv.dataset.id : -1;
        display_step(previousStepId, wantedStepIndex);

        let newStepIndexCount = data.data.new_step_index_count;
        internal_disable_step_name_input(newStepIndexCount, data.data.hasEndProduct);
        internal_check_step_divs(newStepIndexCount);
    });
}

function dv_view_step(element) {
    let step = element.closest('.step');
    let stepId = step.dataset.id;
    display_step(stepId, parseInt(step.dataset.index));
}


function display_step(step_id, step_index, actual_type = null) {

    let stepSelect = stepsContent.querySelector(`.step_${step_index} select`);
    let type = actual_type ? actual_type : (stepSelect ? stepSelect.value : 'options');

    fetch(devisStepsOptions.ajaxUrl, {
        method: 'POST',
        headers: {  
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'dv_get_step_data_html',
            step_id: step_id,
            type: type,
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error fetching options:', data.data.message);
            return;
        }

        let warnings = data.data.warnings;

        if (type === 'options') {
            optionsContainer.classList.remove('hidden');
            productContainer.classList.add('hidden');

            let lastDiv = optionsContent.lastElementChild;
            optionsContent.innerHTML = data.data.html;
            optionsContent.appendChild(lastDiv);


            let optionDivs = optionsContent.querySelectorAll('.option');
            optionDivs.forEach(div => {
                let id = div.dataset.id;
                let addStepButton = div.querySelector('.add-step-button');
                let optionWarning = div.querySelector('.option-warning');
                if (warnings[id]) {
                    optionWarning.classList.remove('hidden');
                    optionWarning.textContent = warnings[id];
                    if (warnings[id] === 'missing step') {
                        addStepButton.innerHTML = 'Ajouter une étape';
                    }
                    set_element_warning(addStepButton);
                } else {
                    optionWarning.classList.add('hidden');
                    optionWarning.textContent = '';
                }
            });

        } else if (type === 'product') {
            optionsContainer.classList.add('hidden');
            productContainer.classList.remove('hidden');

            productContent.innerHTML = data.data.html;
        }

        let stepId = data.data.step_id;
        devisStepsOptions.currentStepId = stepId;
        current_step = step_index;
        
        let stepElement = stepsContent.querySelector(`.step_${step_index}`);
        if (stepElement) {
            stepElement.dataset.id = stepId;
        }

        internal_set_step_type(step_index, type);
        internal_set_step_visibility();
    });
}

async function dv_set_step_index_name(stepIndex, stepName) {
    await fetch(devisStepsOptions.ajaxUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'dv_set_step_index_name',
            post_id: postId,
            step_index: stepIndex,
            step_name: stepName
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error setting step index name:', data.data.message);
            dv_set_step_status(stepIndex, 'error');
            return;
        }

        dv_set_step_status(stepIndex, 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        dv_set_step_status(stepIndex, 'error');
    });
}

async function dv_set_option_name(option, optionId, optionName) {
    await fetch(devisStepsOptions.ajaxUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'dv_set_option_name',
            option_id: optionId,
            option_name: optionName
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error setting option name:', data.data.message);
            dv_set_option_status(option, 'error');
            return;
        }   

        dv_set_option_status(option, 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        dv_set_option_status(option, 'error');
    });
}

function get_woocommerce_products(name, product_list, page_number = 1) {
	if (name === '' || name === undefined) {
		return;
	}

	fetch(devisStepsOptions.ajaxUrl, {
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

		let products = data.data.data.products;
		// if is undefined, create some makeshift products for testing

        if (!products || products.length === 0) {
            products = [
                { ID: 1, Image: 'https://picsum.photos/id/237/200/300', Name: 'Test Product 1', Description: 'This is a test product 1', Price: 10.00 },
                { ID: 2, Image: 'https://picsum.photos/id/238/200/300', Name: 'Test Product 2', Description: 'This is a test product 2', Price: 20.00 },
                { ID: 3, Image: 'https://picsum.photos/id/239/200/300', Name: 'Test Product 3', Description: 'This is a test product 3', Price: 16.35 },
                { ID: 4, Image: 'https://picsum.photos/id/240/200/300', Name: 'Test Product 4', Description: 'This is a test product 4', Price: 25.50 },
                { ID: 5, Image: 'https://picsum.photos/id/241/200/300', Name: 'Test Product 5', Description: 'This is a test product 5', Price: 8.92},
                { ID: 6, Image: 'https://picsum.photos/id/242/200/300', Name: 'Test Product 6', Description: 'This is a test product 6', Price: 15.75 },
                { ID: 7, Image: 'https://picsum.photos/id/243/200/300', Name: 'Test Product 7', Description: 'This is a test product 7', Price: 30.00 },
                { ID: 8, Image: 'https://picsum.photos/id/244/200/300', Name: 'Test Product 8', Description: 'This is a test product 8', Price: 12.99 },
                { ID: 9, Image: 'https://picsum.photos/id/236/200/300', Name: 'Test Product 9', Description: 'This is a test product 9', Price: 18.45 },
                { ID: 10, Image: 'https://picsum.photos/id/235/200/300', Name: 'Test Product 10', Description: 'This is a test product 10', Price: 22.30 }
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

/**
 * Helper functions
 */
function dv_get_step_count() {
    return stepsContent.querySelectorAll('.step').length;
}

function internal_check_step_divs(max_step_index) {
    let stepDivs = stepsContent.querySelectorAll('.step');
    stepDivs.forEach(step => {
        let stepIndex = parseInt(step.dataset.index);
        if (stepIndex > max_step_index) {
            step.remove();
        }
    });
}

function internal_set_step_type(stepIndex, type) {
    if (stepIndex <= 1)
        return;

    let stepDiv = stepsContent.querySelector(`.step_${stepIndex}`);
    if (!stepDiv) {
        console.error(`Step with index ${stepIndex} not found.`);
        return;
    }
    
    let stepSelect = stepDiv.querySelector('select');
    if (!stepSelect) {
        console.error(`Select element not found in step ${stepIndex}.`);
        return;
    }

    stepSelect.value = type;
}

function internal_set_step_visibility() {
    let stepDivs = stepsContent.querySelectorAll('.step');
    stepDivs.forEach(step => {
        let stepIndex = parseInt(step.dataset.index);
        let stepSelect = step.querySelector('select');

        if (stepIndex < current_step) {
            if (stepSelect) {
                stepSelect.disabled = false;
            }
            step.classList.add('step_previous');
            step.classList.remove('step_current', 'step_next');
        } else if (stepIndex === current_step) {
            if (stepSelect) {
                stepSelect.disabled = false;
            }
            step.classList.add('step_current');
            step.classList.remove('step_previous', 'step_next');
        } else {
            if (stepSelect) {
                stepSelect.disabled = true;
            }
            step.classList.add('step_next');
            step.classList.remove('step_previous', 'step_current');
        }
    });
}

function internal_disable_step_name_input(index, disable) {
    let stepDiv = stepsContent.querySelector(`.step_${index}`);
    if (stepDiv) {
        let input = stepDiv.querySelector('.step-index-name');
        if (input) {
            input.disabled = disable;
        }
    }
}

function dv_set_step_status(stepIndex, status) {
    let stepDiv = stepsContent.querySelector(`.step_${stepIndex}`);
    let stepSaveInfo = stepDiv.querySelector('.post-steps-save-info');
    let spinner = stepSaveInfo.querySelector('.post-steps-spinner');
    let success = stepSaveInfo.querySelector('.post-steps-success');
    let error = stepSaveInfo.querySelector('.post-steps-error');
    let specialKey = "loading_" + stepIndex;

    if (debounceMap.has(specialKey)) {
        clearTimeout(debounceMap.get(specialKey));
        debounceMap.delete(specialKey);
    }

    if (status === 'nothing') {
        stepSaveInfo.classList.add('hidden');
        return;
    }
    
    stepSaveInfo.classList.remove('hidden');    
    if (status === 'loading') {

        spinner.classList.remove('hidden');
        success.classList.add('hidden');
        error.classList.add('hidden');
        success.classList.remove('show-and-fade');
        error.classList.remove('show-and-fade');

    } else if (status === 'success') {

        spinner.classList.add('hidden');
        success.classList.remove('hidden');
        success.classList.add('show-and-fade');
        error.classList.add('hidden');

        debounceMap.set(specialKey, setTimeout(() => {

            spinner.classList.add('hidden');
            success.classList.add('hidden');
            error.classList.add('hidden');

            success.classList.remove('show-and-fade');
            error.classList.remove('show-and-fade');

            stepSaveInfo.classList.add('hidden');
            debounceMap.delete(specialKey);
        }, 2000));
        
    } else if (status === 'error') {

        spinner.classList.add('hidden');
        success.classList.add('hidden');
        error.classList.remove('hidden');
        error.classList.add('show-and-fade');

        debounceMap.set(specialKey, setTimeout(() => {
            
            spinner.classList.add('hidden');
            success.classList.add('hidden');
            error.classList.add('hidden');

            success.classList.remove('show-and-fade');
            error.classList.remove('show-and-fade');
            
            stepSaveInfo.classList.add('hidden');
            debounceMap.delete(specialKey);
        }, 2000));
    }
}

function dv_set_option_status(optionDiv, status) {
    let optionSaveInfo = optionDiv.querySelector('.post-steps-save-info');
    let spinner = optionSaveInfo.querySelector('.post-steps-spinner');
    let success = optionSaveInfo.querySelector('.post-steps-success');
    let error = optionSaveInfo.querySelector('.post-steps-error');
    let optionId = optionDiv.dataset.id;
    let specialKey = "option_loading_" + optionId;
    if (debounceMap.has(specialKey)) {
        clearTimeout(debounceMap.get(specialKey));
        debounceMap.delete(specialKey);
    }

    if (status === 'nothing') {
        optionSaveInfo.classList.add('hidden');
        return;
    }

    optionSaveInfo.classList.remove('hidden');    
    if (status === 'loading') {

        spinner.classList.remove('hidden');
        success.classList.add('hidden');
        error.classList.add('hidden');
        success.classList.remove('show-and-fade');
        error.classList.remove('show-and-fade');

    } else if (status === 'success') {

        spinner.classList.add('hidden');
        success.classList.remove('hidden');
        success.classList.add('show-and-fade');
        error.classList.add('hidden');

        debounceMap.set(specialKey, setTimeout(() => {

            spinner.classList.add('hidden');
            success.classList.add('hidden');
            error.classList.add('hidden');

            success.classList.remove('show-and-fade');
            error.classList.remove('show-and-fade');

            optionSaveInfo.classList.add('hidden');
            debounceMap.delete(specialKey);
        }, 2000));
        
    } else if (status === 'error') {

        spinner.classList.add('hidden');
        success.classList.add('hidden');
        error.classList.remove('hidden');
        error.classList.add('show-and-fade');

        debounceMap.set(specialKey, setTimeout(() => {
            
            spinner.classList.add('hidden');
            success.classList.add('hidden');
            error.classList.add('hidden');

            success.classList.remove('show-and-fade');
            error.classList.remove('show-and-fade');
            
            optionSaveInfo.classList.add('hidden');
            debounceMap.delete(specialKey);
        }, 2000));
    }
}



function select_image(e) {
	e.preventDefault();

	let button = e.target;
	let imageDiv = button.closest(".option-image-container").querySelector('img');
	let id = parseInt(button.closest('.option').dataset.id);

	select_image_from_media_library(e, id, function(imageUrl, option_id) {
		fetch(devisStepsOptions.ajaxUrl, {
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

			imageDiv.src = imageUrl;
			imageDiv.classList.remove('hidden');
		});
	});
}

function remove_image(e) {
	e.preventDefault();

	let button = e.target;
	let imageDiv = button.closest(".option-image-container").querySelector('img');
	let option = imageDiv.closest('.option');
	if (!option) {
		console.error("Option element does not exist.");
		return;
	}
	let id = parseInt(option.dataset.id);

	fetch(devisStepsOptions.ajaxUrl, {
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

		imageDiv.src = '';
		imageDiv.classList.add('hidden');
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
	fetch(devisStepsOptions.ajaxUrl, {
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
	fetch(devisStepsOptions.ajaxUrl, {
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

    let productCopy = {
        ID: product_div.dataset.productId,
        Image: product_div.querySelector('.formulaire-product-image').src,
        Name: product_div.querySelector('.formulaire-product-name').textContent,
        Description: product_div.querySelector('.formulaire-product-description').textContent,
        Price: product_div.querySelector('.formulaire-product-price-value').textContent
    }

	fetch(devisStepsOptions.ajaxUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			action: "dfdb_set_email_product_data",
			email_id: id,
			product_id: productCopy.ID,
			product_name: productCopy.Name,
			product_description: productCopy.Description,
			product_image: productCopy.Image,
            product_price: productCopy.Price
		})
	})
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
			console.error(data.data.message);
			return;
		}

        let productItem = get_woocommerce_product_html(productCopy, false);
        console.log("Selected product:", productItem);

		let selected_product_div = formulaire_element.querySelector('.formulaire-selected-product');
		selected_product_div.innerHTML = ''; // Clear previous selection
        selected_product_div.appendChild(productItem);

		let new_product_div = selected_product_div.querySelector('.formulaire-product-item');

        /**
         * <div class="formulaire-product-actions">
                <button type="button" class="formulaire-product-save" onclick="update_woocommerce_product(this)">Changer l'image</button>
                <button type="button" class="formulaire-product-remove" onclick="remove_product_formulaire(this)">X</button>
            </div>
         */

        let actions_div = document.createElement('div');
        actions_div.className = 'formulaire-product-actions';

        let saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'formulaire-product-save';
        saveButton.textContent = 'Changer l\'image';
        saveButton.addEventListener('click', function() {
            select_image_from_media_library(event, id, function(imageUrl, option_id) {
                // set image src
                let imageElement = new_product_div.querySelector('.formulaire-product-image');
                if (!imageElement) {
                    console.error("Image element does not exist in the product item.");
                    return;
                }
                imageElement.src = imageUrl;
                update_woocommerce_product(new_product_div);
            });
        });

		let deleteButton = document.createElement('button');
		deleteButton.type = 'button';
		deleteButton.className = 'formulaire-product-remove';
		deleteButton.textContent = 'X';
		deleteButton.addEventListener('click', function() {
			remove_woocommerce_product(new_product_div);
		});

        actions_div.appendChild(saveButton);
        actions_div.appendChild(deleteButton);

		let label = formulaire_element.querySelector('.formulaire-produit-label');
		if (!label) {
			console.error("Label for the product does not exist.");
			return;
		}
		set_element_nothing(label); // Set normal state for the label

        let droite_div = new_product_div.querySelector('.formulaire-actions-droite');
        if (!droite_div) {
            console.error("Right actions div does not exist in the product item.");
            return;
        }

        droite_div.appendChild(actions_div);
		new_product_div.removeEventListener('click', select_woocommerce_product);
	
	});
}

async function update_woocommerce_product(product_div) {
    let formulaire_element = product_div.closest('.formulaire');
    let id = parseInt(formulaire_element.dataset.id);
    if (!id) {
        console.error("Formulaire element does not have a valid ID.");
        return;
    }
    
    await fetch(devisStepsOptions.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: "dfdb_set_email_product_data",
            email_id: id,
            product_id: product_div.dataset.productId,
            product_name: product_div.querySelector('.formulaire-product-name').value,
            product_description: product_div.querySelector('.formulaire-product-description').value,
            product_image: product_div.querySelector('.formulaire-product-image').src,
            product_price: product_div.querySelector('.formulaire-product-price-value').value
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

function remove_woocommerce_product(product_div) {
	let formulaire_element = product_div.closest('.formulaire');
	let id = parseInt(formulaire_element.dataset.id);
	if (!id) {
		console.error("Formulaire element does not have a valid ID.");
		return;
	}

	fetch(devisStepsOptions.ajaxUrl, {
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
	});
}

function get_woocommerce_product_html(product, can_be_selected = true) {
    let div = document.createElement('div');
    div.dataset.productId = product.ID;
    if (can_be_selected) {
        div.addEventListener('click', function () {
            select_woocommerce_product(this);
        });
    }
    div.className = 'formulaire-product-item';

    let image_element = document.createElement('img');
    image_element.src = product.Image === false
        ? "https://ui-avatars.com/api/?name=i+g&size=250"
        : product.Image;
    image_element.alt = product.Name;
    image_element.className = 'formulaire-product-image';

    let text_div = document.createElement('div');
    text_div.className = 'formulaire-product-text';

    // Name
    let name_element;
    if (can_be_selected) {
        name_element = document.createElement('span');
        name_element.textContent = product.Name;
    } else {
        name_element = document.createElement('input');
        name_element.value = product.Name;
    }
    name_element.className = 'formulaire-product-name';

    // Description
    let description_element;
    if (can_be_selected) {
        description_element = document.createElement('span');
        description_element.textContent = product.Description;
    } else {
        description_element = document.createElement('input');
        description_element.value = product.Description;
    }
    description_element.className = 'formulaire-product-description';

    let droite_div = document.createElement('div');
    droite_div.className = 'formulaire-actions-droite';
    
    let product_price = document.createElement('div');
    product_price.className = 'formulaire-product-price';

    let price;
    if (can_be_selected) {
        price = document.createElement('span');
        price.textContent = product.Price;
    } else {
        price = document.createElement('input');
        price.value = product.Price;
    }
    price.className = 'formulaire-product-price-value';

    let price_text = document.createElement('span');
    price_text.className = 'formulaire-product-price-text';
    price_text.textContent = '€';

    product_price.appendChild(price);
    product_price.appendChild(price_text);

    droite_div.appendChild(product_price);

    text_div.appendChild(name_element);
    text_div.appendChild(description_element);

    div.appendChild(image_element);
    div.appendChild(text_div);
    div.appendChild(droite_div);

    return div;
}

function set_element_nothing(button) {
    // add a span element to the button, not the class directly
    let span = button.querySelector('span');
    if (span) {
        span.remove();
    }
}

function set_element_error(button) {
    let span = button.querySelector('span');
    if (!span) {
        span = document.createElement('span');
        span.className = 'error-icon';
        button.appendChild(span);
    }
    span.classList.add('error-icon');
    span.classList.remove('warning-icon');
}

function set_element_warning(button) {
    let span = button.querySelector('span');
    if (!span) {
        span = document.createElement('span');
        span.className = 'warning-icon';
        button.appendChild(span);
    }
    span.classList.add('warning-icon');
    span.classList.remove('error-icon');
}


function change_post_data_value(line, value, specialKey, callback = null) {
	clearTimeout(debounceMap.get(specialKey));
	let timeout = setTimeout(() => {
		fetch(devisStepsOptions.ajaxUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				action: "dv_save_post_data",
				post_id: devisStepsOptions.postId,
				post_line: line,
				post_value: value
			})
		})
		.then(res => res.json())
		.then(data => {
			if (!data.success) {
				console.error(data.data.message);
			}
			debounceMap.delete(specialKey);
            if (callback)
                callback(data);
		});
	}, 2000);
	debounceMap.set(specialKey, timeout);
}