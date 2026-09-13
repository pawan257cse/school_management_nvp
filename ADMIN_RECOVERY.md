# 🔐 Head Administrator Password Recovery Guide

Yeh document Head Admin ke password reset ke emergency options ko explain karta hai.

---

## 📋 Quick Reference Table

| Situation | Action / Solution |
| :--- | :--- |
| **Case 1: Sirf password bhool gaye** | Secret `/admin` URL par jaakar **Master Recovery Key** daalein aur naya password set karein. |
| **Case 2: Password + Master Key dono bhool gaye** | Render ke **Shell** terminal me jakar `npm run reset-admin NayaPassword` run karein. |
| **Case 3: Apne computer (Local) par reset karna ho** | Project terminal me run karein: `npm run reset-admin NayaPassword` |

---

## 🛠️ Step-by-Step Instructions

### Method 1: Secret `/admin` Web Portal Se (10 Seconds)
1. Browser me apna secret URL open karein:
   - `https://your-frontend.vercel.app/admin` *(ya `/head`)*
   *(Public `/login` page par koi recovery button kisi ko nahi dikhega)*.
2. Form ke niche **"Emergency Recovery"** button par click karein.
3. Teen cheezein daalein:
   - **Head Admin Email:** `head@school.local`
   - **Master Recovery Key:** Jo aapke `backend/.env` ya Render Environment me likhi hai (`NVP-HEAD-RECOVERY-KEY-2026`)
   - **New Password:** Jo naya password aap rakhna chahte hain
4. **"Reset Admin Password"** dabayein — password turant update ho jayega!

---

### Method 2: Render Ke Web Shell Se (Bina Kisi Key Ke Direct Reset)
Agar aap Master Recovery Key bhi bhool jayein:
1. [Render.com](https://render.com) par apne account me login karein.
2. Apne **Backend Web Service** par click karein.
3. Left menu me **"Shell"** (terminal tab) open karein.
4. Yeh ek line command likhkar **Enter** dabayein:
   ```bash
   npm run reset-admin MeraNayaPassword123
   ```
   *(Yahan `MeraNayaPassword123` ki jagah apna naya password likhein)*.
5. Terminal turant print karega:
   ```text
   ====================================================
     HEAD ADMINISTRATOR PASSWORD RESET SUCCESSFULLY!   
     Login Email : head@school.local
     New Password: MeraNayaPassword123
   ====================================================
   ```
6. Ab aap turant apne naye password se login kar sakte hain!

---

### Method 3: Local Machine (Apne Computer) Par
Apne VS Code ya CMD terminal me project directory me run karein:
```bash
npm run reset-admin MeraNayaPassword123
```

---

## 🔒 Master Recovery Key Kahan Hoti Hai?
- Aapke computer par: `backend/.env` file ke andar (`ADMIN_RECOVERY_KEY=...`).
- Render par: Render Dashboard -> Backend Service -> **Environment** tab ke andar.
