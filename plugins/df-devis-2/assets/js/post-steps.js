let dv_steps_container;
let current_step = 1;

(function(){
    dv_steps_container = document.querySelector('.dv-steps-container');
})();


async function dv_option_add_step(element) {
    if (dv_get_step_count() <= current_step) {
        await dv_add_step();
    }

    dv_display_step(current_step + 1, element);
}

async function dv_add_step() {
    let step_index = dv_get_step_count() + 1;
    await fetch(devisStepsOptions.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: 'dvdb_create_step',
            post_id: devisStepsOptions.postId,
            step_index: step_index,
            step_name: 'Étape ' + step_index
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error adding step:', data.data.message);
            return;
        }

        const html = data.data.html;
        const step = data.data.step;

        devisStepsOptions.data[step_index] = {
            id: step.id,
            step_name: step.step_name,
            step_index: step.step_index,
            options: [],
            product: null
        };

        const stepsContainer = dv_steps_container.querySelector('.steps-content');
        let temp = document.createElement('div');
        temp.innerHTML = html;
        const newStep = temp.firstElementChild;
        stepsContainer.appendChild(newStep);
    });
}

function dv_remove_step(element) {
    if (dv_get_step_count() <= 1) {
        alert('Il faut au moins une étape.');
        return;
    }

    const step = element.closest('.step');
    let step_index = parseInt(step.dataset.index);

    fetch(devisStepsOptions.ajaxUrl, {
        method: "POST", 
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: 'dvdb_delete_step_after_index',
            step_index: step_index,
            post_id: devisStepsOptions.postId
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error removing step:', data.data.message);
            return;
        }

        let steps = dv_steps_container.querySelectorAll('.step');
        steps.forEach((step, index) => {
            if (index >= step_index - 1) {
                step.remove();
            } else {
                step.dataset.index = index + 1; // Update the index of remaining steps
                step.className = 'step step_' + (index + 1) + (index === 0 ? ' step_first' : '');
            }
        });
        devisStepsOptions.data = devisStepsOptions.data.filter((_, index) => index < step_index - 1);
        current_step = Math.min(current_step, dv_get_step_count());
        let 
    });
}

function dv_display_option_next_step() {

}

function dv_display_step(step_index) {
    if (step_index < 1 || step_index > dv_get_step_count()) {
        console.error('Invalid step index:', step_index);
        return;
    }

    current_step = step_index;

    const option = element.closest('.option');
    const activate_id = current_step == 1 ? null : option.dataset.id;
    const step = devisStepsOptions.data[current_step];
    const step_id = step.id;

    fetch(devisStepsOptions.ajaxUrl, {
        method: "POST",    
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: 'dv_get_customizable_options',
            options: JSON.stringify(devisStepsOptions.data[current_step].options),
            activate_id: activate_id,
            step_id: step_id
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error displaying step:', data.data.message);
            return;
        }

        const html = data.data.html;
        const optionsContainer = dv_steps_container.querySelector('.options-content');
        const lastDiv = optionsContainer.lastElementChild;
        optionsContainer.innerHTML = ''; // Clear existing options
        optionsContainer.insertAdjacentHTML('beforeend', html);
        optionsContainer.appendChild(lastDiv); // Re-add the last div

        if (data.data.option) {
            devisStepsOptions.data[current_step].options.push({
                id: data.data.option.id,
                option_name: data.data.option.option_name,
                activate_id: data.data.option.activate_id,
                image_url: data.data.option.image_url,
                data: data.data.option.data,
                step_id: data.data.option.step_id
            });
        }
    });
}




function dv_add_option_to_step() {
    let activate_id = current_step == 1 ? null : null;
    let step_id = devisStepsOptions.data[current_step].id;

    fetch(devisStepsOptions.ajaxUrl, {
		method: "POST",	
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
        body: new URLSearchParams({
            action: 'dvdb_create_option',
            step_id: step_id,
            option_name: 'Option',
            activate_id: activate_id
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error adding option:', data.data.message);
            return;
        }

        const html = data.data.html;
        const option = data.data.option;

        devisStepsOptions.data[current_step].options.push(option);

        const optionsContainer = dv_steps_container.querySelector('.options-content');
        let temp = document.createElement('div');
        temp.innerHTML = html;
        const newOption = temp.firstElementChild;
        const lastDiv = optionsContainer.lastElementChild;
        optionsContainer.insertBefore(newOption, lastDiv);
    });
}

function dv_remove_option_from_step(element) {
    if (dv_get_option_count() <= 1) {
        alert('Il faut au moins une option par étape.');
        return;
    }

    const option = element.closest('.option');
    let option_id = option.dataset.id;

    fetch(devisStepsOptions.ajaxUrl, {
        method: "POST",	
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: 'dvdb_delete_option',
            option_id: option_id
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error removing option:', data.data.message);
            return;
        }

        option.remove();
        devisStepsOptions.data[current_step].options = devisStepsOptions.data[current_step].options.filter(opt => opt.id !== option_id);
    });
}

/**
 * Helper functions
 */
function dv_get_step_count() {
    return dv_steps_container.querySelectorAll('.step').length;
}

function dv_get_option_count() {
    return dv_steps_container.querySelectorAll('.option').length;
}