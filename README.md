# This Week in Philly 🏙️

> Philadelphia's weekly event guide — concerts, food, arts, sports, family & nightlife.  
> Auto-updated every 15 minutes from Ticketmaster & Eventbrite.

**Live site:** [thisweekinphilly.com](https://thisweekinphilly.com)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Hosting | Render (2 services) |
| Domain | GoDaddy → thisweekinphilly.com |
| Data | Ticketmaster API + Eventbrite API |

---

## Project Structure

```
thisweekinphilly/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── utils/
├── server/          # Express API backend
│   └── src/
│       ├── routes/
│       └── services/
├── render.yaml      # Render deployment config
└── README.md
```

---

## Step 1: Get Your API Keys

### Ticketmaster (Free)
1. Go to [developer.ticketmaster.com](https://developer.ticketmaster.com/)
2. Create an account → "Create New App"
3. Copy your **Consumer Key** — this is your API key

### Eventbrite (Free)
1. Go to [eventbrite.com/platform/api](https://www.eventbrite.com/platform/api)
2. Sign in → go to **Account Settings → Developer Links → API Keys**
3. Create a new key → copy the **Private Token**

---

## Step 2: Local Development

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/thisweekinphilly.git
cd thisweekinphilly

# Install all dependencies
npm run install:all

# Set up server environment
cd server
cp .env.example .env
# Edit .env and add your API keys

# Run both frontend + backend
cd ..
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Step 3: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

---

## Step 4: Deploy to Render

1. Go to [render.com](https://render.com) → Dashboard
2. Click **New → Blueprint** (this uses `render.yaml` automatically)
3. Connect your GitHub repo
4. Render will create **two services**:
   - `thisweekinphilly-api` (backend)
   - `thisweekinphilly-client` (frontend)
5. In each service → **Environment** → add your secret keys:
   - `thisweekinphilly-api`: add `TICKETMASTER_API_KEY` and `EVENTBRITE_API_KEY`
6. Deploy!

Note your backend URL (e.g. `https://thisweekinphilly-api.onrender.com`) — you'll need it for the frontend env var `VITE_API_URL`.

---

## Step 5: Connect Your GoDaddy Domain

### Point thisweekinphilly.com → Render frontend

1. In Render → `thisweekinphilly-client` → **Settings → Custom Domains**
2. Add `thisweekinphilly.com` and `www.thisweekinphilly.com`
3. Render gives you a **CNAME value** (e.g. `thisweekinphilly-client.onrender.com`)

4. In **GoDaddy DNS**:
   - Add a `CNAME` record: `www` → your Render CNAME
   - For the apex domain (`@`), add an `A` record pointing to Render's IP  
     *(Render will show you the exact IP in the custom domain setup)*

5. SSL is handled automatically by Render — no action needed.

DNS propagation takes 5–30 minutes.

---

## Adding More Event Sources Later

To add a new API (e.g. Do215, Visit Philadelphia):
1. Create a new service file in `server/src/services/`
2. Import and call it in `server/src/routes/events.js`
3. That's it — the frontend updates automatically

---

## Auto-Refresh Schedule

- **Server cache**: Events cached for 15 minutes per request (reduces API calls)
- **Client auto-refresh**: Frontend re-fetches every 15 minutes
- **API rate limits**: Ticketmaster allows 5,000 calls/day free; Eventbrite allows unlimited reads
