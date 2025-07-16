let container;
let product_container;
let product_input;
let product_error;
let product_list;
let debounceTimeout;
let current_product_id = null;

(function(){
    container = document.querySelector('.nutricode-meta-box');
    product_container = document.getElementById('product-inspector');
    product_input = document.getElementById('product-search');
    product_error = document.getElementById('product-error');
    product_list = document.getElementById('product-list');

    product_input.addEventListener('input', function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const name = product_input.value.trim();
            if (name.length > 0) {
                get_product_info(name);
            } else {
                product_list.innerHTML = '';
                product_error.textContent = '';
            }
        }, 300);
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
                select_product(div);
            } else {
                console.warn('No fake product found with ID:', current_product_id);
            }
        });
    }
})();

function select_product(product_element) {
    let product_id = product_element.dataset.productId;

    let product_id_element = document.getElementById('nutricode_product_id');

    if (product_id_element) {
        product_id_element.value = product_id;
        product_element.classList.add('product-selected');
        product_list.querySelectorAll('.product-item').forEach(item => {
            if (item !== product_element) {
                item.classList.remove('product-selected');
            }
        });
    } else {
        console.error('Product ID or type input elements not found.');
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
        console.log('Products data:', data);
        if (!data.success) {
            console.error('Error fetching products:', data.data.message);
            return;
        }

        if (data.data.type === 'fake') {
            product_error.textContent = 'You have likely not activated the WooCommerce plugin. Fake products have been returned for testing purposes.';
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
    });
}

function get_product_html(product, type) {
    let div = document.createElement('div');
    div.dataset.productId = product.ID;
    div.dataset.productType = type;
    div.addEventListener('click', function() {
        select_product(this);
    });
    div.className = 'product-item';
    if (current_product_id && current_product_id === product.ID) {
        div.classList.add('product-selected');
    }

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