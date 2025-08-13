import { getToken } from "./main";

const saveButton = document.getElementById('save-button');

let addedCategorieItems = [];
let deletedCategorieItems = [];

let addedPlatItems = [];
let deletedPlatItems = [];

function unloadCategories() {
    addedCategorieItems = [];
    deletedCategorieItems = [];
    addedPlatItems = [];
    deletedPlatItems = [];
}
window.unloadCategories = unloadCategories;

function updateCategorieIndices() {
    if (!isCategorieLoaded()) return;
    window.updateIndices('category');
}

function updatePlatIndices(parent) {
    if (!isCategorieLoaded()) return;
    window.updateIndices('plat', parent);
}

function isCategorieLoaded() {
    const categorieInfo = document.querySelector(".categorie-info");
    return categorieInfo !== null && !categorieInfo.classList.contains('hidden');
}

document.addEventListener('htmx:afterSwap', (e) => {
    if (!isCategorieLoaded()) return;
    updateCategorieIndices();
});

document.addEventListener('click', (e) => {
    if (!isCategorieLoaded()) return;
    
    let target = e.target;
    let expandButton = target.closest('.expand-categorie-item');
    let collapseButton = target.closest('.collapse-categorie-item');
    if (expandButton) {
        let collapseButton = expandButton.parentElement.querySelector('.collapse-categorie-item');
        let categorieItem = expandButton.closest('.drag-item');
        let expandElements = categorieItem.querySelectorAll('.expandable');
        expandElements.forEach(el => el.classList.remove('hidden'));

        expandButton.classList.add('hidden');
        collapseButton.classList.remove('hidden');
    }
    if (collapseButton) {
        let expandButton = collapseButton.parentElement.querySelector('.expand-categorie-item');
        let categorieItem = collapseButton.closest('.drag-item');
        let expandElements = categorieItem.querySelectorAll('.expandable');
        expandElements.forEach(el => el.classList.add('hidden'));

        collapseButton.classList.add('hidden');
        expandButton.classList.remove('hidden');
    }
});

function addCategorieItemAfter(button) {
    if (!isCategorieLoaded()) return;
    let categorieItem = button.closest('.drag-item');
    if (!categorieItem) return;
    addCategorieItem(categorieItem, 'afterend');
}
window.addCategorieItemAfter = addCategorieItemAfter;

function addCategorieItemBefore(button) {
    if (!isCategorieLoaded()) return;
    addCategorieItem(button, 'beforebegin');
}
window.addCategorieItemBefore = addCategorieItemBefore;

function addCategorieItem(button, swap) {
    if (!isCategorieLoaded()) return;
    let id = Date.now().toString(36)+'t';
    if (!addedCategorieItems.includes(id)) {
        addedCategorieItems.push(id);
    }
    if (deletedCategorieItems.includes(id)) {
        deletedCategorieItems = deletedCategorieItems.filter(item => item !== id);
    }
    htmx.ajax('GET', `/partials/edit/categories/add-categorie-item?id=${id}`, {
        target: button,
        swap: swap,
    });
}

export function deleteCategorieItem(button) {
    if (!isCategorieLoaded()) return;
    let categorieItem = button.closest('.drag-item');
    if (!categorieItem) return;
    let id = categorieItem.dataset.id;
    if (!deletedCategorieItems.includes(id)) {
        deletedCategorieItems.push(id);
    }
    if (addedCategorieItems.includes(id)) {
        addedCategorieItems = addedCategorieItems.filter(item => item !== id);
    }
    categorieItem.remove();
    updateCategorieIndices();
}
window.deleteCategorieItem = deleteCategorieItem;


function addPlatItemBefore(button) {
    if (!isCategorieLoaded()) return;
    addPlatItem(button, 'beforebegin');
}
window.addPlatItemBefore = addPlatItemBefore;

function addPlatItem(button, swap) {
    if (!isCategorieLoaded()) return;
    let id = Date.now().toString(36)+'t';
    if (!addedPlatItems.includes(id)) {
        addedPlatItems.push(id);
    }
    if (deletedPlatItems.includes(id)) {
        deletedPlatItems = deletedPlatItems.filter(item => item !== id);
    }
    const platList = button.closest('.plat-list');
    htmx.ajax('GET', `/partials/edit/categories/add-plat-item?id=${id}&index=${platList.children.length}`, {
        target: button,
        swap: swap,
    });
}


// === ICON ===
let iconDebounce;

