<div align="center">

# 🩺 Nafs — Telemedicine Platform

**Online clinic platform connecting patients with doctors — bookings, sessions, medical notes and live chat, with dedicated portals for every role.**

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SignalR](https://img.shields.io/badge/SignalR-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 👥 Portals

| Role | Highlights |
|---|---|
| 🧑‍⚕️ **Patient** | Find doctors, book sessions, view session history, chat, notifications |
| 👨‍⚕️ **Doctor** | Schedule, patient history, rich-text session notes, documents |
| 🎧 **Customer Service** | Manage bookings and support patients |
| 🛠️ **Admin** | Users, doctors, content and analytics dashboards |

## ✨ Features

- 💬 **Real-time chat** and live updates with Microsoft SignalR
- 🔔 **Push notifications** via Firebase Cloud Messaging
- 📝 **Rich-text notes** (TipTap) and in-browser document preview (DOCX/PDF)
- 📊 Dashboards and charts with Recharts
- 🌍 Arabic / English with RTL support and an untranslated-string checker
- 🎨 Accessible UI built on Radix UI + Tailwind, with Framer Motion animations
- 🐳 Docker + Nginx image, built automatically with **GitHub Actions**

## 🧰 Tech Stack

| Layer | Tools |
|---|---|
| Core | React 18, Vite (SWC), React Router |
| UI | Tailwind CSS, Radix UI, MUI, Lucide icons, Framer Motion |
| Realtime | @microsoft/signalr, Firebase Messaging |
| Editor & docs | TipTap, docx-preview, react-doc-viewer |
| Data | Axios, date-fns, Recharts |
| DevOps | Docker, Nginx, GitHub Actions |

## 🚀 Getting Started

```bash
git clone https://github.com/mos1239487394823939839223/Nafs-Site.git
cd Nafs-Site
npm install
npm run dev            # http://localhost:5173
```

Create `.env.local`:

```env
VITE_BASE_URL=https://your-api.example.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

### 🐳 Docker

```bash
docker build -t nafs-site .
docker run -p 80:80 nafs-site
```

---

<div align="center">

Built by **[Mustafa Anwer Hamed](https://github.com/mos1239487394823939839223)**

</div>
