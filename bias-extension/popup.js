document.addEventListener('DOMContentLoaded', function () {
    const highlightSwitch = document.getElementById("highlightSwitch");
    const highlightColorPicker = document.getElementById("highlightColorPicker");
  
    // Get the saved state and highlight color from localStorage (if any)
    chrome.storage.local.get(["highlightEnabled", "highlightColor"], function (result) {
      const highlightEnabled = result.highlightEnabled || false;
      const highlightColor = result.highlightColor || "#FFFF00"; // Default yellow color
      highlightSwitch.checked = highlightEnabled;
      highlightColorPicker.value = highlightColor;  // Set color picker value
  
      // Initialize highlight based on saved state
      toggleHighlight(highlightEnabled, highlightColor);
    });
  
    // Switch change event to toggle highlight
    highlightSwitch.addEventListener("change", function () {
      const highlightEnabled = highlightSwitch.checked;
      chrome.storage.local.set({ highlightEnabled });
  
      // Send a message to the content script to toggle highlighting
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        if (tab && tab.id) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: toggleHighlight,
            args: [highlightEnabled, highlightColorPicker.value]
          });
        } else {
          console.error("Tab not found or invalid tab ID.");
        }
      });
    });
  
    // Color picker change event to update highlight color
    highlightColorPicker.addEventListener("input", function () {
      const highlightColor = highlightColorPicker.value;
      chrome.storage.local.set({ highlightColor });
  
      // Send a message to the content script to update the highlight color
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        if (tab && tab.id) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: toggleHighlight,
            args: [highlightSwitch.checked, highlightColor]
          });
        } else {
          console.error("Tab not found or invalid tab ID.");
        }
      });
    });
  });
  

  function highlightThe(highlightColor) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
  
    while (node = walker.nextNode()) {
      // Avoid highlighting in non-visible text (e.g., hidden elements)
      if (isVisible(node)) {
        const text = node.nodeValue;
        const highlightedText = text.replace(/\bthe\b/gi, function (match) {
          // Wrap the matched word in a span with the selected highlight color
          return `<span class="highlighted" style="background-color: ${highlightColor};">${match}</span>`;
        });
  
        // If any match was found, split the node and insert the highlighted text
        if (highlightedText !== text) {
          const spanWrapper = document.createElement('span');
          spanWrapper.innerHTML = highlightedText;
  
          // Replace the original text node with the span wrapper containing the highlighted text
          node.parentNode.replaceChild(spanWrapper, node);
        }
      }
    }
  }
  
// Function to remove highlights
function removeHighlight() {
    const highlightedElements = document.querySelectorAll(".highlighted");
    highlightedElements.forEach(element => {
        const parent = element.parentNode;
        parent.replaceChild(document.createTextNode(element.textContent), element);
});
}

// Function to check if a text node is visible
function isVisible(node) {
    const style = window.getComputedStyle(node.parentNode);
    return style.display !== 'none' && style.visibility !== 'hidden';
}

// Function to toggle highlight based on state
function toggleHighlight(enabled, highlightColor) {
    // Remove previous highlights
    // Toggle highlighting based on the state
    if (enabled) {
        highlightThe(highlightColor);
    } else {
        removeHighlight();
    }
}