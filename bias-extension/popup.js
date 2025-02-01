console.log("Popup script loaded");

let highlightColor = "#FFFF00"; // Default yellow

document.addEventListener('DOMContentLoaded', function () {
    const highlightSwitch = document.getElementById("highlightSwitch");
    const highlightColorPicker = document.getElementById("highlightColorPicker");

    // Get the saved state and highlight color from localStorage
    /*
    chrome.storage.local.get(["highlightEnabled", "highlightColor"], function (result) {
        const highlightEnabled = result.highlightEnabled || false;
        const highlightColor = result.highlightColor || "#FFFF00"; // Default yellow
        highlightSwitch.checked = highlightEnabled;
        highlightColorPicker.value = highlightColor;

        // Initialize highlight based on saved state
        toggleHighlight(highlightEnabled, highlightColor);
    });*/

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
                    args: [true, highlightColorPicker.value]
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
                    args: [true, highlightColor]
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

function handleInView(entries, observer) {
  entries.forEach(entry => {
      if (entry.isIntersecting) {
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            if (tab && tab.id) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: toggleHighlight,
                    args: [true, highlightColorPicker.value]
                });
            } else {
                console.error("Tab not found or invalid tab ID.");
            }
          });
          entry.target.classList.add('visible'); // Add visible class
          observer.unobserve(entry.target); // Stop observing once processed
      }
  });
}

const observer = new IntersectionObserver(handleInView, {
  root: null, // Default is viewport
  rootMargin: "0px",
  threshold: 0.1 // Trigger when 10% of the element is visible
});

// Toggle highlighting based on the state
function toggleHighlight(enabled, highlightColor) {
    console.log("toggleHighlight running with enabled:", enabled, "and color:", highlightColor);
    if (enabled) {
        highlightVisibleElements(highlightColor);
    } else {
        revertContentChanges();
    }

  // Intersection Observer setup
  const visibleElements = getVisibleElements();
  visibleElements.forEach(element => observer.observe(element));
}

// Get only visible headers, paragraphs, and articles
function getVisibleElements() {
    const els = document.querySelectorAll("*");

  // Attach observer to each element
    els.forEach(element => observer.observe(element));
    const elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, article, em, strong, b, i, u, a, span");
    
    return Array.from(elements).filter(element => {
        const rect = element.getBoundingClientRect();
        return isVisible(element) && rect.top < window.innerHeight && rect.bottom > 0;
    });
}

// Function to decide highlight color based on criteria
async function highlightFunction(element, highlightColor) {
    let x = await sudoCheck(element) === "f" ? highlightColor : null;
    console.log("Highlight color:" + x);
    return x;
}

let memo = {};

// Highlight only visible elements based on user-selected color
async function highlightVisibleElements(highlightColor) {
    const visibleElements = getVisibleElements();
    
    // Iterate over each element
    for (const element of visibleElements) {
      if (element.textContent.trim() === "") {
        continue; // Skip empty elements
      }
<<<<<<< HEAD
      if (key in memo) {
        element.style.backgroundColor = memo[key] // Skip duplicate elements
        console.log("DUPLICATE: " + key);
=======
      if (String(element.textContent.trim()) in memo) {
        element.style.backgroundColor = memo[element.textContent.trim()] // Skip duplicate elements
>>>>>>> b54a565f5c905111015e9711d13bcfc5ad43de46
      }
      else{
        const color = await highlightFunction(element, highlightColor);
        console.log(element.textContent + " before");
        element.style.backgroundColor = color || ''; // Apply color or reset if null
        memo[String(element.textContent.trim())] = color;
        console.log(element.textContent + " after");
        console.log(memo);
      }
      
    }

    
}

// Dummy function for checking "fact" vs. "opinion"
async function sudoCheck(element) {
  let x =  await check(element.textContent.trim());
  console.log(x);
  return x;
}

