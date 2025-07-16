let container;
let product_container;
let product_input;
let product_error;
let product_list;
let debounceTimeout;

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
                console.warn('Product name is empty, skipping fetch.');
            }
        }, 300);
    });
})();

function get_product_info(name) {
    fetch(stepData.ajaxUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ 
            action: "df_get_products",
            name: name
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error fetching products:', data.data.message);
            return;
        }

        if (data.data.type === 'fake') {
            product_error.textContent = 'You likely have not activated the WooCommerce plugin. Fake products have been returned for testing purposes.';
        } else {
            product_error.textContent = '';
        }

        product_list.innerHTML = ''; // Clear previous results
        let products = data.data.data.products;
        for (let i = 0; i < products.length; i++) {
            let product = products[i];
            let div = document.createElement('div');
            div.className = 'product-item';

            let image_element = document.createElement('img');
            image_element.src = product.Image;
            image_element.alt = product.Name;
            image_element.className = 'product-image';

            let name_element = document.createElement('p');
            name_element.textContent = product.Name;
            name_element.className = 'product-name';

            let price_element = document.createElement('p');
            price_element.textContent = product.Price;
            price_element.className = 'product-price';

            let description_element = document.createElement('p');
            description_element.textContent = product.Description;
            description_element.className = 'product-description';

            div.appendChild(image_element);
            div.appendChild(name_element);
            div.appendChild(price_element);
            div.appendChild(description_element);

            product_list.appendChild(div);
        }
    });
}