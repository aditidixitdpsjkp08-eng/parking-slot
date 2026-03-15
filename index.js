async function loadStatus() {
  const res = await fetch("http://localhost:5000/availability");
  const data = await res.json();
  document.getElementById("status").innerText =
    `${data.status} (${data.available} slots left)`;
}

async function generateQR() {
  const userId = document.getElementById("userId").value;

  const res = await fetch("http://localhost:5000/generate-qr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  document.getElementById("qrImage").src = data.qr;
  loadStatus();
}

loadStatus();
