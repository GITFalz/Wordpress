let email_container;
let frame = null;


(function(){
    email_container = document.querySelector('.custom-email-container');   

    // Test if color input has changed
    email_container.addEventListener('input', function(e) {
        if (e.target.classList.contains('custom-email-input')) {
            update_post_data_value(e.target);
        }

        if (e.target.classList.contains('custom-email-input-checkbox')) {
            update_checkbox_value(e.target);
        }
    });

    email_container.addEventListener('click', function(e) {
        if (e.target.classList.contains('button-positioning')) {
            let line = e.target.dataset.name;
            let value = e.target.value;

            let logoValue = '';
            let titleValue = '';

            let logoLeftButton = email_container.querySelector('.button-logo-left');
            let logoCenterButton = email_container.querySelector('.button-logo-center');
            let logoRightButton = email_container.querySelector('.button-logo-right');

            let titleLeftButton = email_container.querySelector('.button-title-left');
            let titleCenterButton = email_container.querySelector('.button-title-center');
            let titleRightButton = email_container.querySelector('.button-title-right');

            if (!logoLeftButton || !logoCenterButton || !logoRightButton || !titleLeftButton || !titleCenterButton || !titleRightButton) {
                console.error('One or more buttons are missing in the email container.');
                return;
            }

            // Handle edge cases
            if (line === "_custom_email_logo_position") {
                logoValue = value;
                titleValue = email_get_title_active_value(); // Get the current title value
                if (value === 'left') {
                    logoLeftButton.classList.add('active');
                    logoCenterButton.classList.remove('active');
                    logoRightButton.classList.remove('active');
                } else if (value === 'center') {
                    logoLeftButton.classList.remove('active');
                    logoCenterButton.classList.add('active');
                    logoRightButton.classList.remove('active');
                } else if (value === 'right') {
                    logoLeftButton.classList.remove('active');
                    logoCenterButton.classList.remove('active');
                    logoRightButton.classList.add('active');
                }

                if (value === 'center') {
                    // If the logo is centered, we need to disable the left and right buttons for the title
                    titleLeftButton.classList.remove('active');
                    titleRightButton.classList.remove('active');
                    titleCenterButton.classList.add('active');

                    titleLeftButton.disabled = true; // Disable left button
                    titleRightButton.disabled = true; // Disable right button
                    titleCenterButton.disabled = false; // Enable center button
 
                    titleValue = 'center'; // Set title value to center
                    email_update_post_data_value(null, "_custom_email_title_position", titleValue, null); // Update title position to center
                } else {
                    // If the logo is not centered, we need to enable the left and right buttons for the title
                    titleLeftButton.disabled = false; // Enable left button
                    titleRightButton.disabled = false; // Enable right button
                }   
            } else if (line === "_custom_email_title_position") {
                logoValue = email_get_logo_active_value(); // Get the current logo value
                titleValue = value;
                if (value === 'left') {
                    titleLeftButton.classList.add('active');
                    titleCenterButton.classList.remove('active');
                    titleRightButton.classList.remove('active');
                } else if (value === 'center') {
                    titleLeftButton.classList.remove('active'); 
                    titleCenterButton.classList.add('active');
                    titleRightButton.classList.remove('active');
                } else if (value === 'right') {
                    titleLeftButton.classList.remove('active');
                    titleCenterButton.classList.remove('active');
                    titleRightButton.classList.add('active');
                }
            }

            if (email_get_logo_active_value() === 'center' && line !== "_custom_email_logo_position" && value !== 'center') {
                return; // If the logo is centered, we don't allow changing the title position to left or right
            }

            email_update_post_data_value(null, line, value, function(data) {
                let currentBanner = email_container.querySelector('.custom-email-banner');
                let logoElement = currentBanner.querySelector('img');
                let titleElement = currentBanner.querySelector('h1');
                let logoSrc = logoElement ? logoElement.src : '';
                let titleText = titleElement ? titleElement.textContent : '';
                let titleColor = titleElement ? titleElement.style.color : '#000000';
                let bannerColor = currentBanner.style.backgroundColor || '#004085';
                let table = renderEmailBanner(logoValue, titleValue, logoSrc, titleText, titleColor, bannerColor);
                if (currentBanner) {
                    currentBanner.replaceWith(table);
                }
                table.classList.add('custom-email-banner');
            });
        }
    });
}());

