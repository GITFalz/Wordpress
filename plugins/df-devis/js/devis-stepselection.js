let stepStorage;
let container;
let post_id;
let current_step;

document.addEventListener('DOMContentLoaded', () => {
	stepStorage = new Steps();
	container = document.querySelector(".devis-container");
	current_step = 0;

	container.addEventListener('click', function(e) {
		console.log("click");
		console.log(e.target.classList);
		if (e.target.classList.contains('view-devis')) {
			post_id = e.target.dataset.postid;
			console.log("test");
			render_devis(post_id);
		}
		if (e.target.classList.contains('step-box')) {
			/*
			let element = e.target;
			let index = parseInt(element.dataset.stepindex);
			if (current_step <= index)
				return;
				*/

			let steps = document.querySelectorAll(".step-box");
			if (steps.length <= 0 || current_step >= steps.length)
				return;

			for (let i = 0; i < steps.length; i++)
			{
				console.log(steps[i]);
				steps[i].classList.remove("step-select");
			}
			stepStorage.clear();
			current_step = 0;
			render_step(steps[0], 'Root');
		}
	});
});

function render_step(step_element, option_group) {
	if (step_element.dataset.steptype === "options") {					  					
	    fetch(stepData.ajaxUrl, {
        method: "POST",
	        headers: {
	            "Content-Type": "application/x-www-form-urlencoded"
	        },
	        body: new URLSearchParams({
	        	action: 'df_get_step_options_by_group',
	        	devis_id: post_id,
	        	step_index: step_element.dataset.stepindex,
	        	option_group: option_group
	        })
	    })
	    .then(res => res.json())
	    .then(data => {
	    	let element = document.querySelector(".step-info");
	    	element.dataset.stepid = current_step;
    		element.innerHTML = data.data.content;
    		set_selected_step(step_element);
	    });
	}
	else {
		fetch(stepData.stepUrl, {
        method: "POST",
	        headers: {
	            "Content-Type": "application/x-www-form-urlencoded"
	        },
	        body: new URLSearchParams({
	        	step_type: step_element.dataset.steptype,
	        	activate: 'Next'
	        })
	    })
	    .then(res => res.json())
	    .then(data => {
	    	let element = document.querySelector(".step-info");
	    	element.dataset.stepid = current_step;
    		element.innerHTML = data.content;
    		set_selected_step(step_element);

    		if (step_element.dataset.steptype === "historique") {
    			let history_entry = document.querySelector(".history-entries");
    			for (let i = 0; i < stepStorage.length(); i++) {
    				let step = stepStorage.get(i);
    				if (step instanceof StepOptions) {
    					let article = document.createElement('article');
    					let article_p = document.createElement('p');

    					article.classList.add("history-entry");
    					article_p.classList.add("history-text");

    					article_p.textContent = "Vous avez choisi l'option "+step.option_name+" dans l'étape "+(step.index+1);

    					article.append(article_p);
    					history_entry.append(article);
    				}
    			}
    		}
	    });
	}
}

function get_selected_step()
{
	for (let i = 0; i < steps.length; i++)
	{
		if (steps[i].classList.contains("step-select")) {
			return steps[i];
		}
	}
}

function render_devis(postid) 
{
	fetch_call(stepData.ajaxUrl, new URLSearchParams({ action: "render_devis_data", post_id: parseInt(postid) }), data => {
		if (!data.success)
			return;
		container.innerHTML = data.data.page;
		let steps = document.querySelectorAll(".step-box");
		if (steps.length <= 0)
			return;

		render_step(steps[0], 'Root');
	});
}	

function option_select(element, name, id) {
	let step = new StepOptions("step"+current_step, current_step, name, id);
	stepStorage.add(step);
	next_step(element);
}

function history_select(element, display_type) {
	let step = new StepHistory("step"+current_step, current_step, display_type);
	stepStorage.add(step);
	next_step(element);
}

function next_step(element)
{
	current_step++;
	let steps = document.querySelectorAll(".step-box");
	if (steps.length <= 0 || current_step >= steps.length)
		return;

	render_step(steps[current_step], element.dataset.activate);
}

function set_selected_step(step_element) {
	let steps = document.querySelectorAll(".step-box");
	if (steps.length <= 0 || current_step >= steps.length)
		return;

	for (let i = 0; i < steps.length; i++) {
		steps[i].classList.remove("step-select");
	}

	if (step_element.classList.contains("step-box"))
		step_element.classList.add("step-select");
}

function fetch_call(link, body, callback, debug = false)
{
    return fetch(link, {
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