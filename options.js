document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save');
    const jwtTokenInput = document.getElementById('jwtToken');
    const statusDiv = document.getElementById('status');

    // Load the saved token and display it in the input field
    chrome.storage.sync.get('jwtToken', function(data) {
        if (data.jwtToken) {
            jwtTokenInput.value = data.jwtToken;
        }
    });

    saveButton.addEventListener('click', function() {
        const jwtToken = jwtTokenInput.value;
        if (jwtToken) {
            chrome.storage.sync.set({'jwtToken': jwtToken}, function() {
                statusDiv.textContent = 'Token saved successfully!';
                setTimeout(() => {
                    statusDiv.textContent = '';
                }, 3000);
            });
        } else {
            statusDiv.textContent = 'Please enter a token.';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
        }
    });
});