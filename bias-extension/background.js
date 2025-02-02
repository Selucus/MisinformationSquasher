chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);  // Reload active tab after update
        console.log("Extension updated");
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getTabInfo") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        if (tab && tab.id) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: toggleHighlight,
            args: [true, message.color]
          });
        } else {
          console.error("Tab not found or invalid tab ID.");
        }
      });
    }
  });
  