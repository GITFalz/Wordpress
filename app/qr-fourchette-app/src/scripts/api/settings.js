const TOKEN_KEY = 'auth_token';

export async function getValues(userId, category, keys) {
    const response = await fetch(
        `${import.meta.env.PUBLIC_API_BASE_URL}/api/settings/${userId}/${category}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify({ keys })
        }
    );

    if (!response.ok) {
        throw new Error('Failed to get settings');
    }

    return response.json();
}

export async function getFromKey(userId, key, category) {
    const response = await fetch(
        `${import.meta.env.PUBLIC_API_BASE_URL}/api/settings/${userId}/${category}/${key}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to get settings');
    }

    return response.json();
}

export async function getFromCategorie(userId, category) {
    console.log(`Fetching settings for user ${userId} in category ${category}`);
    const response = await fetch(
        `${import.meta.env.PUBLIC_API_BASE_URL}/api/settings/${userId}/${category}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to get settings from category');
    }

    return response.json();
}

export async function updateSettings(userId, settingsId, value) {
    const response = await fetch(
        `${import.meta.env.PUBLIC_API_BASE_URL}/api/settings/${userId}/${settingsId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify({ value })
        }
    );

    if (!response.ok) {
        throw new Error('Failed to update settings');
    }

    return response.json();
}

export async function deleteSettings(userId, settingsId) {
    const response = await fetch(
        `${import.meta.env.PUBLIC_API_BASE_URL}/api/settings/${userId}/${settingsId}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to delete settings');
    }

    return response.json();
}