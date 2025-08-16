
document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const text = await res.text();
  if (text === "success") {
    window.location.href = "/dashboard.html";
  } else {
    document.getElementById("msg").innerText = text;
  }
});
