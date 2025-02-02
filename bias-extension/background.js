chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);  // Reload active tab after update
        console.log("Extension updated");
    });
});


