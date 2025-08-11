const menuList = document.getElementById('menu-list');
let draggedItem = null;
let canDrag = false;

menuList.addEventListener('htmx:afterRequest', (e) => {
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

menuList.addEventListener('mousedown', (e) => {
    canDrag = !!e.target.closest('.drag-handle');
});

menuList.addEventListener('mouseup', (e) => {
    canDrag = false;
});

function updateMenuIndices() {
    let menuItems = menuList.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        let circle = item.querySelector('.cursor-move p');
        if (circle) {
            circle.textContent = index + 1;
        }
    });
}


menuList.addEventListener('dragstart', (e) => {
    draggedItem = e.target.closest('.menu-item');
    if (!draggedItem || !canDrag) return;
    draggedItem.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedItem.dataset.id);
});

menuList.addEventListener('dragover', (e) => {
    let placeholder = document.createElement('div');
    placeholder.classList.add('placeholder');
    placeholder.style.height = `${draggedItem.offsetHeight}px`;

    e.preventDefault(); // Necessary to allow drop
    const target = e.target;
    if (target && target !== draggedItem && target.classList.contains('menu-item')) {
        const rect = target.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        if (next) {
            target.parentNode.insertBefore(placeholder, target.nextSibling);
        } else {
            target.parentNode.insertBefore(placeholder, target);
        }
    }
});

menuList.addEventListener('drop', (e) => {
    draggedItem.classList.remove('dragging');
    e.preventDefault();
    draggedItem = null;
});