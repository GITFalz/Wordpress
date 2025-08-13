import { getToken } from "./main";

// === SAVE ===
document.addEventListener('saveChanges', async (e) => {
    let saveData = [];
    let messageHeaderElement = document.getElementById('message-header');
    let messageFooterElement = document.getElementById('message-footer');
    if (messageHeaderElement) {
        saveData.push({
            key: 'message_header',
            value: messageHeaderElement.value
        });
    }
    if (messageFooterElement) {
        saveData.push({
            key: 'message_footer',
            value: messageFooterElement.value
        });
    }

    try {
        const apiBase = import.meta.env.PUBLIC_API_BASE_URL;
        const userid = document.getElementById('dashboard-content').dataset.userid;
        
        const response = await fetch(`${apiBase}/api/settings/${userid}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
            body: JSON.stringify(saveData),
        });

        if (!response.ok) {
            // print full response
            const errorData = await response.json();
            console.error('Error saving menu changes:', errorData);
            return;
        }
    } catch (error) {
        console.error('Error:', error);
    }
});