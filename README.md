# 🔴 Sindoor Daan
## India's Relationship Verification Platform

> "Is He/She Already Taken? Find Out Before It's Too Late!"

---

## 🚀 Setup Instructions (Step by Step)

### Prerequisites (Pehle ye install karo)

1. **Node.js** - https://nodejs.org (v18 ya usse upar)
2. **MongoDB** - https://www.mongodb.com/try/download/community (Community Edition free hai)
3. **VS Code** - Already hai tumhare paas

---

## 📁 Project Structure

```
sindoor-daan/
├── backend/          ← Node.js + Express API
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── uploads/      ← Auto-create hoga
└── frontend/         ← React App
    ├── src/
    └── public/
```

---

## ⚙️ Step 1: Face API Models Download (ZARURI HAI)

Face matching ke liye models download karne honge.

```bash
cd sindoor-daan/frontend/public
mkdir models
```

Phir browser mein ye links se files download karo aur `frontend/public/models/` folder mein rakho:

**Direct download link:** https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Download karo ye files:
- `ssd_mobilenetv1_model-weights_manifest.json`
- `ssd_mobilenetv1_model-shard1`
- `ssd_mobilenetv1_model-shard2`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

**Ya shortcut:** Ye command run karo (Node.js install hone ke baad):

```bash
cd sindoor-daan/frontend/public
mkdir -p models
cd models
# Manually download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
```

---

## ⚙️ Step 2: Backend Setup

```bash
# Terminal 1 mein:
cd sindoor-daan/backend
npm install
```

`.env` file already bani hui hai. Agar MongoDB kisi aur port pe hai to change karo.

```bash
# MongoDB start karo (agar locally hai):
# Windows: MongoDB Compass kholo ya services mein start karo
# Mac/Linux:
mongod

# Backend start karo:
npm run dev
```

Backend chalega: `http://localhost:5000`

---

## ⚙️ Step 3: Frontend Setup

```bash
# Terminal 2 mein (nayi terminal):
cd sindoor-daan/frontend
npm install
npm start
```

Frontend chalega: `http://localhost:3000`

---

## ✅ App Ready!

Browser mein kholo: **http://localhost:3000**

---

## 📱 Features

| Feature | Status |
|---------|--------|
| User Registration/Login | ✅ |
| Profile Photo Upload | ✅ |
| Face Descriptor Extraction | ✅ |
| Couple Photos Upload (max 10) | ✅ |
| Photo Search (Face AI) | ✅ |
| Name + City + Age Search | ✅ |
| Public Profile Page | ✅ |
| Partner Details | ✅ |
| Relationship Status | ✅ |
| Private/Public Profile Toggle | ✅ |

---

## 🌐 Deploy karna (Free mein live karna)

### Frontend → Vercel (Free)
```bash
cd frontend
npm install -g vercel
npm run build
vercel deploy
```

### Backend → Railway (Free)
1. https://railway.app pe account banao
2. New project → Deploy from GitHub
3. Backend folder select karo
4. Environment variables add karo (.env ka content)

### Database → MongoDB Atlas (Free)
1. https://cloud.mongodb.com pe account banao
2. Free cluster banao
3. Connection string copy karo
4. Backend `.env` mein `MONGODB_URI` update karo

---

## 💰 Future Monetization (Baad mein add karna)

- Account creation: ₹11 / ₹101 charge
- Monthly premium: verified badge, unlimited searches
- Razorpay/PayU integration ready karna hoga

---

## 🔧 Troubleshooting

**MongoDB connect nahi ho raha?**
→ MongoDB service start karo. Windows pe: Services → MongoDB → Start

**Face detection kaam nahi kar raha?**
→ `frontend/public/models/` folder mein sab files check karo

**Port already in use?**
→ `.env` mein PORT=5001 kar do

---

## 📞 Support

Koi problem ho to README carefully padho. Sab step by step hai! 🙏
