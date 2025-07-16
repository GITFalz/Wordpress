let product_container;
let product_input;
let product_error;
let product_list;
let product_pet_page;
let product_page_number;
let debounceTimeout;
let product_per_page_debounceTimeout;
let product_page_number_debounceTimeout;

let selected_product_ids = {};
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
            const name = product_input.value.trim();
            if (name.length > 0) {
                document.getElementById('product-page-number').value = 1;
                get_product_info(name);
            } else {
                product_list.innerHTML = '';
                product_error.textContent = '';
                product_page_number.parentElement.hidden = true;
                product_previous.hidden = true;
                product_next.hidden = true;
            }
        }, 300);
    });

    product_pet_page.addEventListener('input', function() {
        clearTimeout(product_per_page_debounceTimeout);
        product_per_page_debounceTimeout = setTimeout(() => {
            const name = product_input.value.trim();
            if (name.length > 0) {
                document.getElementById('product-page-number').value = 1;
                get_product_info(name);
            } else {
                product_list.innerHTML = '';
                product_error.textContent = '';
            }
        }, 300);
    });

    product_page_number.addEventListener('input', function() {
        clearTimeout(product_page_number_debounceTimeout);
        product_page_number_debounceTimeout = setTimeout(() => {
            const name = product_input.value.trim();
            if (name.length > 0) {
                get_product_info(name);
            } else {
                product_list.innerHTML = '';
                product_error.textContent = '';
                product_page_number.value = 1;
            }
        }, 300);
    });

    product_previous.addEventListener('click', function() {
        if (current_page > 1) {
            current_page--;
            product_page_number.value = current_page;
            const name = product_input.value.trim();
            get_product_info(name);
        }
    });

    product_next.addEventListener('click', function() {
        if (current_page < max_pages) {
            current_page++;
            product_page_number.value = current_page;
            const name = product_input.value.trim();
            get_product_info(name);
        }
    });

})();

function select_product(product_element) {
    let product_id = product_element.dataset.productId;
    let product_name = product_element.querySelector('.product-name').textContent;
    let product_description = product_element.querySelector('.product-description').textContent;
    let product_image = product_element.querySelector('.product-image').src;

    if (selected_product_ids[product_id]) {
        delete selected_product_ids[product_id];
        product_element.classList.remove('product-selected');
    }
    else {
        selected_product_ids[product_id] = {
            id: product_id,
            name: product_name,
            description: product_description,
            image: product_image
        };
        product_element.classList.add('product-selected');
    }
}

function get_product_info(name) {
    fetch(stepData.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ 
            action: "df_get_products",
            name: name,
            p_per_page: document.getElementById('product-product-per-page').value || 10,
            page_number: document.getElementById('product-page-number').value || 1
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

    return div;
}