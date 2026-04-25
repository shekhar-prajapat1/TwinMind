import http from 'http';

const data = JSON.stringify({
  message: "Hello TwinMind!",
  transcript: "Hello. How are you?",
  chatPrompt: "Provide a helpful answer."
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_GROQ_API_KEY'
  }
};

const req = http.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => { responseBody += chunk; });
  res.on('end', () => { console.log("Response:", responseBody); });
});

req.on('error', (e) => { console.error(`Problem with request: ${e.message}`); });
req.write(data);
req.end();
