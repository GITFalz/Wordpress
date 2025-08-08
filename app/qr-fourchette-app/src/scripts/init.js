htmx.config.defaults = {
    requestConfig: {
        url: (url) => {
            const base = 'http://localhost:4000';
            // Only rewrite if it's a relative URL (not already absolute)
            return url.startsWith('/') ? base + url : url;
        }
    }
};