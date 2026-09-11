const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// IMPORTANT:
// server.js is in the ROOT folder.
// public is directly inside the ROOT folder.
const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));

// ==================== ROOMS ====================

const rooms = [
  {
    id: 'comfort',
    name: 'Comfort Standard',
    audience: 'Smart value',
    price: 3499,
    description:
      'A clean, comfortable stay with everything you need for a relaxed trip.',
    features: [
      'Queen bed',
      'Breakfast for 2',
      'Wi-Fi',
      'Smart TV',
      'Work desk'
    ]
  },
  {
    id: 'executive',
    name: 'Executive Deluxe',
    audience: 'Upper-middle class',
    price: 6499,
    description:
      'More space, premium interiors and thoughtful extras for business or leisure.',
    features: [
      'King bed',
      'Breakfast for 2',
      'High-speed Wi-Fi',
      'Mini fridge',
      'City-view balcony',
      'Airport transfer'
    ]
  },
  {
    id: 'royal',
    name: 'Royal Suite',
    audience: 'Luxury stay',
    price: 12999,
    description:
      'Our signature suite with elegant living space and elevated hospitality.',
    features: [
      'King bed',
      'Separate living room',
      'Premium breakfast',
      'Bathtub',
      'Lounge access',
      'Butler-style service'
    ]
  }
];

app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// ==================== AMENITIES ====================

app.get('/api/amenities', (req, res) => {
  res.json([
    {
      icon: '◈',
      title: 'Infinity Pool',
      text: 'A calm rooftop pool with sunset views.'
    },
    {
      icon: '⌁',
      title: 'Wellness Studio',
      text: 'Gym, yoga corner and relaxing spa treatments.'
    },
    {
      icon: '✦',
      title: 'All-day Dining',
      text: 'Indian and international dishes made fresh.'
    },
    {
      icon: '◉',
      title: 'Fast Wi-Fi',
      text: 'Reliable high-speed Wi-Fi throughout the hotel.'
    },
    {
      icon: '◇',
      title: 'Airport Transfers',
      text: 'Comfortable pickup and drop-off on request.'
    },
    {
      icon: '♢',
      title: '24/7 Concierge',
      text: 'Local recommendations and support, anytime.'
    }
  ]);
});

// ==================== MONGODB ====================

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },

  message: {
    type: String,
    required: true,
    maxlength: 1000
  },

  roomType: {
    type: String,
    default: 'General'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

// Get reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-__v');

    res.json(reviews);
  } catch (error) {
    console.error('Review load error:', error);

    res.status(500).json({
      error: 'Could not load reviews'
    });
  }
});

// Add review
app.post('/api/reviews', async (req, res) => {
  try {
    const { rating, message, roomType } = req.body;

    if (
      !rating ||
      !message ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        error: 'Rating and message are required.'
      });
    }

    const cleanMessage = String(message).trim();

    if (!cleanMessage) {
      return res.status(400).json({
        error: 'Message cannot be empty.'
      });
    }

    const review = await Review.create({
      rating: Number(rating),
      message: cleanMessage,
      roomType: roomType || 'General'
    });

    res.status(201).json({
      ok: true,
      review: {
        rating: review.rating,
        message: review.message,
        roomType: review.roomType,
        createdAt: review.createdAt
      }
    });

  } catch (error) {
    console.error('Review save error:', error);

    res.status(500).json({
      error: 'Could not save review. Check MongoDB connection.'
    });
  }
});

// ==================== CONTACT ====================

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Please complete all fields.'
    });
  }

  console.log('Contact request:', {
    name,
    email,
    message
  });

  res.json({
    ok: true,
    message: 'Thanks — our concierge will get back to you.'
  });
});

// ==================== FRONTEND ====================

// Send index.html for normal browser requests.
// Do NOT use app.get('*') because newer Express routers can reject it.
app.use((req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ==================== START SERVER ====================

const port = process.env.PORT || 3000;

async function startServer() {

  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error(
        'MongoDB connection failed:',
        error.message
      );

      console.log('Continuing without MongoDB...');
    }
  } else {
    console.log(
      'MONGODB_URI not found. Running without MongoDB.'
    );
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Luxora Hotel running on port ${port}`);
  });
}

startServer();
