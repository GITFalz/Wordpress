import { getToken } from "./main";

const categorieList = document.getElementById('categorie-list');
const saveButton = document.getElementById('save-button');

let addedCategorieItems = [];
let deletedCategorieItems = [];

function updateCategorieIndices() {
    window.updateIndices('category');
}

categorieList.addEventListener('htmx:afterSwap', (e) => {
    updateCategorieIndices();
});

categorieList.addEventListener('click', (e) => {
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

export function addCategorieItemAfter(button) {
    let categorieItem = button.closest('.drag-item');
    if (!categorieItem) return;
    addCategorieItem(categorieItem, 'afterend');
}
window.addCategorieItemAfter = addCategorieItemAfter;

export function addCategorieItemBefore(button) {
    addCategorieItem(button, 'beforebegin');
}
window.addCategorieItemBefore = addCategorieItemBefore;

function addCategorieItem(button, swap) {
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


// === DRAGGING ===
const view = document.getElementById('view');
view.addEventListener('itemDropped', (e) => {
    const { item } = e.detail;
    let placeholder = document.querySelector('.placeholder');
    if (placeholder) {
        categorieList.insertBefore(item, placeholder);
        placeholder.remove();
    }
    updateCategorieIndices();
});


// === SAVE ===
saveButton.removeEventListener('click', saveCategories);
saveButton.addEventListener('click', saveCategories);


async function saveCategories() {
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
            description: item.querySelector('.categorie-description')?.value || ''
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
            throw new Error(`Server error: ${response.status}`);
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
}