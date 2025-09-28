
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getContactOutData') {
        const { username, apiKey } = request.data;
        const contactOutUrl = `https://api.contactout.com/v1/people/linkedin?profile=https://www.linkedin.com/in/${username}`;

        fetch(contactOutUrl, {
            headers: {
                'token': `${apiKey}`
            }
        })
        .then(response => response.json())
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));

        return true; // Indicates that the response is sent asynchronously
    }
});
