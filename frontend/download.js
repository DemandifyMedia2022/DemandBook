const fs = require('fs');
const https = require('https');

https.get('https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzVkZDliOTdkZGI3YjQ5MmM4NjUxYTg0NDc4YzQ5NGNkEgsSBxDN7dDAxAoYAZIBIwoKcHJvamVjdF9pZBIVQhM3NzEyNDgwNDg1NDUwMzY4MTU4&filename=&opi=89354086', (res) => {
  const path = 'c:\\Users\\Sanjog Adhav\\Desktop\\Demand-ERP\\test.html'; 
  const filePath = fs.createWriteStream(path);
  res.pipe(filePath);
  filePath.on('finish', () => {
    filePath.close();
    console.log('Download Completed'); 
  });
});
