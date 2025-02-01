console.log("Popup script loaded");

document.addEventListener('DOMContentLoaded', function () {
    const highlightSwitch = document.getElementById("highlightSwitch");
    const highlightColorPicker = document.getElementById("highlightColorPicker");

    // Get the saved state and highlight color from localStorage
    chrome.storage.local.get(["highlightEnabled", "highlightColor"], function (result) {
        const highlightEnabled = result.highlightEnabled || false;
        const highlightColor = result.highlightColor || "#FFFF00"; // Default yellow
        highlightSwitch.checked = highlightEnabled;
        highlightColorPicker.value = highlightColor;

        // Initialize highlight based on saved state
        toggleHighlight(highlightEnabled, highlightColor);
    });

    // Toggle switch event listener
    highlightSwitch.addEventListener("change", function () {
        const highlightEnabled = highlightSwitch.checked;
        chrome.storage.local.set({ highlightEnabled });

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

    // Color picker event listener
    highlightColorPicker.addEventListener("input", function () {
        const highlightColor = highlightColorPicker.value;
        chrome.storage.local.set({ highlightColor });

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

// Function to remove highlights
function revertContentChanges() {
    document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, article").forEach(element => {
        element.style.backgroundColor = ''; // Reset background
    });
}

// Function to check if a text node is visible
function isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
}

// Toggle highlighting based on the state
function toggleHighlight(enabled, highlightColor) {
    console.log("toggleHighlight running with enabled:", enabled, "and color:", highlightColor);
    if (enabled) {
        highlightVisibleElements(highlightColor);
    } else {
        revertContentChanges();
    }
}

// Get only visible headers, paragraphs, and articles
function getVisibleElements() {
    const elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, article");
    return Array.from(elements).filter(element => {
        const rect = element.getBoundingClientRect();
        return isVisible(element) && rect.top < window.innerHeight && rect.bottom > 0;
    });
}

// Function to decide highlight color based on criteria
function highlightFunction(element, highlightColor) {
    return sudoCheck(element) === "f" ? highlightColor : null;
}

// Highlight only visible elements based on user-selected color
function highlightVisibleElements(highlightColor) {
    const visibleElements = getVisibleElements();

    visibleElements.forEach(element => {
        const color = highlightFunction(element, highlightColor);
        element.style.backgroundColor = color || ''; // Apply color or reset if null
    });
}

// Dummy function for checking "fact" vs. "opinion"
function sudoCheck(element) {
    return element.textContent.trim().length > 5 ? "f" : "t";
}