async function searchIcons(query) {
    const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=20`;
    const res = await fetch(url);
    const data = await res.json();
    return data.icons || [];
}

function displayIconSelect(icons, id) { 
    if (!isCategorieLoaded()) return;
    htmx.ajax('POST', '/partials/edit/categories/icon-select', {
        target: `.drag-item[data-id="${id}"] .icon-select`,
        swap: 'outerHTML',
        values: { icons: JSON.stringify(icons)}
    });
}


async function searchAndDisplayIcons(input) {
    if (!isCategorieLoaded()) return;
    let value = input.value;
    if (value.length < 1) {
        closeIconSelect(input);
        return;
    }

    clearTimeout(iconDebounce);
    iconDebounce = setTimeout(async () => {
        let categorieItem = input.closest('.drag-item');
        if (categorieItem) {    
            const icons = await searchIcons(value);
            if (icons.length > 0) {
                displayIconSelect(icons, categorieItem.dataset.id);
            } else {
                closeIconSelect(input);
            }
        }
    }, 300);
}
window.searchAndDisplayIcons = searchAndDisplayIcons;

function closeIconSelect(element) {
    if (!isCategorieLoaded()) return;
    let categorieItem = element.closest('.drag-item');
    if (categorieItem) {
        let iconSelect = categorieItem.querySelector('.icon-select');
        if (iconSelect) {
            iconSelect.innerHTML = '';
            iconSelect.classList.add('hidden');
        }
    }
}
window.closeIconSelect = closeIconSelect;

function getIconUrl(icon) {
    return `https://api.iconify.design/${icon}.svg`;
}

function setCategorieIcon(element) {
    if (!isCategorieLoaded()) return;
    let icon = element.dataset.icon;
    let categorieItem = element.closest('.drag-item');
    if (icon && categorieItem) {
        let iconInput = categorieItem.querySelector('.categorie-icon');
        let iconImg = categorieItem.querySelector('.categorie-icon-img');
        if (iconImg) {
            iconImg.src = getIconUrl(icon);
        }
        if (iconInput) {
            iconInput.value = icon;
        }
        closeIconSelect(element);
        window.showSave();
    }
}
window.setCategorieIcon = setCategorieIcon;

function deleteCategorieIcon(element) {
    if (!isCategorieLoaded()) return;
    let categorieItem = element.closest('.drag-item');
    if (categorieItem) {
        let iconInput = categorieItem.querySelector('.categorie-icon');
        let iconImg = categorieItem.querySelector('.categorie-icon-img');
        if (iconInput) {
            iconInput.value = '';
        }
        if (iconImg) {
            iconImg.src = '';
        }
        closeIconSelect(element);
        window.showSave();
    }
}
window.deleteCategorieIcon = deleteCategorieIcon;

// === DRAGGING ===
const view = document.getElementById('view');
view.addEventListener('itemDropped', (e) => {
    if (!isCategorieLoaded()) return;
    const { item } = e.detail;
    if (item.dataset.type === "category") {
        let placeholder = document.querySelector('.placeholder');
        const categorieList = document.getElementById('categorie-list');
        if (placeholder && categorieList) {
            categorieList.insertBefore(item, placeholder);
            placeholder.remove();
        }
        updateCategorieIndices();
    }
    if (item.dataset.type === "plat") {
        let placeholder = document.querySelector('.placeholder');
        const platList = item.closest('.plat-list');
        if (placeholder && platList) {
            platList.insertBefore(item, placeholder);
            placeholder.remove();
        }
        updatePlatIndices(platList);
    }
});


// === SAVE ===
document.addEventListener('saveChanges', async (e) => {
    const categorieList = document.getElementById('categorie-list');
    if (!categorieList) return;

    updateCategorieIndices();
    const saveData = {
        updated: [],
        added: [],
        deleted: deletedCategorieItems.map(id => ({ id: id })),
    };
    // Helper to extract menu fields from a menu item element
    const extractFields = (item) => {
        return {
            name: item.querySelector('.categorie-name')?.value || '',
            description: item.querySelector('.categorie-description')?.value || '',
            icon: item.querySelector('.categorie-icon')?.value || '',
            traduisible: item.querySelector('.categorie-traduisible-oui')?.checked || false
        };
    };

    const categorieItems = categorieList.querySelectorAll('.drag-item');
    categorieItems.forEach(item => {
        const id = item.dataset.id;
        if (addedCategorieItems.includes(id)) {
            saveData.added.push({
                id: id,
                ...extractFields(item),
                number: item.dataset.index
            });
        } else {
            saveData.updated.push({ 
                id: id,
                ...extractFields(item),
                number: item.dataset.index
            });
        }
    });

    try {
        const apiBase = import.meta.env.PUBLIC_API_BASE_URL;
        const userid = document.getElementById('dashboard-content').dataset.userid;

        const response = await fetch(`${apiBase}/api/categorie/${userid}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
            body: JSON.stringify(saveData),
        });

        if (!response.ok) {
            // get full response error message
            const errorData = await response.json();
            throw new Error(`Server error: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        const added = data.added;
        added.forEach(item => {
            const categorieItem = categorieList.querySelector(`.drag-item[data-id="${item.oldId}"]`);
            if (categorieItem) {
                categorieItem.dataset.id = item.newId;
            }
        });
        addedCategorieItems.splice(0, addedCategorieItems.length);
        deletedCategorieItems.splice(0, deletedCategorieItems.length);
        window.hideSave(); 
    } catch (error) {
        console.error('Error:', error);
    }
});