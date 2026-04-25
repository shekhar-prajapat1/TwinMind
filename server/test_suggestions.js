import http from 'http';

const data = JSON.stringify({
  transcript: "Hi, I'm thinking about organizing a team offsite next month. Does anyone have ideas for locations? We want something relaxing but also good for team building activities.",
  suggestionPrompt: "Based on the transcript, generate 3 suggestions."
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/suggestions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_GROQ_API_KEY'
  }
};

const req = http.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => { responseBody += chunk; });
  res.on('end', () => { 
    try {
      const parsed = JSON.parse(responseBody);
      console.log("Suggestions received:\n", JSON.stringify(parsed, null, 2));
    } catch {
      console.log("Raw Response:\n", responseBody);
    }
  });
});

req.on('error', (e) => { console.error(`Problem with request: ${e.message}`); });
req.write(data);
req.end();
