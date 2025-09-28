document.addEventListener('DOMContentLoaded', function() {
    let profileData;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: getProfileData
        }, (results) => {
            if (results && results[0]) {
                profileData = results[0].result;
                document.getElementById('name').textContent = profileData.name;
                document.getElementById('title').textContent = profileData.title;


                document.getElementById('photo').src = profileData.photo;
                document.getElementById('username').textContent = profileData.username;

                const deckPayload = {
                    name: profileData.name,
                    title: profileData.title,
                    categories: [],
                    socials: {
                        linkedin: `https://www.linkedin.com/in/${profileData.username}`
                    }
                };

                document.getElementById('deck-data').textContent = JSON.stringify(deckPayload, null, 2);
            }
        });
    });

    document.getElementById('addToDeck').addEventListener('click', () => {
        const deckPayload = {
	    bio: profileData.title,
            name: profileData.name,
            title: profileData.title,
        };

        const apiUrl = 'https://deck.sinfo.org/api/speakers'; 

        chrome.storage.sync.get(['jwtToken'], function(result) {
            const authToken = result.jwtToken;

            if (!authToken) {
                document.getElementById('status').textContent = 'Error: JWT token not found. Please set it in the options page.';
                return;
            }

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${authToken}`
                },
                body: JSON.stringify(deckPayload)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                console.log('Successfully added to Deck! Now adding socials and uploading photo...');

                const speakerId = data.id;
                const contactId = data.contact;
                const imageUrl = profileData.photo;

                const socialsPayload = {
                    mails: [],
                    phones: [],
                    socials: {
                        facebook: null,
                        skype: null,
                        github: null,
                        twitter: null,
                        linkedin: profileData.username
                    }
                };

                const socialsUrl = `https://deck.sinfo.org/api/contacts/${contactId}`;

                fetch(socialsUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${authToken}`
                    },
                    body: JSON.stringify(socialsPayload)
                })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => { throw new Error(text) });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Socials update success:', data);
                    console.log('Socials updated successfully! Now uploading photo...');

                    return fetch(imageUrl);
                })
                .then(response => response.blob())
                .then(blob => {
                    const formData = new FormData();
                    formData.append('image', blob);

                    const imageUploadUrl = `https://deck.sinfo.org/api/speakers/${speakerId}/image/internal`;

                    return fetch(imageUploadUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `${authToken}`
                        },
                        body: formData
                    });
                })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => { throw new Error(text) });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Image upload success:', data);
                    console.log('Photo uploaded successfully! Now creating participation...');

                    const participationUrl = `https://deck.sinfo.org/api/speakers/${speakerId}/participation`;

                    return fetch(participationUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `${authToken}`
                        }
                    });
                })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => { throw new Error(text) });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Participation success:', data);
                    document.getElementById('status').textContent = 'Speaker added successfully!';
                })
                .catch((error) => {
                    console.error('Error during post-creation steps:', error);
                    document.getElementById('status').textContent = `An error occurred: ${error.message}`;
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                try {
                    const errorData = JSON.parse(error.message);
                    document.getElementById('status').textContent = `Error adding to Deck: ${errorData.message}`;
                } catch (e) {
                    document.getElementById('status').textContent = `Error adding to Deck: ${error.message}`;
                }
            });
        });
    });
});

function getProfileData() {
    const nameElement = document.querySelector('h1');
    const name = nameElement ? nameElement.innerText : '';
    const titleElement = document.querySelector('.text-body-medium.break-words');
    const title = titleElement ? titleElement.innerText : '';
    let photo = '';
    if (name) {
        const photoElement = document.querySelector(`img[alt="${name}"]`);
        if (photoElement) {
            photo = photoElement.src;
        }
    }
    const username = window.location.pathname.split('/')[2];

    return { name, title, photo, username };
}
