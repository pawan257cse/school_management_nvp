# NVP School Portal — Deployment Guide

## Platform: Render.com (Free)
## Database: MongoDB Atlas (Free)

---

## Step 1: Setup MongoDB Atlas (Free Cloud Database)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account and click **"Build a Cluster"**
3. Choose **FREE (M0)** tier → Select any region → Click **Create**
4. Under **Security > Database Access** → Add a user (e.g. `nvp_admin` / `YourPassword123`)
5. Under **Security > Network Access** → Click **"Add IP Address"** → Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Go to **Database** → Click **Connect** → **Connect your application**
7. Copy your connection string — it looks like:
   ```
   mongodb+srv://nvp_admin:YourPassword123@cluster0.xxxxx.mongodb.net/nvp_school?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend on Render

1. Go to https://render.com and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo OR upload the code
4. Configure:
   - **Name**: `nvp-school-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://nvp_admin:YourPassword123@cluster0.xxxxx.mongodb.net/nvp_school?retryWrites=true&w=majority
   JWT_SECRET=nvp_school_super_secret_jwt_2026
   ```
6. Click **Deploy** — note the URL, e.g. `https://nvp-school-backend.onrender.com`

---

## Step 3: Deploy Frontend on Render (Static Site)

1. In Render, click **"New +"** → **"Static Site"**
2. Configure:
   - **Name**: `nvp-school-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Under **Environment Variables**, add:
   ```
   VITE_API_URL=https://nvp-school-backend.onrender.com
   ```
4. Click **Deploy**

---

## Alternative: Deploy BOTH on Same Render Service

The backend already serves the frontend `dist/` folder in production.
- **Root Directory**: `.` (root of project)
- **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
- **Start Command**: `node backend/server.js`
- Environment: `NODE_ENV=production`

---

## Login Credentials (after first deploy)

| Role | Email | Password |
|------|-------|----------|
| HEAD | head@school.local | Head@12345 |
| PRINCIPAL | principal@school.local | Principal@12345 |
| TEACHER | teacher@school.local | Teacher@12345 |
| STUDENT | student@school.local | Student@12345 |
