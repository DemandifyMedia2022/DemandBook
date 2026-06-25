const email = "test@example.com";

fetch("http://localhost:8888/api/forgot-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
