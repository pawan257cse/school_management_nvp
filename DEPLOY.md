# 🚀 NVP English Medium School — Production Deployment Guide

This guide explains how to deploy the entire school management portal on **Render.com** (Free) using **MongoDB Atlas** (Free Cloud Database).

---

## 📋 Pre-requisites (Both are 100% Free):
1. **GitHub Repository:** [pawan257cse/school_management_nvp](https://github.com/pawan257cse/school_management_nvp) (Already uploaded!)
2. **MongoDB Atlas Account:** Free cloud database for permanent 24x7 data storage.
3. **Render.com Account:** Free cloud hosting service.

---

## 🗄️ Step 1: Create Free MongoDB Atlas Cloud Database (2-3 Minutes)

1. Go to 👉 **[mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)**
2. Sign up with Google or Email.
3. When prompted to select a plan, choose **M0 (Free)**.
4. Select Cloud Provider (**AWS** or **Google Cloud**) and Region (**Mumbai** or **Singapore**). Click **Create Deployment / Create Cluster**.
5. **Set Username & Password:**
   - Username: `nvp_admin`
   - Password: `YourStrongPassword123` *(copy and save this!)*
   - Click **Create User**.
6. **Network Access (Allow All IPs):**
   - Under **Where would you like to connect from?**, choose **My Local Environment**.
   - Add IP Address: `0.0.0.0/0` (Description: `Allow from anywhere`).
   - Click **Add Entry** / **Finish and Close**.
7. **Get Connection String:**
   - Go to **Database** tab → Click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection string:
     ```text
     mongodb+srv://nvp_admin:<password>@cluster0.xxxxx.mongodb.net/nvp_school?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password (e.g. `YourStrongPassword123`).

---

## 🌐 Step 2: Deploy on Render.com (Single Web Service — Frontend + Backend)

1. Go to 👉 **[render.com](https://render.com)** and sign in with your **GitHub** account.
2. Click **New +** (top right) → Choose **Web Service**.
3. Under **Connect a repository**, find and select:  
   👉 **`school_management_nvp`**
4. Fill in the following settings:
   - **Name:** `nvp-school-portal` *(or your preferred name)*
   - **Region:** Singapore / Frankfurt
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Instance Type:** `Free`

5. **Environment Variables (Click "Advanced" or "Environment Variables"):**
   Add the following variables:

   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations & frontend serving |
   | `PORT` | `10000` | Port for Render web service |
   | `MONGODB_URI` | `mongodb+srv://nvp_admin:Password@cluster0.xxxxx.mongodb.net/nvp_school?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `nvp_school_super_secret_jwt_key_2026` | Any long random secret string |
   | `ADMIN_RECOVERY_KEY` | `NVP-HEAD-RECOVERY-KEY-2026` | Secret master key to reset admin password anytime |

6. Click **Create Web Service**.
7. Wait 3–4 minutes while Render:
   - Installs backend packages
   - Installs frontend packages & builds Vite production bundle
   - Starts Express server
8. **Done!** Your school portal will be live at:  
   👉 `https://nvp-school-portal.onrender.com`

---

## 🔑 Default Login Credentials (First-Time Login):

Once deployed, the database initializes with the following default accounts:

| Role | Email / ID | Initial Password | Permissions |
|------|------------|------------------|-------------|
| **HEAD (Director/Admin)** | `head@school.local` | `Head@12345` | Full access to all data, fees, timetable, staff, credentials & logs |
| **PRINCIPAL** | `principal@school.local` | `Principal@12345` | Academic management, teachers, timetable, class diaries |
| **TEACHER** | `teacher@school.local` | `Teacher@12345` | Attendance, marks, class assignments/diaries, questions |
| **STUDENT** | `student@school.local` | `Student@12345` | Portal view: Homework diary, timetable, marks, notices |

---

## 🆘 Kya Karein Agar Admin Ka Password Bhool Jayein? (Admin Password Recovery)

Agar Head Administrator apna password bhool jaye, toh reset karne ke **2 aasan tarike** hain:

### Method 1: Website Ke Login Page Se (Direct UI Reset)
1. Login page par **"Forgot Password?"** par click karein.
2. **"🔑 Head Admin Emergency"** tab select karein.
3. Apna Admin Email (`head@school.local`), **Master Recovery Key** (`NVP-HEAD-RECOVERY-KEY-2026`), aur naya password dalein.
4. **"Reset Admin Password"** dabayein — password turant update ho jayega aur aap login kar payenge!

### Method 2: Render Ke Web Shell Se (1 Command)
1. Render dashboard me apni service open karein → **Shell** tab par click karein.
2. Yeh command run karein:
   ```bash
   npm run reset-admin MyNewPassword2026
   ```
   Admin ka password turant change ho jayega!

---

## 🔗 Direct URL Shortcuts:
* **Admin / Head Portal:** `https://your-site.onrender.com/admin`
* **Login Page:** `https://your-site.onrender.com/login`
* **Responsive Mobile Access:** Mobile phones par bhi sidebar swipe drawer, touch buttons, aur responsive cards auto-fit ho jayenge.


