const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- USERS DATA ----------------
const users = [
  { user_id: "U001", name: "Rahul" },
  { user_id: "U002", name: "Priya" },
  { user_id: "U003", name: "Amit" },
  { user_id: "U004", name: "Neha" },
  { user_id: "U005", name: "Rohan" },
  { user_id: "U006", name: "Anjali" },
  { user_id: "U007", name: "Kunal" },
  { user_id: "U008", name: "Sneha" },
  { user_id: "U009", name: "Arjun" },
  { user_id: "U010", name: "Pooja" }
];

// ---------------- PARKING STATE ----------------
const TOTAL_SLOTS = 10;
let activeSessions = {};   // { user_id: { expiry } }

// ---------------- AVAILABILITY ----------------
app.get("/availability", (req, res) => {
  const used = Object.keys(activeSessions).length;
  res.json({
    available: TOTAL_SLOTS - used,
    status: used >= TOTAL_SLOTS ? "Parking Full" : "Slots Available"
  });
});

// ---------------- GENERATE QR ----------------
app.post("/generate-qr", async (req, res) => {
  const { user_id, duration } = req.body;

  const user = users.find(u => u.user_id === user_id);
  if (!user) {
    return res.json({ error: "Invalid User ID" });
  }

  if (activeSessions[user_id]) {
    return res.json({ error: "QR already active for this parking slot" });
  }

  if (Object.keys(activeSessions).length >= TOTAL_SLOTS) {
    return res.json({ error: "Parking Full" });
  }

  const now = Date.now();
  const expiry = now + duration * 60000;

  const qrData = {
    user_id,
    entry_time: new Date(now).toLocaleString(),
    expiry_time: new Date(expiry).toLocaleString()
  };

  const qr = await QRCode.toDataURL(JSON.stringify(qrData));

  activeSessions[user_id] = { expiry };

  res.json({ qr });
});

// ---------------- AUTO EXPIRY ----------------
setInterval(() => {
  const now = Date.now();
  for (let user in activeSessions) {
    if (now > activeSessions[user].expiry) {
      delete activeSessions[user];
      console.log(`Session expired for ${user}`);
    }
  }
}, 5000);

app.listen(5000, () => {
  console.log("✅ Server running at http://localhost:5000");
});
