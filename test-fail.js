const http = require('http');
const https = require('https');

const data = JSON.stringify({
  answers: [
    { questionIndex: 100, answer: 'Test Faculty', isOther: false }
  ]
});

const options = {
  hostname: 'teachers-mini-game.vercel.app',
  port: 443,
  path: '/api/vote',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Cookie': 'voter_session=test-token'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
