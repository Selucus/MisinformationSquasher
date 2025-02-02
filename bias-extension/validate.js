async function checkData(data) {
  try {
      let message = "I am going to send you a sentence posted by a user online. This sentence could be a fact that is false, a true fact or just a statement. Use sentiment analysis to judge whether the information is a fact or just a statement. If it is a fact, you need to check if the fact is true or false using generally available knowledge or reputable internet sources. If it is a false fact, return the word 'false'. Otherwise, if it is a statement or a truthful fact return 'true'. If the sentence is a question, return 'true'. If the claim is false, I want you to return a response structured like this: the user said this: <insert what the user said> but this is false because <insert your explanation>. Examples: 'The Earth revolves around the Sun.' → This is a true statement based on well-established scientific evidence, so return true. 'Why do trees sneeze when it rains?' → This is a question, so return true. 'The speed of light is approximately 299,792 kilometers per second.' → This is a scientifically verified fact about the speed of light in a vacuum, so return true. 'Can a human breathe underwater without any equipment?' → Question, so return true. 'Do unicorns live in hidden forests?' → Question, so return true. 'The human body has 206 bones.' → The human body has 206 bones on average in adulthood, so return true. 'Apples grow on bushes, not trees.' → This is a false fact as apples grow on trees, so return false. 'The Eiffel Tower was built in the 20th century.' → The Eiffel Tower was completed in 1889, making it a 19th-century structure, so return false. 'The Atlantic Ocean is the largest ocean on Earth.' → The Pacific Ocean is the largest ocean on Earth, so return false. The information I want you to check is: " + data; 
      const response = await fetch("https://647f-2a0c-5bc0-40-3e28-f6-29b3-dba8-2098.ngrok-free.app/api/generate", {
          method: 'POST',  // HTTP method
          headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
          
          body: JSON.stringify({
              "model": "deepseek-r1:1.5b",
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

      if (t > f) {
          return "t"; // True claim
      } else {
          return "f"; // Opinion
      }

  } catch (error) {
      console.error(error);
      return "error";
  }
}

