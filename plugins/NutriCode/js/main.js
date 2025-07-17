let product_container;
let product_input;
let product_error;
let product_list;
let product_pet_page;
let product_page_number;
let debounceTimeout;
let product_per_page_debounceTimeout;
let product_page_number_debounceTimeout;

let current_product_id = null;
let max_pages = 1;
let current_page = 1;


(function(){
    product_input = document.getElementById('product-search');
    product_error = document.getElementById('product-error');
    product_list = document.getElementById('product-list');

    product_container = document.getElementById('product-inspector');

    product_pet_page = document.getElementById('product-product-per-page');
    product_page_number = document.getElementById('product-page-number');

    product_previous = document.getElementById('product-page-previous');    
    product_next = document.getElementById('product-page-next');

    product_input.addEventListener('input', function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            let name = product_input.value.trim();
            if (name.length > 0) {
                document.getElementById('product-page-number').value = 1;
                if (name.endsWith('-fake')) {
                    name = name.slice(0, -5).trim();
                    get_product_info(name, true);
                    product_error.textContent = "Des produits fictifs ont été renvoyés à des fins de test.";
                } else {
                    get_product_info(name);
                    product_error.textContent = '';
                }
            } else {
                delete_list_not_selected();
                product_error.textContent = '';
                product_page_number.parentElement.hidden = true;
                product_previous.hidden = true;
                product_next.hidden = true;
            }
        }, 600);
    });

    product_pet_page.addEventListener('input', function() {
        clearTimeout(product_per_page_debounceTimeout);
        product_per_page_debounceTimeout = setTimeout(() => {
            let name = product_input.value.trim();
            if (name.length > 0) {
                document.getElementById('product-page-number').value = 1;
                if (name.endsWith('-fake')) {
                    name = name.slice(0, -5).trim();
                    get_product_info(name, true);
                    product_error.textContent = "Des produits fictifs ont été renvoyés à des fins de test.";
                } else {
                    get_product_info(name);
                    product_error.textContent = '';
                }
            } else {
                delete_list_not_selected();
                product_error.textContent = '';
            }
        }, 600);
    });

    product_page_number.addEventListener('input', function() {
        clearTimeout(product_page_number_debounceTimeout);
        product_page_number_debounceTimeout = setTimeout(() => {
            let name = product_input.value.trim();
            if (name.length > 0) {
                if (name.endsWith('-fake')) {
                    name = name.slice(0, -5).trim();
                    get_product_info(name, true);
                    product_error.textContent = "Des produits fictifs ont été renvoyés à des fins de test.";
                } else {
                    get_product_info(name);
                    product_error.textContent = '';
                }
            } else {
                delete_list_not_selected();
                product_error.textContent = '';
                product_page_number.value = 1;
            }
        }, 600);
    });

    product_previous.addEventListener('click', function() {
        if (current_page > 1) {
            current_page--;
            product_page_number.value = current_page;
            let name = product_input.value.trim();
            if (name.endsWith('-fake')) {
                name = name.slice(0, -5).trim();
                get_product_info(name, true);
                product_error.textContent = "Des produits fictifs ont été renvoyés à des fins de test.";
            } else {
                get_product_info(name);
                product_error.textContent = '';
            }
        }
    });

    product_next.addEventListener('click', function() {
        if (current_page < max_pages) {
            current_page++;
            product_page_number.value = current_page;
            let name = product_input.value.trim();
            if (name.endsWith('-fake')) {
                name = name.slice(0, -5).trim();
                get_product_info(name, true);
                product_error.textContent = "Des produits fictifs ont été renvoyés à des fins de test.";
            } else {
                get_product_info(name);
                product_error.textContent = '';
            }
        }
    });

    let product_id_element = document.getElementById('nutricode_product_id');

    if (product_id_element) {
        current_product_id = parseInt(product_id_element.value);
        if (!current_product_id || isNaN(current_product_id) || current_product_id <= 0) {
            current_product_id = null;
            return;
        }

        fetch(stepData.ajaxUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ 
                action: "df_get_product_by_id",
                id: current_product_id
            })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                console.error('Error fetching fake product:', data.data.message);
                return;
            }
            let product = data.data.data;
            if (product) {
                let div = get_product_html(product, 'fake');
                product_list.appendChild(div);
                set_side_product_info(stepData.image, stepData.name, stepData.description);
            } else {
                console.warn('No fake product found with ID:', current_product_id);
            }
        });
    }
})();

