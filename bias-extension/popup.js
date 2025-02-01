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
          //alert('Element in view:' + entry.target.textContent);
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
          observer.unobserve(entry.target); // Optional: Trigger only once
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
  

  // Select all elements to observe
  
}

// Get only visible headers, paragraphs, and articles
function getVisibleElements() {
    const els = document.querySelectorAll("*");
    console.log(els);

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
const memo = {};
// Highlight only visible elements based on user-selected color
async function highlightVisibleElements(highlightColor) {
    const visibleElements = getVisibleElements();
    /*
    visibleElements.forEach(element => async function(){
        const color = await highlightFunction(element, highlightColor);
        console.log(element.textContent + "before")
        element.style.backgroundColor = color || ''; // Apply color or reset if null
        console.log(element.textContent + "after")
    });*/
    
    for (const element of visibleElements) {
      const key = element.textContent.replace(/[\n\r\t]+/g, '').trim();
      if (key === "") {
        continue; // Skip empty elements
      }
      if (key in memo) {
        element.style.backgroundColor = memo[key] // Skip duplicate elements
        console.log("DUPLICATE: " + key);
      }
      else{
        const color = await highlightFunction(element, highlightColor);
        console.log(key + " before");
        element.style.backgroundColor = color || ''; // Apply color or reset if null
        memo[key] = color;
        console.log(key + " after");
        console.log(memo);
      }
      
    }

    
}

// Dummy function for checking "fact" vs. "opinion"
async function sudoCheck(element) {
  let x =  await check(element.textContent.trim());
  console.log("JUST CHECKED: " + element.textContent.trim() + " and got " + x);
  return x;
  
  return "f";
}

