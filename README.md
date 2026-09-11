# The Royal Hotel

## Structure
the_royal_hotel/
- package.json
- server.js
- .env.example
- public/index.html
- public/app.js
- public/styles.css

## Render
Build Command: `npm install`
Start Command: `node server.js`

Set `MONGODB_URI` in Render Environment Variables.

## Checked
- Node syntax checked with `node --check`
- Express 5 fallback does NOT use `app.get("*")`
- `server.js` is in the root, so static path is `./public`
- Reviews and enquiries have MongoDB models and API endpoints