function delete_list_not_selected() {
    let product_elements = document.querySelectorAll('.product-item');
    product_elements.forEach(el => {
        if (!el.classList.contains('product-selected')) {
            el.remove();
        }
    });
}

function select_product(product_element) {
    let product_id = product_element.dataset.productId;

    let product_id_element = document.getElementById('nutricode_product_id');

    if (product_id_element) {
        product_id_element.value = product_id;
        product_element.classList.add('product-selected');

        let product_name = product_element.querySelector('.product-name').textContent;
        let product_description = product_element.querySelector('.product-description').textContent;
        let product_image = product_element.querySelector('.product-image').src;

        set_side_product_info(product_image, product_name, product_description);

        product_list.querySelectorAll('.product-item').forEach(item => {
            if (item !== product_element) {
                item.classList.remove('product-selected');
            }
        });
    } else {
        console.error('Product ID or type input elements not found.');
    }   
}

function set_side_product_info(src, name, description) {
    console.log('Setting side product info:', src, name, description);
    let product_image_element = document.getElementById('selected-product-image');
    let nutricode_product_image = document.getElementById('nutricode_product_image');
    let product_name_element = document.getElementById('selected-product-name');
    let product_description_element = document.getElementById('selected-product-description');

    if (product_image_element && nutricode_product_image && product_name_element && product_description_element) {
        product_image_element.src = src;
        nutricode_product_image.value = src;
        product_name_element.value = name;
        product_description_element.textContent = description;
    } else {
        console.error('One or more side product info elements not found.');
    }
}

function get_product_info(name, add_fake = false) {
    fetch(stepData.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ 
            action: "df_get_products",
            name: name,
            p_per_page: document.getElementById('product-product-per-page').value || 10,
            page_number: document.getElementById('product-page-number').value || 1,
            add_fake: add_fake ? 'true' : 'false'
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Products fetched:', data);
        if (!data.success) {
            console.error('Error fetching products:', data.data.message);
            return;
        }

        if (data.data.type === 'fake') {
            product_error.textContent = "Vous n'avez probablement pas activé le plugin WooCommerce. Des produits fictifs ont été renvoyés à des fins de test.";
        } else {
            product_error.textContent = '';
        }

        product_list.innerHTML = '';
        let products = data.data.data.products;
        for (let i = 0; i < products.length; i++) {
            let product = products[i];
            let div = get_product_html(product, data.data.type);
            product_list.appendChild(div);
        }

        max_pages = parseInt(data.data.data.max_pages);
        current_page = parseInt(data.data.data.current_page);

        check_page_number_visibility(current_page, max_pages);
    });
}

function check_page_number_visibility(current_page, max_pages) {
    console.log('Current page:', current_page, 'Max pages:', max_pages);
    let previous_button = document.getElementById('product-page-previous');
    let next_button = document.getElementById('product-page-next');
    let product_page_number = document.getElementById('product-page-number');

    if (max_pages <= 1) {
        previous_button.hidden = true;
        next_button.hidden = true;
        product_page_number.parentElement.hidden = true;
        return;
    } else {
        product_page_number.parentElement.hidden = false;
    }

    if (current_page === 1) {
        previous_button.hidden = true;
    } else {
        previous_button.hidden = false;
    }

    if (current_page >= max_pages) {
        next_button.hidden = true;
    } else {
        next_button.hidden = false;
    }

    product_page_number.value = current_page;
    product_page_number.max = max_pages;
    product_page_number.min = 1;
}

function get_product_html(product, type) {
    let div = document.createElement('div');
    div.dataset.productId = product.ID;
    div.dataset.productType = type;
    div.addEventListener('click', function() {
        select_product(this);
    });
    div.className = 'product-item';

    let image_element = document.createElement('img');
    image_element.src = product.Image === false ? "https://ui-avatars.com/api/?name=i+g&size=250" : product.Image;
    image_element.alt = product.Name;
    image_element.className = 'product-image';

    let name_element = document.createElement('p');
    name_element.textContent = product.Name;
    name_element.className = 'product-name';

    let description_element = document.createElement('p');
    description_element.innerHTML = product.Description;
    description_element.className = 'product-description';

    div.appendChild(image_element);
    div.appendChild(name_element);
    div.appendChild(description_element);

    if (current_product_id && current_product_id === product.ID) {
        select_product(div);
    }

    return div;
}