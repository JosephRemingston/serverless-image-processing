function removeContentTypeFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.delete('Content-Type');
        return parsedUrl.toString();
    } catch (error) {
        console.error('Invalid URL:', error);
        return url;
    }
}

module.exports = removeContentTypeFromUrl;