function email_get_logo_active_value() {
    let logoActive = email_container.querySelector('.button-logo-left.active, .button-logo-center.active, .button-logo-right.active');
    if (logoActive) {
        return logoActive.value;
    }
    return '';
}

function email_get_title_active_value() {
    let titleActive = email_container.querySelector('.button-title-left.active, .button-title-center.active, .button-title-right.active');
    if (titleActive) {
        return titleActive.value;
    }
    return '';
}

function update_post_data_value(element) {
    let field = element.closest('.custom-email-field');

    let line = element.dataset.name;
    let value = element.value;

    let custom_element = email_container.querySelector('.' + line);
    if (element.classList.contains('email-bg-color')) {
        custom_element.style.backgroundColor = value;
    } else if (element.classList.contains('email-color')) {
        custom_element.style.color = value;
    } else if (element.classList.contains('email-textarea')) {
        custom_element.innerHTML = value;
    } else {
        custom_element.innerHTML = value;
    }

    email_update_post_data_value(element, line, value);
}

function update_checkbox_value(element) {
    let field = element.closest('.custom-email-field');
    let line = element.dataset.name;
    let value = element.checked ? 'yes' : 'no';

    let custom_element = email_container.querySelector('.' + line);
    custom_element.classList.toggle('hidden', value !== 'yes');

    if (line === '_use_custom_email_logo') {
        devisEmailOptions.useCustomEmailLogo = value === 'yes';
    }

    email_update_post_data_value(element, line, value);
}

function email_update_post_data_value(field, line, value, callback = null) {
    ce_wait(field);
    fetch(devisEmailOptions.ajaxUrl, {
        method: 'POST',
        headers: {  
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            action: 'dv_save_post_data',
            post_id: devisEmailOptions.postId,
            post_line: line,
            post_value: value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.data.message);
        }

        if (callback) {
            callback(data);
        }
        
        ce_success(field);
    })
    .catch(error => {
        console.error('Error:', error);
        ce_fail(field);
    });
}

function ce_wait(element) {
    if (!element) {
        return;
    }
    let spinner = element.querySelector('.custom-email-spinner');
    let save_icon = element.querySelector('.custom-email-save');
    let fail_icon = element.querySelector('.custom-email-fail');
    if (spinner && save_icon && fail_icon) {
        spinner.classList.remove('hidden');
        save_icon.classList.add('hidden');
        save_icon.classList.remove('show-and-fade');
        fail_icon.classList.add('hidden');
        fail_icon.classList.remove('show-and-fade');
    }
}

function ce_success(element) {
    if (!element) {
        return;
    }
    let spinner = element.querySelector('.custom-email-spinner');
    let save_icon = element.querySelector('.custom-email-save');
    let fail_icon = element.querySelector('.custom-email-fail');
    if (spinner && save_icon && fail_icon) {
        spinner.classList.add('hidden');
        save_icon.classList.remove('hidden');
        save_icon.classList.add('show-and-fade');
        fail_icon.classList.add('hidden');
    }
}

function ce_fail(element) {
    if (!element) {
        return;
    }
    let spinner = element.querySelector('.custom-email-spinner');
    let save_icon = element.querySelector('.custom-email-save');
    let fail_icon = element.querySelector('.custom-email-fail');
    if (spinner && save_icon && fail_icon) {
        spinner.classList.add('hidden');
        save_icon.classList.add('hidden');
        fail_icon.classList.remove('hidden');
        fail_icon.classList.add('show-and-fade');
    }
}


