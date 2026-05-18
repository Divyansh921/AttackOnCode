# ⚔️ Attack on Code — Launch Guide

Follow these steps to launch the entire hackathon collaboration ecosystem.

## 🛠️ Step 1 — Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **PostgreSQL** (Running locally or via Docker)
- **Redis** (Optional, required for background jobs and real-time caching)

---

## 🏗️ Step 2 — Backend Setup

1. **Configure Environment**:
   ```bash
   cd backend
   cp .env.example .env
   ```
   *Edit `.env` and provide your `DATABASE_URL`, `JWT_SECRET`, and `RESEND_API_KEY`.*

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Migration**:
   ```bash
   npm run prisma:migrate
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *The API will be live at `http://localhost:3001`.*

---

## 🎨 Step 3 — Frontend Setup

1. **Configure Environment**:
   ```bash
   cd frontend
   # Create a .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > .env.local
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Next.js App**:
   ```bash
   npm run dev
   ```
   *The site will be live at `http://localhost:3000`.*

---

## 🧪 Step 4 — Verification
- Visit `http://localhost:3000` to see the Home Page.
- Click **"Join Community"** to register.
- Check the **"Live Activity"** feed on the home page as you interact.
- Browse **Builders**, **Teams**, and **Hackathons** to see the real-time data connection.

## 🔑 Key Credentials (Placeholder)
If you haven't seeded the database yet, register a new user via the `/register` page to get started.

---
*Dedicate your heart to the build.* ⚔️
