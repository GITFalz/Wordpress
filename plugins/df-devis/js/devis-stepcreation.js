let container;
let steps_container;
let debounceMap;

(function(){
container = document.querySelector('.devis-container');
steps_container = document.querySelector('.steps-container');
debounceMap = new Map();

// Remove Step
container.addEventListener('click', function(e) {
	/*if(e.target.classList.contains('re-base')) {
		console.log("re");
		ajax_call(new URLSearchParams({ action: "dfdb_delete_database" }), data => {
			console.log(data.data.message);
			if (data.success) {
				ajax_call(new URLSearchParams({ action: "dfdb_create_database" }), null);
			}
		});
	}*/	
    if(e.target.classList.contains('remove-step')) {
        remove_step_options(e.target);
    }
    if(e.target.classList.contains('remove-option')) {
        remove_option(e.target);
    }
    if(e.target.classList.contains('add-option')) {
        add_option(e.target);
    }
    if(e.target.classList.contains('add-step')) {
        add_option_step(e.target);
    }
    if(e.target.classList.contains('add-history-step')) {
        add_history_step(e.target);
    }
});

container.addEventListener('change', function(e) {
	if(e.target.classList.contains('devis-step-selection')) {
		const stepDiv = e.target.closest('.devis-step');

		let select = e.target.value;
		toggle_containers(select);
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

updateNames();
})();

function view_option(e, element) {
	if (e.target.closest('input, textarea, select, button'))
		return;

	 add_option_step(element.querySelector(".add-step"));
}

function toggle_containers(select) {
	if (select === 'options') {
		optionContainer.classList.remove('hidden');
		historiqueContainer.classList.add('hidden');
		formulaireContainer.classList.add('hidden');
	}
	else if (select === 'historique') {
		optionContainer.classList.add('hidden');
		historiqueContainer.classList.remove('hidden');
		formulaireContainer.classList.add('hidden');
	}
	else if (select === 'formulaire') {
		optionContainer.classList.add('hidden');
		historiqueContainer.classList.add('hidden');
		formulaireContainer.classList.remove('hidden');
	}
}

function add_option_step(target) {
	let stepindex = parseInt(target.dataset.stepindex)+1;
	let stepDiv = document.getElementById('step_' + stepindex);
	if (!stepDiv) {
		console.log("Creating div");
		ajax_call(
    		new URLSearchParams({ 
    			action: "df_update_option_activate_group",
    			option_id: parseInt(target.parentElement.dataset.id),
    			activate_group: target.dataset.activate
    		}), data => 
    		{
    			let newStep = document.createElement('div');
			    newStep.className = 'devis-step';
			    newStep.id = 'step_' + stepindex;
			    newStep.dataset.id = stepindex;
			    newStep.dataset.group = target.dataset.activate;
			    newStep.addEventListener('click', (event) => { show_step(event, newStep); });
			    newStep.innerHTML = `
			        <label>Step Name:
						<input type="text" name="step_name" value="">
			    	</label>
					<label>Type:
					    <select class="devis-step-selection" id="step-select" name="step_type">
					        <option value="options">Options</option>
					        <option value="historique">Historique</option>
					        <option value="formulaire">Formulaire</option>
					    </select>
					</label>

					<button data-stepindex="${stepindex}" type="button" class="remove-step"></button>
			    `;

			    steps_container.appendChild(newStep);
			    updateNames();
			    display_step(stepindex, target.dataset.activate);
            }
        );	
	}
	else {
		console.log("Update activate");
		console.log(parseInt(target.parentElement.dataset.id));
		console.log(target.dataset.activate);
		ajax_call(
    		new URLSearchParams({ 
    			action: "df_update_option_activate_group",
    			option_id: parseInt(target.parentElement.dataset.id),
    			activate_group: target.dataset.activate
    		}), data => 
    		{
    			stepDiv.dataset.group = target.dataset.activate;
				display_step(stepindex, target.dataset.activate);
            }
        );	
		
	}
}

function add_history_step(target) {
	let stepindex = parseInt(target.dataset.stepindex)+1;
	let stepDiv = document.getElementById('step_' + stepindex);
	if (!stepDiv) {
		console.log("Creating div");
		let newStep = document.createElement('div');
	    newStep.className = 'devis-step';
	    newStep.id = 'step_' + stepindex;
	    newStep.dataset.id = stepindex;
	    newStep.dataset.group = "Next";
	    newStep.addEventListener('click', (event) => { show_step(event, newStep); });
	    newStep.innerHTML = `
	        <label>Step Name:
				<input type="text" name="step_name" value="">
	    	</label>
			<label>Type:
			    <select class="devis-step-selection" id="step-select" name="step_type">
			        <option value="options">Options</option>
			        <option value="historique">Historique</option>
			        <option value="formulaire">Formulaire</option>
			    </select>
			</label>

			<button data-stepindex="${stepindex}" type="button" class="remove-step"></button>
	    `;

	    steps_container.appendChild(newStep);
	    updateNames();
	    display_step(stepindex, "Next");
	}
	else {
		console.log("Update activate");
		console.log(parseInt(target.parentElement.dataset.id));
		console.log(target.dataset.activate);
		stepDiv.dataset.group = target.dataset.activate;
		display_step(stepindex, "Next");
	}
}

function show_all_options()
{
	ajax_call(
		new URLSearchParams({ 
			action: "dfdb_get_JSON_options",
			devis_id: parseInt(post_id)
		}), data => 
		{
			if (!data.success)
    			return false;

    		let options = data.data.options;
    		var length = Object.keys(options).length;

			optionContainer.innerHTML = "";
			historiqueContainer.innerHTML = "";
			formulaireContainer.innerHTML = "";

			for (let i = 0; i < length; i++) {
				let option = JSON.parse(options[i]);
				optionContainer.innerHTML += `
					<div data-id="${option["id"]}" class="option" onclick="view_option(event, this)">
	                	<label>Option Name: 
				            <input class="set-name" type="text" name="${option["option_name"]}" value="${option["option_name"]}">
				        </label>              
	                    <button type="button" class="remove-option">Remove Option</button>
	                    <button type="button" data-stepindex="${option["step_index"]}" data-group="${option["option_group"]}" data-activate="gp_${option["id"]}" class="add-step">Add Step</button>
	                </div>	
				`;
			}
        }
    );
}

function show_step(e, element) {
	if (e.target.closest('input, textarea, select, button'))
		return;

	display_step(element.dataset.id, element.dataset.group);
}

function display_step(stepindex, group) {
	let stepDiv = document.getElementById("step_"+stepindex);
	let selected = stepDiv.querySelector("select").value;
	console.log(selected);
	if (selected === "options")
	{
		ajax_call(
			new URLSearchParams({ 
				action: "dfdb_get_step_JSON_options_by_group",
				devis_id: parseInt(post_id),
				step_index: parseInt(stepindex),
				option_group: group
			}), data => 
			{
				if (!data.success)
        			return false;

        		let options = data.data.options;
        		var length = Object.keys(options).length;

				toggle_containers(selected);

				optionContainer.innerHTML = "";
				for (let i = 0; i < length; i++) {
					let option = JSON.parse(options[i]);
					optionContainer.innerHTML += `
						<div data-id="${option["id"]}" class="option">
		                	<label>Option Name: 
					            <input class="set-name" type="text" name="${option["option_name"]}" value="${option["option_name"]}">
					        </label>              
		                    <button type="button" class="remove-option">Remove Option</button>
		                    <button type="button" data-stepindex="${stepindex}" data-group="${group}" data-activate="gp_${option["id"]}" class="add-step">Add Step</button>
		                </div>	
					`;
				}

				optionContainer.innerHTML += '<button data-stepindex="'+stepindex+'" type="button" class="add-option">Add Option</button>';
	        }
	    );
	}
	else if (selected === "historique")
	{
		toggle_containers(selected);
		optionContainer.innerHTML = '<button data-stepindex="'+stepindex+'" type="button" class="add-option">Add Option</button>';
		historiqueContainer.innerHTML = `
			<h2 class="history-title">Selection History</h2>
                
            <div class="history-entries">
                <div class="history-entry">
                    <div class="history-date">2024-01-15 14:30</div>
                    <div class="history-action">Selected: Sol Option</div>
                    <div class="history-details">User chose "Carrelage Premium" from the flooring options. This selection affects the overall pricing and installation timeline.</div>
                </div>
                
                <div class="history-entry">
                    <div class="history-date">2024-01-15 14:32</div>
                    <div class="history-action">Selected: Toit Option</div>
                    <div class="history-details">User selected "Tuiles Rouges Traditionnelles" for the roofing material. Compatible with the chosen flooring option.</div>
                </div>
                
                <div class="history-entry">
                    <div class="history-date">2024-01-15 14:35</div>
                    <div class="history-action">Modified: Custom Option</div>
                    <div class="history-details">User customized the "Fenêtres" option with double-glazing and wooden frames. Added +15% to base price.</div>
                </div>
                
                <div class="history-entry">
                    <div class="history-date">2024-01-15 14:38</div>
                    <div class="history-action">Removed: Previous Selection</div>
                    <div class="history-details">User removed the "Isolation Standard" option and upgraded to "Isolation Premium" for better energy efficiency.</div>
                </div>
            </div>
            <button type="button" data-stepindex="${stepindex}" data-activate="Next" class="add-history-step">Add Step</button>
		`;
	}
	else if (selected === "formulaire")
	{
		toggle_containers(selected);
		optionContainer.innerHTML = '<button data-stepindex="'+stepindex+'" type="button" class="add-option">Add Option</button>';
	}
}

function add_option(target) {
	let stepDiv = document.getElementById("step_"+target.dataset.stepindex);
	let group = stepDiv.dataset.group;
	ajax_call(
		new URLSearchParams({ 
			action: "df_insert_option",
			devis_id: parseInt(post_id),
			step_index: parseInt(target.dataset.stepindex),
			option_name: 'option',
			activate_group: '',
			option_group: group
		}), data => 
		{
			if (!data.success)
        		return false;

			let optionsContainer = target.closest('.options-container');

            let newOption = document.createElement('div');
            newOption.className = 'option';
            newOption.dataset.id = data.data.id;
            newOption.innerHTML = `
                <label>Option Name: 
		            <input class="set-name" type="text" value="option">
		        </label>	                         
                <button type="button" class="remove-option">Remove Option</button>
                <button type="button" data-stepindex="${target.dataset.stepindex}" data-group="${group}" data-activate="gp_${data.data.id}" class="add-step">Add Step</button>
            `;
            optionsContainer.insertBefore(newOption, target);
        }
    );
}

function remove_option(target) {
	ajax_call(
		new URLSearchParams({ 
			action: "dfdb_delete_option",
			option_id: parseInt(target.parentElement.dataset.id)
		}), data => 
		{
			console.log(data.data.message);
			if (!data.success)
        		return false;

			target.parentElement.remove();
        }			            
    );
}

function remove_step_options(target) {
	ajax_call(
		new URLSearchParams({ 
			action: "dfdb_delete_step_options",
			devis_id: parseInt(post_id),
			step_index: parseInt(target.dataset.stepindex)
		}), data => 
		{
			console.log(data.data.message);
			if (!data.success)
        		return false;

			target.closest(".devis-step").remove();
			display_step(0, "Root");
        }			            
    );
}

function updateNames(){
    // Update all input/select names to keep them in correct array format for PHP to parse
    let steps = container.querySelectorAll('.devis-step');
    steps.forEach(function(step, stepIndex){
        let step_inputs = step.querySelectorAll('input[type="text"], select');
        step_inputs[0].setAttribute('name', `devis_steps_options[${stepIndex}][step_settings][step_name]`);
        step_inputs[1].setAttribute('name', `devis_steps_options[${stepIndex}][step_settings][step_type]`);
    });
}

function ajax_call(body, callback, debug = false)
{
    return fetch(stepData.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body
    })
    .then(res => res.json())
    .then(data => {
    	if (debug)
    		console.log(data.data.message);					   

    	if (callback)
    		callback(data);
    });
}