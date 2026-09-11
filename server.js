const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String, required: true, maxlength: 1000 },
  roomType: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', reviewSchema);

const rooms = [
  { id: 'comfort', name: 'Comfort Standard', audience: 'Smart value', price: 3499, description: 'A clean, comfortable stay with everything you need for a relaxed trip.', features: ['Queen bed', 'Breakfast for 2', 'Wi-Fi', 'Smart TV', 'Work desk'] },
  { id: 'executive', name: 'Executive Deluxe', audience: 'Upper-middle class', price: 6499, description: 'More space, premium interiors and thoughtful extras for business or leisure.', features: ['King bed', 'Breakfast for 2', 'High-speed Wi-Fi', 'Mini fridge', 'City-view balcony', 'Airport transfer'] },
  { id: 'royal', name: 'Royal Suite', audience: 'Luxury stay', price: 12999, description: 'Our signature suite with elegant living space and elevated hospitality.', features: ['King bed', 'Separate living room', 'Premium breakfast', 'Bathtub', 'Lounge access', 'Butler-style service'] }
];

app.get('/api/rooms', (req, res) => res.json(rooms));
app.get('/api/amenities', (req, res) => res.json([
  { icon: '◈', title: 'Infinity Pool', text: 'A calm rooftop pool with sunset views.' },
  { icon: '⌁', title: 'Wellness Studio', text: 'Gym, yoga corner and relaxing spa treatments.' },
  { icon: '✦', title: 'All-day Dining', text: 'Indian and international dishes made fresh.' },
  { icon: '◉', title: 'Fast Wi-Fi', text: 'Reliable high-speed Wi-Fi throughout the hotel.' },
  { icon: '◇', title: 'Airport Transfers', text: 'Comfortable pickup and drop-off on request.' },
  { icon: '♢', title: '24/7 Concierge', text: 'Local recommendations and support, anytime.' }
]));

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(20).select('-__v');
    res.json(reviews);
  } catch (e) { res.status(500).json({ error: 'Could not load reviews' }); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { rating, message, roomType } = req.body;
    if (!rating || !message || Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ error: 'Rating and message are required.' });
    const review = await Review.create({ rating: Number(rating), message: String(message).trim(), roomType: roomType || 'General' });
    res.status(201).json({ ok: true, review: { rating: review.rating, message: review.message, roomType: review.roomType, createdAt: review.createdAt } });
  } catch (e) { res.status(500).json({ error: 'Could not save review. Check MongoDB connection.' }); }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Please complete all fields.' });
  // Demo endpoint: connect this to an email service or Contact collection in production.
  console.log('Contact request:', { name, email, message });
  res.json({ ok: true, message: 'Thanks — our concierge will get back to you.' });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

const port = process.env.PORT || 3000;
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(port, () => console.log(`Luxora Hotel running on http://localhost:${port}`)))
    .catch(err => { console.error('MongoDB connection failed:', err.message); app.listen(port, () => console.log(`Running without MongoDB on http://localhost:${port}`)); });
} else {
  app.listen(port, () => console.log(`Running without MongoDB on http://localhost:${port}`));
}