function renderEmailBanner(logoPosition = 'left', titleAlign = 'center', logoUrl = '', title = 'Titre du devis', titleColor = '#000000', bannerColor = '#004085') {
  const table = document.createElement('table');
  table.className = 'banner-table';
  table.style.cssText = `
    width: 100%;
    background-color: ${bannerColor};
    color: #ffffff;
    border-collapse: collapse;
    height: 100px;
  `;
  table.setAttribute('cellpadding', '0');
  table.setAttribute('cellspacing', '0');
  table.setAttribute('border', '0');

  const tr = document.createElement('tr');

  const imgCell = (url, isLeft, isRight) => {
    const td = document.createElement('td');
    td.setAttribute('width', '50');
    td.setAttribute('valign', 'middle');

    // Adjust padding based on side
    const paddingLeft = isLeft ? '10px' : '0';
    const paddingRight = isRight ? '10px' : '0';
    td.style.cssText = `
      width: 50px;
      max-width: 50px;
      padding-left: ${paddingLeft};
      padding-right: ${paddingRight};
      overflow: hidden;
    `;

    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Logo';
      img.width = 50;
      img.height = 50;
        img.classList.add('_use_custom_email_logo');
        if (!devisEmailOptions.useCustomEmailLogo) {
            img.classList.add('hidden');
        }
      img.style.cssText = `
        display: block;
        border: none;
        outline: none;
        max-width: 100%;
        height: auto;
      `;
        td.appendChild(img);
      
    } else {
      const empty = document.createElement('div');
      empty.style.cssText = 'width: 50px; height: 50px;';
      td.appendChild(empty);
    }
    return td;
  };

  const contentCell = document.createElement('td');
  contentCell.style.cssText = `vertical-align: middle; padding: 10px; text-align: ${titleAlign};`;

  const titleElement = document.createElement('h1');
  titleElement.textContent = title;
  titleElement.classList.add('_custom_email_title');
  titleElement.classList.add('_custom_email_title_color');
  titleElement.style.cssText = `
    margin: 0;
    font-size: 28px;
    font-weight: bold;
    line-height: 1.1;
    color: ${titleColor};
  `;

  contentCell.appendChild(titleElement);

  // Compose based on logo position
  if (logoPosition === 'left') {
    tr.appendChild(imgCell(logoUrl, true, false));
    tr.appendChild(contentCell);
    if (titleAlign === 'center') tr.appendChild(imgCell(null, false, true));
  } else if (logoPosition === 'right') {
    if (titleAlign === 'center') tr.appendChild(imgCell(null, true, false));
    tr.appendChild(contentCell);
    tr.appendChild(imgCell(logoUrl, false, true));
  } else if (logoPosition === 'center') {
    const centerCell = document.createElement('td');
    centerCell.setAttribute('colspan', '3');
    centerCell.style.cssText = `text-align: ${titleAlign}; padding: 10px;`;

    const img = document.createElement('img');
    img.src = logoUrl;
    img.alt = 'Logo';
    img.width = 50;
    img.height = 50;
    img.classList.add('_use_custom_email_logo');
    if (!devisEmailOptions.useCustomEmailLogo) {
        img.classList.add('hidden');
    }
    img.style.cssText = `
      display: block;
      margin: 0 auto 10px;
      border: none;
      outline: none;
      max-width: 100%;
      height: auto;
    `;

    centerCell.appendChild(img);
    centerCell.appendChild(titleElement);
    tr.appendChild(centerCell);
  }

  table.appendChild(tr);
  return table;
}

function selectNewImage() {
    // use wp media uploader to select a new image
    if (frame) {
        frame.open();
        return;
    }
    frame = wp.media({
        title: 'Select or Upload a Logo',
        button: {
            text: 'Use this logo'
        },  
        multiple: false
    });
    frame.on('select', function() {
        let attachment = frame.state().get('selection').first().toJSON();
        let logoInput = document.getElementById('custom_email_logo');
        let emailLogo = document.querySelector('.custom-email-banner img');
        email_update_post_data_value(logoInput, '_custom_email_logo', attachment.url, function() {
            logoInput.src = attachment.url;
            emailLogo.src = attachment.url;
        });
    });
    frame.open();
}