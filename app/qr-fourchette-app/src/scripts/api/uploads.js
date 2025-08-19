export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/uploads/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Image upload failed');
    }

    const data = await response.json();
    return data.url;
}
