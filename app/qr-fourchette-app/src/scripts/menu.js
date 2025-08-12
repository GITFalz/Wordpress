import { getToken } from "./main";

const menuList = document.getElementById('menu-list');
const saveButton = document.getElementById('save-button');

let addedMenuItems = [];
let deletedMenuItems = [];

function updateMenuIndices() {
    window.updateIndices('menu');
}

menuList.addEventListener('htmx:afterSwap', (e) => {
    updateMenuIndices();
});

menuList.addEventListener('click', (e) => {
    let target = e.target;
    let expandButton = target.closest('.expand-menu-item');
    let collapseButton = target.closest('.collapse-menu-item');
    if (expandButton) {
        let collapseButton = expandButton.parentElement.querySelector('.collapse-menu-item');
        let menuItem = expandButton.closest('.menu-item');
        let expandElements = menuItem.querySelectorAll('.expandable');
        expandElements.forEach(el => el.classList.remove('hidden'));

        expandButton.classList.add('hidden');
        collapseButton.classList.remove('hidden');
    }
    if (collapseButton) {
        let expandButton = collapseButton.parentElement.querySelector('.expand-menu-item');
        let menuItem = collapseButton.closest('.menu-item');
        let expandElements = menuItem.querySelectorAll('.expandable');
        expandElements.forEach(el => el.classList.add('hidden'));

        collapseButton.classList.add('hidden');
        expandButton.classList.remove('hidden');
    }
});

export function addMenuItemAfter(button) {
    let menuItem = button.closest('.menu-item');
    if (!menuItem) return;
    addMenuItem(menuItem, 'afterend');
}
window.addMenuItemAfter = addMenuItemAfter;

export function addMenuItemBefore(button) {
    addMenuItem(button, 'beforebegin');
}
window.addMenuItemBefore = addMenuItemBefore;

function addMenuItem(button, swap) {
    let id = Date.now().toString(36)+'t';
    if (!addedMenuItems.includes(id)) {
        addedMenuItems.push(id);
    }
    if (deletedMenuItems.includes(id)) {
        deletedMenuItems = deletedMenuItems.filter(item => item !== id);
    }
    htmx.ajax('GET', `/partials/edit/menu/add-menu-item?id=${id}`, {
        target: button,
        swap: swap,
    });
}

export function deleteMenuItem(button) {
    let menuItem = button.closest('.menu-item');
    if (!menuItem) return;
    let id = menuItem.dataset.id;
    if (!deletedMenuItems.includes(id)) {
        deletedMenuItems.push(id);
    }
    if (addedMenuItems.includes(id)) {
        addedMenuItems = addedMenuItems.filter(item => item !== id);
    }
    menuItem.remove();
    updateMenuIndices();
}
window.deleteMenuItem = deleteMenuItem;


// === DRAGGING ===
const view = document.getElementById('view');
view.addEventListener('itemDropped', (e) => {
    const { item } = e.detail;
    let placeholder = document.querySelector('.placeholder');
    if (placeholder) {
        menuList.insertBefore(item, placeholder);
        placeholder.remove();
    }
    updateMenuIndices();
});


// === SAVE ===
saveButton.removeEventListener('click', saveMenus);
saveButton.addEventListener('click', saveMenus);


async function saveMenus() {
    updateMenuIndices();
    const saveData = {
        updated: [],
        added: [],
        deleted: deletedMenuItems.map(id => ({ id: id })),
    };
    // Helper to extract menu fields from a menu item element
    const extractFields = (item) => {
        return {
        name: item.querySelector('.menu-name')?.value || '',
        description: item.querySelector('.menu-description')?.value || '',
        entrees: item.querySelector('.menu-entrees')?.value || '',
        plats: item.querySelector('.menu-plats')?.value || '',
        desserts: item.querySelector('.menu-desserts')?.value || '',
        };
    };

    const menuItems = menuList.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const id = item.dataset.id;
        if (addedMenuItems.includes(id)) {
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
        
        const response = await fetch(`${apiBase}/api/menu/${userid}`, {
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
            const menuItem = menuList.querySelector(`.menu-item[data-id="${item.oldId}"]`);
            if (menuItem) {
                menuItem.dataset.id = item.newId;
            }
        });
        addedMenuItems.splice(0, addedMenuItems.length);
        deletedMenuItems.splice(0, deletedMenuItems.length);
        window.hideSave(); 
    } catch (error) {
        console.error('Error:', error);
    }
}