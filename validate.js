async function checkData(data) {
    try {
        let message = "I am going to send you information posted by a user online. This information could be an opinion or it could be a fact or claim about the news that might be true or false. If it is an opinion, I would you like you to just return the word ‘opinion’. It is very important you only return the word ‘opinion’ if it is an opinion. If it is a fact or claim about the news, you need to check if, based on generally available knowledge or news articles from reputable sources, the claim is true or false. If the claim is true, return just the word 'true'. It is very important you return just the word 'true'. If the claim is false, I want you to return a response structured like this: the user said this: <insert what the user said> but this is false because <insert your explanation>. MAKE SURE YOU RESPOND USING THE REQUIREMENTS I HAVE SENT. The information I want you to check is this: " +data;
        //console.log(message);
        const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: 'POST',               // HTTP method
            headers: { 'Content-Type': 'application/json' },
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

  async function check(data){
    checkData(data).then((result) => {

        wordCount = countWordOccurrences(removeThinkTags(result));
        console.log("Opinions: " + wordCount["opinion"]);
        console.log("True: " + wordCount["true"]);
        console.log("False: " + wordCount["false"]);
        let o = wordCount["opinion"];
        let t = wordCount["true"];
        let f = wordCount["false"];
        if (t > o && t > f) {
        return "t";
        }else if(f > o && f > t){
        return "f";
        }else{
            return "o";
        }
    
    }).catch((error) => {
        console.error(error);
        return "error";
    });
  }