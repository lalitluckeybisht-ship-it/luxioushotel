# Luxora Hotel

A responsive hotel website with three room tiers, amenities, about section, contact form, and anonymous MongoDB-backed reviews.

## Room positioning
- Comfort Standard — ₹3,499/night — value-focused / middle-class travellers
- Executive Deluxe — ₹6,499/night — upper-middle-class travellers
- Royal Suite — ₹12,999/night — luxury / affluent travellers

## Run locally
1. Install Node.js 18+.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env` and add your MongoDB Atlas connection string.
4. Run `npm start`.
5. Open `http://localhost:3000`.

The review API stores only rating, room type, review text and timestamp. No name or email is collected for reviews, so the review form is anonymous by design.

## Deploy
Deploy the Node app to Render, Railway, or another Node host and set `MONGODB_URI` and `PORT` as environment variables. For production, connect the contact endpoint to an email provider or a Contact collection, and replace the example email/phone.
