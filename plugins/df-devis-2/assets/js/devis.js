let currentStepIndex = 1;

function dv_afficher_post(postId) {
    fetch(dfDevisData.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: "dv_display_post",
            post_id: postId
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error(data.data.message);
            return;
        }   

        dfDevisData.postId = postId;
        dfDevisData.history = data.data.history || [];
        dfDevisData.generateHistory = data.data.generateHistory || false;
        dfDevisData.addRedirectionPage = data.data.addRedirectionPage || false;
        dfDevisData.redirectionType = data.data.redirectionType || 'new step';
        dfDevisData.nomEtapeHistorique = data.data.nomEtapeHistorique || 'Historique';
        dfDevisData.nomEtapeFormulaire = data.data.nomEtapeFormulaire || 'Formulaire';
        dfDevisData.nomEtapeRedirection = data.data.nomEtapeRedirection || 'Redirection';

        document.querySelector('.df-devis-main-container').innerHTML = data.data.html;
    })
}

function selectStep(element) {
    console.log(dfDevisData);
    let stepIndex = parseInt(element.dataset.index);
    if (isNaN(stepIndex)) {
        console.error('Invalid step index:', element.dataset.index);
        return;
    }

    if (stepIndex >= currentStepIndex) {
        return; // Ignore clicks on future steps
    }

    dfDevisData.history = dfDevisData.history.slice(0, stepIndex);
    let latest = dfDevisData.history[dfDevisData.history.length - 1];
    if (latest && latest.stepId) {
        devis_loading_start();
        fetch(dfDevisData.ajaxUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action: "dv_get_first_step_content_html",
                post_id: dfDevisData.postId
            })
        })
        .then(res => res.json())
        .then(data => {
            devis_loading_stop();
            if (!data.success) {
                console.error(data.data.message);
                return;
            }

            let html = data.data.html;
            let optionsContent = document.querySelector('.df-devis-options');
            optionsContent.innerHTML = html;
            currentStepIndex = stepIndex;
            updateStepClasses();
        });
    } else if (latest && latest.optionId) {
        dfDevisData.history.pop();
        let temp = document.createElement('div');
        temp.dataset.id = latest.optionId;
        currentStepIndex = stepIndex-1;
        selectOption(temp);
    } else if (latest && latest.historyId) {
        let temp = document.createElement('div');
        temp.dataset.id = latest.historyId;
        currentStepIndex = stepIndex-1;
        next_history(temp);
    }
}

function selectOption(element) {
    let id = element.dataset.id;
    devis_loading_start();
    fetch(dfDevisData.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: "dv_get_option_step_content_html",
            option_id: id,
            generate_history: dfDevisData.generateHistory ? 'true' : 'false',
        })
    })
    .then(res => res.json())
    .then(data => {
        devis_loading_stop();
        if (!data.success) {
            console.error(data.data.message);
            return;
        }

        dfDevisData.history.push({
            optionId: id,
        });

        let html = data.data.html;
        let optionsContent = document.querySelector('.df-devis-options');
        optionsContent.innerHTML = html;

        currentStepIndex++;
        updateStepClasses();
        let type = data.data.type;
        let name = data.data.name;
        if (type === 'product') {
            if (dfDevisData.generateHistory) {
                name = dfDevisData.nomEtapeHistorique || 'Historique';
            } else {
                name = dfDevisData.nomEtapeFormulaire || 'Formulaire';
            }
        }

        let currentStep = document.querySelector('.df-devis-step.step-current');
        let title = currentStep.querySelector('h2');
        title.textContent = name;
    });
}
function next_history(element) {
    let stepId = element.dataset.id;
    devis_loading_start();
    fetch(dfDevisData.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: "dv_get_form_html",
            step_id: stepId,
            post_id: dfDevisData.postId,
        })
    })
    .then(res => res.json())
    .then(data => {
        devis_loading_stop();
        if (!data.success) {
            console.error(data.data.message);
            return;
        }

        dfDevisData.history.push({
            historyId: stepId,
        });

        let html = data.data.html;
        let optionsContent = document.querySelector('.df-devis-options');
        optionsContent.innerHTML = html;

        currentStepIndex++;
        updateStepClasses();
        let currentStep = document.querySelector('.df-devis-step.step-current');
        let title = currentStep.querySelector('h2');
        title.textContent = dfDevisData.nomEtapeFormulaire || 'Formulaire';
    })
    .catch(error => {
        console.error('Error fetching history step content:', error);
    });
}

