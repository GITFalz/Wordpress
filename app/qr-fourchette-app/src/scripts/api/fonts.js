const TOKEN_KEY = 'auth_token';

export async function getFonts(userId, query = '') {
    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/fonts/${userId}/${query}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch fonts');
    }
    return response.json();
}

export async function getFontById(userId, fontId) {
    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/fonts/${userId}/font/${fontId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch font');
    }
    return response.json();
}
