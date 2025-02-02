async function checkData(data) {
  try {
    let message =  "Classify the following statement as 'true' or 'false'. If it is an opinion or unclear, classify it as true. Only use infomration that is universally accepted. Reply with one word only: "+ data; 
  
    //let message =  "Classify the following statement as 'true', 'false' or 'neither'. If it is an opinion or unclear, classify it as neither. Only use infomration that is universally accepted. Reply with one word only: "+ data; 
      const response = await fetch("http://127.0.0.1:8080/api/generate", {

          method: 'POST',  // HTTP method
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
          
          body: JSON.stringify({
              "model": "openchat:latest",
              "prompt": message,
              "stream": false
          }),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json(); // Parse JSON response
      let LLMresponse = result.response;
      
      return LLMresponse;
  } catch (error) {
      console.error('Error:', error);
      throw error; // Re-throw error to be handled by the caller
  }
}

function removeThinkTags(text) {
  // Regex to match <think>...</think> including multiline content
  return text.replace(/<think>[\s\S]*?<\/think>/g, '');
}

function countWordOccurrences(text) {
  // Normalize the text: convert to lowercase and remove punctuation
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');

  // Split the text into words based on spaces
  const words = cleanText.split(/\s+/);

  // Count occurrences using an object
  const wordCount = {};

  words.forEach(word => {
      if (word) { // Skip empty strings
          wordCount[word] = (wordCount[word] || 0) + 1;
      }
  });

  return wordCount;
}

// Function to check if a claim is opinion, true or false
async function check(data) {
  try {
      let result = await checkData(data); // Wait for the response

      let wordCount = countWordOccurrences(removeThinkTags(result));
      
      let t = wordCount["true"] || 0;
      let f = wordCount["false"] || 0;

      console.log(result);

      if (t >= f) {
          return "t"; // True claim
      } else {
          return "f"; // Opinion
      }

  } catch (error) {
      console.error(error);
      return "error";
  }
}

