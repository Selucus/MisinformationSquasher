console.log("Popup script loaded");

let highlightColor = "#FFFF00"; // Default yellow

document.addEventListener('DOMContentLoaded', function () {
    const highlightSwitch = document.getElementById("highlightSwitch");
    const highlightColorPicker = document.getElementById("highlightColorPicker");
    // Get the stored highlight state when the popup is opened
    chrome.storage.local.get(['highlightEnabled', 'highlightColor'], function (data) {
        const highlightEnabled = data.highlightEnabled !== undefined ? data.highlightEnabled : false;
        const highlightColor = data.highlightColor || "#FFFF00"; // Default color if not set

        // Set the initial state of the highlight switch and color picker
        highlightSwitch.checked = highlightEnabled;
        highlightColorPicker.value = highlightColor;

        // Apply the highlight settings immediately
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            if (tab && tab.id) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: toggleHighlight,
                    args: [highlightEnabled, highlightColor]
                });
            } else {
                console.error("Tab not found or invalid tab ID.");
            }
        });
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
        highlightColor = highlightColorPicker.value;
        chrome.storage.local.set({ highlightColor });

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            if (tab && tab.id) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: toggleHighlight,
                    args: [highlightEnabled, highlightColor]
                });
            } else {
                console.error("Tab not found or invalid tab ID.");
            }
        });
    });
});

// Function to remove highlights
function revertContentChanges() {
  // Select all elements that were previously highlighted (those with a background color applied)
  const highlightedElements = document.querySelectorAll("span[style*='background-color:']");
  
  // Reset the background color for each of them
  highlightedElements.forEach(element => {
      element.style.backgroundColor = ''; // Reset background color
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
      chrome.runtime.sendMessage({ action: "getTabInfo", color: highlightColor });
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
    const elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, article, em, strong, b, i, u, a, span, div");
    
    return Array.from(elements).filter(element => {
        const rect = element.getBoundingClientRect();
        return isVisible(element) && rect.top < window.innerHeight && rect.bottom > 0;
    });
}

// Function to decide highlight color based on criteria
async function highlightFunction(sentence, highlightColor) {
    let x = await sudoCheck(sentence) === "f" ? highlightColor : null;
    console.log("Highlight color:" + x);
    return x;
}

let memo = {};

// Highlight only visible elements based on user-selected color
async function highlightVisibleElements(highlightColor) {
    let visibleSentences = extractSentences().filter(sentence => isPositiveStatement(sentence)).map(sentence => sentence.trim());
    visibleSentences = [...new Set(visibleSentences)]
    console.log(visibleSentences);
    
    // Iterate over each element
    for (const sentence of visibleSentences) {
      if (!sentence) {
        continue; // Skip empty elements
      }
      if (sentence in memo) {
        replaceText(sentence, memo[sentence]);
      }
      else{
        console.log(sentence + " is a positive statement")
        const color = await highlightFunction(sentence, highlightColor);
        if (color) {
          replaceText(sentence, color);
        };
        memo[sentence] = color;
        console.log(memo);
      }
    }
    console.log("Done!")

    
}

// Function to replace text with highlighted text
function replaceText(sentence, color) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  
  while (node = walker.nextNode()) {
      if (node.nodeValue.includes(sentence)) {
          const span = document.createElement("span");
          span.style.backgroundColor = color;
          span.textContent = sentence;
          
          const parts = node.nodeValue.split(sentence);
          const fragment = document.createDocumentFragment();
          
          fragment.append(parts[0], span, parts[1]);
          node.parentNode.replaceChild(fragment, node);
      }
  }
}


// Dummy function for checking "fact" vs. "opinion"
async function sudoCheck(text) {
  return await check(text);
}


function extractSentences() {
  let sentences = [];

  // Collect all the paragraphs, headings, and other text-bearing elements (can add more elements if necessary)
  const elements = getVisibleElements();

  // Helper function to split text into sentences considering edge cases
  function splitTextIntoSentences(text) {
    // Enhanced regular expression to split sentences, with better handling of abbreviations and edge cases
    const sentenceRegex = /(?<!\b(?:[A-Za-z]{2,}\.|[0-9]+\.[0-9]+|Dr|Mr|Mrs|Ms|Jr|e\.g|i\.e|U\.S|vs|etc)\s)(?<!\s(?:Jr|Sr|II|III|IV|V))([·.!?])\s+/g;

    // Split the text into sentences, making sure we remove empty or invalid entries
    const sentencesArray = text.split(sentenceRegex).map(sentence => sentence.trim()).filter(Boolean);

    return sentencesArray;
  }

  // Extract sentences from elements
  elements.forEach(elem => {
    const text = elem.textContent.trim();
    if (text) {
      sentences.push(...splitTextIntoSentences(text));
    }
  });
  console.log("extracted")
  return sentences;
}


function isPositiveStatement(text) {
  // Convert the text into a Compromise document
  let doc = nlp(text.toLowerCase());

  // Expanded list of factual indicators to look for in the sentence
  const factualIndicators = [
    "study", "research", "survey", "data", "evidence", "confirmed", 
    "scientists", "experts", "findings", "analysis", "according to", 
    "reported", "results", "discovered"
  ];

  // Step 1: Check for factual indicators in the sentence
  let containsFactualIndicators = factualIndicators.some(word => doc.has(word));

  // Step 2: Check for the structure of the sentence (Noun + Verb or Verb + Noun)
  let hasSubjectVerbStructure = doc.has('#Noun #Verb') || doc.has('#Verb #Noun');

  // Step 3: Handle negations (e.g., 'not', 'never', 'is not')
  
  


  // Step 4: Return true if both a factual indicator is found and the sentence has the expected structure
  return hasSubjectVerbStructure;
}