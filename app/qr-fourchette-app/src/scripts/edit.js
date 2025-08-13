const view = document.getElementById('view');
const saveButton = document.getElementById('save-button');
const dashboardContent = document.getElementById("dashboard-content");

// === UTILITY ===
function updateIndices(type, parent = null) {
    let parentElement = parent ?? view;
    let dragItems = parentElement.querySelectorAll(`.drag-item[data-type="${type}"]`);
    dragItems.forEach((item, index) => {
        let circle = item.querySelector('.cursor-move p');
        if (circle) {
            circle.textContent = index + 1;
        }
        item.dataset.index = index + 1;
    });
    window.showSave();
}
window.updateIndices = updateIndices;

// === LOADING ===
function getUserId() {
    return dashboardContent.dataset.userid || '';
}

document.addEventListener('click', (e) => {
    let target = e.target;
    let button = target.closest("button");
    if (button) {
        if (button.classList.contains("button-menus")) {
            loadMenus();
        }
        if (button.classList.contains("button-categories")) {
            loadCategories();
        }
        if (button.classList.contains("button-infos")) {
            loadInfos();
        }
    }
});

function loadMenus() {
    const editCarte = document.getElementById("edit-carte-content");
    const menuInfo = document.querySelector(".menu-info");
    const lists = editCarte.querySelectorAll(".edit-info");
    lists.forEach(item => item.classList.add("hidden"));
    if (menuInfo) {
        menuInfo.classList.remove("hidden");
    } else {
        loadEditContent('/partials/edit/menu/menus?userId=' + getUserId());
    }
    pushUrl('/#/edit-carte/menus');
}

function loadCategories() {
    const editCarte = document.getElementById("edit-carte-content");
    const categorieInfo = document.querySelector(".categorie-info");
    const lists = editCarte.querySelectorAll(".edit-info");
    lists.forEach(item => item.classList.add("hidden"));
    if (categorieInfo) { 
        categorieInfo.classList.remove("hidden");
    } else {
        loadEditContent('/partials/edit/categories/produits?userId=' + getUserId());
    }
    pushUrl('/#/edit-carte/produits');
}

function loadInfos() {
    const editCarte = document.getElementById("edit-carte-content");
    const info = document.querySelector(".info-info");
    const lists = editCarte.querySelectorAll(".edit-info");
    lists.forEach(item => item.classList.add("hidden"));
    if (info) {
        info.classList.remove("hidden");
    } else {
        loadEditContent('/partials/edit/infos/infos?userId=' + getUserId());
    }
    pushUrl('/#/edit-carte/infos');
}

function loadEditContent(url) {
    htmx.ajax('GET', url, {
        target: '#edit-carte-content',
        swap: 'beforeend'
    })
}

function pushUrl(url) {
    history.pushState(null, '', url);
}

// === DRAGGING ===
let draggedItem = null;

function getPlaceholder(width, height) {
    let placeholder = document.createElement('div');
    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;
    placeholder.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    placeholder.classList.add('placeholder');
    return placeholder;
}

view.addEventListener('mousedown', (e) => {
    if(e.target.closest('.drag-handle'))
    {
        draggedItem = e.target.closest('.drag-item');
        if (draggedItem) {
            // current width of the element
            const { width, height } = draggedItem.getBoundingClientRect();
            let placeholder = getPlaceholder(width, height);
            draggedItem.parentElement.insertBefore(placeholder, draggedItem);

            draggedItem.classList.add('bg-white');
            draggedItem.style.position = 'absolute';
            draggedItem.style.width = `${width}px`;
            draggedItem.style.height = `${height}px`;
            draggedItem.style.zIndex = '1000';
            draggedItem.style.left = `${e.pageX-42}px`;
            draggedItem.style.top = `${e.pageY-50}px`;
        }
    }
});

view.addEventListener('mousemove', (e) => {
    if (draggedItem) {
        let type = draggedItem.dataset.type;
        if (!type) return;
        let dragItems = view.querySelectorAll(`.drag-item[data-type="${type}"]`);
        dragItems.forEach(item => {
            if (item === draggedItem) return;
            let { top, bottom } = item.getBoundingClientRect();
            if (e.clientY > top && e.clientY < bottom) {
                let oldPlaceholder = document.querySelector('.placeholder');
                let placeholder = getPlaceholder(oldPlaceholder.offsetWidth, oldPlaceholder.offsetHeight);
                oldPlaceholder.remove();
                if (e.clientY > (top + bottom) / 2) {
                    item.parentElement.insertBefore(placeholder, item.nextSibling);
                } else {
                    item.parentElement.insertBefore(placeholder, item);
                }
            }
        });

        draggedItem.style.left = `${e.pageX-42}px`;
        draggedItem.style.top = `${e.pageY-50}px`;
    }
});

view.addEventListener('mouseup', (e) => {
    if (draggedItem) {
        draggedItem.classList.remove('bg-white');
        draggedItem.style.position = '';
        draggedItem.style.width = '';
        draggedItem.style.height = '';
        draggedItem.style.zIndex = '';
        draggedItem.style.left = '';
        draggedItem.style.top = '';

        view.dispatchEvent(new CustomEvent('itemDropped', {
            detail: {
                item: draggedItem
            },
            bubbles: true,
        }));
    }
    draggedItem = null;
});


// === SAVING ===
document.addEventListener('input', (e) => {
    let target = e.target;
    if (target.classList.contains('saveable-input')) {
        showSave();
    }
});

function saveChanges() {
    document.dispatchEvent(new CustomEvent('saveChanges', { bubbles: true }));
    window.hideSave();
}
saveButton.addEventListener('click', saveChanges);

function showSave() {
    saveButton.classList.remove('hidden');
    saveButton.classList.add('flex');
}
window.showSave = showSave;

function hideSave() {
    saveButton.classList.add('hidden');
    saveButton.classList.remove('flex');
}
window.hideSave = hideSave;
