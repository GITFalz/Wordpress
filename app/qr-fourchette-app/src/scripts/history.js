const dashboardContent = document.querySelector('#dashboard-content');
dashboardContent.addEventListener('htmx:afterSwap', (event) => {
    if (event.target.id === 'dashboard-content') {
        const hash = location.hash || '';
        const parts = hash.replace(/^#\/?/, '').split('/');
        if (parts[0] === 'edit-carte') {
            if (parts[1] === 'menus')
            {
                htmx.ajax('GET', '/partials/edit/menu/menus', {
                    target: '#edit-carte-content',
                    swap: 'innerHTML',
                });
            }
            if (parts[1] === 'produits')
            {
                htmx.ajax('GET', '/partials/edit/categories/produits', {
                    target: '#edit-carte-content',
                    swap: 'innerHTML',
                });
            }
        }
    }
});

// Trigger initial load
const hash = location.hash || '';
const parts = hash.replace(/^#\/?/, '').split('/');
if (parts[0] === 'edit-carte') {
    htmx.ajax('GET', '/partials/edit/edit-carte', {
        target: '#dashboard-content',
        swap: 'innerHTML',
    });
}