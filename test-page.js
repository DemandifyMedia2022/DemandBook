const http = require('http');

http.get('http://localhost:3000/forgot-password', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response Length:', data.length);
    if (res.statusCode !== 200) {
      console.log('Error content:', data.substring(0, 500));
    } else {
      console.log('Page loaded successfully');
    }
  });
}).on('error', (err) => {
  console.error('Request Error:', err.message);
});