function updateStepClasses() {
    let steps = document.querySelectorAll('.df-devis-step');
    steps.forEach((step, index) => {
        if (index + 1 < currentStepIndex) {
            step.classList.remove('step-next', 'step-current');
            step.classList.add('step-previous');
        } else if (index + 1 === currentStepIndex) {
            step.classList.remove('step-next', 'step-previous');
            step.classList.add('step-current');
        } else {
            step.classList.remove('step-current', 'step-previous');
            step.classList.add('step-next');
        }
    });
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
	formData.append('post_id', dfDevisData.postId);
	formData.append('step_id', formulaire.dataset.id);
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

	fetch(dfDevisData.ajaxUrl, {
		method: 'POST',
		body: formData
	})	
	.then(res => res.json())
	.then(data => {
		if (!data.success) {
            console.error(data.data.message);
            dv_show_popup(dfDevisData.titreEmailErreur ?? 'Une erreur est survenue', data.data.alert);
            return;
        }


        console.log("Email sent successfully:", data);
        console.log(dfDevisData.addRedirectionPage);
        console.log(dfDevisData.redirectionType);

        let redirection = dfDevisData.redirectionType;
        if (redirection === 'new step') {
            page_redirection();
        } else {
            window.history.back();
        }
	})
	.catch(error => {
		dv_show_popup(dfDevisData.titreEmailErreur ?? 'Une erreur est survenue', 'Une erreur s\'est produite lors de l\'envoi de l\'email.' + error.message);
	});
}

function page_redirection() {
    devis_loading_start();
    fetch(dfDevisData.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: "dv_get_redirection_html",
            post_id: dfDevisData.postId
        })
    })
    .then(res => res.json())
    .then(data => {
        devis_loading_stop();
        console.log("Redirection page content:", data);
        if (!data.success) {
            console.error(data.data.message);
            dv_show_popup(dfDevisData.titreEmailErreur ?? 'Une erreur est survenue', data.data.message);
            return;
        }

        currentStepIndex++; 
        updateStepClasses();

        let html = data.data.html;
        let optionsContent = document.querySelector('.df-devis-options');
        optionsContent.innerHTML = html;

        let currentStep = document.querySelector('.df-devis-step.step-current');
        let title = currentStep.querySelector('h2');
        title.textContent = dfDevisData.nomEtapeRedirection || 'Redirection';
    })
    .catch(error => {
        console.error('Error fetching redirection page content:', error);
        dv_show_popup(dfDevisData.titreEmailErreur ?? 'Une erreur est survenue', 'Une erreur s\'est produite lors de la récupération de la page de redirection.');
    });
}

function dv_close_popup() {
    let popup = document.querySelector('.df-pop-up');
    if (popup) {
        popup.classList.remove('show');
        popup.classList.add('hidden');
    }
}

function dv_show_popup(title, message) {
    let popup = document.querySelector('.df-pop-up');
    if (popup) {
        let titleElement = popup.querySelector('.df-pop-up-title');
        let messageElement = popup.querySelector('.df-pop-up-options');

        if (titleElement) {
            titleElement.textContent = title || 'Attention!';
        }
        if (messageElement) {
            messageElement.textContent = message || 'Alert';
        }

        popup.classList.remove('hidden');
        popup.classList.add('show');
    }
}

function devis_loading_start() {
    let loading = document.querySelector('.df-devis-loading');
    if (loading) {
        loading.classList.remove('hidden');
    }

    let optionsContent = document.querySelector('.df-devis-options');
    if (optionsContent) {
        let allDirectDivs = optionsContent.querySelectorAll('div');
        allDirectDivs.forEach(div => {
            div.classList.add('disappear');
        });
    }
}

function devis_loading_stop() {
    let loading = document.querySelector('.df-devis-loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}