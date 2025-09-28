document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save');
    const jwtTokenInput = document.getElementById('jwtToken');
    const contactOutApiKeyInput = document.getElementById('contactOutApiKey');
    const statusDiv = document.getElementById('status');

    // Load the saved token and API key and display them in the input fields
    chrome.storage.sync.get(['jwtToken', 'contactOutApiKey'], function(data) {
        if (data.jwtToken) {
            jwtTokenInput.value = data.jwtToken;
        }
        if (data.contactOutApiKey) {
            contactOutApiKeyInput.value = data.contactOutApiKey;
        }
    });

    saveButton.addEventListener('click', function() {
        const jwtToken = jwtTokenInput.value;
        const contactOutApiKey = contactOutApiKeyInput.value;
        if (jwtToken && contactOutApiKey) {
            chrome.storage.sync.set({'jwtToken': jwtToken, 'contactOutApiKey': contactOutApiKey}, function() {
                statusDiv.textContent = 'Token and API key saved successfully!';
                setTimeout(() => {
                    statusDiv.textContent = '';
                }, 3000);
            });
        } else {
            statusDiv.textContent = 'Please enter a token and an API key.';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
        }
    });
});