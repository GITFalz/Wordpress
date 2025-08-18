const LIST_BASE_URL = "https://www.googleapis.com/webfonts/v1/webfonts";

function getFontId(fontFamily) {
    // replace spaces with dashes, remove non-alphanumeric except dash
    return fontFamily.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
}

export default async function getFontList(apiKey) {
    const url = new URL(LIST_BASE_URL);
    url.searchParams.append("sort", "popularity");
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.href);
    if (!response.ok) {
        throw new Error(`Failed to fetch fonts: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (!json.items || !Array.isArray(json.items)) {
        return [];
    }

    return json.items.map(font => {
        const { family, subsets, category } = font;
        return {
            id: getFontId(family),
            family,
            category,
            scripts: subsets || [],
        };
    });
}