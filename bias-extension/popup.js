//alert("Popup script loaded");
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
          //alert("Tab ID: " + tab.id);
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: toggleHighlight,
            args: [highlightEnabled, highlightColorPicker.value, document]
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
    //alert("highlight running");
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
  
function revertContentChanges() {
  /*
  const elements = document.querySelectorAll('*');
  elements.forEach(element => {
    // Reset text content
    element.textContent = element.textContent;
    // Or revert to original HTML if stored
    // element.innerHTML = originalHTMLContent;  // if you store original content before modifying
  });
  */
}
  

// Function to check if a text node is visible
function isVisible(node) {
    const style = window.getComputedStyle(node.parentNode);
    return style.display !== 'none' && style.visibility !== 'hidden';
}

// Function to toggle highlight based on state
function toggleHighlight(enabled, highlightColor) {
    //alert("toggleHighlight running");
    // Remove previous highlights
    // Toggle highlighting based on the state
    if (enabled) {
        //alert("highlighting");
        highlightVisibleElements();
    } else {
        revertContentChanges();
    }
}

function getVisibleElements() {
  // Select only the headers (h1-h6), paragraphs (p), and articles (article)


  let curTab = getCurrentTab();
  if (curTab === undefined) {
    alert('Error: No active tab found.');
    return [];
  }else{
    const elements = curTab.document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, article');
  const visibleElements = [];
  //alert(elements);
  // Loop through each selected element
  elements.forEach(element => {
    const rect = element.getBoundingClientRect();

    // Check if the element is visible (partially or fully) within the viewport
    if (
      rect.top < window.innerHeight && // Element's top is within the viewport
      rect.bottom > 0 &&               // Element's bottom is within the viewport
      rect.left < window.innerWidth && // Element's left is within the viewport
      rect.right > 0                   // Element's right is within the viewport
    ) {
      visibleElements.push(element);
    }
  });
  
  
  }

  return visibleElements;
}

function highlightFunction(element) {
  // You can customize this logic to highlight based on different criteria
  let checked = sudoCheck(element);
  if (checked == "f") {
    return 'yellow';  // Highlight H1 headers with yellow
  } 

  // Return null for elements that shouldn't be highlighted
  return null;
}

// Function to highlight or reset the visible elements based on the highlightFunction
function highlightVisibleElements() {
  const visibleElements = getVisibleElements();

  visibleElements.forEach(element => {
    // Get the highlight color from the highlightFunction
    const highlightColor = highlightFunction(element);

    if (highlightColor) {
      // If highlightColor is defined, apply the highlight
      element.style.backgroundColor = highlightColor;
    } else {
      // If highlightColor is null, reset the background (or other styles)
      element.style.backgroundColor = '';  // Remove any previous highlight
    }
  });
}

function sudoCheck(element) {
  if (element.textContent.trim().length > 5) {
    //alert("This is a fact");
    return "f"
  } else {
    //alert("This is an opinion");
    return "t"
  }
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}