# 📱 NVP School Android App (APK) — Complete Guide

Yeh folder (`/app`) aapke **NVP School Android Mobile App (APK)** ke liye alag se banaya gaya hai. Isse aapke main `frontend` aur `backend` code par 0% asar padta hai.

---

## 🌟 Live Auto-Update Feature (Kaise Kaam Karta Hai?)
Is APK ko **Live Cloud Sync** architecture ke sath banaya gaya hai:
* Aapne sirf **ek baar APK build karke teachers/students ko dena hai**.
* Jab bhi aap website ya backend par koi change (timetable, attendance, fees, marks, styling) karenge aur GitHub par push karenge:
* **Sabhi ke phone mein bina kisi naye APK ke turant naya update live chalne lagega!**

---

## 🛠️ Step 1: APK Kaise Banayein (2 Aasan Tarike)

### Tarika A: 1-Click Online PWABuilder (Bina kisi heavy software ke - Easiest)
1. Apni live website URL ko copy karein (e.g. `https://school-management-nvp.vercel.app`).
2. [PWABuilder.com](https://www.pwabuilder.com) par jayein aur URL paste karein.
3. **Android** box par **"Package for Android"** click karein.
4. App Name: `NVP School` aur Package ID: `com.nvpschool.app` check karke **Generate APK** par click karein.
5. Ready `.apk` file download karke sabhi ko distribute karein.

---

### Tarika B: Android Studio Se APK Generate Karna (Official Offline Build)

1. Is `app` directory mein dependencies install karein:
   ```bash
   cd app
   npm install
   ```
2. Android native project initialize karein:
   ```bash
   npx cap add android
   npx cap sync
   ```
3. Android Studio mein open karein:
   ```bash
   npx cap open android
   ```
4. Android Studio khulne ke baad top menu mein jayein:
   * **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
   * 1-2 minute mein `app-debug.apk` file ban kar ready ho jayegi!

---

## 🎨 Baad Mein Logo, Favicon Ya App Ka Naam Kaise Badlein?

1. **App Name Badalna**:
   - `app/capacitor.config.json` file kholein.
   - `"appName": "NVP School"` ki jagah apna naya naam likhein.
2. **Server URL Badalna**:
   - `app/capacitor.config.json` mein `"url": "https://aapka-naya-domain.vercel.app"` update karein.
3. **App Icon / Logo Badalna**:
   - `app/android/app/src/main/res/` ke andar `mipmap-*` folders mein apna naya logo image daal dein.
