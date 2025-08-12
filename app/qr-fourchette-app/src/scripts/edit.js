const view = document.getElementById('view');
const saveButton = document.getElementById('save-button');

// === UTILITY ===
function updateIndices(type) {
    let dragItems = view.querySelectorAll(`.drag-item[data-type="${type}"]`);
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
