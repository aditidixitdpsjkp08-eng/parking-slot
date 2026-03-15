const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const QRCode = require("qrcode");

const router = express.Router();

let users = [];
const TOTAL_SLOTS = 5;
let occupiedSlots = [1, 3]; // YOLO Stub (occupied slots)

// Load CSV dataset
fs.createReadStream("./dataset/users.csv")
  .pipe(csv())
  .on("data", (row) => users.push(row));

// Check availability
router.get("/availability", (req, res) => {
  const free = TOTAL_SLOTS - occupiedSlots.length;

  res.json({
    available: free > 0,
    freeSlots: free
  });
});

// Generate QR
router.post("/generate-qr", async (req, res) => {
  const { user_id } = req.body;

  const user = users.find(u => u.user_id === user_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (occupiedSlots.length >= TOTAL_SLOTS) {
    return res.status(400).json({ message: "Parking Full" });
  }

  const slotAssigned = occupiedSlots.length + 1;
  occupiedSlots.push(slotAssigned);

  const qrData = {
    user_id: user.user_id,
    name: user.name,
    vehicle: user.vehicle_number,
    slot: slotAssigned,
    entry: user.entry_time,
    exit: user.exit_time
  };

  const qr = await QRCode.toDataURL(JSON.stringify(qrData));

  res.json({
    success: true,
    qr
  });
});

module.exports = router;
