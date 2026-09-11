const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

const reviewSchema = new mongoose.Schema({
  name: { type: String, default: "Anonymous", maxlength: 80, trim: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String, required: true, maxlength: 1000, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80, trim: true },
  email: { type: String, required: true, maxlength: 160, trim: true },
  phone: { type: String, maxlength: 30, trim: true },
  date: { type: String, maxlength: 30, trim: true },
  guests: { type: Number, min: 1, max: 50 },
  message: { type: String, required: true, maxlength: 1500, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const Review = mongoose.model("Review", reviewSchema);
const Enquiry = mongoose.model("Enquiry", enquirySchema);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, mongodb: mongoose.connection.readyState === 1 });
});

app.get("/api/menu", (req, res) => res.json([
  { category: "Starters", items: [
    { name: "Royal Paneer Tikka", price: 499, description: "Charred cottage cheese, saffron yoghurt and herbs." },
    { name: "Tandoori Prawns", price: 699, description: "Smoked prawns, royal spice glaze and lemon." },
    { name: "Crispy Lotus Stem", price: 399, description: "Lotus stem, sesame, chilli and honey." }
  ]},
  { category: "Mains", items: [
    { name: "Dal Royal", price: 449, description: "Slow-cooked black lentils finished with butter and cream." },
    { name: "Murgh Angare", price: 699, description: "Tandoori chicken, rich tomato gravy and kasuri methi." },
    { name: "Royal Vegetable Biryani", price: 549, description: "Aromatic basmati rice, vegetables, saffron and raita." }
  ]},
  { category: "Desserts", items: [
    { name: "Saffron Gulab Jamun", price: 299, description: "Warm gulab jamun, saffron rabri and pistachio." },
    { name: "Royal Chocolate Torte", price: 349, description: "Dark chocolate, sea salt and vanilla cream." }
  ]}
]));

app.get("/api/experiences", (req, res) => res.json([
  { name: "Royal Dining", audience: "SIGNATURE", price: "₹1,499 onwards", description: "Elegant dining with Indian and international favourites." },
  { name: "Chef's Table", audience: "EXCLUSIVE", price: "₹2,999 per guest", description: "A curated tasting experience for special occasions." },
  { name: "Private Dining", audience: "CELEBRATIONS", price: "₹4,999 onwards", description: "A refined private setting for celebrations and business dinners." }
]));

app.get("/api/reviews", async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json([]);
  try {
    res.json(await Review.find().sort({ createdAt: -1 }).limit(30));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not load reviews." });
  }
});

app.post("/api/reviews", async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ error: "Reviews are temporarily unavailable." });

  const { name, rating, message } = req.body;
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5 || !String(message || "").trim())
    return res.status(400).json({ error: "Please provide a rating from 1 to 5 and a message." });

  try {
    const review = await Review.create({
      name: String(name || "Anonymous").trim() || "Anonymous",
      rating: r,
      message: String(message).trim()
    });
    res.status(201).json({ ok: true, review });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not save review." });
  }
});

app.post("/api/enquiries", async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ error: "Enquiries are temporarily unavailable." });

  const { name, email, phone, date, guests, message } = req.body;
  if (!String(name || "").trim() || !String(email || "").trim() || !String(message || "").trim())
    return res.status(400).json({ error: "Name, email and message are required." });

  const g = guests === "" || guests == null ? undefined : Number(guests);
  if (g !== undefined && (!Number.isInteger(g) || g < 1 || g > 50))
    return res.status(400).json({ error: "Guests must be between 1 and 50." });

  try {
    const enquiry = await Enquiry.create({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || "").trim(),
      date: String(date || "").trim(),
      guests: g,
      message: String(message).trim()
    });
    res.status(201).json({ ok: true, id: enquiry._id, message: "Thank you. Our team will contact you shortly." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not save your enquiry." });
  }
});

// Express 5 safe fallback — deliberately NOT app.get("*")
app.use((req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
      console.log("MongoDB connected successfully.");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
    }
  } else {
    console.log("MONGODB_URI not found. Running without MongoDB.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Royal Hotel running on port ${PORT}`);
  });
}
start().catch(error => { console.error(error); process.exit(1); });
