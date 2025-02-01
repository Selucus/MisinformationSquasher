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
  
    while ((node = walker.nextNode())) {
      if (isVisible(node)) {
        const text = node.nodeValue;
        const regex = /\b(the)\b/gi;
  
        if (regex.test(text)) {
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;
          regex.lastIndex = 0; // Reset regex index
  
          text.replace(regex, (match, p1, offset) => {
            // Add the text before the match
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
  
            // Add the highlighted match
            const span = document.createElement('span');
            span.className = 'highlighted';
            span.style.backgroundColor = highlightColor;
            span.textContent = match;
            fragment.appendChild(span);
  
            lastIndex = offset + match.length;
            return match; // To satisfy replace, though we're not using this return
          });
  
          // Add any remaining text after the last match
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  
          // Replace the original text node with the new fragment
          node.parentNode.replaceChild(fragment, node);
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