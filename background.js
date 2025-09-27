
// This script runs in the background and listens for messages from the content script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "addToDeck") {
        // TODO: Send the data to the Deck API
        console.log("Adding to Deck:", request.data);
        sendResponse({status: "success"});
    }
});
